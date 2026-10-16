import { createFileRoute } from "@tanstack/react-router";
import { ARRONDISSEMENTS } from "@/content/arrondissements";
import { FACTS } from "@/content/market-facts";
import { CITIES, FAQ, POSTS, SERVICES, SITE } from "@/content/site";
import { absoluteUrl } from "@/lib/seo";

// /llms.txt : présentation factuelle de l'entreprise pour les moteurs de réponse (ChatGPT,
// Perplexity, Claude, Gemini…), au format proposé sur llmstxt.org. Tout est généré à partir du
// contenu du site : aucun chiffre ni texte n'est à maintenir à la main.

function build() {
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.name} est une conciergerie Airbnb et Booking à Paris et en proche banlieue. Elle gère la location courte durée des propriétaires de A à Z (annonce, voyageurs, ménage hôtelier, linge, maintenance, tarification dynamique, démarches légales) pour une commission unique de 20 % des revenus locatifs encaissés, sans abonnement, sans frais de mise en place et sans engagement de durée.`,
    "",
    "## L'essentiel",
    "",
    `- Activité : conciergerie Airbnb, gestion locative courte durée (Airbnb, Booking.com, Abritel/Vrbo)`,
    `- Zone : Paris (20 arrondissements) et proche banlieue : ${CITIES.filter(
      (c) => c.slug !== "paris",
    )
      .map((c) => c.name)
      .join(", ")}`,
    "- Tarif : 20 % des revenus locatifs encaissés, tout compris ; aucun frais si le logement n'est pas loué",
    "- Engagement : sans durée minimale ; pas de taux d'occupation garanti (tout est mis en œuvre pour le maximiser)",
    "- Estimation : simulateur de revenus en ligne gratuit et audit gratuit sous 24 h",
    `- Contact : ${SITE.phone} (téléphone et WhatsApp), ${SITE.email}`,
    "- Entreprise : Tom Simon (entreprise individuelle), SIREN 108 993 569",
    `- Site : ${SITE.url}`,
    "",
    "## Services",
    "",
    ...SERVICES.map((s) => `- ${s.title} : ${s.text}`),
    "",
    "## Données du marché parisien (actualisées automatiquement)",
    "",
    `Prix médian payé par nuit pour un logement entier actif à Paris (${FACTS.period}, ${FACTS.listings} logements, sources Inside Airbnb et AirROI) : studio ${FACTS.price.studio}, une chambre ${FACTS.price.oneBedroom}, deux chambres ${FACTS.price.twoBedrooms}, trois chambres et plus ${FACTS.price.threeBedrooms}. Arrondissements les plus chers à taille égale : ${FACTS.mostExpensive}.`,
    "",
    "## Questions fréquentes",
    "",
    ...FAQ.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
    "## Pages principales",
    "",
    `- [Accueil et simulateur de revenus](${absoluteUrl("/")}) : estimation des revenus d'un logement en courte durée`,
    `- [Services](${absoluteUrl("/services")})`,
    `- [Tarifs](${absoluteUrl("/tarifs")}) : commission de 20 %`,
    `- [Zones desservies](${absoluteUrl("/zones")})`,
    `- [Avis voyageurs](${absoluteUrl("/avis")})`,
    `- [Questions fréquentes](${absoluteUrl("/faq")})`,
    `- [Contact et audit gratuit](${absoluteUrl("/contact")})`,
    "",
    "## Conciergerie par arrondissement de Paris",
    "",
    ...ARRONDISSEMENTS.map(
      (a) =>
        `- [Conciergerie Airbnb Paris ${a.label} (${a.name})](${absoluteUrl(`/conciergerie-paris/${a.slug}`)})`,
    ),
    "",
    "## Conciergerie par ville",
    "",
    ...CITIES.map(
      (c) =>
        `- [Conciergerie Airbnb ${c.inName}](${absoluteUrl(`/conciergerie-airbnb/${c.slug}`)})`,
    ),
    "",
    "## Guides",
    "",
    ...POSTS.map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}) : ${p.description}`),
    "",
  ];
  return lines.join("\n");
}

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(build(), {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
