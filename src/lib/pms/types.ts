// Modèle de données du logiciel de gestion (miroir des tables pms_* de Supabase).

export type Platform = "airbnb" | "booking" | "abritel" | "direct" | "autre";

export const PLATFORMS: Record<Platform, { label: string; color: string }> = {
  airbnb: { label: "Airbnb", color: "#FF5A5F" },
  booking: { label: "Booking.com", color: "#003B95" },
  abritel: { label: "Abritel / Vrbo", color: "#1668E3" },
  direct: { label: "Direct", color: "#213F6C" },
  autre: { label: "Autre", color: "#586474" },
};

export type Condition = "vert" | "orange" | "rouge";

export const CONDITIONS: Record<Condition, { label: string; hint: string; className: string }> = {
  vert: {
    label: "Tout est en ordre",
    hint: "Logement prêt, rien à signaler",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  orange: {
    label: "Petits soucis",
    hint: "Ampoule grillée, disjoncteur, objet abîmé, produit manquant…",
    className: "bg-amber-100 text-amber-800 border-amber-300",
  },
  rouge: {
    label: "Gros problème",
    hint: "Dégât des eaux, casse importante, travaux, logement non louable…",
    className: "bg-red-100 text-red-800 border-red-300",
  },
};

export type ChecklistItem = { label: string; done?: boolean };

export type Guide = {
  access_details?: string | undefined;
  door_code?: string | undefined;
  keybox_code?: string | undefined;
  wifi_name?: string | undefined;
  wifi_password?: string | undefined;
  house_rules?: string | undefined;
  parking?: string | undefined;
  transport?: string | undefined;
  trash?: string | undefined;
  heating?: string | undefined;
  appliances?: string | undefined;
  checkout_instructions?: string | undefined;
  emergency?: string | undefined;
  cleaning_notes?: string | undefined;
  faq?: string | undefined;
  welcome?: string | undefined;
};

export type IcalFeed = {
  platform: Platform;
  url: string;
  last_sync?: string | null | undefined;
  last_status?: string | null | undefined;
};

export type Owner = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  iban: string | null;
  notes: string | null;
  created_at: string;
};

export type Cleaner = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  rate: number;
  token: string;
  active: boolean;
  notes: string | null;
  created_at: string;
};

export type Property = {
  id: string;
  name: string;
  address: string | null;
  arrondissement: string | null;
  owner_id: string | null;
  cleaner_id: string | null;
  photo_url: string | null;
  capacity: number;
  bedrooms: number;
  checkin_time: string;
  checkout_time: string;
  late_checkout_until: string;
  late_checkout_price: number;
  early_checkin_price: number;
  commission_rate: number;
  cleaning_fee: number;
  guide: Guide;
  ical_feeds: IcalFeed[];
  export_token: string;
  /** Lien fixe du livret, à coller dans les messages programmés des plateformes. */
  guest_link_token: string;
  checklist: ChecklistItem[];
  active: boolean;
  created_at: string;
};

export type ReservationStatus = "confirmee" | "annulee" | "bloquee";

export type Reservation = {
  id: string;
  property_id: string;
  platform: Platform;
  external_uid: string | null;
  status: ReservationStatus;
  source: "ical" | "manuel";
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_language: string;
  guests: number;
  check_in: string;
  check_out: string;
  arrival_time: string | null;
  departure_time: string | null;
  amount_gross: number;
  platform_fee: number;
  cleaning_fee: number;
  notes: string | null;
  raw: Record<string, unknown> | null;
  guest_token: string;
  created_at: string;
  updated_at: string;
};

export type TaskStatus = "a_faire" | "en_cours" | "termine";

export type CleaningTask = {
  id: string;
  property_id: string;
  reservation_id: string | null;
  next_reservation_id: string | null;
  cleaner_id: string | null;
  date: string;
  window_start: string | null;
  window_end: string | null;
  next_guests: number | null;
  status: TaskStatus;
  condition: Condition | null;
  report_notes: string | null;
  checklist: ChecklistItem[];
  photos: string[];
  price: number;
  started_at: string | null;
  completed_at: string | null;
  notified_at: string | null;
  created_at: string;
};

export type Incident = {
  id: string;
  property_id: string;
  task_id: string | null;
  reservation_id: string | null;
  severity: "orange" | "rouge";
  title: string;
  description: string | null;
  photos: string[];
  status: "ouvert" | "en_cours" | "resolu";
  reported_by: string | null;
  cost: number;
  billable_to_owner: boolean;
  created_at: string;
  resolved_at: string | null;
};

