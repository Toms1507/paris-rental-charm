import { createFileRoute } from "@tanstack/react-router";
import { LeadForm } from "@/components/site/LeadForm";
import { FAQ } from "@/content/site";

const TITLE = "FAQ conciergerie Airbnb Paris — Spinelle Conciergerie";
const DESCRIPTION =
  "Commission, revenus, limite des 120 jours, plateformes, ménage, assurance : les réponses aux questions les plus fréquentes des propriétaires parisiens.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div className="container-page max-w-3xl">
          <p className="eyebrow">Questions fréquentes</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Vos questions, nos réponses</h1>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="mx-auto max-w-3xl divide-y divide-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer list-none font-semibold">{item.q}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-[var(--sand)] py-20">
        <div className="container-page mx-auto max-w-3xl">
          <LeadForm />
        </div>
      </section>
    </>
  );
}
