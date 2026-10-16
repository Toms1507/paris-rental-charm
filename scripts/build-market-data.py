"""Construit src/content/market-paris.ts à partir des relevés mensuels Inside Airbnb (licence CC BY 4.0).

Entièrement automatique : le script retrouve lui-même les relevés publiés, télécharge les
12 derniers mois (saisonnalité et prix sur l'année) ainsi que celui de l'année précédente
(tendance), puis écrit le fichier de données du simulateur.

Usage : python3 scripts/build-market-data.py
Exécuté chaque mois par .github/workflows/update-market-data.yml.
"""

import concurrent.futures
import csv
import datetime
import gzip
import io
import json
import re
import statistics
import sys
import time
import urllib.parse
import urllib.error
import urllib.request
from collections import defaultdict

BASE = "https://data.insideairbnb.com/france/ile-de-france/paris/{date}/data/listings.csv.gz"
OUTPUT = "src/content/market-paris.ts"

ARRONDISSEMENTS = {
    "Louvre": 1, "Bourse": 2, "Temple": 3, "Hôtel-de-Ville": 4, "Panthéon": 5,
    "Luxembourg": 6, "Palais-Bourbon": 7, "Élysée": 8, "Opéra": 9, "Entrepôt": 10,
    "Popincourt": 11, "Reuilly": 12, "Gobelins": 13, "Observatoire": 14, "Vaugirard": 15,
    "Passy": 16, "Batignolles-Monceau": 17, "Buttes-Montmartre": 18,
    "Buttes-Chaumont": 19, "Ménilmontant": 20,
}
MIN_SAMPLE = 15  # en dessous, médiane parisienne corrigée de l'indice de prix de l'arrondissement
MAX_GUESTS = 10
# Équipements du simulateur et mots-clés correspondants dans les annonces Airbnb.
AMENITY_KEYWORDS = {
    "clim": ["air conditioning", "central air"],
    "ascenseur": ["elevator"],
    "balcon": ["patio or balcony", "balcony", "terrace"],
    "parking": ["parking"],
    "jardin": ["backyard", "garden"],
    "vue": ["view"],
}
# Plafonds prudents : on ne retient que les effets positifs, et jamais au-delà de ces valeurs.
MAX_AMENITY_OCC = 1.08
# Nombre minimal de logements comparables pour retenir un effet (sinon : aucun ajustement).
MIN_EFFECT_SAMPLE = 100
MAX_AMENITY_PRICE = 1.12
# Autres villes suivies par Inside Airbnb : (identifiant, nom affiché, chemin dans les URL).
OTHER_CITIES = [
    ("lyon", "Lyon", "auvergne-rhone-alpes/lyon"),
    ("bordeaux", "Bordeaux", "nouvelle-aquitaine/bordeaux"),
    ("pays-basque", "Pays basque", "pyrénées-atlantiques/pays-basque"),
]


# Quartier Inside Airbnb -> code commune DVF, pour calibrer le modèle national.
def _lyon(area, by_name):
    m = re.match(r"(\d+)", area)
    return str(69380 + int(m.group(1))) if m else None


def _by_name(dept, fallback=None):
    def code(area, by_name):
        import national_model
        found = by_name.get((national_model.norm(area), dept))
        return found[0] if found else fallback
    return code


AREA_CODES = {
    "lyon": _lyon,
    "bordeaux": _by_name("33", fallback="33063"),  # quartiers de Bordeaux -> commune de Bordeaux
    "pays-basque": _by_name("64"),
}
COMMUNES_OUTPUT = "public/data/communes-estimation.json"
# Séjours d'un mois minimum (bail mobilité, tarif mensuel remisé) : autre produit que la location
# courte durée, exclus des statistiques.
MONTHLY_STAY = 28
# Saisonnalité des prix : seuls les devis pour un séjour proche (≤ 45 jours) sont rattachés au mois
# du séjour ; les devis lointains portent des tarifs de base, avant les baisses de dernière minute.
MAX_QUOTE_LEAD = 45
# Prix de toutes les annonces actives (tous types, au moins un avis sur 12 mois), par relevé :
# même périmètre que les repères AirROI, pour mesurer l'écart prix affiché / prix facturé.
MARKET_PRICES = {}