export type Trigger =
  | "reservation_confirmee"
  | "avant_arrivee"
  | "jour_arrivee"
  | "lendemain_arrivee"
  | "veille_depart"
  | "apres_depart";

export const TRIGGERS: Record<Trigger, { label: string; hint: string }> = {
  reservation_confirmee: {
    label: "Dès la réservation",
    hint: "Envoyé dès que la réservation arrive",
  },
  avant_arrivee: { label: "Avant l'arrivée", hint: "X jours avant l'arrivée" },
  jour_arrivee: { label: "Jour d'arrivée", hint: "Le matin de l'arrivée" },
  lendemain_arrivee: { label: "Lendemain de l'arrivée", hint: "Vérifier que tout va bien" },
  veille_depart: { label: "Veille du départ", hint: "Consignes de départ, départ tardif" },
  apres_depart: { label: "Après le départ", hint: "Remerciement et demande d'avis" },
};

export type MessageTemplate = {
  id: string;
  name: string;
  trigger: Trigger;
  offset_days: number;
  send_time: string;
  channel: "auto" | "email" | "whatsapp" | "plateforme";
  subject: string | null;
  body: string;
  active: boolean;
  position: number;
  created_at: string;
};

export type MessageStatus = "planifie" | "envoye" | "a_copier" | "echec" | "annule" | "recu";

export type Message = {
  id: string;
  reservation_id: string | null;
  template_id: string | null;
  direction: "sortant" | "entrant";
  channel: "email" | "whatsapp" | "plateforme" | "assistant";
  recipient: string | null;
  subject: string | null;
  body: string;
  status: MessageStatus;
  scheduled_for: string | null;
  sent_at: string | null;
  error: string | null;
  created_at: string;
};

export type GuestRequestType =
  "late_checkout" | "early_checkin" | "probleme" | "avis_sejour" | "question" | "autre";

export const REQUEST_TYPES: Record<GuestRequestType, string> = {
  late_checkout: "Départ tardif",
  early_checkin: "Arrivée anticipée",
  probleme: "Problème signalé",
  avis_sejour: "Retour sur le séjour",
  question: "Question",
  autre: "Autre demande",
};

export type GuestRequest = {
  id: string;
  reservation_id: string;
  type: GuestRequestType;
  details: string | null;
  requested_time: string | null;
  price: number | null;
  rating: number | null;
  status: "en_attente" | "accepte" | "refuse" | "traite";
  answer: string | null;
  created_at: string;
};

export const EXPENSE_CATEGORIES = {
  menage: "Ménage",
  linge: "Linge et blanchisserie",
  consommables: "Consommables",
  reparation: "Réparation / maintenance",
  equipement: "Équipement",
  autre: "Autre",
} as const;

export type Expense = {
  id: string;
  property_id: string;
  date: string;
  category: keyof typeof EXPENSE_CATEGORIES;
  label: string;
  amount: number;
  invoice_url: string | null;
  billable_to_owner: boolean;
  created_at: string;
};

export type OwnerReport = {
  id: string;
  owner_id: string | null;
  property_id: string | null;
  month: string;
  data: ReportData;
  status: "brouillon" | "envoye";
  sent_at: string | null;
  created_at: string;
};

export type ReportData = {
  month: string;
  propertyName: string;
  ownerName: string;
  daysInMonth: number;
  nightsBooked: number;
  nightsBlocked: number;
  occupancy: number;
  stays: number;
  adr: number;
  revpar: number;
  gross: number;
  platformFees: number;
  cleaningCollected: number;
  netRevenue: number;
  commissionRate: number;
  commission: number;
  cleaningCost: number;
  expenses: {
    date: string;
    label: string;
    category: string;
    amount: number;
    invoice_url: string | null;
  }[];
  expensesTotal: number;
  ownerPayout: number;
  averageRating: number | null;
  reviewsCount: number;
  incidents: { title: string; severity: string; status: string; cost: number }[];
  reservations: {
    guest: string;
    platform: string;
    check_in: string;
    check_out: string;
    nights: number;
    gross: number;
  }[];
  previous?: { occupancy: number; ownerPayout: number; gross: number } | null | undefined;
};

export type Review = {
  id: string;
  property_id: string;
  reservation_id: string | null;
  platform: Platform;
  rating: number;
  comment: string | null;
  date: string;
  response: string | null;
  created_at: string;
};

