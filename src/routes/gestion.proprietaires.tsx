import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, FileUp, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePms, usePropertyName } from "@/components/gestion/PmsProvider";
import {
  Empty,
  Field,
  Modal,
  num,
  PageHeader,
  Panel,
  Pill,
  Select,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/gestion/ui";
import {
  euros,
  formatDateTime,
  formatDay,
  formatMonth,
  percent,
  previousMonth,
  todayParis,
} from "@/lib/pms/dates";
import { generateReports, saveSettings } from "@/lib/pms/engine";
import { buildReport, reportEmailHtml } from "@/lib/pms/reports";
import { loadAll } from "@/lib/pms/store";
import { EXPENSE_CATEGORIES, type Expense, type Owner } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestion/proprietaires")({ component: OwnersPage });

type Tab = "rapports" | "depenses" | "proprietaires";

function OwnersPage() {
  const [tab, setTab] = useState<Tab>("rapports");
  const { settings, store, data, reload } = usePms();
  return (
    <div>
      <PageHeader
        title="Propriétaires et rapports"
        subtitle="Chaque 1er du mois, chaque propriétaire reçoit automatiquement le rapport du mois écoulé : occupation, revenus, commission, ménages, factures et versement."
        actions={
          <Toggle
            checked={settings.auto_reports}
            onChange={async (v) => {
              await saveSettings(store, data, { auto_reports: v });
              await reload();
            }}
            label="Envoi automatique le 1er du mois"
          />
        }
      />
      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {(
          [
            ["rapports", "Rapports mensuels"],
            ["depenses", "Dépenses et factures"],
            ["proprietaires", "Propriétaires"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "rapports" && <Reports />}
      {tab === "depenses" && <Expenses />}
      {tab === "proprietaires" && <Owners />}
    </div>
  );
}

function monthOptions() {
  const out: { value: string; label: string }[] = [];
  let m = todayParis().slice(0, 7);
  for (let i = 0; i < 18; i++) {
    out.push({ value: m, label: formatMonth(m) });
    m = previousMonth(m);
  }
  return out;
}

function Reports() {
  const { data, runContext, reload, settings, mode } = usePms();
  const [month, setMonth] = useState(previousMonth(todayParis().slice(0, 7)));
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const properties = data.pms_properties.filter((p) => p.active);

  async function send(propertyIds?: string[]) {
    setBusy(propertyIds?.[0] ?? "all");
    try {
      const ctx = runContext();
      const res = await generateReports(ctx, await loadAll(ctx.store), month, {
        send: true,
        ...(propertyIds ? { propertyIds } : {}),
      });
      await reload();
      if (res.sent)
        toast.success(
          `${res.sent} rapport(s) envoyé(s)${mode === "demo" ? " (simulation en mode démo)" : ""}`,
        );
      if (res.errors.length)
        toast.error("Certains rapports n'ont pas pu partir", {
          description: res.errors.join("\n"),
        });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          className="w-auto"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          options={monthOptions()}
        />
        <button
          className="btn-primary inline-flex items-center gap-1.5"
          onClick={() => send()}
          disabled={busy !== null || !properties.length}
        >
          <Send className="size-4" /> Envoyer tous les rapports de {formatMonth(month)}
        </button>
      </div>
      {properties.length === 0 ? (
        <Empty>Aucun logement actif.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Logement</th>
                <th className="px-4 py-3 text-right">Occupation</th>
                <th className="px-4 py-3 text-right">Nuits</th>
                <th className="px-4 py-3 text-right">Prix moyen</th>
                <th className="px-4 py-3 text-right">Revenus</th>
                <th className="px-4 py-3 text-right">Commission</th>
                <th className="px-4 py-3 text-right">Ménages + frais</th>
                <th className="px-4 py-3 text-right">Versement</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const r = buildReport(data, p.id, month);
                const owner = data.pms_owners.find((o) => o.id === p.owner_id);
                const saved = data.pms_owner_reports.find(
                  (x) => x.property_id === p.id && x.month === month,
                );
                return (
                  <tr key={p.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {owner
                          ? `${owner.name}${owner.email ? "" : " · email manquant"}`
                          : "Pas de propriétaire"}
                        {saved?.status === "envoye" && saved.sent_at
                          ? ` · envoyé ${formatDateTime(saved.sent_at)}`
                          : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{percent(r.occupancy)}</td>
                    <td className="px-4 py-3 text-right">{r.nightsBooked}</td>
                    <td className="px-4 py-3 text-right">{euros(r.adr)}</td>
                    <td className="px-4 py-3 text-right">{euros(r.gross)}</td>
                    <td className="px-4 py-3 text-right">{euros(r.commission)}</td>
                    <td className="px-4 py-3 text-right">
                      {euros(r.cleaningCost + r.expensesTotal)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{euros(r.ownerPayout)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          className="rounded-md border border-border p-1.5 hover:bg-muted"
                          title="Aperçu"
                          onClick={() =>
                            setPreview(
                              reportEmailHtml(r, {
                                name: settings.company_name,
                                email: settings.email,
                                phone: settings.phone,
                              }),
                            )
                          }
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          className="rounded-md border border-border p-1.5 hover:bg-muted disabled:opacity-40"
                          title="Envoyer"
                          disabled={!owner?.email || busy !== null}
                          onClick={() => send([p.id])}
                        >
                          <Send className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Calcul : revenus voyageurs − frais de plateforme − commission (
        {Math.round(settings.default_commission * 100)} % par défaut, réglable par logement, hors
        frais de ménage) − ménages − dépenses refacturables = versement au propriétaire. Les séjours
        à cheval sur deux mois sont répartis au prorata des nuits.
      </p>
      {preview && (
        <Modal open onClose={() => setPreview(null)} title="Aperçu du rapport" wide>
          <iframe
            title="Aperçu"
            srcDoc={preview}
            className="h-[70vh] w-full rounded-md border border-border"
            sandbox=""
          />
          <button
            className="btn-outline mt-3"
            onClick={() => {
              const w = window.open("", "_blank");
              if (w) {
                w.document.write(preview);
                w.document.close();
                w.print();
              }
            }}
          >
            Imprimer / PDF
          </button>
        </Modal>
      )}
    </div>
  );
}

function Expenses() {
  const { data, save, remove, store } = usePms();
  const propertyName = usePropertyName();
  const [month, setMonth] = useState(todayParis().slice(0, 7));
  const [edit, setEdit] = useState<Partial<Expense> | null>(null);
  const [amount, setAmount] = useState("");
  const [uploading, setUploading] = useState(false);
  const list = data.pms_expenses
    .filter((e) => e.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          className="w-auto"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          options={monthOptions()}
        />
        <button
          className="btn-primary inline-flex items-center gap-1.5"
          onClick={() => {
            setAmount("");
            setEdit({
              property_id: data.pms_properties[0]?.id ?? "",
              date: todayParis(),
              category: "consommables",
              billable_to_owner: true,
            });
          }}
        >
          <Plus className="size-4" /> Ajouter une dépense
        </button>
      </div>
      {list.length === 0 ? (
        <Empty>Aucune dépense ce mois-ci.</Empty>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {list.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <button
                className="text-left"
                onClick={() => {
                  setAmount(String(e.amount));
                  setEdit(e);
                }}
              >
                <div className="font-medium">{e.label}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDay(e.date)} · {propertyName(e.property_id)} ·{" "}
                  {EXPENSE_CATEGORIES[e.category]}
                </div>
              </button>
              <div className="flex items-center gap-3">
                {e.invoice_url && (
                  <a
                    href={e.invoice_url}
                    target="_blank"
                    rel="noopener"
                    className="text-xs text-primary underline"
                  >
                    Facture
                  </a>
                )}
                {!e.billable_to_owner && <Pill>Non refacturé</Pill>}
                <span className="font-medium">{euros(e.amount, 2)}</span>
                <button
                  onClick={() => remove("pms_expenses", e.id, "Dépense")}
                  aria-label="Supprimer"
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {edit && (
        <Modal
          open
          onClose={() => setEdit(null)}
          title={edit.id ? "Modifier la dépense" : "Nouvelle dépense"}
        >
          <div className="space-y-3">
            <Field label="Logement">
              <Select
                value={edit.property_id}
                onChange={(e) => setEdit({ ...edit, property_id: e.target.value })}
                options={data.pms_properties.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Field>
            <Field label="Libellé">
              <TextInput
                value={edit.label ?? ""}
                onChange={(e) => setEdit({ ...edit, label: e.target.value })}
                placeholder="Ex. remplacement ampoules, plombier…"
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Date">
                <TextInput
                  type="date"
                  value={edit.date}
                  onChange={(e) => setEdit({ ...edit, date: e.target.value })}
                />
              </Field>
              <Field label="Montant TTC (€)">
                <TextInput
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Field>
              <Field label="Catégorie">
                <Select
                  value={edit.category}
                  onChange={(e) =>
                    setEdit({ ...edit, category: e.target.value as Expense["category"] })
                  }
                  options={Object.entries(EXPENSE_CATEGORIES).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </Field>
            </div>
            <Field label="Facture (PDF ou photo)">
              <div className="flex items-center gap-2">
                <label className="btn-outline inline-flex cursor-pointer items-center gap-1.5 text-sm">
                  <FileUp className="size-4" />{" "}
                  {uploading ? "Envoi…" : edit.invoice_url ? "Remplacer" : "Joindre"}
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploading(true);
                      try {
                        const url = await store.upload(
                          `factures/${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g, "_")}`,
                          f,
                        );
                        setEdit((x) => (x ? { ...x, invoice_url: url } : x));
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : String(err));
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </label>
                {edit.invoice_url && <Pill tone="ok">Facture jointe</Pill>}
              </div>
            </Field>
            <Toggle
              checked={edit.billable_to_owner ?? true}
              onChange={(v) => setEdit({ ...edit, billable_to_owner: v })}
              label="Refacturer au propriétaire (apparaît dans son rapport)"
            />
            <div className="flex justify-end">
              <button
                className="btn-primary"
                disabled={!edit.label || !edit.property_id}
                onClick={async () => {
                  const { id, ...rest } = edit;
                  if (await save("pms_expenses", id ?? null, { ...rest, amount: num(amount) }))
                    setEdit(null);
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

function Owners() {
  const { data, save, remove } = usePms();
  const [edit, setEdit] = useState<Partial<Owner> | null>(null);
  return (
    <div className="space-y-3">
      <button className="btn-primary inline-flex items-center gap-1.5" onClick={() => setEdit({})}>
        <Plus className="size-4" /> Ajouter un propriétaire
      </button>
      {data.pms_owners.length === 0 ? (
        <Empty>Aucun propriétaire.</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.pms_owners.map((o) => {
            const props = data.pms_properties.filter((p) => p.owner_id === o.id);
            return (
              <button
                key={o.id}
                onClick={() => setEdit(o)}
                className="rounded-xl border border-border bg-card p-4 text-left"
              >
                <div className="font-medium">{o.name}</div>
                <div className="text-xs text-muted-foreground">
                  {[o.email ?? "email manquant", o.phone].filter(Boolean).join(" · ")}
                </div>
                <div className="mt-2 text-xs">
                  {props.length ? props.map((p) => p.name).join(", ") : "Aucun logement associé"}
                </div>
              </button>
            );
          })}
        </div>
      )}
      {edit && (
        <Modal
          open
          onClose={() => setEdit(null)}
          title={edit.id ? (edit.name ?? "Propriétaire") : "Nouveau propriétaire"}
        >
          <div className="space-y-3">
            <Field label="Nom">
              <TextInput
                value={edit.name ?? ""}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email (reçoit les rapports)">
                <TextInput
                  type="email"
                  value={edit.email ?? ""}
                  onChange={(e) => setEdit({ ...edit, email: e.target.value || null })}
                />
              </Field>
              <Field label="Téléphone">
                <TextInput
                  value={edit.phone ?? ""}
                  onChange={(e) => setEdit({ ...edit, phone: e.target.value || null })}
                />
              </Field>
            </div>
            <Field label="Adresse">
              <TextInput
                value={edit.address ?? ""}
                onChange={(e) => setEdit({ ...edit, address: e.target.value || null })}
              />
            </Field>
            <Field label="IBAN (pour les versements)">
              <TextInput
                value={edit.iban ?? ""}
                onChange={(e) => setEdit({ ...edit, iban: e.target.value || null })}
              />
            </Field>
            <Field label="Notes">
              <TextArea
                value={edit.notes ?? ""}
                onChange={(e) => setEdit({ ...edit, notes: e.target.value || null })}
              />
            </Field>
            <div className="flex justify-between">
              {edit.id ? (
                <button
                  className="text-sm text-red-700"
                  onClick={async () => {
                    if (confirm("Supprimer ce propriétaire ?")) {
                      await remove("pms_owners", edit.id!, "Propriétaire");
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
                disabled={!edit.name}
                onClick={async () => {
                  const { id, ...rest } = edit;
                  if (await save("pms_owners", id ?? null, rest)) setEdit(null);
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}
      <Panel title="Note">
        <p className="text-sm text-muted-foreground">
          Les rapports sont envoyés à l'email du propriétaire de chaque logement. Un propriétaire
          peut avoir plusieurs logements : il reçoit un rapport par logement.
        </p>
      </Panel>
    </div>
  );
}
