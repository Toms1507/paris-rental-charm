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
      "name, zone, notes, status, subject, body, followup_body, angle, first_contact_at, last_contact_at, replied_at, phone, contact_name, website, email, crawled_at, siren, drafted_at",
    )
    .order("id"),
);
const { data: settings } = await db.from("prospect_settings").select("*").eq("id", 1).maybeSingle();

const weekAgo = Date.now() - 7 * 86400000;
const recent = (d) => d && new Date(d).getTime() >= weekAgo;
const category = (p) => (p.notes || "").match(/Catégorie : ([^\n]+)/)?.[1] ?? "agence immobilière";
const score = (p) => Number((p.angle || "").match(/note (\d+(?:[.,]\d+)?)\/10/)?.[1]?.replace(",", "."));
const sent = (p) => Boolean(p.first_contact_at);
// Une désinscription n'est pas une réponse (même si elle arrive par e-mail).
const answered = (p) =>
  p.status !== "desinscrit" && (["repondu", "partenaire", "refus"].includes(p.status) || Boolean(p.replied_at));
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

const ready = rows
  .filter((p) => ["brouillon", "valide"].includes(p.status) && p.body)
  .slice(-10);

// Contacts sans e-mail : avec ou sans site connu, et réseaux les plus fréquents.
const noEmail = rows.filter((p) => p.status === "sans_email");
const brands = new Map();
for (const p of noEmail) {
  const b = (p.notes || "").match(/Réseau : ([^\n]+)/)?.[1] ?? "indépendant";
  brands.set(b, (brands.get(b) || 0) + 1);
}
const noEmailText = [
  `- Avec site connu : ${count(noEmail, (p) => p.website)}, sans site : ${count(noEmail, (p) => !p.website)}, avec téléphone : ${count(noEmail, (p) => p.phone)}, avec SIREN : ${count(noEmail, (p) => p.siren)}`,
  `- Réseaux : ${[...brands].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([b, n]) => `${b} ${n}`).join(", ")}`,
  `- Exemples de sites sans e-mail trouvé : ${noEmail.filter((p) => p.website).slice(0, 15).map((p) => p.website).join(" ")}`,
  `- Réseaux des fiches sans site ni e-mail pas encore analysées : ${(() => {
    const m = new Map();
    for (const p of rows.filter((r) => r.status === "nouveau" && !r.crawled_at && !r.website && !r.email)) {
      const b = (p.notes || "").match(/Réseau : ([^\n]+)/)?.[1] ?? "indépendant";
      m.set(b, (m.get(b) || 0) + 1);
    }
    return [...m].sort((x, y) => y[1] - x[1]).slice(0, 15).map(([b, n]) => `${b} ${n}`).join(", ");
  })()}`,
  `- Fiches « nouveau » pas encore analysées : ${count(rows, (p) => p.status === "nouveau" && !p.crawled_at)}, dont sans site : ${count(rows, (p) => p.status === "nouveau" && !p.crawled_at && !p.website && !p.email)}`,
].join("\n");

// Adresses revenues « non remis » : pour comprendre d'où viennent les erreurs.
const bouncedList = rows
  .filter(bounced)
  .map((p) => `- ${p.name} (${p.zone}) : ${p.email ?? "?"} — site ${p.website ?? "aucun"}${/Site retrouvé/.test(p.notes || "") ? " (site retrouvé)" : ""}${/Nouvelle adresse essayée/.test(p.notes || "") ? " (adresse de remplacement)" : ""}`)
  .join("\n");

// Formulaires : envoyés, en attente, et raisons d'échec.
const formFail = new Map();
for (const p of rows) {
  const m = (p.notes || "").match(/Formulaire non utilisable \(([^)]*)\)/);
  if (m) formFail.set(m[1], (formFail.get(m[1]) || 0) + 1);
}
const formText = [
  `- Contactés par formulaire : ${count(rows, (p) => /Contacté par le formulaire/.test(p.notes || ""))}`,
  `- Formulaires repérés en attente de message ou d'envoi : ${count(rows, (p) => !p.email && /Formulaire de contact :/.test(p.notes || "") && ["nouveau", "brouillon", "valide"].includes(p.status))}`,
  `- Échecs : ${[...formFail].sort((x, y) => y[1] - x[1]).map(([r, n]) => `${r} ${n}`).join(", ") || "aucun"}`,
].join("\n");

// Prochains envois : les messages prêts les plus anciens partent en premier.
const nextUp = rows
  .filter((p) => ["brouillon", "valide"].includes(p.status) && p.email && p.body)
  .sort((a, b) => (a.drafted_at || "").localeCompare(b.drafted_at || ""))
  .slice(0, 70);
const nextCats = new Map();
for (const p of nextUp) nextCats.set(category(p), (nextCats.get(category(p)) || 0) + 1);
const nextText = [
  `Par métier : ${[...nextCats].map(([c, n]) => `${c} ${n}`).join(", ")}`,
  "",
  ...nextUp.map((p, i) => `${i + 1}. ${p.name} — ${p.zone} — ${category(p)} — « ${p.subject} »`),
].join("\n");

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
  "## Prochains envois (dans l'ordre)",
  nextText,
  "",
  "## Formulaires de contact",
  formText,
  "",
  `## Adresses non remises (${count(rows, bounced)})`,
  bouncedList || "Aucune.",
  "",
  `## Sans e-mail (${noEmail.length})`,
  noEmailText,
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
  "## Échantillon de messages prêts à partir",
  ready.map(message).join("\n\n---\n\n") || "Aucun.",
  "",
  "## Échantillon de messages envoyés sans réponse",
  silent.map(message).join("\n\n---\n\n") || "Aucun.",
  "",
].join("\n");

mkdirSync("rapports", { recursive: true });
writeFileSync("rapports/prospection.md", report);
console.log(`Rapport écrit : ${rows.length} fiches, ${replies.length} réponses`);
