// Prospection des agences immobilières, demandée et autorisée par le gérant de Spinelle
// Conciergerie. Lancée par .github/workflows/prospection.yml.
//
// Étapes à chaque passage :
//   1. Liste des agences (une fois par semaine) : OpenStreetMap, zone par zone.
//   2. Enrichissement : dirigeant (annuaire officiel des entreprises) et e-mail publié sur le
//      site de l'agence, avec un extrait du site pour personnaliser le message.
//   3. Rédaction sur mesure par Claude, contrôlée (longueur, ton, aucun fait inventé).
//   4. Envoi depuis contact@spinelleconciergerie.fr : en mode « validation », seulement les
//      messages validés dans l'intranet ; en mode « auto », les brouillons. Montée en charge
//      progressive, une seule relance, copie dans « Envoyés ».
//   5. Réponses et adresses invalides détectées dans la boîte de réception ; récapitulatif le vendredi.
//
// Variables : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, SMTP_PASSWORD
// (facultatives : SMTP_USER, PROSPECT_MODEL). Sans SMTP_PASSWORD, rien n'est envoyé : la liste et
// les brouillons sont tout de même préparés pour être relus dans l'intranet.

import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://spinelleconciergerie.fr";
const FROM_EMAIL = process.env.SMTP_USER || "contact@spinelleconciergerie.fr";
const FROM_NAME = "Tom Simon – Spinelle Conciergerie";
const MODEL = process.env.PROSPECT_MODEL || "claude-sonnet-5";
const UA = "Mozilla/5.0 (compatible; SpinelleConciergerie/1.0; +https://spinelleconciergerie.fr)";
const RUNS_PER_DAY = 3; // passages programmés par jour ouvré (voir le workflow)
const FOLLOWUP_AFTER_DAYS = 7;
const GIVE_UP_AFTER_DAYS = 14;
const ENRICH_PER_RUN = 120;
const DRAFT_PER_RUN = 40;

const SIGNATURE = `Bien cordialement,

Tom Simon
Fondateur, Spinelle Conciergerie
06 31 93 51 66
contact@spinelleconciergerie.fr
spinelleconciergerie.fr/partenaires`;

// Zones : zone administrative OpenStreetMap ou cercle autour d'un point (rayon en mètres).
const ZONES = {
  paris: { label: "Paris", area: '["name"="Paris"]["admin_level"="8"]' },
  "petite-couronne": {
    label: "petite couronne",
    areas: [
      '["ref:INSEE"="92"]["admin_level"="6"]',
      '["ref:INSEE"="93"]["admin_level"="6"]',
      '["ref:INSEE"="94"]["admin_level"="6"]',
    ],
  },
  versailles: { label: "Versailles", around: [7000, 48.8049, 2.1204] },
  chartres: { label: "Chartres", around: [10000, 48.4469, 1.4892] },
  disney: { label: "secteur de Disneyland Paris", around: [12000, 48.8722, 2.7836] },
  roissy: { label: "secteur de Roissy-Charles-de-Gaulle", around: [12000, 49.0097, 2.5479] },
  bordeaux: { label: "Bordeaux", around: [12000, 44.8378, -0.5792] },
  "cote-azur": {
    label: "Côte d'Azur",
    arounds: [
      [12000, 43.7102, 7.262], // Nice
      [9000, 43.5528, 7.0174], // Cannes
      [8000, 43.5804, 7.1251], // Antibes, Juan-les-Pins
      [8000, 43.7765, 7.4975], // Menton
      [9000, 43.2692, 6.6389], // Saint-Tropez, Ramatuelle, Grimaud
    ],
    season: [1, 2, 3, 4, 5, 6], // biens d'été : à démarcher avant la saison
  },
  ski: {
    label: "stations de ski des Alpes",
    arounds: [
      [12000, 45.9237, 6.8694], // Chamonix
      [8000, 45.8567, 6.6175], // Megève
      [8000, 45.4154, 6.6347], // Courchevel
      [6000, 45.3967, 6.5656], // Méribel
      [8000, 45.4486, 6.9806], // Val d'Isère
      [6000, 45.4685, 6.9055], // Tignes
      [8000, 45.6186, 6.7692], // Les Arcs, Bourg-Saint-Maurice
      [8000, 46.1792, 6.7089], // Morzine, Avoriaz
      [6000, 45.0907, 6.0703], // L'Alpe d'Huez
    ],
    season: [8, 9, 10, 11, 12], // biens d'hiver : à démarcher avant la saison
  },
  "cote-basque-arcachon": {
    label: "côte basque et bassin d'Arcachon",
    arounds: [
      [12000, 43.4832, -1.5586], // Biarritz, Anglet, Bayonne
      [8000, 43.388, -1.663], // Saint-Jean-de-Luz
      [12000, 44.6586, -1.1689], // Arcachon, La Teste
      [10000, 44.6464, -1.2468], // Cap-Ferret
    ],
    season: [1, 2, 3, 4, 5, 6],
  },
};

// Contexte factuel de chaque zone, que le message peut évoquer sans risque d'erreur.
const ZONE_CONTEXT = {
  paris:
    "Paris, première destination touristique mondiale ; location courte durée très encadrée (enregistrement, plafond de 90 nuits pour les résidences principales).",
  "petite-couronne":
    "Proche banlieue de Paris, bien reliée à la capitale, prisée des voyageurs qui veulent loger près de Paris.",
  versailles: "Versailles, son château et ses visiteurs du monde entier.",
  chartres: "Chartres et sa cathédrale, à une heure de Paris.",
  disney:
    "Le secteur de Disneyland Paris (Marne-la-Vallée), qui attire des familles toute l'année.",
  roissy:
    "Le secteur de l'aéroport Roissy-Charles-de-Gaulle : voyageurs d'affaires, escales, salons du parc des expositions de Villepinte.",
  bordeaux: "Bordeaux, son centre historique classé à l'Unesco et ses visiteurs toute l'année.",
  "cote-azur":
    "La Côte d'Azur : clientèle internationale, forte demande l'été, nombreux biens haut de gamme ; Spinelle y intervient avec une équipe locale.",
  ski: "Les stations de ski des Alpes : chalets et appartements très demandés pendant la saison d'hiver ; Spinelle y intervient avec une équipe locale.",
  "cote-basque-arcachon":
    "La côte basque et le bassin d'Arcachon : forte demande l'été et pendant les vacances ; Spinelle y intervient avec une équipe locale.",
};

