import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Camera,
  Check,
  Clock,
  KeyRound,
  LineChart,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Wrench,
} from "lucide-react";
import heroImage from "@/assets/hero-salon.jpg";
import heroImageMobile from "@/assets/hero-salon-1080.jpg";
import roomImage from "@/assets/room.jpg";
import rooftops from "@/assets/paris-rooftops.jpg";
import { LeadForm } from "@/components/site/LeadForm";
import { RevenueSimulator } from "@/components/site/RevenueSimulator";
import { ServiceGrid } from "@/components/site/ServiceGrid";
import { AirbnbLogo, ReviewCard } from "@/components/site/AirbnbReviews";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CITIES, FAQ, REVIEWS } from "@/content/site";
import { stagger } from "@/lib/reveal";
import { pageHead } from "@/lib/seo";

const TITLE = "Conciergerie Airbnb Paris – Gestion courte durée | Spinelle";
const DESCRIPTION =
  "Conciergerie Airbnb à Paris et en Île-de-France : gestion complète de votre location courte durée, tarification dynamique et ménage hôtelier. Estimation gratuite.";

export const Route = createFileRoute("/")({
  head: () => pageHead({ title: TITLE, description: DESCRIPTION, path: "/" }),
  component: HomePage,
});

const HERO_BENEFITS = [
  { icon: Clock, label: "Du temps libéré" },
  { icon: TrendingUp, label: "Des revenus optimisés" },
  { icon: Wrench, label: "Un logement entretenu" },
  { icon: LineChart, label: "Une occupation maximisée" },
  { icon: ShieldCheck, label: "L'esprit tranquille" },
  { icon: MessageCircle, label: "Voyageurs gérés 7j/7" },
  { icon: Sparkles, label: "Ménage hôtelier" },
];

const PILLARS = [
  {
    icon: Clock,
    title: "Libérez votre temps",
    text: "Messages, arrivées, ménage, imprévus : le quotidien de votre location ne vous concerne plus. Vous recevez vos revenus, nous faisons le reste.",
  },
  {
    icon: TrendingUp,
    title: "Maximisez vos revenus",
    text: "Annonce optimisée, prix ajustés chaque jour selon la demande parisienne, réactivité en moins d'une heure : nous travaillons chaque jour pour remplir votre calendrier au meilleur prix.",
  },
  {
    icon: ShieldCheck,
    title: "Louez sans stress",
    text: "Voyageurs sélectionnés, contrôle après chaque départ, maintenance préventive et démarches légales suivies : votre bien est entre de bonnes mains.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: KeyRound,
    title: "Remise des clés",
    text: "Après une visite et la signature d'un mandat sans engagement de durée, vous nous confiez les clés. Nous préparons le logement et réalisons le shooting photo.",
  },
  {
    icon: CalendarClock,
    title: "Gestion complète",
    text: "Annonces en ligne, réservations, voyageurs, ménage, linge et maintenance : nous gérons tout, 7 jours sur 7.",
  },
  {
    icon: LineChart,
    title: "Suivi des performances",
    text: "Chaque mois, vous recevez un récapitulatif clair : nuits louées, prix moyen, revenus versés et axes d'amélioration.",
  },
];

const PROMISES = [
  "Un interlocuteur unique et joignable",
  "Aucun frais de mise en place",
  "Sans engagement de durée",
  "Transparence totale sur vos revenus",
];

// Une promesse à la fois, qui apparaît puis s'efface en fondu.
function RotatingBenefits() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % HERO_BENEFITS.length), 3200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div
      data-reveal="up"
      style={stagger(4, 150)}
      className="relative mt-14 h-12 w-full"
      aria-label="Nos engagements"
    >
      {HERO_BENEFITS.map((b, i) => (
        <p
          key={b.label}
          aria-hidden={i !== index}
          className={`absolute inset-0 flex items-center justify-center gap-3 font-[family-name:var(--font-display)] text-2xl whitespace-nowrap text-white transition-all duration-1000 ease-out sm:text-3xl ${
            i === index ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-sm"
          }`}
        >
          <b.icon className="size-6 shrink-0 text-[#98CCEB] sm:size-7" />
          {b.label}
        </p>
      ))}
    </div>
  );
}

