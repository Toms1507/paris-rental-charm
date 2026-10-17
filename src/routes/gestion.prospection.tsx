import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ExternalLink, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Empty,
  Field,
  Modal,
  PageHeader,
  Panel,
  Select,
  Stat,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/gestion/ui";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Prospection des agences immobilières : chaque agence trouvée, chaque message préparé ou envoyé,
// et les réglages de l'envoi (mode validation ou automatique, pause, volume quotidien).
// Les envois sont faits par la tâche planifiée .github/workflows/prospection.yml.

const db = supabase as unknown as SupabaseClient;

type Prospect = {
  id: string;
  name: string;
  zone: string;
  address: string | null;
  postcode: string | null;
  city: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  contact_name: string | null;
  status: string;
  subject: string | null;
  body: string | null;
  followup_subject: string | null;
  followup_body: string | null;
  angle: string | null;
  first_contact_at: string | null;
  last_contact_at: string | null;
  replied_at: string | null;
  notes: string | null;
  updated_at: string;
};

type Settings = {
  mode: "validation" | "auto";
  paused: boolean;
  daily_limit: number;
  first_send_at: string | null;
  last_sync_at: string | null;
  last_run_at: string | null;
  last_run_summary: string | null;
};

const STATUSES: Record<string, { label: string; tone: string }> = {
  brouillon: { label: "À valider", tone: "bg-amber-100 text-amber-800" },
  valide: { label: "Validé, envoi prévu", tone: "bg-sky-100 text-sky-800" },
  contacte: { label: "Contactée", tone: "bg-blue-100 text-blue-800" },
  relance: { label: "Relancée", tone: "bg-indigo-100 text-indigo-800" },
  repondu: { label: "A répondu", tone: "bg-emerald-100 text-emerald-800" },
  partenaire: { label: "Partenaire", tone: "bg-emerald-200 text-emerald-900" },
  sans_reponse: { label: "Sans réponse", tone: "bg-slate-100 text-slate-600" },
  refus: { label: "Pas intéressée", tone: "bg-slate-100 text-slate-600" },
  desinscrit: { label: "Désinscrite", tone: "bg-slate-200 text-slate-700" },
  nouveau: { label: "En cours d'analyse", tone: "bg-slate-100 text-slate-600" },
  sans_email: { label: "Sans e-mail", tone: "bg-slate-100 text-slate-500" },
  ignore: { label: "Écartée", tone: "bg-slate-100 text-slate-500" },
  erreur: { label: "À vérifier", tone: "bg-red-100 text-red-800" },
};

const ZONES: Record<string, string> = {
  paris: "Paris",
  "petite-couronne": "Petite couronne",
  versailles: "Versailles",
  chartres: "Chartres",
  disney: "Secteur Disney",
  roissy: "Secteur Roissy-CDG",
  bordeaux: "Bordeaux",
};

const SIGNATURE = `Bien cordialement,

Tom Simon
Fondateur, Spinelle Conciergerie
06 31 93 51 66
contact@spinelleconciergerie.fr
spinelleconciergerie.fr/partenaires

—
Vos coordonnées proviennent du site internet de votre agence. Pour ne plus recevoir de message de Spinelle Conciergerie : [lien personnel de désinscription]`;

const COLUMNS =
  "id,name,zone,address,postcode,city,website,email,phone,contact_name,status,subject,body,followup_subject,followup_body,angle,first_contact_at,last_contact_at,replied_at,notes,updated_at";

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—";

export const Route = createFileRoute("/gestion/prospection")({ component: ProspectionPage });

function ProspectionPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rows, setRows] = useState<Prospect[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [missing, setMissing] = useState(false);
  const [filter, setFilter] = useState("brouillon");
  const [zone, setZone] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Prospect | null>(null);

  const load = useCallback(async () => {
    const s = await db.from("prospect_settings").select("*").eq("id", 1).maybeSingle();
    if (s.error) {
      setMissing(true);
      return;
    }
    setSettings(s.data as Settings);
    const entries = await Promise.all(
      Object.keys(STATUSES).map(async (k) => {
        const { count } = await db
          .from("prospects")
          .select("id", { count: "exact", head: true })
          .eq("status", k);
        return [k, count ?? 0] as const;
      }),
    );
    setCounts(Object.fromEntries(entries));
    let q = db
      .from("prospects")
      .select(COLUMNS)
      .order("updated_at", { ascending: false })
      .limit(500);
    if (filter) q = q.eq("status", filter);
    if (zone) q = q.eq("zone", zone);
    if (search.trim()) q = q.ilike("name", `%${search.trim()}%`);
    const { data } = await q;
    setRows((data ?? []) as Prospect[]);
    setSelected(new Set());
  }, [filter, zone, search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings(patch: Partial<Settings>) {
    const { error } = await db
      .from("prospect_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSettings((s) => (s ? { ...s, ...patch } : s));
    toast.success("Réglage enregistré");
  }

  async function setStatus(ids: string[], status: string) {
    const { error } = await db
      .from("prospects")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      `${ids.length} agence${ids.length > 1 ? "s" : ""} : ${STATUSES[status]?.label.toLowerCase()}`,
    );
    setOpen(null);
    void load();
  }

  const contacted =
    (counts["contacte"] ?? 0) + (counts["relance"] ?? 0) + (counts["sans_reponse"] ?? 0);
  const answered = (counts["repondu"] ?? 0) + (counts["partenaire"] ?? 0) + (counts["refus"] ?? 0);
  const rate = contacted + answered ? Math.round((answered / (contacted + answered)) * 100) : null;
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const drafts = useMemo(() => rows.filter((r) => r.status === "brouillon"), [rows]);

  if (missing) {
    return (
      <div className="space-y-6">
        <PageHeader title="Prospection des agences" />
        <Empty>
          La base de la prospection n'est pas encore installée : appliquez la migration
          supabase/migrations/20261018120000_prospection.sql dans Supabase (éditeur SQL), puis
          rechargez la page.
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospection des agences"
        subtitle="Agences immobilières de vos zones, messages rédigés sur mesure, envois, relances et réponses. Rien ne part en mode validation sans votre accord."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="À valider"
          value={counts["brouillon"] ?? 0}
          tone={counts["brouillon"] ? "warn" : undefined}
        />
        <Stat
          label="Agences contactées"
          value={contacted + answered}
          hint={`dont ${counts["relance"] ?? 0} relancées`}
        />
        <Stat
          label="Réponses"
          value={answered}
          hint={rate !== null ? `${rate} % des agences contactées` : undefined}
          tone={answered ? "ok" : undefined}
        />
        <Stat
          label="Partenaires"
          value={counts["partenaire"] ?? 0}
          tone={counts["partenaire"] ? "ok" : undefined}
        />
      </div>

      {settings && (
        <Panel title="Réglages de l'envoi">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Mode"
              hint={
                settings.mode === "validation"
                  ? "Seuls les messages que vous validez sont envoyés."
                  : "Les messages rédigés partent automatiquement."
              }
            >
              <Select
                value={settings.mode}
                onChange={(e) => void saveSettings({ mode: e.target.value as Settings["mode"] })}
                options={[
                  { value: "validation", label: "Validation (je relis avant l'envoi)" },
                  { value: "auto", label: "Automatique" },
                ]}
              />
            </Field>
            <Field
              label="E-mails par jour (maximum)"
              hint="Montée progressive : 20 par jour la première semaine, puis +10 par jour jusqu'à ce maximum."
            >
              <TextInput
                type="number"
                min={0}
                max={150}
                defaultValue={settings.daily_limit}
                onBlur={(e) =>
                  void saveSettings({
                    daily_limit: Math.min(150, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
              />
            </Field>
            <div className="flex items-end pb-2">
              <Toggle
                checked={settings.paused}
                onChange={(v) => void saveSettings({ paused: v })}
                label={settings.paused ? "Prospection en pause" : "Prospection active"}
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Passages : jours ouvrés vers 9 h, 12 h et 15 h. Dernier passage :{" "}
            {date(settings.last_run_at)}
            {settings.last_sync_at
              ? ` · liste des agences mise à jour le ${date(settings.last_sync_at)}`
              : ""}
          </p>
          {settings.last_run_summary && (
            <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
              {settings.last_run_summary}
            </pre>
          )}
        </Panel>
      )}

      <Panel>
        <div className="flex flex-wrap gap-2">
          {[
            ["brouillon", "À valider"],
            ["valide", "Envoi prévu"],
            ["contacte", "Contactées"],
            ["relance", "Relancées"],
            ["repondu", "Réponses"],
            ["partenaire", "Partenaires"],
            ["sans_reponse", "Sans réponse"],
            ["erreur", "À vérifier"],
            ["", "Toutes"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value!)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition",
                filter === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary",
              )}
            >
              {label}
              {value && counts[value!] ? ` (${counts[value!]})` : ""}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <TextInput
            placeholder="Rechercher une agence"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            options={[
              { value: "", label: "Toutes les zones" },
              ...Object.entries(ZONES).map(([value, label]) => ({ value, label })),
            ]}
          />
        </div>

        {filter === "brouillon" && drafts.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm">
            <span>
              {selected.size} sélectionnée{selected.size > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              className="btn-primary !px-3 !py-1.5 text-sm"
              disabled={!selected.size}
              onClick={() => void setStatus([...selected], "valide")}
            >
              Valider l'envoi de la sélection
            </button>
            <button
              type="button"
              className="btn-outline !px-3 !py-1.5 text-sm"
              disabled={!selected.size}
              onClick={() => void setStatus([...selected], "ignore")}
            >
              Écarter la sélection
            </button>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          {rows.length === 0 ? (
            <Empty>Aucune agence dans cette catégorie pour le moment.</Empty>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="w-8 py-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
                      }
                      aria-label="Tout sélectionner"
                    />
                  </th>
                  <th className="py-2">Agence</th>
                  <th className="py-2">Zone</th>
                  <th className="py-2">Contact</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2">Contactée</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/40">
                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() =>
                          setSelected((s) => {
                            const next = new Set(s);
                            if (next.has(r.id)) next.delete(r.id);
                            else next.add(r.id);
                            return next;
                          })
                        }
                        aria-label={`Sélectionner ${r.name}`}
                      />
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setOpen(r)}
                        className="text-left font-medium text-primary hover:underline"
                      >
                        {r.name}
                      </button>
                      {r.subject && (
                        <div className="text-xs text-muted-foreground">{r.subject}</div>
                      )}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {ZONES[r.zone] ?? r.zone}
                      {r.city ? ` · ${r.city}` : ""}
                    </td>
                    <td className="py-2">
                      {r.contact_name && <div>{r.contact_name}</div>}
                      <div className="text-xs text-muted-foreground">{r.email ?? "—"}</div>
                      {r.phone && (
                        <a
                          href={`tel:${r.phone.replace(/\s/g, "")}`}
                          className="text-xs text-primary"
                        >
                          {r.phone}
                        </a>
                      )}
                    </td>
                    <td className="py-2">
                      <span
                        className={cn("rounded-full px-2 py-0.5 text-xs", STATUSES[r.status]?.tone)}
                      >
                        {STATUSES[r.status]?.label ?? r.status}
                      </span>
                    </td>
                    <td className="py-2 text-muted-foreground">{date(r.first_contact_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>

      {open && (
        <ProspectDialog
          prospect={open}
          onClose={() => setOpen(null)}
          onStatus={(s) => void setStatus([open.id], s)}
          onSaved={() => {
            setOpen(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function ProspectDialog({
  prospect: p,
  onClose,
  onStatus,
  onSaved,
}: {
  prospect: Prospect;
  onClose: () => void;
  onStatus: (status: string) => void;
  onSaved: () => void;
}) {
  const [subject, setSubject] = useState(p.subject ?? "");
  const [body, setBody] = useState(p.body ?? "");
  const [followup, setFollowup] = useState(p.followup_body ?? "");
  const [notes, setNotes] = useState(p.notes ?? "");
  const editable = ["brouillon", "valide", "erreur", "nouveau"].includes(p.status);

  async function save(nextStatus?: string) {
    const { error } = await db
      .from("prospects")
      .update({
        subject,
        body,
        followup_subject: subject ? `Re: ${subject}` : null,
        followup_body: followup,
        notes,
        ...(nextStatus ? { status: nextStatus } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      nextStatus === "valide" ? "Message validé : il partira au prochain passage" : "Enregistré",
    );
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={p.name}
      description={STATUSES[p.status]?.label ?? p.status}
      wide
    >
      <div className="space-y-4 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Zone</div>
            {ZONES[p.zone] ?? p.zone}
            {p.address ? ` · ${p.address}` : ""}
            {p.postcode ? ` ${p.postcode}` : ""} {p.city ?? ""}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Contact</div>
            {p.contact_name ?? "Dirigeant non identifié"} · {p.email ?? "pas d'e-mail"}
            {p.phone && (
              <a
                href={`tel:${p.phone.replace(/\s/g, "")}`}
                className="ml-2 inline-flex items-center gap-1 text-primary"
              >
                <Phone className="size-3.5" /> {p.phone}
              </a>
            )}
          </div>
          {p.website && (
            <a
              href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-primary"
            >
              Site de l'agence <ExternalLink className="size-3.5" />
            </a>
          )}
          {p.angle && (
            <div>
              <div className="text-xs text-muted-foreground">Angle choisi</div>
              {p.angle}
            </div>
          )}
        </div>

        <Field label="Objet">
          <TextInput
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={!editable}
          />
        </Field>
        <Field
          label="Message"
          hint="La signature et le lien de désinscription sont ajoutés automatiquement (aperçu ci-dessous)."
        >
          <TextArea
            rows={9}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!editable}
          />
        </Field>
        <pre className="rounded-md bg-muted p-3 text-xs whitespace-pre-wrap text-muted-foreground">
          {SIGNATURE}
        </pre>
        <Field label="Relance (une seule, 7 jours après, en réponse au premier message)">
          <TextArea
            rows={4}
            value={followup}
            onChange={(e) => setFollowup(e.target.value)}
            disabled={!editable}
          />
        </Field>
        <Field label="Notes">
          <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {editable && p.email && (
            <button
              type="button"
              className="btn-primary !px-3 !py-2 text-sm"
              onClick={() => void save("valide")}
            >
              Valider l'envoi
            </button>
          )}
          <button
            type="button"
            className="btn-outline !px-3 !py-2 text-sm"
            onClick={() => void save()}
          >
            Enregistrer
          </button>
          {editable && (
            <button
              type="button"
              className="btn-outline !px-3 !py-2 text-sm"
              onClick={() => onStatus("ignore")}
            >
              Écarter
            </button>
          )}
          {["contacte", "relance", "sans_reponse", "repondu"].includes(p.status) && (
            <>
              <button
                type="button"
                className="btn-outline !px-3 !py-2 text-sm"
                onClick={() => onStatus("partenaire")}
              >
                Devenue partenaire
              </button>
              <button
                type="button"
                className="btn-outline !px-3 !py-2 text-sm"
                onClick={() => onStatus("refus")}
              >
                Pas intéressée
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
