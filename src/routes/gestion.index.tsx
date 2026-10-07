import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, LogIn, LogOut, MessageSquare, Sparkles } from "lucide-react";
import { usePms, usePropertyName } from "@/components/gestion/PmsProvider";
import {
  ConditionBadge,
  Empty,
  PageHeader,
  Panel,
  Pill,
  PlatformBadge,
  Stat,
} from "@/components/gestion/ui";
import {
  addDays,
  euros,
  formatDay,
  formatMonth,
  nightsInMonth,
  percent,
  todayParis,
} from "@/lib/pms/dates";
import { findConflicts } from "@/lib/pms/engine";
import { buildReport } from "@/lib/pms/reports";
import { REQUEST_TYPES } from "@/lib/pms/types";

export const Route = createFileRoute("/gestion/")({ component: Dashboard });

function Dashboard() {
  const { data, loading } = usePms();
  const propertyName = usePropertyName();
  const today = todayParis();
  const tomorrow = addDays(today, 1);
  const month = today.slice(0, 7);
  const confirmed = data.pms_reservations.filter((r) => r.status === "confirmee");

  const arrivals = confirmed
    .filter((r) => r.check_in === today || r.check_in === tomorrow)
    .sort((a, b) => a.check_in.localeCompare(b.check_in));
  const departures = confirmed
    .filter((r) => r.check_out === today || r.check_out === tomorrow)
    .sort((a, b) => a.check_out.localeCompare(b.check_out));
  const inHouse = confirmed.filter((r) => r.check_in <= today && r.check_out > today);
  const cleanings = data.pms_cleaning_tasks
    .filter((t) => t.date >= today && t.date <= addDays(today, 2))
    .sort((a, b) => a.date.localeCompare(b.date));
  const incidents = data.pms_incidents.filter((i) => i.status !== "resolu");
  const requests = data.pms_guest_requests.filter((r) => r.status === "en_attente");
  const toCopy = data.pms_messages.filter((m) => m.status === "a_copier" || m.status === "echec");
  const conflicts = findConflicts(data);
  const unassigned = data.pms_cleaning_tasks.filter((t) => !t.cleaner_id && t.date >= today);

  // Indicateurs du mois en cours, tous logements confondus.
  const active = data.pms_properties.filter((p) => p.active);
  const reports = active.map((p) => buildReport(data, p.id, month, false));
  const gross = reports.reduce((s, r) => s + r.gross, 0);
  const commission = reports.reduce((s, r) => s + r.commission, 0);
  const nightsSold = reports.reduce((s, r) => s + r.nightsBooked, 0);
  const capacity = reports.reduce((s, r) => s + r.daysInMonth - r.nightsBlocked, 0);
  const next30 = active.length
    ? confirmed.reduce((s, r) => {
        const from = r.check_in > today ? r.check_in : today;
        const to = r.check_out < addDays(today, 30) ? r.check_out : addDays(today, 30);
        return s + Math.max(0, (Date.parse(to) - Date.parse(from)) / 86_400_000);
      }, 0) /
      (30 * active.length)
    : 0;
  const reviews = data.pms_reviews;
  const rating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  void nightsInMonth;

  if (loading) return <p className="text-sm text-muted-foreground">Chargement…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={`Aujourd'hui, ${formatDay(today)} · ${formatMonth(month)}`}
      />

      {data.pms_properties.length === 0 && (
        <Panel>
          <p className="text-sm">
            Bienvenue ! Commencez par ajouter vos logements et coller leurs liens de calendrier
            Airbnb, Booking et Abritel.
          </p>
          <Link to="/gestion/logements" className="btn-primary mt-3 inline-flex">
            Ajouter un logement
          </Link>
        </Panel>
      )}

      {(conflicts.length > 0 ||
        incidents.some((i) => i.severity === "rouge") ||
        unassigned.length > 0) && (
        <div className="space-y-2">
          {conflicts.map(([a, b]) => (
            <Alert key={`${a.id}-${b.id}`} tone="bad">
              Double réservation sur <b>{propertyName(a.property_id)}</b> : {formatDay(a.check_in)}→
              {formatDay(a.check_out)} ({a.platform}) et {formatDay(b.check_in)}→
              {formatDay(b.check_out)} ({b.platform}). Annulez ou relogez l'un des voyageurs.
            </Alert>
          ))}
          {incidents
            .filter((i) => i.severity === "rouge")
            .map((i) => (
              <Alert key={i.id} tone="bad">
                Gros problème signalé sur <b>{propertyName(i.property_id)}</b> :{" "}
                {i.description || i.title}{" "}
                <Link to="/gestion/incidents" className="underline">
                  Voir
                </Link>
              </Alert>
            ))}
          {unassigned.length > 0 && (
            <Alert tone="warn">
              {unassigned.length} ménage(s) à venir sans prestataire.{" "}
              <Link to="/gestion/menage" className="underline">
                Attribuer
              </Link>
            </Alert>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Revenus du mois"
          value={euros(gross)}
          hint={`Commission : ${euros(commission)}`}
        />
        <Stat
          label="Occupation du mois"
          value={percent(capacity ? nightsSold / capacity : 0)}
          hint={`${nightsSold} nuits vendues`}
        />
        <Stat
          label="Occupation 30 prochains jours"
          value={percent(next30)}
          hint={`${inHouse.length} séjour(s) en cours`}
        />
        <Stat
          label="Note moyenne"
          value={rating ? `${rating.toFixed(2)} ★` : "—"}
          hint={`${reviews.length} avis`}
          tone={rating === null ? undefined : rating >= 4.8 ? "ok" : rating >= 4.5 ? "warn" : "bad"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title={
            <span className="flex items-center gap-2">
              <LogIn className="size-4" /> Arrivées (aujourd'hui et demain)
            </span>
          }
        >
          <ResaList items={arrivals} date="check_in" empty="Aucune arrivée" />
        </Panel>
        <Panel
          title={
            <span className="flex items-center gap-2">
              <LogOut className="size-4" /> Départs (aujourd'hui et demain)
            </span>
          }
        >
          <ResaList items={departures} date="check_out" empty="Aucun départ" />
        </Panel>
        <Panel
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="size-4" /> Ménages des 3 prochains jours
            </span>
          }
          actions={<GoTo to="/gestion/menage" />}
        >
          {cleanings.length ? (
            <ul className="divide-y divide-border">
              {cleanings.map((t) => {
                const cleaner = data.pms_cleaners.find((c) => c.id === t.cleaner_id);
                return (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium">{propertyName(t.property_id)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDay(t.date)} · {t.window_start ?? "?"} →{" "}
                        {t.window_end ?? "pas d'arrivée le jour même"} ·{" "}
                        {cleaner?.name ?? <span className="text-red-700">non attribué</span>}
                      </div>
                    </div>
                    {t.status === "termine" ? (
                      <ConditionBadge condition={t.condition} />
                    ) : (
                      <Pill tone={t.status === "en_cours" ? "info" : "neutral"}>
                        {t.status === "en_cours" ? "En cours" : "À faire"}
                      </Pill>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>Aucun ménage prévu</Empty>
          )}
        </Panel>
        <Panel
          title={
            <span className="flex items-center gap-2">
              <MessageSquare className="size-4" /> À traiter
            </span>
          }
          actions={<GoTo to="/gestion/messages" />}
        >
          <ul className="space-y-2 text-sm">
            {requests.map((r) => {
              const resa = data.pms_reservations.find((x) => x.id === r.reservation_id);
              return (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span>
                    <b>{REQUEST_TYPES[r.type]}</b> · {resa?.guest_name ?? "Voyageur"} ·{" "}
                    {propertyName(resa?.property_id)}
                    {r.requested_time ? ` · ${r.requested_time}` : ""}
                  </span>
                  <Pill tone="warn">En attente</Pill>
                </li>
              );
            })}
            {toCopy.length > 0 && (
              <li className="flex items-center justify-between gap-2">
                <span>{toCopy.length} message(s) voyageur à envoyer via la plateforme</span>
                <Pill tone="info">À copier</Pill>
              </li>
            )}
            {incidents.length > 0 && (
              <li className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-amber-600" /> {incidents.length} incident(s)
                  en cours
                </span>
                <Link to="/gestion/incidents" className="text-xs underline">
                  Voir
                </Link>
              </li>
            )}
            {!requests.length && !toCopy.length && !incidents.length && (
              <Empty>Tout est à jour 👌</Empty>
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function ResaList({
  items,
  date,
  empty,
}: {
  items: ReturnType<typeof usePms>["data"]["pms_reservations"];
  date: "check_in" | "check_out";
  empty: string;
}) {
  const propertyName = usePropertyName();
  if (!items.length) return <Empty>{empty}</Empty>;
  return (
    <ul className="divide-y divide-border">
      {items.map((r) => (
        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
          <div>
            <div className="font-medium">{r.guest_name || "Voyageur (nom à compléter)"}</div>
            <div className="text-xs text-muted-foreground">
              {propertyName(r.property_id)} · {formatDay(r[date])} · {r.guests} pers.
              {date === "check_in" && r.arrival_time ? ` · arrivée ${r.arrival_time}` : ""}
            </div>
          </div>
          <PlatformBadge platform={r.platform} />
        </li>
      ))}
    </ul>
  );
}

function GoTo({ to }: { to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-xs font-medium text-primary">
      Tout voir <ArrowRight className="size-3.5" />
    </Link>
  );
}

function Alert({ tone, children }: { tone: "bad" | "warn"; children: React.ReactNode }) {
  return (
    <div
      className={
        tone === "bad"
          ? "rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
          : "rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      }
    >
      {children}
    </div>
  );
}
