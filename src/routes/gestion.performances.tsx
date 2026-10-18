import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  CheckCircle2,
  Home,
  Lightbulb,
  Megaphone,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { usePms, usePropertyName } from "@/components/gestion/PmsProvider";
import { Empty, PageHeader, Panel, Stat } from "@/components/gestion/ui";
import { supabase } from "@/integrations/supabase/client";
import { addDays, diffDays, euros, formatDay, todayParis } from "@/lib/pms/dates";
import { PLATFORMS, TRIGGERS, type Reservation } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

// Tableau de bord des performances : prospection, logements, ménage et gestion des voyageurs,
// avec des pistes d'amélioration calculées à partir des données réelles de l'intranet.

const db = supabase as unknown as SupabaseClient;

const VIEWS = [
  { id: "prospection", label: "Prospection", icon: Megaphone },
  { id: "biens", label: "Biens", icon: Home },
  { id: "menage", label: "Ménage", icon: Sparkles },
  { id: "gestion", label: "Gestion et avis", icon: MessageSquare },
] as const;
type View = (typeof VIEWS)[number]["id"];

const PERIODS = [
  { days: 30, label: "30 jours" },
  { days: 90, label: "3 mois" },
  { days: 365, label: "12 mois" },
] as const;

export const Route = createFileRoute("/gestion/performances")({
  validateSearch: (search: Record<string, unknown>): { vue?: View } => {
    const vue = VIEWS.find((v) => v.id === search["vue"])?.id;
    return vue ? { vue } : {};
  },
  component: PerformancesPage,
});

function PerformancesPage() {
  const { vue } = Route.useSearch();
  const [view, setView] = useState<View>(vue ?? "prospection");
  const [days, setDays] = useState<number>(30);
  const today = todayParis();
  const start = addDays(today, -days);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performances"
        subtitle="Les chiffres clés de chaque activité, et ce qu'il faut améliorer en priorité."
      />

      {/* Filtres : une seule ligne, au-dessus de tout le contenu */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              aria-pressed={view === v.id}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                view === v.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-ink",
              )}
            >
              <v.icon className="size-4" /> {v.label}
            </button>
          ))}
        </div>
        <div className="inline-flex gap-1 rounded-xl border border-border bg-card p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setDays(p.days)}
              aria-pressed={days === p.days}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition",
                days === p.days ? "bg-muted font-semibold text-ink" : "text-muted-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {view === "prospection" && <ProspectionView start={start} />}
      {view === "biens" && <PropertiesView start={start} today={today} />}
      {view === "menage" && <CleaningView start={start} today={today} />}
      {view === "gestion" && <ManagementView start={start} today={today} />}
    </div>
  );
}

// ------------------------------------------------------------------ éléments communs

