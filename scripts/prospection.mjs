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

import { resolveMx } from "node:dns/promises";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://spinelleconciergerie.fr";
const FROM_EMAIL = process.env.SMTP_USER || "contact@spinelleconciergerie.fr";
const FROM_NAME = "Tom Simon – Spinelle Conciergerie";
// Coût visé : environ un centime par message (rédaction Sonnet, relecture Haiku, réflexion réduite).
// Rédaction en deux temps, pour une très bonne qualité à environ un centime par message :
// le modèle rapide écrit trois versions (et les réécrit si besoin), le modèle haut de gamme
// retouche une seule fois la meilleure à partir de l'avis du relecteur.
const MODEL = process.env.PROSPECT_DRAFT_MODEL || "claude-haiku-5-5";
const POLISH_MODEL = process.env.PROSPECT_MODEL || "claude-sonnet-5-5";
const JUDGE_MODEL = process.env.PROSPECT_JUDGE_MODEL || "claude-haiku-5-5";
const UA = "Mozilla/5.0 (compatible; SpinelleConciergerie/1.0; +https://spinelleconciergerie.fr)";
// Passages : un passage d'envoi léger toutes les heures (envois étalés sur la journée, réponses
// relevées vite, et un passage sauté par GitHub ne bloque plus rien), plus trois passages complets
// par jour qui préparent les messages suivants. PROSPECT_MODE=envoi pour un passage léger.
const SEND_ONLY = process.env.PROSPECT_MODE === "envoi";
// Test de connexion à la boîte d'envoi, sans rien envoyer ni modifier (PROSPECT_MODE=test).
const CONNECTION_TEST = process.env.PROSPECT_MODE === "test";
const RAMP_SINCE = "2026-10-26T00:00:00+01:00";
const LAST_SEND_HOUR = 18; // dernier passage d'envoi vers 18 h (heure de Paris)
const FOLLOWUP_AFTER_DAYS = 7;
const FOLLOWUPS_PER_RUN = 30; // relances par passage, en plus des nouveaux contacts
const GIVE_UP_AFTER_DAYS = 14;
const ENRICH_PER_RUN = 200;
const DRAFT_PER_RUN = 40;

// Durée d'un passage : GitHub l'arrête à 45 minutes ; on s'arrête proprement avant.
const RUN_START = Date.now();
const timeLeft = () => RUN_START + 38 * 60_000 - Date.now();
const MINUTES = 60_000;

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
  paris: "Paris, où les voyageurs viennent du monde entier toute l'année.",
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
// La base renvoie au plus 1 000 lignes par requête : lecture page par page.
async function selectAll(build) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build().range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < 1000) return rows;
  }
}
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

