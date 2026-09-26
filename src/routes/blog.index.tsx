import { createFileRoute, Link } from "@tanstack/react-router";
import { POSTS } from "@/content/site";

const TITLE = "Blog — Conseils location courte durée à Paris | Spinelle Conciergerie";
const DESCRIPTION =
  "Rentabilité, réglementation des 120 jours, optimisation d'annonce Airbnb, meilleurs quartiers : nos guides pour les propriétaires qui louent en courte durée à Paris.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">Blog</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            Guides pour louer en courte durée à Paris
          </h1>
          <p className="mt-5 text-muted-foreground">
            Chiffres du marché, réglementation, optimisation d'annonce : tout ce qu'un propriétaire
            parisien doit savoir avant de se lancer.
          </p>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {POSTS.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="rounded-xl border border-border p-7 transition-colors hover:border-primary"
            >
              <p className="text-xs text-muted-foreground">
                {new Date(p.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {p.readingTime} de lecture
              </p>
              <h2 className="mt-3 text-xl">{p.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-primary">
                Lire l'article →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
