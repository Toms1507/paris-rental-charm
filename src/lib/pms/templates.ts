// Variables des modèles de messages et calcul de la date d'envoi.

import { addDays, euros, formatLongDay, parisInstant } from "./dates";
import { PLATFORMS } from "./types";
import type { MessageTemplate, Property, Reservation, Settings } from "./types";

export const VARIABLES: { key: string; label: string }[] = [
  { key: "prenom", label: "Prénom du voyageur" },
  { key: "nom_voyageur", label: "Nom complet du voyageur" },
  { key: "logement", label: "Nom du logement" },
  { key: "adresse", label: "Adresse" },
  { key: "arrivee", label: "Date d'arrivée" },
  { key: "depart", label: "Date de départ" },
  { key: "heure_arrivee", label: "Heure d'arrivée" },
  { key: "heure_depart", label: "Heure de départ" },
  { key: "nb_voyageurs", label: "Nombre de voyageurs" },
  { key: "lien_livret", label: "Lien du livret d'accueil" },
  { key: "acces", label: "Instructions d'accès" },
  { key: "code_porte", label: "Code de la porte" },
  { key: "code_boite", label: "Code de la boîte à clés" },
  { key: "wifi", label: "Nom du wifi" },
  { key: "mot_de_passe_wifi", label: "Mot de passe wifi" },
  { key: "consignes_depart", label: "Consignes de départ" },
  { key: "heure_depart_tardif", label: "Heure limite du départ tardif" },
  { key: "prix_depart_tardif", label: "Prix du départ tardif" },
  { key: "prix_arrivee_anticipee", label: "Prix de l'arrivée anticipée" },
  { key: "plateforme", label: "Plateforme de réservation" },
  { key: "signature", label: "Signature" },
];

export function stayUrl(origin: string, r: Pick<Reservation, "guest_token">) {
  return `${origin.replace(/\/$/, "")}/sejour/${r.guest_token}`;
}

export function firstName(name: string | null | undefined) {
  const n = (name ?? "").trim();
  if (!n || /^(reserved|réservé|closed|not available|airbnb)/i.test(n)) return "";
  return n.split(/\s+/)[0];
}

export function renderTemplate(
  text: string,
  ctx: { reservation: Reservation; property: Property; settings: Settings; origin: string },
): string {
  const { reservation: r, property: p, settings } = ctx;
  const g = p.guide ?? {};
  const values: Record<string, string> = {
    prenom: firstName(r.guest_name) || "",
    nom_voyageur: r.guest_name ?? "",
    logement: p.name,
    adresse: p.address ?? "",
    arrivee: formatLongDay(r.check_in),
    depart: formatLongDay(r.check_out),
    heure_arrivee: r.arrival_time || p.checkin_time,
    heure_depart: p.checkout_time,
    nb_voyageurs: String(r.guests),
    lien_livret: stayUrl(ctx.origin, r),
    acces: g.access_details || "voir le livret d'accueil",
    code_porte: g.door_code || "—",
    code_boite: g.keybox_code || "—",
    wifi: g.wifi_name || "—",
    mot_de_passe_wifi: g.wifi_password || "—",
    consignes_depart:
      g.checkout_instructions ||
      "Merci de laisser les clés comme à votre arrivée, de jeter les poubelles et de fermer les fenêtres.",
    heure_depart_tardif: p.late_checkout_until,
    prix_depart_tardif: p.late_checkout_price ? euros(p.late_checkout_price) : "offert",
    prix_arrivee_anticipee: p.early_checkin_price ? euros(p.early_checkin_price) : "offert",
    plateforme: PLATFORMS[r.platform]?.label ?? "la plateforme",
    signature: settings.signature,
  };
  return text
    .replace(/\{(\w+)\}/g, (m: string, k: string) => values[k] ?? m)
    .replace(/Bonjour ,/g, "Bonjour,")
    .replace(/Hello ,/g, "Hello,")
    .replace(/Hi ,/g, "Hi,");
}

/** Instant d'envoi prévu d'un modèle pour une réservation. */
export function scheduleFor(t: MessageTemplate, r: Reservation): Date {
  switch (t.trigger) {
    case "reservation_confirmee":
      return new Date(r.created_at);
    case "avant_arrivee":
      return parisInstant(addDays(r.check_in, -Math.max(0, t.offset_days)), t.send_time);
    case "jour_arrivee":
      return parisInstant(r.check_in, t.send_time);
    case "lendemain_arrivee":
      return parisInstant(addDays(r.check_in, 1 + t.offset_days), t.send_time);
    case "veille_depart":
      return parisInstant(addDays(r.check_out, -1 - t.offset_days), t.send_time);
    case "apres_depart":
      return parisInstant(addDays(r.check_out, t.offset_days), t.send_time);
  }
}

/** Le modèle a-t-il un sens pour ce séjour ? (ex. pas de « lendemain de l'arrivée » pour une nuit) */
export function templateApplies(t: MessageTemplate, r: Reservation): boolean {
  const n = (Date.parse(r.check_out) - Date.parse(r.check_in)) / 86_400_000;
  if (t.trigger === "lendemain_arrivee" && n < 2) return false;
  if (t.trigger === "veille_depart" && n < 1) return false;
  return true;
}

export function whatsappLink(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