/** Barres horizontales : un libellé, une barre proportionnelle, la valeur écrite au bout. */
function BarList({
  rows,
  format = (n) => String(n),
  max,
  caption,
}: {
  rows: { label: ReactNode; value: number; hint?: string }[];
  format?: (n: number) => string;
  max?: number;
  caption: string;
}) {
  if (!rows.length) return <Empty>Pas encore de données sur cette période.</Empty>;
  const top = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} title={r.hint} className="group">
            <td className="w-[38%] py-1.5 pr-3 align-middle text-ink">{r.label}</td>
            <td className="py-1.5 align-middle">
              <div className="flex items-center gap-2">
                <div className="h-3 flex-1 rounded-r-[4px] bg-muted">
                  <div
                    className="h-3 rounded-r-[4px] bg-primary transition-[width] group-hover:opacity-80"
                    style={{ width: `${Math.max(2, (r.value / top) * 100)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right tabular-nums text-muted-foreground">
                  {format(r.value)}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type Advice = { tone: "ok" | "warn" | "bad"; text: ReactNode };

function AdviceList({ items }: { items: Advice[] }) {
  return (
    <Panel
      title={
        <span className="inline-flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-600" /> À améliorer en priorité
        </span>
      }
    >
      {items.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" /> Rien à signaler sur cette période.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((a, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              {a.tone === "ok" ? (
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-emerald-700"
                  aria-label="Bon"
                />
              ) : (
                <AlertTriangle
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    a.tone === "bad" ? "text-red-700" : "text-amber-600",
                  )}
                  aria-label={a.tone === "bad" ? "Urgent" : "À surveiller"}
                />
              )}
              <span>{a.text}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

const pct = (n: number) => `${Math.round(n * 100)} %`;
const dec = (n: number, digits: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const ratio = (a: number, b: number) => (b ? a / b : 0);

/** Nuits d'une réservation comprises dans [start, end[. */
function overlap(r: Pick<Reservation, "check_in" | "check_out">, start: string, end: string) {
  const from = r.check_in > start ? r.check_in : start;
  const to = r.check_out < end ? r.check_out : end;
  return Math.max(0, diffDays(from, to));
}

// ------------------------------------------------------------------ Prospection

type ProspectRow = {
  zone: string;
  status: string;
  notes: string | null;
  email: string | null;
  first_contact_at: string | null;
  replied_at: string | null;
};

const ZONE_LABELS: Record<string, string> = {
  paris: "Paris",
  "petite-couronne": "Petite couronne",
  versailles: "Versailles",
  chartres: "Chartres",
  disney: "Secteur Disney",
  roissy: "Secteur Roissy",
  bordeaux: "Bordeaux",
  "cote-azur": "Côte d'Azur",
  ski: "Stations de ski",
  "cote-basque-arcachon": "Côte basque, Arcachon",
};
const CONTACTED = ["contacte", "relance", "sans_reponse", "repondu", "partenaire", "refus"];
const ANSWERED = ["repondu", "partenaire", "refus"];

function ProspectionView({ start }: { start: string }) {
  const [rows, setRows] = useState<ProspectRow[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    void (async () => {
      const all: ProspectRow[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await db
          .from("prospects")
          .select("zone,status,notes,email,first_contact_at,replied_at")
          .range(from, from + 999);
        if (error) {
          setMissing(true);
          return;
        }
        all.push(...((data ?? []) as ProspectRow[]));
        if (!data || data.length < 1000) break;
      }
      setRows(all);
    })();
  }, []);

  if (missing) return <Empty>La prospection n'est pas encore installée.</Empty>;
  if (!rows) return <Empty>Chargement…</Empty>;

  const inPeriod = rows.filter(
    (r) => r.first_contact_at && r.first_contact_at.slice(0, 10) >= start,
  );
  const contacted = inPeriod.filter((r) => CONTACTED.includes(r.status));
  const answered = inPeriod.filter((r) => ANSWERED.includes(r.status));
  const partners = rows.filter((r) => r.status === "partenaire").length;
  const category = (r: ProspectRow) =>
    (r.notes ?? "").match(/Catégorie : ([^\n]+)/)?.[1] ?? "agence immobilière";

  const byGroup = (key: (r: ProspectRow) => string, label: (k: string) => string) => {
    const groups = new Map<string, { sent: number; answered: number }>();
    for (const r of contacted) {
      const g = groups.get(key(r)) ?? { sent: 0, answered: 0 };
      g.sent++;
      if (ANSWERED.includes(r.status)) g.answered++;
      groups.set(key(r), g);
    }
    return [...groups.entries()]
      .map(([k, g]) => ({
        label: label(k),
        value: ratio(g.answered, g.sent),
        hint: `${g.answered} réponse(s) sur ${g.sent} contact(s)`,
        sent: g.sent,
      }))
      .sort((a, b) => b.value - a.value);
  };
  const byZone = byGroup(
    (r) => r.zone,
    (k) => ZONE_LABELS[k] ?? k,
  );
  const byTrade = byGroup(category, (k) => k[0]!.toUpperCase() + k.slice(1));

  const funnel = [
    { label: "Contacts trouvés", value: rows.length },
    { label: "Avec un e-mail", value: rows.filter((r) => r.email).length },
    { label: "Contactés (total)", value: rows.filter((r) => CONTACTED.includes(r.status)).length },
    { label: "Ont répondu (total)", value: rows.filter((r) => ANSWERED.includes(r.status)).length },
    { label: "Partenaires", value: partners },
  ];

  const advice: Advice[] = [];
  const toReview = rows.filter((r) => r.status === "erreur").length;
  if (toReview)
    advice.push({
      tone: "warn",
      text: (
        <>
          {toReview} contact(s) « à vérifier » : message non conforme ou adresse invalide, à
          regarder dans{" "}
          <Link to="/gestion/prospection" className="text-primary underline">
            Prospection
          </Link>
          .
        </>
      ),
    });
  const replied = rows.filter((r) => r.status === "repondu").length;
  if (replied)
    advice.push({
      tone: "bad",
      text: `${replied} contact(s) ont répondu et attendent votre retour : rappelez-les en priorité, c'est là que se signent les partenariats.`,
    });
  const best = byZone.filter((z) => z.sent >= 20)[0];
  if (best && best.value > 0)
    advice.push({
      tone: "ok",
      text: `Meilleure zone : ${best.label} (${pct(best.value)} de réponses). Elle mérite plus de volume.`,
    });
  const weak = byTrade.filter((t) => t.sent >= 30 && t.value < 0.01);
  for (const t of weak)
    advice.push({
      tone: "warn",
      text: `${t.label} : moins de 1 % de réponses sur ${t.sent} contacts. L'angle du message est à revoir pour ce métier.`,
    });
  if (contacted.length >= 50 && ratio(answered.length, contacted.length) < 0.02)
    advice.push({
      tone: "warn",
      text: "Taux de réponse global sous 2 % : vérifiez que les e-mails n'arrivent pas en spam (envoyez-vous un test) et relisez quelques messages.",
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Contactés sur la période" value={contacted.length} />
        <Stat
          label="Réponses"
          value={answered.length}
          hint={
            contacted.length
              ? `${pct(ratio(answered.length, contacted.length))} des contactés`
              : undefined
          }
          tone={answered.length ? "ok" : undefined}
        />
        <Stat label="Partenaires signés" value={partners} tone={partners ? "ok" : undefined} />
        <Stat
          label="À rappeler"
          value={replied}
          tone={replied ? "bad" : undefined}
          hint="ont répondu, sans suite de votre part"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Taux de réponse par zone">
          <BarList
            rows={byZone}
            format={pct}
            max={Math.max(...byZone.map((z) => z.value), 0.1)}
            caption="Taux de réponse par zone"
          />
        </Panel>
        <Panel title="Taux de réponse par métier">
          <BarList
            rows={byTrade}
            format={pct}
            max={Math.max(...byTrade.map((z) => z.value), 0.1)}
            caption="Taux de réponse par métier"
          />
        </Panel>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="De la liste au partenariat">
          <BarList
            rows={funnel}
            format={(n) => n.toLocaleString("fr-FR")}
            caption="Entonnoir de prospection"
          />
        </Panel>
        <AdviceList items={advice} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Biens

function PropertiesView({ start, today }: { start: string; today: string }) {
  const { data } = usePms();
  const days = diffDays(start, today);
  const stats = data.pms_properties
    .filter((p) => p.active)
    .map((p) => {
      const resas = data.pms_reservations.filter((r) => r.property_id === p.id);
      const booked = resas.filter((r) => r.status === "confirmee");
      const nights = booked.reduce((s, r) => s + overlap(r, start, today), 0);
      const blocked = resas
        .filter((r) => r.status === "bloquee")
        .reduce((s, r) => s + overlap(r, start, today), 0);
      // Revenu : au prorata des nuits de la période (une réservation à cheval compte en partie).
      const gross = booked.reduce((s, r) => {
        const total = diffDays(r.check_in, r.check_out) || 1;
        return s + (r.amount_gross * overlap(r, start, today)) / total;
      }, 0);
      const reviews = data.pms_reviews.filter((v) => v.property_id === p.id && v.date >= start);
      const rating = reviews.length
        ? reviews.reduce((s, v) => s + v.rating, 0) / reviews.length
        : null;
      return {
        p,
        nights,
        occupancy: ratio(nights, Math.max(1, days - blocked)),
        gross,
        adr: nights ? gross / nights : 0,
        rating,
        reviews: reviews.length,
      };
    });

  if (!stats.length) return <Empty>Aucun logement actif pour le moment.</Empty>;

  const nights = stats.reduce((s, x) => s + x.nights, 0);
  const gross = stats.reduce((s, x) => s + x.gross, 0);
  const occupancy = ratio(
    nights,
    stats.reduce((s, x) => s + Math.max(1, days), 0),
  );
  const advice: Advice[] = [];
  for (const x of stats) {
    if (days >= 30 && x.occupancy < 0.5)
      advice.push({
        tone: "warn",
        text: `${x.p.name} : occupation de ${pct(x.occupancy)}. Revoir le prix des dates libres, les photos ou la durée minimale de séjour.`,
      });
    if (x.rating !== null && x.rating < 4.6)
      advice.push({
        tone: "bad",
        text: `${x.p.name} : note moyenne de ${dec(x.rating, 1)}/5. Lire les derniers avis et corriger le point qui revient.`,
      });
    if (x.nights > 0 && x.reviews === 0)
      advice.push({
        tone: "warn",
        text: `${x.p.name} : aucun avis sur la période. Vérifier que le message de demande d'avis part bien après chaque départ.`,
      });
  }
  const best = [...stats].sort((a, b) => b.gross - a.gross)[0];
  if (best && best.gross > 0)
    advice.push({
      tone: "ok",
      text: `Meilleur logement : ${best.p.name} (${euros(best.gross)} encaissés, ${pct(best.occupancy)} d'occupation).`,
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenus encaissés" value={euros(gross)} hint="loyers bruts de la période" />
        <Stat label="Nuits louées" value={nights} />
        <Stat
          label="Occupation moyenne"
          value={pct(occupancy)}
          tone={occupancy >= 0.7 ? "ok" : occupancy < 0.5 ? "warn" : undefined}
        />
        <Stat label="Prix moyen par nuit" value={euros(ratio(gross, nights))} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Occupation par logement">
          <BarList
            rows={stats.map((x) => ({
              label: x.p.name,
              value: x.occupancy,
              hint: `${x.nights} nuits louées`,
            }))}
            format={pct}
            max={1}
            caption="Occupation par logement"
          />
        </Panel>
        <Panel title="Revenus par logement">
          <BarList
            rows={[...stats]
              .sort((a, b) => b.gross - a.gross)
              .map((x) => ({
                label: x.p.name,
                value: x.gross,
                hint: `prix moyen ${euros(x.adr)} par nuit`,
              }))}
            format={(n) => euros(n)}
            caption="Revenus par logement"
          />
        </Panel>
      </div>
      <Panel title="Détail par logement">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="py-2">Logement</th>
                <th className="py-2 text-right">Nuits</th>
                <th className="py-2 text-right">Occupation</th>
                <th className="py-2 text-right">Revenus</th>
                <th className="py-2 text-right">Prix moyen</th>
                <th className="py-2 text-right">Note</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((x) => (
                <tr key={x.p.id} className="border-t border-border">
                  <td className="py-2 font-medium">{x.p.name}</td>
                  <td className="py-2 text-right tabular-nums">{x.nights}</td>
                  <td className="py-2 text-right tabular-nums">{pct(x.occupancy)}</td>
                  <td className="py-2 text-right tabular-nums">{euros(x.gross)}</td>
                  <td className="py-2 text-right tabular-nums">{euros(x.adr)}</td>
                  <td className="py-2 text-right tabular-nums">
                    {x.rating !== null ? `${dec(x.rating, 1)}/5 (${x.reviews})` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <AdviceList items={advice} />
    </div>
  );
}

// ------------------------------------------------------------------ Ménage

function CleaningView({ start, today }: { start: string; today: string }) {
  const { data } = usePms();
  const propertyName = usePropertyName();
  const tasks = data.pms_cleaning_tasks.filter((t) => t.date >= start && t.date <= today);
  const done = tasks.filter((t) => t.status === "termine");
  const late = done.filter(
    (t) =>
      t.window_end &&
      t.completed_at &&
      t.completed_at.slice(11, 16) > t.window_end &&
      t.completed_at.slice(0, 10) >= t.date,
  );
  const conditions = { vert: 0, orange: 0, rouge: 0 };
  for (const t of done) if (t.condition) conditions[t.condition]++;
  const rated = conditions.vert + conditions.orange + conditions.rouge;
  const incidents = data.pms_incidents.filter((i) => i.created_at.slice(0, 10) >= start);
  const upcomingUnassigned = data.pms_cleaning_tasks.filter(
    (t) => !t.cleaner_id && t.date >= today && t.date <= addDays(today, 7),
  );
  const cost = done.reduce((s, t) => s + (t.price || 0), 0);

  const byCleaner = data.pms_cleaners
    .map((c) => {
      const mine = done.filter((t) => t.cleaner_id === c.id);
      const issues = mine.filter((t) => t.condition === "orange" || t.condition === "rouge").length;
      return { c, count: mine.length, issues, ok: ratio(mine.length - issues, mine.length) };
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const advice: Advice[] = [];
  if (upcomingUnassigned.length)
    advice.push({
      tone: "bad",
      text: (
        <>
          {upcomingUnassigned.length} ménage(s) des 7 prochains jours sans prestataire : à attribuer
          dans{" "}
          <Link to="/gestion/menage" className="text-primary underline">
            Ménages
          </Link>
          .
        </>
      ),
    });
  for (const x of byCleaner)
    if (x.count >= 5 && x.ok < 0.8)
      advice.push({
        tone: "warn",
        text: `${x.c.name} : ${x.issues} ménage(s) sur ${x.count} signalés orange ou rouge. Faire un point qualité avec ce prestataire.`,
      });
  if (done.length >= 5 && ratio(late.length, done.length) > 0.15)
    advice.push({
      tone: "warn",
      text: `${late.length} ménage(s) terminés après l'heure prévue. Vérifier les créneaux ou ajouter un prestataire en renfort.`,
    });
  const openIncidents = data.pms_incidents.filter((i) => i.status !== "resolu").length;
  if (openIncidents)
    advice.push({ tone: "warn", text: `${openIncidents} incident(s) non résolu(s).` });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Ménages réalisés"
          value={done.length}
          hint={`${tasks.length} prévus sur la période`}
        />
        <Stat
          label="Logement en ordre"
          value={rated ? pct(ratio(conditions.vert, rated)) : "—"}
          hint="état « vert » signalé"
          tone={rated && ratio(conditions.vert, rated) >= 0.9 ? "ok" : rated ? "warn" : undefined}
        />
        <Stat
          label="Incidents signalés"
          value={incidents.length}
          tone={incidents.length ? "warn" : undefined}
        />
        <Stat label="Coût des ménages" value={euros(cost)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="État des logements après ménage">
          <BarList
            rows={[
              { label: "En ordre (vert)", value: conditions.vert },
              { label: "À surveiller (orange)", value: conditions.orange },
              { label: "Problème (rouge)", value: conditions.rouge },
            ]}
            caption="État des logements après ménage"
          />
        </Panel>
        <Panel title="Ménages par prestataire">
          <BarList
            rows={byCleaner.map((x) => ({
              label: x.c.name,
              value: x.count,
              hint: `${pct(x.ok)} sans signalement`,
            }))}
            caption="Ménages par prestataire"
          />
        </Panel>
      </div>
      {incidents.length > 0 && (
        <Panel title="Derniers incidents">
          <ul className="divide-y divide-border text-sm">
            {incidents.slice(0, 6).map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-2">
                <span>
                  <span className="font-medium">{i.title}</span> · {propertyName(i.property_id)}
                </span>
                <span className="text-muted-foreground">
                  {i.status === "resolu" ? "Résolu" : "En cours"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      <AdviceList items={advice} />
    </div>
  );
}

// ------------------------------------------------------------------ Gestion et avis

function ManagementView({ start, today }: { start: string; today: string }) {
  const { data } = usePms();
  const propertyName = usePropertyName();
  const reviews = data.pms_reviews
    .filter((r) => r.date >= start)
    .sort((a, b) => b.date.localeCompare(a.date));
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const unanswered = reviews.filter((r) => !r.response);
  const messages = data.pms_messages.filter(
    (m) => (m.sent_at ?? m.created_at).slice(0, 10) >= start,
  );
  const sent = messages.filter((m) => m.direction === "sortant" && m.status === "envoye");
  const failed = messages.filter((m) => m.status === "echec" || m.status === "a_copier");
  const requests = data.pms_guest_requests.filter((g) => g.created_at.slice(0, 10) >= start);
  const pending = requests.filter((g) => g.status === "en_attente");
  const stayRatings = requests.filter((g) => g.type === "avis_sejour" && g.rating);
  const templates = data.pms_message_templates
    .filter((t) => t.active)
    .sort((a, b) => a.position - b.position);

  const byTemplate = templates.map((t) => ({
    label: t.name,
    value: sent.filter((m) => m.template_id === t.id).length,
    hint: TRIGGERS[t.trigger].label,
  }));
  const byPlatform = Object.entries(
    reviews.reduce<Record<string, number[]>>((acc, r) => {
      (acc[r.platform] ??= []).push(r.rating);
      return acc;
    }, {}),
  ).map(([k, list]) => ({
    label: PLATFORMS[k as keyof typeof PLATFORMS]?.label ?? k,
    value: list.reduce((s, x) => s + x, 0) / list.length,
    hint: `${list.length} avis`,
  }));

  const usedTriggers = new Set(templates.map((t) => t.trigger));
  const advice: Advice[] = [];
  if (unanswered.length)
    advice.push({
      tone: "warn",
      text: (
        <>
          {unanswered.length} avis sans réponse : y répondre améliore le classement des annonces.
          Réponses rédigées par l'IA dans{" "}
          <Link to="/gestion/avis" className="text-primary underline">
            Avis
          </Link>
          .
        </>
      ),
    });
  if (failed.length)
    advice.push({
      tone: "bad",
      text: (
        <>
          {failed.length} message(s) voyageurs non envoyé(s) ou à copier dans la plateforme : à
          traiter dans{" "}
          <Link to="/gestion/messages" className="text-primary underline">
            Voyageurs et messages
          </Link>
          .
        </>
      ),
    });
  if (pending.length)
    advice.push({
      tone: "bad",
      text: `${pending.length} demande(s) de voyageurs en attente de réponse (départ tardif, problème, question…).`,
    });
  for (const trig of ["avant_arrivee", "veille_depart", "apres_depart"] as const)
    if (!usedTriggers.has(trig))
      advice.push({
        tone: "warn",
        text: `Aucun message automatique « ${TRIGGERS[trig].label} ». Il évite des questions et améliore les avis.`,
      });
  const low = reviews.filter((r) => r.rating <= 3);
  if (low.length)
    advice.push({
      tone: "bad",
      text: `${low.length} avis à 3 étoiles ou moins : ${low
        .slice(0, 3)
        .map((r) => propertyName(r.property_id))
        .join(", ")}. Identifier la cause et la corriger.`,
    });
  if (avg !== null && avg >= 4.8)
    advice.push({
      tone: "ok",
      text: `Note moyenne excellente (${dec(avg, 2)}/5) : mettez ces avis en avant auprès des propriétaires prospects.`,
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Note moyenne"
          value={avg !== null ? `${dec(avg, 2)}/5` : "—"}
          hint={`${reviews.length} avis sur la période`}
          tone={avg !== null ? (avg >= 4.7 ? "ok" : avg < 4.5 ? "bad" : "warn") : undefined}
        />
        <Stat
          label="Avis répondus"
          value={
            reviews.length ? pct(ratio(reviews.length - unanswered.length, reviews.length)) : "—"
          }
        />
        <Stat
          label="Messages envoyés"
          value={sent.length}
          hint={failed.length ? `${failed.length} à traiter` : "aucun en échec"}
          tone={failed.length ? "bad" : undefined}
        />
        <Stat
          label="Note des séjours"
          value={
            stayRatings.length
              ? `${dec(stayRatings.reduce((s, g) => s + (g.rating ?? 0), 0) / stayRatings.length, 1)}/5`
              : "—"
          }
          hint="retours privés pendant le séjour"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Messages automatiques envoyés">
          {templates.length ? (
            <BarList rows={byTemplate} caption="Messages envoyés par modèle" />
          ) : (
            <Empty>Aucun message automatique actif.</Empty>
          )}
        </Panel>
        <Panel title="Note moyenne par plateforme">
          <BarList
            rows={byPlatform}
            format={(n) => `${dec(n, 1)}/5`}
            max={5}
            caption="Note moyenne par plateforme"
          />
        </Panel>
      </div>
      <Panel title="Derniers avis voyageurs">
        {reviews.length === 0 ? (
          <Empty>Aucun avis sur la période.</Empty>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {reviews.slice(0, 8).map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    {propertyName(r.property_id)} · {r.rating}/5
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDay(r.date)} · {r.response ? "répondu" : "sans réponse"}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-1 line-clamp-2 text-muted-foreground">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <AdviceList items={advice} />
    </div>
  );
}
