import { createFileRoute } from "@tanstack/react-router";
import { CITIES, POSTS } from "@/content/site";
import { absoluteUrl } from "@/lib/seo";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "monthly" },
  { path: "/tarifs", priority: "0.9", changefreq: "monthly" },
  { path: "/contact", priority: "0.9", changefreq: "monthly" },
  { path: "/zones", priority: "0.8", changefreq: "monthly" },
  { path: "/avis", priority: "0.7", changefreq: "monthly" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
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
            lastmod: p.path === "/blog" ? lastPost : undefined,
          })),
          ...CITIES.map((c) => ({
            path: `/conciergerie-airbnb/${c.slug}`,
            priority: "0.8",
            changefreq: "monthly",
            lastmod: undefined,
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
