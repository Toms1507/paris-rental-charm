"""Modèle national d'estimation pour les communes sans données Inside Airbnb.

Principe (tout repose sur des données publiques et gratuites, recalculées chaque semaine) :

1. Prix par nuit : relation log-log entre le prix médian au m² des appartements (DVF, data.gouv.fr)
   et le prix médian réel d'une nuit (Inside Airbnb), ajustée sur toutes les zones de référence
   (arrondissements de Paris et de Lyon, communes de Bordeaux Métropole et du Pays basque).
   Validée en prédisant chaque ville sans ses propres données (erreur médiane publiée).
2. Taille du logement : rapports de prix entre studio, 1, 2 et 3 chambres observés dans les
   villes de référence hors Paris.
3. Occupation : niveaux médian et « 25 % meilleurs » observés dans les villes de référence hors Paris.
4. Saisonnalité : nuitées mensuelles réservées via Airbnb, Booking et Expedia dans la région
   (Eurostat, données transmises par les plateformes) ; l'effet sur les prix est estimé sur
   les villes de référence.
5. Contexte : nuitées annuelles réservées via ces plateformes dans 26 grandes agglomérations.
"""

import csv
import io
import json
import math
import re
import statistics
import sys
import unicodedata
import urllib.request
from collections import defaultdict

DVF_URL = "https://data-pipeline-open.s3.sbg.io.cloud.ovh.net/dvf/stats_whole_period.csv"
EUROSTAT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
# Noms officiels accentués (le fichier DVF les donne sans accents).
GEO_COMMUNES = ("https://geo.api.gouv.fr/communes?fields=code,nom&format=json"
                "&type=commune-actuelle,arrondissement-municipal")
MIN_SALES = 30  # communes avec au moins 30 ventes d'appartements : prix au m² fiable

# Département -> région NUTS 2 (découpage utilisé par Eurostat).
NUTS2 = {
    **{d: "FR10" for d in ("75", "77", "78", "91", "92", "93", "94", "95")},
    **{d: "FRB0" for d in ("18", "28", "36", "37", "41", "45")},
    **{d: "FRC1" for d in ("21", "58", "71", "89")},
    **{d: "FRC2" for d in ("25", "39", "70", "90")},
    **{d: "FRD1" for d in ("14", "50", "61")},
    **{d: "FRD2" for d in ("27", "76")},
    **{d: "FRE1" for d in ("59", "62")},
    **{d: "FRE2" for d in ("02", "60", "80")},
    **{d: "FRF1" for d in ("67", "68")},
    **{d: "FRF2" for d in ("08", "10", "51", "52")},
    **{d: "FRF3" for d in ("54", "55", "57", "88")},
    **{d: "FRG0" for d in ("44", "49", "53", "72", "85")},
    **{d: "FRH0" for d in ("22", "29", "35", "56")},
    **{d: "FRI1" for d in ("24", "33", "40", "47", "64")},
    **{d: "FRI2" for d in ("19", "23", "87")},
    **{d: "FRI3" for d in ("16", "17", "79", "86")},
    **{d: "FRJ1" for d in ("11", "30", "34", "48", "66")},
    **{d: "FRJ2" for d in ("09", "12", "31", "32", "46", "65", "81", "82")},
    **{d: "FRK1" for d in ("03", "15", "43", "63")},
    **{d: "FRK2" for d in ("01", "07", "26", "38", "42", "69", "73", "74")},
    **{d: "FRL0" for d in ("04", "05", "06", "13", "83", "84")},
    **{d: "FRM0" for d in ("2A", "2B")},
}


def norm(s):
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def fetch(url, timeout=300):
    return urllib.request.urlopen(url, timeout=timeout).read()


def load_dvf():
    """Communes avec un prix médian au m² d'appartement fiable."""
    text = io.TextIOWrapper(io.BytesIO(fetch(DVF_URL)), encoding="utf-8")
    communes = {}
    for r in csv.DictReader(text):
        if r["echelle_geo"] != "commune" or not r["med_prix_m2_whole_appartement"]:
            continue
        sales = int(r["nb_ventes_whole_appartement"] or 0)
        if sales < MIN_SALES:
            continue
        code = r["code_geo"]
        dept = code[:3] if code.startswith("97") else code[:2]
        communes[code] = {
            "name": r["libelle_geo"],
            "dept": dept,
            "m2": float(r["med_prix_m2_whole_appartement"]),
            "sales": sales,
        }
    print(f"  DVF : {len(communes)} communes avec au moins {MIN_SALES} ventes", file=sys.stderr)
    return communes


