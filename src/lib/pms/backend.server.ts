// Fonctions exécutées uniquement sur le serveur : emails (Resend), alertes WhatsApp, lecture des
// calendriers iCal et IA (Claude). Les clés restent côté serveur (variables d'environnement Vercel).
//
//   RESEND_API_KEY            envoi des emails (voyageurs, propriétaires, alertes)
//   PMS_FROM_EMAIL            expéditeur, ex. « Spinelle Conciergerie <sejour@spinelleconciergerie.fr> »
//                             (à défaut LEAD_FROM_EMAIL, puis l'adresse de test Resend)
//   PMS_REPLY_TO              adresse de réponse (défaut : contact@spinelleconciergerie.fr)
//   PMS_ALERT_EMAIL           destinataire des alertes (défaut : PMS_REPLY_TO)
//   CALLMEBOT_APIKEY / CALLMEBOT_PHONE   alertes WhatsApp personnelles (déjà utilisées par le site)
//   ANTHROPIC_API_KEY         assistant voyageurs, bons plans du quartier, réponses aux avis

import Anthropic from "@anthropic-ai/sdk";
import { isAllowedIcalUrl } from "./ical";

const DEFAULT_CONTACT = "contact@spinelleconciergerie.fr";

export function serverConfig() {
  return {
    email: Boolean(process.env["RESEND_API_KEY"]),
    whatsappAlerts: Boolean(process.env["CALLMEBOT_APIKEY"]),
    ai: Boolean(process.env["ANTHROPIC_API_KEY"]),
    cron: Boolean(process.env["PMS_CRON_SECRET"]),
    serverAutomation: Boolean(
      process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
      (process.env["PMS_ROBOT_EMAIL"] && process.env["PMS_ROBOT_PASSWORD"]),
    ),
    fromEmail: process.env["PMS_FROM_EMAIL"] ?? process.env["LEAD_FROM_EMAIL"] ?? null,
  };
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Texte brut → HTML simple (liens cliquables, retours à la ligne). */
export function textToHtml(text: string) {
  const body = escapeHtml(text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#213F6C">$1</a>')
    .replace(/\n/g, "<br>");
  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#202020;max-width:600px">${body}</div>`;
}

export async function sendEmailServer(input: {
  to: string;
  subject: string;
  text: string;
  html?: string | undefined;
  replyTo?: string | undefined;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return { ok: false, error: "Email non configuré (RESEND_API_KEY manquante)" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from:
        process.env["PMS_FROM_EMAIL"] ??
        process.env["LEAD_FROM_EMAIL"] ??
        "Spinelle Conciergerie <onboarding@resend.dev>",
      to: [input.to],
      reply_to: input.replyTo ?? process.env["PMS_REPLY_TO"] ?? DEFAULT_CONTACT,
      subject: input.subject,
      text: input.text,
      html: input.html ?? textToHtml(input.text),
    }),
  });
  if (!res.ok)
    return { ok: false, error: `Resend ${res.status} : ${(await res.text()).slice(0, 300)}` };
  return { ok: true };
}

