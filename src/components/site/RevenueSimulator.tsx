import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ChevronDown,
  Loader2,
  Lock,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { CITIES } from "@/content/site";
import { MARKET_PARIS, type MarketCell } from "@/content/market-paris";
import { submitLead } from "@/lib/leads";

// Paris : prix médians réels par arrondissement, secteur et taille, sur les 12 derniers relevés
// mensuels Inside Airbnb, avec la saisonnalité mois par mois et la tendance sur un an.
// Proche banlieue : pas de données publiques, on applique le niveau de prix indicatif de la
// ville aux médianes parisiennes. Hors zone : données Inside Airbnb de Lyon, Bordeaux et du Pays
// basque ; ailleurs, étude personnalisée.

const ARRONDISSEMENT_NAMES = [
  "Louvre",
  "Bourse",
  "Marais nord",
  "Marais sud – Hôtel de Ville",
  "Panthéon",
  "Saint-Germain",
  "Invalides",
  "Champs-Élysées",
  "Opéra",
  "Canal Saint-Martin",
  "Bastille",
  "Bercy",
  "Butte-aux-Cailles",
  "Montparnasse",
  "Vaugirard",
  "Passy – Trocadéro",
  "Batignolles",
  "Montmartre",
  "Buttes-Chaumont",
  "Belleville",
];

const SECTORS = [
  { id: "", label: "Tout l'arrondissement" },
  { id: "nord", label: "Nord" },
  { id: "sud", label: "Sud" },
  { id: "est", label: "Est" },
  { id: "ouest", label: "Ouest" },
] as const;
type Sector = (typeof SECTORS)[number]["id"];

const SUBURBS = CITIES.filter((c) => c.slug !== "paris");
const PARIS_PRICE_LEVEL = CITIES.find((c) => c.slug === "paris")?.nightlyBase ?? 115;
const OUT_OF_ZONE = "hors-zone";

const PROPERTY_TYPES = [
  { label: "Studio", bedrooms: 0, surface: 25, guests: 2, factor: 1 },
  { label: "2 pièces", bedrooms: 1, surface: 40, guests: 4, factor: 1 },
  { label: "3 pièces", bedrooms: 2, surface: 60, guests: 5, factor: 1 },
  { label: "4 pièces ou plus", bedrooms: 3, surface: 85, guests: 7, factor: 1 },
  { label: "Maison", bedrooms: 3, surface: 100, guests: 7, factor: 1.05 },
  { label: "Loft", bedrooms: 1, surface: 70, guests: 4, factor: 1.1 },
];

// Surface typique de chaque tranche (studio, 1, 2, 3 chambres et plus) : le prix évolue avec
// l'écart à cette surface (élasticité 0,35 : +10 % de surface ≈ +3,4 % de prix par nuit).
const TYPICAL_SURFACE = [25, 40, 60, 85];
const SURFACE_ELASTICITY = 0.35;
const MAX_SURFACE = 250;

const AMENITIES = [
  { id: "balcon", label: "Balcon ou terrasse", bonus: 0.05 },
  { id: "clim", label: "Climatisation", bonus: 0.05 },
  { id: "vue", label: "Belle vue", bonus: 0.06 },
  { id: "ascenseur", label: "Ascenseur", bonus: 0.02 },
  { id: "parking", label: "Parking", bonus: 0.04 },
  { id: "jardin", label: "Jardin", bonus: 0.06 },
];

const PLATFORM_FEE = 0.15;
const COMMISSION = 0.2;
const MAX_DAYS = 731;
const UNLOCK_KEY = "spinelle-simulateur-contact";

const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

