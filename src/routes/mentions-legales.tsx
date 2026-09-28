import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/content/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/mentions-legales")({
  head: () =>
    pageHead({
      title: `Mentions légales | ${SITE.name}`,
      description: `Mentions légales du site ${SITE.name}, conciergerie Airbnb à Paris et alentours.`,
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
          {/* À compléter dès l'immatriculation de la société. */}
          <p className="mt-3">
            {SITE.name} — [forme juridique et capital à compléter]
            <br />
            Siège social&nbsp;: [adresse à compléter]
            <br />
            SIRET&nbsp;: [à compléter] — RCS&nbsp;: [à compléter]
            <br />
            Carte professionnelle (loi Hoguet), le cas échéant : [à compléter]
            <br />
            Email : {SITE.email}
            <br />
            Directeur de la publication&nbsp;: [nom à compléter]
          </p>
        </section>
        <section>
          <h2 className="text-2xl">Hébergement</h2>
          <p className="mt-3">[Nom, adresse et téléphone de l'hébergeur à compléter]</p>
        </section>
        <section>
          <h2 className="text-2xl">Propriété intellectuelle</h2>
          <p className="mt-3">
            L'ensemble des contenus de ce site (textes, images, logo) est la propriété de{" "}
            {SITE.name}, sauf mention contraire. Toute reproduction sans autorisation est interdite.
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
