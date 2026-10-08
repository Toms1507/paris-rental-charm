import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, CalendarPlus, CheckCircle2, KeyRound, MapPin, Play, Users } from "lucide-react";
import { detectMode, getPublicApi } from "@/components/gestion/PmsProvider";
import { compressImage } from "@/components/gestion/ui";
import { addDays, formatLongDay, todayParis } from "@/lib/pms/dates";
import { pmsCleanerAlert } from "@/lib/pms/functions";
import {
  CONDITIONS,
  type CleanerTaskView,
  type CleanerView,
  type Condition,
} from "@/lib/pms/types";
import { STORAGE_PREFIX, type PublicApi } from "@/lib/pms/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menage/$token")({
  head: () => ({
    meta: [{ title: "Mes ménages | Spinelle" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  ssr: false,
  component: CleanerPortal,
});

function CleanerPortal() {
  const { token } = Route.useParams();
  const [api, setApi] = useState<PublicApi | null>(null);
  const [view, setView] = useState<CleanerView | null | undefined>(undefined);
  const [tab, setTab] = useState<"avenir" | "faits">("avenir");

  async function load(a: PublicApi) {
    try {
      setView(await a.getCleaner(token));
    } catch {
      setView(null);
    }
  }

  useEffect(() => {
    detectMode().then((m) => {
      const a = getPublicApi(m);
      setApi(a);
      void load(a);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (view === undefined)
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand text-sm">
        Chargement…
      </div>
    );
  if (!view || !api)
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-6 text-center">
        Ce lien n'est plus valide. Contactez Spinelle Conciergerie.
      </div>
    );

  const today = todayParis();
  const tasks = view.tasks.filter((t) =>
    tab === "avenir"
      ? t.task.status !== "termine" || t.task.date >= today
      : t.task.status === "termine",
  );
  const list = tab === "faits" ? [...tasks].reverse() : tasks;
  const feed = `${window.location.origin}/api/pms/menage/${token}`;

  return (
    <div className="min-h-screen bg-sand pb-16">
      <header className="bg-ink px-4 pb-5 pt-6 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm opacity-80">Spinelle Conciergerie · Ménages</p>
          <h1 className="font-display text-2xl font-semibold">
            Bonjour {view.cleaner.name.split(" ")[0]} 👋
          </h1>
          {api.mode === "cloud" && (
            <a
              href={feed.replace(/^https?:/, "webcal:")}
              className="mt-2 inline-flex items-center gap-1.5 text-sm underline opacity-90"
            >
              <CalendarPlus className="size-4" /> Ajouter mon planning à mon agenda
            </a>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <div className="flex rounded-full border border-border bg-white p-1 text-sm font-medium">
          {(["avenir", "faits"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={cn(
                "flex-1 rounded-full py-2",
                tab === v && "bg-primary text-primary-foreground",
              )}
            >
              {v === "avenir" ? "À faire" : "Terminés"}
            </button>
          ))}
        </div>
        {list.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-muted-foreground">
            Aucun ménage pour l'instant.
          </p>
        )}
        {list.map((t) => (
          <TaskCard
            key={t.task.id}
            item={t}
            api={api}
            token={token}
            onChange={() => load(api)}
            today={today}
          />
        ))}
      </main>
    </div>
  );
}

function TaskCard({
  item,
  api,
  token,
  onChange,
  today,
}: {
  item: CleanerTaskView;
  api: PublicApi;
  token: string;
  onChange: () => void;
  today: string;
}) {
  const { task, property, next } = item;
  const [open, setOpen] = useState(task.date === today && task.status !== "termine");
  const [notes, setNotes] = useState(task.report_notes ?? "");
  const [checklist, setChecklist] = useState(task.checklist);
  const [photos, setPhotos] = useState(task.photos);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [condition, setCondition] = useState<Condition | null>(task.condition);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const done = task.status === "termine";
  const sameDay = next && next.check_in === task.date;
  const when =
    task.date === today
      ? "Aujourd'hui"
      : task.date === addDays(today, 1)
        ? "Demain"
        : formatLongDay(task.date);

  async function patch(p: Parameters<PublicApi["cleanerUpdateTask"]>[2]) {
    setError(null);
    try {
      await api.cleanerUpdateTask(token, task.id, p);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const urls = [...photos];
      const added: Record<string, string> = {};
      for (const f of Array.from(files)) {
        const blob = await compressImage(f);
        const ref = await api.uploadCleaningPhoto(task.id, blob);
        added[ref] = URL.createObjectURL(blob);
        urls.push(ref);
      }
      setPreviews((p) => ({ ...p, ...added }));
      setPhotos(urls);
      await api.cleanerUpdateTask(token, task.id, { photos: urls });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    if (!condition) return setError("Choisissez l'état du logement (vert, orange ou rouge).");
    if ((condition === "orange" || condition === "rouge") && !notes.trim())
      return setError("Décrivez le problème en quelques mots.");
    setBusy(true);
    await patch({ status: "termine", condition, report_notes: notes || null, checklist, photos });
    if (api.mode === "cloud" && condition !== "vert")
      void pmsCleanerAlert({ data: { token, taskId: task.id } }).catch(() => undefined);
    setBusy(false);
    setOpen(false);
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        task.condition === "rouge"
          ? "border-red-300"
          : task.condition === "orange"
            ? "border-amber-300"
            : "border-border",
      )}
    >
      <button className="w-full p-4 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">{when}</div>
            <div className="text-lg font-semibold">{property.name}</div>
            <div className="text-sm text-muted-foreground">
              À partir de {task.window_start ?? "11:00"}
              {sameDay ? (
                <b className="text-amber-700">
                  {" "}
                  · voyageurs à {task.window_end ?? next?.arrival_time ?? "16:00"}
                </b>
              ) : next ? (
                ` · prochaine arrivée ${formatLongDay(next.check_in)}`
              ) : (
                ""
              )}
            </div>
          </div>
          {done ? (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-semibold",
                task.condition ? CONDITIONS[task.condition].className : "",
              )}
            >
              {task.condition ? CONDITIONS[task.condition].label : "Terminé"}
            </span>
          ) : task.status === "en_cours" ? (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
              En cours
            </span>
          ) : null}
        </div>
        {next && (
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            <Users className="size-4 text-muted-foreground" /> Préparer pour {next.guests}{" "}
            voyageur(s)
          </div>
        )}
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          {property.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 text-sm text-primary underline"
            >
              <MapPin className="size-4" /> {property.address}
            </a>
          )}
          {(property.access.door_code ||
            property.access.keybox_code ||
            property.access.access_details) && (
            <div className="rounded-xl bg-sand p-3 text-sm">
              <div className="mb-1 flex items-center gap-1.5 font-semibold">
                <KeyRound className="size-4" /> Accès
              </div>
              {property.access.access_details && (
                <p className="whitespace-pre-line">{property.access.access_details}</p>
              )}
              <div className="mt-1 flex flex-wrap gap-4 font-mono">
                {property.access.door_code && <span>Porte : {property.access.door_code}</span>}
                {property.access.keybox_code && <span>Boîte : {property.access.keybox_code}</span>}
              </div>
            </div>
          )}
          {property.access.cleaning_notes && (
            <p className="whitespace-pre-line rounded-xl bg-sky-50 p-3 text-sm text-sky-900">
              {property.access.cleaning_notes}
            </p>
          )}
          {next?.notes && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              Prochains voyageurs : {next.notes}
            </p>
          )}

          {!done && task.status === "a_faire" && (
            <button
              className="btn-primary flex w-full items-center justify-center gap-2"
              onClick={() => patch({ status: "en_cours" })}
            >
              <Play className="size-4" /> Je commence le ménage
            </button>
          )}

          {checklist.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-semibold">Check-list</div>
              <ul className="space-y-1.5">
                {checklist.map((c, i) => (
                  <li key={i}>
                    <label className="flex items-start gap-3 rounded-lg border border-border p-2.5 text-sm">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-5"
                        checked={Boolean(c.done)}
                        disabled={done}
                        onChange={(e) => {
                          const next = checklist.map((x, j) =>
                            j === i ? { ...x, done: e.target.checked } : x,
                          );
                          setChecklist(next);
                          void api
                            .cleanerUpdateTask(token, task.id, { checklist: next })
                            .catch(() => undefined);
                        }}
                      />
                      <span className={cn(c.done && "text-muted-foreground line-through")}>
                        {c.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-2 text-sm font-semibold">Photos ({photos.length})</div>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((src) =>
                // Espace privé : le prestataire voit l'aperçu de ses envois récents, sinon une vignette.
                previews[src] || !src.startsWith(STORAGE_PREFIX) ? (
                  <img
                    key={src}
                    src={previews[src] ?? src}
                    alt=""
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ) : (
                  <div
                    key={src}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg bg-emerald-50 text-xs text-emerald-800"
                  >
                    <CheckCircle2 className="size-5" /> Photo envoyée
                  </div>
                ),
              )}
              {!done && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground">
                  <Camera className="size-6" />
                  {busy ? "Envoi…" : "Ajouter"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addPhotos(e.target.files)}
                  />
                </label>
              )}
            </div>
            {!done && (
              <p className="mt-1 text-xs text-muted-foreground">
                Photos conseillées : chaque pièce, salle de bain, cuisine, et tout problème
                constaté.
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold">État du logement</div>
            <div className="space-y-2">
              {(Object.keys(CONDITIONS) as Condition[]).map((c) => (
                <button
                  key={c}
                  disabled={done}
                  onClick={() => setCondition(c)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left",
                    CONDITIONS[c].className,
                    condition === c ? "ring-2 ring-primary ring-offset-2" : "opacity-70",
                  )}
                >
                  <span
                    className={cn(
                      "size-5 shrink-0 rounded-full",
                      c === "vert"
                        ? "bg-emerald-500"
                        : c === "orange"
                          ? "bg-amber-500"
                          : "bg-red-500",
                    )}
                  />
                  <span>
                    <span className="block font-semibold">{CONDITIONS[c].label}</span>
                    <span className="block text-xs">{CONDITIONS[c].hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm">
            <span className="font-semibold">Commentaire</span>
            <textarea
              rows={3}
              value={notes}
              disabled={done}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                condition === "vert" || !condition
                  ? "Facultatif"
                  : "Ex. ampoule grillée salon, disjoncteur cuisine qui saute…"
              }
              className="mt-1 w-full rounded-lg border border-input px-3 py-2"
            />
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}
          {!done ? (
            <button
              className="btn-primary flex w-full items-center justify-center gap-2 py-3"
              onClick={finish}
              disabled={busy}
            >
              <CheckCircle2 className="size-5" /> Ménage terminé
            </button>
          ) : (
            <p className="text-center text-sm text-emerald-700">Merci, compte rendu envoyé ✅</p>
          )}
        </div>
      )}
    </article>
  );
}
