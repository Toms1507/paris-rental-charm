import { createFileRoute, Link } from "@tanstack/react-router";
import { POSTS, SITE } from "@/content/site";
import { stagger } from "@/lib/reveal";
import { absoluteUrl, pageHead } from "@/lib/seo";

const TITLE = "Blog — Conseils location courte durée à Paris | Spinelle Conciergerie";
const DESCRIPTION =
  "Rentabilité, réglementation des 120 jours, optimisation d'annonce Airbnb, meilleurs quartiers : nos guides pour les propriétaires qui louent en courte durée à Paris.";

export const Route = createFileRoute("/blog/")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/blog",
      breadcrumb: [{ name: "Blog", path: "/blog" }],
      jsonLd: [
        {
          "@type": "Blog",
          name: `Blog ${SITE.name}`,
          url: absoluteUrl("/blog"),
          inLanguage: "fr-FR",
          publisher: { "@id": `${SITE.url}/#organization` },
          blogPost: POSTS.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.date,
            url: absoluteUrl(`/blog/${p.slug}`),
          })),
        },
      ],
    }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div data-reveal="up" className="container-page [&>*]:max-w-3xl">
          <p className="eyebrow">Blog</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Guides pour louer en courte durée à Paris</h1>
          <p className="mt-5 text-muted-foreground">
            Chiffres du marché, réglementation, optimisation d'annonce&nbsp;: tout ce qu'un
            propriétaire parisien doit savoir avant de se lancer.
          </p>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Le dernier article est mis en avant sur toute la largeur : 1 + 2 × 2, la grille tombe juste. */}
          {POSTS.map((p, i) => (
            <Link
              key={p.slug}
              data-reveal="up"
              style={stagger(i % 2)}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className={`rounded-2xl border border-border p-7 transition-colors hover:border-primary ${
                i === 0 ? "bg-[var(--sand)] md:col-span-2 md:p-10" : ""
              }`}
            >
              <p className="text-xs text-muted-foreground">
                {new Date(p.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {p.readingTime} de lecture
              </p>
              <h2 className={`mt-3 ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl"}`}>{p.title}</h2>
              <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-muted-foreground">
                {p.description}
              </p>
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