const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Variable manquante : ${k}`);
  return v;
};
const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];
const note = (s) => {
  console.log(s);
  log.push(s);
};
const norm = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const hostOf = (url) => {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};
const parisNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));

async function fetchText(url, { timeout = 12000, max = 800_000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!/text|json|xml/.test(type)) return null;
    return (await res.text()).slice(0, max);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ------------------------------------------------------------------ 1. Liste des agences

async function overpass(zone) {
  const filters = [
    '["shop"="estate_agent"]',
    '["office"="estate_agent"]',
    '["office"="real_estate_agent"]',
    '["office"="property_management"]', // syndics, administrateurs de biens
    '["office"="financial_advisor"]', // conseillers en investissement, gestion de patrimoine
  ];
  let head = "";
  let scopes = [];
  if (zone.area) {
    head = `area${zone.area}->.z0;`;
    scopes = ["(area.z0)"];
  } else if (zone.areas) {
    head = zone.areas.map((a, i) => `area${a}->.z${i};`).join("");
    scopes = zone.areas.map((_, i) => `(area.z${i})`);
  } else {
    scopes = (zone.arounds || [zone.around]).map(([r, lat, lon]) => `(around:${r},${lat},${lon})`);
  }
  const body = scopes.flatMap((s) => filters.map((f) => `nwr${s}${f};`)).join("");
  const query = `[out:json][timeout:180];${head}(${body});out tags center;`;
  // Serveurs publics souvent saturés : on alterne entre plusieurs, en espaçant les tentatives.
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  for (let attempt = 0; attempt < 8; attempt++) {
    const endpoint = endpoints[attempt % endpoints.length];
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }),
      });
      if (res.ok) {
        const json = await res.json();
        // Un serveur saturé peut répondre « 200 » avec une liste vide et un message d'erreur.
        if (!/error|timed out|out of memory/i.test(json.remark || "")) return json.elements || [];
      }
    } catch {
      /* serveur suivant */
    }
    await sleep(15000 * 2 ** Math.floor(attempt / endpoints.length));
  }
  throw new Error("OpenStreetMap indisponible");
}

function category(t) {
  if (t.office === "property_management") return "syndic ou administrateur de biens";
  if (t.office === "financial_advisor")
    return "conseiller en investissement ou gestion de patrimoine";
  return "agence immobilière";
}

// Banques et assurances sont aussi étiquetées « conseiller financier » : hors cible.
const OFF_TARGET =
  /banque|bank|crédit|credit|assurance|axa|allianz|maaf|macif|matmut|generali|mutuelle|caisse/i;

async function syncAgencies(settings) {
  const { data: existing } = await db.from("prospects").select("source_id");
  const known = new Set((existing || []).map((r) => r.source_id));
  let added = 0;
  let failed = false;
  for (const key of settings.zones) {
    const zone = ZONES[key];
    if (!zone) continue;
    let elements = [];
    try {
      elements = await overpass(zone);
    } catch (e) {
      note(`Zone ${key} : ${e.message} (nouvel essai au prochain passage)`);
      failed = true;
      continue;
    }
    const rows = [];
    for (const el of elements) {
      const t = el.tags || {};
      const id = `osm:${el.type}/${el.id}`;
      if (!t.name || known.has(id)) continue;
      if (t.office === "financial_advisor" && OFF_TARGET.test(`${t.name} ${t.brand || ""}`))
        continue;
      known.add(id);
      rows.push({
        source_id: id,
        name: t.name,
        zone: key,
        address: [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ") || null,
        postcode: t["addr:postcode"] || null,
        city: t["addr:city"] || null,
        website: t.website || t["contact:website"] || t.url || null,
        email: (t.email || t["contact:email"] || "").split(/[;,\s]/)[0] || null,
        phone: t.phone || t["contact:phone"] || null,
        notes: [`Catégorie : ${category(t)}`, t.brand ? `Réseau : ${t.brand}` : null]
          .filter(Boolean)
          .join("\n"),
      });
    }
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await db.from("prospects").insert(rows.slice(i, i + 200));
      if (error) note(`Insertion ${key} : ${error.message}`);
    }
    added += rows.length;
    note(`Zone ${key} : ${elements.length} agences dans OpenStreetMap, ${rows.length} nouvelles`);
    await sleep(3000);
  }
  // Une zone en échec (serveurs saturés) est retentée au passage suivant, pas une semaine plus tard.
  if (!failed) {
    await db
      .from("prospect_settings")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", 1);
  }
  return added;
}

// ------------------------------------------------------------------ 2. Enrichissement

const BAD_EMAIL =
  /(example|exemple|domain|sentry|wixpress|godaddy|noreply|no-reply|nepasrepondre|\.png|\.jpe?g|\.gif|\.webp|\.svg|@2x|u00)/i;
const PREFERRED_LOCAL =
  /^(contact|agence|info|accueil|bonjour|hello|immo|immobilier|gestion|transaction|location)/i;

export function extractEmails(html) {
  const text = html
    .replace(/&#64;|&#x40;|\s*\[\s*(at|arobase)\s*\]\s*|\s*\(\s*(at|arobase)\s*\)\s*/gi, "@")
    .replace(/&#46;|\s*\[\s*(dot|point)\s*\]\s*/gi, ".");
  const found = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
  return [...new Set(found.map((e) => e.toLowerCase().replace(/\.$/, "")))].filter(
    (e) => !BAD_EMAIL.test(e),
  );
}

export function pickEmail(emails, website) {
  const host = website ? hostOf(website) : null;
  const base = host ? host.split(".").slice(-2).join(".") : null;
  const score = (e) =>
    ((base && e.endsWith(`@${base}`)) || (host && e.endsWith(host)) ? 2 : 0) +
    (PREFERRED_LOCAL.test(e) ? 1 : 0);
  return [...emails].sort((a, b) => score(b) - score(a))[0] || null;
}

function excerpt(html) {
  const title = (html.match(/<title[^>]*>([^<]*)/i) || [])[1] || "";
  const desc =
    (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || "";
  const body = html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return `${title}\n${desc}\n${body}`.slice(0, 1800);
}

export async function crawl(website) {
  const root = website.startsWith("http") ? website : `https://${website}`;
  const home = await fetchText(root);
  if (!home) return { emails: [], text: null };
  const emails = new Set(extractEmails(home));
  const host = hostOf(root);
  const links = [...home.matchAll(/href=["']([^"'#]+)["']/gi)]
    .map((m) => {
      try {
        return new URL(m[1], root).href;
      } catch {
        return null;
      }
    })
    .filter(
      (u) =>
        u && hostOf(u) === host && /contact|mention|legal|nous-trouver|agence|qui-sommes/i.test(u),
    );
  // Menus souvent générés en JavaScript : on essaie aussi directement les pages usuelles.
  const usual = ["contact", "nous-contacter", "mentions-legales", "contactez-nous"].map(
    (path) => new URL(`/${path}`, root).href,
  );
  for (const url of [...new Set([...links.slice(0, 3), ...usual])]) {
    if (emails.size) break;
    const page = await fetchText(url, { timeout: 8000 });
    if (page) extractEmails(page).forEach((e) => emails.add(e));
  }
  return { emails: [...emails], text: excerpt(home) };
}

