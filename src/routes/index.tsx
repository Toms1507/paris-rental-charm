import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Clock, Home, Sparkles, Star, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-paris.jpg";
import roomImage from "@/assets/room.jpg";
import { LeadForm } from "@/components/site/LeadForm";
import { REVIEWS, SERVICES, STEPS, ZONES, POSTS } from "@/content/site";

const TITLE = "Conciergerie Airbnb Paris | Gestion locative courte durée — Spinelle Conciergerie";
const DESCRIPTION =
  "Spinelle Conciergerie gère votre location courte durée à Paris et alentours : annonces Airbnb et Booking, voyageurs, ménage, linge, maintenance et conformité. Estimation de revenus gratuite en 24 h.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: "conciergerie Airbnb Paris, gestion Airbnb Paris, location courte durée Paris, conciergerie Booking Paris" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-[var(--sand)]">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow">Conciergerie Airbnb — Paris et alentours</p>
            <h1 className="mt-4 text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
              Louez votre bien en courte durée.
              <br />
              <span className="text-primary">On s'occupe de tout.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Annonces Airbnb et Booking optimisées, tarification dynamique, accueil des voyageurs
              7j/7, ménage hôtelier et maintenance. Vous encaissez, sans y consacrer une minute.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary">
                Estimation gratuite en 24 h <ArrowRight className="size-4" />
              </Link>
              <Link to="/services" className="btn-outline">
                Découvrir nos services
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
              {[
                { k: "+30 %", v: "de revenus en moyenne" },
                { k: "< 1 h", v: "de temps de réponse" },
                { k: "20 %", v: "de commission, tout compris" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-[family-name:var(--font-display)] text-2xl text-primary">
                    {s.k}
                  </dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-soft)]">
            <img
              src={heroImage}
              alt="Appartement parisien haussmannien préparé pour la location courte durée"
              width={1600}
              height={1104}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA form */}
      <section id="estimation" className="container-page -mt-10 lg:-mt-14">
        <div className="mx-auto max-w-4xl">
          <LeadForm />
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Nos services</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Une gestion locative complète, clé en main</h2>
          <p className="mt-4 text-muted-foreground">
            De la mise en ligne de l'annonce au ménage entre deux séjours, chaque étape de votre
            location courte durée est prise en charge par notre équipe parisienne.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article key={s.title} className="rounded-xl border border-border p-6">
              <Sparkles className="size-5 text-primary" />
              <h3 className="mt-4 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[var(--sand)] py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Comment ça marche</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Votre logement en ligne en 10 jours</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <article key={s.title} className="rounded-xl border border-border bg-background p-6">
                <h3 className="text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </article>
            ))}
          </div>
          <Link to="/contact" className="btn-primary mt-10">
            Je veux une estimation de revenus
          </Link>
        </div>
      </section>

      {/* Why us */}
      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={roomImage}
            alt="Chambre parisienne préparée avec du linge hôtelier pour des voyageurs"
            loading="lazy"
            width={1200}
            height={912}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="eyebrow">Pourquoi Spinelle</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">
            Le marché parisien, connu quartier par quartier
          </h2>
          <ul className="mt-6 space-y-5">
            {[
              {
                icon: TrendingUp,
                t: "Revenus maximisés",
                d: "Tarification ajustée chaque jour selon la saison, les salons et les événements parisiens.",
              },
              {
                icon: Clock,
                t: "Zéro charge mentale",
                d: "Messages, arrivées, départs, imprévus : nous gérons, y compris le week-end.",
              },
              {
                icon: BadgeCheck,
                t: "Conformité assurée",
                d: "Enregistrement en mairie, plafond des 120 jours, taxe de séjour et assurance.",
              },
              {
                icon: Home,
                t: "Votre bien respecté",
                d: "Sélection des voyageurs, contrôle après chaque départ, maintenance préventive.",
              },
            ].map((item) => (
              <li key={item.t} className="flex gap-4">
                <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">{item.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-[var(--sand)] py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">Avis de propriétaires</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">Ils nous confient leur logement</h2>
            </div>
            <Link to="/avis" className="btn-outline">
              Tous les avis
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {REVIEWS.slice(0, 3).map((r) => (
              <article key={r.name} className="rounded-xl border border-border bg-background p-6">
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm">{r.text}</p>
                <p className="mt-4 text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.place}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Zones */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Zones desservies</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Paris et sa proche banlieue</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ZONES.map((z) => (
            <article key={z.city} className="rounded-xl border border-border p-6">
              <h3 className="text-lg">{z.city}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{z.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Blog teaser */}
      <section className="bg-[var(--sand)] py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">Le blog</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">Conseils pour les propriétaires</h2>
            </div>
            <Link to="/blog" className="btn-outline">
              Tous les articles
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {POSTS.slice(0, 3).map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="rounded-xl border border-border bg-background p-6 transition-colors hover:border-primary"
              >
                <p className="text-xs text-muted-foreground">{p.readingTime} de lecture</p>
                <h3 className="mt-2 text-lg">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page py-20">
        <div className="grid items-center gap-10 rounded-2xl border border-border bg-background p-8 shadow-[var(--shadow-soft)] lg:grid-cols-2 lg:p-12">
          <div>
            <h2 className="text-3xl sm:text-4xl">Combien peut rapporter votre bien ?</h2>
            <p className="mt-4 text-muted-foreground">
              Décrivez votre logement : type de bien, surface, quartier, ville. Nous vous envoyons
              une estimation de revenus personnalisée sous 24 h, gratuitement et sans engagement.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>✓ Aucun frais de mise en place</li>
              <li>✓ Sans engagement de durée</li>
              <li>✓ Réponse d'un interlocuteur unique</li>
            </ul>
          </div>
          <LeadForm compact />
        </div>
      </section>
    </>
  );
}
