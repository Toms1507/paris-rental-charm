"""Repères indépendants : prix réellement facturés et occupation, d'après AirROI.

Inside Airbnb relève le prix *affiché* pour les prochaines dates libres de chaque annonce. Le prix
réellement payé par les voyageurs est en moyenne plus bas (remises, baisses de dernière minute).
AirROI publie gratuitement, pour chaque ville, le prix médian par nuit *réservée* et l'occupation
sur 12 mois glissants (pages publiques, robots.txt : « Allow: / »). On s'en sert pour :
  - corriger le niveau des prix Inside Airbnb (Paris, Lyon, Bordeaux) ;
  - caler le modèle national sur les grandes villes et la proche banlieue.

Montants convertis en euros au taux moyen de la BCE sur la période couverte. Une page lue une
fois par semaine et par ville ; en cas d'échec, la dernière valeur connue est conservée (cache).
"""

import datetime
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request

AIRROI = "https://www.airroi.com/airbnb-data/france/{path}"
ECB = ("https://data-api.ecb.europa.eu/service/data/EXR/M.USD.EUR.SP00.A"
       "?startPeriod={start}&endPeriod={end}&format=csvdata")
CACHE = "scripts/benchmarks-cache.json"
MAX_CACHE_AGE = 200  # jours : au-delà, une valeur qu'on n'arrive plus à relire est abandonnée
MIN_LISTINGS = 150   # en dessous, la médiane d'une ville est trop fragile pour servir de repère
MONTHS = {m: i for i, m in enumerate(
    ["January", "February", "March", "April", "May", "June", "July", "August", "September",
     "October", "November", "December"], 1)}

