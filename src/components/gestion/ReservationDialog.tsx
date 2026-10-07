import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { origin, usePms } from "./PmsProvider";
import { CopyButton, Field, Modal, num, Pill, Select, TextArea, TextInput } from "./ui";
import { formatDateTime, nights } from "@/lib/pms/dates";
import { stayUrl } from "@/lib/pms/templates";
import { PLATFORMS, type Reservation } from "@/lib/pms/types";

export type ResaDraft = Partial<Reservation> & { property_id?: string };

const LANGS = [
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "it", label: "Italien" },
  { value: "de", label: "Allemand" },
  { value: "pt", label: "Portugais" },
  { value: "nl", label: "Néerlandais" },
  { value: "zh", label: "Chinois" },
  { value: "ar", label: "Arabe" },
  { value: "autre", label: "Autre" },
];

export function ReservationDialog({
  draft,
  onClose,
}: {
  draft: ResaDraft | null;
  onClose: () => void;
}) {
  const { data, save, remove } = usePms();
  const [r, setR] = useState<ResaDraft>({});
  useEffect(() => setR(draft ?? {}), [draft]);
  if (!draft) return null;
  const isNew = !draft.id;
  const set = <K extends keyof Reservation>(k: K, v: Reservation[K]) =>
    setR((x) => ({ ...x, [k]: v }));
  const fromIcal = r.source === "ical";
  const messages = data.pms_messages
    .filter((m) => m.reservation_id === r.id)
    .sort((a, b) =>
      (a.scheduled_for ?? a.created_at).localeCompare(b.scheduled_for ?? b.created_at),
    );
  const raw = (r.raw ?? {}) as { reservation_url?: string; reservation_code?: string };

  async function submit() {
    if (!r.property_id || !r.check_in || !r.check_out) return;
    if (r.check_out <= r.check_in)
      return alert("La date de départ doit être après la date d'arrivée.");
    const { id, ...rest } = r;
    const ok = await save("pms_reservations", id ?? null, {
      ...rest,
      updated_at: new Date().toISOString(),
    });
    if (ok) onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "Nouvelle réservation" : r.guest_name || "Réservation"}
      wide
    >
      <div className="space-y-4">
        {fromIcal && (
          <p className="rounded-md bg-sky-50 p-3 text-xs text-sky-900">
            Importée automatiquement depuis {PLATFORMS[r.platform ?? "autre"].label}. Les dates se
            mettent à jour toutes seules ; complétez le nom, l'email (pour l'envoi automatique des
            messages), le nombre de voyageurs et le montant.
            {raw.reservation_url && (
              <a
                href={raw.reservation_url}
                target="_blank"
                rel="noopener"
                className="ml-1 inline-flex items-center gap-1 font-medium underline"
              >
                Ouvrir sur la plateforme <ExternalLink className="size-3" />
              </a>
            )}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Logement">
            <Select
              value={r.property_id ?? ""}
              onChange={(e) => set("property_id", e.target.value)}
              options={[
                { value: "", label: "Choisir…" },
                ...data.pms_properties.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plateforme">
              <Select
                value={r.platform ?? "direct"}
                onChange={(e) => set("platform", e.target.value as Reservation["platform"])}
                options={Object.entries(PLATFORMS).map(([value, p]) => ({ value, label: p.label }))}
              />
            </Field>
            <Field label="Statut">
              <Select
                value={r.status ?? "confirmee"}
                onChange={(e) => set("status", e.target.value as Reservation["status"])}
                options={[
                  { value: "confirmee", label: "Confirmée" },
                  { value: "bloquee", label: "Dates bloquées" },
                  { value: "annulee", label: "Annulée" },
                ]}
              />
            </Field>
          </div>
          <Field label="Arrivée">
            <TextInput
              type="date"
              value={r.check_in ?? ""}
              onChange={(e) => set("check_in", e.target.value)}
              disabled={fromIcal}
            />
          </Field>
          <Field
            label="Départ"
            hint={
              r.check_in && r.check_out
                ? `${nights({ check_in: r.check_in, check_out: r.check_out })} nuit(s)`
                : undefined
            }
          >
            <TextInput
              type="date"
              value={r.check_out ?? ""}
              onChange={(e) => set("check_out", e.target.value)}
              disabled={fromIcal}
            />
          </Field>
          <Field label="Nom du voyageur">
            <TextInput
              value={r.guest_name ?? ""}
              onChange={(e) => set("guest_name", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Voyageurs">
              <TextInput
                type="number"
                min={1}
                value={r.guests ?? 2}
                onChange={(e) => set("guests", Math.max(1, num(e.target.value)))}
              />
            </Field>
            <Field label="Langue">
              <Select
                value={r.guest_language ?? "fr"}
                onChange={(e) => set("guest_language", e.target.value)}
                options={LANGS}
              />
            </Field>
          </div>
          <Field
            label="Email du voyageur"
            hint="Booking fournit une adresse relais (…@guest.booking.com) qui fonctionne."
          >
            <TextInput
              type="email"
              value={r.guest_email ?? ""}
              onChange={(e) => set("guest_email", e.target.value || null)}
            />
          </Field>
          <Field label="Téléphone">
            <TextInput
              type="tel"
              value={r.guest_phone ?? ""}
              onChange={(e) => set("guest_phone", e.target.value || null)}
            />
          </Field>
          <Field label="Heure d'arrivée prévue">
            <TextInput
              type="time"
              value={r.arrival_time ?? ""}
              onChange={(e) => set("arrival_time", e.target.value || null)}
            />
          </Field>
          <Field label="Heure de départ (si départ tardif accordé)">
            <TextInput
              type="time"
              value={r.departure_time ?? ""}
              onChange={(e) => set("departure_time", e.target.value || null)}
            />
          </Field>
          <Field label="Montant payé par le voyageur (€)" hint="Ménage inclus">
            <TextInput
              inputMode="decimal"
              value={r.amount_gross ?? 0}
              onChange={(e) => set("amount_gross", num(e.target.value))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Frais plateforme (€)">
              <TextInput
                inputMode="decimal"
                value={r.platform_fee ?? 0}
                onChange={(e) => set("platform_fee", num(e.target.value))}
              />
            </Field>
            <Field label="Dont frais de ménage (€)">
              <TextInput
                inputMode="decimal"
                value={r.cleaning_fee ?? 0}
                onChange={(e) => set("cleaning_fee", num(e.target.value))}
              />
            </Field>
          </div>
        </div>
        <Field label="Notes (visibles par l'équipe et la femme de ménage pour la préparation)">
          <TextArea
            value={r.notes ?? ""}
            onChange={(e) => set("notes", e.target.value || null)}
            placeholder="Ex. lit bébé, arrivée tardive, anniversaire…"
          />
        </Field>

        {!isNew && r.guest_token && (
          <div className="rounded-md border border-border p-3 text-sm">
            <div className="mb-1 font-medium">Livret d'accueil du voyageur</div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="break-all rounded bg-muted px-2 py-1 text-xs">
                {stayUrl(origin(), { guest_token: r.guest_token })}
              </code>
              <CopyButton text={stayUrl(origin(), { guest_token: r.guest_token })} />
              <a
                href={`/sejour/${r.guest_token}`}
                target="_blank"
                rel="noopener"
                className="text-xs font-medium text-primary underline"
              >
                Ouvrir
              </a>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="text-sm">
            <div className="mb-2 font-medium">Messages</div>
            <ul className="space-y-1.5">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/60 px-3 py-1.5"
                >
                  <span className="truncate">
                    {m.direction === "entrant" ? "❓ " : ""}
                    {m.channel === "assistant" ? m.body.slice(0, 80) : m.subject}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {m.scheduled_for || m.sent_at
                      ? formatDateTime(m.sent_at ?? m.scheduled_for ?? m.created_at)
                      : ""}
                    <Pill
                      tone={
                        m.status === "envoye"
                          ? "ok"
                          : m.status === "echec"
                            ? "bad"
                            : m.status === "a_copier"
                              ? "info"
                              : "neutral"
                      }
                    >
                      {m.status.replace("_", " ")}
                    </Pill>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
          {!isNew ? (
            <button
              className="inline-flex items-center gap-1.5 text-sm text-red-700"
              onClick={async () => {
                if (
                  !confirm(
                    fromIcal
                      ? "Cette réservation reviendra à la prochaine synchro si elle est toujours sur la plateforme. Supprimer ?"
                      : "Supprimer cette réservation ?",
                  )
                )
                  return;
                await remove("pms_reservations", r.id!, "Réservation");
                onClose();
              }}
            >
              <Trash2 className="size-4" /> Supprimer
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button className="btn-outline" onClick={onClose}>
              Annuler
            </button>
            <button
              className="btn-primary"
              onClick={submit}
              disabled={!r.property_id || !r.check_in || !r.check_out}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