# --- Découverte des relevés -------------------------------------------------------------------

def exists(date, url=BASE):
    """Le relevé existe-t-il ? Trois essais : un délai réseau ne doit pas faire manquer un relevé."""
    for _ in range(3):
        try:
            req = urllib.request.Request(url.format(date=date), method="HEAD")
            return urllib.request.urlopen(req, timeout=30).status == 200
        except urllib.error.HTTPError as e:
            if e.code in (403, 404):
                return False
        except Exception:
            pass
    return False


def find_snapshots(days_back=430, url=BASE):
    today = datetime.date.today()
    dates = [(today - datetime.timedelta(days=i)).isoformat() for i in range(days_back)]
    with concurrent.futures.ThreadPoolExecutor(32) as pool:
        found = [d for d, ok in zip(dates, pool.map(lambda d: exists(d, url), dates)) if ok]
    return sorted(found)


# --- Lecture d'un relevé ----------------------------------------------------------------------

def download(url, attempts=3):
    """Téléchargement avec nouvel essai en cas de coupure réseau."""
    for i in range(attempts):
        try:
            return urllib.request.urlopen(url, timeout=300).read()
        except (OSError, urllib.error.URLError):
            if i == attempts - 1:
                raise
            time.sleep(10 * (i + 1))


def parse_baths(row):
    """Nombre de salles de bain : champ numérique, sinon texte (« 1.5 baths », « Half-bath »)."""
    if row.get("bathrooms"):
        return float(row["bathrooms"])
    text = (row.get("bathrooms_text") or "").lower()
    m = re.match(r"([0-9]+(?:\.[0-9]+)?)", text)
    if m:
        return float(m.group(1))
    return 0.5 if "half" in text else None


def bucket(row):
    """0 = studio, 1 = une chambre, 2 = deux chambres, 3 = trois chambres ou plus."""
    if not row["bedrooms"]:
        return 0
    n = int(float(row["bedrooms"]))
    if n == 1 and "studio" in (row["name"] + " " + row["description"]).lower():
        return 0
    return min(n, 3)


def load(date, url=BASE, paris=True):
    """Logements entiers actifs (au moins 3 avis sur 12 mois) loués à la nuit. Le prix vaut None
    s'il manque (certains relevés sont publiés sans prix : ils servent alors au remplissage).
    « month » : mois du séjour sur lequel porte le prix relevé (devis Airbnb), sinon du relevé ;
    None pour un devis lointain (écarté de la saisonnalité)."""
    scraped = datetime.date.fromisoformat(date)
    raw = download(url.format(date=date))
    text = io.TextIOWrapper(gzip.GzipFile(fileobj=io.BytesIO(raw)), encoding="utf-8")
    rows, market = [], []
    for row in csv.DictReader(text):
        price = float(row["price"].replace("$", "").replace(",", "")) if row["price"] else None
        if price is not None and int(row["number_of_reviews_ltm"] or 0) >= 1 and 15 <= price <= 5000:
            market.append(price)
        if row["room_type"] != "Entire home/apt":
            continue
        if int(row["number_of_reviews_ltm"] or 0) < 3:
            continue
        if int(float(row.get("minimum_nights") or 1)) >= MONTHLY_STAY:
            continue
        if price is not None and not 30 <= price <= 1500:
            continue
        arr = ARRONDISSEMENTS.get(row["neighbourhood_cleansed"]) if paris else 0
        if paris and not arr:
            continue
        try:
            listed = [a.lower() for a in json.loads(row.get("amenities") or "[]")]
        except ValueError:
            listed = []
        kind = row.get("property_type", "").lower()
        try:
            stay = datetime.date.fromisoformat(row.get("price_quote_checkin_date") or "")
        except ValueError:
            stay = None
        rows.append({
            "kind": "loft" if "loft" in kind
            else "maison" if any(w in kind for w in ("home", "house", "townhouse", "villa", "cottage"))
            else "appartement",
            "baths": parse_baths(row),
            "rooms": int(float(row["bedrooms"])) if row.get("bedrooms") else 0,
            "amenities": {k for k, words in AMENITY_KEYWORDS.items()
                          if any(w in a for a in listed for w in words)},
            "arr": arr,
            "area": row["neighbourhood_cleansed"],
            "lat": float(row["latitude"]),
            "lon": float(row["longitude"]),
            "bucket": bucket(row),
            "guests": min(int(row["accommodates"] or 2), MAX_GUESTS),
            "price": price,
            "month": scraped.month if stay is None
            else stay.month if (stay - scraped).days <= MAX_QUOTE_LEAD else None,
            "occ": int(row.get("estimated_occupancy_l365d") or 0) / 365,
            "booked30": 1 - int(row["availability_30"] or 0) / 30,
        })
    MARKET_PRICES[(url, date)] = market
    priced = sum(1 for r in rows if r["price"] is not None)
    print(f"  {date} : {len(rows)} logements actifs, dont {priced} avec prix", file=sys.stderr)
    return rows


