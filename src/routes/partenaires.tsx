import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Handshake, Loader2, Repeat, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { SITE } from "@/content/site";
import { submitLead } from "@/lib/leads";
import { stagger } from "@/lib/reveal";
import { absoluteUrl, pageHead } from "@/lib/seo";

// Page destinée aux professionnels de l'immobilier (agences, notaires, syndics, chasseurs,
// relocation) : ils recommandent à Spinelle les propriétaires qui veulent louer en courte durée.

const TITLE = "Partenaires immobiliers : recommandez Spinelle | Conciergerie Paris";
const DESCRIPTION =
  "Agences immobilières, notaires, syndics : recommandez Spinelle Conciergerie à vos clients propriétaires qui veulent louer en courte durée à Paris. Apport rémunéré.";

const ACTIVITIES = [
  "Agence immobilière (transaction)",
  "Agence immobilière (gestion locative)",
  "Notaire",
  "Syndic de copropriété",
  "Chasseur immobilier",
  "Agence de relocation",
  "Autre",
];

const BENEFITS = [
  {
    icon: Handshake,
    title: "Une solution pour vos clients",
    text: "Un propriétaire veut louer en courte durée, une activité que vous ne gérez pas ? Vous lui recommandez un partenaire sérieux au lieu de le laisser partir sans réponse.",
  },
  {
    icon: ShieldCheck,
    title: "Un partenaire transparent",
    text: "Commission unique de 20 % des revenus encaissés, sans abonnement ni engagement, conformité légale vérifiée avant toute mise en ligne : vos clients sont entre de bonnes mains.",
  },
  {
    icon: Repeat,
    title: "Un apport rémunéré",
    text: "Chaque propriétaire que vous nous présentez et qui nous confie son logement donne lieu à une rémunération d'apport, définie ensemble par écrit avant toute recommandation.",
  },
];

const STEPS = [
  "Vous nous présentez un propriétaire, avec son accord.",
  "Nous réalisons l'audit gratuit de son logement sous 24 h, avec une estimation fondée sur les données réelles du marché.",
  "S'il nous confie la gestion, vous percevez votre rémunération d'apport selon les conditions convenues.",
];

const FAQ_PARTNERS = [
  {
    q: "Spinelle est-elle une concurrente de mon agence ?",
    a: "Non. Spinelle Conciergerie ne fait ni transaction ni gestion locative longue durée : uniquement la gestion de location courte durée. Les propriétaires que vous nous présentez restent vos clients pour tout le reste.",
  },
  {
    q: "Comment est fixée la rémunération d'apport ?",
    a: "Elle est convenue ensemble et formalisée par écrit avant la première recommandation, selon votre activité et le volume envisagé. Contactez-nous pour en discuter.",
  },
  {
    q: "Quels logements vous intéressent ?",
    a: "Les appartements et maisons à Paris (20 arrondissements) et en proche banlieue, du studio au grand appartement, dont le propriétaire souhaite louer en courte durée dans le respect de la réglementation.",
  },
  {
    q: "Mes clients sont-ils démarchés ensuite ?",
    a: "Non. Nous ne contactons que les propriétaires qui ont donné leur accord, et uniquement au sujet de leur logement.",
  },
];

export const Route = createFileRoute("/partenaires")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/partenaires",
      breadcrumb: [{ name: "Partenaires", path: "/partenaires" }],
      jsonLd: [
        {
          "@type": "FAQPage",
          mainEntity: FAQ_PARTNERS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        },
        {
          "@type": "WebPage",
          name: TITLE,
          url: absoluteUrl("/partenaires"),
          about: { "@id": `${SITE.url}/#organization` },
        },
      ],
    }),
  component: PartnersPage,
});

