// Suppression des données fictives créées le 2026-10-08 pour tester le logiciel de gestion,
// à la demande du gérant. Ne touche qu'aux éléments explicitement marqués « démo » : chaque
// élément est listé dans le journal avant d'être supprimé. Lancement : workflow « Nettoyage démo ».

import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.SUPABASE_URL || "https://zcmiqdjquurpkndvywkz.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const DRY_RUN = process.env.DRY_RUN === "1";
const DEMO = /\[DÉMO\]|\(démo\)|démo|demo/i;

async function list(table, columns) {
  const { data, error } = await db.from(table).select(columns);
  if (error) throw new Error(`${table} : ${error.message}`);
  return data || [];
}

async function removeFiles(prefix) {
  const { data } = await db.storage.from("pms").list(prefix, { limit: 1000 });
  const paths = (data || []).filter((f) => f.id).map((f) => `${prefix}/${f.name}`);
  if (paths.length && !DRY_RUN) await db.storage.from("pms").remove(paths);
  return paths;
}

const properties = (await list("pms_properties", "id,name,photo_url")).filter((p) => DEMO.test(p.name));
const owners = (await list("pms_owners", "id,name,email")).filter(
  (o) => DEMO.test(o.name) || /exemple\.fr$/i.test(o.email || ""),
);
const cleaners = (await list("pms_cleaners", "id,name")).filter((c) => DEMO.test(c.name));
const recos = (await list("pms_recommendations", "id,name,source")).filter((r) => DEMO.test(r.source || ""));

console.log(DRY_RUN ? "SIMULATION (rien n'est supprimé)" : "SUPPRESSION");
console.log("Logements :", properties.map((p) => p.name));
console.log("Propriétaires :", owners.map((o) => `${o.name} <${o.email ?? ""}>`));
console.log("Prestataires :", cleaners.map((c) => c.name));
console.log("Bons plans :", recos.map((r) => r.name));

for (const p of properties) {
  const tasks = await db.from("pms_cleaning_tasks").select("id").eq("property_id", p.id);
  for (const t of tasks.data || []) console.log("Photos ménage :", await removeFiles(`menage/${t.id}`));
  const photo = (p.photo_url || "").match(/logements\/[^?"]+/)?.[0];
  if (photo) {
    console.log("Photo logement :", photo);
    if (!DRY_RUN) await db.storage.from("pms").remove([photo]);
  }
  // Supprimer le logement efface ses réservations, ménages, incidents, messages, demandes, dépenses et avis.
  if (!DRY_RUN) {
    const { error } = await db.from("pms_properties").delete().eq("id", p.id);
    if (error) throw new Error(`Logement ${p.name} : ${error.message}`);
  }
}
for (const [table, rows] of [["pms_owners", owners], ["pms_cleaners", cleaners], ["pms_recommendations", recos]]) {
  if (!rows.length || DRY_RUN) continue;
  const { error } = await db.from(table).delete().in("id", rows.map((r) => r.id));
  if (error) throw new Error(`${table} : ${error.message}`);
}

// Ce qui reste après nettoyage : uniquement les vraies données.
for (const table of ["pms_properties", "pms_owners", "pms_cleaners", "pms_reservations", "pms_cleaning_tasks", "pms_reviews", "pms_incidents", "pms_messages", "pms_message_templates"]) {
  const { count } = await db.from(table).select("id", { count: "exact", head: true });
  console.log(`Reste dans ${table} : ${count}`);
}
