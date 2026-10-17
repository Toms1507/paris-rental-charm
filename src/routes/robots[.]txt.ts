import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/seo";

// Pages privées (logiciel de gestion, liens personnels) : jamais indexées.
const PRIVATE = [
  "/gestion",
  "/sejour/",
  "/menage/",
  "/livret/",
  "/reponse/",
  "/api/",
  "/desinscription",
];

// Robots des moteurs de recherche et des assistants IA explicitement bienvenus : être cité par
// ChatGPT, Perplexity, Claude, Gemini ou Copilot suppose qu'ils puissent lire le site.
const CRAWLERS = [
  "*",
  "Googlebot",
  "Bingbot",
  "Applebot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "DuckAssistBot",
  "MistralAI-User",
];

const body = () =>
  [
    ...CRAWLERS.flatMap((ua) => [
      `User-agent: ${ua}`,
      "Allow: /",
      ...PRIVATE.map((p) => `Disallow: ${p}`),
      "",
    ]),
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
    `# Présentation pour les assistants IA : ${absoluteUrl("/llms.txt")}`,
    "",
  ].join("\n");

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(body(), {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=86400",
          },
        }),
    },
  },
});
