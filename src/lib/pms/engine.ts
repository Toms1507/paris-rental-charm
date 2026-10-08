// Moteur d'automatisations : synchronisation des calendriers, planning des ménages, messages
// voyageurs et rapports mensuels. Il tourne :
//   * dans le navigateur, à l'ouverture du logiciel puis toutes les 10 minutes ;
//   * sur le serveur, toutes les 15 minutes (tâche planifiée GitHub → /api/pms/cron).
// Chaque étape est idempotente : relancer le moteur ne crée jamais de doublon.

import { addDays, previousMonth, todayParis } from "./dates";
import { DEFAULT_SETTINGS } from "./defaults";
import { interpretEvent, parseIcal } from "./ical";
import { buildReport, reportEmailHtml } from "./reports";
import { loadAll, type AllData, type Store } from "./store";
import { renderTemplate, scheduleFor, templateApplies } from "./templates";
import type { IcalFeed, Message, Property, Reservation, Settings } from "./types";

export type SendResult = { ok: boolean; error?: string; simulated?: boolean };

export interface Sender {
  email(to: string, subject: string, text: string, html?: string | undefined): Promise<SendResult>;
}

export type RunContext = {
  store: Store;
  fetchIcal: (url: string) => Promise<string>;
  sender: Sender;
  /** Adresse du site, pour les liens vers les livrets voyageurs. */
  origin: string;
  now?: Date;
};

export type RunSummary = {
  synced: number;
  feedErrors: string[];
  newReservations: number;
  cancelled: number;
  tasksCreated: number;
  messagesPlanned: number;
  messagesSent: number;
  messagesToCopy: number;
  messageErrors: number;
  reportsSent: number;
};

export function getSettings(data: AllData): Settings {
  return { ...DEFAULT_SETTINGS, ...(data.pms_settings[0]?.data ?? {}) };
}

export async function saveSettings(store: Store, data: AllData, patch: Partial<Settings>) {
  const row = data.pms_settings[0];
  if (row) {
    await store.update("pms_settings", row.id, {
      data: { ...row.data, ...patch },
      updated_at: new Date().toISOString(),
    });
  } else {
    await store.insert("pms_settings", [{ data: patch }]);
  }
}

const overlaps = (
  a: { check_in: string; check_out: string },
  b: { check_in: string; check_out: string },
) => a.check_in < b.check_out && b.check_in < a.check_out;

// ---------------------------------------------------------------- calendriers