def official_names():
    """Code commune → nom officiel ; vide si le service est indisponible (on garde alors DVF)."""
    try:
        return {c["code"]: c["nom"] for c in json.loads(fetch(GEO_COMMUNES))}
    except Exception as e:  # noqa: BLE001
        print(f"  geo.api.gouv.fr indisponible ({e}) : noms DVF conservés", file=sys.stderr)
        return {}


def eurostat(dataset, query):
    return json.loads(fetch(f"{EUROSTAT}{dataset}?format=JSON&lang=fr&{query}"))


def jsonstat_values(d):
    """Itère (coordonnées, valeur) sur un jeu JSON-stat d'Eurostat."""
    ids, sizes = d["id"], d["size"]
    cats = [
        sorted(d["dimension"][k]["category"]["index"].items(), key=lambda kv: kv[1]) for k in ids
    ]
    for flat, value in d["value"].items():
        i, coords = int(flat), {}
        for k, size, cat in zip(reversed(ids), reversed(sizes), reversed(cats)):
            coords[k] = cat[i % size][0]
            i //= size
        yield coords, value


def region_seasonality():
    """Nuitées mensuelles via plateformes par région NUTS 2, sur la dernière année complète."""
    d = eurostat("tour_ce_omn12", "indic_to=NGT_SP&c_resid=TOTAL&unit=NR&lastTimePeriod=2")
    years = sorted(d["dimension"]["time"]["category"]["index"])
    nights = defaultdict(dict)  # (année, région) -> mois -> nuitées
    for c, v in jsonstat_values(d):
        if c["geo"].startswith("FR") and len(c["geo"]) == 4 and re.fullmatch(r"M\d\d", c["month"]):
            nights[(c["time"], c["geo"])][int(c["month"][1:])] = v
    out = {}
    for region in set(r for _, r in nights):
        for year in reversed(years):  # dernière année avec les 12 mois
            months = nights.get((year, region), {})
            if len(months) == 12 and all(months.values()):
                mean = statistics.mean(months.values())
                out[region] = {"year": year, "index": {m: round(v / mean, 3) for m, v in months.items()}}
                break
    print(f"  Eurostat : saisonnalité de {len(out)} régions", file=sys.stderr)
    return out


def city_nights():
    """Nuitées annuelles via plateformes dans les grandes agglomérations françaises."""
    d = eurostat("tour_ce_oarc", "indic_to=NGT_SP&c_resid=TOTAL&unit=NR&lastTimePeriod=1")
    labels = d["dimension"]["cities"]["category"]["label"]
    year = list(d["dimension"]["time"]["category"]["index"])[0]
    out = {}
    for c, v in jsonstat_values(d):
        code = c["cities"]
        if code.startswith("FR") and code != "FR" and v:
            name = re.sub(r"\s*\(greater city\)", "", labels[code])
            out[norm(name)] = {"name": name, "nights": int(v), "year": year}
    print(f"  Eurostat : nuitées de {len(out)} agglomérations ({year})", file=sys.stderr)
    return out


def weighted_fit(points):
    """Régression pondérée log(prix nuit) = a + b·log(prix m²). points : (m2, prix, poids)."""
    xs = [math.log(p[0]) for p in points]
    ys = [math.log(p[1]) for p in points]
    ws = [p[2] for p in points]
    sw = sum(ws)
    mx = sum(x * w for x, w in zip(xs, ws)) / sw
    my = sum(y * w for y, w in zip(ys, ws)) / sw
    b = sum(w * (x - mx) * (y - my) for x, y, w in zip(xs, ys, ws)) / sum(
        w * (x - mx) ** 2 for x, w in zip(xs, ws)
    )
    a = my - b * mx
    res = [y - (a + b * x) for x, y in zip(xs, ys)]
    r2 = 1 - sum(w * r * r for r, w in zip(res, ws)) / sum(w * (y - my) ** 2 for y, w in zip(ys, ws))
    return a, b, r2, statistics.pstdev(res)


# Villes de référence pour l'occupation hors Île-de-France : grandes villes comparables aux
# métropoles visées (le Pays basque, très saisonnier, n'est pas représentatif d'une ville).
URBAN_REFERENCES = ("lyon", "bordeaux")


def occupancy_references(cities, paris):
    """Occupation médiane et « 25 % meilleurs » : Paris pour l'Île-de-France, Lyon et Bordeaux ailleurs."""
    urban = {}
    for k in range(4):
        cells = [cities[c]["buckets"].get(k) or cities[c]["buckets"].get(str(k))
                 for c in URBAN_REFERENCES if c in cities]
        cells = [c for c in cells if c]
        urban[k] = {
            "occupancy": round(statistics.mean(c["occupancy"] for c in cells), 3),
            "occupancyTop": round(statistics.mean(c["occupancyTop"] for c in cells), 3),
        }
    idf = {k: {"occupancy": paris[k]["occupancy"], "occupancyTop": paris[k]["occupancyTop"]}
           for k in range(4)}
    return urban, idf


