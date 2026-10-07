import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, ExternalLink, Plus, RefreshCw } from "lucide-react";
import { origin, usePms } from "@/components/gestion/PmsProvider";
import {
  CopyButton,
  Empty,
  Field,
  Modal,
  num,
  PageHeader,
  Pill,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/gestion/ui";
import { token as newToken } from "@/lib/pms/defaults";
import { whatsappLink } from "@/lib/pms/templates";
import type { Cleaner } from "@/lib/pms/types";

export const Route = createFileRoute("/gestion/prestataires")({ component: CleanersPage });

function CleanersPage() {
  const { data, mode } = usePms();
  const [edit, setEdit] = useState<Partial<Cleaner> | null>(null);
  return (
    <div>
      <PageHeader
        title="Prestataires ménage"
        subtitle="Femmes de ménage et sociétés de nettoyage. Chacun reçoit un lien personnel (sans mot de passe) : planning, codes d'accès, check-list, envoi des photos et état du logement en vert, orange ou rouge."
        actions={
          <button
            className="btn-primary inline-flex items-center gap-1.5"
            onClick={() => setEdit({ active: true, rate: 0 })}
          >
            <Plus className="size-4" /> Ajouter un prestataire
          </button>
        }
      />
      {data.pms_cleaners.length === 0 ? (
        <Empty>Aucun prestataire.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.pms_cleaners.map((c) => {
            const tasks = data.pms_cleaning_tasks.filter((t) => t.cleaner_id === c.id);
            const done = tasks.filter((t) => t.status === "termine");
            const issues = done.filter(
              (t) => t.condition === "orange" || t.condition === "rouge",
            ).length;
            const withPhotos = done.filter((t) => t.photos.length > 0).length;
            const portal = `${origin()}/menage/${c.token}`;
            const feed = `${origin()}/api/pms/menage/${c.token}`;
            const props = data.pms_properties.filter((p) => p.cleaner_id === c.id);
            return (
              <div key={c.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <button className="text-left" onClick={() => setEdit(c)}>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[c.company, c.phone, c.email].filter(Boolean).join(" · ")}
                    </div>
                  </button>
                  {!c.active && <Pill>Inactif</Pill>}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {props.length
                    ? `Logements : ${props.map((p) => p.name).join(", ")}`
                    : "Aucun logement attribué par défaut"}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <span>{done.length} ménage(s) faits</span>
                  <span>{withPhotos} avec photos</span>
                  <span>{issues} signalement(s)</span>
                  {c.rate > 0 && <span>{c.rate} € / ménage</span>}
                </div>
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton text={portal} label="Copier son lien" />
                    <a
                      href={portal}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      <ExternalLink className="size-3.5" /> Voir son portail
                    </a>
                    {c.phone && (
                      <a
                        href={whatsappLink(
                          c.phone,
                          `Bonjour ${c.name.split(" ")[0]}, voici votre espace Spinelle pour les ménages : planning, codes, check-list et photos.\n${portal}\n\nPour avoir le planning dans votre agenda : ${feed}`,
                        )}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 rounded-md bg-[#25D366] px-2.5 py-1.5 text-xs font-medium text-white"
                      >
                        Envoyer par WhatsApp
                      </a>
                    )}
                  </div>
                  {mode === "cloud" && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <CalendarPlus className="size-3.5" /> Agenda du téléphone :
                      <CopyButton text={feed} label="Copier le lien d'agenda" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {edit && <CleanerDialog cleaner={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function CleanerDialog({ cleaner, onClose }: { cleaner: Partial<Cleaner>; onClose: () => void }) {
  const { save, remove } = usePms();
  const [c, setC] = useState(cleaner);
  const [rate, setRate] = useState(String(cleaner.rate ?? 0));
  return (
    <Modal open onClose={onClose} title={c.id ? (c.name ?? "Prestataire") : "Nouveau prestataire"}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom">
            <TextInput
              value={c.name ?? ""}
              onChange={(e) => setC({ ...c, name: e.target.value })}
            />
          </Field>
          <Field label="Société">
            <TextInput
              value={c.company ?? ""}
              onChange={(e) => setC({ ...c, company: e.target.value || null })}
            />
          </Field>
          <Field label="Téléphone (WhatsApp)">
            <TextInput
              type="tel"
              value={c.phone ?? ""}
              onChange={(e) => setC({ ...c, phone: e.target.value || null })}
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={c.email ?? ""}
              onChange={(e) => setC({ ...c, email: e.target.value || null })}
            />
          </Field>
          <Field label="Tarif par ménage (€)">
            <TextInput inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
          </Field>
          <div className="pt-6">
            <Toggle
              checked={c.active ?? true}
              onChange={(v) => setC({ ...c, active: v })}
              label="Actif"
            />
          </div>
        </div>
        <Field label="Notes">
          <TextArea
            value={c.notes ?? ""}
            onChange={(e) => setC({ ...c, notes: e.target.value || null })}
          />
        </Field>
        {c.id && (
          <button
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline"
            onClick={() =>
              confirm("L'ancien lien ne fonctionnera plus. Continuer ?") &&
              setC({ ...c, token: newToken() })
            }
          >
            <RefreshCw className="size-3.5" /> Générer un nouveau lien (si l'ancien a été partagé
            par erreur)
          </button>
        )}
        <div className="flex justify-between border-t border-border pt-3">
          {c.id ? (
            <button
              className="text-sm text-red-700"
              onClick={async () => {
                if (confirm("Supprimer ce prestataire ?")) {
                  await remove("pms_cleaners", c.id!, "Prestataire");
                  onClose();
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
            disabled={!c.name}
            onClick={async () => {
              const { id, ...rest } = c;
              if (await save("pms_cleaners", id ?? null, { ...rest, rate: num(rate) })) onClose();
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}
