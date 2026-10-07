import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Plus, RefreshCw, Sparkles, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { origin, usePms } from "@/components/gestion/PmsProvider";
import {
  CopyButton,
  Empty,
  Field,
  Modal,
  num,
  PageHeader,
  Panel,
  Pill,
  PlatformBadge,
  Select,
  TextArea,
  TextInput,
  Toggle,
  compressImage,
} from "@/components/gestion/ui";
import { formatDateTime } from "@/lib/pms/dates";
import { syncProperty, type RunSummary } from "@/lib/pms/engine";
import { pmsGenerateRecos } from "@/lib/pms/functions";
import { guessPlatform } from "@/lib/pms/ical";
import {
  PLATFORMS,
  RECO_CATEGORIES,
  type Guide,
  type Platform,
  type Property,
  type Recommendation,
} from "@/lib/pms/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gestion/logements/$id")({ component: PropertyPage });

type Tab = "infos" | "calendriers" | "livret" | "menage" | "bonsplans";

const ARRONDISSEMENTS = [
  ...Array.from({ length: 20 }, (_, i) => `${i + 1}${i === 0 ? "er" : "e"} arrondissement`),
  "Boulogne-Billancourt",
  "Neuilly-sur-Seine",
  "Levallois-Perret",
  "Issy-les-Moulineaux",
  "Saint-Ouen",
  "Montreuil",
  "Vincennes",
  "Autre (Île-de-France)",
];

