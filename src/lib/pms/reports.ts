// Rapport mensuel de performance d'un logement, envoyé au propriétaire.

import {
  daysInMonth,
  euros,
  formatDay,
  formatMonth,
  nights,
  nightsInMonth,
  percent,
  previousMonth,
} from "./dates";
import { EXPENSE_CATEGORIES, PLATFORMS } from "./types";
import type { ReportData } from "./types";
import type { AllData } from "./store";

export function buildReport(
  data: AllData,
  propertyId: string,
  month: string,
  withPrevious = true,
): ReportData {
  const p = data.pms_properties.find((x) => x.id === propertyId);
  if (!p) throw new Error("Logement introuvable");
  const owner = data.pms_owners.find((o) => o.id === p.owner_id);
  const days = daysInMonth(month);
  const resas = data.pms_reservations.filter(
    (r) => r.property_id === p.id && r.status !== "annulee" && nightsInMonth(r, month) > 0,
  );
  const booked = resas.filter((r) => r.status === "confirmee");
  const blocked = resas.filter((r) => r.status === "bloquee");

  let gross = 0;
  let platformFees = 0;
  let cleaningCollected = 0;
  let nightsBooked = 0;
  const rows: ReportData["reservations"] = [];
  for (const r of booked) {
    const n = nightsInMonth(r, month);
    const share = nights(r) ? n / nights(r) : 0;
    nightsBooked += n;
    gross += r.amount_gross * share;
    platformFees += r.platform_fee * share;
    cleaningCollected += r.cleaning_fee * share;
    rows.push({
      guest: r.guest_name || "Voyageur",
      platform: PLATFORMS[r.platform]?.label ?? r.platform,
      check_in: r.check_in,
      check_out: r.check_out,
      nights: n,
      gross: r.amount_gross * share,
    });
  }
  const nightsBlocked = blocked.reduce((s, r) => s + nightsInMonth(r, month), 0);
  const available = Math.max(1, days - nightsBlocked);
  const netRevenue = gross - platformFees;
  const commission = Math.max(0, netRevenue - cleaningCollected) * p.commission_rate;
  const cleaningCost = data.pms_cleaning_tasks
    .filter((t) => t.property_id === p.id && t.date.startsWith(month))
    .reduce((s, t) => s + (t.price || 0), 0);
  const expenses = data.pms_expenses
    .filter((e) => e.property_id === p.id && e.date.startsWith(month) && e.billable_to_owner)
    .map((e) => ({
      date: e.date,
      label: e.label,
      category: EXPENSE_CATEGORIES[e.category] ?? e.category,
      amount: e.amount,
      invoice_url: e.invoice_url,
    }));
  const incidents = data.pms_incidents.filter(
    (i) => i.property_id === p.id && i.created_at.startsWith(month),
  );
  for (const i of incidents) {
    if (i.cost > 0 && i.billable_to_owner)
      expenses.push({
        date: i.created_at.slice(0, 10),
        label: `Intervention : ${i.title}`,
        category: "Réparation / maintenance",
        amount: i.cost,
        invoice_url: null,
      });
  }
  const expensesTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const reviews = data.pms_reviews.filter(
    (r) => r.property_id === p.id && r.date.startsWith(month),
  );
  const prev = withPrevious ? buildReport(data, propertyId, previousMonth(month), false) : null;

  return {
    month,
    propertyName: p.name,
    ownerName: owner?.name ?? "",
    daysInMonth: days,
    nightsBooked,
    nightsBlocked,
    occupancy: nightsBooked / available,
    stays: booked.length,
    adr: nightsBooked ? gross / nightsBooked : 0,
    revpar: gross / available,
    gross,
    platformFees,
    cleaningCollected,
    netRevenue,
    commissionRate: p.commission_rate,
    commission,
    cleaningCost,
    expenses,
    expensesTotal,
    ownerPayout: netRevenue - commission - cleaningCost - expensesTotal,
    averageRating: reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null,
    reviewsCount: reviews.length,
    incidents: incidents.map((i) => ({
      title: i.title,
      severity: i.severity,
      status: i.status,
      cost: i.cost,
    })),
    reservations: rows.sort((a, b) => a.check_in.localeCompare(b.check_in)),
    previous: prev
      ? { occupancy: prev.occupancy, ownerPayout: prev.ownerPayout, gross: prev.gross }
      : null,
  };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function trend(cur: number, prev: number | undefined, fmt: (n: number) => string) {
  if (prev === undefined || prev === 0) return "";
  const d = cur - prev;
  const color = d >= 0 ? "#047857" : "#b91c1c";
  return `<div style="font-size:12px;color:${color}">${d >= 0 ? "▲" : "▼"} ${fmt(Math.abs(d))} vs mois précédent</div>`;
}

/** Email HTML du rapport (styles en ligne : compatibles avec les clients mail). */
export function reportEmailHtml(
  d: ReportData,
  company: { name: string; email: string; phone: string },
) {
  const kpi = (label: string, value: string, extra = "") =>
    `<td style="padding:12px;border:1px solid #DCE2E8;border-radius:8px;width:25%;vertical-align:top"><div style="font-size:12px;color:#515963">${label}</div><div style="font-size:20px;font-weight:700;color:#213F6C;margin-top:4px">${value}</div>${extra}</td>`;
  const line = (label: string, value: number, bold = false, negative = false) =>
    `<tr><td style="padding:6px 0;${bold ? "font-weight:700" : ""}">${label}</td><td style="padding:6px 0;text-align:right;${bold ? "font-weight:700" : ""}">${negative && value ? "− " : ""}${euros(value, 2)}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#F3F6FA;font-family:Helvetica,Arial,sans-serif;color:#202020">
<div style="max-width:640px;margin:0 auto;padding:24px">
<div style="background:#213F6C;color:#fff;border-radius:12px 12px 0 0;padding:24px">
<div style="font-size:13px;opacity:.8">${esc(company.name)}</div>
<div style="font-size:22px;font-weight:700;margin-top:4px">Rapport de ${esc(formatMonth(d.month))}</div>
<div style="font-size:15px;margin-top:4px">${esc(d.propertyName)}</div>
</div>
<div style="background:#fff;padding:24px;border-radius:0 0 12px 12px">
<p>Bonjour${d.ownerName ? ` ${esc(d.ownerName.split(" ")[0] ?? "")}` : ""},</p>
<p>Voici les performances de votre logement pour ${esc(formatMonth(d.month))}.</p>
<table style="width:100%;border-collapse:separate;border-spacing:6px;margin:12px -6px"><tr>
${kpi(
  "Taux d'occupation",
  percent(d.occupancy),
  trend(
    d.occupancy * 100,
    d.previous ? d.previous.occupancy * 100 : undefined,
    (n) => `${Math.round(n)} pts`,
  ),
)}
${kpi("Nuits louées", String(d.nightsBooked))}
${kpi("Prix moyen / nuit", euros(d.adr))}
${kpi(
  "Versement",
  euros(d.ownerPayout),
  trend(d.ownerPayout, d.previous?.ownerPayout, (n) => euros(n)),
)}
</tr></table>
<h3 style="color:#213F6C;margin-top:24px">Détail financier</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px">
${line("Revenus des réservations (voyageurs)", d.gross)}
${line("Frais des plateformes", d.platformFees, false, true)}
${line(`Commission conciergerie (${Math.round(d.commissionRate * 100)} %)`, d.commission, false, true)}
${line("Ménages", d.cleaningCost, false, true)}
${line("Dépenses et interventions", d.expensesTotal, false, true)}
<tr><td colspan="2" style="border-top:1px solid #DCE2E8"></td></tr>
${line("Montant qui vous est reversé", d.ownerPayout, true)}
</table>
${
  d.reservations.length
    ? `<h3 style="color:#213F6C;margin-top:24px">Réservations (${d.stays})</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
<tr style="color:#515963;text-align:left"><th style="padding:4px 0">Voyageur</th><th>Plateforme</th><th>Séjour</th><th style="text-align:right">Nuits</th><th style="text-align:right">Montant</th></tr>
${d.reservations
  .map(
    (r) =>
      `<tr style="border-top:1px solid #F3F6FA"><td style="padding:6px 0">${esc(r.guest)}</td><td>${esc(r.platform)}</td><td>${esc(formatDay(r.check_in))} → ${esc(formatDay(r.check_out))}</td><td style="text-align:right">${r.nights}</td><td style="text-align:right">${euros(r.gross)}</td></tr>`,
  )
  .join("")}
</table>`
    : ""
}
${
  d.expenses.length
    ? `<h3 style="color:#213F6C;margin-top:24px">Factures et dépenses</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
${d.expenses
  .map(
    (e) =>
      `<tr style="border-top:1px solid #F3F6FA"><td style="padding:6px 0">${esc(formatDay(e.date))}</td><td>${esc(e.label)}<div style="color:#515963;font-size:12px">${esc(e.category)}</div></td><td style="text-align:right">${euros(e.amount, 2)}${e.invoice_url && e.invoice_url.startsWith("http") ? `<div><a href="${esc(e.invoice_url)}" style="color:#213F6C;font-size:12px">Voir la facture</a></div>` : ""}</td></tr>`,
  )
  .join("")}
</table>`
    : ""
}
${
  d.reviewsCount
    ? `<h3 style="color:#213F6C;margin-top:24px">Avis voyageurs</h3><p>${d.reviewsCount} avis ce mois-ci, note moyenne <b>${d.averageRating?.toFixed(2)} / 5</b>.</p>`
    : ""
}
${
  d.incidents.length
    ? `<h3 style="color:#213F6C;margin-top:24px">Interventions</h3><ul style="padding-left:18px">${d.incidents
        .map((i) => `<li>${esc(i.title)} (${i.status === "resolu" ? "résolu" : "en cours"})</li>`)
        .join("")}</ul>`
    : ""
}
<p style="margin-top:24px">Une question sur ce rapport ? Répondez simplement à cet email ou appelez-nous au ${esc(company.phone)}.</p>
<p>${esc(company.name)}</p>
</div></div></body></html>`;
}