def build(paris_arr, calib, paris_season, cities, paris):
    """
    paris_arr   : {numéro d'arrondissement: (prix médian 1 chambre, nb d'annonces)}
    calib       : {ville: {"rows": annonces des 12 relevés, "now": dernier relevé,
                           "dept": "69", "area_code": fonction quartier -> code commune}}
    paris_season: saisonnalité parisienne {mois: {"price", "occupancy"}} (pour l'effet prix)
    """
    dvf = load_dvf()
    by_name = defaultdict(list)
    for code, c in dvf.items():
        by_name[(norm(c["name"]), c["dept"])].append(code)

    # 1) Points de calibration : (prix m², prix médian d'une nuit pour 1 chambre, poids)
    points, labels = [], []
    for n, (price, sample) in paris_arr.items():
        code = str(75100 + int(n))
        if code in dvf and sample >= 15:
            points.append((dvf[code]["m2"], price, math.sqrt(sample)))
            labels.append("Paris")
    for city, c in calib.items():
        per_area = defaultdict(list)
        for r in c["rows"]:
            if r["bucket"] == 1:
                code = c["area_code"](r["area"], by_name)
                if code:
                    per_area[code].append(r["price"])
        for code, prices in per_area.items():
            if len(prices) >= 15 and code in dvf:
                points.append((dvf[code]["m2"], statistics.median(prices), math.sqrt(len(prices))))
                labels.append(city)
    a, b, r2, sd = weighted_fit(points)

    # Validation : chaque ville prédite sans ses propres données
    errors = {}
    for city in sorted(set(labels)):
        train = [p for p, l in zip(points, labels) if l != city]
        test = [p for p, l in zip(points, labels) if l == city]
        a2, b2, _, _ = weighted_fit(train)
        errors[city] = round(
            statistics.median(abs(math.exp(a2 + b2 * math.log(m2)) / price - 1) for m2, price, _ in test), 3
        )
    print(f"  Modèle prix : élasticité {b:.2f}, R² {r2:.2f}, {len(points)} zones, erreurs {errors}",
          file=sys.stderr)
    if r2 < 0.7:
        raise RuntimeError(f"Modèle national trop peu fiable (R² {r2:.2f}) : non publié.")

    # 2) Rapports de prix selon la taille (villes de référence hors Paris) et 3) occupation
    ratios = defaultdict(list)
    for c in calib.values():
        med = {k: statistics.median([r["price"] for r in c["rows"] if r["bucket"] == k] or [0])
               for k in range(4)}
        for k in range(4):
            if med[1] and med[k]:
                ratios[k].append(med[k] / med[1])
    urban, idf = occupancy_references(cities, paris)
    buckets = {k: {"ratio": round(statistics.median(ratios[k]), 3), **urban[k]} for k in range(4)}

    # 4) Saisonnalité régionale et effet sur les prix (pente prix/demande observée à Paris)
    pairs = [(s["occupancy"] - 1, s["price"] - 1) for s in paris_season.values()]
    slope = sum(o * p for o, p in pairs) / sum(o * o for o, _ in pairs)
    slope = round(max(0.0, min(1.0, slope)), 3)
    regions = region_seasonality()
    seasonality = {
        region: {
            "year": s["year"],
            "months": {m: {"occupancy": v, "price": round(1 + slope * (v - 1), 3)}
                       for m, v in s["index"].items()},
        }
        for region, s in regions.items()
    }

    # 5) Communes estimables : prix au m² connu et région avec saisonnalité
    communes = []
    names = official_names()
    for code, c in dvf.items():
        region = NUTS2.get(c["dept"])
        if region in seasonality:
            communes.append([names.get(code, c["name"]), c["dept"], round(c["m2"]), region, code])
    communes.sort(key=lambda x: (norm(x[0]), x[1]))

    model = {
        "price": {"a": round(a, 4), "b": round(b, 4), "r2": round(r2, 3),
                  "residualSd": round(sd, 3), "zones": len(points), "crossValidationError": errors},
        "buckets": buckets,
        "bucketsIdf": idf,
        "priceSeasonSlope": slope,
        "seasonality": seasonality,
        "cityNights": city_nights(),
        "communes": len(communes),
    }
    return model, communes
