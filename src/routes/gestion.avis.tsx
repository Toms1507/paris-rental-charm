import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { usePms, usePropertyName } from "@/components/gestion/PmsProvider";
import {
  CopyButton,
  Empty,
  Field,
  Modal,
  num,
  PageHeader,
  Panel,
  PlatformBadge,
  Select,
  Stat,
  TextArea,
  TextInput,
} from "@/components/gestion/ui";
import { addDays, formatDay, todayParis } from "@/lib/pms/dates";
import { pmsDraftReview } from "@/lib/pms/functions";
import { PLATFORMS, type Review } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestion/avis")({ component: ReviewsPage });

function ReviewsPage() {
  const { data } = usePms();
  const propertyName = usePropertyName();
  const [edit, setEdit] = useState<Partial<Review> | null>(null);
  const reviews = [...data.pms_reviews].sort((a, b) => b.date.localeCompare(a.date));
  const avg = (list: Review[]) =>
    list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : null;
  const recent = reviews.filter((r) => r.date >= addDays(todayParis(), -90));
  const feedback = data.pms_guest_requests
    .filter((q) => q.type === "avis_sejour")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const unanswered = reviews.filter((r) => !r.response);
  const stayed = data.pms_reservations.filter(
    (r) =>
      r.status === "confirmee" &&
      r.check_out < todayParis() &&
      r.check_out >= addDays(todayParis(), -90),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avis voyageurs"
        subtitle="Suivi des notes, réponses rédigées par l'IA, et retours privés recueillis pendant le séjour pour régler les problèmes avant qu'ils ne deviennent des avis."
        actions={
          <button
            className="btn-primary inline-flex items-center gap-1.5"
            onClick={() =>
              setEdit({
                platform: "airbnb",
                rating: 5,
                date: todayParis(),
                property_id: data.pms_properties[0]?.id ?? "",
              })
            }
          >
            <Plus className="size-4" /> Ajouter un avis
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Note globale"
          value={avg(reviews) ? `${avg(reviews)!.toFixed(2)} ★` : "—"}
          hint={`${reviews.length} avis`}
        />
        <Stat
          label="Note 90 derniers jours"
          value={avg(recent) ? `${avg(recent)!.toFixed(2)} ★` : "—"}
          hint={`${recent.length} avis`}
          tone={avg(recent) === null ? undefined : avg(recent)! >= 4.8 ? "ok" : "warn"}
        />
        <Stat
          label="Taux d'avis (90 j)"
          value={stayed ? `${Math.round((recent.length / stayed) * 100)} %` : "—"}
          hint={`${stayed} séjours terminés`}
        />
        <Stat
          label="Sans réponse"
          value={unanswered.length}
          tone={unanswered.length ? "warn" : "ok"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {data.pms_properties.map((p) => {
          const list = reviews.filter((r) => r.property_id === p.id);
          const a = avg(list);
          return (
            <Panel key={p.id} title={p.name}>
              <div className="text-2xl font-semibold">{a ? `${a.toFixed(2)} ★` : "—"}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {(Object.keys(PLATFORMS) as (keyof typeof PLATFORMS)[]).map((k) => {
                  const pl = list.filter((r) => r.platform === k);
                  return pl.length ? (
                    <span key={k}>
                      {PLATFORMS[k].label} {avg(pl)!.toFixed(1)} ({pl.length})
                    </span>
                  ) : null;
                })}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel title="Ce qui fait monter les notes, déjà automatisé">
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li>✅ Message de bienvenue immédiat avec livret d'accueil personnalisé</li>
          <li>✅ Instructions d'arrivée la veille, codes visibles au bon moment</li>
          <li>
            ✅ « Tout se passe bien ? » le lendemain de l'arrivée : les soucis sont réglés pendant
            le séjour
          </li>
          <li>✅ Assistant 24 h/24 qui répond en quelques secondes, dans la langue du voyageur</li>
          <li>✅ Départ tardif proposé la veille du départ</li>
          <li>✅ Remerciement et demande d'avis après le départ</li>
          <li>✅ Ménage contrôlé avec photos et alerte immédiate en cas de problème</li>
          <li>✅ Retour privé du voyageur : une note basse vous alerte tout de suite</li>
        </ul>
      </Panel>

      {feedback.length > 0 && (
        <Panel title="Retours privés pendant le séjour">
          <ul className="divide-y divide-border">
            {feedback.map((q) => {
              const r = data.pms_reservations.find((x) => x.id === q.reservation_id);
              return (
                <li key={q.id} className="py-2 text-sm">
                  <span
                    className={cn(
                      "font-semibold",
                      (q.rating ?? 5) <= 3 ? "text-red-700" : "text-emerald-700",
                    )}
                  >
                    {q.rating ? `${q.rating}/5` : ""}
                  </span>{" "}
                  · {r?.guest_name ?? "Voyageur"} · {propertyName(r?.property_id)}
                  {q.details && <p className="text-muted-foreground">{q.details}</p>}
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <Empty>
            Aucun avis enregistré. Les plateformes ne transmettent pas les avis par calendrier :
            ajoutez-les ici (ou ils arriveront automatiquement une fois les comptes connectés via un
            channel manager).
          </Empty>
        ) : (
          reviews.map((r) => (
            <button
              key={r.id}
              onClick={() => setEdit(r)}
              className="block w-full rounded-xl border border-border bg-card p-4 text-left"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-semibold",
                      r.rating >= 4.5
                        ? "text-emerald-700"
                        : r.rating >= 4
                          ? "text-amber-700"
                          : "text-red-700",
                    )}
                  >
                    {r.rating} ★
                  </span>
                  <span className="text-sm">{propertyName(r.property_id)}</span>
                  <PlatformBadge platform={r.platform} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDay(r.date)} {r.response ? "· répondu" : "· sans réponse"}
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
            </button>
          ))
        )}
      </div>
      {edit && <ReviewDialog review={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function ReviewDialog({ review, onClose }: { review: Partial<Review>; onClose: () => void }) {
  const { data, save, remove, settings, mode, config } = usePms();
  const [r, setR] = useState(review);
  const [rating, setRating] = useState(String(review.rating ?? 5));
  const [busy, setBusy] = useState(false);
  const property = data.pms_properties.find((p) => p.id === r.property_id);
  const resa = data.pms_reservations.find((x) => x.id === r.reservation_id);

  async function draft() {
    setBusy(true);
    try {
      const res = await pmsDraftReview({
        data: {
          rating: num(rating),
          comment: r.comment ?? "",
          guest: resa?.guest_name ?? "",
          property: property?.name ?? "",
          signature: settings.signature,
        },
      });
      setR((x) => ({ ...x, response: res.text }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={r.id ? "Avis" : "Nouvel avis"} wide>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Logement" className="sm:col-span-2">
            <Select
              value={r.property_id}
              onChange={(e) => setR({ ...r, property_id: e.target.value })}
              options={data.pms_properties.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Field>
          <Field label="Plateforme">
            <Select
              value={r.platform}
              onChange={(e) => setR({ ...r, platform: e.target.value as Review["platform"] })}
              options={Object.entries(PLATFORMS).map(([value, p]) => ({ value, label: p.label }))}
            />
          </Field>
          <Field label="Note (sur 5)">
            <TextInput
              inputMode="decimal"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date">
            <TextInput
              type="date"
              value={r.date}
              onChange={(e) => setR({ ...r, date: e.target.value })}
            />
          </Field>
          <Field label="Séjour concerné">
            <Select
              value={r.reservation_id ?? ""}
              onChange={(e) => setR({ ...r, reservation_id: e.target.value || null })}
              options={[
                { value: "", label: "—" },
                ...data.pms_reservations
                  .filter((x) => x.property_id === r.property_id && x.status === "confirmee")
                  .sort((a, b) => b.check_in.localeCompare(a.check_in))
                  .slice(0, 30)
                  .map((x) => ({
                    value: x.id,
                    label: `${x.guest_name ?? "Voyageur"} · ${formatDay(x.check_in)}`,
                  })),
              ]}
            />
          </Field>
        </div>
        <Field label="Commentaire du voyageur">
          <TextArea
            rows={4}
            value={r.comment ?? ""}
            onChange={(e) => setR({ ...r, comment: e.target.value })}
          />
        </Field>
        <Field label="Réponse publique">
          <TextArea
            rows={5}
            value={r.response ?? ""}
            onChange={(e) => setR({ ...r, response: e.target.value })}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-outline inline-flex items-center gap-1.5 text-sm"
            onClick={draft}
            disabled={busy || mode === "demo" || !config?.ai}
            title={mode === "demo" || !config?.ai ? "Nécessite la base et la clé IA" : undefined}
          >
            <Wand2 className="size-4" /> {busy ? "Rédaction…" : "Rédiger la réponse avec l'IA"}
          </button>
          {r.response && <CopyButton text={r.response} label="Copier la réponse" />}
        </div>
        <div className="flex justify-between border-t border-border pt-3">
          {r.id ? (
            <button
              className="text-sm text-red-700"
              onClick={async () => {
                await remove("pms_reviews", r.id!, "Avis");
                onClose();
              }}
            >
              Supprimer
            </button>
          ) : (
            <span />
          )}
          <button
            className="btn-primary"
            disabled={!r.property_id}
            onClick={async () => {
              const { id, ...rest } = r;
              if (
                await save("pms_reviews", id ?? null, {
                  ...rest,
                  rating: Math.min(5, Math.max(1, num(rating))),
                })
              )
                onClose();
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}
