import { createFileRoute } from "@tanstack/react-router";

// Tâche planifiée : synchronise les calendriers, planifie les ménages, envoie les messages voyageurs
// et, le 1er du mois, les rapports propriétaires. Protégée par le secret PMS_CRON_SECRET.
async function handle(request: Request) {
  const secret = process.env["PMS_CRON_SECRET"];
  if (!secret) return new Response("PMS_CRON_SECRET non configuré", { status: 503 });
  const auth = request.headers.get("authorization") ?? "";
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const digest = (v: string) => createHash("sha256").update(v, "utf8").digest();
  if (!timingSafeEqual(digest(auth), digest(`Bearer ${secret}`))) {
    return new Response("Non autorisé", { status: 401 });
  }
  try {
    const { runServerAutomations } = await import("@/lib/pms/cron.server");
    const summary = await runServerAutomations(new URL(request.url).origin);
    return Response.json({ ok: true, summary });
  } catch (e) {
    console.error(e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export const Route = createFileRoute("/api/pms/cron")({
  server: {
    handlers: { POST: ({ request }) => handle(request), GET: ({ request }) => handle(request) },
  },
});