const titleCase = (s) =>
  s.toLowerCase().replace(/(^|[\s-])([a-zà-ÿ])/g, (_, p, c) => p + c.toUpperCase());

export async function lookupCompany(p) {
  if (!p.postcode) return null;
  const url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(p.name)}&code_postal=${p.postcode}&etat_administratif=A&per_page=5`;
  const text = await fetchText(url, { timeout: 15000 });
  await sleep(400); // limite de l'API publique : quelques requêtes par seconde
  if (!text) return null;
  let results = [];
  try {
    results = JSON.parse(text).results || [];
  } catch {
    return null;
  }
  const wanted = norm(p.name);
  const hit = results.find(
    (r) =>
      /^68\.3/.test(r.activite_principale || "") &&
      (norm(r.nom_complet).includes(wanted) ||
        wanted.includes(norm(r.nom_complet)) ||
        (r.matching_etablissements || []).some((e) =>
          (e.liste_enseignes || []).some((n) => norm(n).includes(wanted)),
        )),
  );
  if (!hit) return null;
  // Grands groupes : le dirigeant légal n'est pas le responsable de l'agence, on ne le nomme pas.
  const big = ["GE", "ETI"].includes(hit.categorie_entreprise);
  const person = (hit.dirigeants || []).find(
    (d) => d.type_dirigeant === "personne physique" && d.nom && d.prenoms,
  );
  return {
    siren: hit.siren,
    contact_name:
      !big && person
        ? `${titleCase(person.prenoms.split(/[ ,]/)[0])} ${titleCase(person.nom)}`
        : null,
  };
}

// ------------------------------------------------------------------ 1 bis. Promoteurs et marchands de biens

// Entreprises de l'annuaire officiel (codes d'activité), réparties par département de nos zones.
// Leur site n'y figure pas : on le devine à partir du nom, et on ne le retient que si le numéro
// SIREN de l'entreprise y apparaît (mentions légales obligatoires) — jamais d'homonyme.
const COMPANY_TARGETS = [
  { naf: "41.10A", label: "promoteur immobilier" },
  { naf: "68.10Z", label: "marchand de biens" },
];
const DEPT_ZONE = {
  75: "paris",
  92: "petite-couronne",
  93: "petite-couronne",
  94: "petite-couronne",
  78: "versailles",
  28: "chartres",
  77: "disney",
  95: "roissy",
  33: "bordeaux",
  "06": "cote-azur",
  83: "cote-azur",
  73: "ski",
  74: "ski",
  38: "ski",
  64: "cote-basque-arcachon",
};
const COMPANIES_PER_RUN = 10;

function siteCandidates(company) {
  const raw = company.nom_complet || "";
  const inName = (raw.match(/([a-z0-9-]+\.(?:fr|com|immo|paris))/i) || [])[1];
  const words = (company.siege?.liste_enseignes?.[0] || raw)
    .replace(/\(.*?\)/g, " ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(
      /\b(sas|sasu|sarl|sa|sci|snc|societe|soc|groupe|group|france|immobiliere?|promotion|la|le|les|de|des|et)\b/g,
      " ",
    )
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const bases = [
    words.join(""),
    words.join("-"),
    words[0],
    `${words.join("")}-promotion`,
    `groupe-${words.join("")}`,
  ];
  return [
    ...(inName ? [`https://www.${inName.toLowerCase()}`] : []),
    ...[...new Set(bases.filter((b) => b && b.length >= 3))].flatMap((b) => [
      `https://www.${b}.fr`,
      `https://www.${b}.com`,
    ]),
  ];
}

export async function verifiedSite(company) {
  const siren = company.siren;
  const spaced = siren.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  const has = (html) => html.includes(siren) || html.includes(spaced);
  for (const url of siteCandidates(company)) {
    const home = await fetchText(url, { timeout: 7000 });
    if (!home) continue;
    if (has(home)) return url;
    for (const path of ["mentions-legales", "mentions-legales/", "informations-legales", "legal"]) {
      const page = await fetchText(new URL(`/${path}`, url).href, { timeout: 7000 });
      if (page && has(page)) return url;
    }
  }
  return null;
}

