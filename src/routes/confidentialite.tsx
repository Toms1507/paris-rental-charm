import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/content/site";
import { openCookieSettings } from "@/lib/analytics";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/confidentialite")({
  head: () =>
    pageHead({
      title: `Politique de confidentialité et cookies | ${SITE.name}`,
      description: `Comment ${SITE.name} collecte, utilise et protège vos données personnelles, et quels cookies sont utilisés sur le site.`,
      path: "/confidentialite",
      breadcrumb: [{ name: "Confidentialité", path: "/confidentialite" }],
    }),
  component: Confidentialite,
});

function Confidentialite() {
  return (
    <article className="container-page py-16">
      <div className="mx-auto max-w-3xl space-y-8 text-[0.98rem] leading-relaxed">
        <h1 className="text-4xl">Politique de confidentialité et cookies</h1>
        <section>
          <h2 className="text-2xl">Données collectées</h2>
          <p className="mt-3">
            Lorsque vous demandez une estimation, nous collectons votre nom, email, téléphone et les
            caractéristiques de votre bien (type, surface, quartier, ville, précisions). Ces
            informations servent uniquement à vous répondre et à vous proposer nos services. Elles
            ne sont jamais vendues ni transmises à des tiers à des fins commerciales.
          </p>
          <p className="mt-3">
            Pour traiter votre demande, nous faisons appel à des prestataires techniques qui
            n'utilisent pas vos données pour leur propre compte&nbsp;: Supabase (stockage des
            demandes), Vercel (hébergement du site), Resend (envoi de la notification par email) et
            Meta (WhatsApp) pour l&apos;alerte envoyée à notre équipe.
          </p>
        </section>
        <section>
          <h2 className="text-2xl">Durée de conservation</h2>
          <p className="mt-3">
            Les demandes sans suite sont conservées au maximum 3&nbsp;ans après le dernier contact,
            puis supprimées.
          </p>
        </section>
        <section>
          <h2 className="text-2xl">Vos droits</h2>
          <p className="mt-3">
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement,
            d'opposition et de portabilité. Écrivez-nous à {SITE.email}. Vous pouvez aussi adresser
            une réclamation à la CNIL (cnil.fr).
          </p>
        </section>
        <section>
          <h2 className="text-2xl">Cookies</h2>
          <p className="mt-3">
            Avec votre accord, nous utilisons des cookies de mesure d'audience (Google Analytics) et
            de mesure publicitaire (Google Ads) afin de savoir quelles annonces et quelles pages
            vous ont amené jusqu'à nous. Sans votre accord, aucun de ces cookies n'est déposé.
          </p>
          <button type="button" onClick={openCookieSettings} className="btn-outline mt-5">
            Modifier mes choix de cookies
          </button>
        </section>
      </div>
    </article>
  );
}
