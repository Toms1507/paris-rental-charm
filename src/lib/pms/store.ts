// Accès aux données : base Supabase (mode « cloud ») ou navigateur (mode « démo », tant que la
// migration n'a pas été appliquée). Les deux modes exposent exactement la même interface.

import type { SupabaseClient } from "@supabase/supabase-js";
import { withDefaults } from "./defaults";
import type {
  CleanerView,
  CleaningTask,
  GuestRequestType,
  StayView,
  TableName,
  Tables,
} from "./types";
import { TABLES } from "./types";
import { addDays, todayParis } from "./dates";

export type Mode = "demo" | "cloud";
export type AllData = { [T in TableName]: Tables[T][] };

export interface Store {
  mode: Mode;
  list<T extends TableName>(table: T): Promise<Tables[T][]>;
  insert<T extends TableName>(table: T, rows: Partial<Tables[T]>[]): Promise<Tables[T][]>;
  update<T extends TableName>(table: T, id: string, patch: Partial<Tables[T]>): Promise<void>;
  remove(table: TableName, id: string): Promise<void>;
  upload(path: string, file: Blob): Promise<string>;
}

export async function loadAll(store: Store): Promise<AllData> {
  const entries = await Promise.all(TABLES.map(async (t) => [t, await store.list(t)] as const));
  return Object.fromEntries(entries) as AllData;
}

// ---------------------------------------------------------------- Supabase

/** Validité des liens signés vers les fichiers privés (10 ans). */
const SIGNED_URL_SECONDS = 10 * 365 * 24 * 3600;
/** Préfixe des fichiers privés enregistrés par chemin (photos déposées par les prestataires). */
export const STORAGE_PREFIX = "storage:";

const signedCache = new Map<string, Promise<string | null>>();

/** Lien affichable d'un fichier : tel quel, ou lien signé pour un chemin « storage:… » (équipe connectée). */
export function resolveStoredFile(
  client: SupabaseClient<never> | SupabaseClient,
  src: string,
): Promise<string | null> {
  if (!src.startsWith(STORAGE_PREFIX)) return Promise.resolve(src);
  const path = src.slice(STORAGE_PREFIX.length);
  let p = signedCache.get(path);
  if (!p) {
    p = (client as unknown as Untyped).storage
      .from("pms")
      .createSignedUrl(path, 24 * 3600)
      .then((r) => r.data?.signedUrl ?? null);
    signedCache.set(path, p);
  }
  return p;
}

// Les tables pms_* ne figurent pas dans les types générés de Supabase : client non typé.
type Untyped = SupabaseClient;

export function createSupabaseStore(client: SupabaseClient<never> | SupabaseClient): Store {
  const db = client as unknown as Untyped;
  const fail = (table: string, error: { message: string } | null) => {
    if (error) throw new Error(`${table} : ${error.message}`);
  };
  return {
    mode: "cloud",
    async list(table) {
      const out: Tables[typeof table][] = [];
      // Pagination : Supabase renvoie au plus 1 000 lignes par requête.
      for (let from = 0; ; from += 1000) {
        let query = db.from(table).select("*");
        if (table !== "pms_settings") query = query.order("created_at", { ascending: true });
        const { data, error } = await query.range(from, from + 999);
        fail(table, error);
        out.push(...((data ?? []) as never[]));
        if ((data ?? []).length < 1000) break;
      }
      return out as never;
    },
    async insert(table, rows) {
      if (!rows.length) return [];
      const full = rows.map((r) => withDefaults(table, r));
      const { error } = await db.from(table).insert(full as never);
      fail(table, error);
      return full;
    },
    async update(table, id, patch) {
      const { error } = await db
        .from(table)
        .update(patch as never)
        .eq("id", id);
      fail(table, error);
    },
    async remove(table, id) {
      const { error } = await db.from(table).delete().eq("id", id);
      fail(table, error);
    },
    async upload(path, file) {
      const { error } = await db.storage.from("pms").upload(path, file, { upsert: true });
      if (error) throw new Error(`Envoi du fichier : ${error.message}`);
      // Espace de stockage privé : lien signé de longue durée (affichable dans le livret et les emails).
      const signed = await db.storage.from("pms").createSignedUrl(path, SIGNED_URL_SECONDS);
      return signed.data?.signedUrl ?? db.storage.from("pms").getPublicUrl(path).data.publicUrl;
    },
  };
}

// ---------------------------------------------------------------- navigateur (démo)

const KEY = "spinelle-gestion-demo-v1";

