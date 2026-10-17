import { createFileRoute } from "@tanstack/react-router";

// Désinscription en un clic depuis la messagerie (en-tête List-Unsubscribe-Post, RFC 8058) :
// le lien personnel d'un e-mail de prospection suffit, sans connexion.
async function unsubscribe(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  if (!/^[a-f0-9]{20,64}$/.test(token)) return new Response("Lien invalide", { status: 400 });
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as {
    rpc: (fn: string, args: Record<string, string>) => Promise<{ error: unknown }>;
  };
  const { error } = await db.rpc("prospect_unsubscribe", { p_token: token });
  if (error) return new Response("Erreur", { status: 500 });
  return new Response("Désinscription enregistrée", { status: 200 });
}

export const Route = createFileRoute("/api/desinscription")({
  server: { handlers: { POST: ({ request }) => unsubscribe(request) } },
});
