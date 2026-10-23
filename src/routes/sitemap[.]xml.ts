import { createFileRoute } from "@tanstack/react-router";
import { ARRONDISSEMENTS } from "@/content/arrondissements";
import { CITIES, POSTS } from "@/content/site";
import { MARKET_PARIS } from "@/content/market-paris";
import { absoluteUrl } from "@/lib/seo";

// Dernière révision des contenus fixes (titres, textes, mentions légales) : à mettre à jour
// lors d'une modification de ces pages. Les pages qui affichent les données du marché prennent
// la date du dernier relevé, actualisée automatiquement chaque semaine.
const CONTENT_UPDATED = "2026-10-23";
const latest = (...dates: (string | undefined)[]) =>
  dates
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);
const DATA_PAGES = new Set(["/", "/faq", "/blog"]);

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "monthly" },
  { path: "/tarifs", priority: "0.9", changefreq: "monthly" },
  { path: "/contact", priority: "0.9", changefreq: "monthly" },
  { path: "/zones", priority: "0.8", changefreq: "monthly" },
  { path: "/avis", priority: "0.7", changefreq: "monthly" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
  { path: "/partenaires", priority: "0.6", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/mentions-legales", priority: "0.2", changefreq: "yearly" },
  { path: "/confidentialite", priority: "0.2", changefreq: "yearly" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const lastPost = POSTS.map((p) => p.date)
          .sort()
          .at(-1);
        const urls = [
          ...STATIC_PAGES.map((p) => ({
            ...p,
            lastmod: DATA_PAGES.has(p.path)
              ? latest(
                  CONTENT_UPDATED,
                  MARKET_PARIS.snapshot,
                  p.path === "/blog" ? lastPost : undefined,
                )
              : CONTENT_UPDATED,
          })),
          ...CITIES.map((c) => ({
            path: `/conciergerie-airbnb/${c.slug}`,
            priority: "0.8",
            changefreq: "monthly",
            lastmod: CONTENT_UPDATED,
          })),
          // Pages d'arrondissement : chiffres du marché, mis à jour avec les données.
          ...ARRONDISSEMENTS.map((a) => ({
            path: `/conciergerie-paris/${a.slug}`,
            priority: "0.8",
            changefreq: "weekly",
            lastmod: latest(CONTENT_UPDATED, MARKET_PARIS.snapshot),
          })),
          ...POSTS.map((p) => ({
            path: `/blog/${p.slug}`,
            priority: "0.7",
            changefreq: "yearly",
            lastmod: p.date,
          })),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${absoluteUrl(u.path)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
