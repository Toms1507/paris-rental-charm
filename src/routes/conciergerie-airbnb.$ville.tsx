import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { LeadForm } from "@/components/site/LeadForm";
import { ServiceGrid } from "@/components/site/ServiceGrid";
import { CITIES, SITE } from "@/content/site";
import { absoluteUrl, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/conciergerie-airbnb/$ville")({
  loader: ({ params }) => {
    const city = CITIES.find((c) => c.slug === params.ville);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Page introuvable" }, { name: "robots", content: "noindex" }] };
    }
    const { city } = loaderData;
    const path = `/conciergerie-airbnb/${city.slug}`;
    return pageHead({
      title: `Conciergerie Airbnb ${city.inName} (${city.postalCode.slice(0, 2)}) | Spinelle`,
      description: `Conciergerie Airbnb et Booking ${city.inName} : annonces, voyageurs, ménage et maintenance gérés pour vous. Estimation de revenus gratuite sous 24 h.`,
      path,
      breadcrumb: [
        { name: "Zones", path: "/zones" },
        { name: city.name, path },
      ],
      jsonLd: [
        {
          "@type": "Service",
          name: `Conciergerie Airbnb ${city.inName}`,
          serviceType: "Gestion de location courte durée",
          url: absoluteUrl(path),
          provider: { "@id": `${SITE.url}/#organization` },
          areaServed: {
            "@type": "City",
            name: city.name,
            address: {
              "@type": "PostalAddress",
              postalCode: city.postalCode,
              addressCountry: "FR",
            },
          },
          offers: {
            "@type": "Offer",
            description: "Commission de 20 % des revenus locatifs, sans frais de mise en place",
          },
        },
      ],
    });
  },
  notFoundComponent: CityNotFound,
  component: CityPage,
});

function CityNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl">Zone introuvable</h1>
      <Link to="/zones" className="btn-primary mt-6">
        Voir toutes nos zones
      </Link>
    </div>
  );
}

function CityPage() {
  const { city } = Route.useLoaderData();
  const others = CITIES.filter((c) => c.slug !== city.slug);

  return (
    <>
      <section
        id="estimation"
        className="scroll-mt-24 border-b border-border bg-[var(--sand)] py-16"
      >
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <nav aria-label="Fil d'Ariane" className="text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary">
                Accueil
              </Link>{" "}
              /{" "}
              <Link to="/zones" className="hover:text-primary">
                Zones
              </Link>{" "}
              / <span>{city.name}</span>
            </nav>
            <p className="eyebrow mt-6">Conciergerie Airbnb — {city.name}</p>
            <h1 className="mt-4 text-4xl sm:text-5xl">Conciergerie Airbnb {city.inName}</h1>
            <p className="mt-5 text-muted-foreground">{city.intro}</p>
            <ul className="mt-6 space-y-3">
              {city.assets.map((a) => (
                <li key={a} className="flex gap-3 text-[0.95rem]">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <LeadForm />
        </div>
      </section>

      <section className="container-page py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl">
            Ce que nous gérons pour votre logement {city.inName}
          </h2>
          <p className="mt-4 text-muted-foreground">
            Une gestion complète de votre location courte durée, pour 20&nbsp;% des revenus
            encaissés, sans frais de mise en place ni engagement de durée.
          </p>
        </div>
        <div className="mt-10">
          <ServiceGrid />
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/tarifs" className="btn-outline">
            Voir nos tarifs
          </Link>
          <a href="#estimation" className="btn-primary">
            Estimer mes revenus {city.inName} <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <section className="bg-[var(--sand)] py-20">
        <div className="container-page">
          <h2 className="text-3xl sm:text-4xl">Quartiers couverts {city.inName}</h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {city.neighborhoods.map((n) => (
              <li
                key={n}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm"
              >
                <MapPin className="size-3.5 text-primary" /> {n}
              </li>
            ))}
          </ul>

          <h2 className="mt-16 text-2xl sm:text-3xl">Nous intervenons aussi…</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/conciergerie-airbnb/$ville"
                  params={{ ville: c.slug }}
                  className="block rounded-lg border border-border bg-background px-4 py-3 text-sm transition-colors hover:border-primary"
                >
                  Conciergerie Airbnb {c.inName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