function HomePage() {
  return (
    <>
      {/* Hero : photo en fond plein écran, voile sombre uniforme, texte centré */}
      <section className="relative isolate flex min-h-[min(calc(100svh-4.5rem),54rem)] items-center overflow-hidden bg-[var(--ink)] text-white">
        <img
          src={heroImage}
          srcSet={`${heroImageMobile} 1080w, ${heroImage} 1920w`}
          sizes="100vw"
          alt="Salon haussmannien lumineux avec moulures, cheminée en marbre et parquet en point de Hongrie, prêt pour la location courte durée"
          width={1920}
          height={1280}
          fetchPriority="high"
          decoding="async"
          className="hero-zoom absolute inset-0 -z-20 size-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.4)_100%)]"
        />
        <div className="container-page flex w-full flex-col items-center py-20 text-center lg:py-28">
          {/* H1 porteur du mot-clé (même rendu que le petit titre) ; le slogan reste en grand. */}
          <h1
            data-reveal="down"
            className="eyebrow font-[family-name:var(--font-sans)] !text-white/85"
          >
            Conciergerie Airbnb à Paris et alentours
          </h1>
          <p
            data-reveal="up"
            style={stagger(1, 150)}
            className="mt-5 font-[family-name:var(--font-display)] text-4xl leading-[1.08] font-semibold tracking-[-0.015em] text-balance text-white sm:text-5xl lg:text-[3.75rem]"
          >
            Profitez de votre temps,
            <br />
            <span className="text-[#98CCEB]">on s'occupe de vos voyageurs.</span>
          </p>
          <p
            data-reveal="up"
            style={stagger(2, 150)}
            className="mt-6 max-w-2xl text-base text-white/85 sm:text-lg"
          >
            Spinelle Conciergerie gère votre location courte durée de A&nbsp;à&nbsp;Z et maximise
            vos revenus, à Paris, en proche banlieue et même partout ailleurs en France.
          </p>
          <div
            data-reveal="up"
            style={stagger(3, 150)}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <a href="#estimation" className="btn-primary">
              Audit gratuit de mon bien <ArrowRight className="size-4" />
            </a>
            <a
              href="#simulateur"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-white/40 bg-white/10 px-6 py-3.5 text-[0.95rem] font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Simuler mes revenus
            </a>
          </div>
          <RotatingBenefits />
        </div>
      </section>

      {/* Piliers */}
      <section className="container-page py-20">
        <div data-reveal="up" className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Pourquoi nous confier votre bien</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Louer en courte durée, sans les contraintes</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <article
              key={p.title}
              data-reveal="up"
              style={stagger(i)}
              className="card-hover rounded-2xl border border-border bg-background p-7 text-center"
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--sand)]">
                <p.icon className="size-5 text-primary" />
              </span>
              <h3 className="mt-5 text-xl">{p.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Simulateur */}
      <section id="simulateur" className="scroll-mt-24 bg-[var(--sand)] py-20">
        <div className="container-page">
          <div data-reveal="up" className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Simulateur de revenus</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Combien peut rapporter votre logement&nbsp;?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Renseignez les caractéristiques de votre bien et découvrez en quelques secondes une
              estimation de vos revenus nets en location courte durée.
            </p>
          </div>
          <div data-reveal="zoom" className="mt-12">
            <RevenueSimulator />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-20">
        <div data-reveal="up" className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow">Nos services</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">On s'occupe de tout</h2>
            <p className="mt-4 text-muted-foreground">
              De la mise en ligne de l'annonce au ménage entre deux séjours, chaque étape est prise
              en charge par notre équipe parisienne.
            </p>
          </div>
          <Link to="/services" className="btn-outline">
            Tous nos services
          </Link>
        </div>
        <div className="mt-12">
          <ServiceGrid />
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-[var(--ink)] py-20 text-white">
        <div className="container-page">
          <div data-reveal="up" className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Comment ça marche</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Trois étapes pour louer l'esprit libre</h2>
          </div>
          <ol className="mt-12 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {HOW_IT_WORKS.map((step, i) => (
              <li key={step.title} className="contents">
                <div
                  data-reveal="up"
                  style={stagger(i, 180)}
                  className="rounded-2xl border border-white/15 bg-white/5 p-7 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary font-semibold">
                      {i + 1}
                    </span>
                    <step.icon className="size-5 text-white/70" />
                  </div>
                  <h3 className="mt-5 text-xl">{step.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-white/75">{step.text}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div
                    aria-hidden
                    data-reveal="left"
                    style={stagger(i + 1, 180)}
                    className="flex items-center justify-center text-[#98CCEB]"
                  >
                    <ArrowRight className="hidden size-6 lg:block" />
                    <ArrowDown className="size-6 lg:hidden" />
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div data-reveal="up" className="mt-12 text-center">
            <a href="#estimation" className="btn-primary">
              Je me lance
            </a>
          </div>
        </div>
      </section>

      {/* Qui sommes-nous */}
      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <div data-reveal="left" className="grid grid-cols-2 gap-4">
          <img
            src={roomImage}
            alt="Chambre parisienne préparée avec du linge hôtelier pour des voyageurs"
            loading="lazy"
            width={1200}
            height={912}
            className="aspect-[3/4] h-full w-full rounded-2xl object-cover"
          />
          <img
            src={rooftops}
            alt="Toits de Paris au coucher du soleil"
            loading="lazy"
            width={1200}
            height={800}
            className="mt-12 aspect-[3/4] h-full w-full rounded-2xl object-cover"
          />
        </div>
        <div data-reveal="right">
          <p className="eyebrow">Qui sommes-nous</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">
            Une conciergerie parisienne, à taille humaine
          </h2>
          <p className="mt-5 text-muted-foreground">
            Spinelle Conciergerie est née d'un constat simple&nbsp;: louer son logement en courte
            durée rapporte bien plus qu'une location classique, mais demande un temps et une
            disponibilité que peu de propriétaires ont. Notre mission est de vous offrir le meilleur
            des deux mondes.
          </p>
          <p className="mt-4 text-muted-foreground">
            Nous intervenons dans les 20 arrondissements de Paris et en proche banlieue, avec une
            équipe qui connaît chaque quartier, sa clientèle et sa saisonnalité.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {PROMISES.map((p) => (
              <li key={p} className="flex gap-2.5 text-[0.95rem]">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Nos zones&nbsp;: </span>
            {CITIES.map((c, i) => (
              <span key={c.slug}>
                <Link
                  to="/conciergerie-airbnb/$ville"
                  params={{ ville: c.slug }}
                  className="whitespace-nowrap underline-offset-4 hover:text-primary hover:underline"
                >
                  {c.name}
                </Link>
                {i < CITIES.length - 1 && " · "}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--sand)] py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div data-reveal="left">
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Vos questions, nos réponses</h2>
            <p className="mt-4 text-muted-foreground">
              Une autre question&nbsp;? Écrivez-nous, nous répondons sous 24&nbsp;h.
            </p>
            <Link to="/faq" className="btn-outline mt-6">
              Toutes les questions
            </Link>
          </div>
          <div className="space-y-3">
            {FAQ.slice(0, 6).map((item, i) => (
              <details
                key={item.q}
                data-reveal="up"
                style={stagger(i, 80)}
                className="group rounded-xl border border-border bg-background px-5 py-4 transition-colors hover:border-primary/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {item.q}
                  <span className="text-xl text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Avis */}
      <section className="container-page py-20">
        <div data-reveal="up" className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow flex items-center gap-2">
              <AirbnbLogo className="h-4" /> Avis vérifiés Airbnb
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Des voyageurs satisfaits</h2>
            <p className="mt-4 text-muted-foreground">
              Les avis publics laissés par nos voyageurs, notés 5 étoiles sur 5.
            </p>
          </div>
          <Link to="/avis" className="btn-outline">
            Tous les avis
          </Link>
        </div>
        <Carousel data-reveal="up" opts={{ align: "start", loop: true }} className="mt-10">
          <CarouselContent>
            {REVIEWS.map((r) => (
              <CarouselItem key={r.name + r.from} className="md:basis-1/2 lg:basis-1/3">
                <ReviewCard review={r} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-6 flex justify-end gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </section>

      {/* Audit gratuit */}
      <section id="estimation" className="scroll-mt-24 pb-20">
        <div className="container-page">
          <div className="grid items-start gap-10 rounded-3xl bg-[var(--sand)] p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
            <div data-reveal="left" className="lg:sticky lg:top-28">
              <p className="eyebrow">Audit gratuit</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">
                Découvrez le vrai potentiel de votre bien
              </h2>
              <p className="mt-4 text-muted-foreground">
                Décrivez votre logement&nbsp;: nous analysons les réservations réelles de votre
                quartier et vous envoyons une estimation personnalisée sous 24&nbsp;h, gratuitement
                et sans engagement.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Photos professionnelles offertes",
                  "Annonce optimisée pour Airbnb et Booking",
                  "Tout est mis en œuvre pour maximiser votre occupation",
                  "Commission unique de 20 %, sans frais cachés",
                ].map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal="right">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
