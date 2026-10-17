import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { LockKeyhole, Menu, X } from "lucide-react";
import { NAV, SITE } from "@/content/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center justify-between gap-3 px-5 sm:h-20 sm:gap-6 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="flex min-w-0 shrink items-center"
          aria-label="Spinelle Conciergerie, accueil"
        >
          <img
            src="/brand/logo-mark.png"
            alt=""
            width={483}
            height={483}
            fetchPriority="high"
            className="size-10 shrink-0 sm:size-12"
          />
          <span className="ml-2 flex min-w-0 items-baseline gap-1.5 sm:ml-2.5 sm:gap-2">
            <span className="font-[family-name:var(--font-display)] text-[1.4rem] font-semibold tracking-tight sm:text-2xl">
              Spinelle
            </span>
            <span className="eyebrow max-[359px]:hidden lg:max-xl:hidden max-sm:!text-[0.6rem] max-sm:!tracking-[0.14em]">
              Conciergerie
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-11">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[0.95rem] font-medium text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-[0.95rem] font-medium text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener"
            aria-label="Nous écrire sur WhatsApp"
            title="Nous écrire sur WhatsApp"
            className="inline-flex size-10 items-center justify-center rounded-full border sm:size-11 border-border text-[#25D366] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
          >
            <WhatsAppIcon />
          </a>
          {/* Accès réservé à l'équipe (connexion obligatoire) */}
          <Link
            to="/gestion"
            aria-label="Intranet (accès réservé)"
            title="Intranet (accès réservé)"
            className="hidden size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:inline-flex"
          >
            <LockKeyhole className="size-[18px]" />
          </Link>
          <Link to="/" hash="estimation" className="btn-primary hidden sm:inline-flex">
            Audit gratuit
          </Link>
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-md border border-border lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background lg:hidden">
          <div className="container-page flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/"
              hash="estimation"
              onClick={() => setOpen(false)}
              className="btn-primary mt-3"
            >
              Audit gratuit
            </Link>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener"
              className="btn-outline mt-2 gap-2"
            >
              <WhatsAppIcon className="size-4 text-[#25D366]" /> WhatsApp
            </a>
            <Link
              to="/gestion"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 border-t border-border pt-4 text-sm font-medium text-muted-foreground"
            >
              <LockKeyhole className="size-4" /> Intranet (accès réservé)
            </Link>
          </div>
        </nav>
      )}
      <span className="sr-only">{SITE.tagline}</span>
    </header>
  );
}
