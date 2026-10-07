import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Camera, Plus, Send, Users } from "lucide-react";
import { origin, usePms, usePropertyName } from "@/components/gestion/PmsProvider";
import { CONDITIONS, type CleaningTask, type Condition } from "@/lib/pms/types";
import {
  ConditionBadge,
  Empty,
  Field,
  Modal,
  num,
  PageHeader,
  Pill,
  Select,
  TextArea,
  TextInput,
} from "@/components/gestion/ui";
import {
  addDays,
  euros,
  formatDateTime,
  formatDay,
  formatLongDay,
  todayParis,
} from "@/lib/pms/dates";
import { whatsappLink } from "@/lib/pms/templates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestion/menage")({ component: CleaningPage });

function CleaningPage() {
  const { data, save } = usePms();
  const propertyName = usePropertyName();
  const today = todayParis();
  const [view, setView] = useState<"avenir" | "passes">("avenir");
  const [cleanerFilter, setCleanerFilter] = useState("");
  const [open, setOpen] = useState<CleaningTask | null>(null);
  const [creating, setCreating] = useState(false);

  const tasks = useMemo(
    () =>
      data.pms_cleaning_tasks
        .filter((t) =>
          view === "avenir"
            ? t.date >= today || t.status !== "termine"
            : t.date < today && t.status === "termine",
        )
        .filter(
          (t) =>
            !cleanerFilter ||
            t.cleaner_id === cleanerFilter ||
            (cleanerFilter === "aucun" && !t.cleaner_id),
        )
        .sort((a, b) =>
          view === "avenir" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
        ),
    [data, view, cleanerFilter, today],
  );
  const byDay = tasks.reduce<Record<string, CleaningTask[]>>(
    (acc, t) => ((acc[t.date] ??= []).push(t), acc),
    {},
  );

  function weekPlan(cleanerId: string) {
    const c = data.pms_cleaners.find((x) => x.id === cleanerId);
    if (!c) return null;
    const mine = data.pms_cleaning_tasks
      .filter((t) => t.cleaner_id === c.id && t.date >= today && t.date <= addDays(today, 7))
      .sort((a, b) => a.date.localeCompare(b.date));
    const lines = mine.map((t) => {
      const next = data.pms_reservations.find((r) => r.id === t.next_reservation_id);
      return `• ${formatDay(t.date)} ${t.window_start ?? ""}${t.window_end ? `→${t.window_end}` : ""} : ${propertyName(t.property_id)}${next ? ` (prochains voyageurs : ${next.guests})` : ""}`;
    });
    return {
      c,
      text: `Bonjour ${c.name.split(" ")[0]}, voici vos ménages des 7 prochains jours :\n${lines.join("\n") || "aucun"}\n\nDétails, codes, check-list et photos : ${origin()}/menage/${c.token}`,
    };
  }

  return (
    <div>
      <PageHeader
        title="Ménages"
        subtitle="Créés automatiquement à chaque départ, avec l'heure de sortie, l'arrivée suivante et le nombre de voyageurs. Les prestataires reçoivent tout sur leur portail et leur agenda."
        actions={
          <button
            className="btn-primary inline-flex items-center gap-1.5"
            onClick={() => setCreating(true)}
          >
            <Plus className="size-4" /> Ménage ponctuel
          </button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-border bg-card p-0.5 text-sm">
          {(["avenir", "passes"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded px-3 py-1.5",
                view === v && "bg-primary text-primary-foreground",
              )}
            >
              {v === "avenir" ? "À venir" : "Terminés"}
            </button>
          ))}
        </div>
        <Select
          className="w-auto"
          value={cleanerFilter}
          onChange={(e) => setCleanerFilter(e.target.value)}
          options={[
            { value: "", label: "Tous les prestataires" },
            { value: "aucun", label: "Non attribués" },
            ...data.pms_cleaners.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        {data.pms_cleaners
          .filter((c) => c.active && c.phone)
          .map((c) => {
            const plan = weekPlan(c.id);
            return plan ? (
              <a
                key={c.id}
                href={whatsappLink(c.phone!, plan.text)}
                target="_blank"
                rel="noopener"
                className="btn-outline inline-flex items-center gap-1.5 text-sm"
              >
                <Send className="size-3.5" /> Planning à {c.name.split(" ")[0]}
              </a>
            ) : null;
          })}
      </div>

      {tasks.length === 0 ? (
        <Empty>
          {view === "avenir"
            ? "Aucun ménage à venir. Ils apparaissent dès qu'une réservation est importée."
            : "Aucun ménage terminé."}
        </Empty>
      ) : (
        <div className="space-y-5">
          {Object.entries(byDay).map(([day, list]) => (
            <div key={day}>
              <h2
                className={cn(
                  "mb-2 text-sm font-semibold capitalize",
                  day === today ? "text-primary" : "text-ink",
                )}
              >
                {day === today ? "Aujourd'hui · " : day === addDays(today, 1) ? "Demain · " : ""}
                {formatLongDay(day)}
              </h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {list.map((t) => {
                  const next = data.pms_reservations.find((r) => r.id === t.next_reservation_id);
                  const done = t.checklist.filter((c) => c.done).length;
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "rounded-xl border bg-card p-4",
                        t.condition === "rouge"
                          ? "border-red-300"
                          : t.condition === "orange"
                            ? "border-amber-300"
                            : "border-border",
                      )}
                    >
                      <button className="w-full text-left" onClick={() => setOpen(t)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium">{propertyName(t.property_id)}</div>
                          {t.status === "termine" ? (
                            <ConditionBadge condition={t.condition} />
                          ) : (
                            <Pill tone={t.status === "en_cours" ? "info" : "neutral"}>
                              {t.status === "en_cours" ? "En cours" : "À faire"}
                            </Pill>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Sortie {t.window_start ?? "?"} ·{" "}
                          {t.window_end ? (
                            <b className="text-amber-700">arrivée à {t.window_end}</b>
                          ) : next ? (
                            `prochaine arrivée ${formatDay(next.check_in)}`
                          ) : (
                            "pas d'arrivée prévue"
                          )}
                          {t.next_guests ? ` · ${t.next_guests} voyageur(s) ensuite` : ""}
                        </div>
                        {next?.notes && (
                          <div className="mt-1 text-xs text-sky-800">📝 {next.notes}</div>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          {t.checklist.length > 0 && (
                            <span>
                              Check-list {done}/{t.checklist.length}
                            </span>
                          )}
                          {t.photos.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Camera className="size-3.5" /> {t.photos.length}
                            </span>
                          )}
                          {t.price > 0 && <span>{euros(t.price)}</span>}
                        </div>
                        {t.report_notes && (
                          <p className="mt-2 line-clamp-2 text-xs">{t.report_notes}</p>
                        )}
                      </button>
                      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                        <Users className="size-4 text-muted-foreground" />
                        <select
                          className={cn(
                            "flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm",
                            !t.cleaner_id && "border-red-300 text-red-700",
                          )}
                          value={t.cleaner_id ?? ""}
                          onChange={(e) =>
                            save("pms_cleaning_tasks", t.id, { cleaner_id: e.target.value || null })
                          }
                        >
                          <option value="">Non attribué</option>
                          {data.pms_cleaners
                            .filter((c) => c.active || c.id === t.cleaner_id)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {open && (
        <TaskDialog
          task={data.pms_cleaning_tasks.find((t) => t.id === open.id) ?? open}
          onClose={() => setOpen(null)}
        />
      )}
      {creating && <NewTaskDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

function TaskDialog({ task, onClose }: { task: CleaningTask; onClose: () => void }) {
  const { save, remove, data } = usePms();
  const propertyName = usePropertyName();
  const [notes, setNotes] = useState(task.report_notes ?? "");
  const [price, setPrice] = useState(String(task.price));
  const incident = data.pms_incidents.find((i) => i.task_id === task.id);

  async function setCondition(condition: Condition) {
    await save("pms_cleaning_tasks", task.id, {
      condition,
      status: "termine",
      completed_at: task.completed_at ?? new Date().toISOString(),
      report_notes: notes || null,
    });
    if (condition !== "vert" && !incident) {
      await save("pms_incidents", null, {
        property_id: task.property_id,
        task_id: task.id,
        reservation_id: task.reservation_id,
        severity: condition,
        title:
          condition === "rouge"
            ? "Problème important signalé au ménage"
            : "Point à vérifier signalé au ménage",
        description: notes || null,
        photos: task.photos,
        reported_by: "Équipe",
      });
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Ménage · ${propertyName(task.property_id)}`}
      description={formatLongDay(task.date)}
      wide
    >
      <div className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Créneau</div>
            {task.window_start ?? "?"} → {task.window_end ?? "libre"}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Statut</div>
            {task.status === "termine"
              ? `Terminé ${task.completed_at ? formatDateTime(task.completed_at) : ""}`
              : task.status === "en_cours"
                ? `Commencé ${task.started_at ? formatDateTime(task.started_at) : ""}`
                : "À faire"}
          </div>
          <Field label="Prix du ménage (€)">
            <TextInput
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => save("pms_cleaning_tasks", task.id, { price: num(price) })}
            />
          </Field>
        </div>
        <div>
          <div className="mb-2 font-medium">État du logement</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(CONDITIONS) as Condition[]).map((c) => (
              <button
                key={c}
                onClick={() => setCondition(c)}
                className={cn(
                  "rounded-lg border-2 p-3 text-left",
                  CONDITIONS[c].className,
                  task.condition === c ? "ring-2 ring-offset-1 ring-primary" : "opacity-80",
                )}
              >
                <div className="font-semibold">{CONDITIONS[c].label}</div>
                <div className="text-xs">{CONDITIONS[c].hint}</div>
              </button>
            ))}
          </div>
        </div>
        <Field label="Compte rendu">
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => save("pms_cleaning_tasks", task.id, { report_notes: notes || null })}
          />
        </Field>
        {task.checklist.length > 0 && (
          <div>
            <div className="mb-1 font-medium">Check-list</div>
            <ul className="grid gap-1 sm:grid-cols-2">
              {task.checklist.map((c, i) => (
                <li
                  key={i}
                  className={cn("text-xs", c.done ? "text-emerald-700" : "text-muted-foreground")}
                >
                  {c.done ? "✓" : "○"} {c.label}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <div className="mb-2 font-medium">Photos ({task.photos.length})</div>
          {task.photos.length ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {task.photos.map((src) => (
                <a key={src} href={src} target="_blank" rel="noopener">
                  <img src={src} alt="" className="aspect-square w-full rounded-md object-cover" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Le prestataire ajoute ses photos depuis son portail.
            </p>
          )}
        </div>
        {incident && (
          <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-900">
            Incident ouvert : {incident.title} ({incident.status})
          </p>
        )}
        <div className="flex justify-between border-t border-border pt-3">
          <button
            className="text-sm text-red-700"
            onClick={async () => {
              if (confirm("Supprimer ce ménage ?")) {
                await remove("pms_cleaning_tasks", task.id, "Ménage");
                onClose();
              }
            }}
          >
            Supprimer
          </button>
          <button className="btn-primary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}

function NewTaskDialog({ onClose }: { onClose: () => void }) {
  const { data, save } = usePms();
  const [propertyId, setPropertyId] = useState(data.pms_properties[0]?.id ?? "");
  const [date, setDate] = useState(todayParis());
  const [start, setStart] = useState("11:00");
  const [notes, setNotes] = useState("");
  const p = data.pms_properties.find((x) => x.id === propertyId);
  return (
    <Modal
      open
      onClose={onClose}
      title="Ménage ponctuel"
      description="Ménage de fond, remise en état, entre deux propriétaires…"
    >
      <div className="space-y-3">
        <Field label="Logement">
          <Select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            options={data.pms_properties.map((x) => ({ value: x.id, label: x.name }))}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Heure">
            <TextInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
        </div>
        <Field label="Consignes">
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <button className="btn-outline" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn-primary"
            disabled={!p}
            onClick={async () => {
              if (!p) return;
              const cleaner = data.pms_cleaners.find((c) => c.id === p.cleaner_id);
              await save("pms_cleaning_tasks", null, {
                property_id: p.id,
                date,
                window_start: start,
                cleaner_id: p.cleaner_id,
                price: cleaner?.rate || p.cleaning_fee,
                checklist: p.checklist.map((c) => ({ label: c.label, done: false })),
                report_notes: notes ? `Consignes : ${notes}` : null,
              });
              onClose();
            }}
          >
            Créer
          </button>
        </div>
      </div>
    </Modal>
  );
}
