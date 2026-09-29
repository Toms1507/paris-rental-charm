import type { BlogPost } from "@/content/site";
import { MARKET_PARIS } from "@/content/market-paris";

// Article « baromètre » réécrit automatiquement à chaque mise à jour mensuelle des données
// Inside Airbnb (scripts/build-market-data.py) : aucun texte à maintenir à la main.

const NB = " ";
const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")}${NB}€`;
const pct = (n: number) => `${Math.round(n * 100)}${NB}%`;
const arrLabel = (n: number) => `Paris ${n}${n === 1 ? "er" : "e"}`;
const monthName = (m: number) =>
  new Date(2000, m - 1, 1).toLocaleDateString("fr-FR", { month: "long" });

const BUCKETS = [
  { key: "0", label: "Studio" },
  { key: "1", label: "Une chambre" },
  { key: "2", label: "Deux chambres" },
  { key: "3", label: "Trois chambres et plus" },
] as const;

export function buildBarometre(): BlogPost {
  const m = MARKET_PARIS;
  const snapshot = new Date(m.snapshot);
  const period = snapshot.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const areas = Object.entries(m.arrondissements)
    .map(([n, a]) => ({ n: Number(n), index: a.priceIndex, trend: a.priceTrend as number | null }))
    .sort((a, b) => b.index - a.index);
  const top = areas.slice(0, 3);
  const bottom = areas.slice(-3).reverse();

  const seasons = Object.entries(m.seasonality)
    .map(([month, s]) => ({ month: Number(month), score: s.price * s.occupancy, price: s.price }))
    .sort((a, b) => b.score - a.score);
  const high = seasons.slice(0, 3).map((s) => monthName(s.month));
  const low = seasons.slice(-3).map((s) => monthName(s.month));

  const trend = m.parisTrend as { price: number; occupancy: number } | null;
  const risers = areas.filter((a) => a.trend !== null).sort((a, b) => b.trend! - a.trend!);

  const sections: BlogPost["sections"] = [
    {
      heading: `Les prix par nuit à Paris en ${period}`,
      paragraphs: [
        `Sur les ${m.snapshots.length} derniers relevés mensuels, voici le prix médian d'une nuit dans un logement entier activement loué à Paris, selon sa taille. Ces chiffres portent sur ${m.listings.toLocaleString("fr-FR")} annonces Airbnb actives lors du dernier relevé.`,
      ],
      bullets: BUCKETS.map((b) => `${b.label} : ${euros(m.paris[b.key].price)} la nuit`),
    },
    {
      heading: "Taux d'occupation : de grands écarts entre annonces",
      paragraphs: [
        `La moitié des logements parisiens sont loués moins de ${pct(Math.min(...BUCKETS.map((b) => m.paris[b.key].occupancy)))} à ${pct(Math.max(...BUCKETS.map((b) => m.paris[b.key].occupancy)))} de l'année, tandis que les 25${NB}% les plus performants dépassent ${pct(Math.min(...BUCKETS.map((b) => m.paris[b.key].occupancyTop)))}. Réactivité, qualité des photos, tarification ajustée chaque jour et avis des voyageurs expliquent l'essentiel de cet écart.`,
      ],
    },
    {
      heading: "Les arrondissements les plus et les moins chers",
      paragraphs: [
        "Indice de prix par rapport à la médiane parisienne, à taille de logement égale :",
      ],
      bullets: [
        ...top.map(
          (a) => `${arrLabel(a.n)} : ${a.index >= 1 ? "+" : "−"}${pct(Math.abs(a.index - 1))}`,
        ),
        ...bottom.map(
          (a) => `${arrLabel(a.n)} : ${a.index >= 1 ? "+" : "−"}${pct(Math.abs(a.index - 1))}`,
        ),
      ],
    },
    {
      heading: "La saisonnalité parisienne",
      paragraphs: [
        `Les mois les plus porteurs sont ${high.join(", ")}, portés par le tourisme et les grands événements. À l'inverse, ${low.join(", ")} sont les plus calmes : c'est là qu'une tarification ajustée au jour près fait la différence.`,
      ],
    },
  ];

  if (trend) {
    sections.push({
      heading: "Évolution sur un an",
      paragraphs: [
        `À la même période l'an dernier, le prix médian d'une nuit à Paris était ${trend.price >= 0 ? "inférieur" : "supérieur"} de ${pct(Math.abs(trend.price))}.${
          risers.length
            ? ` Plus forte hausse : ${arrLabel(risers[0]!.n)} (${risers[0]!.trend! >= 0 ? "+" : "−"}${pct(Math.abs(risers[0]!.trend!))}).`
            : ""
        }`,
      ],
    });
  }

  sections.push({
    heading: "Et votre logement ?",
    paragraphs: [
      "Ces médianes donnent une tendance, mais chaque logement est unique. Testez notre simulateur de revenus sur la page d'accueil, ou demandez un audit gratuit : nous vous répondons sous 24 h avec une estimation personnalisée.",
      `Source : Inside Airbnb (licence CC BY 4.0), relevé du ${snapshot.toLocaleDateString("fr-FR")}. Article mis à jour automatiquement chaque mois.`,
    ],
  });

  return {
    slug: "barometre-location-courte-duree-paris",
    title: `Baromètre de la location courte durée à Paris : ${period}`,
    description: `Prix par nuit, taux d'occupation, arrondissements les plus chers et saisonnalité : les chiffres réels du marché Airbnb parisien, mis à jour chaque mois (${period}).`,
    date: m.snapshot,
    readingTime: "4 min",
    sections,
  };
}