function readLocal(): AllData | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AllData) : null;
  } catch {
    return null;
  }
}

function writeLocal(data: AllData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    throw new Error(
      "Espace du navigateur plein (mode démo) : supprimez quelques photos ou connectez la base de données.",
    );
  }
}

export function resetDemo() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* rien */
  }
}

const empty = (): AllData => Object.fromEntries(TABLES.map((t) => [t, []])) as unknown as AllData;

export function createLocalStore(seed: () => AllData): Store {
  const get = (): AllData => {
    const d = readLocal();
    if (d) {
      for (const t of TABLES) if (!d[t]) (d as Record<string, unknown[]>)[t] = [];
      return d;
    }
    const s = seed();
    writeLocal(s);
    return s;
  };
  return {
    mode: "demo",
    async list(table) {
      return get()[table];
    },
    async insert(table, rows) {
      const d = get();
      const full = rows.map((r) => withDefaults(table, r));
      (d[table] as unknown[]).push(...full);
      writeLocal(d);
      return full;
    },
    async update(table, id, patch) {
      const d = get();
      const list = d[table] as { id: string }[];
      const i = list.findIndex((r) => r.id === id);
      const cur = list[i];
      if (cur) list[i] = { ...cur, ...patch, id: cur.id };
      writeLocal(d);
    },
    async remove(table, id) {
      const d = get();
      (d as Record<string, { id: string }[]>)[table] = (d[table] as { id: string }[]).filter(
        (r) => r.id !== id,
      );
      writeLocal(d);
    },
    async upload(_path, file) {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
        reader.readAsDataURL(file);
      });
    },
  };
}

export const emptyData = empty;

// ---------------------------------------------------------------- accès publics (voyageur, ménage)

export interface PublicApi {
  mode: Mode;
  getStay(token: string): Promise<StayView | null>;
  guestRequest(
    token: string,
    type: GuestRequestType,
    details: string,
    requestedTime?: string,
    rating?: number,
  ): Promise<void>;
  getCleaner(token: string): Promise<CleanerView | null>;
  cleanerUpdateTask(token: string, taskId: string, patch: Partial<CleaningTask>): Promise<void>;
  uploadCleaningPhoto(taskId: string, file: Blob): Promise<string>;
  /** Retrouve le séjour depuis le lien fixe du logement : code de réservation, ou date d'arrivée. */
  findStay(link: string, code: string | null, arrival: string | null): Promise<FoundStay | null>;
  /** Conversation du voyageur avec l'assistant et l'équipe. */
  getChat(token: string): Promise<ChatEntry[]>;
  getEscalation(token: string): Promise<Escalation | null>;
  answerEscalation(token: string, answer: string, learn: boolean): Promise<boolean>;
}

export type ChatEntry = {
  at: string;
  question: string;
  answer: string | null;
  /** ia : réponse directe de l'assistant ; en_attente : en cours de vérification ; equipe : validée. */
  status: "ia" | "en_attente" | "equipe";
};

export type Escalation = {
  question: string;
  proposed_answer: string | null;
  final_answer: string | null;
  reason: string | null;
  status: "en_attente" | "valide" | "modifie";
  created_at: string;
  answered_at: string | null;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  property: string;
  language: string;
};

export type FoundStay = { property: string; photo_url: string | null; guest_token: string | null };

