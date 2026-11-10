// Demandes du site (audit / estimation, simulateur, partenaires) : chaque nouvelle demande
// enregistrée dans la table « leads » est envoyée par e-mail à contact@, depuis la boîte IONOS
// (la même que la prospection), sans service payant. La demande est ensuite marquée « notifiée »
// dans son champ message, pour ne jamais être envoyée deux fois.
//
// Variables : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_PASSWORD (+ SMTP_HOST facultatif).
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Variable manquante : ${k}`);
  return v;
};

const EMAIL = "contact@spinelleconciergerie.fr";
const MARK = "[notifié par e-mail le";
// Au premier passage, les demandes des 30 derniers jours sont envoyées (aucune n'avait été transmise).
const SINCE_DAYS = 30;

const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

const since = new Date(Date.now() - SINCE_DAYS * 86_400_000).toISOString();
const { data, error } = await db
  .from("leads")
  .select("*")
  .gte("created_at", since)
  .order("created_at", { ascending: true });
if (error) throw new Error(error.message);
const pending = (data || []).filter((l) => !(l.message || "").includes(MARK));
if (!pending.length) {
  console.log("Aucune nouvelle demande.");
  process.exit(0);
}

const smtp = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ionos.fr",
  port: 465,
  secure: true,
  auth: { user: EMAIL, pass: env("SMTP_PASSWORD") },
});

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const KIND = { formulaire: "Demande d'audit", simulateur: "Simulateur", partenaire: "Partenaire" };

let sent = 0;
for (const l of pending) {
  const source = (l.message || "").match(/^\[(\w+)\]/)?.[1] || "formulaire";
  const details = (l.message || "").replace(/^\[\w+\]\n?/, "").trim();
  const date = new Date(l.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
  const rows = [
    ["Reçue le", date],
    ["Nom", l.full_name],
    ["E-mail", l.email],
    ["Téléphone", l.phone],
    [source === "partenaire" ? "Activité" : "Type de bien", l.property_type],
    ["Chambres", l.bedrooms],
    ["Surface", l.surface],
    ["Quartier / secteur", l.district],
    ["Ville", l.city],
    ["Détails", details],
  ].filter(([, v]) => v);
  // Spam probable (robots qui remplissent les formulaires pour placer un lien) : signalé dans l'objet.
  const spam =
    /https?:\/\/|www\./i.test(`${details} ${l.full_name}`) ||
    /\.(my\.id|ru|xyz|top|click|online|site|icu|buzz)$/i.test(l.email || "");
  const subject = `${spam ? "[Probable spam, ne pas cliquer] " : ""}${KIND[source] || "Demande"} : ${l.full_name}${l.city ? ` (${l.city})` : ""}`;
  const text = `Nouvelle demande reçue sur le site.\n\n${rows.map(([k, v]) => `${k} : ${v}`).join("\n")}\n\nRépondez directement à cet e-mail pour écrire à ${l.full_name}.`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a">
<h2 style="font-size:18px">${escape(subject)}</h2>
<table style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${escape(k)}</td><td style="padding:4px 0;white-space:pre-line">${escape(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="margin-top:16px">Répondez directement à cet e-mail pour écrire à ${escape(l.full_name)}.</p></div>`;
  try {
    await smtp.sendMail({
      from: { name: "Site Spinelle", address: EMAIL },
      to: EMAIL,
      replyTo: l.email,
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error(`Envoi impossible pour une demande du ${date} : ${e.message}`);
    continue;
  }
  const stamp = new Date().toISOString().slice(0, 10);
  await db
    .from("leads")
    .update({ message: `${l.message || ""}\n${MARK} ${stamp}]` })
    .eq("id", l.id);
  sent++;
}
console.log(`Demandes envoyées par e-mail : ${sent} sur ${pending.length}`);
if (sent < pending.length) process.exit(1);
