import { createFileRoute, Link } from "@tanstack/react-router";
import { LeadForm } from "@/components/site/LeadForm";
import { ServiceGrid } from "@/components/site/ServiceGrid";
import { CITIES, SERVICES, SITE, STEPS } from "@/content/site";
import { absoluteUrl, pageHead } from "@/lib/seo";

const TITLE = "Services de conciergerie Airbnb à Paris — Spinelle Conciergerie";
const DESCRIPTION =
  "Gestion complète de votre location courte durée à Paris : création d'annonces Airbnb et Booking, tarification dynamique, accueil des voyageurs, ménage hôtelier, linge, maintenance et conformité.";

export const Route = createFileRoute("/services")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/services",
      breadcrumb: [{ name: "Services", path: "/services" }],
      jsonLd: [
        {
          "@type": "Service",
          name: "Conciergerie Airbnb et gestion de location courte durée",
          serviceType: "Gestion de location courte durée",
          provider: { "@id": `${SITE.url}/#organization` },
          areaServed: CITIES.map((c) => ({ "@type": "City", name: c.name })),
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Services inclus",
            itemListElement: SERVICES.map((s) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: s.title, description: s.text },
            })),
          },
        },
      ],
    }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div data-reveal="up" className="container-page [&>*]:max-w-3xl">
          <p className="eyebrow">Services</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            Tout ce que comprend notre conciergerie Airbnb
          </h1>
          <p className="mt-5 text-muted-foreground">
            Une seule équipe pour votre annonce, vos voyageurs, votre ménage et votre tranquillité.
            Vous gardez la propriété et le contrôle de votre calendrier, nous prenons en charge
            l'exécution au quotidien.
          </p>
          <a href="#estimation" className="btn-primary mt-8">
            Estimation gratuite
          </a>
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="text-3xl sm:text-4xl">Sept services, un seul interlocuteur</h2>
        <div className="mt-10">
          <ServiceGrid />
        </div>
      </section>

      <section className="bg-[var(--sand)] py-20">
        <div className="container-page">
          <h2 className="text-3xl sm:text-4xl">Le déroulé, étape par étape</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <article key={s.title} className="rounded-xl border border-border bg-background p-6">
                <h3 className="text-lg">{s.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="estimation" className="container-page scroll-mt-24 py-20">
        <div className="mx-auto max-w-3xl">
          <LeadForm />
        </div>
      </section>
    </>
  );
}
