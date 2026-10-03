import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV, SITE } from "@/content/site";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-[96rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="Spinelle Conciergerie, accueil"
        >
          <img
            src="/brand/logo.png"
            alt="Spinelle Conciergerie"
            width={1376}
            height={452}
            fetchPriority="high"
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex xl:gap-11">
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

        <div className="flex items-center gap-3">
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener"
            aria-label="Nous écrire sur WhatsApp"
            title="Nous écrire sur WhatsApp"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border text-[#25D366] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
          >
            <WhatsAppIcon />
          </a>
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
          </div>
        </nav>
      )}
      <span className="sr-only">{SITE.tagline}</span>
    </header>
  );
}
