// Chiffres lus directement dans les données de marché du site (mises à jour automatiquement
// depuis Inside Airbnb) : un nouveau rendu des vidéos reprend toujours les derniers chiffres.
import { MARKET_PARIS } from "../../src/content/market-paris";

const m = MARKET_PARIS;
const period = new Date(m.snapshot).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

export const MARKET = {
  prices: [
    { label: "Studio", price: m.paris["0"].price },
    { label: "1 chambre", price: m.paris["1"].price },
    { label: "2 chambres", price: m.paris["2"].price },
    { label: "3 chambres", price: m.paris["3"].price },
  ],
  source: `Source : Inside Airbnb / AirROI, ${period}. Logements entiers actifs. Revenus non garantis.`,
};
