import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/content/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/mentions-legales")({
  head: () =>
    pageHead({
      title: `Mentions légales | ${SITE.name}`,
      description: `Mentions légales du site ${SITE.name}, conciergerie Airbnb à Paris : éditeur, immatriculation, hébergeur et propriété intellectuelle.`,
      path: "/mentions-legales",
      breadcrumb: [{ name: "Mentions légales", path: "/mentions-legales" }],
    }),
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <article className="container-page py-16">
      <div className="mx-auto max-w-3xl space-y-8 text-[0.98rem] leading-relaxed">
        <h1 className="text-4xl">Mentions légales</h1>
        <section>
          <h2 className="text-2xl">Éditeur du site</h2>
          <p className="mt-3">
            Le site spinelleconciergerie.fr est édité par Tom Simon, entrepreneur individuel (EI),
            exerçant sous le nom commercial {SITE.name}.
          </p>
          <ul className="mt-3 space-y-1">
            <li>Adresse&nbsp;: 2 rue de l'Église de Benon, 33112 Saint-Laurent-Médoc, France</li>
            <li>Immatriculation au Registre national des entreprises (RNE) le 21/08/2026</li>
            <li>SIREN&nbsp;: 108 993 569 — SIRET&nbsp;: 108 993 569 00012</li>
            <li>Code APE&nbsp;: 46.19B</li>
            <li>
              Email&nbsp;:{" "}
              <a href={`mailto:${SITE.email}`} className="text-primary underline">
                {SITE.email}
              </a>
            </li>
            <li>Téléphone&nbsp;: {SITE.phone}</li>
            <li>Directeur de la publication&nbsp;: Tom Simon</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl">Hébergement</h2>
          <p className="mt-3">
            Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis —{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener"
              className="text-primary underline"
            >
              vercel.com
            </a>
          </p>
        </section>
        <section>
          <h2 className="text-2xl">Propriété intellectuelle</h2>
          <p className="mt-3">
            L'ensemble des contenus de ce site (textes, images, logo) est la propriété de{" "}
            {SITE.name}, sauf mention contraire. Toute reproduction sans autorisation est interdite.
          </p>
          <p className="mt-3">
            Les statistiques du marché de la location courte durée (simulateur, baromètre) sont
            calculées à partir des données publiées par Inside Airbnb (licence CC BY 4.0), des prix
            réellement facturés publiés par AirROI, des prix immobiliers DVF (data.gouv.fr) et des
            statistiques de fréquentation d'Eurostat.
          </p>
        </section>
        <section>
          <h2 className="text-2xl">Données personnelles</h2>
          <p className="mt-3">
            Le traitement des données collectées via le formulaire d'estimation est décrit dans
            notre{" "}
            <a href="/confidentialite" className="text-primary underline">
              politique de confidentialité
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