async function syncCompanies(settings) {
  const zones = new Set(settings.zones);
  const depts = Object.entries(DEPT_ZONE).filter(([, z]) => zones.has(z));
  let added = 0;
  let checked = 0;
  for (let i = 0; i < 6 && checked < COMPANIES_PER_RUN; i++) {
    // Un département et une activité tirés au hasard à chaque essai : toute la liste est couverte au fil des jours.
    const [dept, zone] = depts[Math.floor(Math.random() * depts.length)];
    const target = COMPANY_TARGETS[Math.floor(Math.random() * COMPANY_TARGETS.length)];
    const base = `https://recherche-entreprises.api.gouv.fr/search?activite_principale=${target.naf}&departement=${dept}&etat_administratif=A&categorie_entreprise=PME&per_page=25`;
    const first = JSON.parse((await fetchText(base, { timeout: 15000 })) || "{}");
    const pages = Math.min(first.total_pages || 1, 40);
    const page = 1 + Math.floor(Math.random() * pages);
    const list =
      page === 1
        ? first
        : JSON.parse((await fetchText(`${base}&page=${page}`, { timeout: 15000 })) || "{}");
    await sleep(400);
    const ids = (list.results || []).map((c) => `siren:${c.siren}`);
    if (!ids.length) continue;
    const { data: known } = await db.from("prospects").select("source_id").in("source_id", ids);
    const seen = new Set((known || []).map((k) => k.source_id));
    for (const c of list.results) {
      if (checked >= COMPANIES_PER_RUN) break;
      if (seen.has(`siren:${c.siren}`)) continue;
      checked++;
      const site = await verifiedSite(c);
      const row = {
        source_id: `siren:${c.siren}`,
        name: titleCase(c.siege?.liste_enseignes?.[0] || c.nom_complet),
        zone,
        siren: c.siren,
      };
      if (!site) {
        // Retenu quand même (sans e-mail) pour ne pas le revérifier à chaque passage.
        await db.from("prospects").insert({
          ...row,
          status: "sans_email",
          crawled_at: new Date().toISOString(),
          notes: `Catégorie : ${target.label}`,
        });
        continue;
      }
      const { emails, text } = await crawl(site);
      const person = (c.dirigeants || []).find(
        (d) => d.type_dirigeant === "personne physique" && d.nom && d.prenoms,
      );
      await db.from("prospects").insert({
        ...row,
        website: site,
        email: pickEmail(emails, site),
        site_excerpt: text,
        address: c.siege?.adresse || null,
        postcode: c.siege?.code_postal || null,
        city: c.siege?.libelle_commune || null,
        contact_name: person
          ? `${titleCase(person.prenoms.split(/[ ,]/)[0])} ${titleCase(person.nom)}`
          : null,
        crawled_at: new Date().toISOString(),
        status: pickEmail(emails, site) ? "nouveau" : "sans_email",
        notes: `Catégorie : ${target.label}`,
      });
      added++;
    }
  }
  return { checked, added };
}

