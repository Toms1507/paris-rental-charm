import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { LeadForm } from "@/components/site/LeadForm";
import { RevenueSimulator } from "@/components/site/RevenueSimulator";
import { ServiceGrid } from "@/components/site/ServiceGrid";
import { ARRONDISSEMENTS, findArrondissement } from "@/content/arrondissements";
import { MARKET_PARIS } from "@/content/market-paris";
import { SITE } from "@/content/site";
import { stagger } from "@/lib/reveal";
import { absoluteUrl, pageHead } from "@/lib/seo";

// Pages locales par arrondissement : chiffres réels du marché (Inside Airbnb), recalculés
// automatiquement à chaque mise à jour des données. Chaque page a donc un contenu propre.

const NB = " ";
const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")}${NB}€`;
const pct = (n: number) => `${Math.round(n * 100)}${NB}%`;
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${pct(Math.abs(n))}`;
const BUCKETS = [
  { key: "0", label: "Studio" },
  { key: "1", label: "1 chambre" },
  { key: "2", label: "2 chambres" },
  { key: "3", label: "3 chambres et plus" },
] as const;
const SECTOR_NAMES = { nord: "Nord", sud: "Sud", est: "Est", ouest: "Ouest" } as const;

type Area = {
  priceIndex: number;
  sectors?: Record<string, { index: number; sample: number }>;
  buckets: Record<
    string,
    { price: number; occupancy: number; occupancyTop: number; sample: number }
  >;
};

function facts(n: number) {
  const area = MARKET_PARIS.arrondissements[
    String(n) as keyof typeof MARKET_PARIS.arrondissements
  ] as unknown as Area;
  const rank =
    Object.values(MARKET_PARIS.arrondissements)
      .map((a): number => a.priceIndex)
      .sort((a, b) => b - a)
      .indexOf(area.priceIndex) + 1;
  const sectors = Object.entries(area.sectors ?? {})
    .filter(([, s]) => s.sample >= 40)
    .sort((a, b) => b[1].index - a[1].index);
  const months = Object.entries(MARKET_PARIS.seasonality)
    .sort((a, b) => b[1].price * b[1].occupancy - a[1].price * a[1].occupancy)
    .slice(0, 3)
    .map(([m]) => new Date(2000, Number(m) - 1, 1).toLocaleDateString("fr-FR", { month: "long" }));
  const listings = BUCKETS.reduce((s, b) => s + (area.buckets[b.key]?.sample ?? 0), 0);
  return { area, rank, sectors, months, listings };
}

export const Route = createFileRoute("/conciergerie-paris/$arrondissement")({
  loader: ({ params }) => {
    const arr = findArrondissement(params.arrondissement);
    if (!arr) throw notFound();
    return { arr };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Page introuvable" }, { name: "robots", content: "noindex" }] };
    }
    const { arr } = loaderData;
    const { area } = facts(arr.n);
    const path = `/conciergerie-paris/${arr.slug}`;
    return pageHead({
      title: `Conciergerie Airbnb Paris ${arr.label} (${arr.name}) | Spinelle`,
      description: `Conciergerie Airbnb dans le ${arr.label} arrondissement de Paris : un logement d'une chambre s'y loue ${euros(area.buckets["1"]!.price)} la nuit (prix médian). Gestion complète et estimation gratuite.`,
      path,
      breadcrumb: [
        { name: "Zones", path: "/zones" },
        { name: `Paris ${arr.label}`, path },
      ],
      jsonLd: [
        {
          "@type": "Service",
          name: `Conciergerie Airbnb Paris ${arr.label}`,
          serviceType: "Gestion de location courte durée",
          url: absoluteUrl(path),
          provider: { "@id": `${SITE.url}/#organization` },
          areaServed: {
            "@type": "AdministrativeArea",
            name: `Paris ${arr.label} arrondissement`,
            containedInPlace: { "@type": "City", name: "Paris" },
          },
        },
      ],
    });
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl">Arrondissement introuvable</h1>
      <Link to="/zones" className="btn-primary mt-6">
        Voir toutes nos zones
      </Link>
    </div>
  ),
  component: ArrondissementPage,
});

