import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { usePms, usePropertyName } from "@/components/gestion/PmsProvider";
import {
  Empty,
  Field,
  Modal,
  num,
  PageHeader,
  Pill,
  Select,
  TextArea,
  TextInput,
  Toggle,
  compressImage,
} from "@/components/gestion/ui";
import { formatDateTime } from "@/lib/pms/dates";
import type { Incident } from "@/lib/pms/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestion/incidents")({ component: IncidentsPage });

const STATUS = { ouvert: "Ouvert", en_cours: "En cours de résolution", resolu: "Résolu" } as const;

function IncidentsPage() {
  const { data } = usePms();
  const propertyName = usePropertyName();
  const [filter, setFilter] = useState("actifs");
  const [edit, setEdit] = useState<Partial<Incident> | null>(null);
  const list = data.pms_incidents
    .filter((i) =>
      filter === "actifs"
        ? i.status !== "resolu"
        : filter === "resolus"
          ? i.status === "resolu"
          : true,
    )
    .sort((a, b) =>
      a.severity === b.severity
        ? b.created_at.localeCompare(a.created_at)
        : a.severity === "rouge"
          ? -1
          : 1,
    );

  return (
    <div>
      <PageHeader
        title="Incidents et maintenance"
        subtitle="Ouverts automatiquement quand un ménage est signalé orange ou rouge. Les coûts refacturables apparaissent dans le rapport du propriétaire."
        actions={
          <button
            className="btn-primary inline-flex items-center gap-1.5"
            onClick={() =>
              setEdit({
                severity: "orange",
                status: "ouvert",
                property_id: data.pms_properties[0]?.id ?? "",
              })
            }
          >
            <Plus className="size-4" /> Signaler un incident
          </button>
        }
      />
      <Select
        className="mb-4 w-auto"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        options={[
          { value: "actifs", label: "En cours" },
          { value: "resolus", label: "Résolus" },
          { value: "tous", label: "Tous" },
        ]}
      />
      {list.length === 0 ? (
        <Empty>Aucun incident 🎉</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((i) => (
            <button
              key={i.id}
              onClick={() => setEdit(i)}
              className={cn(
                "rounded-xl border-l-4 border bg-card p-4 text-left",
                i.severity === "rouge" ? "border-l-red-500" : "border-l-amber-500",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {propertyName(i.property_id)} · {formatDateTime(i.created_at)}{" "}
                    {i.reported_by ? `· ${i.reported_by}` : ""}
                  </div>
                </div>
                <Pill tone={i.status === "resolu" ? "ok" : i.severity === "rouge" ? "bad" : "warn"}>
                  {STATUS[i.status]}
                </Pill>
              </div>
              {i.description && <p className="mt-2 text-sm">{i.description}</p>}
              {i.photos.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                  {i.photos.slice(0, 5).map((p) => (
                    <img key={p} src={p} alt="" className="size-12 rounded object-cover" />
                  ))}
                </div>
              )}
              {i.cost > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Coût : {i.cost} €{i.billable_to_owner ? " (refacturé au propriétaire)" : ""}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      {edit && <IncidentDialog incident={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function IncidentDialog({
  incident,
  onClose,
}: {
  incident: Partial<Incident>;
  onClose: () => void;
}) {
  const { data, save, remove, store } = usePms();
  const [i, setI] = useState<Partial<Incident>>(incident);
  const set = <K extends keyof Incident>(k: K, v: Incident[K]) => setI((x) => ({ ...x, [k]: v }));
  const [cost, setCost] = useState(String(incident.cost ?? 0));
  const [uploading, setUploading] = useState(false);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files))
        urls.push(
          await store.upload(`incidents/${crypto.randomUUID()}.jpg`, await compressImage(f)),
        );
      set("photos", [...(i.photos ?? []), ...urls]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={i.id ? "Incident" : "Nouvel incident"} wide>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Logement">
            <Select
              value={i.property_id ?? ""}
              onChange={(e) => set("property_id", e.target.value)}
              options={data.pms_properties.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Field>
          <Field label="Gravité">
            <Select
              value={i.severity ?? "orange"}
              onChange={(e) => set("severity", e.target.value as Incident["severity"])}
              options={[
                { value: "orange", label: "🟠 Petit souci" },
                { value: "rouge", label: "🔴 Gros problème" },
              ]}
            />
          </Field>
        </div>
        <Field label="Titre">
          <TextInput
            value={i.title ?? ""}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex. fuite sous l'évier"
          />
        </Field>
        <Field label="Description et suivi">
          <TextArea
            rows={4}
            value={i.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Statut">
            <Select
              value={i.status ?? "ouvert"}
              onChange={(e) => set("status", e.target.value as Incident["status"])}
              options={Object.entries(STATUS).map(([value, label]) => ({ value, label }))}
            />
          </Field>
          <Field label="Coût de l'intervention (€)">
            <TextInput inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
          </Field>
          <div className="pt-6">
            <Toggle
              checked={i.billable_to_owner ?? true}
              onChange={(v) => set("billable_to_owner", v)}
              label="Refacturer au propriétaire"
            />
          </div>
        </div>
        <div>
          <div className="mb-1 text-sm font-medium">Photos</div>
          <div className="flex flex-wrap gap-2">
            {(i.photos ?? []).map((p) => (
              <a key={p} href={p} target="_blank" rel="noopener">
                <img src={p} alt="" className="size-20 rounded-md object-cover" />
              </a>
            ))}
            <label className="flex size-20 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
              {uploading ? "…" : "+ Photo"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addPhotos(e.target.files)}
              />
            </label>
          </div>
        </div>
        <div className="flex justify-between border-t border-border pt-3">
          {i.id ? (
            <button
              className="text-sm text-red-700"
              onClick={async () => {
                if (confirm("Supprimer cet incident ?")) {
                  await remove("pms_incidents", i.id!, "Incident");
                  onClose();
                }
              }}
            >
              Supprimer
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
              disabled={!i.property_id || !i.title}
              onClick={async () => {
                const { id, ...rest } = i;
                const resolved =
                  rest.status === "resolu" && !incident.resolved_at
                    ? { resolved_at: new Date().toISOString() }
                    : {};
                if (
                  await save("pms_incidents", id ?? null, { ...rest, ...resolved, cost: num(cost) })
                )
                  onClose();
              }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
