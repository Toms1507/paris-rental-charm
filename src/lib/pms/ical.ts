// Lecture et écriture de calendriers iCal (RFC 5545), le format d'export / import commun à
// Airbnb, Booking.com, Abritel / Vrbo, Google Agenda et la plupart des channel managers.

import type { Platform } from "./types";

export type IcalEvent = {
  uid: string;
  start: string; // AAAA-MM-JJ
  end: string; // AAAA-MM-JJ (jour du départ, exclu)
  summary: string;
  description: string;
};

function unfold(text: string): string[] {
  return text
    .replace(/\r\n[ \t]/g, "")
    .replace(/\n[ \t]/g, "")
    .split(/\r?\n/);
}

function unescape(v: string) {
  return v.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function toDay(value: string): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(value.trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

export function parseIcal(text: string): IcalEvent[] {
  const events: IcalEvent[] = [];
  let cur: Partial<IcalEvent> | null = null;
  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") cur = { summary: "", description: "" };
    else if (line === "END:VEVENT") {
      if (cur?.start) {
        const end = cur.end ?? cur.start;
        events.push({
          uid: cur.uid || `${cur.start}-${end}-${cur.summary}`,
          start: cur.start,
          end: end > cur.start ? end : cur.start,
          summary: cur.summary ?? "",
          description: cur.description ?? "",
        });
      }
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const name = (line.slice(0, idx).split(";")[0] ?? "").toUpperCase();
      const value = line.slice(idx + 1);
      const day = toDay(value);
      if (name === "UID") cur.uid = value.trim();
      else if (name === "DTSTART" && day) cur.start = day;
      else if (name === "DTEND" && day) cur.end = day;
      else if (name === "SUMMARY") cur.summary = unescape(value);
      else if (name === "DESCRIPTION") cur.description = unescape(value);
    }
  }
  return events;
}

export type ParsedBooking = {
  kind: "reservation" | "blocage";
  guestName: string | null;
  phoneLast4: string | null;
  reservationUrl: string | null;
  reservationCode: string | null;
};

/** Interprète un événement selon la plateforme (chaque plateforme formule ses exports différemment). */
export function interpretEvent(ev: IcalEvent, platform: Platform): ParsedBooking {
  const s = ev.summary.trim();
  const d = ev.description;
  const url = /(https?:\/\/[^\s]+)/.exec(d)?.[1] ?? null;
  const phone = /Last 4 Digits\)?:\s*(\d{4})/i.exec(d)?.[1] ?? null;
  const code = /details\/([A-Z0-9]{6,})/.exec(d)?.[1] ?? /\b(HM[A-Z0-9]{8})\b/.exec(d)?.[1] ?? null;
  const blocked = /not available|indisponible|blocked|bloqu|unavailable/i.test(s);

  if (platform === "airbnb") {
    // « Reserved » = réservation ; « Airbnb (Not available) » = dates bloquées.
    return {
      kind: /reserved|réserv/i.test(s) && !blocked ? "reservation" : "blocage",
      guestName: null,
      phoneLast4: phone,
      reservationUrl: url,
      reservationCode: code,
    };
  }
  if (platform === "booking") {
    // Booking exporte « CLOSED - Not available » pour toute nuit réservée ou fermée.
    return {
      kind: "reservation",
      guestName: null,
      phoneLast4: null,
      reservationUrl: url,
      reservationCode: null,
    };
  }
  if (platform === "abritel") {
    // Vrbo / Abritel : « Reserved - Prénom N » ou « Blocked ».
    const name = /^Reserved\s*-\s*(.+)$/i.exec(s)?.[1]?.trim() ?? null;
    return {
      kind: /^blocked/i.test(s) ? "blocage" : "reservation",
      guestName: name,
      phoneLast4: phone,
      reservationUrl: url,
      reservationCode: null,
    };
  }
  return {
    kind: blocked ? "blocage" : "reservation",
    guestName: blocked || !s ? null : s.slice(0, 80),
    phoneLast4: phone,
    reservationUrl: url,
    reservationCode: null,
  };
}

const esc = (v: string) =>
  v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const compact = (day: string) => day.replace(/-/g, "");

function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

export function buildIcal(
  name: string,
  events: {
    uid: string;
    start: string;
    end: string;
    summary: string;
    description?: string;
    allDay?: boolean;
    startTime?: string;
    endTime?: string;
  }[],
): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Spinelle Conciergerie//Gestion//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`,
    "X-WR-TIMEZONE:Europe/Paris",
  ];
  for (const e of events) {
    lines.push("BEGIN:VEVENT", `UID:${e.uid}@spinelleconciergerie.fr`, `DTSTAMP:${stamp}`);
    if (e.startTime && e.endTime) {
      lines.push(
        `DTSTART;TZID=Europe/Paris:${compact(e.start)}T${e.startTime.replace(":", "")}00`,
        `DTEND;TZID=Europe/Paris:${compact(e.end)}T${e.endTime.replace(":", "")}00`,
      );
    } else {
      lines.push(`DTSTART;VALUE=DATE:${compact(e.start)}`, `DTEND;VALUE=DATE:${compact(e.end)}`);
    }
    lines.push(fold(`SUMMARY:${esc(e.summary)}`));
    if (e.description) lines.push(fold(`DESCRIPTION:${esc(e.description)}`));
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/** Domaines acceptés pour l'import iCal (évite que le serveur serve de relais vers n'importe quelle adresse). */
export const ICAL_HOSTS = [
  "airbnb.com",
  "airbnb.fr",
  "airbnb.co.uk",
  "airbnb.de",
  "airbnb.es",
  "airbnb.it",
  "airbnb.be",
  "airbnb.ch",
  "booking.com",
  "abritel.fr",
  "vrbo.com",
  "homeaway.com",
  "homeaway.fr",
  "google.com",
  "googleusercontent.com",
  "smoobu.com",
  "beds24.com",
  "lodgify.com",
  "hospitable.com",
  "guesty.com",
  "superhote.com",
  "icloud.com",
  "outlook.office365.com",
  "outlook.live.com",
  "gites-de-france.com",
  "leboncoin.fr",
  "expedia.com",
  "tripadvisor.com",
  "holidu.com",
  "hostaway.com",
  "spinelleconciergerie.fr",
];

export function isAllowedIcalUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "webcal:") return false;
    const host = u.hostname.toLowerCase();
    return ICAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export function guessPlatform(url: string): Platform {
  if (/airbnb\./i.test(url)) return "airbnb";
  if (/booking\.com/i.test(url)) return "booking";
  if (/abritel|vrbo|homeaway/i.test(url)) return "abritel";
  return "autre";
}
