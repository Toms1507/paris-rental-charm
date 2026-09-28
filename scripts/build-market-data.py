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
import urllib.parse
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
# Autres villes suivies par Inside Airbnb : (identifiant, nom affiché, chemin dans les URL).
OTHER_CITIES = [
    ("lyon", "Lyon", "auvergne-rhone-alpes/lyon"),
    ("bordeaux", "Bordeaux", "nouvelle-aquitaine/bordeaux"),
    ("pays-basque", "Pays basque", "pyrénées-atlantiques/pays-basque"),
]


# --- Découverte des relevés -------------------------------------------------------------------

def exists(date):
    try:
        req = urllib.request.Request(BASE.format(date=date), method="HEAD")
        return urllib.request.urlopen(req, timeout=20).status == 200
    except Exception:
        return False


def find_snapshots(days_back=430):
    today = datetime.date.today()
    dates = [(today - datetime.timedelta(days=i)).isoformat() for i in range(days_back)]
    with concurrent.futures.ThreadPoolExecutor(32) as pool:
        found = [d for d, ok in zip(dates, pool.map(exists, dates)) if ok]
    return sorted(found)


# --- Lecture d'un relevé ----------------------------------------------------------------------

def bucket(row):
    """0 = studio, 1 = une chambre, 2 = deux chambres, 3 = trois chambres ou plus."""
    if not row["bedrooms"]:
        return 0
    n = int(float(row["bedrooms"]))
    if n == 1 and "studio" in (row["name"] + " " + row["description"]).lower():
        return 0
    return min(n, 3)


def load(date, url=BASE, paris=True):
    """Logements entiers actifs (au moins 3 avis sur 12 mois). Le prix vaut None s'il manque
    (certains relevés sont publiés sans prix : ils servent alors seulement au remplissage)."""
    raw = urllib.request.urlopen(url.format(date=date), timeout=300).read()
    text = io.TextIOWrapper(gzip.GzipFile(fileobj=io.BytesIO(raw)), encoding="utf-8")
    rows = []
    for row in csv.DictReader(text):
        if row["room_type"] != "Entire home/apt":
            continue
        if int(row["number_of_reviews_ltm"] or 0) < 3:
            continue
        price = float(row["price"].replace("$", "").replace(",", "")) if row["price"] else None
        if price is not None and not 30 <= price <= 1500:
            continue
        arr = ARRONDISSEMENTS.get(row["neighbourhood_cleansed"]) if paris else 0
        if paris and not arr:
            continue
        rows.append({
            "arr": arr,
            "area": row["neighbourhood_cleansed"],
            "lat": float(row["latitude"]),
            "lon": float(row["longitude"]),
            "bucket": bucket(row),
            "guests": min(int(row["accommodates"] or 2), MAX_GUESTS),
            "price": price,
            "occ": int(row.get("estimated_occupancy_l365d") or 0) / 365,
            "booked30": 1 - int(row["availability_30"] or 0) / 30,
        })
    priced = sum(1 for r in rows if r["price"] is not None)
    print(f"  {date} : {len(rows)} logements actifs, dont {priced} avec prix", file=sys.stderr)
    return rows


# --- Statistiques -----------------------------------------------------------------------------

def quantile(values, q):
    values = sorted(values)
    return values[min(len(values) - 1, int(len(values) * q))]


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

        sectors = {}
        for name in ("nord", "sud", "est", "ouest"):
            ratios = [r["price"] / paris_price[r["bucket"]] for r in mine if sector(r) == name]
            sectors[name] = {
                "index": round(statistics.median(ratios) / arr_ratio, 3) if len(ratios) >= 40 else 1,
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

    # 4) Saisonnalité mois par mois : prix médian (relevés avec prix) et part du calendrier
    #    réservée à 30 jours (tous les relevés).
    price_by_month = {
        datetime.date.fromisoformat(d).month: statistics.median(
            [r["price"] / paris_price[r["bucket"]] for r in rows])
        for d, rows in data.items()
    }
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

    # 6) Autres villes françaises publiées par Inside Airbnb, pour les biens hors zone.
    cities = {}
    page = urllib.request.urlopen("https://insideairbnb.com/get-the-data/", timeout=60).read().decode()
    for slug, label, path in OTHER_CITIES:
        found = sorted(set(re.findall(
            r"https://data\.insideairbnb\.com/france/" + re.escape(path) + r"/(\d{4}-\d{2}-\d{2})/data/listings\.csv\.gz",
            page)))
        if not found:
            continue
        date = found[-1]
        url = "https://data.insideairbnb.com/france/" + urllib.parse.quote(path) + "/{date}/data/listings.csv.gz"
        rows = [r for r in load(date, url, paris=False) if r["price"] is not None]
        if len(rows) < 200:
            continue
        overall = statistics.median(r["price"] for r in rows)
        buckets = {}
        for b in range(4):
            mine = [r for r in rows if r["bucket"] == b]
            if len(mine) >= MIN_SAMPLE:
                occ, top = occ_stats(mine)
                buckets[b] = {"price": round(statistics.median(r["price"] for r in mine)),
                              "occupancy": occ, "occupancyTop": top, "sample": len(mine)}
            else:  # tranche trop rare : prix parisien ramené au niveau de la ville
                ratio = overall / statistics.median(r["price"] for r in pooled)
                buckets[b] = {**paris[b], "price": round(paris[b]["price"] * ratio),
                              "sample": len(mine), "estimated": True}
        areas = sorted({r["area"] for r in rows if r["area"]})
        cities[slug] = {"label": label, "snapshot": date, "listings": len(rows),
                        "areas": areas, "buckets": buckets}

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
        "seasonality": seasonality,
        "arrondissements": arrondissements,
        "cities": cities,
    }
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