/** Alerte à l'équipe : email + WhatsApp (CallMeBot), chacun indépendamment. */
export async function alertTeam(subject: string, text: string) {
  const to = process.env["PMS_ALERT_EMAIL"] ?? process.env["PMS_REPLY_TO"] ?? DEFAULT_CONTACT;
  const results = await Promise.allSettled([
    sendEmailServer({ to, subject, text }),
    (async () => {
      const key = process.env["CALLMEBOT_APIKEY"];
      if (!key) return { ok: false };
      const phone = process.env["CALLMEBOT_PHONE"] ?? "+33631935166";
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(`*${subject}*\n${text}`.slice(0, 900))}&apikey=${encodeURIComponent(key)}`;
      const r = await fetch(url);
      return { ok: r.ok };
    })(),
  ]);
  return results.map((r) => r.status === "fulfilled" && r.value.ok);
}

export async function fetchIcalServer(url: string): Promise<string> {
  const clean = url.trim().replace(/^webcal:/i, "https:");
  if (!isAllowedIcalUrl(clean)) {
    throw new Error("Adresse de calendrier non reconnue (Airbnb, Booking, Abritel, Google…)");
  }
  const res = await fetch(clean, {
    headers: {
      "User-Agent": "SpinelleGestion/1.0 (+https://spinelleconciergerie.fr)",
      Accept: "text/calendar",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`La plateforme a répondu ${res.status}`);
  const text = await res.text();
  if (!text.includes("BEGIN:VCALENDAR"))
    throw new Error("Ce lien ne renvoie pas un calendrier iCal");
  return text.slice(0, 2_000_000);
}

// ---------------------------------------------------------------- Claude

const MODEL = "claude-opus-5";
const GUEST_MODEL = "claude-haiku-4-5";

function client() {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

function textOf(content: Anthropic.Beta.BetaContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

type CreateParams = Anthropic.Beta.MessageCreateParamsNonStreaming;

/** Appel Claude avec repli automatique côté serveur si la requête est refusée par un filtre. */
async function ask(params: Omit<CreateParams, "model">) {
  const c = client();
  if (!c) return null;
  const body = {
    ...params,
    model: MODEL,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  } as unknown as CreateParams;
  return c.beta.messages.create(body);
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function guestAssistant(context: string, history: ChatTurn[]): Promise<string | null> {
  const system = `Tu es l'assistant virtuel de Spinelle Conciergerie, conciergerie de locations courte durée à Paris. Tu réponds aux voyageurs qui séjournent dans le logement décrit ci-dessous, à toute heure.

Règles :
- Réponds dans la langue du voyageur (français, anglais, espagnol, etc.), de façon chaleureuse, claire et brève (quelques phrases ou une courte liste).
- Appuie-toi uniquement sur les informations du logement et du séjour fournies. N'invente jamais un code, un horaire, un équipement ou une règle. Si l'information manque, dis-le simplement et propose d'utiliser le bouton « Contacter l'équipe » du livret : l'équipe répond rapidement.
- Départ tardif ou arrivée anticipée : indique l'heure possible et le prix prévus, précise que c'est selon disponibilité (souvent un autre voyageur arrive le jour même), et invite à faire la demande avec le bouton correspondant du livret, l'équipe confirme rapidement.
- Problème dans le logement (panne, fuite, propreté, bruit) : excuse-toi, donne la solution si elle figure dans les informations (ex. emplacement du disjoncteur), sinon invite à signaler le problème avec le bouton « Signaler un problème » pour qu'on intervienne vite. En cas d'urgence (incendie, malaise, danger), rappelle le 112 / 15 / 18 / 17.
- Recommandations : propose en priorité les adresses de la liste « Bons plans » ; tu peux compléter avec des lieux parisiens très connus, sans inventer d'adresses ni d'horaires précis.
- Ne parle jamais de paiement hors plateforme, ne demande aucune donnée bancaire, ne promets ni remboursement ni geste commercial : renvoie vers l'équipe.

${context}`;
  // Modèle économique pour l'assistant (questions pratiques, réponses courtes) : choix du
  // propriétaire pour limiter les coûts. Variable PMS_GUEST_AI_MODEL pour en changer.
  const c = client();
  if (!c) return null;
  const res = await c.messages.create({
    model: process.env["PMS_GUEST_AI_MODEL"] ?? GUEST_MODEL,
    max_tokens: 4000,
    system,
    messages: history.slice(-16).map((t) => ({ role: t.role, content: t.content.slice(0, 4000) })),
  });
  if (res.stop_reason === "refusal") return null;
  return (
    res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim() || null
  );
}

export type GeneratedReco = {
  category: string;
  name: string;
  description: string;
  address: string;
  url: string;
  tip: string;
  price_level: string;
  trending: boolean;
  source: string;
};

/** Bons plans du moment autour d'un logement, à partir d'une recherche web (TheFork, Time Out, Le Fooding, presse…). */
export async function generateRecommendations(area: string, count = 15): Promise<GeneratedReco[]> {
  const c = client();
  if (!c) throw new Error("IA non configurée (ANTHROPIC_API_KEY manquante)");
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: "user",
      content: `Recherche sur le web les adresses les plus tendance et les mieux notées en ce moment autour de : ${area} (Paris). Sources à privilégier : TheFork (notes et avis récents), Google Maps, Time Out Paris, Le Fooding, Paris Zigzag, Sortir à Paris, presse récente.

Sélectionne ${count} adresses variées pour des voyageurs en location courte durée : restaurants (différents budgets), cafés/brunchs, bars, une ou deux visites ou balades incontournables du quartier, une expo ou sortie du moment, et un ou deux lieux pratiques (boulangerie réputée, marché). Vérifie que chaque lieu est toujours ouvert.

Réponds uniquement avec un tableau JSON entre les balises <json> et </json>, chaque élément ayant exactement ces champs :
{"category": "restaurant" | "cafe" | "bar" | "visite" | "balade" | "shopping" | "sortie" | "pratique", "name": string, "description": string (1 phrase, en français), "address": string, "url": string (site, page TheFork ou fiche Google ; "" si inconnu), "tip": string (conseil concret : plat signature, réserver, heure idéale… ; "" sinon), "price_level": "€" | "€€" | "€€€" | "", "trending": boolean (true si très en vogue en ce moment), "source": string (site où l'info a été vérifiée)}`,
    },
  ];
  let final = "";
  for (let i = 0; i < 4; i++) {
    const body = {
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          max_uses: 10,
          user_location: {
            type: "approximate",
            city: "Paris",
            country: "FR",
            timezone: "Europe/Paris",
          },
        },
      ],
      messages,
    } as unknown as CreateParams;
    const res = await c.beta.messages.create(body);
    final += textOf(res.content);
    if (res.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: res.content });
      continue;
    }
    if (res.stop_reason === "refusal") throw new Error("La recherche n'a pas abouti");
    break;
  }
  const json = /<json>([\s\S]*?)<\/json>/.exec(final)?.[1] ?? /\[[\s\S]*\]/.exec(final)?.[0];
  if (!json) throw new Error("Réponse inattendue de l'IA");
  const parsed = JSON.parse(json) as GeneratedReco[];
  return parsed.filter((r) => r && typeof r.name === "string").slice(0, 30);
}

export async function draftReviewReply(input: {
  rating: number;
  comment: string;
  guest: string;
  property: string;
  signature: string;
}): Promise<string> {
  const res = await ask({
    max_tokens: 16000,
    output_config: { effort: "low" },
    system:
      "Tu rédiges les réponses publiques d'une conciergerie parisienne aux avis voyageurs (Airbnb, Booking, Abritel). Réponse dans la langue de l'avis, 2 à 5 phrases, chaleureuse et professionnelle, personnalisée (reprends un détail précis de l'avis). Avis positif : remercie et invite à revenir. Avis mitigé ou négatif : remercie, reconnais le point sans se justifier longuement ni accuser le voyageur, explique brièvement ce qui a été corrigé ou sera amélioré. Jamais de données personnelles. Réponds uniquement avec le texte de la réponse.",
    messages: [
      {
        role: "user",
        content: `Logement : ${input.property}\nVoyageur : ${input.guest || "inconnu"}\nNote : ${input.rating}/5\nAvis : ${input.comment || "(sans commentaire)"}\nSignature : ${input.signature}`,
      },
    ],
  });
  if (!res) throw new Error("IA non configurée (ANTHROPIC_API_KEY manquante)");
  return textOf(res.content);
}
