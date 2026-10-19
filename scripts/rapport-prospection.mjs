// Rapport hebdomadaire de la prospection (lancé par .github/workflows/rapport-prospection.yml le
// dimanche). Lit la base en lecture seule et écrit rapports/prospection.md, que la routine
// « Directeur commercial Spinelle » lit pour analyser la semaine sans avoir besoin des clés.
import { mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function selectAll(build) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build().range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < 1000) return rows;
  }
}

const rows = await selectAll(() =>
  db
    .from("prospects")
    .select(
      "name, zone, notes, status, subject, body, followup_body, angle, first_contact_at, last_contact_at, replied_at, phone, contact_name",
    )
    .order("id"),
);
const { data: settings } = await db.from("prospect_settings").select("*").eq("id", 1).maybeSingle();

const weekAgo = Date.now() - 7 * 86400000;
const recent = (d) => d && new Date(d).getTime() >= weekAgo;
const category = (p) => (p.notes || "").match(/Catégorie : ([^\n]+)/)?.[1] ?? "agence immobilière";
const score = (p) => Number((p.angle || "").match(/note (\d+(?:[.,]\d+)?)\/10/)?.[1]?.replace(",", "."));
const sent = (p) => Boolean(p.first_contact_at);
const answered = (p) => ["repondu", "partenaire", "refus"].includes(p.status) || Boolean(p.replied_at);
const bounced = (p) => /non remis/i.test(p.notes || "");
const pct = (a, b) => (b ? `${Math.round((a / b) * 1000) / 10} %` : "–");
const count = (list, f) => list.filter(f).length;

function stats(list, since) {
  const inPeriod = (d) => (since ? recent(d) : Boolean(d));
  const s = list.filter((p) => inPeriod(p.first_contact_at));
  const scores = s.map(score).filter((n) => !Number.isNaN(n));
  return [
    `- Premiers messages envoyés : ${s.length}`,
    `- Relances envoyées : ${count(list, (p) => p.status !== "contacte" && p.followup_body && sent(p) && p.last_contact_at !== p.first_contact_at && inPeriod(p.last_contact_at))}`,
    `- Réponses : ${count(list, (p) => answered(p) && inPeriod(p.replied_at || p.last_contact_at))}`,
    `- Partenaires : ${count(s, (p) => p.status === "partenaire")}, refus : ${count(s, (p) => p.status === "refus")}, désinscriptions : ${count(s, (p) => p.status === "desinscrit")}`,
    `- Adresses non remises : ${count(s, bounced)} (${pct(count(s, bounced), s.length)})`,
    `- Désinscriptions : ${pct(count(s, (p) => p.status === "desinscrit"), s.length)}`,
    `- Note moyenne des messages envoyés : ${scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "–"}/10`,
  ].join("\n");
}

function table(key) {
  const groups = new Map();
  for (const p of rows) {
    const k = key(p);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  }
  const lines = ["| | Envoyés | Réponses | Taux | Restants (nouveau) | Prêts | Erreurs |", "|---|---|---|---|---|---|---|"];
  for (const [k, list] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
    const s = list.filter(sent);
    const r = count(s, answered);
    lines.push(
      `| ${k} | ${s.length} | ${r} | ${pct(r, s.length)} | ${count(list, (p) => p.status === "nouveau")} | ${count(list, (p) => ["brouillon", "valide"].includes(p.status))} | ${count(list, (p) => p.status === "erreur")} |`,
    );
  }
  return lines.join("\n");
}

const message = (p) =>
  [
    `### ${p.name} (${p.zone}, ${category(p)}) — ${p.status}${p.contact_name ? `, ${p.contact_name}` : ""}${p.phone ? `, tél. ${p.phone}` : ""}`,
    `Envoyé le ${p.first_contact_at?.slice(0, 10)} — ${p.angle || ""}`,
    `**Objet :** ${p.subject || ""}`,
    "",
    (p.body || "").trim(),
    "",
    "**Notes (réponses, erreurs) :**",
    "",
    (p.notes || "").trim(),
  ].join("\n");

const replies = rows.filter((p) => sent(p) && answered(p)).sort((a, b) => (b.replied_at || "").localeCompare(a.replied_at || ""));
const silent = rows
  .filter((p) => sent(p) && !answered(p) && !bounced(p) && p.status !== "desinscrit")
  .sort((a, b) => b.first_contact_at.localeCompare(a.first_contact_at))
  .slice(0, 10);

// Cas « À vérifier » : regroupés par la dernière ligne des notes (la cause).
const errors = new Map();
for (const p of rows.filter((r) => r.status === "erreur")) {
  const cause = (p.notes || "").trim().split("\n").pop().replace(/: .*/, "").slice(0, 80);
  errors.set(cause, (errors.get(cause) || 0) + 1);
}

const report = [
  `# Rapport de prospection — ${new Date().toISOString().slice(0, 10)}`,
  "",
  "Généré automatiquement par scripts/rapport-prospection.mjs (lecture seule de la base).",
  "",
  "## Réglages",
  `- Mode : ${settings?.mode}, en pause : ${settings?.paused ? "oui" : "non"}, nouveaux contacts par jour : ${settings?.daily_limit}`,
  `- Dernier passage : ${settings?.last_run_at ?? "–"}`,
  "",
  "```",
  (settings?.last_run_summary || "").trim(),
  "```",
  "",
  "## 7 derniers jours",
  stats(rows, true),
  "",
  "## Depuis le début",
  stats(rows, false),
  `- Fiches au total : ${rows.length}, sans e-mail : ${count(rows, (p) => p.status === "sans_email")}`,
  "",
  `## À vérifier (${count(rows, (p) => p.status === "erreur")})`,
  [...errors].sort((a, b) => b[1] - a[1]).map(([c, n]) => `- ${c} : ${n}`).join("\n") || "Aucun.",
  "",
  "## Par zone",
  table((p) => p.zone),
  "",
  "## Par catégorie",
  table(category),
  "",
  `## Messages qui ont obtenu une réponse (${replies.length})`,
  replies.slice(0, 30).map(message).join("\n\n---\n\n") || "Aucune pour l'instant.",
  "",
  "## Échantillon de messages envoyés sans réponse",
  silent.map(message).join("\n\n---\n\n") || "Aucun.",
  "",
].join("\n");

mkdirSync("rapports", { recursive: true });
writeFileSync("rapports/prospection.md", report);
console.log(`Rapport écrit : ${rows.length} fiches, ${replies.length} réponses`);
