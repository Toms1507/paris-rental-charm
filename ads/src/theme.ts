import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Palette du site (src/styles.css).
export const C = {
  navy: "#213F6C",
  ink: "#111D30",
  sky: "#98CCEB",
  sand: "#F3F6FA",
  border: "#DCE2E8",
  text: "#202020",
  muted: "#515963",
  white: "#FFFFFF",
  steel: "#4C759F",
};

export const FONT_DISPLAY = "Fraunces";
export const FONT_SANS = "DM Sans";

// Infos de contact affichées dans les publicités : à mettre à jour ici si elles changent.
export const BRAND = {
  name: "Spinelle Conciergerie",
  url: "spinelleconciergerie.fr",
  phone: "06 31 93 51 66",
  slogan: ["Profitez de votre temps,", "on s'occupe de vos voyageurs."],
};

const fonts = [
  { family: FONT_DISPLAY, file: "fraunces-latin-400-normal.woff2", weight: "400" },
  { family: FONT_DISPLAY, file: "fraunces-latin-600-normal.woff2", weight: "600" },
  { family: FONT_DISPLAY, file: "fraunces-latin-700-normal.woff2", weight: "700" },
  { family: FONT_SANS, file: "dm-sans-latin-400-normal.woff2", weight: "400" },
  { family: FONT_SANS, file: "dm-sans-latin-500-normal.woff2", weight: "500" },
  { family: FONT_SANS, file: "dm-sans-latin-700-normal.woff2", weight: "700" },
];

for (const f of fonts) {
  loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight });
}

export const img = (name: string) => staticFile(`img/${name}`);
