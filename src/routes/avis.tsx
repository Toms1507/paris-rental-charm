import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AirbnbLogo, ReviewCard } from "@/components/site/AirbnbReviews";
import { LeadForm } from "@/components/site/LeadForm";
import { REVIEWS } from "@/content/site";
import { stagger } from "@/lib/reveal";
import { pageHead } from "@/lib/seo";

const TITLE = "Avis voyageurs Airbnb — Spinelle Conciergerie, conciergerie Airbnb à Paris";
const DESCRIPTION =
  "Les avis publics laissés sur Airbnb par les voyageurs accueillis dans nos logements : communication, accueil, emplacement et propreté.";

export const Route = createFileRoute("/avis")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/avis",
      breadcrumb: [{ name: "Avis", path: "/avis" }],
    }),
  component: AvisPage,
});

function AvisPage() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div data-reveal="up" className="container-page [&>*]:max-w-3xl">
          <p className="eyebrow flex items-center gap-2">
            <AirbnbLogo className="h-4" /> Avis vérifiés Airbnb
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Des voyageurs satisfaits</h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex gap-0.5 text-foreground" aria-label="5 étoiles sur 5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </div>
            <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
              Avis publics laissés sur Airbnb par les voyageurs accueillis dans nos logements,
              reproduits à l'identique.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        {/* Colonnes façon mur d'avis : les cartes de hauteurs différentes s'emboîtent sans trou. */}
        <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {REVIEWS.map((r, i) => (
            <div
              key={r.name + r.from}
              data-reveal="up"
              style={stagger(i % 3)}
              className="card-hover mb-6 break-inside-avoid rounded-2xl"
            >
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--sand)] py-20">
        <div className="container-page mx-auto max-w-3xl">
          <LeadForm />
        </div>
      </section>
    </>
  );
}
