import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          `User-agent: *\nAllow: /\nDisallow: /gestion\nDisallow: /sejour/\nDisallow: /menage/\nDisallow: /livret/\nDisallow: /api/\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`,
          {
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "public, max-age=86400",
            },
          },
        ),
    },
  },
});
