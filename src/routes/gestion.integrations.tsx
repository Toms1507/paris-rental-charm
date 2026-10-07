import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CheckCircle2,
  CircleDashed,
  Database,
  Mail,
  MessageCircle,
  Bot,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePms } from "@/components/gestion/PmsProvider";
import { Field, PageHeader, Panel, Pill, TextArea, TextInput } from "@/components/gestion/ui";
import { saveSettings } from "@/lib/pms/engine";
import { resetDemo } from "@/lib/pms/store";
import { PLATFORMS, type Settings } from "@/lib/pms/types";

export const Route = createFileRoute("/gestion/integrations")({ component: IntegrationsPage });

type AccountKey = "airbnb" | "booking" | "abritel" | "channel_manager";

const ACCOUNTS: { key: AccountKey; label: string; color: string; today: string; full: string }[] = [
  {
    key: "airbnb",
    label: PLATFORMS.airbnb.label,
    color: PLATFORMS.airbnb.color,
    today:
      "Réservations, dates, modifications et annulations par calendrier iCal ; code de réservation et 4 derniers chiffres du téléphone.",
    full: "Nom, email et téléphone du voyageur, montants, messagerie, avis : via un channel manager partenaire officiel d'Airbnb.",
  },
  {
    key: "booking",
    label: PLATFORMS.booking.label,
    color: PLATFORMS.booking.color,
    today:
      "Dates réservées par calendrier iCal. L'adresse relais du voyageur (…@guest.booking.com) peut être ajoutée pour l'envoi automatique des emails.",
    full: "Détail complet des réservations, tarifs et messagerie : via un channel manager « Connectivity Partner » de Booking.com.",
  },
  {
    key: "abritel",
    label: PLATFORMS.abritel.label,
    color: PLATFORMS.abritel.color,
    today: "Réservations par calendrier iCal, avec le nom du voyageur quand Abritel le fournit.",
    full: "Détail complet et messagerie : via un channel manager partenaire de Vrbo / Expedia.",
  },
  {
    key: "channel_manager",
    label: "Channel manager",
    color: "#213F6C",
    today: "Pas encore choisi.",
    full: "Airbnb, Booking et Abritel n'ouvrent leurs API qu'à des éditeurs agréés. Un channel manager agréé disposant d'une API ouverte (Beds24, Smoobu, Hostaway, Lodgify…) fait le pont : il sera relié ici pour récupérer automatiquement noms, emails, montants, messages et avis, et synchroniser les calendriers en temps réel.",
  },
];

