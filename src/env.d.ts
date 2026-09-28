/// <reference types="vite/client" />

// Variables d'environnement optionnelles pour le SEO et le suivi Google Ads / Analytics.
interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_GOOGLE_SITE_VERIFICATION?: string;
  readonly VITE_GA_ID?: string;
  readonly VITE_GOOGLE_ADS_ID?: string;
  readonly VITE_GOOGLE_ADS_LEAD_LABEL?: string;
}
