import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/content/site";

export type LeadInput = {
  full_name: string;
  email: string;
  phone: string;
  property_type?: string | undefined;
  bedrooms?: string | undefined;
  surface?: string | undefined;
  district?: string | undefined;
  city?: string | undefined;
  message?: string | undefined;
  /** D'où vient la demande : formulaire d'estimation ou simulateur de revenus. */
  source: "formulaire" | "simulateur";
};

const notification = z.object({
  full_name: z.string().max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30),
  property_type: z.string().max(60).optional(),
  bedrooms: z.string().max(30).optional(),
  surface: z.string().max(30).optional(),
  district: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  message: z.string().max(3000).optional(),
  source: z.enum(["formulaire", "simulateur"]),
});

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

type Notification = z.infer<typeof notification>;

// Email de notification au propriétaire du site via Resend (https://resend.com).
//   RESEND_API_KEY      clé API Resend (sans elle, aucun email n'est envoyé)
//   LEAD_NOTIFY_EMAIL   destinataire (par défaut, l'email du site)
//   LEAD_FROM_EMAIL     expéditeur vérifié dans Resend (par défaut, l'adresse de test Resend)
async function sendEmail(data: Notification) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.warn("RESEND_API_KEY absente : notification email non envoyée.");
    return false;
  }
  const rows: [string, string | undefined][] = [
    ["Nom", data.full_name],
    ["Email", data.email],
    ["Téléphone", data.phone],
    ["Type de bien", data.property_type],
    ["Chambres", data.bedrooms],
    ["Surface", data.surface],
    ["Quartier / secteur", data.district],
    ["Ville", data.city],
    ["Détails", data.message],
  ];
  const html = `
    <h2 style="font-family:sans-serif">Nouvelle demande (${data.source})</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${rows
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${k}</td><td style="padding:4px 0;white-space:pre-line">${escape(v!)}</td></tr>`,
        )
        .join("")}
    </table>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env["LEAD_FROM_EMAIL"] ?? `${SITE.name} <onboarding@resend.dev>`,
      to: [process.env["LEAD_NOTIFY_EMAIL"] ?? SITE.email],
      reply_to: data.email,
      subject: `${data.source === "simulateur" ? "Simulateur" : "Demande d'estimation"} : ${data.full_name}${data.city ? ` (${data.city})` : ""}`,
      html,
    }),
  });
  if (!response.ok) console.error("Échec de l'envoi Resend", await response.text());
  return response.ok;
}

// Alerte WhatsApp au propriétaire via CallMeBot (https://www.callmebot.com), usage personnel.
//   CALLMEBOT_APIKEY   clé reçue par WhatsApp après activation (sans elle, pas d'alerte)
//   CALLMEBOT_PHONE    numéro WhatsApp à prévenir (par défaut, celui du site)
// Le message reste court : le détail complet de la demande arrive par email.
async function sendWhatsApp(data: Notification) {
  const apiKey = process.env["CALLMEBOT_APIKEY"];
  if (!apiKey) {
    console.warn("CALLMEBOT_APIKEY absente : alerte WhatsApp non envoyée.");
    return false;
  }
  const phone = process.env["CALLMEBOT_PHONE"] ?? SITE.phone.replace(/ /g, "");
  const lines = [
    "*Nouvelle demande d'audit - Spinelle*",
    `${data.full_name}${data.city ? ` - ${data.city}` : ""}`,
    [data.property_type, data.district].filter(Boolean).join(", "),
    `Tel : ${data.phone}`,
    `Détails envoyés sur ${SITE.email}`,
  ].filter(Boolean);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(lines.join("\n"))}&apikey=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) console.error("Échec de l'alerte WhatsApp", await response.text());
  return response.ok;
}

// Alerte WhatsApp via l'API officielle WhatsApp Business de Meta (Cloud API), recommandée.
// Un message à l'initiative de l'entreprise doit utiliser un modèle approuvé par Meta :
// modèle « nouvelle_demande » (catégorie Utilitaire, français), corps avec 4 variables :
//   Nouvelle demande d'audit Spinelle : {{1}} ({{2}}). Bien : {{3}}. Téléphone : {{4}}.
//   WHATSAPP_TOKEN            jeton d'accès permanent (utilisateur système Meta Business)
//   WHATSAPP_PHONE_NUMBER_ID  identifiant du numéro expéditeur (tableau de bord Meta)
//   WHATSAPP_TO               numéro à prévenir, format international sans + (défaut : celui du site)
//   WHATSAPP_TEMPLATE         nom du modèle (défaut : nouvelle_demande)
async function sendWhatsAppCloud(data: Notification) {
  const token = process.env["WHATSAPP_TOKEN"];
  const phoneNumberId = process.env["WHATSAPP_PHONE_NUMBER_ID"];
  if (!token || !phoneNumberId) return null;
  const to = process.env["WHATSAPP_TO"] ?? SITE.phone.replace(/\D/g, "");
  const param = (text: string | undefined) => ({
    type: "text",
    // Meta refuse les variables vides ou contenant des retours à la ligne.
    text: (text || "non précisé").replace(/\s+/g, " ").slice(0, 200),
  });
  const response = await fetch(
    `https://graph.facebook.com/${process.env["WHATSAPP_API_VERSION"] ?? "v23.0"}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: process.env["WHATSAPP_TEMPLATE"] ?? "nouvelle_demande",
          language: { code: "fr" },
          components: [
            {
              type: "body",
              parameters: [
                param(data.full_name),
                param(data.city),
                param([data.property_type, data.district].filter(Boolean).join(", ")),
                param(data.phone),
              ],
            },
          ],
        },
      }),
    },
  );
  if (!response.ok) console.error("Échec de l'alerte WhatsApp (Meta)", await response.text());
  return response.ok;
}

// Prévient le propriétaire par email et par WhatsApp. Les deux canaux sont indépendants :
// si l'un n'est pas configuré ou échoue, l'autre part quand même.
const notifyOwner = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => notification.parse(input))
  .handler(async ({ data }) => {
    // WhatsApp : API officielle de Meta si elle est configurée, sinon CallMeBot en secours.
    const whatsappAlert = async () => (await sendWhatsAppCloud(data)) ?? sendWhatsApp(data);
    const [email, whatsapp] = await Promise.allSettled([sendEmail(data), whatsappAlert()]);
    return {
      email: email.status === "fulfilled" && email.value,
      whatsapp: whatsapp.status === "fulfilled" && whatsapp.value,
    };
  });

/** Enregistre la demande dans la base, puis prévient le propriétaire par email. */
export async function submitLead(lead: LeadInput) {
  const { error } = await supabase.from("leads").insert({
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    property_type: lead.property_type ?? null,
    bedrooms: lead.bedrooms ?? null,
    surface: lead.surface ?? null,
    district: lead.district ?? null,
    city: lead.city ?? null,
    message: `[${lead.source}]${lead.message ? `\n${lead.message}` : ""}`,
  });
  if (error) return { ok: false as const };
  // L'email ne doit jamais bloquer la demande : elle est déjà enregistrée en base.
  try {
    const clean = Object.fromEntries(
      Object.entries(lead).filter(([, v]) => v !== undefined && v !== ""),
    );
    await notifyOwner({ data: clean });
  } catch (e) {
    console.error(e);
  }
  return { ok: true as const };
}