async function enrich() {
  const { data: rows } = await db
    .from("prospects")
    .select("*")
    .eq("status", "nouveau")
    .is("crawled_at", null)
    .order("email", { ascending: true, nullsFirst: false })
    .order("website", { ascending: true, nullsFirst: false })
    .limit(ENRICH_PER_RUN);
  let withEmail = 0;
  for (const p of rows || []) {
    const update = { crawled_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    if (p.website) {
      const { emails, text } = await crawl(p.website);
      if (!p.email) update.email = pickEmail(emails, p.website);
      if (text) update.site_excerpt = text;
    }
    const company = await lookupCompany(p).catch(() => null);
    if (company) Object.assign(update, company);
    const email = update.email ?? p.email;
    if (!email) update.status = "sans_email";
    else withEmail++;
    await db.from("prospects").update(update).eq("id", p.id);
  }
  return { checked: (rows || []).length, withEmail };
}

// ------------------------------------------------------------------ 3. Rédaction

export function marketFact(p) {
  if (p.zone !== "paris" || !/^750\d\d$/.test(p.postcode || "")) return null;
  try {
    const src = readFileSync("src/content/market-paris.ts", "utf8");
    const json = JSON.parse(src.split("MARKET_PARIS = ")[1].replace(/ as const;\s*$/, ""));
    const n = Number(p.postcode.slice(3));
    const price = json.arrondissements[String(n)]?.buckets?.["1"]?.price;
    if (!price) return null;
    const label = n === 1 ? "1er" : `${n}e`;
    return `Dans le ${label} arrondissement, un logement d'une chambre se loue en médiane ${price} € la nuit, d'après les données du marché que Spinelle suit chaque semaine.`;
  } catch {
    return null;
  }
}

const SYSTEM = `Tu rédiges, pour Tom Simon, fondateur de Spinelle Conciergerie, un premier e-mail de prise de contact avec UN professionnel de l'immobilier précis (agence, syndic ou administrateur de biens, conseiller en investissement, promoteur, marchand de biens), et sa relance. Objectif : obtenir une réponse, en donnant envie de collaborer.

Spinelle Conciergerie : conciergerie de location courte durée (Airbnb, Booking) qui gère tout pour le propriétaire : annonce, voyageurs, ménage hôtelier, linge, maintenance, conformité légale. Elle ne fait ni transaction ni gestion locative classique : le client de l'agence reste le sien. Partenariat proposé : l'agence présente à Spinelle ses propriétaires intéressés par la location courte durée ; Spinelle leur fait un audit gratuit sous 24 h ; l'agence perçoit une commission pour chaque logement confié, selon le logement. Pour une agence de transaction, Spinelle peut aussi fournir gratuitement à ses acheteurs investisseurs une estimation des revenus en location courte durée. Page de présentation : spinelleconciergerie.fr/partenaires

Ton : poli, professionnel, sobre, vouvoiement. Pas de familiarité, pas d'emoji, pas de point d'exclamation, pas de superlatif, pas de jargon marketing, pas de « n'hésitez pas », pas d'invitation à prendre un café ni de visite à l'agence.

Règles du premier e-mail :
- Commence par « Bonjour Prénom Nom, » si un nom de dirigeant est fourni, sinon par « Bonjour, ».
- Une première phrase qui montre que tu connais CETTE agence : un détail réel tiré de l'extrait de son site ou des informations fournies (quartier, spécialité, réseau, type de biens, clientèle). N'invente JAMAIS rien : si l'extrait est vide ou peu clair, reste sur la ville ou le quartier.
- Adapte l'angle à l'agence : transaction → acheteurs investisseurs et estimation gratuite ; gestion locative → propriétaires tentés par la courte durée, commission plutôt que de les voir partir ; prestige → exigence et discrétion ; réseau ou indépendante, selon ce que montre le site.
- Selon la catégorie fournie : agence immobilière → comme ci-dessus ; syndic ou administrateur de biens → copropriétaires et bailleurs qui envisagent la location courte durée, dans le respect du règlement de copropriété ; conseiller en investissement ou gestion de patrimoine → ses clients investisseurs : estimation gratuite des revenus en location courte durée, gestion clé en main, commission pour chaque logement confié ; promoteur immobilier → les acquéreurs investisseurs de ses programmes : une gestion courte durée clé en main et une estimation des revenus sont un argument de commercialisation, commission pour chaque logement confié ; marchand de biens → les biens qu'il rénove : estimation des revenus en location courte durée pour valoriser la revente auprès d'investisseurs, ou gestion des biens qu'il conserve.
- Zones touristiques (côte, montagne) : appuie-toi sur la saison et la clientèle décrites dans le contexte de la zone, sans rien ajouter.
- Présente l'offre en 2 ou 3 phrases, avec la commission « selon le logement » (aucun montant).
- Tu peux utiliser le contexte de la zone et le chiffre de marché fournis, mot pour mot pour le chiffre. Aucun autre chiffre, aucune autre statistique.
- Termine par une question simple, par exemple : « Seriez-vous intéressé par un partenariat ? Je peux vous adresser notre présentation ou en échanger par téléphone. »
- 70 à 120 mots, en paragraphes courts. Pas de formule de politesse finale ni de signature : elles sont ajoutées automatiquement.
- Objet : 60 caractères maximum, précis et naturel, pas commercial, sans majuscules inutiles.

Relance (envoyée 7 jours plus tard en réponse au premier e-mail, sans réponse entre-temps) : 2 ou 3 phrases, même ton, rappelle simplement la proposition et indique qu'il suffit de transférer le contact d'un propriétaire intéressé. Même salutation que le premier e-mail. Pas de reproche, pas d'insistance.

Réponds uniquement au format :
<angle>angle choisi en quelques mots</angle>
<objet>…</objet>
<message>…</message>
<relance>…</relance>`;

export function check(draft, allowedNumbers) {
  const problems = [];
  const all = `${draft.subject}\n${draft.body}\n${draft.followup}`;
  const words = draft.body.split(/\s+/).filter(Boolean).length;
  if (words < 55 || words > 140) problems.push(`le message fait ${words} mots (70 à 120 attendus)`);
  if (draft.subject.length > 70) problems.push("objet trop long");
  if (!/^Bonjour/.test(draft.body) || !/^Bonjour/.test(draft.followup))
    problems.push("doit commencer par « Bonjour »");
  if (/[[\]{}]|!|café|n'hésitez|cordialement|Tom Simon/i.test(all))
    problems.push(
      "formulation interdite (crochets, point d'exclamation, café, « n'hésitez », formule finale ou signature)",
    );
  const numbers = all.match(/\d+/g) || [];
  const extra = numbers.filter((n) => !allowedNumbers.has(n));
  if (extra.length) problems.push(`chiffres non autorisés : ${[...new Set(extra)].join(", ")}`);
  return problems;
}

async function draftOne(ai, p) {
  const fact = marketFact(p);
  const facts = [
    `Agence : ${p.name}`,
    p.notes ? p.notes : null,
    `Zone : ${ZONES[p.zone]?.label ?? p.zone}${p.city ? ` (${p.city})` : ""}${p.postcode ? `, ${p.postcode}` : ""}`,
    p.address ? `Adresse : ${p.address}` : null,
    p.contact_name
      ? `Dirigeant : ${p.contact_name}`
      : "Dirigeant : inconnu (salutation « Bonjour, »)",
    `Contexte de la zone : ${ZONE_CONTEXT[p.zone] ?? ""}`,
    fact ? `Chiffre de marché utilisable : ${fact}` : "Chiffre de marché : aucun (n'en cite aucun)",
    `Extrait du site de l'agence :\n${p.site_excerpt || "(aucun)"}`,
  ]
    .filter(Boolean)
    .join("\n");
  const allowed = new Set([
    "24",
    ...(`${fact || ""} ${p.postcode || ""} ${p.name} ${p.address || ""} ${p.site_excerpt || ""}`.match(
      /\d+/g,
    ) || []),
  ]);
  let feedback = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await ai.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: "user", content: facts + feedback }],
    });
    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const tag = (t) =>
      ((text.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] || "").trim();
    const draft = {
      angle: tag("angle"),
      subject: tag("objet"),
      body: tag("message"),
      followup: tag("relance"),
    };
    if (!draft.subject || !draft.body || !draft.followup) {
      feedback = "\n\nTa réponse précédente ne respectait pas le format demandé.";
      continue;
    }
    const problems = check(draft, allowed);
    if (!problems.length) return draft;
    feedback = `\n\nCorrige ta proposition précédente : ${problems.join(" ; ")}.`;
  }
  return null;
}

