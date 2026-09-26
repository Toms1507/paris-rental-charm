import { Link } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { NAV, SITE, ZONES } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-[var(--sand)]">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Spinelle Conciergerie
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Conciergerie Airbnb et Booking à Paris et alentours. Nous gérons votre location courte
            durée de A à Z : annonces, voyageurs, ménage, maintenance et conformité.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Navigation</p>
          <ul className="mt-3 space-y-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Zones desservies</p>
          <ul className="mt-3 space-y-2">
            {ZONES.map((z) => (
              <li key={z.city} className="text-sm text-muted-foreground">
                {z.city}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-primary" /> {SITE.email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Paris et alentours
            </li>
          </ul>
          <Link to="/contact" className="btn-primary mt-5">
            Estimation gratuite
          </Link>
        </div>
      </div>
      <div className="container-page border-t border-border py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Spinelle Conciergerie — Tous droits réservés.
      </div>
    </footer>
  );
}