# (identifiant, nom de la commune, département, chemin AirROI). Grandes villes, marchés
# touristiques et proche banlieue parisienne.
MARKETS = [
    ("paris", "Paris", "75", "ile-de-france/paris"),
    ("lyon", "Lyon", "69", "auvergne-rhône-alpes/lyon"),
    ("bordeaux", "Bordeaux", "33", "nouvelle-aquitaine/bordeaux"),
    ("marseille", "Marseille", "13", "provence-alpes-côte-d'azur/marseille"),
    ("toulouse", "Toulouse", "31", "occitania/toulouse"),
    ("nice", "Nice", "06", "provence-alpes-côte-d'azur/nice"),
    ("nantes", "Nantes", "44", "pays-de-la-loire/nantes"),
    ("montpellier", "Montpellier", "34", "occitania/montpellier"),
    ("strasbourg", "Strasbourg", "67", "grand-est/strasbourg"),
    ("lille", "Lille", "59", "hauts-de-france/lille"),
    ("rennes", "Rennes", "35", "brittany/rennes"),
    ("reims", "Reims", "51", "grand-est/reims"),
    ("toulon", "Toulon", "83", "provence-alpes-côte-d'azur/toulon"),
    ("grenoble", "Grenoble", "38", "auvergne-rhône-alpes/grenoble"),
    ("dijon", "Dijon", "21", "bourgogne-–-franche-comté/dijon"),
    ("angers", "Angers", "49", "pays-de-la-loire/angers"),
    ("nimes", "Nîmes", "30", "occitania/nimes"),
    ("aix-en-provence", "Aix-en-Provence", "13", "provence-alpes-côte-d'azur/aix-en-provence"),
    ("saint-etienne", "Saint-Étienne", "42", "auvergne-rhône-alpes/saint-étienne"),
    ("clermont-ferrand", "Clermont-Ferrand", "63", "auvergne-rhône-alpes/clermont-ferrand"),
    ("le-havre", "Le Havre", "76", "normandy/le-havre"),
    ("brest", "Brest", "29", "brittany/brest"),
    ("tours", "Tours", "37", "centre-val-de-loire/tours"),
    ("orleans", "Orléans", "45", "centre-val-de-loire/orléans"),
    ("rouen", "Rouen", "76", "normandy/rouen"),
    ("caen", "Caen", "14", "normandy/caen"),
    ("metz", "Metz", "57", "grand-est/metz"),
    ("nancy", "Nancy", "54", "grand-est/nancy"),
    ("mulhouse", "Mulhouse", "68", "grand-est/mulhouse"),
    ("colmar", "Colmar", "68", "grand-est/colmar"),
    ("amiens", "Amiens", "80", "hauts-de-france/amiens"),
    ("limoges", "Limoges", "87", "nouvelle-aquitaine/limoges"),
    ("perpignan", "Perpignan", "66", "occitania/perpignan"),
    ("besancon", "Besançon", "25", "bourgogne-–-franche-comté/besançon"),
    ("le-mans", "Le Mans", "72", "pays-de-la-loire/le-mans"),
    ("poitiers", "Poitiers", "86", "nouvelle-aquitaine/poitiers"),
    ("pau", "Pau", "64", "nouvelle-aquitaine/pau"),
    ("avignon", "Avignon", "84", "provence-alpes-côte-d'azur/avignon"),
    ("annecy", "Annecy", "74", "auvergne-rhône-alpes/annecy"),
    ("la-rochelle", "La Rochelle", "17", "nouvelle-aquitaine/la-rochelle"),
    ("saint-malo", "Saint-Malo", "35", "brittany/saint-malo"),
    ("cannes", "Cannes", "06", "provence-alpes-côte-d'azur/cannes"),
    ("antibes", "Antibes", "06", "provence-alpes-côte-d'azur/antibes"),
    ("menton", "Menton", "06", "provence-alpes-côte-d'azur/menton"),
    ("ajaccio", "Ajaccio", "2A", "corsica/ajaccio"),
    ("bastia", "Bastia", "2B", "corsica/bastia"),
    ("arcachon", "Arcachon", "33", "nouvelle-aquitaine/arcachon"),
    ("versailles", "Versailles", "78", "ile-de-france/versailles"),
    ("boulogne-billancourt", "Boulogne-Billancourt", "92", "ile-de-france/boulogne-billancourt"),
    ("neuilly-sur-seine", "Neuilly-sur-Seine", "92", "ile-de-france/neuilly-sur-seine"),
    ("levallois-perret", "Levallois-Perret", "92", "ile-de-france/levallois-perret"),
    ("issy-les-moulineaux", "Issy-les-Moulineaux", "92", "ile-de-france/issy-les-moulineaux"),
    ("clichy", "Clichy", "92", "ile-de-france/clichy"),
    ("courbevoie", "Courbevoie", "92", "ile-de-france/courbevoie"),
    ("puteaux", "Puteaux", "92", "ile-de-france/puteaux"),
    ("montrouge", "Montrouge", "92", "ile-de-france/montrouge"),
    ("montreuil", "Montreuil", "93", "ile-de-france/montreuil"),
    ("saint-denis", "Saint-Denis", "93", "ile-de-france/saint-denis"),
    ("saint-ouen-sur-seine", "Saint-Ouen-sur-Seine", "93", "ile-de-france/saint-ouen-sur-seine"),
    ("pantin", "Pantin", "93", "ile-de-france/pantin"),
    ("vincennes", "Vincennes", "94", "ile-de-france/vincennes"),
    ("ivry-sur-seine", "Ivry-sur-Seine", "94", "ile-de-france/ivry-sur-seine"),
]


def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (spinelleconciergerie.fr)"})
    return urllib.request.urlopen(req, timeout=60).read().decode("utf-8")


def _number(s):
    return float(s.replace(",", ""))


def _astro(value):
    """Décode la sérialisation des propriétés Astro ([0, valeur], [1, liste])."""
    if isinstance(value, list) and len(value) == 2 and isinstance(value[0], int):
        kind, inner = value
        if kind == 1:
            return [_astro(v) for v in inner]
        return _astro(inner) if isinstance(inner, (dict, list)) and kind == 0 else inner
    if isinstance(value, dict):
        return {k: _astro(v) for k, v in value.items()}
    return value


def monthly(page, last_month):
    """Saisonnalité de la ville : occupation et prix moyens mois par mois, rapportés à leur
    moyenne annuelle. None si les séries mensuelles sont absentes ou incomplètes.
    Le dernier mois de la période est encore incomplet chez AirROI (occupation sous-estimée) :
    s'il est plus bas que ses deux voisins en moyenne, on retient cette moyenne."""
    series = {}
    for raw in re.findall(r'props="([^"]*)"', page):
        try:
            data = _astro(json.loads(html.unescape(raw))).get("data")
        except (ValueError, AttributeError):
            continue
        if not isinstance(data, dict) or not isinstance(data.get("months"), list):
            continue
        for key, name in (("occupancy_rate_avg", "occupancy"), ("daily_rate_avg", "price")):
            values = {MONTHS.get(m.get("month")): m.get(key) for m in data["months"]}
            if all(isinstance(values.get(i), (int, float)) and values[i] > 0 for i in range(1, 13)):
                series[name] = values
    if set(series) != {"occupancy", "price"}:
        return None
    occ = series["occupancy"]
    around = (occ[last_month % 12 + 1] + occ[(last_month - 2) % 12 + 1]) / 2
    occ[last_month] = max(occ[last_month], around)
    mean = {k: sum(v.values()) / 12 for k, v in series.items()}
    return {str(i): {k: round(series[k][i] / mean[k], 3) for k in series} for i in range(1, 13)}


