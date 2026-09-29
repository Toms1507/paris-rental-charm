import {
  ArrowRight,
  BadgeCheck,
  Camera,
  MessageCircle,
  Search,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { SERVICES } from "@/content/site";
import { stagger } from "@/lib/reveal";

// Une icône par carte, dans l'ordre de SERVICES.
const SERVICE_ICONS = [Camera, Search, TrendingUp, MessageCircle, Sparkles, Wrench, BadgeCheck];

/**
 * Grille des services + carte d'appel à l'action. Avec 7 services, la carte d'appel occupe
 * 2 colonnes sur 3 en grand écran et 1 colonne sur 2 en tablette : la grille tombe toujours juste.
 */
export function ServiceGrid({ ctaHref = "#estimation" }: { ctaHref?: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s, i) => {
        const Icon = SERVICE_ICONS[i] ?? Sparkles;
        return (
          <article
            key={s.title}
            data-reveal="up"
            style={stagger(i % 3)}
            className="card-hover rounded-2xl border border-border bg-background p-6"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="size-5 text-primary" />
            </span>
            <h3 className="mt-5 text-lg">{s.title}</h3>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted-foreground">{s.text}</p>
          </article>
        );
      })}
      <a
        href={ctaHref}
        data-reveal="up"
        style={stagger(1)}
        className="flex flex-col justify-between gap-6 rounded-2xl bg-primary p-7 card-hover text-primary-foreground lg:col-span-2"
      >
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl">
            Votre bien mérite une gestion professionnelle
          </p>
          <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-primary-foreground/85">
            Recevez sous 24&nbsp;h une analyse de votre logement et une estimation de revenus fondée
            sur les données de votre quartier.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-[0.95rem] font-semibold">
          Demander mon audit gratuit <ArrowRight className="size-4" />
        </span>
      </a>
    </div>
  );
}