// Délai maximal pour une étape réseau : certains sites laissent la connexion pendue, ce qui
// arrêtait le passage sans message. Passé le délai, l'étape est simplement abandonnée.
const withTimeout = (promise, ms, fallback) => {
  let timer;
  return Promise.race([
    promise,
    new Promise((resolve) => (timer = setTimeout(() => resolve(fallback), ms))),
  ]).finally(() => clearTimeout(timer));
};

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
  for (let attempt = 0; attempt < 5; attempt++) {
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
  const existing = await selectAll(() => db.from("prospects").select("source_id"));
  const known = new Set(existing.map((r) => r.source_id));
  let added = 0;
  let failed = false;
  for (const key of settings.zones) {
    const zone = ZONES[key];
    if (!zone) continue;
    if (timeLeft() < 15 * MINUTES) {
      note(`Zone ${key} : reportée au prochain passage (temps du passage)`);
      failed = true;
      continue;
    }
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
      // Une agence présente dans deux zones (ex. Roissy et Seine-Saint-Denis) n'est enregistrée qu'une fois.
      const { error } = await db
        .from("prospects")
        .upsert(rows.slice(i, i + 200), { onConflict: "source_id", ignoreDuplicates: true });
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

// Adresses de fournisseur d'accès internet (Orange, Free, SFR, Bbox, La Poste…) : souvent
// fermées quand l'agence change d'opérateur mais restées affichées sur son site, elles reviennent
// « non remis » et abîment la réputation de la boîte d'envoi. On passe alors au formulaire du site
// ou à l'appel. Les messageries courantes (Gmail, Outlook…) restent acceptées.
const ISP_MAIL =
  /@(orange|wanadoo|free|sfr|neuf|bbox|laposte|aol|club-internet|numericable|cegetel|noos|alice|aliceadsl|libertysurf|9online|9business|voila|tele2)\.(fr|net|com)$/i;

const BAD_EMAIL =
  /(example|exemple|domain|sentry|wixpress|godaddy|noreply|no-reply|nepasrepondre|\.png|\.jpe?g|\.gif|\.webp|\.svg|@2x|u00)/i;
const PREFERRED_LOCAL =
  /^(contact|agence|info|accueil|bonjour|hello|immo|immobilier|gestion|transaction|location)/i;

export function extractEmails(html) {
  const text = html
    // Liens « mailto: » encodés (« %20contact@… », « %40 ») : décodés avant lecture.
    .replace(/%([0-9a-f]{2})/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#64;|&#x40;|\s*\[\s*(at|arobase)\s*\]\s*|\s*\(\s*(at|arobase)\s*\)\s*/gi, "@")
    .replace(/&#46;|\s*\[\s*(dot|point)\s*\]\s*/gi, ".");
  const found = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
  return [...new Set(found.map((e) => e.toLowerCase().replace(/\.$/, "")))].filter(
    (e) => !BAD_EMAIL.test(e),
  );
}

export function pickEmail(emails, website) {
  emails = [...emails].filter((e) => !ISP_MAIL.test(e));
  const host = website ? hostOf(website) : null;
  const base = host ? host.split(".").slice(-2).join(".") : null;
  const score = (e) =>
    ((base && e.endsWith(`@${base}`)) || (host && e.endsWith(host)) ? 2 : 0) +
    (PREFERRED_LOCAL.test(e) ? 1 : 0);
  return [...emails].sort((a, b) => score(b) - score(a))[0] || null;
}

function excerpt(html) {
  const clean = (t) =>
    t
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#39;|&rsquo;|&#8217;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  const body = html.replace(
    /<(script|style|noscript|svg|nav|header|footer|form)[\s\S]*?<\/\1>/gi,
    " ",
  );
  const title = clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const desc =
    (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || "";
  const headings = [...body.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((m) => clean(m[1]))
    .filter((t) => t.length > 3);
  // Les paragraphes qui présentent l'agence (histoire, équipe, spécialité, secteur) passent en premier.
  const paragraphs = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => clean(m[1]))
    .filter(
      (t) =>
        t.length > 60 &&
        !/cookie|en continuant|consentement|données personnelles|javascript/i.test(t),
    );
  const about = paragraphs.filter((t) =>
    /depuis|fond|équipe|famil|spécialis|expert|quartier|secteur|notre agence|nous accompagn|indépendant|réseau|prestige|luxe|gestion|location|vente/i.test(
      t,
    ),
  );
  return [
    `Titre : ${title}`,
    desc && `Description : ${clean(desc)}`,
    headings.length && `Titres : ${[...new Set(headings)].slice(0, 8).join(" · ")}`,
    (about.length ? about : paragraphs).slice(0, 4).join("\n"),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 2000);
}

// Tests anti-robot visibles (case à cocher, puzzle) : le formulaire est alors laissé de côté.
const CAPTCHA =
  /class=["'][^"']*g-recaptcha|h-captcha|hcaptcha\.com|cf-turnstile|challenges\.cloudflare\.com\/turnstile|frc-captcha|name=["'][^"']*captcha/i;

export async function crawl(website) {
  const root = website.startsWith("http") ? website : `https://${website}`;
  const home = await fetchText(root);
  if (!home) return { emails: [], text: null };
  const emails = new Set(extractEmails(home));
  const host = hostOf(root);
  const internal = [...home.matchAll(/href=["']([^"'#]+)["']/gi)]
    .map((m) => {
      try {
        return new URL(m[1], root).href;
      } catch {
        return null;
      }
    })
    .filter((u) => u && hostOf(u) === host);
  const links = internal.filter((u) => /contact|mention|legal|nous-trouver|agence|qui-sommes/i.test(u));
  // Menus souvent générés en JavaScript : on essaie aussi directement les pages usuelles.
  const usual = ["contact", "nous-contacter", "mentions-legales", "contactez-nous"].map(
    (path) => new URL(`/${path}`, root).href,
  );
  // Formulaire de contact (repli quand aucune adresse n'est publiée) : page avec un champ de
  // message ; on note s'il est protégé par un test anti-robot (jamais contourné).
  let form = null;
  const lookForm = (url, html) => {
    if (form && !/contact/i.test(url)) return;
    const blocks = html.match(/<form[\s\S]*?<\/form>/gi) || [];
    if (!blocks.some((b) => /<textarea/i.test(b))) return;
    if (form && /contact/i.test(form.url)) return;
    form = { url, captcha: CAPTCHA.test(html) };
  };
  lookForm(root, home);
  for (const url of [...new Set([...links.slice(0, 3), ...usual])]) {
    if (emails.size) break;
    const page = await fetchText(url, { timeout: 8000 });
    if (page) {
      extractEmails(page).forEach((e) => emails.add(e));
      lookForm(url, page);
    }
  }
  // Page de présentation (histoire, équipe, spécialité) : c'est elle qui permet une accroche
  // vraiment personnelle, au lieu d'un message qui ne parle que de la ville.
  const aboutUrl = internal.find((u) =>
    /qui-sommes|a-propos|about|notre-agence|l-agence|notre-equipe|equipe|presentation|histoire|valeurs/i.test(u),
  );
  let text = excerpt(home);
  const about = aboutUrl && (await fetchText(aboutUrl, { timeout: 8000 }));
  if (about) {
    const more = excerpt(about).split("\n").filter((l) => !/^(Titre|Description) :/.test(l));
    if (more.length) text = `${text}\nPage de présentation :\n${more.join("\n")}`.slice(0, 3000);
  }
  return { emails: [...emails], text, form };
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
  { naf: "68.32A", label: "syndic ou administrateur de biens" },
  // Conseillers en gestion de patrimoine : code d'activité large, on ne garde que les noms explicites.
  {
    naf: "66.19B",
    label: "conseiller en investissement ou gestion de patrimoine",
    name: /patrimoin|gestion priv|wealth|invest/i,
  },
  {
    naf: "70.22Z",
    label: "conseiller en investissement ou gestion de patrimoine",
    name: /patrimoin|gestion priv|wealth/i,
  },
  // Sociétés d'investissement immobilier (foncières, investisseurs, gérants de fonds immobiliers) :
  // codes d'activité larges, seuls les noms qui le disent clairement sont retenus.
  {
    naf: "68.20B",
    label: "société d'investissement immobilier",
    name: /fonci[eè]re|invest|patrimoine|real estate|asset/i,
  },
  {
    naf: "66.30Z",
    label: "société d'investissement immobilier",
    name: /immobili|real estate|pierre|scpi|fonci[eè]re|property/i,
  },
  {
    naf: "64.20Z",
    label: "société d'investissement immobilier",
    name: /immobili|fonci[eè]re|real estate|property/i,
  },
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
const COMPANIES_PER_RUN = 30;

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
  const names = [company.siege?.liste_enseignes?.[0], company.nom_raison_sociale, company.nom_complet]
    .filter(Boolean)
    .map((n) => n.replace(/\(.*?\)/g, " "));
  const urls = [...new Set([...siteCandidates(company), ...names.flatMap(agencyCandidates)])];
  for (const url of urls) {
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
      if (checked >= COMPANIES_PER_RUN || timeLeft() < 12 * MINUTES) break;
      if (seen.has(`siren:${c.siren}`)) continue;
      if (target.name && !target.name.test(`${c.nom_complet} ${c.siege?.liste_enseignes?.[0] ?? ""}`))
        continue;
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

// Cas « à vérifier » traités automatiquement, pour ne rien laisser en attente :
//   - message non conforme : nouvelle rédaction au passage suivant, puis contact écarté si échec ;
//   - adresse invalide : autre adresse cherchée sur le site, sinon contact écarté ;
//   - erreur d'envoi passagère : nouvel essai, jusqu'à 3 fois.
const CLEAN_DRAFT = {
  subject: null,
  body: null,
  followup_subject: null,
  followup_body: null,
  angle: null,
  drafted_at: null,
  message_id: null,
};

async function resolveErrors() {
  const rows = await selectAll(() => db.from("prospects").select("*").eq("status", "erreur"));
  const add = (p, line) => [p.notes, line].filter(Boolean).join("\n");
  let retried = 0;
  let dropped = 0;
  for (const p of rows || []) {
    const notes = p.notes || "";
    let update;
    if (/non conforme/i.test(notes)) {
      if (/Réessai de rédaction/.test(notes))
        update = { status: "ignore", notes: add(p, "Écarté : message toujours non conforme") };
      else
        update = { status: "nouveau", ...CLEAN_DRAFT, notes: add(p, "Réessai de rédaction") };
    } else if (/Adresse e-mail invalide/i.test(notes)) {
      const tried = new Set([
        p.email,
        ...[...notes.matchAll(/Nouvelle adresse essayée : (\S+)/g)].map((m) => m[1]),
      ]);
      let next = null;
      if (p.website && tried.size < 3) {
        const { emails } = await crawl(p.website);
        next =
          emails
            .filter((e) => !tried.has(e) && !ISP_MAIL.test(e))
            .sort(
              (a, b) => (PREFERRED_LOCAL.test(b) ? 1 : 0) - (PREFERRED_LOCAL.test(a) ? 1 : 0),
            )[0] || null;
      }
      update = next
        ? {
            status: "nouveau",
            email: next,
            ...CLEAN_DRAFT,
            notes: add(p, `Nouvelle adresse essayée : ${next}`),
          }
        : { status: "ignore", notes: add(p, "Écarté : aucune adresse e-mail valide trouvée") };
    } else if (/Envoi impossible/i.test(notes)) {
      const attempts = (notes.match(/Envoi impossible/g) || []).length;
      update =
        attempts >= 3
          ? { status: "ignore", notes: add(p, "Écarté : envoi impossible après trois essais") }
          : { status: "brouillon" };
    }
    if (!update) continue;
    await db
      .from("prospects")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", p.id);
    if (update.status === "ignore") dropped++;
    else retried++;
  }
  return { retried, dropped };
}

// Agences sans site connu (la majorité dans OpenStreetMap) : on devine l'adresse du site à partir
// du nom, et on ne la garde que si le site prouve qu'il s'agit bien de la même agence (même
// téléphone, même SIREN, ou même rue et code postal). Sans preuve, rien n'est retenu.
const flat = (s) => norm(s).replace(/[^a-z0-9]/g, "");
const phoneKeys = (html) =>
  new Set(
    [...html.matchAll(/(?:\+33\s*\(?0?\)?|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g)].map((m) =>
      m[0].replace(/\D/g, "").slice(-9),
    ),
  );
function agencyCandidates(name) {
  const words = norm(name)
    .replace(/[&'’.]/g, " ")
    .replace(/\b(sas|sasu|sarl|sa|la|le|les|de|des|du|et|l|d)\b/g, " ")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const core = words.filter((w) => !/^(immobilier|immobiliere|immo|agence|cabinet)$/.test(w));
  const c = core.join("");
  const bases = [
    words.join(""),
    words.join("-"),
    c,
    core.join("-"),
    `${c}-immobilier`,
    `${c}immobilier`,
    `${c}-immo`,
    `${c}immo`,
    `agence-${c}`,
    `agence${c}`,
  ];
  return [...new Set(bases.filter((b) => b.length >= 4))].flatMap((b) => [
    `https://www.${b}.fr`,
    `https://www.${b}.com`,
  ]);
}
export async function findSite(p) {
  const key = flat(p.name || "");
  if (key.length < 4) return null;
  const phone = (p.phone || "").replace(/\D/g, "").slice(-9);
  const siren = p.siren;
  const street = norm(p.address || "")
    .split(/[^a-z]+/)
    .filter((w) => w.length > 3 && !/^(rue|avenue|boulevard|place|quai|allee|chemin|route|impasse|square)$/.test(w))
    .pop();
  const proofs = (html) =>
    (phone.length === 9 && phoneKeys(html).has(phone)) ||
    (siren && (html.includes(siren) || html.includes(siren.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")))) ||
    (street && p.postcode && norm(html).includes(street) && html.includes(p.postcode));
  // Sans téléphone, SIREN ni adresse : on accepte un nom distinctif (au moins six lettres) présent
  // sur un site d'agence immobilière qui cite la même ville.
  const weak = phone.length !== 9 && !siren && !(street && p.postcode);
  const city = norm(
    p.city || { paris: "paris", versailles: "versailles", chartres: "chartres", bordeaux: "bordeaux" }[p.zone] || "",
  );
  if (weak && (key.length < 6 || !city)) return null;
  for (const url of agencyCandidates(p.name)) {
    const home = await fetchText(url, { timeout: 6000 });
    if (!home || !flat(home).includes(key)) continue;
    if (weak) {
      const text = norm(home);
      if (text.includes(city) && /immobili|agence|transaction|gestion locative/.test(text)) return url;
      continue;
    }
    if (proofs(home)) return url;
    for (const path of ["contact", "nous-contacter", "mentions-legales", "agence"]) {
      const page = await fetchText(new URL(`/${path}`, url).href, { timeout: 6000 });
      if (page && proofs(page)) return url;
    }
  }
  return null;
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
  const queue = [...(rows || [])];
  let checked = 0;
  let withEmail = 0;
  let found = 0;
  let forms = 0;
  const worker = async () => {
    while (queue.length && timeLeft() > 10 * MINUTES) {
      const p = queue.shift();
      const update = { crawled_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      const company = await withTimeout(lookupCompany(p).catch(() => null), 20_000, null);
      if (company) Object.assign(update, company);
      let website = p.website;
      if (!website && !p.email) {
        website = await withTimeout(
          findSite({ ...p, siren: company?.siren ?? p.siren }).catch(() => null),
          60_000,
          null,
        );
        update.notes = [p.notes, website ? `Site retrouvé et vérifié : ${website}` : "Site cherché, non trouvé"]
          .filter(Boolean)
          .join("\n");
        if (website) {
          update.website = website;
          found++;
        }
      }
      let form = null;
      if (website) {
        const res = await withTimeout(
          crawl(website).catch(() => ({ emails: [], text: null })),
          45_000,
          { emails: [], text: null },
        );
        const dead = new Set(
          [...(p.notes || "").matchAll(/(?:Adresse vérifiée inexistante|Adresse de fournisseur d'accès écartée[^:]*) : (\S+)/g)].map((m) => m[1]),
        );
        if (!p.email) update.email = pickEmail(res.emails.filter((e) => !dead.has(e)), website);
        if (res.text) update.site_excerpt = res.text;
        form = res.form;
      }
      const email = update.email ?? p.email;
      if (email) withEmail++;
      else {
        // Ordre voulu par le gérant : e-mail d'abord ; sinon formulaire du site (même si un
        // téléphone est connu) ; sinon téléphone seul, dans « À appeler ».
        const usable = form && !form.captcha;
        const line = usable
          ? `Formulaire de contact : ${form.url}`
          : form
            ? "Formulaire protégé par un test anti-robot"
            : "Aucun e-mail ni formulaire utilisable";
        update.notes = [update.notes ?? p.notes, line].filter(Boolean).join("\n");
        if (usable) forms++;
        else update.status = "sans_email";
      }
      await db.from("prospects").update(update).eq("id", p.id);
      checked++;
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return { checked, withEmail, found, forms };
}

// ------------------------------------------------------------------ 3. Rédaction

// Style des messages : réécrit le 2026-10-18 à la demande du gérant (chaleureux, donne envie de
// répondre, aucun chiffre ni réglementation). Les brouillons rédigés avant sont réécrits.
const STYLE_SINCE = "2026-10-18T17:59:51Z";
// Messages pas encore partis, rédigés avant la méthode « curiosité » (situation vécue par le
// professionnel, court, une question précise) : réécrits avant envoi.
const REDRAFT_SINCE = "2026-10-19T09:17:30Z";

const SYSTEM = `Tu écris, au nom de Tom Simon, fondateur de Spinelle Conciergerie, un premier e-mail à UN professionnel de l'immobilier précis, et sa relance. Un seul objectif : qu'il ait envie de lire jusqu'au bout et de répondre.

Spinelle Conciergerie gère de A à Z la location courte durée (Airbnb, Booking) pour les propriétaires : création et mise en valeur de l'annonce avec de belles photos, calendrier ajusté au fil de la demande, accueil et échanges avec les voyageurs tous les jours, ménage soigné de qualité hôtelière, linge, entretien et petites réparations. Le propriétaire n'a rien à faire et suit ses revenus chaque mois.

Ce que Spinelle propose aux professionnels : quand l'un de leurs clients veut louer son bien en courte durée, ils nous le recommandent ; leur client reste le leur ; et ils touchent une commission sur chaque logement recommandé que nous signons. Pour eux : un revenu en plus sans rien gérer, et une vraie solution à proposer à leurs clients.

Ce qui rassure un professionnel (à utiliser quand c'est naturel) : nous ne faisons que de la location courte durée, nous ne sommes pas une agence, nous ne lui faisons donc jamais concurrence ; son client reste le sien et il reste son interlocuteur pour tout le reste ; Tom répond lui-même, personnellement. Le lecteur se méfie d'une inconnue qui lui demande ses clients : le message doit sonner comme un service rendu à ses clients, pas comme une demande de fichier.

Le ton : chaleureux, humain, enthousiaste sans en faire trop, comme un entrepreneur qui écrit lui-même à quelqu'un qu'il aimerait vraiment avoir comme partenaire. Vouvoiement. Phrases courtes et simples. Le message doit se lire en vingt secondes.

Comment écrire un message qui éveille la curiosité (c'est LE critère) :
- Pars d'une situation précise que CE professionnel vit avec ses clients, pas d'une description de Spinelle. Le lecteur doit se dire « tiens, j'ai justement un dossier comme ça ». Choisis la situation la plus parlante selon son métier et son site :
  · agence de vente : le vendeur dont le bien ne trouve pas preneur et qui hésite à baisser, qui pourrait le faire rapporter en attendant ; l'acheteur investisseur qui hésite parce qu'il n'aura pas le temps de gérer ; la famille qui hérite d'un appartement et ne sait pas quoi en faire ; le propriétaire muté ou parti à l'étranger ;
  · agence de gestion locative : le propriétaire dont le locataire s'en va et qui parle d'essayer Airbnb, et que l'agence risque de perdre ; le propriétaire lassé de la location classique ;
  · syndic ou administrateur de biens : le copropriétaire bailleur qui demande un contact sérieux pour louer aux voyageurs, alors que l'immeuble veut des voyageurs respectueux et un vrai suivi (nous veillons au calme et au respect de l'immeuble) ;
  · conseiller en patrimoine : le client qui veut faire travailler un bien sans s'en occuper ;
  · promoteur : l'acheteur investisseur qui hésite à signer faute de savoir qui s'occupera de son bien ;
  · société d'investissement immobilier (foncière, investisseur, gérant de fonds) : le logement meublé de son parc qui reste vide entre deux locations, les investisseurs qu'elle accompagne qui veulent un bon rendement sans gestion ;
  · marchand de biens : le bien rénové qui attend sa revente ;
  · zones de vacances (mer, montagne) : la résidence secondaire qui reste fermée une bonne partie de l'année.
- Accroche (première ou deuxième phrase) : relie un détail vrai et précis tiré de son site (spécialité, type de biens, secteur exact, façon de travailler) à cette situation, ou pose directement la question qui la fait surgir (« Quand un vendeur vous dit qu'il préfère attendre plutôt que baisser, que lui proposez-vous ? »). Jamais d'évidence (« la demande est forte l'été », « beaucoup de voyageurs viennent à Paris »).
- Puis une seule phrase sur Spinelle, qui répond à cette situation : nous louons le bien en courte durée et nous nous occupons de tout pour le propriétaire. Pas de liste de services (au plus un détail concret et vivant, adapté à la situation).
- Puis ce qu'il y gagne, en une phrase : une vraie solution pour son client, qui reste le sien (nous ne faisons que de la courte durée, jamais de concurrence avec lui), et une commission sur chaque logement recommandé que nous signons (sans montant).
- Laisse une part de mystère qui donne envie d'en savoir plus : ne dis pas tout (comment ça se passe concrètement, ce que son client y gagnerait), propose de le lui expliquer.
- Termine par UNE question courte, précise, liée à la situation, à laquelle il peut répondre en une ligne : « Vous avez un dossier comme ça en ce moment ? », « Ça vous arrive souvent ? ». Jamais « Ça vous dirait qu'on en parle ? » ni une demande de rendez-vous en première intention.
- Objet : court (moins de 40 caractères), intrigant et personnel, qui évoque la situation, pas Spinelle : « Vos vendeurs qui préfèrent attendre », « Une question sur vos fins de bail », « Ce bien hérité qui reste vide ». Jamais racoleur.
- Salutation : « Bonjour Prénom, » (prénom seul) si un dirigeant est fourni, sinon « Bonjour, ».
- Court : 60 à 100 mots, trois petits paragraphes, des phrases simples. Il doit se lire en quinze secondes.
- Varie vraiment les versions : chacune part d'une situation ou d'une accroche différente.
- Si l'extrait du site est vide ou pauvre, ne fais pas semblant de connaître l'agence : pars de son métier et de son secteur, avec la question-situation.

À ne jamais faire :
- Aucun chiffre, aucun prix, aucune statistique, aucun pourcentage, aucun montant de commission.
- Ne parle ni de réglementation, ni d'encadrement, ni de plafond de nuits, ni de conformité, ni de données de marché.
- Pas de jargon (« partenariat stratégique », « synergie », « solution clé en main »), pas de superlatifs creux, pas de point d'exclamation, pas d'emoji, pas de « n'hésitez pas », pas de café ni de visite, pas de formule finale ni de signature (elles sont ajoutées automatiquement).
- N'invente rien, ni sur lui ni sur Spinelle (pas de nombre de clients, pas de références, pas de cas client inventé : parle de situations qu'il connaît, pas d'histoires).
- Ne précise pas ce qu'il n'aurait PAS à faire (« pas de fichier à nous confier », « aucun engagement de votre part »…) : ça sonne faux.
- Pas de compliment générique ni de flatterie (« on sent que vous connaissez bien… », « vos biens ont du charme », « votre belle agence »).

Relance (sept jours plus tard, en réponse au premier e-mail) : deux ou trois phrases chaleureuses et légères, sans reproche : tu reviens vers lui avec un autre angle (une autre situation de ses clients que la première), en une phrase, et tu l'invites à te transférer un contact quand l'occasion se présentera. Même salutation que le premier e-mail.

Propose le nombre de versions demandé, vraiment différentes entre elles (accroche, angle, objet), toutes conformes à ces règles. Réponds uniquement au format suivant, une fois par version :
<version>
<angle>angle choisi en quelques mots</angle>
<objet>…</objet>
<message>…</message>
<relance>…</relance>
</version>`;

// Relecture dans la peau du destinataire : il note chaque version selon la probabilité qu'il réponde.
const JUDGE = `Tu te mets entièrement à la place du professionnel de l'immobilier décrit ci-dessous : tu es lui, avec son métier, sa clientèle, son agenda chargé, et tu reçois chaque jour des dizaines de sollicitations commerciales que tu ignores pour la plupart.

Tu reçois plusieurs versions d'un même e-mail. Si ton nom n'apparaît pas dans la salutation, c'est normal (l'expéditeur ne le connaît pas) : ne le pénalise pas. L'absence de chiffres, de montant de commission et de conditions détaillées est voulue (l'expéditeur les donne de vive voix au premier échange) : ne la pénalise pas et ne la suggère pas comme amélioration ; juge surtout la curiosité éveillée (est-ce que ça parle d'une situation que tu vis vraiment avec tes clients, est-ce que tu as envie d'en savoir plus ?), puis la pertinence pour toi, la confiance inspirée et la facilité de répondre. Un message qui ressemble à une plaquette (liste de services) ou à un envoi en masse ne dépasse pas 5. Lis-les comme tu le ferais vraiment, honnêtement. Pour chacune, donne une note de 1 à 10 : la probabilité que tu y répondes. Une note de 8 ou plus veut dire : « je réponds, ça m'intéresse vraiment ». Sois exigeant : un message générique, trop long, flatteur ou qui sent l'envoi en masse ne dépasse pas 5.

Réponds uniquement au format :
<notes>1:N;2:N;…</notes>
<meilleure>numéro</meilleure>
<pourquoi>en une phrase, à la première personne, ce qui te ferait répondre ou non à la meilleure</pourquoi>
<amelioration>la modification la plus utile pour que tu répondes à coup sûr</amelioration>`;

const MIN_SCORE = 6;

const FORBIDDEN =
  /[[\]{}!%€]|\d|encadr|réglement|reglement|plafond|conformit|médian|median|prix|tarif|clé en main|cle en main|synergie|stratégique|n'hésitez|café|cordialement|Tom Simon/i;

export function check(draft) {
  const problems = [];
  const all = `${draft.subject}\n${draft.body}\n${draft.followup}`;
  const words = draft.body.split(/\s+/).filter(Boolean).length;
  if (words < 45 || words > 115) problems.push(`le message fait ${words} mots (60 à 100 attendus)`);
  if (draft.subject.length > 45) problems.push("objet trop long (moins de 40 caractères)");
  if (!/commission/i.test(draft.body))
    problems.push("le message doit dire qu'il touche une commission sur chaque logement recommandé que nous signons");
  if (!/^Bonjour/.test(draft.body) || !/^Bonjour/.test(draft.followup))
    problems.push("doit commencer par « Bonjour »");
  const bad = all.match(FORBIDDEN);
  if (bad)
    problems.push(
      `élément interdit « ${bad[0]} » (aucun chiffre, prix, réglementation, jargon, point d'exclamation, formule finale ni signature)`,
    );
  return problems;
}

// Consommation de l'IA par modèle, reportée dans le résumé du passage pour suivre le coût.
const usage = {};
// Tarifs publics en dollars par million de jetons (octobre 2026) : lecture, lecture en cache,
// écriture en cache, écriture. Objectif : environ un centime par message rédigé.
const PRICES = {
  "claude-sonnet-5-5": [2, 0.2, 2.5, 10],
  "claude-haiku-5-5": [0.1, 0.01, 0.125, 0.5],
};
const costOf = (model, u) => {
  const [i, r, w, o] = PRICES[model] ?? [0, 0, 0, 0];
  return (u.input * i + u.read * r + u.write * w + u.output * o) / 1e6;
};

async function ask(ai, model, system, content, { think = false } = {}) {
  // Repli automatique en cas de refus : disponible sur Sonnet 5.5, pas sur Haiku 5.5.
  const fallback = model.startsWith("claude-sonnet-5-5")
    ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }
    : {};
  const res = await ai.beta.messages.create({
    model,
    max_tokens: 4000,
    ...fallback,
    // Rédaction sans réflexion préalable : pour un e-mail de cent mots, elle coûtait les deux
    // tiers de la facture sans meilleur résultat. Le relecteur garde la sienne (peu coûteuse).
    ...(think
      ? {}
      : { thinking: { type: model.startsWith("claude-sonnet") ? "between_tools" : "disabled" } }),
    output_config: { effort: "low" },
    // Consignes identiques à chaque message : mises en cache pour payer moins cher.
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content }],
  });
  const u = (usage[model] ??= { calls: 0, input: 0, read: 0, write: 0, output: 0 });
  u.calls++;
  u.input += res.usage?.input_tokens ?? 0;
  u.read += res.usage?.cache_read_input_tokens ?? 0;
  u.write += res.usage?.cache_creation_input_tokens ?? 0;
  u.output += res.usage?.output_tokens ?? 0;
  if (res.stop_reason === "refusal") throw new Error("Requête refusée par le modèle");
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

const tagIn = (text, t) =>
  ((text.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] || "").trim();

// Petites fautes corrigées d'office plutôt que de jeter un bon message : point d'exclamation,
// formule finale ou signature ajoutée par erreur à la fin.
function tidy(text) {
  return text
    .replace(/\s*!/g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(
      /(\n\s*(Bien cordialement|Cordialement|Bien à vous|Belle journée|Tom Simon|Tom|Spinelle Conciergerie|Fondateur[^\n]*)[\s,.]*)+$/i,
      "",
    )
    .trim();
}

const refusals = (p) => ((p.notes || "").match(/Rédaction refusée/g) || []).length;
// Contact mis de côté après deux refus : pas de nouvel essai avant la date indiquée.
const parked = (p) => {
  const until = [...(p.notes || "").matchAll(/Mis de côté jusqu'au (\d{4}-\d{2}-\d{2})/g)].pop()?.[1];
  return Boolean(until && until > new Date().toISOString().slice(0, 10));
};

const parseVersions = (text) =>
  [...text.matchAll(/<version>([\s\S]*?)<\/version>/g)].map((m) => ({
    angle: tagIn(m[1], "angle"),
    subject: tidy(tagIn(m[1], "objet")),
    body: tidy(tagIn(m[1], "message")),
    followup: tidy(tagIn(m[1], "relance")),
  }));
const problemsOf = (v) =>
  v.subject && v.body && v.followup
    ? check(v)
    : ["format incomplet (objet, message ou relance manquant)"];

// Relecture dans la peau du destinataire : note chaque version, garde celle à laquelle il répondrait.
async function judge(ai, facts, versions) {
  const shown = versions
    .map((v, k) => `--- Version ${k + 1} ---\nObjet : ${v.subject}\n\n${v.body}`)
    .join("\n\n");
  const verdict = await ask(ai, JUDGE_MODEL, JUDGE, `Qui tu es :\n${facts}\n\nLes e-mails reçus :\n\n${shown}`, {
    think: true,
  });
  const scores = Object.fromEntries(
    [...tagIn(verdict, "notes").matchAll(/(\d+)\s*:\s*(\d+)/g)].map((m) => [Number(m[1]), Number(m[2])]),
  );
  const pick = Number(tagIn(verdict, "meilleure")) || 1;
  return {
    ...(versions[pick - 1] ?? versions[0]),
    score: scores[pick] ?? 0,
    why: tagIn(verdict, "pourquoi"),
    tip: tagIn(verdict, "amelioration"),
  };
}

// Situations vécues par chaque métier : une est tirée au sort par agence, pour que les messages
// ne racontent pas tous la même histoire (le rédacteur peut en choisir une meilleure d'après le site).
const SITUATIONS = {
  "agence immobilière": [
    "le vendeur dont le bien ne trouve pas preneur et qui préfère attendre plutôt que baisser : il pourrait le faire rapporter en attendant",
    "l'acheteur investisseur qui hésite parce qu'il n'aura pas le temps de gérer son bien",
    "la famille qui hérite d'un appartement et ne sait pas quoi en faire",
    "le propriétaire muté ou parti à l'étranger qui ne veut pas vendre",
    "le propriétaire dont le locataire s'en va et qui parle d'essayer Airbnb, et que l'agence risque de perdre",
    "le propriétaire lassé de la location classique qui cherche une autre façon de faire travailler son bien",
  ],
  "syndic ou administrateur de biens": [
    "le copropriétaire bailleur qui demande un contact sérieux pour louer aux voyageurs, alors que l'immeuble veut des voyageurs respectueux et un vrai suivi",
    "le copropriétaire qui loue déjà en courte durée de façon désordonnée et dont les voisins se plaignent",
  ],
  "conseiller en investissement ou gestion de patrimoine": [
    "le client qui veut faire travailler un bien sans s'en occuper",
    "le client qui hésite à investir dans un appartement faute de savoir qui le gérera",
  ],
  "promoteur immobilier": [
    "l'acheteur investisseur qui hésite à signer faute de savoir qui s'occupera de son bien",
  ],
  "marchand de biens": ["le bien rénové qui attend sa revente et reste vide en attendant"],
  "société d'investissement immobilier": [
    "le logement meublé de son parc qui reste vide entre deux locations et pourrait rapporter davantage sans gestion de plus",
    "les investisseurs qu'elle accompagne, qui veulent un bon rendement de leur appartement sans s'en occuper",
    "le bien acquis récemment qu'elle veut rentabiliser vite en attendant de décider de sa stratégie",
  ],
};
const HOLIDAY = "la résidence secondaire qui reste fermée une bonne partie de l'année";
function situationFor(p) {
  const cat = (p.notes || "").match(/Catégorie : ([^\n]+)/)?.[1] ?? "agence immobilière";
  const list = [...(SITUATIONS[cat] ?? SITUATIONS["agence immobilière"])];
  if (ZONES[p.zone]?.season) list.push(HOLIDAY, HOLIDAY);
  return list[Math.floor(Math.random() * list.length)];
}

async function draftOne(ai, p, floor = 5) {
  const facts = [
    `Agence : ${p.name}`,
    p.notes ? p.notes : null,
    `Zone : ${ZONES[p.zone]?.label ?? p.zone}${p.city ? ` (${p.city})` : ""}${p.postcode ? `, ${p.postcode}` : ""}`,
    p.address ? `Adresse : ${p.address}` : null,
    p.contact_name
      ? `Dirigeant : ${p.contact_name}`
      : "Dirigeant : inconnu (salutation « Bonjour, »)",
    `Contexte de la zone : ${ZONE_CONTEXT[p.zone] ?? ""}`,
    `Extrait du site de l'agence :\n${p.site_excerpt || "(aucun)"}`,
  ]
    .filter(Boolean)
    .join("\n");
  const situation = `Situation suggérée pour ce professionnel : ${situationFor(p)} (prends-en une autre de la liste seulement si son site en suggère clairement une meilleure).`;
  let feedback = "";
  let best = null;
  let lastProblem = "";
  // 1. Trois versions par le modèle rapide, contrôlées (aucun chiffre, aucune réglementation,
  //    longueur, ton) puis notées ; jusqu'à trois tours si elles ne conviennent pas.
  for (let round = 0; round < 3; round++) {
    const parsed = parseVersions(await ask(ai, MODEL, SYSTEM, `${facts}\n\n${situation}\n\nNombre de versions demandé : trois.${feedback}`));
    const problems = parsed.length ? parsed.map(problemsOf) : [["format non respecté (balises <version> absentes)"]];
    const versions = parsed.filter((v, k) => !problems[k].length);
    if (!versions.length) {
      lastProblem = [...new Set(problems.flat())].join(" ; ");
      // On dit précisément au rédacteur ce qui n'allait pas, pour qu'il ne refasse pas l'erreur.
      feedback = `\n\nTes versions précédentes ont été refusées pour ces raisons : ${lastProblem}. Recommence en corrigeant exactement ces points, sans rien changer d'autre aux règles.`;
      continue;
    }
    const chosen = await judge(ai, facts, versions);
    if (!best || chosen.score > best.score) best = chosen;
    if (best.score >= MIN_SCORE) break;
    feedback = `\n\nLe destinataire a lu ta meilleure proposition et l'a notée ${chosen.score}/10. Son avis : « ${chosen.why} ». Ce qui le ferait répondre : « ${chosen.tip} ». Propose trois nouvelles versions bien meilleures.`;
  }
  if (!best) return { reason: `règles non respectées (${lastProblem})` };
  // 2. Retouche unique par le modèle haut de gamme, à partir de l'avis du destinataire ; gardée
  //    seulement si elle est conforme et que le destinataire la préfère.
  if (best.score < 8) {
    const brief = `${facts}\n\nNombre de versions demandé : une seule, la version finale.\n\nVoici la meilleure version écrite jusqu'ici :\nObjet : ${best.subject}\n\n${best.body}\n\nRelance : ${best.followup}\n\nLe destinataire l'a notée ${best.score}/10. Son avis : « ${best.why} ». Ce qui le ferait répondre : « ${best.tip} ». Réécris-la pour qu'il ait vraiment envie de répondre, en gardant ce qui marche et en respectant strictement toutes les règles. Supprime toute énumération de services (au plus un détail concret), garde la situation vécue au cœur du message et la question finale précise.`;
    const [polished] = parseVersions(await ask(ai, POLISH_MODEL, SYSTEM, brief).catch(() => ""));
    if (polished && !problemsOf(polished).length) {
      const pick = await judge(ai, facts, [best, polished]);
      if (pick.body === polished.body || pick.score > best.score)
        best = { ...pick, angle: pick.angle || best.angle };
    }
  }
  if (best.score < floor) return { reason: `note trop basse (${best.score}/10)` };
  return { draft: { ...best, angle: `${best.angle} (note ${best.score}/10)` } };
}

// Répartition entre groupes (zone × métier). Au début, à parts égales ; dès qu'il y a assez de
// recul, chaque groupe reçoit une part proportionnelle à son taux de réponse (lissé), entre la
// moitié et le triple de la part normale : on mise davantage sur ce qui marche, sans jamais
// abandonner les autres groupes. Les zones dont la haute saison approche comptent double.
const groupKey = (p) =>
  `${p.zone}|${(p.notes || "").match(/Catégorie : ([^\n]+)/)?.[1] ?? "agence immobilière"}`;
const MIN_CONTACTS_TO_ADAPT = 100; // contacts au total avant d'ajuster les parts
const PRIOR = 30; // lissage : un groupe peu contacté reste proche de la moyenne

let weights = null;
async function loadWeights() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await db
      .from("prospects")
      .select("zone,notes,status")
      .in("status", ["contacte", "relance", "sans_reponse", "repondu", "partenaire", "refus"])
      .range(from, from + 999);
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  const answered = (p) => ["repondu", "partenaire", "refus"].includes(p.status);
  const overall = rows.length ? rows.filter(answered).length / rows.length : 0;
  weights = new Map();
  if (rows.length < MIN_CONTACTS_TO_ADAPT || overall === 0) return "parts égales (phase de test)";
  const stats = new Map();
  for (const p of rows) {
    const g = stats.get(groupKey(p)) || { sent: 0, ok: 0 };
    g.sent++;
    if (answered(p)) g.ok++;
    stats.set(groupKey(p), g);
  }
  for (const [key, g] of stats) {
    const rate = (g.ok + PRIOR * overall) / (g.sent + PRIOR);
    weights.set(key, Math.min(3, Math.max(0.5, rate / overall)));
  }
  const best = [...weights.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return `parts ajustées aux réponses (${best.map(([k, w]) => `${k.replace("|", " · ")} ×${w.toFixed(1)}`).join(", ")})`;
}

function interleave(list) {
  const month = parisNow().getMonth() + 1;
  const groups = new Map();
  for (const p of list) {
    const key = groupKey(p);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  const queues = [...groups.entries()].map(([key, items]) => ({
    items,
    weight: (weights?.get(key) ?? 1) * (ZONES[key.split("|")[0]]?.season?.includes(month) ? 2 : 1),
    current: 0,
  }));
  // Tourniquet pondéré : chaque groupe avance selon sa part, sans jamais être oublié.
  const out = [];
  while (out.length < list.length) {
    const open = queues.filter((q) => q.items.length);
    const total = open.reduce((sum, q) => sum + q.weight, 0);
    for (const q of open) q.current += q.weight;
    const pick = open.reduce((a, b) => (b.current > a.current ? b : a));
    pick.current -= total;
    out.push(pick.items.shift());
  }
  return out;
}

// Objet des e-mails : sobre et professionnel, pour qu'on voie tout de suite que ce n'est pas une
// publicité (demande du gérant, 2026-10-20). Choisi d'après la fiche, donc toujours le même pour
// une agence ; le nom de l'agence n'y figure que s'il est court et que ce n'est pas un réseau.
const SUBJECT_SINCE = "2026-10-26T13:59:59Z";
// Mis à jour le 2026-10-26 : « apporteur d'affaires » dit aux professionnels, dans leur propre
// vocabulaire, que le partenariat est rémunéré, sans les mots qui font fuir ou déclenchent les
// filtres anti-spam (« rémunéré », « gagnez »…).
function collabSubject(p) {
  const name = (p.name || "").trim();
  const network = /Réseau : /.test(p.notes || "");
  const named = !network && name && name.length <= 24;
  const cat = (p.notes || "").match(/Catégorie : ([^\n]+)/)?.[1] ?? "agence immobilière";
  const options = [
    "Partenariat apporteur d'affaires – Spinelle Conciergerie",
    "Proposition de partenariat – Spinelle Conciergerie",
    ...(named ? [`${name} × Spinelle Conciergerie`] : []),
    ...(/patrimoine|investissement|promoteur/.test(cat)
      ? ["Partenariat pour vos clients investisseurs"]
      : /syndic/.test(cat)
        ? ["Partenariat pour vos copropriétaires bailleurs"]
        : ["Partenariat pour vos clients propriétaires"]),
  ];
  const seed = [...String(p.id || name)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return options[seed % options.length];
}

// Messages prêts rédigés avant ce changement : leur objet est remplacé (le texte ne change pas).
async function renameSubjects() {
  const rows = await selectAll(() =>
    db
      .from("prospects")
      .select("id,name,notes,subject")
      .in("status", ["brouillon", "valide"])
      .lt("drafted_at", SUBJECT_SINCE),
  );
  let renamed = 0;
  for (const p of rows) {
    const subject = collabSubject(p);
    if (p.subject === subject) continue;
    await db
      .from("prospects")
      .update({ subject, followup_subject: `Re: ${subject}` })
      .eq("id", p.id);
    renamed++;
  }
  return renamed;
}

async function draftMessages(settings) {
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
  const ai = new Anthropic({
    apiKey: env("ANTHROPIC_API_KEY"),
    ...(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {}),
  });
  // Brouillons rédigés dans l'ancien style (avant STYLE_SINCE) : remis en file pour être réécrits.
  await db
    .from("prospects")
    .update({
      status: "nouveau",
      subject: null,
      body: null,
      followup_subject: null,
      followup_body: null,
      angle: null,
      drafted_at: null,
    })
    .in("status", ["brouillon", "valide"])
    .lt("drafted_at", REDRAFT_SINCE);
  // Deux réserves de messages prêts, chacune à sa mesure : e-mails (plafond de la boîte d'envoi)
  // et formulaires (plafond à part), pour que l'une ne bloque jamais l'autre.
  const pendingOf = async (byForm) => {
    const q = db
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .in("status", ["brouillon", "valide"]);
    return (await (byForm ? q.is("email", null) : q.not("email", "is", null))).count || 0;
  };
  const rooms = {
    email: Math.max(0, Math.min(DRAFT_PER_RUN, settings.daily_limit * 2 - (await pendingOf(false)))),
    form: Math.max(0, Math.min(20, FORMS_PER_DAY * 2 - (await pendingOf(true)))),
  };
  const room = rooms.email + rooms.form;
  if (!room) return 0;
  // Quelques candidats de chaque zone, puis rédaction à tour de rôle (zone et métier).
  // Candidats pris par zone ET par métier : sans ça, les milliers d'agences remplissaient tout et
  // les syndics, promoteurs, investisseurs… n'étaient presque jamais rédigés.
  const CATEGORIES = [
    "agence immobilière",
    "syndic ou administrateur de biens",
    "conseiller en investissement ou gestion de patrimoine",
    "promoteur immobilier",
    "marchand de biens",
    "société d'investissement immobilier",
  ];
  const pick = async (kind) => {
    if (!rooms[kind]) return [];
    const lists = await Promise.all(
      Object.keys(ZONES).flatMap((zone) =>
        CATEGORIES.map(async (cat) => {
          let q = db.from("prospects").select("*").eq("status", "nouveau").eq("zone", zone);
          q = cat === "agence immobilière"
            ? q.or("notes.is.null,notes.ilike.*Catégorie : agence immobilière*")
            : q.ilike("notes", `%Catégorie : ${cat}%`);
          const { data } = await (kind === "email"
            ? q.not("email", "is", null)
            : q.is("email", null).ilike("notes", "%Formulaire de contact :%")
          ).limit(rooms[kind] * 2);
          return (data || []).filter((p) => !parked(p)).slice(0, rooms[kind]);
        }),
      ),
    );
    return lists.flat();
  };
  const rows = [...interleave(await pick("email")), ...interleave(await pick("form"))];
  const taken = { email: 0, form: 0 };
  const { data: optouts } = await db.from("prospect_optouts").select("email");
  const blocked = new Set((optouts || []).map((o) => o.email));
  const used = await selectAll(() =>
    db
      .from("prospects")
      .select("email,website,phone,siren")
      .not("status", "in", "(nouveau,sans_email)"),
  );
  const seen = { email: new Set(), host: new Set(), phone: new Set(), siren: new Set() };
  for (const u of used || []) {
    if (u.email) seen.email.add(u.email.toLowerCase());
    if (u.website) seen.host.add(hostOf(u.website));
    if (u.phone) seen.phone.add(u.phone.replace(/\D/g, "").slice(-9));
    if (u.siren) seen.siren.add(u.siren);
  }
  // 1. Sélection (une agence = un seul contact, même sous plusieurs noms ou adresses).
  const queue = [];
  for (const p of rows || []) {
    if (queue.length >= room) break;
    const kind = p.email ? "email" : "form";
    if (taken[kind] >= rooms[kind]) continue;
    const email = (p.email || "").toLowerCase();
    const host = p.website ? hostOf(p.website) : null;
    const phone = p.phone ? p.phone.replace(/\D/g, "").slice(-9) : null;
    const duplicate =
      (email && blocked.has(email)) ||
      (email && seen.email.has(email)) ||
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
    if (email) seen.email.add(email);
    if (host) seen.host.add(host);
    if (phone) seen.phone.add(phone);
    if (p.siren) seen.siren.add(p.siren);
    taken[kind]++;
    queue.push(p);
  }
  // 2. Rédaction, quatre messages à la fois, sans dépasser la durée du passage.
  let drafted = 0;
  let stop = false;
  const worker = async () => {
    while (queue.length && !stop && timeLeft() > 3 * MINUTES) {
      const p = queue.shift();
      let draft;
      let reason;
      try {
        // Aux essais suivants, on accepte un message conforme un peu moins bien noté plutôt que
        // de perdre le contact.
        ({ draft, reason } = await draftOne(ai, p, refusals(p) ? 4 : 5));
      } catch (e) {
        // Erreur technique (clé, quota, service) : l'agence reste en file pour le prochain passage.
        note(`Rédaction interrompue (${p.name}) : ${e.message}`);
        if ([400, 401, 403, 429].includes(e.status)) stop = true;
        continue;
      }
      if (!draft) {
        // Aucun contact perdu trop vite : premier échec, nouvel essai au passage suivant ; second
        // échec, mis de côté une semaine (le temps que les consignes s'améliorent) puis dernier
        // essai ; ensuite seulement, écarté des envois (il reste dans « À appeler » s'il a un
        // téléphone).
        const n = refusals(p) + 1;
        const until = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
        await db
          .from("prospects")
          .update({
            status: n >= 3 ? "ignore" : "nouveau",
            notes: [
              p.notes,
              `Rédaction refusée (${reason})`,
              n >= 3
                ? "Écarté : message non conforme après trois essais"
                : n === 2
                  ? `Mis de côté jusqu'au ${until}`
                  : null,
            ]
              .filter(Boolean)
              .join("\n"),
            updated_at: new Date().toISOString(),
          })
          .eq("id", p.id);
        continue;
      }
      const subject = collabSubject(p);
      await db
        .from("prospects")
        .update({
          status: "brouillon",
          subject,
          body: draft.body,
          followup_subject: `Re: ${subject}`,
          followup_body: draft.followup,
          angle: draft.angle,
          drafted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", p.id);
      drafted++;
      // Quelques exemples complets par passage dans le journal, pour contrôler la qualité.
      if (drafted <= 3)
        note(
          `Exemple (${p.name}), note ${draft.score}/10 — ${draft.why}\nObjet : ${draft.subject}\n${draft.body}`,
        );
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  return drafted;
}

// ------------------------------------------------------------------ 4. Envoi

// Relance des contacts dont le premier message date de l'ancien style.
function warmFollowup(p) {
  const first = p.contact_name ? ` ${p.contact_name.split(" ")[0]}` : "";
  return `Bonjour${first},

Je me permets de revenir vers vous au sujet de mon message de la semaine dernière.

Si l'un de vos clients pense un jour à louer son bien sur Airbnb, il vous suffit de me transférer son contact : nous nous occupons de tout pour lui, et vous touchez une commission sur chaque logement recommandé que nous signons.`;
}

function compose(p, followup) {
  const unsubscribe = `${SITE}/desinscription?t=${p.unsubscribe_token}`;
  const oldStyle = !p.drafted_at || p.drafted_at < STYLE_SINCE;
  let content = followup ? (oldStyle ? warmFollowup(p) : p.followup_body) : p.body;
  // Contactés juste avant la coupure du domaine (20-26 octobre 2026) : leur éventuelle réponse
  // ne nous est pas parvenue, on le dit simplement dans la relance.
  if (followup && p.first_contact_at && p.first_contact_at < "2026-10-20T00:00:00Z")
    content = content.replace(
      /^(Bonjour[^\n]*\n+)/,
      "$1Ma messagerie a connu une coupure la semaine dernière : si vous m'avez répondu, votre message ne m'est peut-être pas parvenu, et je vous prie de m'en excuser.\n\n",
    );
  const text = `${content}\n\n${SIGNATURE}\n\n—\nVos coordonnées proviennent de votre site internet. Pour ne plus recevoir de message de Spinelle Conciergerie : ${unsubscribe}`;
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
  // Serveurs du fournisseur de la boîte (IONOS par défaut ; SMTP_HOST / IMAP_HOST pour un autre).
  const smtp = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ionos.fr",
    port: 465,
    secure: true,
    auth,
  });
  const imap = new ImapFlow({
    host: process.env.IMAP_HOST || "imap.ionos.fr",
    port: 993,
    secure: true,
    auth,
    logger: false,
  });
  await imap.connect();
  await smtp.verify();
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

// Nouveaux contacts du jour : le plafond quotidien porte sur eux (les relances partent en plus).
// Premiers contacts du jour, par e-mail (plafond de la boîte d'envoi) ou par formulaire.
async function sentToday(byForm = false) {
  const start = parisNow();
  start.setHours(0, 0, 0, 0);
  const offset = Date.now() - parisNow().getTime();
  const q = db
    .from("prospects")
    .select("id", { count: "exact", head: true })
    .gte("first_contact_at", new Date(start.getTime() + offset).toISOString());
  const { count } = await (byForm ? q.is("email", null) : q.not("email", "is", null));
  return count || 0;
}

function allowanceToday(settings, health = 1, at = new Date()) {
  // Montée en charge progressive pour préserver la réputation de l'adresse d'envoi.
  if (!settings.first_send_at) return Math.floor(Math.min(20, settings.daily_limit) * health);
  // Boîte recréée le 26 octobre 2026 après la coupure du domaine : la montée en charge repart de
  // zéro à cette date, pour rebâtir sa réputation en douceur.
  const start = Math.max(new Date(settings.first_send_at).getTime(), new Date(RAMP_SINCE).getTime());
  const days = Math.floor((at.getTime() - start) / 86_400_000);
  // Montée voulue par le gérant : 20 le premier jour, puis 10 de plus chaque jour jusqu'au plafond.
  const ramp = 20 + days * 10;
  return Math.floor(Math.min(settings.daily_limit, ramp) * health);
}

// Santé de l'adresse d'envoi sur les 7 derniers jours. Les messageries classent en spam les boîtes
// dont beaucoup d'e-mails reviennent non remis ou dont les destinataires se désinscrivent : au
// premier signal, on ralentit (moitié du volume), et on s'arrête net si les non-remis explosent.
// Depuis le 28 octobre au soir, chaque adresse est vérifiée avant l'envoi : la santé est jugée
// sur les envois faits avec cette vérification, pas sur les erreurs de l'ancienne méthode.
const VERIFY_SINCE = "2026-10-28T17:30:00Z";

async function sendingHealth() {
  const week = new Date(Math.max(Date.now() - 7 * 86_400_000, new Date(VERIFY_SINCE).getTime())).toISOString();
  const count = async (q) => (await q).count || 0;
  const base = () => db.from("prospects").select("id", { count: "exact", head: true });
  // Seuls les e-mails comptent (les formulaires ne passent pas par la boîte), et les adresses de
  // fournisseur d'accès, qui ne sont plus utilisées, ne pèsent plus sur le calcul.
  const sent = await count(base().gte("first_contact_at", week).not("email", "is", null));
  if (sent < 40) return { factor: 1, text: "trop peu d'envois pour juger" };
  const { data: bouncedRows } = await db
    .from("prospects")
    .select("email,notes")
    .gte("first_contact_at", week)
    .ilike("notes", "%non remis%");
  const bounced = (bouncedRows || []).filter(
    (r) => !ISP_MAIL.test(r.email || "") && !/Adresse de fournisseur d'accès écartée/.test(r.notes || ""),
  ).length;
  const unsubscribed = await count(base().gte("first_contact_at", week).eq("status", "desinscrit"));
  const bounceRate = bounced / sent;
  const unsubRate = unsubscribed / sent;
  const text = `${Math.round(bounceRate * 1000) / 10} % non remis, ${Math.round(unsubRate * 1000) / 10} % de désinscriptions sur ${sent} envois`;
  // Au-delà de 8 % : volume réduit au quart plutôt qu'arrêté, sinon le taux (calculé sur 7 jours)
  // ne pourrait jamais redescendre ; les adresses envoyées sont désormais filtrées en amont.
  // Un cas isolé ne déclenche rien (sur quelques dizaines d'envois, une seule adresse invalide
  // dépasse déjà les pourcentages) : il faut un problème répété.
  if (bounced >= 5 && bounceRate > 0.08)
    return { factor: 0.25, text: `${text} : volume réduit au quart le temps que le taux redescende` };
  if ((bounced >= 3 && bounceRate > 0.04) || (unsubscribed >= 2 && unsubRate > 0.02))
    return { factor: 0.5, text: `${text} : volume divisé par deux` };
  return { factor: 1, text: `${text} : bon` };
}

// Le domaine du destinataire sait-il recevoir des e-mails ? Évite les envois voués à revenir.
const mxCache = new Map();
async function acceptsMail(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (!mxCache.has(domain)) {
    mxCache.set(
      domain,
      resolveMx(domain)
        .then((r) => r.length > 0)
        .catch((e) => (e.code === "ENODATA" || e.code === "ENOTFOUND" ? false : true)),
    );
  }
  return mxCache.get(domain);
}

// Vérification gratuite d'une adresse avant envoi : on demande au serveur de messagerie du
// destinataire s'il connaît l'adresse, sans rien envoyer. Résultats : « existe », « accepte-tout »
// (le serveur dit oui à tout), « inexistante » (refus explicite : utilisateur inconnu) ou
// « inconnue » (serveur qui ne répond pas à ce genre de question : on envoie comme avant).
const USER_UNKNOWN =
  /5\.1\.[01]|user unknown|unknown user|no such user|does not exist|doesn't exist|not exist|mailbox (is )?(unavailable|not found)|recipient (address )?(rejected|unknown|not found)|invalid (recipient|mailbox|address)|address rejected|n'existe pas|inconnu/i;
const POLICY_REFUSAL = /5\.7\.|block|spam|policy|blacklist|reputation|denied|relay|access/i;

export async function verifyAddress(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  let mx;
  try {
    mx = (await resolveMx(domain)).sort((a, b) => a.priority - b.priority)[0]?.exchange;
  } catch (e) {
    return e.code === "ENODATA" || e.code === "ENOTFOUND" ? "inexistante" : "inconnue";
  }
  if (!mx) return "inexistante";
  const net = await import("node:net");
  return new Promise((resolve) => {
    const sock = net.connect({ host: mx, port: 25 });
    let buf = "";
    let waiter = null;
    sock.on("data", (d) => {
      buf += d.toString();
      const lines = buf.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || "";
      if (waiter && /^\d{3} /.test(last)) {
        const w = waiter;
        waiter = null;
        const text = buf;
        buf = "";
        w({ code: Number(last.slice(0, 3)), text });
      }
    });
    const talk = (line) =>
      new Promise((r) => {
        waiter = r;
        if (line) sock.write(`${line}\r\n`);
      });
    const done = (result) => {
      clearTimeout(timer);
      sock.destroy();
      resolve(result);
    };
    const timer = setTimeout(() => done("inconnue"), 15_000);
    sock.once("error", () => done("inconnue"));
    (async () => {
      if ((await talk()).code !== 220) return done("inconnue");
      if ((await talk("EHLO spinelleconciergerie.fr")).code !== 250) return done("inconnue");
      if ((await talk("MAIL FROM:<>")).code !== 250) return done("inconnue");
      const rcpt = await talk(`RCPT TO:<${email}>`);
      if (rcpt.code >= 500)
        return done(USER_UNKNOWN.test(rcpt.text) && !POLICY_REFUSAL.test(rcpt.text) ? "inexistante" : "inconnue");
      if (rcpt.code !== 250 && rcpt.code !== 251) return done("inconnue");
      const probe = await talk(`RCPT TO:<verification-${Date.now()}@${domain}>`);
      sock.write("QUIT\r\n");
      done(probe.code === 250 ? "accepte-tout" : "existe");
    })().catch(() => done("inconnue"));
  });
}

const verifiedOf = (p) =>
  [...(p.notes || "").matchAll(/Adresse vérifiée \(([^)]+)\) : (\S+)/g)].find((m) => m[2] === p.email)?.[1];

// Adresse inexistante : écartée (et retenue pour ne jamais être reprise), on cherche le formulaire
// du site ; sans site, l'agence va dans « À appeler » si elle a un téléphone.
async function dropDeadAddress(p) {
  await db
    .from("prospects")
    .update({
      ...CLEAN_DRAFT,
      email: null,
      status: p.website ? "nouveau" : p.phone ? "sans_email" : "ignore",
      crawled_at: null,
      notes: [p.notes, `Adresse vérifiée inexistante : ${p.email}`].filter(Boolean).join("\n"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", p.id);
}

// Préparation du lot suivant (à chaque passage, et donc dès la fin de journée pour le lendemain) :
// les prochains messages à partir ont leur adresse vérifiée à l'avance. Pas de surprise au moment
// de l'envoi, et les adresses inexistantes ne partent jamais.
async function prepareNextBatch(settings) {
  const tomorrow = new Date(Date.now() + 86_400_000);
  const target = Math.ceil(allowanceToday(settings, 1, tomorrow) * 1.2);
  const statuses = settings.mode === "auto" ? ["valide", "brouillon"] : ["valide"];
  const { data: rows } = await db
    .from("prospects")
    .select("*")
    .in("status", statuses)
    .not("email", "is", null)
    .order("drafted_at", { ascending: true })
    .limit(target * 2);
  const queue = (rows || []).filter((p) => !verifiedOf(p));
  const ready = (rows || []).length - queue.length;
  let checked = 0;
  let dead = 0;
  const worker = async () => {
    while (queue.length && checked + ready < target && timeLeft() > 4 * MINUTES) {
      const p = queue.shift();
      if (ISP_MAIL.test(p.email)) continue;
      const result = await verifyAddress(p.email);
      checked++;
      if (result === "inexistante") {
        await dropDeadAddress(p);
        dead++;
        continue;
      }
      await db
        .from("prospects")
        .update({ notes: [p.notes, `Adresse vérifiée (${result}) : ${p.email}`].filter(Boolean).join("\n") })
        .eq("id", p.id);
    }
  };
  await Promise.all(Array.from({ length: 5 }, worker));
  return { ready: ready + checked - dead, dead, target };
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
  const runsLeft = Math.max(1, LAST_SEND_HOUR - hour);
  const health = await sendingHealth();
  note(`Santé de l'adresse d'envoi : ${health.text}`);
  const remaining = Math.max(0, allowanceToday(settings, health.factor) - (await sentToday()));
  let budget = Math.ceil(remaining / runsLeft);
  let sent = 0;
  let followups = 0;
  const { data: optouts } = await db.from("prospect_optouts").select("email");
  const blocked = new Set((optouts || []).map((o) => o.email));
  const now = () => new Date().toISOString();

  // Relances d'abord : une seule, 7 jours après, sans réponse entre-temps. Elles s'ajoutent au
  // plafond des nouveaux contacts, avec leur propre limite par passage.
  const before = new Date(Date.now() - FOLLOWUP_AFTER_DAYS * 86_400_000).toISOString();
  const { data: due } = await db
    .from("prospects")
    .select("*")
    .eq("status", "contacte")
    .eq("followups", 0)
    .not("email", "is", null)
    .lt("last_contact_at", before)
    .order("last_contact_at", { ascending: true })
    .limit(FOLLOWUPS_PER_RUN);
  for (const p of due || []) {
    if (blocked.has(p.email.toLowerCase())) continue;
    try {
      await box.send(compose(p, true));
      await db
        .from("prospects")
        .update({ status: "relance", followups: 1, last_contact_at: now(), updated_at: now() })
        .eq("id", p.id);
      followups++;
      await sleep(8000 + Math.random() * 7000);
    } catch (e) {
      note(`Relance ${p.name} : ${e.message}`);
    }
  }

  const statuses = settings.mode === "auto" ? ["valide", "brouillon"] : ["valide"];
  const { data: candidates } = await db
    .from("prospects")
    .select("*")
    .in("status", statuses)
    .not("email", "is", null)
    .order("drafted_at", { ascending: true })
    .limit(Math.max(0, budget) * 8);
  // Les messages validés d'abord, puis envoi à tour de rôle entre zones et métiers.
  const ready = [
    ...interleave((candidates || []).filter((p) => p.status === "valide")),
    ...interleave((candidates || []).filter((p) => p.status !== "valide")),
  ];
  for (const p of ready) {
    if (budget <= 0) break;
    if (blocked.has(p.email.toLowerCase())) {
      await db.from("prospects").update({ status: "desinscrit" }).eq("id", p.id);
      continue;
    }
    if (ISP_MAIL.test(p.email)) {
      // Brouillon préparé avant ce filtre : on cherche plutôt le formulaire du site.
      await db
        .from("prospects")
        .update({
          ...CLEAN_DRAFT,
          email: null,
          status: p.website ? "nouveau" : "sans_email",
          crawled_at: null,
          notes: [p.notes, `Adresse de fournisseur d'accès écartée (souvent périmée) : ${p.email}`]
            .filter(Boolean)
            .join("\n"),
        })
        .eq("id", p.id);
      continue;
    }
    const check = verifiedOf(p) ?? (await verifyAddress(p.email));
    if (check === "inexistante") {
      await dropDeadAddress(p);
      continue;
    }
    if (!(await acceptsMail(p.email))) {
      await db
        .from("prospects")
        .update({
          status: "erreur",
          notes: [p.notes, "Adresse e-mail invalide (domaine sans messagerie), non envoyé"]
            .filter(Boolean)
            .join("\n"),
        })
        .eq("id", p.id);
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
      // Refus passager du serveur d'envoi (code 4xx, saturation chez IONOS) : on s'arrête là pour
      // ce passage sans rien marquer en erreur ; les messages repartent au passage suivant.
      if (e.responseCode >= 400 && e.responseCode < 500) {
        note(`Serveur d'envoi momentanément saturé (${e.responseCode}) : envois repris au passage suivant.`);
        break;
      }
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

// ------------------------------------------------------------------ 4 bis. Formulaires de contact

// Agences sans adresse e-mail mais avec un formulaire sur leur site (demande du gérant : e-mail,
// sinon formulaire, sinon téléphone) : le même message y est déposé par un vrai navigateur. Ne passe pas par la boîte
// d'envoi (aucun risque pour sa réputation), d'où un plafond à part. Jamais de contournement d'un
// test anti-robot, jamais de champ inventé : le contact passe alors dans « À appeler » s'il a un
// téléphone.
const FORMS_PER_DAY = 30;
const SUCCESS =
  /merci|bien (été )?envoy|a été envoy|ont été envoy|été transmis|bien reçu|bien été reçu|thank you|message sent|nous vous (re)?contacterons|reviendrons vers vous|prise en compte/i;

async function fillForm(page, p, message) {
  const form = page.locator("form:has(textarea)").first();
  if (!(await form.count())) return "pas de formulaire de message";
  const labelOf = (el) =>
    el.evaluate((e) => {
      const byFor = e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`);
      return [e.name, e.id, e.placeholder, e.getAttribute("aria-label"), byFor?.textContent, e.closest("label")?.textContent]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    });
  const fields = form.locator("input:visible, textarea:visible, select:visible");
  const n = await fields.count();
  const labels = [];
  for (let i = 0; i < n; i++) labels.push(await labelOf(fields.nth(i)));
  const hasFirstName = labels.some((l) => /pr[ée]nom|first/.test(l));
  const radios = new Set();
  for (let i = 0; i < n; i++) {
    const f = fields.nth(i);
    const label = labels[i];
    const tag = await f.evaluate((e) => e.tagName.toLowerCase());
    const type = ((await f.getAttribute("type")) || "text").toLowerCase();
    if (tag === "textarea") {
      await f.fill(message);
      continue;
    }
    if (tag === "select") {
      const options = await f.locator("option").evaluateAll((os) =>
        os.map((o) => ({ value: o.value, text: o.textContent.trim().toLowerCase() })),
      );
      const choice =
        options.find((o) => o.value && /partenar|professionnel|autre|other|contact|renseignement|information/.test(o.text)) ||
        options.find((o) => o.value);
      if (choice) await f.selectOption(choice.value).catch(() => {});
      continue;
    }
    if (["hidden", "submit", "button", "file", "image", "reset", "password", "date"].includes(type)) continue;
    if (type === "checkbox") {
      if (/rgpd|consent|accept|politique|donn[ée]es|cgu|conditions|privacy|j'ai lu/.test(label))
        await f.check({ force: true }).catch(() => {});
      continue;
    }
    if (type === "radio") {
      const name = (await f.getAttribute("name")) || "";
      if (radios.has(name)) continue;
      if (!/partenar|professionnel|autre|other|contact|renseignement|information/.test(label)) continue;
      radios.add(name);
      await f.check({ force: true }).catch(() => {});
      continue;
    }
    let value = null;
    if (type === "email" || /mail/.test(label)) value = FROM_EMAIL;
    else if (type === "tel" || /t[ée]l[ée]?phone|\bt[ée]l\b|phone|portable|mobile/.test(label)) value = "0631935166";
    else if (/pr[ée]nom|first/.test(label)) value = "Tom";
    else if (/soci[ée]t[ée]|entreprise|company|raison sociale|organisation/.test(label)) value = "Spinelle Conciergerie";
    else if (/objet|sujet|subject/.test(label)) value = p.subject;
    else if (/site|url|web/.test(label) || type === "url") value = "https://spinelleconciergerie.fr";
    else if (/\bnom\b|name|identit/.test(label)) value = hasFirstName ? "Simon" : "Tom Simon";
    if (value) await f.fill(value).catch(() => {});
  }
  // Un champ obligatoire qu'on ne sait pas remplir honnêtement : on renonce.
  const invalid = await form.locator(":invalid").count().catch(() => 0);
  if (invalid) return "champ obligatoire inconnu";
  // Bouton d'envoi : bouton classique, sinon tout bouton du formulaire (ou de la page) dont le
  // texte dit « envoyer », « valider »… (formulaires animés en JavaScript).
  const sendText = /envoy|envoi|send|soumettre|valider|submit/i;
  let submit = form
    .locator('button[type="submit"]:visible, input[type="submit"]:visible, button:not([type]):visible')
    .first();
  if (!(await submit.count()))
    submit = form
      .locator('button:visible, input[type="button"]:visible, [role="button"]:visible, a:visible')
      .filter({ hasText: sendText })
      .first();
  if (!(await submit.count()))
    submit = form
      .locator('input[type="button"][value*="nvoy" i]:visible, input[type="button"][value*="send" i]:visible, input[type="button"][value*="valid" i]:visible')
      .first();
  if (!(await submit.count()))
    submit = page.locator('button:visible, [role="button"]:visible').filter({ hasText: sendText }).first();
  if (!(await submit.count())) return "bouton d'envoi introuvable";
  const before = (await page.locator("body").innerText().catch(() => "")).toLowerCase();
  const startUrl = page.url();
  await submit.click({ timeout: 10_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const after = (await page.locator("body").innerText().catch(() => "")).toLowerCase();
  if (page.url() !== startUrl && /merci|thank|confirm|success/i.test(page.url())) return null;
  // Formulaire vidé ou disparu après l'envoi, sans message d'erreur : envoi accepté.
  const left = await page
    .locator("form:has(textarea) textarea")
    .first()
    .inputValue()
    .catch(() => null);
  if ((left === null || left === "") && !/erreur|invalide|obligatoire|required|error/i.test(after.replace(before, "")))
    return null;
  // Contact compté seulement si un message de confirmation apparaît après l'envoi.
  return SUCCESS.test(after) && !SUCCESS.test(before) ? null : "envoi non confirmé par le site";
}

async function sendForms(settings) {
  if (!officeHours()) return { sent: 0 };
  const hour = parisNow().getHours();
  const runsLeft = Math.max(1, LAST_SEND_HOUR - hour);
  const budget = Math.ceil(Math.max(0, FORMS_PER_DAY - (await sentToday(true))) / runsLeft);
  if (!budget) return { sent: 0 };
  const statuses = settings.mode === "auto" ? ["valide", "brouillon"] : ["valide"];
  const { data: rows } = await db
    .from("prospects")
    .select("*")
    .in("status", statuses)
    .is("email", null)
    .ilike("notes", "%Formulaire de contact :%")
    .order("drafted_at", { ascending: true })
    .limit(budget);
  if (!rows?.length) return { sent: 0 };
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    note("Formulaires : navigateur non installé, rien n'est envoyé.");
    return { sent: 0 };
  }
  const browser = await chromium.launch();
  const now = () => new Date().toISOString();
  let sent = 0;
  try {
    for (const p of rows) {
      if (timeLeft() < 12 * MINUTES) break;
      const url = (p.notes.match(/Formulaire de contact : (\S+)/) || [])[1];
      const ctx = await browser.newContext({ locale: "fr-FR" });
      const page = await ctx.newPage();
      let problem;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await page.waitForTimeout(2500);
        if (CAPTCHA.test(await page.content())) problem = "test anti-robot";
        else problem = await withTimeout(fillForm(page, p, compose(p, false).text), 60_000, "délai dépassé");
      } catch (e) {
        problem = e.message.split("\n")[0].slice(0, 120);
      } finally {
        await ctx.close().catch(() => {});
      }
      const add = (line) => [p.notes, line].filter(Boolean).join("\n");
      await db
        .from("prospects")
        .update(
          problem
            ? {
                // Formulaire impossible : « À appeler » si on a son téléphone, sinon abandon.
                status: p.phone ? "sans_email" : "ignore",
                updated_at: now(),
                notes: add(`Formulaire non utilisable (${problem})${p.phone ? " : à appeler" : ""}`),
              }
            : {
                status: "contacte",
                followups: 1, // pas de relance possible sans adresse e-mail
                first_contact_at: now(),
                last_contact_at: now(),
                updated_at: now(),
                notes: add(`Contacté par le formulaire du site le ${now().slice(0, 10)}`),
              },
        )
        .eq("id", p.id);
      if (!problem) sent++;
    }
  } finally {
    await browser.close().catch(() => {});
  }
  return { sent };
}

// ------------------------------------------------------------------ 5. Réponses et récapitulatif

const WEBMAIL = /gmail|hotmail|outlook|yahoo|orange|free|sfr|laposte|wanadoo|icloud|live|bbox|neuf/;

// Texte de la réponse, sans la citation de notre message ni la signature.
async function replyExcerpt(source) {
  try {
    const { simpleParser } = await import("mailparser");
    const mail = await simpleParser(source);
    // Réponses envoyées en HTML seulement : on en tire le texte.
    const text =
      mail.text ||
      (mail.html || "")
        .replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ")
        .replace(/<br\s*\/?>|<\/p>|<\/div>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");
    const lines = [];
    for (const line of text.split("\n")) {
      if (
        /^>|^(Le|On) .{5,120}(a écrit|wrote)\s*:?\s*$|^-{2,}\s*$|^_{5,}|^De ?:|^From:/i.test(
          line.trim(),
        )
      )
        break;
      lines.push(line.trim());
    }
    return lines.join(" ").replace(/\s+/g, " ").trim().slice(0, 600);
  } catch {
    return "";
  }
}

async function checkReplies(box) {
  const contacted = await selectAll(() =>
    db
      .from("prospects")
      .select("id,name,email,website,status,notes,message_id,subject,first_contact_at")
      .in("status", ["contacte", "relance", "sans_reponse"]),
  );
  const byEmail = new Map();
  const byHost = new Map();
  const byMessageId = new Map();
  for (const p of contacted || []) if (p.message_id) byMessageId.set(p.message_id, p);
  const clean = (t) => norm(t || "").replace(/^(re|tr|fwd?)\s*:\s*/g, "").replace(/[^a-z0-9]/g, "");
  // Repli : objet identique, ou nom de l'agence cité par l'expéditeur, retenu seulement s'il ne
  // désigne qu'une seule agence (réponse depuis une autre adresse que celle contactée, ou
  // réponse à un message laissé par formulaire).
  const unique = (list) => (list.length === 1 ? list[0] : null);
  const bySubject = (subject) =>
    unique((contacted || []).filter((p) => p.subject && clean(p.subject) === clean(subject)).filter((p) => !/×|apporteur|proposition de partenariat|pour vos clients|pour vos copropri|demande de|collaboration/i.test(p.subject)));
  const byName = (text) => {
    const t = norm(text).replace(/[^a-z0-9]/g, "");
    return unique(
      (contacted || []).filter((p) => {
        const k = norm(p.name || "").replace(/[^a-z0-9]/g, "");
        return k.length >= 6 && t.includes(k);
      }),
    );
  };
  const unmatched = [];
  // Agences qui ont déjà répondu : leurs nouveaux messages ne sont pas signalés comme inconnus.
  const answeredRows = await selectAll(() =>
    db.from("prospects").select("email,website").in("status", ["repondu", "partenaire", "refus", "desinscrit"]),
  );
  const known = new Set(
    answeredRows.flatMap((r) => [r.email?.toLowerCase(), r.email?.split("@")[1], r.website && hostOf(r.website)]).filter(Boolean),
  );
  for (const p of contacted || []) {
    // Contactés par formulaire : leur réponse arrive d'une adresse du domaine de leur site.
    if (p.website) {
      const h = hostOf(p.website).replace(/^www\./, "");
      if (h && !WEBMAIL.test(h)) byHost.set(h, p);
    }
    if (!p.email) continue;
    byEmail.set(p.email.toLowerCase(), p);
    const h = p.email.split("@")[1];
    if (h && !WEBMAIL.test(h)) byHost.set(h, p);
  }
  let replies = 0;
  let bounces = 0;
  let unsubscribed = 0;
  const lock = await box.imap.getMailboxLock("INBOX");
  try {
    const since = new Date(Date.now() - 21 * 86_400_000);
    for await (const msg of box.imap.fetch({ since }, { envelope: true, source: true })) {
      const from = (msg.envelope?.from?.[0]?.address || "").toLowerCase();
      if (/mailer-daemon|postmaster/.test(from)) {
        const rawBounce = msg.source?.toString() || "";
        const body = rawBounce.toLowerCase();
        // Raison du refus : adresse inexistante (seul cas qui compte pour le frein anti-spam),
        // filtrage de l'expéditeur par le serveur du destinataire (serveurs d'IONOS sur une liste),
        // ou problème passager (boîte pleine, indisponible).
        const diag = (rawBounce.match(/Diagnostic-Code:[^\n]*(\n\s+[^\n]*)*/i) ||
          rawBounce.match(/\b[45]\d\d[ -][^\n]{0,200}/) || [""])[0];
        const kind = /5\.7\.|rbl|block|spam|policy|reputation|denied/i.test(diag)
          ? "filtrage"
          : /5\.2\.2|quota|full|pleine|\b4\d\d\b|\b4\.\d\.\d/i.test(diag)
            ? "passager"
            : "invalide";
        for (const [email, p] of byEmail) {
          if (!body.includes(email)) continue;
          byEmail.delete(email);
          if (kind === "invalide") {
            await db
              .from("prospects")
              .update({
                status: "erreur",
                notes: [p.notes, `Adresse e-mail invalide (message non remis) : ${email}`]
                  .filter(Boolean)
                  .join("\n"),
              })
              .eq("id", p.id);
            bounces++;
            continue;
          }
          // L'adresse existe : nouvel essai plus tard (deux fois au plus).
          const tries = ((p.notes || "").match(/Refusé par le serveur du destinataire/g) || []).length;
          await db
            .from("prospects")
            .update({
              ...(tries < 2 ? { status: "brouillon" } : {}),
              notes: [
                p.notes,
                `Refusé par le serveur du destinataire (${kind === "filtrage" ? "filtrage de l'expéditeur" : "boîte pleine ou indisponible"}) : ${tries < 2 ? "nouvel essai prévu" : "abandonné"}`,
              ]
                .filter(Boolean)
                .join("\n"),
            })
            .eq("id", p.id);
        }
        // Refus de filtrage déjà comptés à tort comme adresses invalides : corrigés.
        if (kind !== "invalide") {
          const to = (rawBounce.match(/(?:Final-Recipient|Original-Recipient):[^;]*;\s*<?([^\s>]+)/i) || [])[1];
          if (to) {
            const { data: wrong } = await db
              .from("prospects")
              .select("id,notes")
              .or(`email.ilike.${to},notes.ilike.*${to}*`)
              .ilike("notes", "%non remis%");
            for (const w of wrong || [])
              await db
                .from("prospects")
                .update({
                  notes: w.notes.replace(
                    /Adresse e-mail invalide \(message non remis\)[^\n]*/,
                    `Refusé par le serveur du destinataire (${kind === "filtrage" ? "filtrage de l'expéditeur" : "boîte pleine ou indisponible"}), l'adresse existe`,
                  ),
                })
                .eq("id", w.id);
          }
        }
        continue;
      }
      const raw = msg.source?.toString() || "";
      const head = raw.split(/\r?\n\r?\n/)[0] || "";
      // Désinscription par e-mail (lien « se désabonner » de la messagerie du destinataire) :
      // l'adresse n'est plus jamais contactée, quelle que soit sa fiche.
      if (/^\s*d[ée]sinscription\s*$|unsubscribe/i.test(msg.envelope?.subject || "") && from) {
        await db.from("prospect_optouts").upsert({ email: from }, { onConflict: "email", ignoreDuplicates: true });
        const { data: hit } = await db
          .from("prospects")
          .update({ status: "desinscrit", updated_at: new Date().toISOString() })
          .ilike("email", from)
          .neq("status", "desinscrit")
          .select("id");
        if (hit?.length) unsubscribed++;
        continue;
      }
      const refs = [msg.envelope?.inReplyTo, ...(head.match(/^(?:References|In-Reply-To):[\s\S]*?(?=\r?\n\S)/gim) || [])]
        .join(" ")
        .match(/<[^>]+>/g) || [];
      const subject = msg.envelope?.subject || "";
      const sender = `${msg.envelope?.from?.[0]?.name || ""} ${from}`;
      const p =
        refs.map((r) => byMessageId.get(r)).find(Boolean) ||
        byEmail.get(from) ||
        byHost.get(from.split("@")[1]) ||
        bySubject(subject) ||
        // Nom de l'agence : seulement pour un message qui parle de nous (réponse qui cite notre
        // e-mail ou notre nom), jamais pour un e-mail quelconque.
        (/spinelle/i.test(raw) ? byName(`${sender} ${raw.slice(0, 20000)}`) : null);
      if (
        !p &&
        /^\s*(re|tr|fwd?)\s*:/i.test(subject) &&
        from !== FROM_EMAIL.toLowerCase() &&
        !known.has(from) &&
        !known.has(from.split("@")[1])
      )
        unmatched.push(`${from} — ${subject.slice(0, 80)}`);
      // Réponses automatiques (accusé de réception, absence) : notées, sans compter comme une
      // vraie réponse, pour que la relance parte quand même.
      const auto =
        /^auto-submitted:\s*auto-(replied|generated)|^x-autoreply|^x-autorespond|^precedence:\s*(auto_reply|bulk|junk)/im.test(head) ||
        /r[ée]ponse automatique|automatic reply|auto(matic)?[- ]?reply|out of office|absent du|absente du|accusons (bonne )?r[ée]ception|avons bien re[çc]u votre (e-?mail|message|courriel|demande)|nous reviendrons vers vous dans les (plus )?brefs d[ée]lais/i.test(
          `${subject} ${raw.slice(0, 6000)}`,
        );
      if (p && auto) {
        if (!/Accusé de réception automatique/.test(p.notes || ""))
          await db
            .from("prospects")
            .update({ notes: [p.notes, "Accusé de réception automatique reçu (pas encore de vraie réponse)"].join("\n") })
            .eq("id", p.id);
        continue;
      }
      if (p && p.status !== "repondu") {
        // Extrait de la réponse, lisible dans l'intranet sans ouvrir la boîte e-mail.
        const excerpt = await replyExcerpt(msg.source);
        const date = new Date(msg.envelope?.date || Date.now());
        await db
          .from("prospects")
          .update({
            status: "repondu",
            replied_at: date.toISOString(),
            notes: [
              p.notes,
              `Réponse du ${date.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })} (${from}) : ${excerpt || "(voir la boîte e-mail)"}`,
            ]
              .filter(Boolean)
              .join("\n"),
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
  // Accusés de réception automatiques comptés à tort comme des réponses : remis en « contacté ».
  const { data: wronglyAnswered } = await db.from("prospects").select("id,notes,followups").eq("status", "repondu");
  for (const w of wronglyAnswered || []) {
    const last = [...(w.notes || "").matchAll(/Réponse du [^\n]*/g)].pop()?.[0] || "";
    if (/accusons (bonne )?r[ée]ception|avons bien re[çc]u votre (e-?mail|message|courriel|demande)|r[ée]ponse automatique|absent|nous reviendrons vers vous dans les (plus )?brefs d[ée]lais/i.test(last)) {
      await db
        .from("prospects")
        .update({
          status: w.followups ? "relance" : "contacte",
          replied_at: null,
          notes: `${w.notes}\nCette réponse était un accusé de réception automatique : la relance reste prévue`,
        })
        .eq("id", w.id);
    }
  }
  if (unsubscribed) note(`Désinscriptions reçues par e-mail : ${unsubscribed}`);
  if (unmatched.length)
    note(`Réponses non reliées à une agence (à vérifier dans la boîte) : ${unmatched.slice(0, 10).join(" ; ")}`);
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
  // Pas d'e-mail mais un téléphone : à appeler. Zones en saison et groupes qui répondent le mieux
  // d'abord ; un contact proposé n'est plus reproposé les semaines suivantes.
  const { data: noEmailPool } = await db
    .from("prospects")
    .select("id,name,phone,email,zone,contact_name,notes")
    .in("status", ["sans_email", "ignore"])
    .not("phone", "is", null)
    .not("notes", "ilike", "%Doublon%")
    .not("notes", "ilike", "%Proposé à l'appel%")
    .limit(400);
  const month = parisNow().getMonth() + 1;
  const score = (p) =>
    (weights?.get(groupKey(p)) ?? 1) * (ZONES[p.zone]?.season?.includes(month) ? 2 : 1);
  const noEmail = (noEmailPool || []).sort((a, b) => score(b) - score(a)).slice(0, 15);
  const today = new Date().toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
  for (const p of noEmail)
    await db
      .from("prospects")
      .update({ notes: [p.notes, `Proposé à l'appel le ${today}`].filter(Boolean).join("\n") })
      .eq("id", p.id);
  const callList = [
    answered?.length
      ? `\nOnt répondu cette semaine, à rappeler en priorité :\n${answered.map(line).join("\n")}\n`
      : "",
    toCall?.length
      ? `\nSans réponse après la relance, à appeler :\n${toCall.map(line).join("\n")}\n`
      : "",
    noEmail.length
      ? `\nPas d'e-mail trouvé, à appeler (tous les autres dans l'intranet, onglet « À appeler ») :\n${noEmail.map(line).join("\n")}\n`
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
  if (CONNECTION_TEST) {
    const box = await mailbox();
    await box.close();
    console.log(`Connexion à la boîte ${FROM_EMAIL} : envoi et réception OK.`);
    // Les serveurs de messagerie des destinataires sont-ils joignables (vérification d'adresses) ?
    const net = await import("node:net");
    for (const host of ["gmail-smtp-in.l.google.com", "mx00.ionos.fr"]) {
      const ok = await new Promise((resolve) => {
        const sock = net.connect({ host, port: 25, timeout: 8000 });
        sock.once("data", (d) => (resolve(d.toString().slice(0, 40)), sock.destroy()));
        sock.once("timeout", () => (resolve(false), sock.destroy()));
        sock.once("error", () => resolve(false));
      });
      console.log(`Port 25 ${host} : ${ok ? `ouvert (${ok.trim()})` : "fermé"}`);
    }
    for (const e of (process.env.VERIFY_TEST || "").split(",").filter(Boolean))
      console.log(`Vérification ${e} : ${await verifyAddress(e)}`);
    // Raisons des derniers messages non remis (diagnostic).
    const diag = await mailbox();
    const lock = await diag.imap.getMailboxLock("INBOX");
    try {
      const since = new Date(Date.now() - 14 * 86_400_000);
      for await (const msg of diag.imap.fetch({ since }, { envelope: true, source: true })) {
        const from = (msg.envelope?.from?.[0]?.address || "").toLowerCase();
        if (!/mailer-daemon|postmaster/.test(from)) continue;
        const raw = msg.source?.toString() || "";
        const to = (raw.match(/(?:Final-Recipient|Original-Recipient):[^;]*;\s*(\S+)/i) || [])[1] || "?";
        const why = (raw.match(/Diagnostic-Code:[^\n]*(\n\s+[^\n]*)*/i) || raw.match(/\b5\d\d[ -][^\n]{0,160}/) || [""])[0]
          .replace(/\s+/g, " ")
          .slice(0, 220);
        console.log(`Non remis ${msg.envelope?.date?.toISOString?.().slice(0, 10)} ${to} : ${why}`);
      }
    } finally {
      lock.release();
      await diag.close();
    }
    return;
  }
  const { data: settings, error } = await db
    .from("prospect_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !settings) throw new Error(`Réglages introuvables : ${error?.message}`);
  // Volume demandé par le gérant : le maximum raisonnable pour une seule boîte d'envoi, soit 80
  // nouveaux contacts par jour (environ 2 000 par mois), relances en plus. Ne remplace que la
  // valeur fixée précédemment (62) : un réglage fait dans l'intranet est respecté.
  if (settings.daily_limit === 62) {
    settings.daily_limit = 80;
    await db.from("prospect_settings").update({ daily_limit: 80 }).eq("id", 1);
    note("Plafond quotidien réglé à 80 nouveaux contacts (environ 2 000 par mois).");
  }
  // 1. D'abord les envois (messages préparés lors des passages précédents) : ils ne doivent
  //    jamais être empêchés par une préparation trop longue.
  if (!settings.paused) {
    const renamed = await renameSubjects();
    if (renamed) note(`Objets remplacés par « Demande de collaboration » (ou équivalent) : ${renamed}`);
    const fixed = await resolveErrors();
    if (fixed.retried || fixed.dropped)
      note(`Cas à vérifier traités : ${fixed.retried} relancés, ${fixed.dropped} écartés`);
    note(`Répartition : ${await loadWeights()}`);
  }
  if (process.env.SMTP_PASSWORD) {
    // Boîte inaccessible (mot de passe changé, blocage du fournisseur) : aucun e-mail ce passage,
    // mais formulaires et préparation continuent ; l'alerte apparaît dans le résumé de l'intranet.
    const box = await mailbox().catch((e) => {
      note(
        `ALERTE : connexion à la boîte ${FROM_EMAIL} refusée (${e.responseText || e.message}). Aucun e-mail envoyé ni réponse relevée : vérifier le mot de passe (secret SMTP_PASSWORD).`,
      );
      return null;
    });
    if (box) try {
      // Surveillance : plus de 3 h sans passage pendant les heures de bureau (horloges sautées,
      // panne) → ce passage rattrape le retard et le gérant est prévenu par e-mail.
      const gap = settings.last_run_at ? Date.now() - new Date(settings.last_run_at).getTime() : 0;
      const hour = parisNow().getHours();
      if (gap > 3 * 3_600_000 && officeHours() && hour >= 11 && !settings.paused) {
        const hours = Math.round(gap / 3_600_000);
        note(`ALERTE : aucun passage depuis ${hours} h, retard rattrapé par ce passage.`);
        await box
          .send({
            from: { name: "Prospection Spinelle", address: FROM_EMAIL },
            to: FROM_EMAIL,
            subject: "Alerte prospection : passages manqués, relance automatique",
            text: `Bonjour Tom,\n\nAucun passage de prospection n'avait tourné depuis ${hours} heures. Un passage vient d'être relancé automatiquement pour rattraper le retard : tu n'as rien à faire.\n\nSi ce message revient plusieurs jours de suite, préviens Claude.\n\nLa prospection Spinelle`,
          })
          .catch(() => {});
      }
      const r = await checkReplies(box);
      note(`Réponses détectées : ${r.replies}, adresses invalides : ${r.bounces}`);
      if (!settings.paused) {
        const sent = await sendBatch(settings, box);
        note(
          `Envoyés : ${sent.sent} premiers messages, ${sent.followups} relances (mode ${settings.mode})`,
        );
      }
      await weeklySummary(settings, box);
    } finally {
      await box.close();
    }
  } else {
    note("SMTP_PASSWORD absent : aucun envoi (les brouillons restent visibles dans l'intranet).");
  }

  // 1 bis. Formulaires de contact, à chaque passage (ne passent pas par la boîte d'envoi).
  if (!settings.paused) {
    const viaForms = await sendForms(settings).catch((e) => {
      note(`Formulaires : ${e.message}`);
      return { sent: 0 };
    });
    note(`Contactés par formulaire : ${viaForms.sent}`);
  }

  // 1 ter. Lot suivant vérifié à l'avance (fin de journée : le lot du lendemain est prêt).
  if (!settings.paused) {
    const next = await prepareNextBatch(settings).catch((e) => {
      note(`Vérification des adresses : ${e.message}`);
      return null;
    });
    if (next)
      note(
        `Prochain lot : ${next.ready} messages prêts et vérifiés pour ${next.target} prévus${next.dead ? `, ${next.dead} adresses inexistantes écartées avant envoi` : ""}`,
      );
  }

  // 2. Ensuite la préparation des prochains envois, dans le temps qui reste.
  if (SEND_ONLY) {
    note("Passage d'envoi seul (la préparation est faite par les passages complets).");
  } else if (settings.paused) {
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
      `Entreprises de l'annuaire (promoteurs, marchands de biens, syndics, patrimoine, investissement) : ${companies.checked} vérifiées, ${companies.added} avec site confirmé`,
    );
    // Contacts « sans e-mail » qui ont un site : on y cherche une fois un formulaire de contact.
    await db
      .from("prospects")
      .update({ status: "nouveau", crawled_at: null })
      .eq("status", "sans_email")
      .not("website", "is", null)
      .or("notes.is.null,and(notes.not.ilike.*Formulaire*,notes.not.ilike.*Aucun e-mail ni formulaire*)");
    // Contacts déjà classés « sans e-mail » faute de site : on cherche leur site une fois.
    await db
      .from("prospects")
      .update({ status: "nouveau", crawled_at: null })
      .eq("status", "sans_email")
      .is("website", null)
      .or("notes.is.null,notes.not.ilike.*Site cherché*");
    const enriched = await enrich();
    note(
      `Sites analysés : ${enriched.checked}, e-mail trouvé : ${enriched.withEmail}, formulaire de contact : ${enriched.forms}, sites retrouvés et vérifiés : ${enriched.found}`,
    );
    if (process.env.ANTHROPIC_API_KEY) {
      const drafted = await draftMessages(settings);
      note(`Messages rédigés : ${drafted}`);
      const total = Object.entries(usage).reduce((sum, [m, u]) => sum + costOf(m, u), 0);
      if (total)
        note(
          `Coût de la rédaction : ${total.toFixed(2)} $${drafted ? `, soit ${((total / drafted) * 100).toFixed(1)} centime(s) par message` : ""} (${Object.entries(usage)
            .map(([m, u]) => `${m} : ${u.calls} appels, ${costOf(m, u).toFixed(2)} $`)
            .join(" ; ")})`,
        );
    }
    else note("ANTHROPIC_API_KEY absente : pas de rédaction.");
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
if (import.meta.url === `file://${process.argv[1]}`) {
  // Bug connu de Node (connexion coupée pendant la lecture d'une page) : il ne concerne qu'un
  // site d'agence, il ne doit pas arrêter tout le passage.
  process.on("uncaughtException", (e) => {
    if (e?.code === "ERR_ASSERTION" && /undici/.test(e.stack || "")) {
      console.error("Connexion à un site interrompue (ignorée).");
      return;
    }
    console.error(e);
    process.exit(1);
  });
  let finished = false;
  process.on("beforeExit", () => {
    if (finished) return;
    finished = true;
    console.error(`Passage interrompu sans erreur visible. Dernières étapes :\n${log.slice(-3).join("\n")}`);
    process.exitCode = 1;
  });
  main()
    .then(() => (finished = true))
    .catch(async (e) => {
      finished = true;
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
}
