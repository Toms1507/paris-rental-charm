import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { LeadForm } from "@/components/site/LeadForm";
import { POSTS } from "@/content/site";

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
    return {
      meta: [
        { title: `${post.title} | Spinelle Conciergerie` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: { "@type": "Organization", name: "Spinelle Conciergerie" },
          }),
        },
      ],
    };
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

  return (
    <>
      <article className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <Link to="/blog" className="text-sm font-semibold text-primary">
            ← Blog
          </Link>
          <p className="mt-6 text-xs text-muted-foreground">
            {new Date(post.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
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
        </div>
      </article>

      <section className="bg-[var(--sand)] py-16">
        <div className="container-page mx-auto max-w-3xl">
          <LeadForm />
        </div>
      </section>
    </>
  );
}