# --- Statistiques -----------------------------------------------------------------------------

def realization(bench, url, dates, label):
    """Rapport prix réellement facturé (AirROI) / prix affiché (Inside Airbnb), même périmètre :
    toutes les annonces actives, médiane sur 12 mois. None si le repère manque ou est aberrant."""
    prices = [p for d in dates for p in MARKET_PRICES.get((url, d), [])]
    if not bench or len(prices) < 500:
        return None, None
    listed = statistics.median(prices)
    factor = bench["adr"] / listed
    print(f"  {label} : prix affiché médian {listed:.0f} €, facturé {bench['adr']:.0f} € (AirROI) "
          f"-> facteur {factor:.3f}", file=sys.stderr)
    if not 0.6 <= factor <= 1.4:
        print(f"  {label} : facteur hors limites, ignoré", file=sys.stderr)
        return None, listed
    return factor, listed


def rescale(row_lists, factor):
    """Applique le facteur une seule fois à chaque annonce (les listes partagent des annonces)."""
    seen = set()
    for rows in row_lists:
        for row in rows:
            if id(row) not in seen and row["price"] is not None:
                seen.add(id(row))
                row["price"] *= factor


def by_stay_month(rows, ref, minimum):
    """Prix relatif médian par mois de séjour (mois sans assez d'annonces : interpolés)."""
    groups = defaultdict(list)
    for row in rows:
        if ref[row["bucket"]] and row["month"]:
            groups[row["month"]].append(row["price"] / ref[row["bucket"]])
    return {m: statistics.median(v) for m, v in groups.items() if len(v) >= minimum}


def quantile(values, q):
    values = sorted(values)
    return values[min(len(values) - 1, int(len(values) * q))]


def validate(out):
    """Refuse d'écrire des données incohérentes : le site garde alors les précédentes."""
    problems = []
    if out["listings"] < 5000:
        problems.append(f"trop peu d'annonces ({out['listings']})")
    if len(out["arrondissements"]) != 20:
        problems.append("arrondissements manquants")
    prices = [out["paris"][b]["price"] for b in range(4)]
    if prices != sorted(prices) or not 40 <= prices[0] <= 600:
        problems.append(f"prix médians incohérents {prices}")
    for arr, a in out["arrondissements"].items():
        for b, cell in a["buckets"].items():
            if not 30 <= cell["price"] <= 2000 or not 0 < cell["occupancyTop"] <= 1:
                problems.append(f"arrondissement {arr}, tranche {b} : {cell}")
    for m, season in out["seasonality"].items():
        if not 0.5 <= season["price"] <= 1.6 or not 0.5 <= season["occupancy"] <= 1.6:
            problems.append(f"saisonnalité du mois {m} : {season}")
    if problems:
        sys.exit("Données refusées :\n- " + "\n- ".join(problems))