function PartnersPage() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div data-reveal="up" className="container-page [&>*]:max-w-3xl">
          <p className="eyebrow">Partenaires immobiliers</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">
            Vos clients veulent louer en courte durée&nbsp;? Recommandez-nous.
          </h1>
          <p className="mt-5 text-muted-foreground">
            Agences immobilières, notaires, syndics, chasseurs d'appartements, agences de
            relocation&nbsp;: Spinelle Conciergerie gère la location courte durée des propriétaires
            que vous nous présentez, à Paris et en proche banlieue. Vous apportez une solution à vos
            clients, et chaque apport est rémunéré.
          </p>
          <a href="#devenir-partenaire" className="btn-primary mt-8">
            Devenir partenaire <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <article
              key={b.title}
              data-reveal="up"
              style={stagger(i)}
              className="rounded-2xl border border-border p-7"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-[var(--sand)]">
                <b.icon className="size-5 text-primary" />
              </span>
              <h2 className="mt-5 text-xl">{b.title}</h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{b.text}</p>
            </article>
          ))}
        </div>

        <div data-reveal="up" className="mt-16 max-w-3xl">
          <h2 className="text-3xl">Comment ça marche</h2>
          <ol className="mt-6 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="pt-1.5 text-[0.98rem]">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div data-reveal="up" className="mt-16 max-w-3xl">
          <h2 className="text-3xl">Questions fréquentes</h2>
          <div className="mt-6 space-y-3">
            {FAQ_PARTNERS.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border px-5 py-4 transition-colors hover:border-primary/40"
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

      <section id="devenir-partenaire" className="scroll-mt-24 bg-[var(--sand)] py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div data-reveal="left">
            <h2 className="text-3xl sm:text-4xl">Devenir partenaire</h2>
            <p className="mt-4 text-muted-foreground">
              Laissez-nous vos coordonnées&nbsp;: nous vous rappelons sous 24&nbsp;h pour convenir
              ensemble des modalités du partenariat.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              Ou directement&nbsp;:{" "}
              <a href={`mailto:${SITE.email}`} className="text-primary underline">
                {SITE.email}
              </a>{" "}
              · {SITE.phone}
            </p>
          </div>
          <div data-reveal="right">
            <PartnerForm />
          </div>
        </div>
      </section>
    </>
  );
}

const schema = z.object({
  full_name: z.string().trim().min(2, "Merci d'indiquer votre nom").max(100),
  company: z.string().trim().min(2, "Merci d'indiquer votre société").max(100),
  email: z.string().trim().email("Adresse email invalide").max(255),
  phone: z.string().trim().min(6, "Merci d'indiquer un numéro valide").max(30),
  activity: z.string().trim().max(60).optional(),
  city: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1500).optional(),
});

function PartnerForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Merci de vérifier vos informations.");
      return;
    }
    setStatus("sending");
    const d = parsed.data;
    const { ok } = await submitLead({
      full_name: d.full_name,
      email: d.email,
      phone: d.phone,
      property_type: d.activity,
      city: d.city,
      message: [`Société : ${d.company}`, d.message].filter(Boolean).join("\n"),
      source: "partenaire",
    });
    if (!ok) {
      setStatus("idle");
      setError("L'envoi a échoué. Merci de réessayer dans un instant.");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-border bg-background p-8 text-center shadow-[var(--shadow-soft)]">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h3 className="mt-4 text-xl">Merci, demande bien reçue&nbsp;!</h3>
        <p className="mt-2 text-[0.95rem] text-muted-foreground">
          Nous vous rappelons sous 24&nbsp;h pour parler du partenariat.
        </p>
      </div>
    );
  }

  const field = "field-input";
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-border bg-background p-5 shadow-[var(--shadow-soft)] sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Nom et prénom *
          <input name="full_name" autoComplete="name" className={`${field} mt-1.5`} />
        </label>
        <label className="text-sm font-medium">
          Société *
          <input name="company" autoComplete="organization" className={`${field} mt-1.5`} />
        </label>
        <label className="text-sm font-medium">
          Email professionnel *
          <input name="email" type="email" autoComplete="email" className={`${field} mt-1.5`} />
        </label>
        <label className="text-sm font-medium">
          Téléphone *
          <input name="phone" type="tel" autoComplete="tel" className={`${field} mt-1.5`} />
        </label>
        <label className="text-sm font-medium">
          Activité
          <select name="activity" defaultValue="" className={`${field} mt-1.5`}>
            <option value="" disabled>
              Sélectionner…
            </option>
            {ACTIVITIES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Ville ou secteur
          <input name="city" placeholder="Paris 11e" className={`${field} mt-1.5`} />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium">
        Message (facultatif)
        <textarea name="message" rows={3} className={`${field} mt-1.5`} />
      </label>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="btn-primary mt-6 w-full">
        {status === "sending" ? <Loader2 className="size-4 animate-spin" /> : null}
        Devenir partenaire
      </button>
      <p className="mt-3 text-xs text-muted-foreground">
        Vos informations ne servent qu'à vous recontacter au sujet du partenariat.{" "}
        <a href="/confidentialite" className="underline">
          En savoir plus
        </a>
      </p>
    </form>
  );
}
