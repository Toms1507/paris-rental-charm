import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import { usePms } from "@/components/gestion/PmsProvider";
import { ReservationDialog, type ResaDraft } from "@/components/gestion/ReservationDialog";
import { Empty, PageHeader } from "@/components/gestion/ui";
import { addDays, diffDays, todayParis } from "@/lib/pms/dates";
import { PLATFORMS } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestion/calendrier")({ component: CalendarPage });

const DAY_W = 44;
const fmtHead = new Intl.DateTimeFormat("fr-FR", { weekday: "narrow", day: "numeric" });
const fmtMonth = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

function CalendarPage() {
  const { data } = usePms();
  const today = todayParis();
  const [start, setStart] = useState(addDays(today, -3));
  const [span, setSpan] = useState(28);
  const [draft, setDraft] = useState<ResaDraft | null>(null);
  const end = addDays(start, span);
  const days = Array.from({ length: span }, (_, i) => addDays(start, i));
  const properties = data.pms_properties.filter((p) => p.active);

  return (
    <div>
      <PageHeader
        title="Calendrier unifié"
        subtitle="Toutes les plateformes réunies. Cliquez sur une réservation pour la compléter, ou sur un jour libre pour ajouter une réservation directe ou bloquer des dates."
        actions={
          <>
            <div className="flex items-center rounded-md border border-border bg-card">
              <button
                className="p-2 hover:bg-muted"
                onClick={() => setStart(addDays(start, -7))}
                aria-label="Semaine précédente"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                className="px-3 text-sm font-medium"
                onClick={() => setStart(addDays(today, -3))}
              >
                Aujourd'hui
              </button>
              <button
                className="p-2 hover:bg-muted"
                onClick={() => setStart(addDays(start, 7))}
                aria-label="Semaine suivante"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <select
              className="rounded-md border border-border bg-card px-2 text-sm"
              value={span}
              onChange={(e) => setSpan(Number(e.target.value))}
            >
              <option value={14}>2 semaines</option>
              <option value={28}>4 semaines</option>
              <option value={60}>2 mois</option>
            </select>
            <button
              className="btn-primary inline-flex items-center gap-1.5"
              onClick={() =>
                setDraft({ check_in: today, check_out: addDays(today, 2), platform: "direct" })
              }
            >
              <Plus className="size-4" /> Réservation
            </button>
          </>
        }
      />

      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        {Object.entries(PLATFORMS).map(([k, p]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm" style={{ background: p.color }} /> {p.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-[repeating-linear-gradient(45deg,#cbd5e1,#cbd5e1_3px,#e2e8f0_3px,#e2e8f0_6px)]" />{" "}
          Bloqué
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="size-3 text-emerald-600" /> Ménage
        </span>
      </div>

      {properties.length === 0 ? (
        <Empty>Ajoutez un logement pour voir son calendrier.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <div style={{ minWidth: 200 + span * DAY_W }}>
            <div className="sticky top-0 z-10 flex border-b border-border bg-card">
              <div className="w-[200px] shrink-0 border-r border-border px-3 py-2 text-xs font-semibold capitalize text-muted-foreground">
                {fmtMonth.format(new Date(`${start}T12:00:00Z`))}
              </div>
              {days.map((d) => {
                const date = new Date(`${d}T12:00:00Z`);
                const weekend = [0, 6].includes(date.getUTCDay());
                return (
                  <div
                    key={d}
                    style={{ width: DAY_W }}
                    className={cn(
                      "shrink-0 border-r border-border/60 py-2 text-center text-[11px]",
                      weekend && "bg-muted/60",
                      d === today && "bg-primary text-primary-foreground font-semibold",
                    )}
                  >
                    {fmtHead.format(date)}
                  </div>
                );
              })}
            </div>
            {properties.map((p) => {
              const resas = data.pms_reservations.filter(
                (r) =>
                  r.property_id === p.id &&
                  r.status !== "annulee" &&
                  r.check_out > start &&
                  r.check_in < end,
              );
              const tasks = data.pms_cleaning_tasks.filter(
                (t) => t.property_id === p.id && t.date >= start && t.date < end,
              );
              return (
                <div key={p.id} className="flex border-b border-border last:border-0">
                  <div className="w-[200px] shrink-0 border-r border-border px-3 py-3">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {p.arrondissement ?? p.address}
                    </div>
                  </div>
                  <div className="relative h-14 flex-1">
                    <div className="absolute inset-0 flex">
                      {days.map((d) => (
                        <button
                          key={d}
                          style={{ width: DAY_W }}
                          className={cn(
                            "h-full shrink-0 border-r border-border/40 hover:bg-primary/5",
                            d === today && "bg-primary/5",
                          )}
                          onClick={() =>
                            setDraft({
                              property_id: p.id,
                              check_in: d,
                              check_out: addDays(d, 1),
                              platform: "direct",
                            })
                          }
                          aria-label={`Nouvelle réservation le ${d}`}
                        />
                      ))}
                    </div>
                    {resas.map((r) => {
                      // Les séjours commencent et finissent à mi-journée, comme sur les plateformes.
                      const from = Math.max(diffDays(start, r.check_in) + 0.5, 0);
                      const to = Math.min(diffDays(start, r.check_out) + 0.5, span);
                      const color = PLATFORMS[r.platform]?.color ?? "#586474";
                      const blocked = r.status === "bloquee";
                      return (
                        <button
                          key={r.id}
                          onClick={() => setDraft(r)}
                          title={`${r.guest_name ?? (blocked ? "Bloqué" : "Réservé")} · ${r.check_in} → ${r.check_out}`}
                          className={cn(
                            "absolute top-2.5 flex h-9 items-center overflow-hidden rounded-md px-2 text-left text-xs font-medium shadow-sm",
                            blocked
                              ? "bg-[repeating-linear-gradient(45deg,#cbd5e1,#cbd5e1_4px,#e2e8f0_4px,#e2e8f0_8px)] text-slate-700"
                              : "text-white",
                          )}
                          style={{
                            left: from * DAY_W + 1,
                            width: Math.max(12, (to - from) * DAY_W - 2),
                            background: blocked ? undefined : color,
                          }}
                        >
                          <span className="truncate">
                            {blocked ? "Bloqué" : r.guest_name || PLATFORMS[r.platform]?.label}
                            {!blocked && ` · ${r.guests}p`}
                          </span>
                        </button>
                      );
                    })}
                    {tasks.map((t) => (
                      <span
                        key={t.id}
                        title={`Ménage ${t.window_start ?? ""}${t.condition ? ` · ${t.condition}` : ""}`}
                        className={cn(
                          "pointer-events-none absolute bottom-0.5 flex size-4 items-center justify-center rounded-full",
                          t.condition === "rouge"
                            ? "bg-red-500"
                            : t.condition === "orange"
                              ? "bg-amber-500"
                              : t.status === "termine"
                                ? "bg-emerald-500"
                                : "bg-white ring-1 ring-emerald-500",
                        )}
                        style={{ left: (diffDays(start, t.date) + 0.5) * DAY_W - 8 }}
                      >
                        <Sparkles
                          className={cn(
                            "size-2.5",
                            t.status === "termine" || t.condition
                              ? "text-white"
                              : "text-emerald-600",
                          )}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <ReservationDialog draft={draft} onClose={() => setDraft(null)} />
    </div>
  );
}
