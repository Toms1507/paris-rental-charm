// Suivi Google Analytics 4 + Google Ads avec Consent Mode v2 (conforme CNIL : rien n'est
// déposé avant l'accord du visiteur). Tout est désactivé tant que les identifiants ne sont
// pas renseignés dans les variables d'environnement :
//   VITE_GA_ID                  ex. G-XXXXXXXXXX
//   VITE_GOOGLE_ADS_ID          ex. AW-123456789
//   VITE_GOOGLE_ADS_LEAD_LABEL  libellé de l'action de conversion « Demande d'estimation »

const env = import.meta.env;
export const GA_ID = (env.VITE_GA_ID as string | undefined) || "";
export const ADS_ID = (env.VITE_GOOGLE_ADS_ID as string | undefined) || "";
const ADS_LEAD_LABEL = (env.VITE_GOOGLE_ADS_LEAD_LABEL as string | undefined) || "";

export const TRACKING_ENABLED = Boolean(GA_ID || ADS_ID);

export const CONSENT_KEY = "spinelle-consent";
// La CNIL recommande de redemander le choix au bout de 6 mois.
export const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182;
export const OPEN_SETTINGS_EVENT = "spinelle:cookie-settings";

type Consent = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Script inline placé dans le <head> : consentement refusé par défaut, puis restauration du choix mémorisé. */
export function gtagBootstrapScript() {
  const ids = [GA_ID, ADS_ID].filter(Boolean);
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'denied', wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
try {
  var c = JSON.parse(localStorage.getItem('${CONSENT_KEY}') || 'null');
  if (c && c.v === 'granted' && Date.now() - c.t < ${CONSENT_MAX_AGE_MS}) {
    gtag('consent', 'update', {
      ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
} catch (e) {}
gtag('js', new Date());
${ids.map((id) => `gtag('config', '${id}', { allow_enhanced_conversions: true });`).join("\n")}
`;
}

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as { v: Consent; t: number };
    if (Date.now() - c.t > CONSENT_MAX_AGE_MS) return null;
    return c.v;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ v: value, t: Date.now() }));
  } catch {
    // Stockage indisponible (navigation privée) : le choix vaut pour la page en cours.
  }
  window.gtag?.("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

/** À appeler quand une demande d'estimation est envoyée avec succès. */
export function trackLead(lead: { email: string; phone: string; city?: string | undefined }) {
  if (!window.gtag) return;
  // Conversions améliorées : Google hache ces données avant envoi, et ne les utilise qu'avec consentement.
  window.gtag("set", "user_data", {
    email: lead.email,
    phone_number: normalizePhone(lead.phone),
  });
  window.gtag("event", "generate_lead", { currency: "EUR", value: 1, lead_city: lead.city });
  if (ADS_ID && ADS_LEAD_LABEL) {
    window.gtag("event", "conversion", { send_to: `${ADS_ID}/${ADS_LEAD_LABEL}` });
  }
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return `+33${digits.slice(1)}`;
  return digits;
}
