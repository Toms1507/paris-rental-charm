import { MARKET_PARIS } from "@/content/market-paris";

// Chiffres de marché cités dans les textes du site (FAQ, articles). Ils sont calculés à partir
// des données Inside Airbnb, actualisées automatiquement : aucun chiffre n'est écrit à la main.

const NB = " ";
const m = MARKET_PARIS;
const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")}${NB}€`;
const pct = (n: number) => `${Math.round(n * 100)}${NB}%`;
const arr = (n: number) => `${n}${n === 1 ? "er" : "e"}`;
const list = (items: string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(", ")} et ${items.at(-1)}` : (items[0] ?? "");

const buckets = ["0", "1", "2", "3"] as const;
const areas = Object.entries(m.arrondissements).map(([n, a]) => ({
  n: Number(n),
  price: a.priceIndex,
  occupancy: a.buckets["1"].occupancy,
}));
const byPrice = [...areas].sort((a, b) => b.price - a.price);
const byOccupancy = [...areas].sort((a, b) => b.occupancy - a.occupancy);

export const FACTS = {
  /** « septembre 2026 » : mois du dernier relevé. */
  period: new Date(m.snapshot).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
  listings: m.listings.toLocaleString("fr-FR"),
  price: {
    studio: euros(m.paris["0"].price),
    oneBedroom: euros(m.paris["1"].price),
    twoBedrooms: euros(m.paris["2"].price),
    threeBedrooms: euros(m.paris["3"].price),
  },
  /** Occupation médiane annuelle, de la tranche la plus basse à la plus haute. */
  occupancyMedianRange: `${pct(Math.min(...buckets.map((b) => m.paris[b].occupancy)))} à ${pct(Math.max(...buckets.map((b) => m.paris[b].occupancy)))}`,
  /** Seuil des 25 % d'annonces les plus louées (tranche la plus basse). */
  occupancyTop: pct(Math.min(...buckets.map((b) => m.paris[b].occupancyTop))),
  mostExpensive: list(byPrice.slice(0, 3).map((a) => arr(a.n))),
  mostAffordable: list(byPrice.slice(-3).map((a) => arr(a.n))),
  bestOccupancy: list(byOccupancy.slice(0, 3).map((a) => arr(a.n))),
};
