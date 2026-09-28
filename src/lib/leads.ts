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

// Envoie l'email de notification au propriétaire du site via Resend (https://resend.com).
// Variables d'environnement côté serveur :
//   RESEND_API_KEY      clé API Resend (sans elle, aucun email n'est envoyé)
//   LEAD_NOTIFY_EMAIL   destinataire (par défaut, l'email du site)
//   LEAD_FROM_EMAIL     expéditeur vérifié dans Resend (par défaut, l'adresse de test Resend)
const notifyOwner = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => notification.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      console.warn("RESEND_API_KEY absente : notification email non envoyée.");
      return { sent: false };
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
    return { sent: response.ok };
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
