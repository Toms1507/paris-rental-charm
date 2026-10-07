// Valeurs par défaut des lignes (identiques aux valeurs par défaut des tables SQL), modèles de
// messages et réglages initiaux.

import type { ChecklistItem, MessageTemplate, Settings, TableName, Tables } from "./types";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

export const token = () => (uid() + uid()).replace(/-/g, "");

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { label: "Draps et serviettes changés, lits faits" },
  { label: "Salle de bain et WC désinfectés" },
  { label: "Cuisine, vaisselle, frigo et micro-ondes propres" },
  { label: "Sols aspirés et lavés" },
  { label: "Poubelles vidées, sacs neufs" },
  { label: "Consommables réassortis (papier toilette, savon, café, thé)" },
  { label: "Ampoules, télécommandes et wifi vérifiés" },
  { label: "Objets oubliés par les voyageurs mis de côté" },
  { label: "Fenêtres fermées, chauffage / clim réglés, lumières éteintes" },
  { label: "Clés / boîte à clés remises en place" },
];

export const DEFAULT_SETTINGS: Settings = {
  company_name: "Spinelle Conciergerie",
  email: "contact@spinelleconciergerie.fr",
  phone: "+33 6 31 93 51 66",
  signature: "L'équipe Spinelle Conciergerie",
  default_commission: 0.2,
  auto_send: true,
  auto_reports: true,
  alert_email: "contact@spinelleconciergerie.fr",
  review_reminder: true,
  last_run: null,
  last_reports_month: null,
};

type Defaults = { [T in TableName]: () => Tables[T] };

const now = () => new Date().toISOString();

const DEFAULTS: Defaults = {
  pms_settings: () => ({ id: uid(), data: {}, updated_at: now() }),
  pms_owners: () => ({
    id: uid(),
    name: "",
    email: null,
    phone: null,
    address: null,
    iban: null,
    notes: null,
    created_at: now(),
  }),
  pms_cleaners: () => ({
    id: uid(),
    name: "",
    company: null,
    email: null,
    phone: null,
    rate: 0,
    token: token(),
    active: true,
    notes: null,
    created_at: now(),
  }),
  pms_properties: () => ({
    id: uid(),
    name: "",
    address: null,
    arrondissement: null,
    owner_id: null,
    cleaner_id: null,
    photo_url: null,
    capacity: 2,
    bedrooms: 1,
    checkin_time: "16:00",
    checkout_time: "11:00",
    late_checkout_until: "14:00",
    late_checkout_price: 30,
    early_checkin_price: 30,
    commission_rate: 0.2,
    cleaning_fee: 0,
    guide: {},
    ical_feeds: [],
    export_token: token(),
    checklist: DEFAULT_CHECKLIST,
    active: true,
    created_at: now(),
  }),
  pms_reservations: () => ({
    id: uid(),
    property_id: "",
    platform: "direct",
    external_uid: null,
    status: "confirmee",
    source: "manuel",
    guest_name: null,
    guest_email: null,
    guest_phone: null,
    guest_language: "fr",
    guests: 2,
    check_in: "",
    check_out: "",
    arrival_time: null,
    departure_time: null,
    amount_gross: 0,
    platform_fee: 0,
    cleaning_fee: 0,
    notes: null,
    raw: null,
    guest_token: token(),
    created_at: now(),
    updated_at: now(),
  }),
  pms_cleaning_tasks: () => ({
    id: uid(),
    property_id: "",
    reservation_id: null,
    next_reservation_id: null,
    cleaner_id: null,
    date: "",
    window_start: null,
    window_end: null,
    next_guests: null,
    status: "a_faire",
    condition: null,
    report_notes: null,
    checklist: [],
    photos: [],
    price: 0,
    started_at: null,
    completed_at: null,
    notified_at: null,
    created_at: now(),
  }),
  pms_incidents: () => ({
    id: uid(),
    property_id: "",
    task_id: null,
    reservation_id: null,
    severity: "orange",
    title: "",
    description: null,
    photos: [],
    status: "ouvert",
    reported_by: null,
    cost: 0,
    billable_to_owner: true,
    created_at: now(),
    resolved_at: null,
  }),
  pms_message_templates: () => ({
    id: uid(),
    name: "",
    trigger: "reservation_confirmee",
    offset_days: 0,
    send_time: "10:00",
    channel: "auto",
    subject: null,
    body: "",
    active: true,
    position: 0,
    created_at: now(),
  }),
  pms_messages: () => ({
    id: uid(),
    reservation_id: null,
    template_id: null,
    direction: "sortant",
    channel: "email",
    recipient: null,
    subject: null,
    body: "",
    status: "planifie",
    scheduled_for: null,
    sent_at: null,
    error: null,
    created_at: now(),
  }),
  pms_guest_requests: () => ({
    id: uid(),
    reservation_id: "",
    type: "autre",
    details: null,
    requested_time: null,
    price: null,
    rating: null,
    status: "en_attente",
    answer: null,
    created_at: now(),
  }),
  pms_expenses: () => ({
    id: uid(),
    property_id: "",
    date: new Date().toISOString().slice(0, 10),
    category: "autre",
    label: "",
    amount: 0,
    invoice_url: null,
    billable_to_owner: true,
    created_at: now(),
  }),
  pms_owner_reports: () => ({
    id: uid(),
    owner_id: null,
    property_id: null,
    month: "",
    data: {} as Tables["pms_owner_reports"]["data"],
    status: "brouillon",
    sent_at: null,
    created_at: now(),
  }),
  pms_reviews: () => ({
    id: uid(),
    property_id: "",
    reservation_id: null,
    platform: "airbnb",
    rating: 5,
    comment: null,
    date: new Date().toISOString().slice(0, 10),
    response: null,
    created_at: now(),
  }),
  pms_recommendations: () => ({
    id: uid(),
    property_id: null,
    arrondissement: null,
    category: "restaurant",
    name: "",
    description: null,
    address: null,
    url: null,
    tip: null,
    price_level: null,
    trending: false,
    source: null,
    active: true,
    created_at: now(),
  }),
};

