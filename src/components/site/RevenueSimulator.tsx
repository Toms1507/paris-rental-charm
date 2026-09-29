import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Minus, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { CITIES } from "@/content/site";
import { MARKET_PARIS, type MarketCell } from "@/content/market-paris";

// Paris : prix médians réels par arrondissement, secteur et taille, sur les 12 derniers relevés
// mensuels Inside Airbnb, avec la saisonnalité mois par mois et la tendance sur un an.
// Hors zone : mêmes données pour Lyon, Bordeaux et le Pays basque. Proche banlieue et autres
// villes : aucune donnée publique fiable, donc étude personnalisée plutôt qu'un chiffre inventé.
// Tous les coefficients (capacité, type de bien, salles de bain, chambres, équipements) sont
// mesurés sur les annonces réelles et recalculés à chaque mise à jour des données.

const SECTORS = [
  { id: "", label: "Tout l'arrondissement" },
  { id: "nord", label: "Nord" },
  { id: "sud", label: "Sud" },
  { id: "est", label: "Est" },
  { id: "ouest", label: "Ouest" },
] as const;
type Sector = (typeof SECTORS)[number]["id"];

const SUBURBS = CITIES.filter((c) => c.slug !== "paris");
const OUT_OF_ZONE = "hors-zone";

// Type de bien : valeurs par défaut à la sélection ; l'effet sur le prix et l'occupation vient
// des données (lofts et maisons comparés aux appartements, à arrondissement et taille égaux).
const PROPERTY_TYPES = [
  { label: "Studio", kind: "appartement", bedrooms: 0, guests: 2 },
  { label: "Appartement", kind: "appartement", bedrooms: 1, guests: 3 },
  { label: "Maison", kind: "maison", bedrooms: 3, guests: 6 },
  { label: "Loft", kind: "loft", bedrooms: 1, guests: 3 },
] as const;

// Capacité d'accueil la plus courante selon le nombre de chambres (médiane observée sur les
// annonces parisiennes) : proposée par défaut quand le nombre de chambres change.
const TYPICAL_GUESTS = [2, 3, 4, 6, 8];

// Au-delà, les logements comparables sont trop rares : étude personnalisée.
const MAX_BEDROOMS = 4;
const MAX_GUESTS = 10;

const AMENITIES = [
  { id: "balcon", label: "Balcon ou terrasse" },
  { id: "clim", label: "Climatisation" },
  { id: "vue", label: "Belle vue" },
  { id: "ascenseur", label: "Ascenseur" },
  { id: "parking", label: "Parking" },
  { id: "jardin", label: "Jardin" },
];

// Effet de chaque équipement sur le prix et l'occupation, mesuré chaque mois sur les annonces
// parisiennes à arrondissement et taille égaux (effets positifs uniquement, plafonnés).
type Effect = { price: number; occupancy: number };
const EFFECTS = MARKET_PARIS as unknown as {
  amenities?: Record<string, Effect>;
  propertyKinds?: Record<string, Effect>;
  bathrooms?: Record<string, Effect>;
  extraBedrooms?: Record<string, Effect>;
};
const NEUTRAL: Effect = { price: 1, occupancy: 1 };
const AMENITY_EFFECTS = EFFECTS.amenities ?? {};

// Taux d'occupation maximal retenu, même en haute saison : un logement n'est jamais plein à 100 %.
const MAX_OCCUPANCY = 0.92;

const PLATFORM_FEE = 0.15;
const COMMISSION = 0.2;

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

type Bucket = "0" | "1" | "2" | "3";
const BUCKETS: Bucket[] = ["0", "1", "2", "3"];

