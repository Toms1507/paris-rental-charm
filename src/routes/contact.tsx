import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin } from "lucide-react";
import { LeadForm } from "@/components/site/LeadForm";
import { SITE } from "@/content/site";

const TITLE = "Estimation gratuite de vos revenus locatifs — Spinelle Conciergerie";
const DESCRIPTION =
  "Décrivez votre bien (type, surface, quartier, ville) et recevez sous 24 h une estimation gratuite des revenus possibles en location courte durée à Paris et alentours.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <section className="container-page py-16">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Estimation gratuite de votre bien</h1>
          <p className="mt-5 text-muted-foreground">
            Remplissez le formulaire avec les caractéristiques de votre logement. Nous analysons les
            réservations réelles de votre quartier et vous envoyons une projection de revenus sous
            24 h, sans engagement.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="size-4 text-primary" /> {SITE.email}
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 text-primary" /> Paris et alentours
            </li>
            <li className="flex items-center gap-3">
              <Clock className="size-4 text-primary" /> Réponse sous 24 h, 7j/7
            </li>
          </ul>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
