import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { LeadForm } from "@/components/site/LeadForm";
import { CITIES, POSTS, SITE } from "@/content/site";
import { absoluteUrl, DEFAULT_IMAGE, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article introuvable" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const path = `/blog/${params.slug}`;
    return pageHead({
      title: `${post.title} | ${SITE.name}`,
      description: post.description,
      path,
      type: "article",
      breadcrumb: [
        { name: "Blog", path: "/blog" },
        { name: post.title, path },
      ],
      jsonLd: [
        {
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          image: DEFAULT_IMAGE,
          datePublished: post.date,
          dateModified: post.date,
          inLanguage: "fr-FR",
          mainEntityOfPage: absoluteUrl(path),
          author: { "@type": "Organization", name: SITE.name, url: SITE.url },
          publisher: { "@id": `${SITE.url}/#organization` },
          articleSection: "Location courte durée",
        },
      ],
    });
  },
  notFoundComponent: PostNotFound,
  errorComponent: PostNotFound,
  component: BlogPost,
});

function PostNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl">Article introuvable</h1>
      <Link to="/blog" className="btn-primary mt-6">
        Retour au blog
      </Link>
    </div>
  );
}

function BlogPost() {
  const { post } = Route.useLoaderData();
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Accueil
            </Link>{" "}
            /{" "}
            <Link to="/blog" className="hover:text-primary">
              Blog
            </Link>
          </nav>
          <p className="mt-6 text-xs text-muted-foreground">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>{" "}
            · {post.readingTime} de lecture
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl">{post.title}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{post.description}</p>

          {post.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="text-2xl">{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p} className="mt-4 text-[0.98rem] leading-relaxed">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-[0.98rem]">
                      <span className="text-primary">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <aside className="mt-14 rounded-xl border border-border bg-[var(--sand)] p-6">
            <p className="font-semibold">Vous avez un bien à Paris ou en proche banlieue ?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Découvrez notre conciergerie près de chez vous&nbsp;:
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {CITIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/conciergerie-airbnb/$ville"
                    params={{ ville: c.slug }}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </article>

      <section className="container-page pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl">À lire aussi</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="rounded-xl border border-border p-5 text-sm transition-colors hover:border-primary"
              >
                <span className="font-semibold">{p.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--sand)] py-16">
        <div className="container-page mx-auto max-w-3xl">
          <LeadForm />
        </div>
      </section>
    </>
  );
}
