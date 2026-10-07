import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, MailWarning, Plus, Search } from "lucide-react";
import { usePms, usePropertyName } from "@/components/gestion/PmsProvider";
import { ReservationDialog, type ResaDraft } from "@/components/gestion/ReservationDialog";
import { Empty, PageHeader, Pill, PlatformBadge, Select } from "@/components/gestion/ui";
import { addDays, euros, formatDay, nights, todayParis } from "@/lib/pms/dates";
import { PLATFORMS } from "@/lib/pms/types";

export const Route = createFileRoute("/gestion/reservations")({ component: ReservationsPage });

function ReservationsPage() {
  const { data } = usePms();
  const propertyName = usePropertyName();
  const today = todayParis();
  const [period, setPeriod] = useState("avenir");
  const [property, setProperty] = useState("");
  const [platform, setPlatform] = useState("");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<ResaDraft | null>(null);

  const rows = useMemo(() => {
    return data.pms_reservations
      .filter((r) => r.status !== "bloquee")
      .filter((r) => !property || r.property_id === property)
      .filter((r) => !platform || r.platform === platform)
      .filter((r) => {
        if (period === "avenir") return r.check_out >= today && r.status !== "annulee";
        if (period === "encours")
          return r.check_in <= today && r.check_out > today && r.status !== "annulee";
        if (period === "passees") return r.check_out < today && r.status !== "annulee";
        if (period === "annulees") return r.status === "annulee";
        if (period === "incompletes")
          return (
            r.status === "confirmee" &&
            r.check_out >= today &&
            (!r.guest_name || !r.guest_email || !r.amount_gross)
          );
        return true;
      })
      .filter(
        (r) =>
          !q ||
          `${r.guest_name} ${r.guest_email} ${r.notes}`.toLowerCase().includes(q.toLowerCase()),
      )
      .sort((a, b) =>
        period === "passees"
          ? b.check_in.localeCompare(a.check_in)
          : a.check_in.localeCompare(b.check_in),
      );
  }, [data, property, platform, period, q, today]);

  const total = rows
    .filter((r) => r.status === "confirmee")
    .reduce((s, r) => s + r.amount_gross, 0);

  return (
    <div>
      <PageHeader
        title="Réservations"
        subtitle="Importées automatiquement depuis les calendriers des plateformes, ou ajoutées à la main (réservations directes)."
        actions={
          <button
            className="btn-primary inline-flex items-center gap-1.5"
            onClick={() =>
              setDraft({ check_in: today, check_out: addDays(today, 2), platform: "direct" })
            }
          >
            <Plus className="size-4" /> Nouvelle réservation
          </button>
        }
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={[
            { value: "avenir", label: "À venir et en cours" },
            { value: "encours", label: "En cours" },
            { value: "incompletes", label: "À compléter (nom, email, montant)" },
            { value: "passees", label: "Passées" },
            { value: "annulees", label: "Annulées" },
            { value: "toutes", label: "Toutes" },
          ]}
        />
        <Select
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          options={[
            { value: "", label: "Tous les logements" },
            ...data.pms_properties.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <Select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          options={[
            { value: "", label: "Toutes les plateformes" },
            ...Object.entries(PLATFORMS).map(([value, p]) => ({ value, label: p.label })),
          ]}
        />
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
            placeholder="Rechercher un voyageur"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>
      {rows.length === 0 ? (
        <Empty>Aucune réservation.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Voyageur</th>
                <th className="px-4 py-3">Logement</th>
                <th className="px-4 py-3">Plateforme</th>
                <th className="px-4 py-3">Séjour</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/40"
                  onClick={() => setDraft(r)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      {r.guest_name || (
                        <span className="italic text-muted-foreground">Nom à compléter</span>
                      )}
                      {r.guest_email ? (
                        <Mail className="size-3.5 text-emerald-600" aria-label="Email connu" />
                      ) : (
                        <MailWarning className="size-3.5 text-amber-600" aria-label="Pas d'email" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{r.guests} voyageur(s)</div>
                  </td>
                  <td className="px-4 py-3">{propertyName(r.property_id)}</td>
                  <td className="px-4 py-3">
                    <PlatformBadge platform={r.platform} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDay(r.check_in)} → {formatDay(r.check_out)}
                    <div className="text-xs text-muted-foreground">{nights(r)} nuit(s)</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.amount_gross ? (
                      euros(r.amount_gross)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "annulee" ? (
                      <Pill tone="bad">Annulée</Pill>
                    ) : r.check_in <= today && r.check_out > today ? (
                      <Pill tone="info">En cours</Pill>
                    ) : r.check_out <= today ? (
                      <Pill>Terminée</Pill>
                    ) : (
                      <Pill tone="ok">Confirmée</Pill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border text-sm font-medium">
                <td className="px-4 py-3" colSpan={4}>
                  {rows.length} réservation(s)
                </td>
                <td className="px-4 py-3 text-right">{euros(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <ReservationDialog draft={draft} onClose={() => setDraft(null)} />
    </div>
  );
}