export async function syncProperty(
  ctx: RunContext,
  data: AllData,
  p: Property,
  summary: RunSummary,
): Promise<void> {
  if (!p.ical_feeds?.length) return;
  const today = todayParis(ctx.now);
  const feeds: IcalFeed[] = [];
  for (const feed of p.ical_feeds) {
    if (!feed.url) {
      feeds.push(feed);
      continue;
    }
    try {
      const events = parseIcal(await ctx.fetchIcal(feed.url));
      const seen = new Set<string>();
      for (const ev of events) {
        if (ev.end < addDays(today, -60)) continue;
        const ext = `${feed.platform}:${ev.uid}`;
        seen.add(ext);
        const parsed = interpretEvent(ev, feed.platform);
        const status = parsed.kind === "blocage" ? "bloquee" : "confirmee";
        const existing = data.pms_reservations.find(
          (r) => r.property_id === p.id && r.external_uid === ext,
        );
        // Reflet de notre propre calendrier exporté : un blocage qui recouvre une réservation d'une
        // autre plateforme, ou un événement aux mêmes dates exactes (Booking exporte les dates
        // importées en « CLOSED - Not available », comme ses propres réservations). On l'ignore.
        const mirror = data.pms_reservations.some(
          (r) =>
            r.property_id === p.id &&
            r.status === "confirmee" &&
            r.platform !== feed.platform &&
            r.id !== existing?.id &&
            (status === "bloquee"
              ? overlaps(r, { check_in: ev.start, check_out: ev.end })
              : r.check_in === ev.start && r.check_out === ev.end && !parsed.guestName),
        );
        if (mirror) {
          if (existing && existing.source === "ical" && existing.status !== "annulee")
            await ctx.store.remove("pms_reservations", existing.id);
          continue;
        }
        const raw = {
          summary: ev.summary,
          description: ev.description.slice(0, 2000),
          reservation_url: parsed.reservationUrl,
          reservation_code: parsed.reservationCode,
          phone_last4: parsed.phoneLast4,
        };
        if (existing) {
          if (
            existing.check_in !== ev.start ||
            existing.check_out !== ev.end ||
            existing.status !== status
          ) {
            await ctx.store.update("pms_reservations", existing.id, {
              check_in: ev.start,
              check_out: ev.end,
              status,
              // Conserve le code de réservation saisi à la main (Booking n'en fournit pas).
              raw: {
                ...(existing.raw ?? {}),
                ...raw,
                reservation_code:
                  raw.reservation_code ??
                  (existing.raw as { reservation_code?: string } | null)?.reservation_code ??
                  null,
              },
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          const [created] = await ctx.store.insert("pms_reservations", [
            {
              property_id: p.id,
              platform: feed.platform,
              external_uid: ext,
              source: "ical",
              status,
              check_in: ev.start,
              check_out: ev.end,
              guest_name: parsed.guestName,
              guests: Math.min(p.capacity, 2),
              cleaning_fee: status === "confirmee" ? p.cleaning_fee : 0,
              raw,
              notes: parsed.phoneLast4 ? `Téléphone : …${parsed.phoneLast4}` : null,
            },
          ]);
          if (created) data.pms_reservations.push(created);
          if (status === "confirmee") summary.newReservations++;
        }
      }
      // Réservations à venir disparues du calendrier de la plateforme : annulées.
      for (const r of data.pms_reservations) {
        if (
          r.property_id === p.id &&
          r.source === "ical" &&
          r.external_uid?.startsWith(`${feed.platform}:`) &&
          !seen.has(r.external_uid) &&
          r.status !== "annulee" &&
          r.check_out >= today
        ) {
          await ctx.store.update("pms_reservations", r.id, {
            status: "annulee",
            updated_at: new Date().toISOString(),
          });
          if (r.status === "confirmee") summary.cancelled++;
        }
      }
      feeds.push({
        ...feed,
        last_sync: new Date().toISOString(),
        last_status: `${events.length} événement(s)`,
      });
      summary.synced++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      summary.feedErrors.push(`${p.name} (${feed.platform}) : ${msg}`);
      feeds.push({ ...feed, last_sync: new Date().toISOString(), last_status: `Erreur : ${msg}` });
    }
  }
  await ctx.store.update("pms_properties", p.id, { ical_feeds: feeds });
}

// ---------------------------------------------------------------- ménages

export async function planCleanings(ctx: RunContext, data: AllData, summary: RunSummary) {
  const today = todayParis(ctx.now);
  for (const p of data.pms_properties) {
    const resas = data.pms_reservations
      .filter((r) => r.property_id === p.id && r.status === "confirmee")
      .sort((a, b) => a.check_in.localeCompare(b.check_in));
    const cleaner = data.pms_cleaners.find((c) => c.id === p.cleaner_id);
    for (const r of resas) {
      if (r.check_out < addDays(today, -2)) continue;
      const next = resas.find((x) => x.id !== r.id && x.check_in >= r.check_out);
      const sameDay = next && next.check_in === r.check_out;
      const desired = {
        date: r.check_out,
        window_start: r.departure_time || p.checkout_time,
        window_end: sameDay ? next.arrival_time || p.checkin_time : null,
        next_reservation_id: next?.id ?? null,
        next_guests: next?.guests ?? null,
      };
      const task = data.pms_cleaning_tasks.find((t) => t.reservation_id === r.id);
      if (!task) {
        await ctx.store.insert("pms_cleaning_tasks", [
          {
            property_id: p.id,
            reservation_id: r.id,
            cleaner_id: p.cleaner_id,
            price: cleaner?.rate || p.cleaning_fee || 0,
            checklist: (p.checklist ?? []).map((c) => ({ label: c.label, done: false })),
            ...desired,
          },
        ]);
        summary.tasksCreated++;
      } else if (
        task.status === "a_faire" &&
        (task.date !== desired.date ||
          task.window_start !== desired.window_start ||
          task.window_end !== desired.window_end ||
          task.next_reservation_id !== desired.next_reservation_id ||
          task.next_guests !== desired.next_guests)
      ) {
        await ctx.store.update("pms_cleaning_tasks", task.id, desired);
      }
    }
  }
  // Ménages à venir dont la réservation a été annulée.
  for (const t of data.pms_cleaning_tasks) {
    const r = data.pms_reservations.find((x) => x.id === t.reservation_id);
    if (t.status === "a_faire" && t.date >= today && r && r.status !== "confirmee") {
      await ctx.store.remove("pms_cleaning_tasks", t.id);
    }
  }
}

// ---------------------------------------------------------------- messages

export function resolveChannel(
  channel: string,
  r: Pick<Reservation, "guest_email" | "guest_phone">,
): Message["channel"] {
  if (channel === "email") return "email";
  if (channel === "whatsapp") return "whatsapp";
  if (channel === "plateforme") return "plateforme";
  return r.guest_email ? "email" : "plateforme";
}

export async function planMessages(ctx: RunContext, data: AllData, summary: RunSummary) {
  const now = ctx.now ?? new Date();
  const today = todayParis(now);
  const settings = getSettings(data);
  const templates = data.pms_message_templates.filter((t) => t.active);
  for (const r of data.pms_reservations) {
    const p = data.pms_properties.find((x) => x.id === r.property_id);
    if (!p) continue;
    if (r.status !== "confirmee") {
      for (const m of data.pms_messages)
        if (m.reservation_id === r.id && m.status === "planifie")
          await ctx.store.update("pms_messages", m.id, { status: "annule" });
      continue;
    }
    if (r.check_out < addDays(today, -3)) continue;
    for (const t of templates) {
      if (!templateApplies(t, r)) continue;
      if (data.pms_messages.some((m) => m.reservation_id === r.id && m.template_id === t.id))
        continue;
      const when = scheduleFor(t, r);
      // Pas de rattrapage des messages dont l'heure est passée depuis plus de 12 h
      // (ex. séjour importé alors qu'il a déjà commencé).
      if (when.getTime() < now.getTime() - 12 * 3_600_000) continue;
      const render = (s: string) =>
        renderTemplate(s, { reservation: r, property: p, settings, origin: ctx.origin });
      const channel = resolveChannel(t.channel, r);
      const [m] = await ctx.store.insert("pms_messages", [
        {
          reservation_id: r.id,
          template_id: t.id,
          channel,
          recipient:
            channel === "email" ? r.guest_email : channel === "whatsapp" ? r.guest_phone : null,
          subject: render(t.subject ?? t.name),
          body: render(t.body),
          status: "planifie",
          scheduled_for: when.toISOString(),
        },
      ]);
      if (m) data.pms_messages.push(m);
      summary.messagesPlanned++;
    }
  }
}

export async function sendDueMessages(ctx: RunContext, data: AllData, summary: RunSummary) {
  const now = ctx.now ?? new Date();
  const settings = getSettings(data);
  if (!settings.auto_send) return;
  for (const m of data.pms_messages) {
    if (m.status !== "planifie" || !m.scheduled_for || Date.parse(m.scheduled_for) > now.getTime())
      continue;
    const r = data.pms_reservations.find((x) => x.id === m.reservation_id);
    const p = r && data.pms_properties.find((x) => x.id === r.property_id);
    if (!r || !p) continue;
    if (r.status !== "confirmee") {
      await ctx.store.update("pms_messages", m.id, { status: "annule" });
      continue;
    }
    // Rendu au moment de l'envoi : prend en compte les infos complétées entre-temps (email, codes…).
    const t = data.pms_message_templates.find((x) => x.id === m.template_id);
    const render = (s: string) =>
      renderTemplate(s, { reservation: r, property: p, settings, origin: ctx.origin });
    const subject = t ? render(t.subject ?? t.name) : (m.subject ?? "");
    const body = t ? render(t.body) : m.body;
    const channel = t ? resolveChannel(t.channel, r) : m.channel;
    if (channel === "email" && r.guest_email) {
      const res = await ctx.sender.email(r.guest_email, subject, body);
      await ctx.store.update("pms_messages", m.id, {
        channel,
        recipient: r.guest_email,
        subject,
        body,
        status: res.ok ? "envoye" : "echec",
        sent_at: res.ok ? new Date().toISOString() : null,
        error: res.ok
          ? res.simulated
            ? "Envoi simulé (mode démo)"
            : null
          : (res.error ?? "Échec"),
      });
      if (res.ok) summary.messagesSent++;
      else summary.messageErrors++;
    } else {
      // Pas d'email voyageur : message prêt à coller dans la messagerie Airbnb / Booking / Abritel
      // (ou à envoyer par WhatsApp), en attendant la connexion des comptes.
      await ctx.store.update("pms_messages", m.id, {
        channel: channel === "email" ? "plateforme" : channel,
        recipient: channel === "whatsapp" ? r.guest_phone : null,
        subject,
        body,
        status: "a_copier",
      });
      summary.messagesToCopy++;
    }
  }
}

// ---------------------------------------------------------------- rapports propriétaires

export async function generateReports(
  ctx: RunContext,
  data: AllData,
  month: string,
  opts: { send: boolean; propertyIds?: string[] },
): Promise<{ created: number; sent: number; errors: string[] }> {
  const settings = getSettings(data);
  const out = { created: 0, sent: 0, errors: [] as string[] };
  for (const p of data.pms_properties) {
    if (opts.propertyIds && !opts.propertyIds.includes(p.id)) continue;
    if (!p.active && !opts.propertyIds) continue;
    const report = buildReport(data, p.id, month);
    const existing = data.pms_owner_reports.find(
      (r) => r.property_id === p.id && r.month === month,
    );
    let id = existing?.id;
    if (existing) {
      await ctx.store.update("pms_owner_reports", existing.id, {
        data: report,
        owner_id: p.owner_id,
      });
    } else {
      const [row] = await ctx.store.insert("pms_owner_reports", [
        { property_id: p.id, owner_id: p.owner_id, month, data: report },
      ]);
      if (row) data.pms_owner_reports.push(row);
      id = row?.id;
      out.created++;
    }
    const owner = data.pms_owners.find((o) => o.id === p.owner_id);
    if (opts.send && id) {
      if (!owner?.email) {
        out.errors.push(`${p.name} : pas d'email propriétaire`);
        continue;
      }
      const html = reportEmailHtml(report, {
        name: settings.company_name,
        email: settings.email,
        phone: settings.phone,
      });
      const text = `Rapport de ${month} pour ${p.name} : versement ${Math.round(report.ownerPayout)} €, occupation ${Math.round(report.occupancy * 100)} %.`;
      const res = await ctx.sender.email(
        owner.email,
        `${settings.company_name} : rapport de ${month} pour ${p.name}`,
        text,
        html,
      );
      if (res.ok) {
        await ctx.store.update("pms_owner_reports", id, {
          status: "envoye",
          sent_at: new Date().toISOString(),
        });
        out.sent++;
      } else out.errors.push(`${p.name} : ${res.error ?? "échec d'envoi"}`);
    }
  }
  return out;
}

// ---------------------------------------------------------------- tout

export async function runAutomations(
  ctx: RunContext,
  opts: { sync?: boolean } = {},
): Promise<RunSummary> {
  const summary: RunSummary = {
    synced: 0,
    feedErrors: [],
    newReservations: 0,
    cancelled: 0,
    tasksCreated: 0,
    messagesPlanned: 0,
    messagesSent: 0,
    messagesToCopy: 0,
    messageErrors: 0,
    reportsSent: 0,
  };
  let data = await loadAll(ctx.store);
  if (opts.sync !== false) {
    for (const p of data.pms_properties.filter((x) => x.active))
      await syncProperty(ctx, data, p, summary);
    data = await loadAll(ctx.store);
  }
  await planCleanings(ctx, data, summary);
  data = await loadAll(ctx.store);
  await planMessages(ctx, data, summary);
  await sendDueMessages(ctx, data, summary);

  // Le 1er du mois (ou au premier passage après), rapports du mois écoulé aux propriétaires.
  const settings = getSettings(data);
  const lastMonth = previousMonth(todayParis(ctx.now).slice(0, 7));
  if (!settings.last_reports_month) {
    // Première mise en service : on commence par le mois en cours, sans rapport rétroactif.
    await saveSettings(ctx.store, data, { last_reports_month: lastMonth });
    data = await loadAll(ctx.store);
  } else if (
    settings.auto_reports &&
    settings.last_reports_month !== lastMonth &&
    data.pms_owners.length
  ) {
    data = await loadAll(ctx.store);
    const res = await generateReports(ctx, data, lastMonth, { send: true });
    summary.reportsSent = res.sent;
    await saveSettings(ctx.store, data, { last_reports_month: lastMonth });
    data = await loadAll(ctx.store);
  }
  await saveSettings(ctx.store, data, { last_run: new Date().toISOString() });
  return summary;
}

/** Réservations confirmées qui se chevauchent sur un même logement (double réservation). */
export function findConflicts(data: AllData) {
  const out: [Reservation, Reservation][] = [];
  const today = todayParis();
  for (const p of data.pms_properties) {
    const rs = data.pms_reservations.filter(
      (r) => r.property_id === p.id && r.status === "confirmee" && r.check_out >= today,
    );
    rs.forEach((a, i) => rs.slice(i + 1).forEach((b) => overlaps(a, b) && out.push([a, b])));
  }
  return out;
}
