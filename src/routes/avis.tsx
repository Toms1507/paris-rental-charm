import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { LeadForm } from "@/components/site/LeadForm";
import { REVIEWS } from "@/content/site";

const TITLE = "Avis clients — Spinelle Conciergerie, conciergerie Airbnb à Paris";
const DESCRIPTION =
  "Les retours des propriétaires qui nous confient leur location courte durée à Paris et en proche banlieue : revenus, propreté, réactivité et tranquillité d'esprit.";

export const Route = createFileRoute("/avis")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/avis" },
    ],
    links: [{ rel: "canonical", href: "/avis" }],
  }),
  component: AvisPage,
});

function AvisPage() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">Avis</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Ce que disent les propriétaires</h1>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Retours recueillis auprès de propriétaires accompagnés à Paris et en proche banlieue.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <article key={r.name} className="rounded-xl border border-border p-6">
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm">{r.text}</p>
              <p className="mt-4 text-sm font-semibold">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.place}</p>
            </article>
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