def parse(page):
    """Extrait les chiffres clés d'une page ville AirROI (montants en dollars)."""
    t = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", page)))

    def find(pattern):
        m = re.search(pattern, t)
        return m.groups() if m else None

    adr = find(r"\(Median\) charge around \$([\d,.]+) per night")
    occ = find(r"\(Median\) have an occupancy rate around (\d+)\s?%")
    top = find(r"\(Top 25%\) maintain (\d+)\s?% or higher occupancy")
    listings = find(r"([\d,]{3,}) active listings")
    period = next((m.groups() for m in re.finditer(r"(\w+) (\d{4}) (?:–|-|to) (\w+) (\d{4})", t)
                   if m.group(1) in MONTHS and m.group(3) in MONTHS), None)
    if not (adr and occ and top and listings and period):
        return None
    return {
        "adrUsd": _number(adr[0]),
        "occupancy": int(occ[0]) / 100,
        "occupancyTop": int(top[0]) / 100,
        "listings": int(_number(listings[0])),
        "start": f"{period[1]}-{MONTHS[period[0]]:02d}",
        "end": f"{period[3]}-{MONTHS[period[2]]:02d}",
        "seasonality": monthly(page, MONTHS[period[2]]),
    }


_rates = {}


def usd_per_eur(start, end):
    """Taux moyen BCE (dollars pour 1 euro) sur la période."""
    if (start, end) not in _rates:
        rows = _get(ECB.format(start=start, end=end)).splitlines()
        head = rows[0].split(",")
        i = head.index("OBS_VALUE")
        values = [float(r.split(",")[i]) for r in rows[1:] if r.strip()]
        _rates[(start, end)] = sum(values) / len(values)
    return _rates[(start, end)]


def load():
    """{identifiant: repère} ; chaque repère : nom, département, prix médian en euros, occupations."""
    try:
        with open(CACHE, encoding="utf-8") as fh:
            cache = json.load(fh)
    except (OSError, ValueError):
        cache = {}
    today = datetime.date.today()
    out, fresh = {}, 0
    for slug, name, dept, path in MARKETS:
        entry = None
        try:
            found = parse(_get(AIRROI.format(path=urllib.parse.quote(path))))
            if found:
                rate = usd_per_eur(found["start"], found["end"])
                entry = {
                    "name": name, "dept": dept,
                    "adr": round(found["adrUsd"] / rate, 1),
                    "occupancy": found["occupancy"], "occupancyTop": found["occupancyTop"],
                    "listings": found["listings"], "period": [found["start"], found["end"]],
                    "seasonality": found["seasonality"],
                    "usdPerEur": round(rate, 4), "checked": today.isoformat(),
                    "url": AIRROI.format(path=path),
                }
                fresh += 1
        except Exception as e:  # noqa: BLE001
            print(f"  AirROI {name} : {e}", file=sys.stderr)
        if entry is None and slug in cache:
            age = (today - datetime.date.fromisoformat(cache[slug]["checked"])).days
            if age <= MAX_CACHE_AGE:
                entry = cache[slug]
        if entry and entry["listings"] >= MIN_LISTINGS:
            out[slug] = entry
        time.sleep(1)
    with open(CACHE, "w", encoding="utf-8") as fh:
        json.dump({**cache, **out}, fh, ensure_ascii=False, indent=1, sort_keys=True)
    print(f"  AirROI : {len(out)} villes de repère ({fresh} relues aujourd'hui)", file=sys.stderr)
    return out


if __name__ == "__main__":
    for k, v in load().items():
        print(k, v["adr"], "€", v["occupancy"], v["occupancyTop"], v["listings"], v["period"])