export const RECO_CATEGORIES = {
  restaurant: "Restaurants",
  cafe: "Cafés et brunchs",
  bar: "Bars",
  visite: "À visiter",
  balade: "Balades",
  shopping: "Shopping",
  sortie: "Sorties et expos",
  pratique: "Pratique",
} as const;

export type Recommendation = {
  id: string;
  property_id: string | null;
  arrondissement: string | null;
  category: keyof typeof RECO_CATEGORIES;
  name: string;
  description: string | null;
  address: string | null;
  url: string | null;
  tip: string | null;
  price_level: string | null;
  trending: boolean;
  source: string | null;
  active: boolean;
  created_at: string;
};

export type Settings = {
  company_name: string;
  email: string;
  phone: string;
  signature: string;
  default_commission: number;
  auto_send: boolean;
  auto_reports: boolean;
  alert_email: string;
  review_reminder: boolean;
  /** Comptes des plateformes (identifiants de connexion uniquement, jamais de mot de passe). */
  accounts?:
    | Partial<
        Record<
          "airbnb" | "booking" | "abritel" | "channel_manager",
          {
            login?: string | undefined;
            notes?: string | undefined;
            connected?: boolean | undefined;
          }
        >
      >
    | undefined;
  last_run?: string | null | undefined;
  templates_seeded?: boolean | undefined;
  last_reports_month?: string | null | undefined;
};

/** Question où l'assistant avait un doute, validée ou corrigée par le gérant. */
export type EscalationRow = {
  id: string;
  reservation_id: string;
  question: string;
  proposed_answer: string | null;
  final_answer: string | null;
  reason: string | null;
  status: "en_attente" | "valide" | "modifie";
  token: string;
  created_at: string;
  answered_at: string | null;
};

export type SettingsRow = { id: string; data: Partial<Settings>; updated_at: string };

export type Tables = {
  pms_settings: SettingsRow;
  pms_owners: Owner;
  pms_cleaners: Cleaner;
  pms_properties: Property;
  pms_reservations: Reservation;
  pms_cleaning_tasks: CleaningTask;
  pms_incidents: Incident;
  pms_message_templates: MessageTemplate;
  pms_messages: Message;
  pms_guest_requests: GuestRequest;
  pms_expenses: Expense;
  pms_owner_reports: OwnerReport;
  pms_reviews: Review;
  pms_recommendations: Recommendation;
  pms_escalations: EscalationRow;
};

export type TableName = keyof Tables;

export const TABLES = [
  "pms_settings",
  "pms_owners",
  "pms_cleaners",
  "pms_properties",
  "pms_reservations",
  "pms_cleaning_tasks",
  "pms_incidents",
  "pms_message_templates",
  "pms_messages",
  "pms_guest_requests",
  "pms_expenses",
  "pms_owner_reports",
  "pms_reviews",
  "pms_recommendations",
  "pms_escalations",
] as const satisfies readonly TableName[];

// Données publiques renvoyées au livret voyageur et au portail ménage.

export type StayView = {
  reservation: Pick<
    Reservation,
    | "id"
    | "guest_name"
    | "guests"
    | "check_in"
    | "check_out"
    | "platform"
    | "arrival_time"
    | "departure_time"
  > & { language: string };
  property: Pick<
    Property,
    | "id"
    | "name"
    | "address"
    | "arrondissement"
    | "photo_url"
    | "checkin_time"
    | "checkout_time"
    | "late_checkout_until"
    | "late_checkout_price"
    | "early_checkin_price"
    | "guide"
  >;
  codes_visible: boolean;
  recommendations: Recommendation[];
  requests: Pick<
    GuestRequest,
    "id" | "type" | "status" | "requested_time" | "price" | "answer" | "created_at"
  >[];
};

export type CleanerTaskView = {
  task: CleaningTask;
  property: Pick<
    Property,
    "id" | "name" | "address" | "photo_url" | "checklist" | "bedrooms" | "capacity"
  > & {
    access: Pick<
      Guide,
      "door_code" | "keybox_code" | "access_details" | "cleaning_notes" | "trash"
    >;
  };
  reservation: Pick<
    Reservation,
    "check_in" | "check_out" | "guests" | "platform" | "departure_time"
  > | null;
  next: Pick<Reservation, "check_in" | "check_out" | "guests" | "arrival_time" | "notes"> | null;
};

export type CleanerView = {
  cleaner: Pick<Cleaner, "id" | "name" | "company">;
  tasks: CleanerTaskView[];
};
