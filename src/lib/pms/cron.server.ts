// Automatisations côté serveur, lancées par la tâche planifiée (voir .github/workflows/gestion-automatisations.yml).
// Accès à la base : clé de service Supabase si elle est fournie (SUPABASE_SERVICE_ROLE_KEY), sinon
// connexion avec un compte d'équipe dédié (PMS_ROBOT_EMAIL / PMS_ROBOT_PASSWORD).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { runAutomations } from "./engine";
import { createSupabaseStore } from "./store";
import { fetchIcalServer, sendEmailServer } from "./backend.server";

async function serverClient(): Promise<SupabaseClient> {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  if (!url) throw new Error("SUPABASE_URL manquante");
  const service = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (service)
    return createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  const email = process.env["PMS_ROBOT_EMAIL"];
  const password = process.env["PMS_ROBOT_PASSWORD"];
  if (!key || !email || !password) {
    throw new Error(
      "Accès serveur non configuré : SUPABASE_SERVICE_ROLE_KEY, ou PMS_ROBOT_EMAIL + PMS_ROBOT_PASSWORD",
    );
  }
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Connexion du compte robot : ${error.message}`);
  return client;
}

/** Jours de conservation des photos d'un ménage « tout est en ordre » (formule gratuite : 1 Go). */
const KEEP_GREEN_PHOTOS_DAYS = 60;

/**
 * Libère l'espace de stockage : supprime les photos des ménages verts anciens. Les photos des
 * ménages orange ou rouge (preuves en cas de litige) sont conservées.
 */
async function purgeOldPhotos(db: SupabaseClient) {
  const limit = new Date(Date.now() - KEEP_GREEN_PHOTOS_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const { data } = await db
    .from("pms_cleaning_tasks")
    .select("id, photos")
    .eq("condition", "vert")
    .lt("date", limit)
    .neq("photos", "[]")
    .limit(200);
  let removed = 0;
  for (const t of (data ?? []) as { id: string; photos: string[] }[]) {
    const paths = t.photos
      .filter((p) => p.startsWith("storage:"))
      .map((p) => p.slice("storage:".length));
    if (paths.length) await db.storage.from("pms").remove(paths);
    await db.from("pms_cleaning_tasks").update({ photos: [] }).eq("id", t.id);
    removed += paths.length;
  }
  return removed;
}

export async function runServerAutomations(origin: string) {
  const db = await serverClient();
  const store = createSupabaseStore(db);
  const photosPurged = await purgeOldPhotos(db).catch(() => 0);
  const summary = await runAutomations({
    store,
    origin,
    fetchIcal: fetchIcalServer,
    sender: { email: (to, subject, text, html) => sendEmailServer({ to, subject, text, html }) },
  });
  return { ...summary, photosPurged };
}

/** Lecture publique d'un calendrier exporté ou d'un planning ménage (fonctions SQL par jeton). */
export function anonClient(): SupabaseClient {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Base de données non configurée");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
