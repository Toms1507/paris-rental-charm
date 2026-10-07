// Dates « jour » au format AAAA-MM-JJ, calculées à l'heure de Paris.

export const TZ = "Europe/Paris";

export function todayParis(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

/** Heure de Paris « HH:MM » d'un instant. */
export function timeParis(now = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function diffDays(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

export const nights = (r: { check_in: string; check_out: string }) =>
  Math.max(0, diffDays(r.check_in, r.check_out));

function parisOffsetMinutes(d: Date): number {
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "shortOffset" })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const m = /GMT([+-])(\d+)(?::(\d+))?/.exec(name);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
}

/** Instant UTC correspondant à « jour + heure » à Paris (gère heure d'été / d'hiver). */
export function parisInstant(day: string, time = "10:00"): Date {
  const [h = 10, m = 0] = time.split(":").map(Number);
  const guess = new Date(`${day}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`);
  return new Date(guess.getTime() - parisOffsetMinutes(guess) * 60_000);
}

export function monthKey(day: string) {
  return day.slice(0, 7);
}

export function previousMonth(month: string): string {
  const [y = 2000, m = 1] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

export function daysInMonth(month: string): number {
  const [y = 2000, m = 1] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Nombre de nuits d'un séjour comprises dans le mois (une nuit compte pour le jour où elle commence). */
export function nightsInMonth(r: { check_in: string; check_out: string }, month: string): number {
  const start = `${month}-01`;
  const end = addDays(`${month}-${String(daysInMonth(month)).padStart(2, "0")}`, 1);
  const from = r.check_in > start ? r.check_in : start;
  const to = r.check_out < end ? r.check_out : end;
  return Math.max(0, diffDays(from, to));
}

const fmtDay = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const fmtLong = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const fmtMonth = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export const formatDay = (day: string) => fmtDay.format(new Date(`${day}T12:00:00Z`));
export const formatLongDay = (day: string) => fmtLong.format(new Date(`${day}T12:00:00Z`));
export const formatMonth = (month: string) => fmtMonth.format(new Date(`${month}-15T12:00:00Z`));
export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export const euros = (n: number, digits = 0) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n || 0);

export const percent = (n: number) => `${Math.round((n || 0) * 100)} %`;
