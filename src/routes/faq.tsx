import { createFileRoute } from "@tanstack/react-router";
import { LeadForm } from "@/components/site/LeadForm";
import { FAQ } from "@/content/site";
import { pageHead } from "@/lib/seo";

const TITLE = "FAQ conciergerie Airbnb Paris — Spinelle Conciergerie";
const DESCRIPTION =
  "Commission, revenus, plafond des 90 nuits, plateformes, ménage, assurance : les réponses aux questions les plus fréquentes des propriétaires parisiens.";

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/faq",
      breadcrumb: [{ name: "FAQ", path: "/faq" }],
      jsonLd: [
        {
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        },
      ],
    }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div data-reveal="up" className="container-page [&>*]:max-w-3xl">
          <p className="eyebrow">Questions fréquentes</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Vos questions, nos réponses</h1>
        </div>
      </section>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <h2 className="text-2xl sm:text-3xl">Vous ne trouvez pas votre réponse&nbsp;?</h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            Chaque logement est différent. Décrivez-nous le vôtre&nbsp;: nous vous répondons sous
            24&nbsp;h, gratuitement et sans engagement.
          </p>
          <a href="#estimation" className="btn-primary mt-6">
            Poser ma question
          </a>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-xl border border-border px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {item.q}
                <span className="text-xl text-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="estimation" className="scroll-mt-24 bg-[var(--sand)] py-20">
        <div className="container-page mx-auto max-w-3xl">
          <LeadForm />
        </div>
      </section>
    </>
  );
}