export function createSupabasePublicApi(client: SupabaseClient<never> | SupabaseClient): PublicApi {
  const db = client as unknown as Untyped;
  return {
    mode: "cloud",
    async getStay(token) {
      const { data, error } = await db.rpc("pms_get_stay", { p_token: token });
      if (error) throw new Error(error.message);
      return (data as StayView | null) ?? null;
    },
    async guestRequest(token, type, details, requestedTime, rating) {
      const { error } = await db.rpc("pms_guest_request", {
        p_token: token,
        p_type: type,
        p_details: details,
        p_requested_time: requestedTime ?? null,
        p_rating: rating ?? null,
      });
      if (error) throw new Error(error.message);
    },
    async getCleaner(token) {
      const { data, error } = await db.rpc("pms_get_cleaner", { p_token: token });
      if (error) throw new Error(error.message);
      return (data as CleanerView | null) ?? null;
    },
    async cleanerUpdateTask(token, taskId, patch) {
      const { error } = await db.rpc("pms_cleaner_update_task", {
        p_token: token,
        p_task_id: taskId,
        p_patch: patch,
      });
      if (error) throw new Error(error.message);
    },
    async uploadCleaningPhoto(taskId, file) {
      const path = `menage/${taskId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error } = await db.storage
        .from("pms")
        .upload(path, file, { contentType: file.type || "image/jpeg" });
      if (error) throw new Error(`Envoi de la photo : ${error.message}`);
      // Le prestataire n'a pas le droit de lire l'espace privé : on garde le chemin, que l'équipe
      // transforme en lien signé à l'affichage (voir resolveStoredFile).
      return `${STORAGE_PREFIX}${path}`;
    },
    async getChat(token) {
      const { data, error } = await db.rpc("pms_guest_chat", { p_token: token });
      if (error) throw new Error(error.message);
      return (data as ChatEntry[] | null) ?? [];
    },
    async getEscalation(token) {
      const { data, error } = await db.rpc("pms_get_escalation", { p_token: token });
      if (error) throw new Error(error.message);
      return (data as Escalation | null) ?? null;
    },
    async answerEscalation(token, answer, learn) {
      const { data, error } = await db.rpc("pms_answer_escalation", {
        p_token: token,
        p_answer: answer,
        p_learn: learn,
      });
      if (error) throw new Error(error.message);
      return Boolean(data);
    },
    async findStay(link, code, arrival) {
      const { data, error } = await db.rpc("pms_find_stay", {
        p_link: link,
        p_code: code,
        p_arrival: arrival,
      });
      if (error) throw new Error(error.message);
      return (data as FoundStay | null) ?? null;
    },
  };
}

/** Mêmes règles que les fonctions SQL, appliquées aux données de démonstration du navigateur. */
export function createLocalPublicApi(store: Store): PublicApi {
  return {
    mode: "demo",
    async getStay(token) {
      const [reservations, properties, recos, requests] = await Promise.all([
        store.list("pms_reservations"),
        store.list("pms_properties"),
        store.list("pms_recommendations"),
        store.list("pms_guest_requests"),
      ]);
      const r = reservations.find((x) => x.guest_token === token && x.status !== "annulee");
      if (!r) return null;
      const p = properties.find((x) => x.id === r.property_id);
      if (!p) return null;
      const today = todayParis();
      const codesVisible = today >= addDays(r.check_in, -1) && today <= addDays(r.check_out, 1);
      const guide = { ...p.guide };
      if (!codesVisible) {
        delete guide.door_code;
        delete guide.keybox_code;
        delete guide.access_details;
      }
      return {
        reservation: {
          id: r.id,
          guest_name: r.guest_name,
          guests: r.guests,
          check_in: r.check_in,
          check_out: r.check_out,
          platform: r.platform,
          language: r.guest_language,
          arrival_time: r.arrival_time,
          departure_time: r.departure_time,
        },
        property: {
          id: p.id,
          name: p.name,
          address: p.address,
          arrondissement: p.arrondissement,
          photo_url: p.photo_url,
          checkin_time: p.checkin_time,
          checkout_time: p.checkout_time,
          late_checkout_until: p.late_checkout_until,
          late_checkout_price: p.late_checkout_price,
          early_checkin_price: p.early_checkin_price,
          guide,
        },
        codes_visible: codesVisible,
        recommendations: recos
          .filter(
            (x) =>
              x.active &&
              (x.property_id === p.id ||
                (!x.property_id && (!x.arrondissement || x.arrondissement === p.arrondissement))),
          )
          .sort((a, b) => Number(b.trending) - Number(a.trending) || a.name.localeCompare(b.name)),
        requests: requests
          .filter((q) => q.reservation_id === r.id && q.type !== "question")
          .map(({ id, type, status, requested_time, price, answer, created_at }) => ({
            id,
            type,
            status,
            requested_time,
            price,
            answer,
            created_at,
          })),
      };
    },
    async guestRequest(token, type, details, requestedTime, rating) {
      const reservations = await store.list("pms_reservations");
      const r = reservations.find((x) => x.guest_token === token);
      if (!r) throw new Error("Séjour introuvable");
      const p = (await store.list("pms_properties")).find((x) => x.id === r.property_id);
      await store.insert("pms_guest_requests", [
        {
          reservation_id: r.id,
          type,
          details,
          requested_time: requestedTime ?? null,
          rating: rating ?? null,
          price:
            type === "late_checkout"
              ? (p?.late_checkout_price ?? null)
              : type === "early_checkin"
                ? (p?.early_checkin_price ?? null)
                : null,
        },
      ]);
    },
    async getCleaner(token) {
      const [cleaners, tasks, properties, reservations] = await Promise.all([
        store.list("pms_cleaners"),
        store.list("pms_cleaning_tasks"),
        store.list("pms_properties"),
        store.list("pms_reservations"),
      ]);
      const c = cleaners.find((x) => x.token === token && x.active);
      if (!c) return null;
      const today = todayParis();
      const from = addDays(today, -14);
      const to = addDays(today, 60);
      return {
        cleaner: { id: c.id, name: c.name, company: c.company },
        tasks: tasks
          .filter((t) => t.cleaner_id === c.id && t.date >= from && t.date <= to)
          .sort((a, b) => a.date.localeCompare(b.date))
          .flatMap((t) => {
            const p = properties.find((x) => x.id === t.property_id);
            if (!p) return [];
            const r = reservations.find((x) => x.id === t.reservation_id);
            const n = reservations.find((x) => x.id === t.next_reservation_id);
            return [
              {
                task: t,
                property: {
                  id: p.id,
                  name: p.name,
                  address: p.address,
                  photo_url: p.photo_url,
                  checklist: p.checklist,
                  bedrooms: p.bedrooms,
                  capacity: p.capacity,
                  access: {
                    door_code: p.guide.door_code,
                    keybox_code: p.guide.keybox_code,
                    access_details: p.guide.access_details,
                    cleaning_notes: p.guide.cleaning_notes,
                    trash: p.guide.trash,
                  },
                },
                reservation: r
                  ? {
                      check_in: r.check_in,
                      check_out: r.check_out,
                      guests: r.guests,
                      platform: r.platform,
                      departure_time: r.departure_time,
                    }
                  : null,
                next: n
                  ? {
                      check_in: n.check_in,
                      check_out: n.check_out,
                      guests: n.guests,
                      arrival_time: n.arrival_time,
                      notes: n.notes,
                    }
                  : null,
              },
            ];
          }),
      };
    },
    async cleanerUpdateTask(token, taskId, patch) {
      const c = (await store.list("pms_cleaners")).find((x) => x.token === token);
      const t = (await store.list("pms_cleaning_tasks")).find(
        (x) => x.id === taskId && x.cleaner_id === c?.id,
      );
      if (!c || !t) throw new Error("Ménage introuvable");
      const now = new Date().toISOString();
      const next: Partial<CleaningTask> = { ...patch };
      if (patch.status === "en_cours" && !t.started_at) next.started_at = now;
      if (patch.status === "termine") next.completed_at = now;
      await store.update("pms_cleaning_tasks", t.id, next);
      const merged = { ...t, ...next };
      const incidents = await store.list("pms_incidents");
      if (
        patch.status === "termine" &&
        (merged.condition === "orange" || merged.condition === "rouge") &&
        !incidents.some((i) => i.task_id === t.id)
      ) {
        await store.insert("pms_incidents", [
          {
            property_id: t.property_id,
            task_id: t.id,
            reservation_id: t.reservation_id,
            severity: merged.condition,
            title:
              merged.condition === "rouge"
                ? "Problème important signalé au ménage"
                : "Point à vérifier signalé au ménage",
            description: merged.report_notes,
            photos: merged.photos,
            reported_by: c.name,
          },
        ]);
      }
    },
    async uploadCleaningPhoto(_taskId, file) {
      return store.upload("", file);
    },
    // Mode démo : pas de validation par WhatsApp (l'assistant répond avec le livret).
    async getChat() {
      return [];
    },
    async getEscalation() {
      return null;
    },
    async answerEscalation() {
      return false;
    },
    async findStay(link, code, arrival) {
      const p = (await store.list("pms_properties")).find(
        (x) => x.guest_link_token === link && x.active,
      );
      if (!p) return null;
      const today = todayParis();
      const resas = (await store.list("pms_reservations")).filter(
        (r) => r.property_id === p.id && r.status === "confirmee",
      );
      const norm = (s: string) => s.replace(/\s/g, "").toUpperCase();
      let found: (typeof resas)[number] | undefined;
      if (code?.trim()) {
        found = resas.find(
          (r) =>
            r.check_out >= addDays(today, -1) &&
            norm(
              String((r.raw as { reservation_code?: string } | null)?.reservation_code ?? ""),
            ) === norm(code),
        );
      } else if (arrival && arrival >= addDays(today, -30) && arrival <= addDays(today, 2)) {
        const same = resas.filter((r) => r.check_in === arrival);
        if (same.length === 1) found = same[0];
      }
      return { property: p.name, photo_url: p.photo_url, guest_token: found?.guest_token ?? null };
    },
  };
}