// Règle de cohérence : un logement plus grand, bien géré, peut atteindre au moins l'occupation
// d'un logement plus petit du même secteur. Son prix par nuit étant plus élevé, son revenu estimé
// n'est jamais inférieur à celui d'un logement plus petit.
function occupancyFloor(buckets: Partial<Record<Bucket, MarketCell>>, bucket: Bucket) {
  return Math.max(
    ...BUCKETS.slice(0, BUCKETS.indexOf(bucket) + 1).map((b) => buckets[b]?.occupancyTop ?? 0),
  );
}
type Month = keyof typeof MARKET_PARIS.seasonality;
type CityData = {
  label: string;
  snapshot: string;
  listings: number;
  areas: readonly string[];
  buckets: Partial<Record<Bucket, MarketCell>>;
  seasonality?: Record<string, { price: number; occupancy: number }>;
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

type Season = { price: number; occupancy: number };
type Market = {
  cell: MarketCell;
  source: "quartier" | "arrondissement" | "ville";
  trend: number | null;
  seasonality: Record<string, Season>;
  label: string;
};

function marketFor(
  location: string,
  sector: Sector,
  outOfZone: CityData | null,
  bucket: Bucket,
): Market | null {
  if (location === OUT_OF_ZONE) {
    const found = outOfZone?.buckets[bucket];
    if (!outOfZone || !found || !outOfZone.seasonality) return null;
    const cell = { ...found, occupancyTop: occupancyFloor(outOfZone.buckets, bucket) };
    return {
      cell,
      source: "ville",
      trend: null,
      seasonality: outOfZone.seasonality,
      label: outOfZone.label,
    };
  }
  if (location.startsWith("paris-")) {
    const arr = location.slice(6) as keyof typeof MARKET_PARIS.arrondissements;
    const area = MARKET_PARIS.arrondissements[arr] as unknown as {
      priceTrend: number | null;
      sectors?: Record<string, { index: number; occupancyIndex?: number; sample: number }>;
      buckets: Record<Bucket, MarketCell>;
    };
    const base = area.buckets[bucket];
    const zone = sector ? area.sectors?.[sector] : undefined;
    const index = zone?.index ?? 1;
    const occIndex = zone?.occupancyIndex ?? 1;
    const n = Number(arr);
    return {
      cell: {
        ...base,
        price: Math.round(base.price * index),
        occupancyTop: Math.min(MAX_OCCUPANCY, occupancyFloor(area.buckets, bucket) * occIndex),
      },
      source: base.estimated ? "arrondissement" : "quartier",
      trend: area.priceTrend,
      seasonality: MARKET_PARIS.seasonality,
      label: `Paris ${n}${n === 1 ? "er" : "e"}${sector ? ` (${sector})` : ""}`,
    };
  }
  // Proche banlieue : aucune donnée publique, étude personnalisée.
  return null;
}

// Écart de prix lié au nombre de voyageurs, mesuré sur les annonces réelles de la même tranche.
// On retient le meilleur ratio observé jusqu'à cette capacité : accueillir un voyageur de plus ne
// fait jamais baisser l'estimation (les creux ponctuels des médianes sont du bruit statistique).
function capacityRatio(bucket: Bucket, guests: number) {
  const ratios = MARKET_PARIS.capacity[bucket] as Record<string, number>;
  const known = Object.keys(ratios)
    .map(Number)
    .filter((g) => g <= guests);
  if (!known.length) {
    const smallest = Math.min(...Object.keys(ratios).map(Number));
    return Number.isFinite(smallest) ? (ratios[String(smallest)] ?? 1) : 1;
  }
  return Math.max(...known.map((g) => ratios[String(g)] ?? 1));
}

/** Fait défiler un nombre jusqu'à sa nouvelle valeur (0,7 s, décélération douce). */
function useCountUp(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - (1 - t) ** 3;
      const v = Math.round(origin + (target - origin) * eased);
      setValue(v);
      from.current = v;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

export function RevenueSimulator() {
  const [location, setLocation] = useState("paris-11");
  const [sector, setSector] = useState<Sector>("");
  const [outOfZoneText, setOutOfZoneText] = useState("");
  const [typeIndex, setTypeIndex] = useState(1);
  const [guests, setGuests] = useState(3);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [showMonths, setShowMonths] = useState(false);

  const tooLarge = bedrooms > MAX_BEDROOMS || guests > MAX_GUESTS;
  const bucket = String(Math.min(bedrooms, 3)) as Bucket;
  const outOfZone = useMemo(() => matchCity(outOfZoneText), [outOfZoneText]);
  const market = useMemo(
    () => marketFor(location, sector, outOfZone, bucket),
    [location, sector, outOfZone, bucket],
  );
  const kind = PROPERTY_TYPES[typeIndex]!.kind;
  const structure = useMemo(() => {
    const parts = [
      kind === "appartement" ? NEUTRAL : (EFFECTS.propertyKinds?.[kind] ?? NEUTRAL),
      bathrooms >= 2 ? (EFFECTS.bathrooms?.["2"] ?? NEUTRAL) : NEUTRAL,
      bedrooms >= 5
        ? (EFFECTS.extraBedrooms?.["5"] ?? NEUTRAL)
        : bedrooms === 4
          ? (EFFECTS.extraBedrooms?.["4"] ?? NEUTRAL)
          : NEUTRAL,
    ];
    return {
      price: parts.reduce((p, e) => p * e.price, 1),
      occupancy: parts.reduce((p, e) => p * e.occupancy, 1),
    };
  }, [kind, bathrooms, bedrooms]);

  const chosen = AMENITIES.filter((a) => amenities.includes(a.id)).map(
    (a) => AMENITY_EFFECTS[a.id] ?? { price: 1, occupancy: 1 },
  );
  const amenityPrice = chosen.reduce((p, e) => p * e.price, 1);
  const amenityOccupancy = chosen.reduce((p, e) => p * e.occupancy, 1);
  // Occupation visée : niveau des 25 % d'annonces les mieux gérées du secteur (gestion
  // professionnelle), ajusté aux équipements du bien et plafonné.
  const occupancy = Math.min(
    MAX_OCCUPANCY,
    (market?.cell.occupancyTop ?? 0.6) * structure.occupancy * Math.min(1.15, amenityOccupancy),
  );

  const result = useMemo(() => {
    if (!market) return null;
    // Prix moyen annuel d'une nuit pour ce bien, avant saisonnalité.
    const base =
      market.cell.price *
      capacityRatio(bucket, guests) *
      structure.price *
      Math.min(1.3, amenityPrice);

    // Les 12 prochains mois : occupation visée et prix, ajustés mois par mois à la saison.
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
      const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const season = market.seasonality[String(date.getMonth() + 1)] ?? NEUTRAL;
      const price = Math.round(base * season.price);
      const nights = Math.round(days * Math.min(MAX_OCCUPANCY, occupancy * season.occupancy));
      return { date, days, nights, price, gross: nights * price };
    });

    const days = months.reduce((s, m) => s + m.days, 0);
    const nights = months.reduce((s, m) => s + m.nights, 0);
    const gross = months.reduce((s, m) => s + m.gross, 0);
    const fees = Math.round(gross * PLATFORM_FEE);
    const commission = Math.round(gross * COMMISSION);
    const net = gross - fees - commission;
    const nightsPerMonthAvg = Math.round(nights / 12);
    return {
      nightsPerMonthAvg,
      occupancyRate: nights / days,
      months,
      days,
      nights,
      gross,
      fees,
      commission,
      net,
      // Mois moyen : nuits × prix moyen arrondi, pour que chaque ligne se vérifie à la main.
      monthly: (() => {
        const avg = nights ? Math.round(gross / nights) : 0;
        const g = avg * nightsPerMonthAvg;
        const f = Math.round(g * PLATFORM_FEE);
        const c = Math.round(g * COMMISSION);
        return { gross: g, fees: f, commission: c, net: g - f - c };
      })(),
      averagePrice: nights ? Math.round(gross / nights) : 0,
    };
  }, [market, bucket, guests, structure, amenityPrice, occupancy]);

  const animatedNet = useCountUp(result?.monthly.net ?? 0);

  const toggleAmenity = (id: string) =>
    setAmenities((list) => (list.includes(id) ? list.filter((a) => a !== id) : [...list, id]));

  const peakMonth = useMemo(() => {
    if (!market) return "";
    const [m] = Object.entries(market.seasonality).reduce((a, b) =>
      b[1].price * b[1].occupancy > a[1].price * a[1].occupancy ? b : a,
    );
    return new Date(2000, Number(m) - 1, 1).toLocaleDateString("fr-FR", { month: "long" });
  }, [market]);

  // Pas de données fiables (banlieue, ville non couverte) ou bien hors norme : étude personnalisée.
  const needsStudy = tooLarge || !market;

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
                }}
                className="field-input"
              >
                <optgroup label="Paris">
                  {Array.from({ length: 20 }, (_, i) => (
                    <option key={i} value={`paris-${i + 1}`}>
                      Paris {i + 1}
                      {i === 0 ? "er" : "e"}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Proche banlieue (étude personnalisée)">
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
                setBedrooms(t.bedrooms);
                setGuests(t.guests);
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

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stepper
              label="Voyageurs"
              value={guests}
              display={guests > MAX_GUESTS ? `${MAX_GUESTS}+` : String(guests)}
              onChange={setGuests}
              min={1}
              max={MAX_GUESTS + 1}
            />
            <Stepper
              label="Chambres"
              value={bedrooms}
              display={
                bedrooms === 0
                  ? "Studio"
                  : bedrooms > MAX_BEDROOMS
                    ? `${MAX_BEDROOMS}+`
                    : String(bedrooms)
              }
              onChange={(v) => {
                setBedrooms(v);
                setGuests(TYPICAL_GUESTS[Math.min(v, TYPICAL_GUESTS.length - 1)]!);
              }}
              min={0}
              max={MAX_BEDROOMS + 1}
            />
            <Stepper
              label="Salles de bain"
              value={bathrooms}
              onChange={setBathrooms}
              min={1}
              max={4}
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

        <section className="p-6 sm:p-8">
          <p className="text-sm font-semibold">Comment est calculée l'estimation&nbsp;?</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Nous partons du prix médian des logements comparables de votre secteur et du taux
            d'occupation atteint par les 25&nbsp;% d'annonces les mieux gérées, le niveau que vise
            notre gestion. Nous ajustons ensuite selon la taille de votre bien, sa capacité
            d'accueil, ses équipements (effets mesurés sur les annonces réelles) et la saison. Le
            résultat réel dépend du nombre de nuits louées&nbsp;: nous ne le garantissons pas, mais
            nous mettons tout en œuvre pour le maximiser.
          </p>
        </section>
      </div>

      {/* Résultat */}
      <div className="flex flex-col bg-[var(--ink)] p-6 text-white sm:p-8">
        {needsStudy ? (
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">
              {tooLarge
                ? "Grand logement"
                : location === OUT_OF_ZONE
                  ? "Bien hors zone"
                  : "Proche banlieue"}
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl">
              {tooLarge
                ? "Un bien d'exception mérite une étude sur mesure"
                : "Votre secteur mérite une étude sur mesure"}
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-white/75">
              {tooLarge
                ? `Au-delà de ${MAX_BEDROOMS} chambres ou ${MAX_GUESTS} voyageurs, les logements comparables sont trop rares pour une estimation automatique fiable.`
                : "Aucune donnée publique fiable ne couvre ce secteur : plutôt qu'un chiffre approximatif, nous préférons étudier votre bien à partir des annonces comparables."}{" "}
              Décrivez votre bien dans le formulaire&nbsp;: nous vous adressons sous 24&nbsp;h une
              étude personnalisée.
            </p>
            <a href="#estimation" className="btn-primary mt-8 w-full">
              Demander une étude personnalisée <ArrowRight className="size-4" />
            </a>
          </div>
        ) : !result ? null : (
          <>
            <p className="text-xs font-semibold tracking-wider text-white/60 uppercase">
              Avec Spinelle, vous pourriez gagner
            </p>
            <p
              className="mt-3 font-[family-name:var(--font-display)] text-6xl tabular-nums"
              aria-live="polite"
            >
              {euros(animatedNet)}
              <span className="ml-2 text-xl text-white/70">/ mois</span>
            </p>
            <p className="mt-2 text-sm text-white/70">
              net pour vous, en moyenne sur l'année, soit {euros(result.monthly.net * 12)} sur 12
              mois
            </p>

            <dl
              key={result.monthly.net}
              className="animate-fade-up mt-7 border-t border-white/15 text-sm"
            >
              <Line
                label="Taux d'occupation estimé"
                value={pct(result.occupancyRate)}
                hint="gestion professionnelle"
              />
              <Line
                label="Nuits louées par mois"
                value={`${result.nightsPerMonthAvg}`}
                hint="en moyenne"
              />
              <Line
                label="Prix moyen par nuit"
                value={euros(result.averagePrice)}
                hint="selon la saison"
              />
              <Line label="Loyers encaissés par mois" value={euros(result.monthly.gross)} strong />
              <Line
                label="Commission plateforme (15 %)"
                value={`− ${euros(result.monthly.fees)}`}
              />
              <Line
                label="Commission Spinelle (20 %)"
                value={`− ${euros(result.monthly.commission)}`}
              />
              <Line label="Net pour vous par mois" value={euros(result.monthly.net)} strong />
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
                    <p className="mt-1 font-semibold capitalize">{peakMonth}</p>
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
                  : `Prix médian de ${market!.cell.sample} logements comparables actifs dans le secteur ${market!.label}, sur ses 12 derniers relevés mensuels. `}
              Données{" "}
              <a href={MARKET_PARIS.sourceUrl} target="_blank" rel="noopener" className="underline">
                Inside Airbnb
              </a>{" "}
              ({MARKET_PARIS.license}), {MARKET_PARIS.snapshots.length} relevés mensuels à Paris
              jusqu'au {new Date(MARKET_PARIS.snapshot).toLocaleDateString("fr-FR")}, actualisées
              chaque mois. Estimation indicative et non contractuelle. Pour une résidence
              principale, le nombre de nuits louables par an est plafonné.
            </p>
          </>
        )}
      </div>
    </div>
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
