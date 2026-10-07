import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Check, ExternalLink, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { origin, usePms, usePropertyName } from "@/components/gestion/PmsProvider";
import {
  CopyButton,
  Empty,
  Field,
  Modal,
  PageHeader,
  Panel,
  Pill,
  Select,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/gestion/ui";
import { formatDateTime, formatDay } from "@/lib/pms/dates";
import { resolveChannel, saveSettings } from "@/lib/pms/engine";
import { renderTemplate, VARIABLES, whatsappLink } from "@/lib/pms/templates";
import {
  REQUEST_TYPES,
  TRIGGERS,
  type GuestRequest,
  type Message,
  type MessageTemplate,
  type Trigger,
} from "@/lib/pms/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestion/messages")({ component: MessagesPage });

type Tab = "demandes" | "a_envoyer" | "programmes" | "historique" | "assistant" | "modeles";

function MessagesPage() {
  const { data, settings, store, reload } = usePms();
  const [tab, setTab] = useState<Tab>("demandes");
  const pending = data.pms_guest_requests.filter((r) => r.status === "en_attente").length;
  const toSend = data.pms_messages.filter(
    (m) => m.status === "a_copier" || m.status === "echec",
  ).length;
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "demandes", label: "Demandes voyageurs", count: pending },
    { id: "a_envoyer", label: "À envoyer via la plateforme", count: toSend },
    { id: "programmes", label: "Programmés" },
    { id: "historique", label: "Envoyés" },
    { id: "assistant", label: "Questions à l'assistant" },
    { id: "modeles", label: "Modèles automatiques" },
  ];
  return (
    <div>
      <PageHeader
        title="Voyageurs et messages"
        subtitle="Messages automatiques à chaque étape du séjour, demandes de départ tardif, problèmes signalés et questions posées à l'assistant."
        actions={
          <Toggle
            checked={settings.auto_send}
            onChange={async (v) => {
              await saveSettings(store, data, { auto_send: v });
              await reload();
            }}
            label="Envoi automatique activé"
          />
        }
      />
      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.count ? (
              <span className="ml-1.5 rounded-full bg-red-600 px-1.5 text-xs text-white">
                {t.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {tab === "demandes" && <Requests />}
      {tab === "a_envoyer" && (
        <MessageList
          filter={(m) => m.status === "a_copier" || m.status === "echec"}
          manual
          empty="Rien à envoyer à la main."
        />
      )}
      {tab === "programmes" && (
        <MessageList
          filter={(m) => m.status === "planifie"}
          empty="Aucun message programmé."
          scheduled
        />
      )}
      {tab === "historique" && (
        <MessageList
          filter={(m) => m.status === "envoye" && m.direction === "sortant"}
          empty="Aucun message envoyé."
        />
      )}
      {tab === "assistant" && <AssistantLog />}
      {tab === "modeles" && <Templates />}
    </div>
  );
}

function Requests() {
  const { data, save } = usePms();
  const propertyName = usePropertyName();
  const list = [...data.pms_guest_requests].sort(
    (a, b) =>
      Number(a.status !== "en_attente") - Number(b.status !== "en_attente") ||
      b.created_at.localeCompare(a.created_at),
  );
  if (!list.length)
    return (
      <Empty>
        Aucune demande pour l'instant. Les voyageurs font leurs demandes depuis leur livret
        d'accueil.
      </Empty>
    );

  async function decide(q: GuestRequest, accept: boolean, answer: string) {
    const r = data.pms_reservations.find((x) => x.id === q.reservation_id);
    await save("pms_guest_requests", q.id, {
      status: accept
        ? "accepte"
        : q.type === "late_checkout" || q.type === "early_checkin"
          ? "refuse"
          : "traite",
      answer: answer || null,
    });
    if (accept && r && q.requested_time) {
      if (q.type === "late_checkout") {
        await save("pms_reservations", r.id, { departure_time: q.requested_time });
        const task = data.pms_cleaning_tasks.find((t) => t.reservation_id === r.id);
        if (task) await save("pms_cleaning_tasks", task.id, { window_start: q.requested_time });
      }
      if (q.type === "early_checkin") {
        await save("pms_reservations", r.id, { arrival_time: q.requested_time });
        const task = data.pms_cleaning_tasks.find((t) => t.next_reservation_id === r.id);
        if (task) await save("pms_cleaning_tasks", task.id, { window_end: q.requested_time });
      }
    }
    toast.success("Réponse enregistrée : le voyageur la voit dans son livret.");
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {list.map((q) => {
        const r = data.pms_reservations.find((x) => x.id === q.reservation_id);
        return (
          <RequestCard
            key={q.id}
            q={q}
            title={`${r?.guest_name ?? "Voyageur"} · ${propertyName(r?.property_id)}`}
            subtitle={r ? `${formatDay(r.check_in)} → ${formatDay(r.check_out)}` : ""}
            onDecide={decide}
          />
        );
      })}
    </div>
  );
}

function RequestCard({
  q,
  title,
  subtitle,
  onDecide,
}: {
  q: GuestRequest;
  title: string;
  subtitle: string;
  onDecide: (q: GuestRequest, accept: boolean, answer: string) => void;
}) {
  const [answer, setAnswer] = useState(q.answer ?? "");
  const timed = q.type === "late_checkout" || q.type === "early_checkin";
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4",
        q.status === "en_attente" ? "border-amber-300" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">
            {REQUEST_TYPES[q.type]}
            {q.requested_time ? ` · ${q.requested_time}` : ""}
            {q.price ? ` · ${q.price} €` : ""}
            {q.rating ? ` · ${"★".repeat(q.rating)}${"☆".repeat(5 - q.rating)}` : ""}
          </div>
          <div className="text-xs text-muted-foreground">
            {title} · {subtitle} · {formatDateTime(q.created_at)}
          </div>
        </div>
        <Pill
          tone={
            q.status === "en_attente"
              ? "warn"
              : q.status === "accepte"
                ? "ok"
                : q.status === "refuse"
                  ? "bad"
                  : "neutral"
          }
        >
          {
            { en_attente: "En attente", accepte: "Accepté", refuse: "Refusé", traite: "Traité" }[
              q.status
            ]
          }
        </Pill>
      </div>
      {q.details && <p className="mt-2 text-sm">{q.details}</p>}
      {q.status === "en_attente" ? (
        <div className="mt-3 space-y-2">
          <TextInput
            placeholder="Réponse au voyageur (facultatif)"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="btn-primary inline-flex items-center gap-1 text-sm"
              onClick={() =>
                onDecide(
                  q,
                  true,
                  answer ||
                    (timed
                      ? "C'est accepté, profitez bien !"
                      : "C'est pris en charge, merci de nous avoir prévenus."),
                )
              }
            >
              <Check className="size-4" /> {timed ? "Accepter" : "Traité"}
            </button>
            {timed && (
              <button
                className="btn-outline inline-flex items-center gap-1 text-sm"
                onClick={() =>
                  onDecide(
                    q,
                    false,
                    answer ||
                      "Désolés, ce n'est pas possible cette fois : d'autres voyageurs arrivent le jour même.",
                  )
                }
              >
                <X className="size-4" /> Refuser
              </button>
            )}
          </div>
          {timed && (
            <p className="text-xs text-muted-foreground">
              Accepter met à jour l'horaire de la réservation et le créneau du ménage.
            </p>
          )}
        </div>
      ) : (
        q.answer && <p className="mt-2 rounded-md bg-muted p-2 text-xs">Réponse : {q.answer}</p>
      )}
    </div>
  );
}

