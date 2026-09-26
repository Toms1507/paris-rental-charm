import { createFileRoute, Link } from "@tanstack/react-router";
import rooftops from "@/assets/paris-rooftops.jpg";
import { ZONES } from "@/content/site";

const TITLE = "Conciergerie Airbnb à Paris et alentours : nos zones — Spinelle Conciergerie";
const DESCRIPTION =
  "Nous gérons des locations courte durée dans les 20 arrondissements de Paris et en proche banlieue : Boulogne, Neuilly, Levallois, Montreuil, Vincennes, Saint-Ouen, Clichy et alentours.";

const ARRONDISSEMENTS = [
  "Paris 1er — Louvre",
  "Paris 2e — Bourse",
  "Paris 3e — Marais",
  "Paris 4e — Hôtel de Ville",
  "Paris 5e — Panthéon",
  "Paris 6e — Saint-Germain",
  "Paris 7e — Invalides",
  "Paris 8e — Champs-Élysées",
  "Paris 9e — Opéra",
  "Paris 10e — Canal Saint-Martin",
  "Paris 11e — Bastille",
  "Paris 12e — Bercy",
  "Paris 13e — Butte-aux-Cailles",
  "Paris 14e — Montparnasse",
  "Paris 15e — Beaugrenelle",
  "Paris 16e — Trocadéro",
  "Paris 17e — Batignolles",
  "Paris 18e — Montmartre",
  "Paris 19e — Buttes-Chaumont",
  "Paris 20e — Belleville",
];

export const Route = createFileRoute("/zones")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/zones" },
    ],
    links: [{ rel: "canonical", href: "/zones" }],
  }),
  component: ZonesPage,
});

function ZonesPage() {
  return (
    <>
      <section className="border-b border-border bg-[var(--sand)] py-16">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Zones desservies</p>
            <h1 className="mt-4 text-4xl sm:text-5xl">Paris et alentours</h1>
            <p className="mt-5 text-muted-foreground">
              Nous interviennons dans tout Paris intra-muros et en première couronne. Notre équipe
              est sur place, ce qui nous permet d'assurer les arrivées tardives, les urgences et le
              ménage entre deux séjours rapprochés.
            </p>
            <Link to="/contact" className="btn-primary mt-8">
              Vérifier si votre bien est éligible
            </Link>
          </div>
          <img
            src={rooftops}
            alt="Toits de Paris au coucher du soleil"
            loading="lazy"
            width={1200}
            height={800}
            className="rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="text-3xl sm:text-4xl">Paris, les 20 arrondissements</h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ARRONDISSEMENTS.map((a) => (
            <li key={a} className="rounded-lg border border-border px-4 py-3 text-sm">
              {a}
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-3xl sm:text-4xl">Proche banlieue</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {ZONES.map((z) => (
            <article key={z.city} className="rounded-xl border border-border p-6">
              <h3 className="text-lg">{z.city}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{z.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
