import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Home, Plus } from "lucide-react";
import { usePms } from "@/components/gestion/PmsProvider";
import { Empty, PageHeader, Pill, PlatformBadge } from "@/components/gestion/ui";
import { addDays, percent, todayParis } from "@/lib/pms/dates";

export const Route = createFileRoute("/gestion/logements/")({ component: PropertiesPage });

function PropertiesPage() {
  const { data, save, settings } = usePms();
  const navigate = useNavigate();
  const today = todayParis();

  async function create() {
    const p = await save("pms_properties", null, {
      name: "Nouveau logement",
      commission_rate: settings.default_commission,
    });
    if (p) navigate({ to: "/gestion/logements/$id", params: { id: p.id } });
  }

  return (
    <div>
      <PageHeader
        title="Logements"
        subtitle="Chaque logement regroupe ses calendriers (Airbnb, Booking, Abritel), son livret d'accueil, sa check-list de ménage et ses bons plans."
        actions={
          <button className="btn-primary inline-flex items-center gap-1.5" onClick={create}>
            <Plus className="size-4" /> Ajouter un logement
          </button>
        }
      />
      {data.pms_properties.length === 0 ? (
        <Empty>Aucun logement pour l'instant.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.pms_properties.map((p) => {
            const owner = data.pms_owners.find((o) => o.id === p.owner_id);
            const booked = data.pms_reservations
              .filter((r) => r.property_id === p.id && r.status === "confirmee")
              .reduce((s, r) => {
                const from = r.check_in > today ? r.check_in : today;
                const to = r.check_out < addDays(today, 30) ? r.check_out : addDays(today, 30);
                return s + Math.max(0, (Date.parse(to) - Date.parse(from)) / 86_400_000);
              }, 0);
            const errors = p.ical_feeds.filter((f) => f.last_status?.startsWith("Erreur")).length;
            return (
              <Link
                key={p.id}
                to="/gestion/logements/$id"
                params={{ id: p.id }}
                className="overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-soft"
              >
                <div className="flex aspect-[16/7] items-center justify-center bg-muted">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Home className="size-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.arrondissement ?? p.address ?? "Adresse à compléter"} · {p.bedrooms} ch.
                        · {p.capacity} pers.
                      </div>
                    </div>
                    {!p.active && <Pill>Inactif</Pill>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.ical_feeds.length ? (
                      p.ical_feeds.map((f, i) => <PlatformBadge key={i} platform={f.platform} />)
                    ) : (
                      <Pill tone="warn">Aucun calendrier relié</Pill>
                    )}
                    {errors > 0 && <Pill tone="bad">{errors} calendrier(s) en erreur</Pill>}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{owner?.name ?? "Propriétaire à renseigner"}</span>
                    <span>Occupation 30 j : {percent(booked / 30)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