function ArrondissementPage() {
  const { arr } = Route.useLoaderData();
  const { area, rank, sectors, months, listings } = facts(arr.n);
  const index = area.priceIndex - 1;
  const neighbours = ARRONDISSEMENTS.filter((a) => a.n !== arr.n);
  const period = new Date(MARKET_PARIS.snapshot).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div data-reveal="up" className="container-page [&>*]:max-w-3xl">
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Accueil
            </Link>{" "}
            /{" "}
            <Link to="/zones" className="hover:text-primary">
              Zones
            </Link>{" "}
            / <span>Paris {arr.label}</span>
          </nav>
          <p className="eyebrow mt-6">Conciergerie Airbnb — {arr.name}</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Conciergerie Airbnb Paris {arr.label}</h1>
          <p className="mt-5 text-muted-foreground">
            Spinelle Conciergerie gère votre location courte durée dans le {arr.label}{" "}
            arrondissement ({arr.quartiers.join(", ")}) : annonce, voyageurs, ménage hôtelier, linge
            et maintenance, pour une commission unique de 20&nbsp;% des revenus encaissés.
          </p>
          <a href="#simulateur" className="btn-primary mt-8">
            Estimer mes revenus dans le {arr.label} <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <section className="container-page py-20">
        <div data-reveal="up" className="max-w-2xl">
          <p className="eyebrow">Le marché en chiffres</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">
            Location courte durée dans le {arr.label} arrondissement
          </h2>
          <p className="mt-4 text-muted-foreground">
            Données réelles de {listings.toLocaleString("fr-FR")} logements entiers activement loués
            sur Airbnb dans l'arrondissement (relevé de {period}, actualisé chaque mois).
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BUCKETS.map((b, i) => {
            const cell = area.buckets[b.key]!;
            return (
              <article
                key={b.key}
                data-reveal="up"
                style={stagger(i)}
                className="card-hover rounded-2xl border border-border bg-background p-6"
              >
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {b.label}
                </p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-primary">
                  {euros(cell.price)}
                </p>
                <p className="text-sm text-muted-foreground">prix médian par nuit</p>
                <p className="mt-4 text-sm">
                  Taux d'occupation médian&nbsp;: <strong>{pct(cell.occupancy)}</strong>
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div data-reveal="up" className="rounded-2xl bg-[var(--sand)] p-6">
            <p className="text-sm font-semibold">Niveau de prix</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
              À taille égale, les prix par nuit y sont <strong>{signed(index)}</strong> par rapport
              à la médiane parisienne, soit le {rank === 1 ? "1er" : `${rank}e`} arrondissement le
              plus cher sur 20.
            </p>
          </div>
          <div data-reveal="up" style={stagger(1)} className="rounded-2xl bg-[var(--sand)] p-6">
            <p className="text-sm font-semibold">Secteurs de l'arrondissement</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
              {sectors.length >= 2
                ? `Le secteur ${SECTOR_NAMES[sectors[0]![0] as keyof typeof SECTOR_NAMES]} est le plus valorisé (${signed(sectors[0]![1].index - 1)} par rapport à la moyenne de l'arrondissement) ; le secteur ${SECTOR_NAMES[sectors.at(-1)![0] as keyof typeof SECTOR_NAMES]} est le plus accessible (${signed(sectors.at(-1)![1].index - 1)}).`
                : "Les prix sont homogènes d'un secteur à l'autre de l'arrondissement."}
            </p>
          </div>
          <div data-reveal="up" style={stagger(2)} className="rounded-2xl bg-[var(--sand)] p-6">
            <p className="text-sm font-semibold">Saisonnalité</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
              Les mois les plus porteurs à Paris sont {months.join(", ")} : c'est là qu'une
              tarification ajustée chaque jour fait le plus de différence.
            </p>
          </div>
        </div>
      </section>

      <section id="simulateur" className="scroll-mt-24 bg-[var(--sand)] py-20">
        <div className="container-page">
          <div data-reveal="up" className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Simulateur de revenus</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Combien peut rapporter votre logement dans le {arr.label}&nbsp;?
            </h2>
          </div>
          <div data-reveal="zoom" className="mt-12">
            <RevenueSimulator initialLocation={`paris-${arr.n}`} />
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div data-reveal="up" className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl">
            Ce que nous gérons pour votre logement dans le {arr.label}
          </h2>
        </div>
        <div className="mt-10">
          <ServiceGrid />
        </div>
      </section>

      <section id="estimation" className="scroll-mt-24 bg-[var(--sand)] py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div data-reveal="left" className="lg:sticky lg:top-28">
            <h2 className="text-3xl sm:text-4xl">Audit gratuit de votre bien</h2>
            <p className="mt-4 text-muted-foreground">
              Décrivez votre logement&nbsp;: nous vous envoyons sous 24&nbsp;h une estimation
              personnalisée, gratuitement et sans engagement.
            </p>
            <h3 className="mt-10 text-lg">Les autres arrondissements</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {neighbours.map((a) => (
                <li key={a.slug}>
                  <Link
                    to="/conciergerie-paris/$arrondissement"
                    params={{ arrondissement: a.slug }}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-primary"
                  >
                    <MapPin className="size-3.5 text-primary" /> Paris {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal="right">
            <LeadForm />
          </div>
        </div>
      </section>
    </>
  );
}