function MessageList({
  filter,
  empty,
  manual,
  scheduled,
}: {
  filter: (m: Message) => boolean;
  empty: string;
  manual?: boolean;
  scheduled?: boolean;
}) {
  const { data, save, runContext, reload } = usePms();
  const propertyName = usePropertyName();
  const list = data.pms_messages
    .filter(filter)
    .sort((a, b) =>
      (a.scheduled_for ?? a.created_at).localeCompare(b.scheduled_for ?? b.created_at),
    );
  if (!list.length) return <Empty>{empty}</Empty>;
  return (
    <div className="space-y-3">
      {manual && (
        <p className="rounded-md bg-sky-50 p-3 text-sm text-sky-900">
          Ces voyageurs n'ont pas d'email connu : copiez le message et collez-le dans la messagerie
          de la plateforme (ou envoyez-le par WhatsApp), puis marquez-le comme envoyé. Une fois vos
          comptes Airbnb / Booking / Abritel connectés via un channel manager, cette étape
          disparaît.
        </p>
      )}
      {list.map((m) => {
        const r = data.pms_reservations.find((x) => x.id === m.reservation_id);
        const url = (r?.raw as { reservation_url?: string } | null)?.reservation_url;
        return (
          <div key={m.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-medium">{m.subject}</div>
                <div className="text-xs text-muted-foreground">
                  {r?.guest_name ?? "Voyageur"} · {propertyName(r?.property_id)} · {m.channel} ·{" "}
                  {formatDateTime(m.sent_at ?? m.scheduled_for ?? m.created_at)}
                  {m.recipient ? ` · ${m.recipient}` : ""}
                </div>
              </div>
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
                {
                  {
                    planifie: "Programmé",
                    envoye: "Envoyé",
                    a_copier: "À copier",
                    echec: "Échec",
                    annule: "Annulé",
                    recu: "Reçu",
                  }[m.status]
                }
              </Pill>
            </div>
            {m.error && <p className="mt-1 text-xs text-red-700">{m.error}</p>}
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-primary">Voir le message</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 font-sans text-sm">
                {m.body}
              </pre>
            </details>
            <div className="mt-3 flex flex-wrap gap-2">
              {manual && (
                <>
                  <CopyButton text={m.body} label="Copier le message" />
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      <ExternalLink className="size-3.5" /> Ouvrir la conversation
                    </a>
                  )}
                  {r?.guest_phone && (
                    <a
                      href={whatsappLink(r.guest_phone, m.body)}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      WhatsApp
                    </a>
                  )}
                  <button
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
                    onClick={() =>
                      save("pms_messages", m.id, {
                        status: "envoye",
                        sent_at: new Date().toISOString(),
                        error: null,
                      })
                    }
                  >
                    <Check className="size-3.5" /> Marquer envoyé
                  </button>
                </>
              )}
              {scheduled && (
                <>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
                    onClick={async () => {
                      await save("pms_messages", m.id, { scheduled_for: new Date().toISOString() });
                      const { sendDueMessages } = await import("@/lib/pms/engine");
                      const { loadAll } = await import("@/lib/pms/store");
                      const ctx = runContext();
                      const summary = {
                        synced: 0,
                        feedErrors: [],
                        newReservations: 0,
                        cancelled: 0,
                        tasksCreated: 0,
                        messagesPlanned: 0,
                        messagesSent: 0,
                        messagesToCopy: 0,
                        messageErrors: 0,
                        reportsSent: 0,
                      };
                      await sendDueMessages(ctx, await loadAll(ctx.store), summary);
                      await reload();
                      toast.success(
                        summary.messagesSent
                          ? "Message envoyé"
                          : summary.messagesToCopy
                            ? "Message prêt à copier (pas d'email voyageur)"
                            : "Traitement terminé",
                      );
                    }}
                  >
                    <Send className="size-3.5" /> Envoyer maintenant
                  </button>
                  <button
                    className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    onClick={() => save("pms_messages", m.id, { status: "annule" })}
                  >
                    Ne pas envoyer
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssistantLog() {
  const { data } = usePms();
  const propertyName = usePropertyName();
  const list = data.pms_messages
    .filter((m) => m.channel === "assistant")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (!list.length)
    return (
      <Empty>
        Les questions posées par les voyageurs à l'assistant de leur livret apparaîtront ici.
      </Empty>
    );
  return (
    <div className="space-y-2">
      {list.map((m) => {
        const r = data.pms_reservations.find((x) => x.id === m.reservation_id);
        return (
          <div key={m.id} className="rounded-xl border border-border bg-card p-4 text-sm">
            <div className="text-xs text-muted-foreground">
              {r?.guest_name ?? "Voyageur"} · {propertyName(r?.property_id)} ·{" "}
              {formatDateTime(m.created_at)}
            </div>
            <p className="mt-1 font-medium">❓ {m.body}</p>
            <p className="mt-1 flex gap-1.5 text-muted-foreground">
              <Bot className="mt-0.5 size-4 shrink-0" /> {m.subject}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Templates() {
  const { data, save, remove, settings } = usePms();
  const [edit, setEdit] = useState<Partial<MessageTemplate> | null>(null);
  const list = [...data.pms_message_templates].sort((a, b) => a.position - b.position);
  const sample = data.pms_reservations.find((r) => r.status === "confirmee");
  const sampleProperty = data.pms_properties.find((p) => p.id === sample?.property_id);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {list.map((t) => (
          <div
            key={t.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <button className="flex-1 text-left" onClick={() => setEdit(t)}>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-muted-foreground">
                {TRIGGERS[t.trigger].label}
                {t.trigger === "avant_arrivee" ? ` (J-${t.offset_days})` : ""} à {t.send_time} ·
                canal : {t.channel === "auto" ? "email si connu, sinon plateforme" : t.channel}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.body}</p>
            </button>
            <Toggle
              checked={t.active}
              onChange={(v) => save("pms_message_templates", t.id, { active: v })}
              label=""
            />
          </div>
        ))}
        <button
          className="btn-outline inline-flex items-center gap-1.5"
          onClick={() =>
            setEdit({
              trigger: "avant_arrivee",
              offset_days: 3,
              send_time: "10:00",
              channel: "auto",
              active: true,
              position: list.length + 1,
              body: "",
            })
          }
        >
          <Plus className="size-4" /> Nouveau modèle
        </button>
      </div>
      <Panel title="Variables disponibles">
        <ul className="space-y-1 text-xs">
          {VARIABLES.map((v) => (
            <li key={v.key}>
              <code className="rounded bg-muted px-1">{`{${v.key}}`}</code> {v.label}
            </li>
          ))}
        </ul>
      </Panel>
      {edit && (
        <Modal
          open
          onClose={() => setEdit(null)}
          title={edit.id ? "Modifier le modèle" : "Nouveau modèle"}
          wide
        >
          <div className="space-y-3">
            <Field label="Nom">
              <TextInput
                value={edit.name ?? ""}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Moment" className="sm:col-span-2">
                <Select
                  value={edit.trigger}
                  onChange={(e) => setEdit({ ...edit, trigger: e.target.value as Trigger })}
                  options={Object.entries(TRIGGERS).map(([value, t]) => ({
                    value,
                    label: `${t.label} (${t.hint})`,
                  }))}
                />
              </Field>
              <Field label="Décalage (jours)">
                <TextInput
                  type="number"
                  min={0}
                  value={edit.offset_days ?? 0}
                  onChange={(e) => setEdit({ ...edit, offset_days: Number(e.target.value) })}
                />
              </Field>
              <Field label="Heure d'envoi">
                <TextInput
                  type="time"
                  value={edit.send_time ?? "10:00"}
                  onChange={(e) => setEdit({ ...edit, send_time: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Canal">
              <Select
                value={edit.channel ?? "auto"}
                onChange={(e) =>
                  setEdit({ ...edit, channel: e.target.value as MessageTemplate["channel"] })
                }
                options={[
                  {
                    value: "auto",
                    label:
                      "Automatique : email si connu, sinon message à copier dans la plateforme",
                  },
                  { value: "email", label: "Email uniquement" },
                  { value: "plateforme", label: "Messagerie de la plateforme" },
                  { value: "whatsapp", label: "WhatsApp (lien d'envoi en un clic)" },
                ]}
              />
            </Field>
            <Field label="Objet (email)">
              <TextInput
                value={edit.subject ?? ""}
                onChange={(e) => setEdit({ ...edit, subject: e.target.value })}
              />
            </Field>
            <Field label="Message">
              <TextArea
                rows={12}
                value={edit.body ?? ""}
                onChange={(e) => setEdit({ ...edit, body: e.target.value })}
              />
            </Field>
            {sample && sampleProperty && edit.body && (
              <details>
                <summary className="cursor-pointer text-sm text-primary">
                  Aperçu avec une vraie réservation
                </summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 font-sans text-sm">
                  {renderTemplate(edit.body, {
                    reservation: sample,
                    property: sampleProperty,
                    settings,
                    origin: origin(),
                  })}
                </pre>
                <p className="mt-1 text-xs text-muted-foreground">
                  Canal pour cette réservation : {resolveChannel(edit.channel ?? "auto", sample)}
                </p>
              </details>
            )}
            <div className="flex justify-between border-t border-border pt-3">
              {edit.id ? (
                <button
                  className="text-sm text-red-700"
                  onClick={async () => {
                    if (confirm("Supprimer ce modèle ?")) {
                      await remove("pms_message_templates", edit.id!, "Modèle");
                      setEdit(null);
                    }
                  }}
                >
                  Supprimer
                </button>
              ) : (
                <span />
              )}
              <button
                className="btn-primary"
                disabled={!edit.name || !edit.body}
                onClick={async () => {
                  const { id, ...rest } = edit;
                  if (await save("pms_message_templates", id ?? null, rest)) setEdit(null);
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