// Espace insécable avant « % » : le symbole ne passe jamais seul à la ligne.
const pct = (n: number) => `${Math.round(n * 100)}\u00a0%`;
const signedPct = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${pct(Math.abs(n))}`;
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromIso = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const longDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

type Bucket = "0" | "1" | "2" | "3";
type Month = keyof typeof MARKET_PARIS.seasonality;
type CityData = {
  label: string;
  snapshot: string;
  listings: number;
  areas: readonly string[];
  buckets: Record<Bucket, MarketCell>;
};
const OTHER_CITIES =
  (MARKET_PARIS as unknown as { cities?: Record<string, CityData> }).cities ?? {};

/** Retrouve une ville suivie par Inside Airbnb à partir de la saisie libre du prospect. */
function matchCity(input: string): CityData | null {
  const q = normalize(input);
  if (q.length < 3) return null;
  const padded = ` ${q} `;
  for (const city of Object.values(OTHER_CITIES)) {
    // Noms génériques (« 1er Arrondissement ») exclus : ils existent aussi à Paris.
    const names = [city.label, ...city.areas.filter((a) => !/arrondissement/i.test(a))]
      .map(normalize)
      .filter((n) => n.length >= 4);
    // Mot entier uniquement ; une saisie partielle (« lyo ») ne vaut que pour le nom principal.
    if (names.some((n) => padded.includes(` ${n} `))) return city;
    if (q.length >= 3 && normalize(city.label).startsWith(q)) return city;
  }
  return null;
}

type Market = {
  cell: MarketCell;
  source: "quartier" | "arrondissement" | "banlieue" | "ville";
  trend: number | null;
  seasonal: boolean;
  label: string;
};

function marketFor(
  location: string,
  sector: Sector,
  outOfZone: CityData | null,
  bucket: Bucket,
): Market | null {
  if (location === OUT_OF_ZONE) {
    if (!outOfZone) return null;
    return {
      cell: outOfZone.buckets[bucket],
      source: "ville",
      trend: null,
      seasonal: false,
      label: outOfZone.label,
    };
  }
  if (location.startsWith("paris-")) {
    const arr = location.slice(6) as keyof typeof MARKET_PARIS.arrondissements;
    const area = MARKET_PARIS.arrondissements[arr] as unknown as {
      priceTrend: number | null;
      sectors?: Record<string, { index: number; sample: number }>;
      buckets: Record<Bucket, MarketCell>;
    };
    const base = area.buckets[bucket];
    const index = sector ? (area.sectors?.[sector]?.index ?? 1) : 1;
    const n = Number(arr);
    return {
      cell: { ...base, price: Math.round(base.price * index) },
      source: base.estimated ? "arrondissement" : "quartier",
      trend: area.priceTrend,
      seasonal: true,
      label: `Paris ${n}${n === 1 ? "er" : "e"}${sector ? ` (${sector})` : ""}`,
    };
  }
  const city = SUBURBS.find((c) => c.slug === location);
  const ref: MarketCell = MARKET_PARIS.paris[bucket];
  const level = (city?.nightlyBase ?? PARIS_PRICE_LEVEL) / PARIS_PRICE_LEVEL;
  return {
    cell: { ...ref, price: Math.round(ref.price * level), sample: 0 },
    source: "banlieue",
    trend: (MARKET_PARIS.parisTrend as { price: number } | null)?.price ?? null,
    seasonal: true,
    label: city?.name ?? "",
  };
}

// Écart de prix lié au nombre de voyageurs, mesuré sur les annonces réelles de la même tranche.
function capacityRatio(bucket: Bucket, guests: number) {
  const ratios = MARKET_PARIS.capacity[bucket] as Record<string, number>;
  const available = Object.keys(ratios).map(Number);
  if (!available.length) return 1;
  const nearest = available.reduce((a, b) => (Math.abs(b - guests) < Math.abs(a - guests) ? b : a));
  return ratios[String(nearest)] ?? 1;
}

type Contact = { full_name: string; email: string; phone: string };

function readContact(): Contact | null {
  try {
    const raw = window.localStorage.getItem(UNLOCK_KEY);
    return raw ? (JSON.parse(raw) as Contact) : null;
  } catch {
    return null;
  }
}

export function RevenueSimulator() {
  const tomorrow = useMemo(() => addDays(new Date(), 1), []);
  const [location, setLocation] = useState("paris-11");
  const [sector, setSector] = useState<Sector>("");
  const [outOfZoneText, setOutOfZoneText] = useState("");
  const [typeIndex, setTypeIndex] = useState(1);
  const [surface, setSurface] = useState(40);
  const [guests, setGuests] = useState(4);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [start, setStart] = useState(toIso(tomorrow));
  const [end, setEnd] = useState(toIso(addDays(tomorrow, 364)));
  // null = médiane du secteur (aucune promesse d'occupation) ; sinon valeur choisie au curseur.
  const [customOccupancy, setCustomOccupancy] = useState<number | null>(null);
  const [showMonths, setShowMonths] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => setContact(readContact()), []);

  const tooLarge = surface > MAX_SURFACE;
  const bucket = String(Math.min(bedrooms, 3)) as Bucket;
  const outOfZone = useMemo(() => matchCity(outOfZoneText), [outOfZoneText]);
  const market = useMemo(
    () => marketFor(location, sector, outOfZone, bucket),
    [location, sector, outOfZone, bucket],
  );
  const occupancy = customOccupancy ?? market?.cell.occupancy ?? 0.4;

  const startDate = fromIso(start);
  const endDate = fromIso(end);
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
  const periodError =
    !start || !end || totalDays < 1
      ? "La date de fin doit suivre la date de début."
      : totalDays > MAX_DAYS
        ? "La période est limitée à deux ans."
        : null;

  const result = useMemo(() => {
    if (!market || periodError) return null;
    const type = PROPERTY_TYPES[typeIndex]!;
    const amenityBonus = AMENITIES.filter((a) => amenities.includes(a.id)).reduce(
      (sum, a) => sum + a.bonus,
      0,
    );
    const surfaceFactor =
      (Math.min(surface, MAX_SURFACE) / TYPICAL_SURFACE[Number(bucket)]!) ** SURFACE_ELASTICITY;
    const extraRooms = Math.max(0, bedrooms - 3) * 0.08 + Math.max(0, bathrooms - 1) * 0.05;
    // Prix moyen annuel d'une nuit pour ce bien, avant saisonnalité.
    const base =
      market.cell.price *
      capacityRatio(bucket, guests) *
      surfaceFactor *
      type.factor *
      (1 + amenityBonus + extraRooms);

    // Découpage de la période en mois calendaires (le premier et le dernier peuvent être partiels).
    const segments: { date: Date; days: number }[] = [];
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      const last = segments.at(-1);
      if (
        last &&
        last.date.getMonth() === d.getMonth() &&
        last.date.getFullYear() === d.getFullYear()
      )
        last.days += 1;
      else segments.push({ date: d, days: 1 });
    }

    // Chaque mois : nuits entières × prix du mois. Une nuit de plus ajoute exactement ce prix.
    const months = segments.map(({ date, days }) => {
      const season = market.seasonal
        ? MARKET_PARIS.seasonality[String(date.getMonth() + 1) as Month]
        : { price: 1, occupancy: 1 };
      const rate = Math.min(0.97, Math.max(0.02, occupancy * season.occupancy));
      const price = Math.round(base * season.price);
      const nights = Math.round(days * rate);
      return { date, days, nights, price, gross: nights * price };
    });

    const days = months.reduce((s, m) => s + m.days, 0);
    const nights = months.reduce((s, m) => s + m.nights, 0);
    const gross = months.reduce((s, m) => s + m.gross, 0);
    const fees = Math.round(gross * PLATFORM_FEE);
    const commission = Math.round(gross * COMMISSION);
    const net = gross - fees - commission;
    return {
      months,
      days,
      nights,
      gross,
      fees,
      commission,
      net,
      perMonth: Math.round((net / days) * 30.44),
      averagePrice: nights ? Math.round(gross / nights) : 0,
    };
    // startDate/endDate sont dérivés de start/end.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    market,
    periodError,
    bucket,
    typeIndex,
    surface,
    guests,
    bedrooms,
    bathrooms,
    amenities,
    occupancy,
    start,
    end,
  ]);

  const toggleAmenity = (id: string) =>
    setAmenities((list) => (list.includes(id) ? list.filter((a) => a !== id) : [...list, id]));

  const presets = market
    ? [
        { label: "Médiane", hint: "du secteur", value: market.cell.occupancy },
        { label: "Top 25 %", hint: "les plus louées", value: market.cell.occupancyTop },
        { label: "Élevée", hint: "calendrier rempli", value: 0.85 },
      ]
    : [];

  const peakMonth = useMemo(() => {
    const [m] = Object.entries(MARKET_PARIS.seasonality).reduce((a, b) =>
      b[1].price * b[1].occupancy > a[1].price * a[1].occupancy ? b : a,
    );
    return new Date(2000, Number(m) - 1, 1).toLocaleDateString("fr-FR", { month: "long" });
  }, []);

  const locationLabel =
    location === OUT_OF_ZONE
      ? `Hors zone : ${outOfZoneText || "non précisé"}`
      : location.startsWith("paris-")
        ? `Paris ${location.slice(6)}${location === "paris-1" ? "er" : "e"} – ${ARRONDISSEMENT_NAMES[Number(location.slice(6)) - 1]}${sector ? `, secteur ${sector}` : ""}`
        : (SUBURBS.find((c) => c.slug === location)?.name ?? "");

  // Résumé envoyé avec la demande : tout ce que le prospect a saisi et le résultat obtenu.
  const summary = () =>
    [
      `Localisation : ${locationLabel}`,
      `Bien : ${PROPERTY_TYPES[typeIndex]!.label}, ${tooLarge ? `plus de ${MAX_SURFACE}` : surface} m², ${guests} voyageurs, ${bedrooms} chambre(s), ${bathrooms} salle(s) de bain`,
      `Équipements : ${
        amenities.length
          ? AMENITIES.filter((a) => amenities.includes(a.id))
              .map((a) => a.label)
              .join(", ")
          : "aucun"
      }`,
      `Période : du ${longDate(startDate)} au ${longDate(endDate)}`,
      `Occupation choisie : ${pct(occupancy)}`,
      result
        ? `Estimation : ${euros(result.net)} net (${euros(result.gross)} brut, ${result.nights} nuits, ${euros(result.averagePrice)} / nuit)`
        : "Estimation : étude personnalisée demandée",
    ].join("\n");

  const needsStudy = tooLarge || (location === OUT_OF_ZONE && !market);

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-soft)] lg:grid-cols-[1.2fr_1fr]">
      {/* Paramètres */}
      <div className="divide-y divide-border">
        <Step number="01" title="Localisation">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Zone">
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setSector("");
                  setCustomOccupancy(null);
                }}
                className="field-input"
              >
                <optgroup label="Paris">
                  {ARRONDISSEMENT_NAMES.map((name, i) => (
                    <option key={name} value={`paris-${i + 1}`}>
                      Paris {i + 1}
                      {i === 0 ? "er" : "e"} – {name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Proche banlieue">
                  {SUBURBS.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Ailleurs">
                  <option value={OUT_OF_ZONE}>Hors zone (autre ville ou région)</option>
                </optgroup>
              </select>
            </Field>
            {location.startsWith("paris-") && (
              <Field label="Secteur de l'arrondissement">
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as Sector)}
                  className="field-input"
                >
                  {SECTORS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {location === OUT_OF_ZONE && (
              <Field label="Ville ou région du bien">
                <input
                  value={outOfZoneText}
                  onChange={(e) => {
                    setOutOfZoneText(e.target.value);
                    setCustomOccupancy(null);
                  }}
                  maxLength={80}
                  placeholder="Ex. Lyon, Biarritz, Bordeaux…"
                  className="field-input"
                />
              </Field>
            )}
          </div>
          {location === OUT_OF_ZONE && outOfZoneText.trim().length >= 3 && (
            <p className="mt-3 text-sm text-muted-foreground">
              {outOfZone
                ? `Estimation calculée avec les données réelles du secteur ${outOfZone.label} (${outOfZone.listings.toLocaleString("fr-FR")} logements actifs).`
                : "Pas encore de données publiques pour ce secteur : nous vous préparons une étude personnalisée."}
            </p>
          )}
        </Step>

        <Step number="02" title="Votre bien">
          <Field label="Type de bien">
            <select
              value={typeIndex}
              onChange={(e) => {
                const i = Number(e.target.value);
                const t = PROPERTY_TYPES[i]!;
                setTypeIndex(i);
                setSurface(t.surface);
                setBedrooms(t.bedrooms);
                setGuests(t.guests);
                setCustomOccupancy(null);
              }}
              className="field-input"
            >
              {PROPERTY_TYPES.map((t, i) => (
                <option key={t.label} value={i}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stepper
              label="Surface"
              unit="m²"
              value={surface}
              display={tooLarge ? `+${MAX_SURFACE}` : String(surface)}
              onChange={setSurface}
              min={10}
              max={MAX_SURFACE + 5}
              step={5}
            />
            <Stepper label="Voyageurs" value={guests} onChange={setGuests} min={1} max={10} />
            <Stepper
              label="Chambres"
              value={bedrooms}
              display={bedrooms === 0 ? "Studio" : String(bedrooms)}
              onChange={(v) => {
                setBedrooms(v);
                setCustomOccupancy(null);
              }}
              min={0}
              max={6}
            />
            <Stepper
              label="Salles de bain"
              value={bathrooms}
              onChange={setBathrooms}
              min={1}
              max={5}
            />
          </div>

          <p className="mt-5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Équipements <span className="font-normal normal-case">(optionnels)</span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AMENITIES.map((a) => {
              const active = amenities.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleAmenity(a.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </Step>

        <Step number="03" title="Période de location">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Du">
              <input
                type="date"
                value={start}
                min={toIso(tomorrow)}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (e.target.value && end < e.target.value) setEnd(e.target.value);
                }}
                className="field-input"
              />
            </Field>
            <Field label="Au">
              <input
                type="date"
                value={end}
                min={start}
                max={toIso(addDays(fromIso(start || toIso(tomorrow)), MAX_DAYS - 1))}
                onChange={(e) => setEnd(e.target.value)}
                className="field-input"
              />
            </Field>
          </div>
          <p
            className={`mt-3 text-sm ${periodError ? "text-destructive" : "text-muted-foreground"}`}
          >
            {periodError ??
              `${totalDays} nuits disponibles. Prix et remplissage suivent la saisonnalité réelle de chaque mois.`}
          </p>
        </Step>

        {market && (
          <Step number="04" title="Taux d'occupation moyen">
            <div className="flex items-end justify-between gap-4">
              <label htmlFor="occupancy" className="text-sm text-muted-foreground">
                Part des nuits louées sur l'année, ajustée ensuite mois par mois selon la saison.
              </label>
              <span className="font-[family-name:var(--font-display)] text-3xl text-primary tabular-nums">
                {pct(occupancy)}
              </span>
            </div>
            <input
              id="occupancy"
              type="range"
              min={10}
              max={95}
              step={1}
              value={Math.round(occupancy * 100)}
              onChange={(e) => setCustomOccupancy(Number(e.target.value) / 100)}
              className="mt-3 w-full accent-[var(--primary)]"
            />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {presets.map((p) => {
                const active = Math.round(occupancy * 100) === Math.round(p.value * 100);
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setCustomOccupancy(p.value)}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      active ? "border-primary bg-primary/10" : "border-border hover:border-primary"
                    }`}
                  >
                    <span className="block text-xs font-semibold tracking-wide uppercase">
                      {p.label}
                    </span>
                    <span className="mt-0.5 block text-lg font-semibold text-primary tabular-nums">
                      {pct(p.value)}
                    </span>
                    <span className="block text-xs text-muted-foreground">{p.hint}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Nous ne promettons pas de taux d'occupation&nbsp;: il dépend de la saison et du
              marché. Notre engagement est de tout mettre en œuvre pour le maximiser grâce à une
              gestion professionnelle.
            </p>
          </Step>
        )}
      </div>

      {/* Résultat */}
      <div className="flex flex-col bg-[var(--ink)] p-6 text-white sm:p-8">
        {!contact ? (
          <ContactGate
            needsStudy={needsStudy}
            onUnlock={async (c) => {
              const { ok } = await submitLead({
                ...c,
                source: "simulateur",
                property_type: PROPERTY_TYPES[typeIndex]!.label,
                bedrooms: String(bedrooms),
                surface: tooLarge ? `+${MAX_SURFACE}` : String(surface),
                district: locationLabel,
                city:
                  location === OUT_OF_ZONE
                    ? outOfZoneText
                    : location.startsWith("paris-")
                      ? "Paris"
                      : locationLabel,
                message: summary(),
              });
              if (!ok) return false;
              try {
                window.localStorage.setItem(UNLOCK_KEY, JSON.stringify(c));
              } catch {
                // Navigation privée : le résultat reste affiché pour cette visite.
              }
              setContact(c);
              return true;
            }}
          />
        ) : needsStudy ? (
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">
              {tooLarge ? `Bien de plus de ${MAX_SURFACE}\u00a0m²` : "Bien hors zone"}
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl">
              {tooLarge
                ? "Un bien d'exception mérite une étude sur mesure"
                : "Votre secteur mérite une étude sur mesure"}
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-white/75">
              {tooLarge
                ? `Au-delà de ${MAX_SURFACE}\u00a0m², les logements comparables sont trop rares pour une estimation automatique fiable.`
                : "Nous ne disposons pas encore de données publiques fiables pour ce secteur."}{" "}
              Décrivez votre bien dans le formulaire&nbsp;: nous vous adressons sous 24&nbsp;h une
              étude personnalisée.
            </p>
            <a href="#estimation" className="btn-primary mt-8 w-full">
              Demander une étude personnalisée <ArrowRight className="size-4" />
            </a>
          </div>
        ) : !result ? (
          <div className="flex flex-1 items-center justify-center text-center text-white/70">
            Choisissez une période valide pour afficher l'estimation.
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">
              Revenu net estimé
            </p>
            <p className="mt-1 text-sm text-white/70">
              Du {longDate(startDate)} au {longDate(endDate)}
            </p>
            <p
              className="mt-3 font-[family-name:var(--font-display)] text-5xl tabular-nums"
              aria-live="polite"
            >
              {euros(result.net)}
            </p>
            <p className="mt-1 text-sm text-white/70">
              soit {euros(result.perMonth)} par mois en moyenne
            </p>

            <dl className="mt-7 border-t border-white/15 text-sm">
              <Line
                label="Nuits louées"
                value={`${result.nights} sur ${result.days}`}
                hint={`occupation ${pct(result.nights / result.days)}`}
              />
              <Line
                label="Prix moyen par nuit"
                value={euros(result.averagePrice)}
                hint={market?.seasonal ? "selon la saison" : undefined}
              />
              <Line label="Revenu locatif brut" value={euros(result.gross)} strong />
              <Line label="Commission plateforme (15 %)" value={`− ${euros(result.fees)}`} />
              <Line label="Commission Spinelle (20 %)" value={`− ${euros(result.commission)}`} />
              <Line label="Revenu net pour vous" value={euros(result.net)} strong />
            </dl>

            <button
              type="button"
              onClick={() => setShowMonths((v) => !v)}
              aria-expanded={showMonths}
              className="mt-4 flex items-center justify-between rounded-lg border border-white/15 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
            >
              Détail mois par mois
              <ChevronDown
                className={`size-4 transition-transform ${showMonths ? "rotate-180" : ""}`}
              />
            </button>
            {showMonths && (
              <table className="mt-3 w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-left text-xs text-white/50 uppercase">
                    <th className="py-1.5 font-medium">Mois</th>
                    <th className="py-1.5 text-right font-medium">Nuits</th>
                    <th className="py-1.5 text-right font-medium">Prix / nuit</th>
                    <th className="py-1.5 text-right font-medium">Brut</th>
                  </tr>
                </thead>
                <tbody>
                  {result.months.map((m) => (
                    <tr key={m.date.toISOString()} className="border-t border-white/10">
                      <td className="py-1.5 capitalize">
                        {m.date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                        <span className="ml-1.5 text-xs text-white/45">
                          {m.nights}/{m.days}
                        </span>
                      </td>
                      <td className="py-1.5 text-right">{m.nights}</td>
                      <td className="py-1.5 text-right">{euros(m.price)}</td>
                      <td className="py-1.5 text-right">{euros(m.gross)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/30 font-semibold">
                    <td className="py-1.5">Total</td>
                    <td className="py-1.5 text-right">{result.nights}</td>
                    <td />
                    <td className="py-1.5 text-right">{euros(result.gross)}</td>
                  </tr>
                </tbody>
              </table>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-white/55">Prix médian du secteur</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {euros(market!.cell.price)} / nuit
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                {market!.trend === null ? (
                  <>
                    <p className="text-xs text-white/55">Mois le plus demandé</p>
                    <p className="mt-1 font-semibold capitalize">
                      {market!.seasonal ? peakMonth : "—"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-white/55">Évolution des prix sur 12 mois</p>
                    <p className="mt-1 flex items-center gap-1.5 font-semibold tabular-nums">
                      {market!.trend >= 0 ? (
                        <TrendingUp className="size-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="size-4 text-amber-400" />
                      )}
                      {signedPct(market!.trend)}
                    </p>
                  </>
                )}
              </div>
            </div>

            <a href="#estimation" className="btn-primary mt-6 w-full">
              Obtenir une estimation précise <ArrowRight className="size-4" />
            </a>

            <p className="mt-5 text-xs leading-relaxed text-white/50">
              {market!.source === "quartier"
                ? `Prix médian de ${market!.cell.sample} logements comparables actifs dans cet arrondissement sur Airbnb, ajusté au secteur choisi. `
                : market!.source === "arrondissement"
                  ? "Peu d'annonces comparables dans cet arrondissement : prix déduit des médianes parisiennes et du niveau de prix local. "
                  : market!.source === "ville"
                    ? `Prix médian de ${market!.cell.sample} logements comparables actifs dans le secteur ${market!.label}. `
                    : "Hors Paris, estimation à partir des médianes parisiennes ajustées au niveau de prix de la ville. "}
              Données{" "}
              <a href={MARKET_PARIS.sourceUrl} target="_blank" rel="noopener" className="underline">
                Inside Airbnb
              </a>{" "}
              ({MARKET_PARIS.license}), {MARKET_PARIS.snapshots.length} relevés mensuels jusqu'au{" "}
              {new Date(MARKET_PARIS.snapshot).toLocaleDateString("fr-FR")}, actualisées chaque
              mois. Estimation indicative et non contractuelle. Pour une résidence principale, le
              nombre de nuits louables par an est plafonné.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ContactGate({
  needsStudy,
  onUnlock,
}: {
  needsStudy: boolean;
  onUnlock: (c: Contact) => Promise<boolean>;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-1 flex-col justify-center"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const c = {
          full_name: String(f.get("full_name") ?? "").trim(),
          email: String(f.get("email") ?? "").trim(),
          phone: String(f.get("phone") ?? "").trim(),
        };
        if (c.full_name.length < 2) return setError("Merci d'indiquer votre nom.");
        if (!/^\S+@\S+\.\S+$/.test(c.email)) return setError("Adresse email invalide.");
        if (c.phone.replace(/\D/g, "").length < 9) return setError("Numéro de téléphone invalide.");
        setError(null);
        setSending(true);
        const ok = await onUnlock(c);
        setSending(false);
        if (!ok) setError("L'envoi a échoué. Merci de réessayer dans un instant.");
      }}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-white/10">
        <Lock className="size-5 text-[oklch(0.8_0.09_45)]" />
      </span>
      <p className="mt-5 font-[family-name:var(--font-display)] text-3xl">
        {needsStudy ? "Recevez votre étude personnalisée" : "Votre estimation est prête"}
      </p>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-white/70">
        Indiquez vos coordonnées pour afficher le détail des revenus, mois par mois. Un conseiller
        pourra vous recontacter pour affiner l'estimation.
      </p>
      <div className="mt-6 space-y-3">
        <DarkInput name="full_name" label="Nom et prénom" autoComplete="name" />
        <DarkInput name="email" label="Email" type="email" autoComplete="email" />
        <DarkInput name="phone" label="Téléphone" type="tel" autoComplete="tel" />
      </div>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={sending} className="btn-primary mt-6 w-full">
        {sending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Envoi…
          </>
        ) : (
          <>
            Afficher mon estimation <ArrowRight className="size-4" />
          </>
        )}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-white/50">
        Vos coordonnées servent uniquement à vous recontacter au sujet de votre bien. Elles ne sont
        jamais transmises à des tiers.{" "}
        <a href="/confidentialite" className="underline">
          En savoir plus
        </a>
      </p>
    </form>
  );
}

function DarkInput({
  name,
  label,
  type = "text",
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">{label}</span>
      <input
        name={name}
        type={type}
        required
        maxLength={type === "email" ? 255 : 100}
        autoComplete={autoComplete}
        className="mt-1.5 w-full rounded-[var(--radius)] border border-white/20 bg-white/5 px-3.5 py-2.5 text-white outline-none transition-colors placeholder:text-white/40 focus:border-[oklch(0.8_0.09_45)]"
      />
    </label>
  );
}

function Step({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="p-6 sm:p-8">
      <h3 className="flex items-baseline gap-3 font-[family-name:var(--font-sans)] text-base font-semibold tracking-normal">
        <span className="text-sm text-primary tabular-nums">{number}</span>
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Line({
  label,
  value,
  hint,
  strong = false,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 border-b border-white/15 py-2.5 ${
        strong ? "font-semibold text-white" : "text-white/80"
      }`}
    >
      <dt>
        {label}
        {hint && <span className="ml-2 text-xs font-normal text-white/50">{hint}</span>}
      </dt>
      <dd className="whitespace-nowrap tabular-nums">{value}</dd>
    </div>
  );
}

function Stepper({
  label,
  unit,
  value,
  display,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  unit?: string;
  value: number;
  display?: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-2 flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label={`Diminuer : ${label}`}
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="flex size-7 items-center justify-center rounded-md border border-border transition-colors hover:border-primary disabled:opacity-40"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="text-center font-semibold whitespace-nowrap tabular-nums">
          {display ?? value}
          {unit && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>}
        </span>
        <button
          type="button"
          aria-label={`Augmenter : ${label}`}
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="flex size-7 items-center justify-center rounded-md border border-border transition-colors hover:border-primary disabled:opacity-40"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
