import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { NAV, SITE } from "@/content/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export function Footer() {
  return (
    <footer className="mt-24 bg-[var(--ink)] text-white">
      {/* Bandeau d'appel */}
      <div className="container-page border-b border-white/10 py-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
              Prêt à louer l'esprit libre&nbsp;?
            </p>
            <p className="mt-2 text-[0.95rem] text-white/70">
              Recevez sous 24&nbsp;h une estimation gratuite et sans engagement.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/" hash="estimation" className="btn-primary">
              Audit gratuit <ArrowRight className="size-4" />
            </Link>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-white/30 px-6 py-3.5 text-[0.95rem] font-semibold transition-colors hover:bg-white/10"
            >
              <WhatsAppIcon className="size-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl">
            Spinelle <span className="eyebrow ml-1 !text-[oklch(0.82_0.07_235)]">Conciergerie</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
            Nous gérons votre location courte durée de A&nbsp;à&nbsp;Z&nbsp;: annonce, voyageurs,
            ménage, maintenance et conformité, à Paris, en proche banlieue et au-delà.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Navigation</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Contact</p>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <WhatsAppIcon className="size-4 text-[#25D366]" />
                <span className="whitespace-nowrap">{SITE.phone}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Mail className="size-4 text-[oklch(0.82_0.07_235)]" /> {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-[oklch(0.82_0.07_235)]" /> Paris et alentours
            </li>
          </ul>
        </div>
      </div>

      <div className="container-page border-t border-white/10 py-6 text-xs text-white/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Spinelle Conciergerie. Tous droits réservés.</span>
          <span className="flex gap-5">
            <Link to="/mentions-legales" className="transition-colors hover:text-white">
              Mentions légales
            </Link>
            <Link to="/confidentialite" className="transition-colors hover:text-white">
              Confidentialité et cookies
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