function PropertyPage() {
  const { id } = Route.useParams();
  const { data, save, remove, store } = usePms();
  const navigate = useNavigate();
  const original = data.pms_properties.find((p) => p.id === id);
  const [p, setP] = useState<Property | null>(original ?? null);
  const [tab, setTab] = useState<Tab>("infos");
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (original && !dirty) setP(original);
  }, [original, dirty]);

  if (!p)
    return (
      <Empty>
        Logement introuvable.{" "}
        <Link to="/gestion/logements" className="underline">
          Retour
        </Link>
      </Empty>
    );

  const set = <K extends keyof Property>(k: K, v: Property[K]) => {
    setP((x) => (x ? { ...x, [k]: v } : x));
    setDirty(true);
  };
  const setGuide = (k: keyof Guide, v: string) => set("guide", { ...p.guide, [k]: v || undefined });

  async function submit() {
    if (!p) return;
    const { id: pid, ...rest } = p;
    if (await save("pms_properties", pid, rest)) {
      setDirty(false);
      toast.success("Logement enregistré");
    }
  }

  async function uploadPhoto(file: File | undefined) {
    if (!file || !p) return;
    try {
      set(
        "photo_url",
        await store.upload(
          `logements/${p.id}/${crypto.randomUUID()}.jpg`,
          await compressImage(file, 1600),
        ),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "infos", label: "Infos et tarifs" },
    { id: "calendriers", label: "Calendriers" },
    { id: "livret", label: "Livret d'accueil" },
    { id: "menage", label: "Check-list ménage" },
    { id: "bonsplans", label: "Bons plans" },
  ];

  return (
    <div>
      <Link
        to="/gestion/logements"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Logements
      </Link>
      <PageHeader
        title={p.name || "Logement"}
        subtitle={p.address ?? undefined}
        actions={
          <>
            <button className={cn("btn-primary", !dirty && "opacity-60")} onClick={submit}>
              {dirty ? "Enregistrer les modifications" : "Enregistré"}
            </button>
          </>
        }
      />
      <div className="mb-5 flex flex-wrap gap-1 border-b border-border">
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
          </button>
        ))}
      </div>

      {tab === "infos" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Le logement">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nom" className="sm:col-span-2">
                <TextInput value={p.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Adresse complète" className="sm:col-span-2">
                <TextInput
                  value={p.address ?? ""}
                  onChange={(e) => set("address", e.target.value || null)}
                />
              </Field>
              <Field label="Quartier">
                <Select
                  value={p.arrondissement ?? ""}
                  onChange={(e) => set("arrondissement", e.target.value || null)}
                  options={[
                    { value: "", label: "Choisir…" },
                    ...ARRONDISSEMENTS.map((a) => ({ value: a, label: a })),
                  ]}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Chambres">
                  <TextInput
                    type="number"
                    min={0}
                    value={p.bedrooms}
                    onChange={(e) => set("bedrooms", num(e.target.value))}
                  />
                </Field>
                <Field label="Capacité">
                  <TextInput
                    type="number"
                    min={1}
                    value={p.capacity}
                    onChange={(e) => set("capacity", num(e.target.value))}
                  />
                </Field>
              </div>
              <Field label="Propriétaire">
                <Select
                  value={p.owner_id ?? ""}
                  onChange={(e) => set("owner_id", e.target.value || null)}
                  options={[
                    { value: "", label: "—" },
                    ...data.pms_owners.map((o) => ({ value: o.id, label: o.name })),
                  ]}
                />
              </Field>
              <Field label="Prestataire ménage">
                <Select
                  value={p.cleaner_id ?? ""}
                  onChange={(e) => set("cleaner_id", e.target.value || null)}
                  options={[
                    { value: "", label: "—" },
                    ...data.pms_cleaners.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              </Field>
              <Field label="Photo" className="sm:col-span-2">
                <div className="flex items-center gap-3">
                  {p.photo_url && (
                    <img src={p.photo_url} alt="" className="h-16 w-24 rounded-md object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadPhoto(e.target.files?.[0])}
                    className="text-sm"
                  />
                </div>
              </Field>
              <div className="sm:col-span-2">
                <Toggle
                  checked={p.active}
                  onChange={(v) => set("active", v)}
                  label="Logement actif (synchronisé et inclus dans les rapports)"
                />
              </div>
            </div>
          </Panel>
          <Panel title="Horaires, options et rémunération">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Arrivée à partir de">
                <TextInput
                  type="time"
                  value={p.checkin_time}
                  onChange={(e) => set("checkin_time", e.target.value)}
                />
              </Field>
              <Field label="Départ avant">
                <TextInput
                  type="time"
                  value={p.checkout_time}
                  onChange={(e) => set("checkout_time", e.target.value)}
                />
              </Field>
              <Field label="Départ tardif possible jusqu'à">
                <TextInput
                  type="time"
                  value={p.late_checkout_until}
                  onChange={(e) => set("late_checkout_until", e.target.value)}
                />
              </Field>
              <Field label="Prix du départ tardif (€)" hint="0 = offert">
                <TextInput
                  inputMode="decimal"
                  value={p.late_checkout_price}
                  onChange={(e) => set("late_checkout_price", num(e.target.value))}
                />
              </Field>
              <Field label="Prix de l'arrivée anticipée (€)">
                <TextInput
                  inputMode="decimal"
                  value={p.early_checkin_price}
                  onChange={(e) => set("early_checkin_price", num(e.target.value))}
                />
              </Field>
              <Field
                label="Frais de ménage facturés (€)"
                hint="Pré-rempli sur les réservations importées"
              >
                <TextInput
                  inputMode="decimal"
                  value={p.cleaning_fee}
                  onChange={(e) => set("cleaning_fee", num(e.target.value))}
                />
              </Field>
              <Field
                label="Commission conciergerie (%)"
                hint="Sur les revenus hors frais de plateforme et de ménage"
              >
                <TextInput
                  inputMode="decimal"
                  value={Math.round(p.commission_rate * 1000) / 10}
                  onChange={(e) => set("commission_rate", num(e.target.value) / 100)}
                />
              </Field>
            </div>
          </Panel>
          <div className="lg:col-span-2">
            <button
              className="inline-flex items-center gap-1.5 text-sm text-red-700"
              onClick={async () => {
                if (
                  !confirm(
                    "Supprimer ce logement et toutes ses réservations, ménages et rapports ?",
                  )
                )
                  return;
                await remove("pms_properties", p.id, "Logement");
                navigate({ to: "/gestion/logements" });
              }}
            >
              <Trash2 className="size-4" /> Supprimer le logement
            </button>
          </div>
        </div>
      )}

      {tab === "calendriers" && <Calendars p={p} set={set} dirty={dirty} onSave={submit} />}

      {tab === "livret" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Accès (visible à partir de la veille de l'arrivée)">
            <div className="space-y-3">
              <Field label="Instructions d'accès">
                <TextArea
                  rows={4}
                  value={p.guide.access_details ?? ""}
                  onChange={(e) => setGuide("access_details", e.target.value)}
                  placeholder="Digicode de la rue, étage, porte, où trouver les clés…"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Code de la porte">
                  <TextInput
                    value={p.guide.door_code ?? ""}
                    onChange={(e) => setGuide("door_code", e.target.value)}
                  />
                </Field>
                <Field label="Code de la boîte à clés">
                  <TextInput
                    value={p.guide.keybox_code ?? ""}
                    onChange={(e) => setGuide("keybox_code", e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nom du wifi">
                  <TextInput
                    value={p.guide.wifi_name ?? ""}
                    onChange={(e) => setGuide("wifi_name", e.target.value)}
                  />
                </Field>
                <Field label="Mot de passe wifi">
                  <TextInput
                    value={p.guide.wifi_password ?? ""}
                    onChange={(e) => setGuide("wifi_password", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Panel>
          <Panel title="Pendant le séjour">
            <div className="space-y-3">
              <Field label="Message d'accueil">
                <TextArea
                  value={p.guide.welcome ?? ""}
                  onChange={(e) => setGuide("welcome", e.target.value)}
                />
              </Field>
              <Field label="Règles de la maison">
                <TextArea
                  value={p.guide.house_rules ?? ""}
                  onChange={(e) => setGuide("house_rules", e.target.value)}
                />
              </Field>
              <Field label="Équipements et appareils">
                <TextArea
                  value={p.guide.appliances ?? ""}
                  onChange={(e) => setGuide("appliances", e.target.value)}
                  placeholder="Machine à café, lave-linge, TV, fer à repasser…"
                />
              </Field>
              <Field label="Chauffage / climatisation">
                <TextArea
                  value={p.guide.heating ?? ""}
                  onChange={(e) => setGuide("heating", e.target.value)}
                />
              </Field>
            </div>
          </Panel>
          <Panel title="Quartier et pratique">
            <div className="space-y-3">
              <Field label="Transports">
                <TextArea
                  value={p.guide.transport ?? ""}
                  onChange={(e) => setGuide("transport", e.target.value)}
                  placeholder="Métro, bus, aéroports, gares, taxis…"
                />
              </Field>
              <Field label="Parking">
                <TextArea
                  value={p.guide.parking ?? ""}
                  onChange={(e) => setGuide("parking", e.target.value)}
                />
              </Field>
              <Field label="Poubelles et tri">
                <TextArea
                  value={p.guide.trash ?? ""}
                  onChange={(e) => setGuide("trash", e.target.value)}
                />
              </Field>
            </div>
          </Panel>
          <Panel title="Départ, urgences et questions fréquentes">
            <div className="space-y-3">
              <Field label="Consignes de départ">
                <TextArea
                  value={p.guide.checkout_instructions ?? ""}
                  onChange={(e) => setGuide("checkout_instructions", e.target.value)}
                />
              </Field>
              <Field label="Urgences et dépannage">
                <TextArea
                  value={p.guide.emergency ?? ""}
                  onChange={(e) => setGuide("emergency", e.target.value)}
                  placeholder="Disjoncteur, vanne d'eau, contacts utiles…"
                />
              </Field>
              <Field label="Questions fréquentes (utilisées par l'assistant)">
                <TextArea
                  rows={5}
                  value={p.guide.faq ?? ""}
                  onChange={(e) => setGuide("faq", e.target.value)}
                  placeholder="Sèche-cheveux ? Dans le tiroir de la salle de bain.&#10;Lit bébé ? Sur demande."
                />
              </Field>
              <Field label="Notes pour le ménage (non visibles des voyageurs)">
                <TextArea
                  value={p.guide.cleaning_notes ?? ""}
                  onChange={(e) => setGuide("cleaning_notes", e.target.value)}
                  placeholder="Où est le linge propre, local ménage, produits…"
                />
              </Field>
            </div>
          </Panel>
        </div>
      )}

      {tab === "menage" && (
        <Panel title="Check-list remise à chaque ménage">
          <ul className="space-y-2">
            {p.checklist.map((c, i) => (
              <li key={i} className="flex gap-2">
                <TextInput
                  value={c.label}
                  onChange={(e) =>
                    set(
                      "checklist",
                      p.checklist.map((x, j) => (j === i ? { label: e.target.value } : x)),
                    )
                  }
                />
                <button
                  className="rounded-md border border-border px-2"
                  onClick={() =>
                    set(
                      "checklist",
                      p.checklist.filter((_, j) => j !== i),
                    )
                  }
                  aria-label="Retirer"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            className="btn-outline mt-3 inline-flex items-center gap-1.5"
            onClick={() => set("checklist", [...p.checklist, { label: "" }])}
          >
            <Plus className="size-4" /> Ajouter un point
          </button>
        </Panel>
      )}

      {tab === "bonsplans" && <Recommendations p={p} />}
    </div>
  );
}

function Calendars({
  p,
  set,
  dirty,
  onSave,
}: {
  p: Property;
  set: <K extends keyof Property>(k: K, v: Property[K]) => void;
  dirty: boolean;
  onSave: () => Promise<void>;
}) {
  const { runContext, reload, data, mode } = usePms();
  const [busy, setBusy] = useState(false);
  const exportUrl = `${origin()}/api/pms/calendrier/${p.export_token}`;

  async function syncNow() {
    if (dirty) await onSave();
    setBusy(true);
    const summary: RunSummary = {
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
    try {
      const fresh =
        (await runContext().store.list("pms_properties")).find((x) => x.id === p.id) ?? p;
      await syncProperty(
        runContext(),
        { ...data, pms_reservations: await runContext().store.list("pms_reservations") },
        fresh,
        summary,
      );
      await reload();
      if (summary.feedErrors.length)
        toast.error("Erreur de synchronisation", { description: summary.feedErrors.join("\n") });
      else
        toast.success(
          `${summary.synced} calendrier(s) synchronisé(s), ${summary.newReservations} nouvelle(s) réservation(s)`,
        );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="1. Importer les calendriers des plateformes"
        actions={
          <button
            className="btn-outline inline-flex items-center gap-1.5 text-sm"
            onClick={syncNow}
            disabled={busy}
          >
            <RefreshCw className={cn("size-4", busy && "animate-spin")} /> Synchroniser
          </button>
        }
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Collez le lien d'export iCal de chaque annonce. Les réservations, modifications et
          annulations arrivent automatiquement (toutes les 15 minutes côté serveur, et à chaque
          ouverture du logiciel).
        </p>
        <div className="space-y-3">
          {p.ical_feeds.map((f, i) => (
            <div key={i} className="rounded-lg border border-border p-3">
              <div className="flex gap-2">
                <Select
                  className="w-40"
                  value={f.platform}
                  onChange={(e) =>
                    set(
                      "ical_feeds",
                      p.ical_feeds.map((x, j) =>
                        j === i ? { ...x, platform: e.target.value as Platform } : x,
                      ),
                    )
                  }
                  options={Object.entries(PLATFORMS)
                    .filter(([k]) => k !== "direct")
                    .map(([value, x]) => ({ value, label: x.label }))}
                />
                <TextInput
                  placeholder="https://www.airbnb.fr/calendar/ical/….ics"
                  value={f.url}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    set(
                      "ical_feeds",
                      p.ical_feeds.map((x, j) =>
                        j === i
                          ? { ...x, url, platform: x.url ? x.platform : guessPlatform(url) }
                          : x,
                      ),
                    );
                  }}
                />
                <button
                  className="rounded-md border border-border px-2"
                  onClick={() =>
                    set(
                      "ical_feeds",
                      p.ical_feeds.filter((_, j) => j !== i),
                    )
                  }
                  aria-label="Retirer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {f.last_sync && (
                <p
                  className={cn(
                    "mt-1.5 text-xs",
                    f.last_status?.startsWith("Erreur") ? "text-red-700" : "text-muted-foreground",
                  )}
                >
                  {formatDateTime(f.last_sync)} · {f.last_status}
                </p>
              )}
            </div>
          ))}
          <button
            className="btn-outline inline-flex items-center gap-1.5 text-sm"
            onClick={() => set("ical_feeds", [...p.ical_feeds, { platform: "airbnb", url: "" }])}
          >
            <Plus className="size-4" /> Ajouter un calendrier
          </button>
        </div>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium text-primary">
            Où trouver le lien sur chaque plateforme ?
          </summary>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            <li>
              <b>Airbnb</b> : Annonces → l'annonce → Disponibilités → « Connecter des calendriers »
              → « Exporter le calendrier » → copier le lien.
            </li>
            <li>
              <b>Booking.com</b> : Extranet → Tarifs et disponibilités → « Synchroniser les
              calendriers » → « Ajouter une connexion » → copier le lien d'export.
            </li>
            <li>
              <b>Abritel / Vrbo</b> : Calendrier → Importer / Exporter → « Exporter le calendrier »
              → copier le lien.
            </li>
          </ul>
        </details>
      </Panel>
      <Panel title="2. Bloquer les dates sur toutes les plateformes">
        <p className="mb-3 text-sm text-muted-foreground">
          Importez ce lien unique dans Airbnb, Booking et Abritel (rubrique « Importer un calendrier
          »). Une réservation prise sur une plateforme, ou ajoutée ici à la main, bloque alors les
          mêmes dates partout.
        </p>
        {mode === "demo" ? (
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
            Ce lien fonctionnera dès que la base de données sera activée (voir « Connexions et
            réglages »).
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <code className="break-all rounded bg-muted px-2 py-1 text-xs">{exportUrl}</code>
            <CopyButton text={exportUrl} />
            <a
              href={exportUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-xs text-primary underline"
            >
              Tester <ExternalLink className="size-3" />
            </a>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Les plateformes relisent les calendriers importés toutes les 30 minutes à quelques heures
          : un léger risque de double réservation subsiste sur les réservations de dernière minute.
          Il disparaît avec la connexion directe des comptes (channel manager, voir « Connexions et
          réglages »).
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.ical_feeds.map((f, i) => (
            <PlatformBadge key={i} platform={f.platform} />
          ))}
          {!p.ical_feeds.length && <Pill tone="warn">Aucune plateforme reliée</Pill>}
        </div>
      </Panel>
    </div>
  );
}

function Recommendations({ p }: { p: Property }) {
  const { data, save, remove, store, reload, mode, config } = usePms();
  const [edit, setEdit] = useState<Partial<Recommendation> | null>(null);
  const [busy, setBusy] = useState(false);
  const [proposals, setProposals] = useState<
    (Partial<Recommendation> & { keep: boolean })[] | null
  >(null);
  const list = data.pms_recommendations.filter(
    (r) =>
      r.property_id === p.id ||
      (!r.property_id && (!r.arrondissement || r.arrondissement === p.arrondissement)),
  );

  async function generate() {
    setBusy(true);
    try {
      const res = await pmsGenerateRecos({
        data: {
          area: [p.address, p.arrondissement].filter(Boolean).join(", ") || p.name,
          count: 15,
        },
      });
      setProposals(
        res.map((r) => ({
          ...r,
          category: (r.category in RECO_CATEGORIES
            ? r.category
            : "restaurant") as Recommendation["category"],
          arrondissement: p.arrondissement,
          keep: !list.some((x) => x.name.toLowerCase() === r.name.toLowerCase()),
        })),
      );
    } catch (e) {
      toast.error("Recherche impossible", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Bons plans affichés dans le livret et utilisés par l'assistant"
        actions={
          <div className="flex gap-2">
            <button
              className="btn-primary inline-flex items-center gap-1.5 text-sm"
              onClick={generate}
              disabled={busy || mode === "demo" || !config?.ai}
              title={
                mode === "demo" || !config?.ai
                  ? "Nécessite la base de données et la clé IA (Connexions et réglages)"
                  : undefined
              }
            >
              <Wand2 className={cn("size-4", busy && "animate-pulse")} />{" "}
              {busy ? "Analyse des tendances… (1 à 2 min)" : "Tendances du moment (IA)"}
            </button>
            <button
              className="btn-outline inline-flex items-center gap-1.5 text-sm"
              onClick={() =>
                setEdit({ arrondissement: p.arrondissement, category: "restaurant", active: true })
              }
            >
              <Plus className="size-4" /> Ajouter
            </button>
          </div>
        }
      >
        <p className="mb-3 text-xs text-muted-foreground">
          L'IA recherche sur le web les adresses les mieux notées et les plus en vogue autour du
          logement (TheFork, Google Maps, Time Out, Le Fooding…), vous validez celles à garder. Les
          bons plans d'un quartier servent à tous les logements de ce quartier.
        </p>
        {list.length === 0 ? (
          <Empty>Aucun bon plan pour ce quartier.</Empty>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {list.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "flex items-start justify-between gap-2 rounded-lg border border-border p-3 text-sm",
                  !r.active && "opacity-50",
                )}
              >
                <button className="flex-1 text-left" onClick={() => setEdit(r)}>
                  <div className="font-medium">
                    {r.trending && <Sparkles className="mr-1 inline size-3.5 text-amber-500" />}
                    {r.name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      · {RECO_CATEGORIES[r.category]} {r.price_level}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{r.description}</div>
                </button>
                <button onClick={() => remove("pms_recommendations", r.id)} aria-label="Supprimer">
                  <Trash2 className="size-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {proposals && (
        <Modal
          open
          onClose={() => setProposals(null)}
          title="Adresses proposées"
          description="Décochez celles que vous ne voulez pas proposer aux voyageurs."
          wide
        >
          <ul className="space-y-2">
            {proposals.map((r, i) => (
              <li key={i} className="flex gap-3 rounded-md border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={r.keep}
                  onChange={(e) =>
                    setProposals(
                      proposals.map((x, j) => (j === i ? { ...x, keep: e.target.checked } : x)),
                    )
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">
                    {r.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      · {RECO_CATEGORIES[r.category as keyof typeof RECO_CATEGORIES]}{" "}
                      {r.price_level} {r.trending ? "· tendance" : ""}
                    </span>
                  </div>
                  <div className="text-xs">{r.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.address} {r.tip ? `· ${r.tip}` : ""}{" "}
                    {r.source ? `· source : ${r.source}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-end">
            <button
              className="btn-primary"
              onClick={async () => {
                const keep = proposals
                  .filter((x) => x.keep)
                  .map(({ keep: _k, ...r }) => ({ ...r, active: true }));
                await store.insert("pms_recommendations", keep);
                await reload();
                setProposals(null);
                toast.success(`${keep.length} bon(s) plan(s) ajouté(s)`);
              }}
            >
              Ajouter la sélection
            </button>
          </div>
        </Modal>
      )}

      {edit && (
        <Modal open onClose={() => setEdit(null)} title={edit.id ? "Modifier" : "Nouveau bon plan"}>
          <div className="space-y-3">
            <Field label="Nom">
              <TextInput
                value={edit.name ?? ""}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Catégorie">
                <Select
                  value={edit.category}
                  onChange={(e) =>
                    setEdit({ ...edit, category: e.target.value as Recommendation["category"] })
                  }
                  options={Object.entries(RECO_CATEGORIES).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </Field>
              <Field label="Budget">
                <Select
                  value={edit.price_level ?? ""}
                  onChange={(e) => setEdit({ ...edit, price_level: e.target.value || null })}
                  options={["", "€", "€€", "€€€"].map((v) => ({ value: v, label: v || "—" }))}
                />
              </Field>
            </div>
            <Field label="Description">
              <TextArea
                value={edit.description ?? ""}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              />
            </Field>
            <Field label="Adresse">
              <TextInput
                value={edit.address ?? ""}
                onChange={(e) => setEdit({ ...edit, address: e.target.value })}
              />
            </Field>
            <Field label="Lien (site, TheFork, Google Maps)">
              <TextInput
                value={edit.url ?? ""}
                onChange={(e) => setEdit({ ...edit, url: e.target.value })}
              />
            </Field>
            <Field label="Conseil">
              <TextInput
                value={edit.tip ?? ""}
                onChange={(e) => setEdit({ ...edit, tip: e.target.value })}
              />
            </Field>
            <Field label="Visible pour">
              <Select
                value={edit.property_id ? "logement" : "quartier"}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    property_id: e.target.value === "logement" ? p.id : null,
                    arrondissement: p.arrondissement,
                  })
                }
                options={[
                  {
                    value: "quartier",
                    label: `Tous les logements du quartier (${p.arrondissement ?? "—"})`,
                  },
                  { value: "logement", label: "Ce logement uniquement" },
                ]}
              />
            </Field>
            <div className="flex gap-4">
              <Toggle
                checked={edit.trending ?? false}
                onChange={(v) => setEdit({ ...edit, trending: v })}
                label="Tendance"
              />
              <Toggle
                checked={edit.active ?? true}
                onChange={(v) => setEdit({ ...edit, active: v })}
                label="Visible"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="btn-primary"
                disabled={!edit.name}
                onClick={async () => {
                  const { id, ...rest } = edit;
                  if (await save("pms_recommendations", id ?? null, rest)) setEdit(null);
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