async function draftMessages(settings) {
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
  const ai = new Anthropic({
    apiKey: env("ANTHROPIC_API_KEY"),
    ...(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {}),
  });
  // Agences écartées à tort lors d'une erreur technique (clé IA refusée) : remises en file, une fois.
  const { data: stuck } = await db
    .from("prospects")
    .select("id,notes")
    .eq("status", "erreur")
    .is("subject", null)
    .ilike("notes", "%non conforme%")
    .not("notes", "ilike", "%réessai%");
  for (const p of stuck || []) {
    await db
      .from("prospects")
      .update({ status: "nouveau", notes: `${p.notes}\nRéessai après une erreur technique` })
      .eq("id", p.id);
  }
  const { count: pending } = await db
    .from("prospects")
    .select("id", { count: "exact", head: true })
    .in("status", ["brouillon", "valide"]);
  const room = Math.max(0, Math.min(DRAFT_PER_RUN, settings.daily_limit * 2 - (pending || 0)));
  if (!room) return 0;
  const { data: rows } = await db
    .from("prospects")
    .select("*")
    .eq("status", "nouveau")
    .not("email", "is", null)
    .order("zone")
    .limit(room * 4);
  // Saison : les zones dont la haute saison approche passent en premier (ski en automne, côtes au printemps).
  const month = parisNow().getMonth() + 1;
  const priority = (p) =>
    ZONES[p.zone]?.season?.includes(month) ? 0 : ZONES[p.zone]?.season ? 2 : 1;
  rows?.sort((a, b) => priority(a) - priority(b));
  const { data: optouts } = await db.from("prospect_optouts").select("email");
  const blocked = new Set((optouts || []).map((o) => o.email));
  const { data: used } = await db
    .from("prospects")
    .select("email,website,phone,siren")
    .not("status", "in", "(nouveau,sans_email)");
  const seen = { email: new Set(), host: new Set(), phone: new Set(), siren: new Set() };
  for (const u of used || []) {
    if (u.email) seen.email.add(u.email.toLowerCase());
    if (u.website) seen.host.add(hostOf(u.website));
    if (u.phone) seen.phone.add(u.phone.replace(/\D/g, "").slice(-9));
    if (u.siren) seen.siren.add(u.siren);
  }
  let drafted = 0;
  for (const p of rows || []) {
    if (drafted >= room) break;
    const email = p.email.toLowerCase();
    const host = p.website ? hostOf(p.website) : null;
    const phone = p.phone ? p.phone.replace(/\D/g, "").slice(-9) : null;
    // Une agence = un seul contact, même si elle apparaît sous plusieurs noms ou adresses.
    const duplicate =
      blocked.has(email) ||
      seen.email.has(email) ||
      (host && seen.host.has(host)) ||
      (phone && seen.phone.has(phone)) ||
      (p.siren && seen.siren.has(p.siren));
    if (duplicate) {
      await db
        .from("prospects")
        .update({
          status: "ignore",
          notes: [p.notes, "Doublon d'une agence déjà prévue ou contactée"]
            .filter(Boolean)
            .join("\n"),
        })
        .eq("id", p.id);
      continue;
    }
    seen.email.add(email);
    if (host) seen.host.add(host);
    if (phone) seen.phone.add(phone);
    if (p.siren) seen.siren.add(p.siren);
    let draft;
    try {
      draft = await draftOne(ai, p);
    } catch (e) {
      // Erreur technique (clé, quota, service) : l'agence reste en file pour le prochain passage.
      note(`Rédaction interrompue (${p.name}) : ${e.message}`);
      if ([400, 401, 403, 429].includes(e.status)) break;
      continue;
    }
    if (!draft) {
      await db
        .from("prospects")
        .update({
          status: "erreur",
          notes: [p.notes, "Message non conforme après deux essais : à rédiger à la main"]
            .filter(Boolean)
            .join("\n"),
        })
        .eq("id", p.id);
      continue;
    }
    await db
      .from("prospects")
      .update({
        status: "brouillon",
        subject: draft.subject,
        body: draft.body,
        followup_subject: `Re: ${draft.subject}`,
        followup_body: draft.followup,
        angle: draft.angle,
        drafted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id);
    drafted++;
    // Deux exemples complets par passage dans le journal, pour contrôler la qualité.
    if (drafted <= 2) note(`Exemple (${p.name}) :\nObjet : ${draft.subject}\n${draft.body}`);
  }
  return drafted;
}

// ------------------------------------------------------------------ 4. Envoi

function compose(p, followup) {
  const unsubscribe = `${SITE}/desinscription?t=${p.unsubscribe_token}`;
  const text = `${followup ? p.followup_body : p.body}\n\n${SIGNATURE}\n\n—\nVos coordonnées proviennent du site internet de votre agence. Pour ne plus recevoir de message de Spinelle Conciergerie : ${unsubscribe}`;
  const html = text
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p style="margin:0 0 14px">${para.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`,
    )
    .join("")
    .replace(unsubscribe, `<a href="${unsubscribe}">${unsubscribe}</a>`);
  return {
    from: { name: FROM_NAME, address: FROM_EMAIL },
    to: p.email,
    replyTo: FROM_EMAIL,
    subject: followup ? p.followup_subject : p.subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#1a1a1a">${html}</div>`,
    headers: {
      "List-Unsubscribe": `<${SITE}/api/desinscription?t=${p.unsubscribe_token}>, <mailto:${FROM_EMAIL}?subject=desinscription>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    ...(followup && p.message_id ? { inReplyTo: p.message_id, references: [p.message_id] } : {}),
  };
}

async function mailbox() {
  const nodemailer = (await import("nodemailer")).default;
  const MailComposer = (await import("nodemailer/lib/mail-composer/index.js")).default;
  const { ImapFlow } = await import("imapflow");
  const auth = { user: FROM_EMAIL, pass: process.env.SMTP_PASSWORD };
  const smtp = nodemailer.createTransport({ host: "smtp.ionos.fr", port: 465, secure: true, auth });
  const imap = new ImapFlow({
    host: "imap.ionos.fr",
    port: 993,
    secure: true,
    auth,
    logger: false,
  });
  await imap.connect();
  const boxes = await imap.list();
  const sent = boxes.find((b) => b.specialUse === "\\Sent")?.path;
  return {
    imap,
    async send(message) {
      const raw = await new MailComposer(message).compile().build();
      const info = await smtp.sendMail({ envelope: { from: FROM_EMAIL, to: [message.to] }, raw });
      if (sent) await imap.append(sent, raw, ["\\Seen"]).catch(() => {});
      return (raw.toString().match(/^Message-ID:\s*(<[^>]+>)/im) || [])[1] || info.messageId;
    },
    async close() {
      await imap.logout().catch(() => {});
      smtp.close();
    },
  };
}

async function sentToday() {
  const start = parisNow();
  start.setHours(0, 0, 0, 0);
  const offset = Date.now() - parisNow().getTime();
  const { count } = await db
    .from("prospects")
    .select("id", { count: "exact", head: true })
    .gte("last_contact_at", new Date(start.getTime() + offset).toISOString());
  return count || 0;
}

function allowanceToday(settings) {
  // Montée en charge progressive pour préserver la réputation de l'adresse d'envoi.
  if (!settings.first_send_at) return Math.min(20, settings.daily_limit);
  const days = Math.floor((Date.now() - new Date(settings.first_send_at).getTime()) / 86_400_000);
  const ramp = days < 7 ? 20 : 20 + (days - 6) * 10;
  return Math.min(settings.daily_limit, ramp);
}

// Envois uniquement aux heures de bureau, du lundi au samedi (heure de Paris), même lors d'un
// lancement manuel : un e-mail professionnel reçu le soir ou le dimanche fait mauvaise impression.
function officeHours() {
  const now = parisNow();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (
    now.getDay() >= 1 && now.getDay() <= 6 && minutes >= 8 * 60 + 30 && minutes <= 18 * 60 + 30
  );
}

async function sendBatch(settings, box) {
  if (!officeHours()) {
    note("Hors heures de bureau (lundi-samedi, 8 h 30 - 18 h 30) : aucun envoi.");
    return { sent: 0, followups: 0 };
  }
  const hour = parisNow().getHours();
  const runsLeft = Math.max(1, RUNS_PER_DAY - (hour >= 14 ? 2 : hour >= 11 ? 1 : 0));
  const remaining = Math.max(0, allowanceToday(settings) - (await sentToday()));
  let budget = Math.ceil(remaining / runsLeft);
  let sent = 0;
  let followups = 0;
  const { data: optouts } = await db.from("prospect_optouts").select("email");
  const blocked = new Set((optouts || []).map((o) => o.email));
  const now = () => new Date().toISOString();

  // Relances d'abord : une seule, 7 jours après, sans réponse entre-temps.
  const before = new Date(Date.now() - FOLLOWUP_AFTER_DAYS * 86_400_000).toISOString();
  const { data: due } = await db
    .from("prospects")
    .select("*")
    .eq("status", "contacte")
    .eq("followups", 0)
    .lt("last_contact_at", before)
    .limit(budget);
  for (const p of due || []) {
    if (budget <= 0) break;
    if (blocked.has(p.email.toLowerCase())) continue;
    try {
      await box.send(compose(p, true));
      await db
        .from("prospects")
        .update({ status: "relance", followups: 1, last_contact_at: now(), updated_at: now() })
        .eq("id", p.id);
      followups++;
      budget--;
      await sleep(8000 + Math.random() * 7000);
    } catch (e) {
      note(`Relance ${p.name} : ${e.message}`);
    }
  }

  const statuses = settings.mode === "auto" ? ["valide", "brouillon"] : ["valide"];
  const { data: ready } = await db
    .from("prospects")
    .select("*")
    .in("status", statuses)
    .order("status", { ascending: false }) // les messages validés passent en premier
    .limit(Math.max(0, budget));
  for (const p of ready || []) {
    if (budget <= 0) break;
    if (blocked.has(p.email.toLowerCase())) {
      await db.from("prospects").update({ status: "desinscrit" }).eq("id", p.id);
      continue;
    }
    try {
      const messageId = await box.send(compose(p, false));
      await db
        .from("prospects")
        .update({
          status: "contacte",
          message_id: messageId,
          first_contact_at: now(),
          last_contact_at: now(),
          updated_at: now(),
        })
        .eq("id", p.id);
      if (!settings.first_send_at) {
        settings.first_send_at = now();
        await db
          .from("prospect_settings")
          .update({ first_send_at: settings.first_send_at })
          .eq("id", 1);
      }
      sent++;
      budget--;
      await sleep(8000 + Math.random() * 7000);
    } catch (e) {
      note(`Envoi ${p.name} : ${e.message}`);
      await db
        .from("prospects")
        .update({
          status: "erreur",
          notes: [p.notes, `Envoi impossible : ${e.message}`].filter(Boolean).join("\n"),
        })
        .eq("id", p.id);
    }
  }

  // Sans réponse 14 jours après la relance : on n'insiste plus jamais.
  const giveUp = new Date(Date.now() - GIVE_UP_AFTER_DAYS * 86_400_000).toISOString();
  await db
    .from("prospects")
    .update({ status: "sans_reponse", updated_at: now() })
    .eq("status", "relance")
    .lt("last_contact_at", giveUp);
  return { sent, followups };
}

// ------------------------------------------------------------------ 5. Réponses et récapitulatif

const WEBMAIL = /gmail|hotmail|outlook|yahoo|orange|free|sfr|laposte|wanadoo|icloud|live|bbox|neuf/;

async function checkReplies(box) {
  const { data: contacted } = await db
    .from("prospects")
    .select("id,email,status")
    .in("status", ["contacte", "relance", "sans_reponse"]);
  const byEmail = new Map();
  const byHost = new Map();
  for (const p of contacted || []) {
    if (!p.email) continue;
    byEmail.set(p.email.toLowerCase(), p);
    const h = p.email.split("@")[1];
    if (h && !WEBMAIL.test(h)) byHost.set(h, p);
  }
  let replies = 0;
  let bounces = 0;
  const lock = await box.imap.getMailboxLock("INBOX");
  try {
    const since = new Date(Date.now() - 21 * 86_400_000);
    for await (const msg of box.imap.fetch({ since }, { envelope: true, source: true })) {
      const from = (msg.envelope?.from?.[0]?.address || "").toLowerCase();
      if (/mailer-daemon|postmaster/.test(from)) {
        const body = (msg.source?.toString() || "").toLowerCase();
        for (const [email, p] of byEmail) {
          if (body.includes(email)) {
            await db
              .from("prospects")
              .update({ status: "erreur", notes: "Adresse e-mail invalide (message non remis)" })
              .eq("id", p.id);
            byEmail.delete(email);
            bounces++;
          }
        }
        continue;
      }
      const p = byEmail.get(from) || byHost.get(from.split("@")[1]);
      if (p && p.status !== "repondu") {
        await db
          .from("prospects")
          .update({
            status: "repondu",
            replied_at: new Date(msg.envelope?.date || Date.now()).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", p.id);
        p.status = "repondu";
        replies++;
      }
    }
  } finally {
    lock.release();
  }
  return { replies, bounces };
}

async function weeklySummary(settings, box) {
  const now = parisNow();
  // Le samedi, au dernier passage de la semaine (vers 15 h, 14 h en hiver).
  if (now.getDay() !== 6 || now.getHours() < 14) return;
  if (
    settings.last_summary_at &&
    Date.now() - new Date(settings.last_summary_at).getTime() < 5 * 86_400_000
  )
    return;
  const week = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const count = async (q) => (await q).count || 0;
  const base = () => db.from("prospects").select("id", { count: "exact", head: true });
  const contacted = await count(base().gte("first_contact_at", week));
  const followed = await count(base().eq("followups", 1).gte("last_contact_at", week));
  const replied = await count(base().gte("replied_at", week));
  const unsub = await count(base().eq("status", "desinscrit").gte("updated_at", week));
  const waiting = await count(base().eq("status", "brouillon"));
  // À appeler : ce qui signe le plus, c'est un appel après l'e-mail.
  const { data: answered } = await db
    .from("prospects")
    .select("name,phone,email,zone,contact_name")
    .eq("status", "repondu")
    .gte("replied_at", week);
  const { data: toCall } = await db
    .from("prospects")
    .select("name,phone,email,zone,contact_name")
    .in("status", ["relance", "sans_reponse"])
    .not("phone", "is", null)
    .order("last_contact_at", { ascending: false })
    .limit(15);
  const line = (p) =>
    `- ${p.name}${p.contact_name ? ` (${p.contact_name})` : ""}, ${ZONES[p.zone]?.label ?? p.zone} : ${p.phone ?? p.email}`;
  const callList = [
    answered?.length
      ? `\nOnt répondu cette semaine, à rappeler en priorité :\n${answered.map(line).join("\n")}\n`
      : "",
    toCall?.length
      ? `\nSans réponse après la relance, à appeler :\n${toCall.map(line).join("\n")}\n`
      : "",
  ].join("");
  const text = `Récapitulatif de la prospection de la semaine :

- Agences contactées : ${contacted}
- Relances : ${followed}
- Réponses reçues : ${replied}
- Désinscriptions : ${unsub}
- Messages en attente de validation : ${waiting}
${callList}
Le détail de chaque agence et de chaque message : ${SITE}/gestion/prospection`;
  await box.send({
    from: { name: "Prospection Spinelle", address: FROM_EMAIL },
    to: FROM_EMAIL,
    subject: "Prospection : récapitulatif de la semaine",
    text,
  });
  await db
    .from("prospect_settings")
    .update({ last_summary_at: new Date().toISOString() })
    .eq("id", 1);
}

// ------------------------------------------------------------------ Passage

const allZones = (settings) => [...new Set([...(settings.zones || []), ...Object.keys(ZONES)])];

async function main() {
  const { data: settings, error } = await db
    .from("prospect_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !settings) throw new Error(`Réglages introuvables : ${error?.message}`);
  if (settings.paused) {
    note("Prospection en pause.");
  } else {
    const weekAgo = Date.now() - 7 * 86_400_000;
    // Zones encore vides (serveurs saturés lors d'un passage précédent) : rechargées tout de suite.
    const empty = [];
    settings.zones = allZones(settings);
    for (const zone of settings.zones) {
      const { count } = await db
        .from("prospects")
        .select("id", { count: "exact", head: true })
        .eq("zone", zone);
      if (!count) empty.push(zone);
    }
    if (!settings.last_sync_at || new Date(settings.last_sync_at).getTime() < weekAgo) {
      note(`Liste mise à jour : ${await syncAgencies(settings)} nouvelles agences`);
    } else if (empty.length) {
      note(
        `Zones à charger (${empty.join(", ")}) : ${await syncAgencies({ ...settings, zones: empty })} nouvelles agences`,
      );
    }
    const companies = await syncCompanies(settings).catch((e) => {
      note(`Promoteurs et marchands de biens : ${e.message}`);
      return { checked: 0, added: 0 };
    });
    note(
      `Promoteurs et marchands de biens : ${companies.checked} vérifiés, ${companies.added} avec site confirmé`,
    );
    const enriched = await enrich();
    note(`Sites analysés : ${enriched.checked}, e-mail trouvé : ${enriched.withEmail}`);
    if (process.env.ANTHROPIC_API_KEY) note(`Messages rédigés : ${await draftMessages(settings)}`);
    else note("ANTHROPIC_API_KEY absente : pas de rédaction.");
  }
  if (process.env.SMTP_PASSWORD) {
    const box = await mailbox();
    try {
      const r = await checkReplies(box);
      note(`Réponses détectées : ${r.replies}, adresses invalides : ${r.bounces}`);
      if (!settings.paused) {
        const s = await sendBatch(settings, box);
        note(
          `Envoyés : ${s.sent} premiers messages, ${s.followups} relances (mode ${settings.mode})`,
        );
      }
      await weeklySummary(settings, box);
    } finally {
      await box.close();
    }
  } else {
    note("SMTP_PASSWORD absent : aucun envoi (les brouillons restent visibles dans l'intranet).");
  }
  await db
    .from("prospect_settings")
    .update({
      last_run_at: new Date().toISOString(),
      last_run_summary: log.join("\n").slice(0, 4000),
    })
    .eq("id", 1);
}

// Lancement direct uniquement (le module peut être importé pour les tests).
if (import.meta.url === `file://${process.argv[1]}`)
  main().catch(async (e) => {
    console.error(e);
    await db
      .from("prospect_settings")
      .update({
        last_run_at: new Date().toISOString(),
        last_run_summary: `Erreur : ${e.message}\n${log.join("\n")}`.slice(0, 4000),
      })
      .eq("id", 1);
    process.exit(1);
  });