export function withDefaults<T extends TableName>(table: T, row: Partial<Tables[T]>): Tables[T] {
  const base = DEFAULTS[table]();
  const clean = Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
  return { ...base, ...clean } as Tables[T];
}

/** Modèles de messages proposés au départ (modifiables dans « Messages »). Variables entre accolades. */
export const DEFAULT_TEMPLATES: Omit<MessageTemplate, "id" | "created_at">[] = [
  {
    name: "Bienvenue (dès la réservation)",
    trigger: "reservation_confirmee",
    offset_days: 0,
    send_time: "10:00",
    channel: "auto",
    subject: "Votre séjour à {logement} est confirmé",
    body: `Bonjour {prenom},

Merci pour votre réservation, nous sommes ravis de vous accueillir du {arrivee} au {depart} !

Votre livret d'accueil personnalisé est déjà prêt : {lien_livret}
Vous y trouverez l'adresse, l'arrivée autonome, le wifi, nos meilleures adresses du quartier et un assistant qui répond à vos questions 24 h/24.

Les codes d'accès y apparaîtront la veille de votre arrivée. Arrivée à partir de {heure_arrivee}, départ avant {heure_depart}.

À très bientôt,
{signature}

—

Hello {prenom}, thank you for your booking! Your personal guidebook is ready: {lien_livret} (address, self check-in, wifi, local tips and a 24/7 assistant). Access codes will appear the day before you arrive. Check-in from {heure_arrivee}, check-out by {heure_depart}.`,
    active: true,
    position: 1,
  },
  {
    name: "Instructions d'arrivée (veille)",
    trigger: "avant_arrivee",
    offset_days: 1,
    send_time: "10:00",
    channel: "auto",
    subject: "Votre arrivée demain : toutes les infos",
    body: `Bonjour {prenom},

Tout est prêt pour votre arrivée demain !

📍 Adresse : {adresse}
🔑 Accès : {acces}
🚪 Code porte : {code_porte}
📦 Boîte à clés : {code_boite}
📶 Wifi : {wifi} / mot de passe : {mot_de_passe_wifi}

Arrivée à partir de {heure_arrivee}. Vous arrivez plus tôt ? Dites-le-nous depuis votre livret, nous ferons notre possible (arrivée anticipée : {prix_arrivee_anticipee}).

Livret complet et assistant : {lien_livret}

{signature}

—

Hi {prenom}, everything is ready for tomorrow! Address: {adresse}. Access: {acces}. Door code: {code_porte}. Key box: {code_boite}. Wifi: {wifi} / {mot_de_passe_wifi}. Check-in from {heure_arrivee}. Full guide: {lien_livret}`,
    active: true,
    position: 2,
  },
  {
    name: "Tout se passe bien ? (lendemain de l'arrivée)",
    trigger: "lendemain_arrivee",
    offset_days: 0,
    send_time: "11:00",
    channel: "auto",
    subject: "Tout se passe bien ?",
    body: `Bonjour {prenom},

Nous espérons que votre première nuit s'est bien passée !

Si quoi que ce soit ne va pas (équipement, propreté, bruit…), dites-le-nous tout de suite depuis votre livret, nous intervenons rapidement : {lien_livret}

Et pour profiter du quartier, nos adresses du moment sont dans l'onglet « Bons plans ».

{signature}

—

Hi {prenom}, we hope your first night went well! If anything isn't perfect, tell us right away from your guidebook and we'll fix it quickly: {lien_livret}`,
    active: true,
    position: 3,
  },
  {
    name: "Consignes de départ et départ tardif (veille du départ)",
    trigger: "veille_depart",
    offset_days: 0,
    send_time: "18:00",
    channel: "auto",
    subject: "Votre départ demain",
    body: `Bonjour {prenom},

Votre séjour touche à sa fin : le départ est prévu demain avant {heure_depart}.

{consignes_depart}

Envie de profiter un peu plus ? Un départ tardif jusqu'à {heure_depart_tardif} est possible selon disponibilité ({prix_depart_tardif}). Demandez-le en un clic : {lien_livret}

Merci encore et bon retour !
{signature}

—

Hi {prenom}, check-out is tomorrow before {heure_depart}. Want to stay longer? Late check-out until {heure_depart_tardif} may be available ({prix_depart_tardif}) — request it in one click: {lien_livret}`,
    active: true,
    position: 4,
  },
  {
    name: "Merci et demande d'avis (après le départ)",
    trigger: "apres_depart",
    offset_days: 0,
    send_time: "15:00",
    channel: "auto",
    subject: "Merci pour votre séjour",
    body: `Bonjour {prenom},

Merci d'avoir séjourné à {logement} ! Nous espérons que tout était parfait.

Votre avis compte énormément pour nous : si vous avez apprécié votre séjour, quelques mots sur {plateforme} nous aident beaucoup. Et si un détail pouvait être amélioré, répondez simplement à ce message, nous en tiendrons compte.

Au plaisir de vous accueillir à nouveau,
{signature}

—

Thank you for staying at {logement}! If you enjoyed your stay, a review on {plateforme} would mean a lot to us. If anything could be better, just reply to this message.`,
    active: true,
    position: 5,
  },
];
