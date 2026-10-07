// Contexte transmis à l'assistant voyageurs, et réponses de secours sans IA (mots-clés).

import { euros, formatLongDay } from "./dates";
import { RECO_CATEGORIES } from "./types";
import type { StayView } from "./types";

export function stayContext(v: StayView): string {
  const p = v.property;
  const g = p.guide ?? {};
  const field = (label: string, value?: string | null) => (value ? `- ${label} : ${value}` : null);
  const lines = [
    "## Séjour",
    `- Logement : ${p.name}${p.address ? `, ${p.address}` : ""}${p.arrondissement ? ` (${p.arrondissement})` : ""}`,
    `- Voyageur : ${v.reservation.guest_name ?? "inconnu"}, ${v.reservation.guests} personne(s)`,
    `- Arrivée : ${formatLongDay(v.reservation.check_in)} à partir de ${p.checkin_time}`,
    `- Départ : ${formatLongDay(v.reservation.check_out)} avant ${p.checkout_time}`,
    `- Départ tardif : possible jusqu'à ${p.late_checkout_until} selon disponibilité, ${p.late_checkout_price ? euros(p.late_checkout_price) : "offert"}`,
    `- Arrivée anticipée : selon disponibilité, ${p.early_checkin_price ? euros(p.early_checkin_price) : "offerte"}`,
    "",
    "## Logement",
    field("Message d'accueil", g.welcome),
    v.codes_visible
      ? field("Accès", g.access_details)
      : "- Accès et codes : communiqués la veille de l'arrivée (dans le livret et par message)",
    v.codes_visible ? field("Code de la porte", g.door_code) : null,
    v.codes_visible ? field("Boîte à clés", g.keybox_code) : null,
    field("Wifi", g.wifi_name ? `${g.wifi_name} / mot de passe ${g.wifi_password ?? "?"}` : null),
    field("Règles de la maison", g.house_rules),
    field("Équipements et appareils", g.appliances),
    field("Chauffage / climatisation", g.heating),
    field("Poubelles et tri", g.trash),
    field("Transports", g.transport),
    field("Parking", g.parking),
    field("Consignes de départ", g.checkout_instructions),
    field("Urgences et contacts", g.emergency),
    field("Questions fréquentes", g.faq),
    "",
    "## Bons plans du quartier (sélection de la conciergerie)",
    ...v.recommendations
      .slice(0, 40)
      .map(
        (r) =>
          `- [${RECO_CATEGORIES[r.category] ?? r.category}] ${r.name}${r.address ? `, ${r.address}` : ""}${r.price_level ? ` (${r.price_level})` : ""} : ${r.description ?? ""}${r.tip ? ` Conseil : ${r.tip}` : ""}`,
      ),
  ];
  return lines.filter((l) => l !== null).join("\n");
}

const RULES: { test: RegExp; answer: (v: StayView) => string | null }[] = [
  {
    test: /wi-?fi|internet|mot de passe|password/i,
    answer: (v) =>
      v.property.guide.wifi_name
        ? `Le wifi s'appelle « ${v.property.guide.wifi_name} », mot de passe : ${v.property.guide.wifi_password ?? "voir le livret"}.`
        : null,
  },
  {
    test: /late|tardif|plus tard|partir.*(tard|midi)|check.?out|départ|depart/i,
    answer: (v) =>
      `Le départ est prévu avant ${v.property.checkout_time}. Un départ tardif jusqu'à ${v.property.late_checkout_until} est possible selon disponibilité (${v.property.late_checkout_price ? euros(v.property.late_checkout_price) : "offert"}) : utilisez le bouton « Départ tardif » ci-dessus, l'équipe vous confirme rapidement.`,
  },
  {
    test: /early|plus tôt|anticip|check.?in|arriv/i,
    answer: (v) =>
      `L'arrivée se fait à partir de ${v.property.checkin_time}. Pour arriver plus tôt (${v.property.early_checkin_price ? euros(v.property.early_checkin_price) : "offert"}, selon disponibilité), utilisez le bouton « Arrivée anticipée ».`,
  },
  {
    test: /code|clé|cle|key|porte|door|boîte|boite|accès|acces/i,
    answer: (v) =>
      v.codes_visible
        ? [
            v.property.guide.access_details,
            v.property.guide.door_code && `Code porte : ${v.property.guide.door_code}`,
            v.property.guide.keybox_code && `Boîte à clés : ${v.property.guide.keybox_code}`,
          ]
            .filter(Boolean)
            .join("\n") || null
        : "Les codes d'accès apparaissent dans ce livret la veille de votre arrivée, et vous les recevez aussi par message.",
  },
  { test: /poubelle|trash|déchet|tri/i, answer: (v) => v.property.guide.trash ?? null },
  { test: /chauffage|heat|clim|radiateur/i, answer: (v) => v.property.guide.heating ?? null },
  { test: /parking|voiture|car|garer/i, answer: (v) => v.property.guide.parking ?? null },
  {
    test: /métro|metro|bus|transport|taxi|uber|aéroport|airport|gare/i,
    answer: (v) => v.property.guide.transport ?? null,
  },
  {
    test: /restaurant|manger|dîner|diner|déjeuner|eat|food|bar|café|cafe|brunch|visiter|visit|faire/i,
    answer: (v) =>
      v.recommendations.length
        ? `Quelques adresses que nous aimons : ${v.recommendations
            .slice(0, 5)
            .map((r) => r.name)
            .join(", ")}. Tout est détaillé dans l'onglet « Bons plans ».`
        : null,
  },
  {
    test: /panne|marche pas|fonctionne pas|cassé|fuite|broken|not working|problème|probleme|disjonct/i,
    answer: () =>
      "Désolés pour ce souci ! Utilisez le bouton « Signaler un problème » avec une petite description (et une photo si possible) : l'équipe est prévenue immédiatement et intervient au plus vite.",
  },
];

export function localAnswer(v: StayView, question: string): string {
  for (const r of RULES) {
    if (r.test.test(question)) {
      const a = r.answer(v);
      if (a) return a;
    }
  }
  return "Je n'ai pas cette information. Utilisez le bouton « Contacter l'équipe » : nous vous répondons rapidement.";
}
