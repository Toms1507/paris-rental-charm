import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  type ErrorComponentProps,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useMemo, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { useScrollReveal } from "@/lib/reveal";
import { Footer } from "@/components/site/Footer";
import { CookieConsent } from "@/components/site/CookieConsent";
import { CITIES, SITE } from "@/content/site";
import { ADS_ID, GA_ID, gtagBootstrapScript, TRACKING_ENABLED } from "@/lib/analytics";
import { absoluteUrl, DEFAULT_IMAGE, jsonLdScript } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-24">
      {/* Les pages 404 ne doivent pas être indexées. */}
      <meta name="robots" content="noindex" />
      <div className="max-w-md text-center">
        <p className="text-7xl font-bold text-foreground">404</p>
        <h1 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-outline">
            Retour à l'accueil
          </Link>
          <Link to="/contact" className="btn-primary">
            Estimation gratuite
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error: caught, reset }: ErrorComponentProps) {
  // Depuis TanStack Start 1.168.60, l'erreur reçue n'est plus forcément une instance d'Error.
  const error = useMemo(
    () => (caught instanceof Error ? caught : new Error(String(caught))),
    [caught],
  );
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Cette page n'a pas pu se charger
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur est survenue de notre côté. Réessayez ou revenez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: SITE.name },
      { name: "theme-color", content: "#213F6C" },
      { name: "format-detection", content: "telephone=no" },
      { name: "geo.region", content: "FR-75" },
      { name: "geo.placename", content: "Paris" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:image", content: DEFAULT_IMAGE },
      { property: "og:image:width", content: "1600" },
      { property: "og:image:height", content: "1104" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DEFAULT_IMAGE },
      // Vérification Google Search Console (optionnel) : VITE_GOOGLE_SITE_VERIFICATION
      ...(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION
        ? [
            {
              name: "google-site-verification",
              content: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string,
            },
          ]
        : []),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Icônes : onglet du navigateur, résultats Google (multiples de 48 px), mobiles.
      { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { rel: "icon", href: "/brand/icon-48.png", type: "image/png", sizes: "48x48" },
      { rel: "icon", href: "/brand/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@400;500;700&display=swap",
      },
    ],
    scripts: [
      jsonLdScript({
        "@type": "LocalBusiness",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
        image: DEFAULT_IMAGE,
        // Logo lu par Google (fiche entreprise, résultats enrichis) : carré, au moins 112 px.
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/brand/logo-mark.png"),
          width: 483,
          height: 483,
        },
        description:
          "Conciergerie Airbnb et Booking à Paris et alentours : gestion complète de votre location courte durée.",
        email: SITE.email,
        telephone: SITE.phone.replace(/ /g, ""),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Paris",
          addressRegion: "Île-de-France",
          addressCountry: "FR",
        },
        geo: { "@type": "GeoCoordinates", latitude: 48.8566, longitude: 2.3522 },
        areaServed: CITIES.map((c) => ({ "@type": "City", name: c.name })),
        priceRange: "20 % des revenus locatifs",
        knowsAbout: [
          "Conciergerie Airbnb",
          "Gestion locative courte durée",
          "Location saisonnière",
          "Tarification dynamique",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services de conciergerie",
          itemListElement: [
            "Création et optimisation d'annonces Airbnb et Booking",
            "Gestion des voyageurs 7j/7",
            "Ménage hôtelier et linge",
            "Maintenance",
            "Tarification dynamique",
          ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
        },
      }),
      jsonLdScript({
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        inLanguage: "fr-FR",
        publisher: { "@id": `${SITE.url}/#organization` },
      }),
      ...(TRACKING_ENABLED
        ? [
            { children: gtagBootstrapScript() },
            { src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID || ADS_ID}`, async: true },
          ]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Active les animations d'apparition seulement si JavaScript tourne. Filet de sécurité :
            si la page ne s'initialise pas en 3 s, tout est affiché. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js-reveal');setTimeout(function(){if(!document.documentElement.classList.contains('reveal-ready'))document.documentElement.classList.remove('js-reveal')},3000);",
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useScrollReveal();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
      </div>
      <CookieConsent />
    </QueryClientProvider>
  );
}