def main():
    snapshots = find_snapshots()
    if not snapshots:
        sys.exit("Aucun relevé Inside Airbnb trouvé.")
    latest_d = datetime.date.fromisoformat(snapshots[-1])

    # Un relevé par mois sur les 12 derniers mois (le plus récent de chaque mois).
    by_month = {}
    for d in snapshots:
        dd = datetime.date.fromisoformat(d)
        if (latest_d - dd).days < 360:
            by_month[(dd.year, dd.month)] = d
    year = sorted(by_month.values())
    with concurrent.futures.ThreadPoolExecutor(4) as pool:
        all_data = dict(zip(year, pool.map(load, year)))
    # Relevés publiés sans prix : écartés pour les prix (interpolés), conservés pour le remplissage.
    data = {d: [r for r in rows if r["price"] is not None] for d, rows in all_data.items()}
    data = {d: rows for d, rows in data.items() if rows}
    if not data:
        sys.exit("Aucun relevé exploitable sur les 12 derniers mois.")
    latest = max(data)
    current = data[latest]

    # Relevé valide de l'année précédente le plus proche de la même date, pour la tendance.
    target = datetime.date.fromisoformat(latest) - datetime.timedelta(days=365)
    candidates = sorted(
        (d for d in snapshots if abs((datetime.date.fromisoformat(d) - target).days) <= 20),
        key=lambda d: abs((datetime.date.fromisoformat(d) - target).days),
    )
    previous, prev_rows = None, []
    for d in candidates:
        rows = data.get(d) or [r for r in load(d) if r["price"] is not None]
        if rows:
            previous, prev_rows = d, rows
            break
    print(f"Prix : {sorted(data)} ; remplissage : {year} ; tendance vs {previous}", file=sys.stderr)

    # 0) Prix affichés -> prix réellement facturés (repère AirROI, voir scripts/benchmarks.py).
    import benchmarks
    bench = benchmarks.load()
    paris_factor, paris_listed = realization(bench.get("paris"), BASE, list(data), "Paris")
    rescale(list(data.values()) + [prev_rows], paris_factor or 1)
    correction = {}
    if paris_factor:
        correction["paris"] = {"factor": round(paris_factor, 3), "listed": round(paris_listed),
                               "billed": bench["paris"]["adr"], "source": "airroi"}

    # 1) Prix de base sur l'année : médiane de tous les relevés des 12 derniers mois.
    pooled = [r for rows in data.values() for r in rows]
    paris_price = {b: statistics.median([r["price"] for r in pooled if r["bucket"] == b]) for b in range(4)}

    # 2) Occupation annuelle : dernier relevé (nuits réservées estimées sur les 365 derniers jours).
    def occ_stats(rows):
        occ = [r["occ"] for r in rows]
        return round(statistics.median(occ), 3), round(quantile(occ, 0.75), 3)

    paris = {}
    for b in range(4):
        occ, top = occ_stats([r for r in current if r["bucket"] == b])
        n = sum(1 for r in current if r["bucket"] == b)
        paris[b] = {"price": round(paris_price[b]), "occupancy": occ, "occupancyTop": top, "sample": n}

    arrondissements = {}
    for arr in range(1, 21):
        mine = [r for r in pooled if r["arr"] == arr]
        index = statistics.median([r["price"] / paris_price[r["bucket"]] for r in mine])
        buckets = {}
        for b in range(4):
            prices = [r["price"] for r in mine if r["bucket"] == b]
            now = [r for r in current if r["arr"] == arr and r["bucket"] == b]
            if len(now) >= MIN_SAMPLE:
                occ, top = occ_stats(now)
                buckets[b] = {"price": round(statistics.median(prices)), "occupancy": occ,
                              "occupancyTop": top, "sample": len(now)}
            else:
                buckets[b] = {**paris[b], "price": round(paris_price[b] * index),
                              "sample": len(now), "estimated": True}
        trend = None
        if prev_rows:
            before = [r["price"] / paris_price[r["bucket"]] for r in prev_rows if r["arr"] == arr]
            after = [r["price"] / paris_price[r["bucket"]] for r in current if r["arr"] == arr]
            if len(before) >= 50 and len(after) >= 50:
                trend = round(statistics.median(after) / statistics.median(before) - 1, 3)
        # Secteurs : position de chaque annonce par rapport au centre de l'arrondissement.
        lat0 = statistics.median(r["lat"] for r in mine)
        lon0 = statistics.median(r["lon"] for r in mine)
        arr_ratio = statistics.median([r["price"] / paris_price[r["bucket"]] for r in mine])

        def sector(r):
            dy, dx = r["lat"] - lat0, (r["lon"] - lon0) * 0.66  # 1° de longitude ≈ 0,66° de latitude à Paris
            if abs(dy) >= abs(dx):
                return "nord" if dy > 0 else "sud"
            return "est" if dx > 0 else "ouest"

        now_arr = [r for r in current if r["arr"] == arr]
        arr_top = quantile([r["occ"] for r in now_arr], 0.75) or 0.01
        sectors = {}
        for name in ("nord", "sud", "est", "ouest"):
            ratios = [r["price"] / paris_price[r["bucket"]] for r in mine if sector(r) == name]
            occ = [r["occ"] for r in now_arr if sector(r) == name]
            sectors[name] = {
                "index": round(statistics.median(ratios) / arr_ratio, 3) if len(ratios) >= 40 else 1,
                # Occupation du secteur (haut de fourchette) rapportée à celle de l'arrondissement.
                "occupancyIndex": round(min(1.1, max(0.9, quantile(occ, 0.75) / arr_top)), 3)
                if len(occ) >= 40 else 1,
                "sample": len(ratios),
            }
        arrondissements[arr] = {"priceIndex": round(index, 3), "priceTrend": trend,
                                "sectors": sectors, "buckets": buckets}

    # 3) Effet de la capacité d'accueil, à taille égale : prix médian par nombre de voyageurs,
    #    rapporté à la médiane de la tranche.
    capacity = {}
    for b in range(4):
        rows = [r for r in pooled if r["bucket"] == b]
        ratios = {}
        for g in range(1, MAX_GUESTS + 1):
            prices = [r["price"] for r in rows if r["guests"] == g]
            if len(prices) >= 200:
                ratios[g] = round(statistics.median(prices) / paris_price[b], 3)
        capacity[b] = ratios

    # 3 bis) Effet de chaque équipement sur l'occupation et le prix, mesuré à arrondissement et
    #    taille égaux (médiane des écarts par case), puis borné : effets positifs uniquement.
    cells = defaultdict(list)
    for r in current:
        cells[(r["arr"], r["bucket"])].append(r)
    amenity_effects = {}
    for key in AMENITY_KEYWORDS:
        occ_r, price_r = [], []
        for rows in cells.values():
            yes = [r for r in rows if key in r["amenities"]]
            no = [r for r in rows if key not in r["amenities"]]
            if len(yes) >= 15 and len(no) >= 15:
                occ_r.append(statistics.median(r["occ"] for r in yes)
                             / max(0.01, statistics.median(r["occ"] for r in no)))
                price_r.append(statistics.median(r["price"] for r in yes)
                               / statistics.median(r["price"] for r in no))
        amenity_effects[key] = {
            "occupancy": round(min(MAX_AMENITY_OCC, max(1, statistics.median(occ_r))), 3) if occ_r else 1,
            "price": round(min(MAX_AMENITY_PRICE, max(1, statistics.median(price_r))), 3) if price_r else 1,
        }

    # 3 ter) Type de bien, salles de bain et nombre de chambres au-delà de 3, mesurés de la même
    #    façon (prix et occupation médians, à arrondissement et taille égaux).
    def controlled(select_yes, select_no, groups):
        occ_r, price_r, n = [], [], 0
        for rows in groups:
            yes = [r for r in rows if select_yes(r)]
            no = [r for r in rows if select_no(r)]
            if len(yes) >= 10 and len(no) >= 10:
                n += len(yes)
                occ_r.append(statistics.median(r["occ"] for r in yes)
                             / max(0.01, statistics.median(r["occ"] for r in no)))
                price_r.append(statistics.median(r["price"] for r in yes)
                               / statistics.median(r["price"] for r in no))
        if not price_r or n < MIN_EFFECT_SAMPLE:
            return {"price": 1, "occupancy": 1, "sample": n}
        return {"price": round(statistics.median(price_r), 3),
                "occupancy": round(min(1.1, max(0.9, statistics.median(occ_r))), 3), "sample": n}

    groups = list(cells.values())
    property_kinds = {
        kind: controlled(lambda r, k=kind: r["kind"] == k, lambda r: r["kind"] == "appartement", groups)
        for kind in ("loft", "maison")
    }
    # Salles de bain : comparées aussi à capacité d'accueil égale, pour ne pas compter deux fois
    # l'effet du nombre de voyageurs (déjà mesuré à part).
    by_guests = defaultdict(list)
    for r in current:
        by_guests[(r["arr"], r["bucket"], r["guests"])].append(r)
    bathrooms = {
        "2": controlled(lambda r: r["baths"] is not None and r["baths"] >= 2,
                        lambda r: r["baths"] is not None and r["baths"] < 2, list(by_guests.values())),
    }
    # Au-delà de 3 chambres : comparaison aux 3 chambres du même arrondissement.
    big = defaultdict(list)
    for r in current:
        if r["rooms"] >= 3:
            big[r["arr"]].append(r)
    extra_bedrooms = {
        "4": controlled(lambda r: r["rooms"] == 4, lambda r: r["rooms"] == 3, list(big.values())),
        "5": controlled(lambda r: r["rooms"] >= 5, lambda r: r["rooms"] == 3, list(big.values())),
    }

    # 4) Saisonnalité mois par mois : prix médian (relevés avec prix) et part du calendrier
    #    réservée à 30 jours (tous les relevés).
    price_by_month = by_stay_month(pooled, paris_price, 200)
    occ_by_month = {
        datetime.date.fromisoformat(d).month: statistics.mean(r["booked30"] for r in rows)
        for d, rows in all_data.items() if rows
    }

    def fill(values):
        """Complète les mois manquants par interpolation linéaire entre les mois connus (cyclique)."""
        known = sorted(values)
        out = dict(values)
        for m in range(1, 13):
            if m in out:
                continue
            before = max((k for k in known if k < m), default=known[-1])
            after = min((k for k in known if k > m), default=known[0])
            gap = (after - before) % 12 or 12
            t = ((m - before) % 12) / gap
            out[m] = values[before] + (values[after] - values[before]) * t
        return out

    price_by_month, occ_by_month = fill(price_by_month), fill(occ_by_month)
    mean_p = statistics.mean(price_by_month.values())
    mean_o = statistics.mean(occ_by_month.values())
    seasonality = {m: {"price": round(price_by_month[m] / mean_p, 3),
                       "occupancy": round(occ_by_month[m] / mean_o, 3)} for m in range(1, 13)}

    # 5) Tendance parisienne sur 12 mois.
    paris_trend = None
    if prev_rows:
        def med_ratio(rows):
            return statistics.median([r["price"] / paris_price[r["bucket"]] for r in rows])
        paris_trend = {
            "price": round(med_ratio(current) / med_ratio(prev_rows) - 1, 3),
            "occupancy": round(statistics.median(r["occ"] for r in current)
                               - statistics.median(r["occ"] for r in prev_rows), 3),
        }

    # 6) Autres villes françaises publiées par Inside Airbnb, pour les biens hors zone : même
    #    méthode que Paris (12 derniers relevés, saisonnalité propre à chaque ville).
    cities = {}
    calib = {}  # annonces des villes de référence, pour le modèle national
    for slug, label, path in OTHER_CITIES:
        url = "https://data.insideairbnb.com/france/" + urllib.parse.quote(path) + "/{date}/data/listings.csv.gz"
        found = find_snapshots(url=url)
        if not found:
            continue
        last = datetime.date.fromisoformat(found[-1])
        months = {}
        for d in found:
            dd = datetime.date.fromisoformat(d)
            if (last - dd).days < 360:
                months[(dd.year, dd.month)] = d
        with concurrent.futures.ThreadPoolExecutor(4) as pool:
            city_all = dict(zip(sorted(months.values()),
                                pool.map(lambda d: load(d, url, paris=False), sorted(months.values()))))
        city_priced = {d: [r for r in rows if r["price"] is not None] for d, rows in city_all.items()}
        city_priced = {d: rows for d, rows in city_priced.items() if len(rows) >= 200}
        if not city_priced:
            continue
        city_factor, city_listed = realization(bench.get(slug), url, list(city_priced), label)
        if city_factor:
            correction[slug] = {"factor": round(city_factor, 3), "listed": round(city_listed),
                                "billed": bench[slug]["adr"], "source": "airroi"}
        else:
            # Pas de repère pour cette zone : écart médian constaté dans les autres villes.
            city_factor = statistics.median([c["factor"] for c in correction.values()] or [1])
            correction[slug] = {"factor": round(city_factor, 3), "source": "median"}
        rescale(city_priced.values(), city_factor)
        city_latest = max(city_priced)
        rows_now = city_priced[city_latest]
        city_pool = [r for rows in city_priced.values() for r in rows]
        city_price = {b: statistics.median([r["price"] for r in city_pool if r["bucket"] == b] or [0])
                      for b in range(4)}
        buckets = {}
        for b in range(4):
            mine = [r for r in rows_now if r["bucket"] == b]
            if len(mine) >= MIN_SAMPLE and city_price[b]:
                occ, top = occ_stats(mine)
                buckets[b] = {"price": round(city_price[b]), "occupancy": occ,
                              "occupancyTop": top, "sample": len(mine)}
            else:
                buckets[b] = None
        if any(v is None for v in buckets.values()):
            # Tranche trop rare dans cette ville : pas d'estimation automatique pour cette taille.
            buckets = {b: v for b, v in buckets.items() if v is not None}
        c_price = by_stay_month(city_pool, city_price, 50)
        c_occ = {datetime.date.fromisoformat(d).month: statistics.mean(r["booked30"] for r in rows)
                 for d, rows in city_all.items() if rows}
        c_price, c_occ = fill(c_price), fill(c_occ)
        mp, mo = statistics.mean(c_price.values()), statistics.mean(c_occ.values())
        calib[slug] = {"rows": city_pool, "now": rows_now, "area_code": AREA_CODES[slug]}
        cities[slug] = {
            "label": label,
            "snapshot": city_latest,
            "snapshots": len(city_priced),
            "listings": len(rows_now),
            "areas": sorted({r["area"] for r in rows_now if r["area"]}),
            "buckets": buckets,
            "seasonality": {m: {"price": round(c_price[m] / mp, 3), "occupancy": round(c_occ[m] / mo, 3)}
                            for m in range(1, 13)},
        }

    # 7) Modèle national (communes sans données Inside Airbnb) : prix DVF + Eurostat.
    import national_model
    paris_arr = {
        arr: (a["buckets"][1]["price"], a["buckets"][1]["sample"])
        for arr, a in arrondissements.items() if not a["buckets"][1].get("estimated")
    }
    # Prix d'un logement d'une chambre rapporté au prix médian de toutes les annonces (même
    # périmètre que les repères AirROI), mesuré dans les villes de référence.
    one_bedroom = {"paris": paris[1]["price"], **{k: c["buckets"][1]["price"]
                                                   for k, c in cities.items() if 1 in c["buckets"]}}
    r1 = statistics.median([p / bench[k]["adr"] for k, p in one_bedroom.items()
                            if k in bench and correction.get(k, {}).get("source") == "airroi"] or [1])
    national, communes = national_model.build(paris_arr, calib, seasonality, cities, paris,
                                              bench, round(r1, 3))
    with open(COMMUNES_OUTPUT, "w", encoding="utf-8") as fh:
        json.dump(communes, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"  {COMMUNES_OUTPUT} : {len(communes)} communes estimables", file=sys.stderr)

    out = {
        "source": "Inside Airbnb",
        "sourceUrl": "https://insideairbnb.com/paris/",
        "license": "CC BY 4.0",
        "snapshot": latest,
        "snapshots": year,
        "previousSnapshot": previous,
        "listings": len(current),
        "paris": paris,
        "parisTrend": paris_trend,
        "capacity": capacity,
        "amenities": amenity_effects,
        "propertyKinds": property_kinds,
        "bathrooms": bathrooms,
        "extraBedrooms": extra_bedrooms,
        "seasonality": seasonality,
        "arrondissements": arrondissements,
        "cities": cities,
        "nationalModel": national,
        "priceCorrection": correction,
    }
    validate(out)
    with open(OUTPUT, "w", encoding="utf-8") as fh:
        fh.write("// Fichier généré par scripts/build-market-data.py — ne pas modifier à la main.\n")
        fh.write("// Source : Inside Airbnb (CC BY 4.0), logements entiers actifs à Paris.\n\n")
        fh.write("export type MarketCell = {\n  price: number;\n  occupancy: number;\n"
                 "  occupancyTop: number;\n  sample: number;\n  estimated?: boolean;\n};\n\n")
        fh.write("export const MARKET_PARIS = ")
        fh.write(json.dumps(out, ensure_ascii=False, indent=2))
        fh.write(" as const;\n")
    print(f"{OUTPUT} mis à jour (relevé du {latest}).", file=sys.stderr)


if __name__ == "__main__":
    main()
