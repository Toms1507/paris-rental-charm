// Fonctions serveur appelées depuis le navigateur (RPC TanStack Start).
// Celles qui envoient des emails ou utilisent l'IA à la demande sont réservées à l'équipe connectée ;
// celles du livret voyageur et du portail ménage vérifient le jeton auprès de la base.

import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { stayContext } from "./assistant";
import type { CleanerView, StayView } from "./types";
import { REQUEST_TYPES } from "./types";

// Code serveur chargé à la demande : ne part jamais dans le navigateur.
const backend = () => import("./backend.server");

const requireStaff = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const { data } = await db
      .from("pms_staff")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!data) throw new Error("Accès réservé à l'équipe Spinelle");
    return next();
  });

function anonDb(): SupabaseClient {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Base de données non configurée");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Limite simple par jeton et par instance serveur (complète les limites en base).
const hits = new Map<string, number[]>();
function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) return false;
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return true;
}

export const pmsConfig = createServerFn({ method: "GET" }).handler(async () => {
  const c = (await backend()).serverConfig();
  return { ...c, fromEmail: c.fromEmail ? c.fromEmail.replace(/^.*<|>.*$/g, "") : null };
});

export const pmsFetchIcal = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ url: z.string().url().max(2000) }).parse(input))
  .handler(async ({ data }) => ({ text: await (await backend()).fetchIcalServer(data.url) }));

export const pmsSendEmail = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator((input: unknown) =>
    z
      .object({
        to: z.string().email().max(255),
        subject: z.string().min(1).max(300),
        text: z.string().min(1).max(50_000),
        html: z.string().max(500_000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => (await backend()).sendEmailServer(data));

export const pmsGenerateRecos = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator((input: unknown) =>
    z
      .object({
        area: z.string().min(2).max(300),
        count: z.number().int().min(3).max(30).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => (await backend()).generateRecommendations(data.area, data.count));

export const pmsDraftReview = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator((input: unknown) =>
    z
      .object({
        rating: z.number().min(1).max(10),
        comment: z.string().max(5000),
        guest: z.string().max(200),
        property: z.string().max(200),
        signature: z.string().max(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => ({ text: await (await backend()).draftReviewReply(data) }));

const chatInput = z.object({
  token: z.string().min(16).max(128),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1)
    .max(30),
});

/** Assistant du livret voyageur. Renvoie answer = null si l'IA n'est pas disponible. */
export const pmsGuestChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => chatInput.parse(input))
  .handler(async ({ data }) => {
    if (!(await backend()).serverConfig().ai) return { answer: null, reason: "ia" as const };
    if (!rateLimit(`chat:${data.token}`, 40, 3_600_000))
      return { answer: null, reason: "limite" as const };
    const db = anonDb();
    const { data: stay, error } = await db.rpc("pms_get_stay", { p_token: data.token });
    if (error || !stay) return { answer: null, reason: "sejour" as const };
    const answer = await (
      await backend()
    ).guestAssistant(stayContext(stay as StayView), data.history);
    if (answer) {
      const question = data.history.filter((h) => h.role === "user").at(-1)?.content ?? "";
      await db.rpc("pms_guest_log_chat", {
        p_token: data.token,
        p_question: question,
        p_answer: answer,
      });
    }
    return { answer, reason: answer ? null : ("ia" as const) };
  });

/** Prévient l'équipe d'une demande voyageur (départ tardif, problème…). */
export const pmsGuestNotify = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().min(16).max(128),
        type: z.enum([
          "late_checkout",
          "early_checkin",
          "probleme",
          "avis_sejour",
          "question",
          "autre",
        ]),
        details: z.string().max(4000),
        rating: z.number().int().min(1).max(5).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!rateLimit(`notify:${data.token}`, 10, 3_600_000)) return { ok: false };
    const { data: stay } = await anonDb().rpc("pms_get_stay", { p_token: data.token });
    if (!stay) return { ok: false };
    const v = stay as StayView;
    // Un retour de séjour positif n'a pas besoin d'alerte.
    if (data.type === "avis_sejour" && (data.rating ?? 5) >= 4) return { ok: true };
    const urgent =
      data.type === "probleme" || (data.type === "avis_sejour" && (data.rating ?? 5) <= 3);
    await (
      await backend()
    ).alertTeam(
      `${urgent ? "⚠️ " : ""}${REQUEST_TYPES[data.type]} : ${v.property.name}`,
      `${v.reservation.guest_name ?? "Voyageur"} (${v.reservation.check_in} → ${v.reservation.check_out})${data.rating ? `\nNote : ${data.rating}/5` : ""}\n${data.details}\n\nÀ traiter dans le logiciel : /gestion/messages`,
    );
    return { ok: true };
  });

/** Alerte immédiate quand une femme de ménage signale un état orange ou rouge. */
export const pmsCleanerAlert = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(16).max(128), taskId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!rateLimit(`alert:${data.taskId}`, 2, 6 * 3_600_000)) return { ok: false };
    const { data: view } = await anonDb().rpc("pms_get_cleaner", { p_token: data.token });
    const t = (view as CleanerView | null)?.tasks.find((x) => x.task.id === data.taskId);
    if (!t || (t.task.condition !== "rouge" && t.task.condition !== "orange")) return { ok: false };
    const red = t.task.condition === "rouge";
    await (
      await backend()
    ).alertTeam(
      `${red ? "🔴 Gros problème" : "🟠 Petit souci"} au ménage : ${t.property.name}`,
      `Signalé par ${(view as CleanerView).cleaner.name} le ${t.task.date}.\n${t.task.report_notes ?? "(pas de détail)"}\n${t.task.photos.length} photo(s).${t.next ? `\nProchaine arrivée : ${t.next.check_in} (${t.next.guests} voyageurs).` : ""}\n\nDétail : /gestion/incidents`,
    );
    return { ok: true };
  });