function IntegrationsPage() {
  const { mode, config, settings, store, data, reload, session } = usePms();
  const [form, setForm] = useState<Settings>(settings);
  const [staffEmail, setStaffEmail] = useState("");
  const [commission, setCommission] = useState(
    String(Math.round(settings.default_commission * 100)),
  );

  async function saveForm(patch?: Partial<Settings>) {
    await saveSettings(
      store,
      data,
      patch ?? {
        ...form,
        default_commission:
          Number(commission.replace(",", ".")) / 100 || settings.default_commission,
      },
    );
    await reload();
    toast.success("Réglages enregistrés");
  }

  const setAccount = (
    key: AccountKey,
    patch: { login?: string; notes?: string; connected?: boolean },
  ) =>
    setForm((f) => ({
      ...f,
      accounts: { ...(f.accounts ?? {}), [key]: { ...(f.accounts?.[key] ?? {}), ...patch } },
    }));

  const status = (ok: boolean | undefined, label: string, icon: React.ReactNode, help: string) => (
    <li className="flex gap-3 py-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {label}{" "}
          {ok ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <CircleDashed className="size-4 text-amber-600" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">{help}</p>
      </div>
    </li>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Connexions et réglages"
        subtitle="État des branchements du logiciel, comptes des plateformes et réglages généraux."
      />

      {mode === "demo" && (
        <Panel
          title={
            <span className="flex items-center gap-2">
              <Database className="size-4" /> Activer la base de données (étape unique)
            </span>
          }
          className="border-amber-300 bg-amber-50/50"
        >
          <ol className="list-decimal space-y-1.5 pl-5 text-sm">
            <li>
              Ouvrez le projet dans <b>Lovable</b> et demandez : « Applique la migration{" "}
              <code>supabase/migrations/20261007120000_logiciel_gestion.sql</code> ».
            </li>
            <li>
              Rechargez cette page : le logiciel passe en mode réel et vous demande de créer votre
              compte. Le premier compte créé devient administrateur.
            </li>
            <li>
              Les données de démonstration de ce navigateur ne sont pas reprises : vous partez d'une
              base vide.
            </li>
          </ol>
          <button
            className="btn-outline mt-3 text-sm"
            onClick={() => {
              if (confirm("Remettre les données de démonstration à zéro ?")) {
                resetDemo();
                location.reload();
              }
            }}
          >
            Réinitialiser la démo
          </button>
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Services branchés">
          <ul className="divide-y divide-border">
            {status(
              mode === "cloud",
              "Base de données",
              <Database className="size-4" />,
              mode === "cloud"
                ? `Connecté en tant que ${session?.user.email}`
                : "Mode démo : données dans ce navigateur uniquement.",
            )}
            {status(
              config?.email,
              "Emails (Resend)",
              <Mail className="size-4" />,
              config?.email
                ? `Expéditeur : ${config.fromEmail ?? "adresse de test Resend"}. Pour écrire depuis @spinelleconciergerie.fr, vérifiez le domaine dans Resend et définissez PMS_FROM_EMAIL.`
                : "Ajoutez RESEND_API_KEY dans Vercel (déjà utilisée par le formulaire du site).",
            )}
            {status(
              config?.ai,
              "Assistant IA (Claude)",
              <Bot className="size-4" />,
              config?.ai
                ? "Assistant voyageurs, bons plans tendance et réponses aux avis actifs."
                : "Ajoutez ANTHROPIC_API_KEY dans Vercel. Sans clé, l'assistant répond avec les infos du livret (réponses simples).",
            )}
            {status(
              config?.whatsappAlerts,
              "Alertes WhatsApp",
              <MessageCircle className="size-4" />,
              "Gros problème au ménage, demande voyageur, mauvaise note : vous êtes prévenu sur WhatsApp (CALLMEBOT_APIKEY, déjà utilisée par le site) et par email.",
            )}
            {status(
              config?.cron && config?.serverAutomation,
              "Automatisations 24 h/24",
              <Clock className="size-4" />,
              config?.cron && config?.serverAutomation
                ? "Synchro, ménages, messages et rapports toutes les 15 minutes, même logiciel fermé."
                : "Tant que ce n'est pas configuré, tout tourne quand le logiciel est ouvert. À configurer : PMS_CRON_SECRET (Vercel + GitHub) et SUPABASE_SERVICE_ROLE_KEY ou un compte robot (PMS_ROBOT_EMAIL / PMS_ROBOT_PASSWORD).",
            )}
          </ul>
        </Panel>

        <Panel title="Réglages généraux">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom de la conciergerie">
                <TextInput
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                />
              </Field>
              <Field label="Commission par défaut (%)">
                <TextInput
                  inputMode="decimal"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                />
              </Field>
              <Field label="Email de contact">
                <TextInput
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Téléphone">
                <TextInput
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Signature des messages voyageurs">
              <TextInput
                value={form.signature}
                onChange={(e) => setForm({ ...form, signature: e.target.value })}
              />
            </Field>
            <button className="btn-primary" onClick={() => saveForm()}>
              Enregistrer
            </button>
          </div>
        </Panel>
      </div>

      <Panel title="Comptes des plateformes">
        <p className="mb-4 text-sm text-muted-foreground">
          Notez ici les comptes à relier. <b>N'enregistrez jamais de mot de passe</b> dans le
          logiciel ni dans un message : la connexion se fait par lien de calendrier (dès maintenant)
          puis par le channel manager.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {ACCOUNTS.map((a) => {
            const acc = form.accounts?.[a.key] ?? {};
            const feeds =
              a.key === "channel_manager"
                ? 0
                : data.pms_properties.reduce(
                    (s, p) => s + p.ical_feeds.filter((f) => f.platform === a.key && f.url).length,
                    0,
                  );
            return (
              <div key={a.key} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="size-3 rounded-full" style={{ background: a.color }} />{" "}
                    {a.label}
                  </div>
                  {a.key !== "channel_manager" &&
                    (feeds ? (
                      <Pill tone="ok">{feeds} calendrier(s) relié(s)</Pill>
                    ) : (
                      <Pill tone="warn">Pas encore relié</Pill>
                    ))}
                </div>
                <p className="mt-2 text-xs">
                  <b>Aujourd'hui :</b> {a.today}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <b>Connexion complète :</b> {a.full}
                </p>
                <div className="mt-3 grid gap-2">
                  <TextInput
                    placeholder={
                      a.key === "channel_manager"
                        ? "Nom du channel manager choisi"
                        : "Email du compte"
                    }
                    value={acc.login ?? ""}
                    onChange={(e) => setAccount(a.key, { login: e.target.value })}
                  />
                  <TextArea
                    rows={2}
                    placeholder="Notes (numéro d'établissement Booking, annonces concernées…)"
                    value={acc.notes ?? ""}
                    onChange={(e) => setAccount(a.key, { notes: e.target.value })}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <button className="btn-primary mt-4" onClick={() => saveForm({ accounts: form.accounts })}>
          Enregistrer les comptes
        </button>
      </Panel>

      {mode === "cloud" && (
        <Panel
          title={
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4" /> Équipe
            </span>
          }
        >
          <p className="mb-3 text-sm text-muted-foreground">
            Pour donner accès à un associé ou à un compte robot : la personne crée d'abord son
            compte sur /gestion, puis vous l'ajoutez ici. Les prestataires ménage n'ont pas besoin
            de compte (lien personnel).
          </p>
          <div className="flex gap-2">
            <TextInput
              type="email"
              placeholder="email@exemple.fr"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
            />
            <button
              className="btn-primary"
              onClick={async () => {
                const { data: ok, error } = await (supabase as unknown as SupabaseClient).rpc(
                  "pms_add_staff",
                  { p_email: staffEmail },
                );
                if (error) toast.error(error.message);
                else if (!ok)
                  toast.error(
                    "Aucun compte avec cet email : la personne doit d'abord s'inscrire sur /gestion.",
                  );
                else {
                  toast.success("Accès accordé");
                  setStaffEmail("");
                }
              }}
            >
              Ajouter
            </button>
          </div>
        </Panel>
      )}
    </div>
  );
}
