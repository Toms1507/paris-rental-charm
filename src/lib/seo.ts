import heroImage from "@/assets/hero-salon.jpg";
import { SITE } from "@/content/site";

export const absoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

export const DEFAULT_IMAGE = absoluteUrl(heroImage);

type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  /** Fil d'Ariane affiché dans les résultats Google (hors accueil, ajouté automatiquement). */
  breadcrumb?: { name: string; path: string }[];
  jsonLd?: Record<string, unknown>[];
};

export const jsonLdScript = (data: Record<string, unknown>) => ({
  type: "application/ld+json",
  children: JSON.stringify({ "@context": "https://schema.org", ...data }),
});

/** Balises <head> complètes d'une page : title, description, canonique absolue, Open Graph, Twitter et JSON-LD. */
export function pageHead({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  breadcrumb,
  jsonLd = [],
}: PageSeo) {
  const url = absoluteUrl(path);
  const img = absoluteUrl(image);
  const schemas = [...jsonLd];

  if (breadcrumb?.length) {
    schemas.push({
      "@type": "BreadcrumbList",
      itemListElement: [{ name: "Accueil", path: "/" }, ...breadcrumb].map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: absoluteUrl(item.path),
      })),
    });
  }

  return {
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: noindex
          ? "noindex, follow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: img },
      { property: "og:image:alt", content: title },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: img },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "fr-FR", href: url },
    ],
    scripts: schemas.map(jsonLdScript),
  };
}
