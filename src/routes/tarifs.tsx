import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { LeadForm } from "@/components/site/LeadForm";
import { CITIES, SITE } from "@/content/site";
import { absoluteUrl, pageHead } from "@/lib/seo";

const TITLE = "Tarifs conciergerie Airbnb Paris : 20 % tout compris";
const DESCRIPTION =
  "Commission unique de 20 % des revenus locatifs, sans frais de mise en place ni abonnement : découvrez tout ce que comprend notre gestion à Paris.";

const INCLUDED = [
  "Création et optimisation des annonces Airbnb, Booking et Abritel",
  "Photos professionnelles du logement",
  "Tarification dynamique ajustée chaque jour",
  "Gestion des messages et sélection des voyageurs 7j/7",
  "Arrivées, départs et remise des clés",
  "Ménage hôtelier entre chaque séjour",
  "Linge de lit et de toilette professionnel",
  "Réassort des consommables (café, savon, papier)",
  "Maintenance, petits travaux et suivi des artisans",
  "Déclaration en mairie, taxe de séjour, suivi de conformité",
  "Récapitulatif mensuel de vos revenus",
];

export const Route = createFileRoute("/tarifs")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/tarifs",
      breadcrumb: [{ name: "Tarifs", path: "/tarifs" }],
      jsonLd: [
        {
          "@type": "Service",
          name: "Gestion complète de location courte durée",
          provider: { "@id": `${SITE.url}/#organization` },
          areaServed: CITIES.map((c) => ({ "@type": "City", name: c.name })),
          offers: {
            "@type": "Offer",
            name: "Gestion complète",
            description:
              "Commission de 20 % TTC des revenus locatifs encaissés, sans frais de mise en place ni abonnement.",
            priceCurrency: "EUR",
            url: absoluteUrl("/tarifs"),
          },
        },
      ],
    }),
  component: TarifsPage,
});

function TarifsPage() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div data-reveal="up" className="container-page [&>*]:max-w-3xl">
          <p className="eyebrow">Tarifs</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Un tarif simple, sans surprise</h1>
          <p className="mt-5 text-muted-foreground">
            Nous ne gagnons que lorsque votre logement est loué. Pas d'abonnement, pas de frais
            cachés, pas d'engagement de durée.
          </p>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col gap-0 rounded-2xl border border-border p-8 shadow-[var(--shadow-soft)]">
            <p className="eyebrow">Gestion complète</p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-5xl text-primary">
              20&nbsp;%
            </p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
              des revenus locatifs encaissés, TTC, tout compris
            </p>
            <ul className="mt-8 space-y-3">
              {INCLUDED.map((i) => (
                <li key={i} className="flex gap-3 text-[0.95rem]">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-muted-foreground lg:mt-auto lg:pt-8">
              Les frais de plateforme (Airbnb, Booking) et la taxe de séjour sont prélevés
              directement par les plateformes. Le premier shooting photo est offert.
            </p>
            <Link
              to="/"
              hash="simulateur"
              className="mt-8 flex items-center justify-between gap-4 rounded-xl bg-[var(--sand)] p-5 transition-colors hover:bg-primary/10"
            >
              <span>
                <span className="block font-semibold">
                  Combien vous rapporterait votre bien&nbsp;?
                </span>
                <span className="text-sm text-muted-foreground">
                  Testez notre simulateur fondé sur les données réelles de votre quartier.
                </span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-primary" />
            </Link>
          </div>
          <LeadForm />
        </div>
      </section>
    </>
  );
}
