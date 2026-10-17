import appartementBalcon from "@/assets/photos/appartement-balcon.jpg";
import chambreParisienne from "@/assets/photos/chambre-parisienne.jpg";
import clesEntree from "@/assets/photos/cles-entree.jpg";
import litLingeHotelier from "@/assets/photos/lit-linge-hotelier.jpg";
import litServiettes from "@/assets/photos/lit-serviettes.jpg";
import parisCoucherDeSoleil from "@/assets/photos/paris-coucher-de-soleil.jpg";
import remiseDesCles from "@/assets/photos/remise-des-cles.jpg";
import toitsDeParis from "@/assets/photos/toits-de-paris.jpg";
import vueSacreCoeur from "@/assets/photos/vue-sacre-coeur.jpg";

// Photos d'illustration libres de droits (licence Unsplash : usage commercial autorisé).
// Format 16:9, 1600 × 900. Crédits repris dans les mentions légales.
export type Photo = { src: string; alt: string; author: string; url: string };

export const PHOTOS = {
  "paris-coucher-de-soleil": {
    src: parisCoucherDeSoleil,
    alt: "Vue sur les toits de Paris et la tour Eiffel au coucher du soleil",
    author: "Bethan James",
    url: "https://unsplash.com/photos/pjRxijdMGuE",
  },
  "toits-de-paris": {
    src: toitsDeParis,
    alt: "Toits de Paris en zinc avec la tour Eiffel en arrière-plan",
    author: "Adrien",
    url: "https://unsplash.com/photos/wAScP0OY-yM",
  },
  "vue-sacre-coeur": {
    src: vueSacreCoeur,
    alt: "Vue sur Montmartre et la basilique du Sacré-Cœur",
    author: "Svetlana Gumerova",
    url: "https://unsplash.com/photos/PEMcqBV5L7Q",
  },
  "chambre-parisienne": {
    src: chambreParisienne,
    alt: "Porte-fenêtre d'un appartement haussmannien donnant sur un balcon parisien",
    author: "Yannick Van Houtven",
    url: "https://unsplash.com/photos/GbYmKICa4H4",
  },
  "appartement-balcon": {
    src: appartementBalcon,
    alt: "Coin salon lumineux d'un appartement parisien avec balcon en fer forgé",
    author: "Anthony Delanoix",
    url: "https://unsplash.com/photos/Fo_ReTbrn9g",
  },
  "lit-linge-hotelier": {
    src: litLingeHotelier,
    alt: "Lit fait avec du linge blanc de qualité hôtelière",
    author: "Dave Photoz",
    url: "https://unsplash.com/photos/6MYm-cUJRB0",
  },
  "lit-serviettes": {
    src: litServiettes,
    alt: "Chambre lumineuse préparée pour l'arrivée des voyageurs, serviettes pliées sur le lit",
    author: "Andrew Neel",
    url: "https://unsplash.com/photos/B4rEJ09-Puo",
  },
  "remise-des-cles": {
    src: remiseDesCles,
    alt: "Remise des clés d'un logement en location courte durée",
    author: "Maria Ziegler",
    url: "https://unsplash.com/photos/jJnZg7vBfMs",
  },
  "cles-entree": {
    src: clesEntree,
    alt: "Clés tendues à l'entrée d'un appartement",
    author: "Jakub Żerdzicki",
    url: "https://unsplash.com/photos/bqUZEAeWuok",
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;

// Photo de chaque article. Un nouvel article sans photo attitrée en reçoit une automatiquement,
// toujours la même pour un même article (choisie d'après son adresse).
const POST_PHOTOS: Record<string, PhotoKey> = {
  "barometre-location-courte-duree-paris": "paris-coucher-de-soleil",
  "choisir-conciergerie-airbnb-paris": "remise-des-cles",
  "rentabilite-location-courte-duree-paris": "toits-de-paris",
  "regles-airbnb-paris-90-jours": "cles-entree",
  "optimiser-annonce-airbnb": "lit-serviettes",
  "conciergerie-ou-gestion-seule": "lit-linge-hotelier",
  "meilleurs-quartiers-airbnb-paris": "vue-sacre-coeur",
};

export function postPhoto(slug: string): Photo {
  const key = POST_PHOTOS[slug];
  if (key) return PHOTOS[key];
  const keys = Object.keys(PHOTOS) as PhotoKey[];
  const hash = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return PHOTOS[keys[hash % keys.length]!];
}
