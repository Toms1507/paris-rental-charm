import { useEffect, useState } from "react";
import { OPEN_SETTINGS_EVENT, readConsent, saveConsent, TRACKING_ENABLED } from "@/lib/analytics";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!TRACKING_ENABLED) return;
    if (readConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (value: "granted" | "denied") => {
    saveConsent(value);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background p-4 shadow-[var(--shadow-soft)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-md sm:rounded-xl sm:border"
    >
      <p className="text-sm font-semibold">Vos choix de cookies</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Avec votre accord, nous mesurons l'audience du site et l'efficacité de nos annonces Google.
        Vous pouvez changer d'avis à tout moment depuis la page{" "}
        <a href="/confidentialite" className="underline">
          Confidentialité
        </a>
        .
      </p>
      {/* Refuser doit être aussi simple qu'accepter (recommandation CNIL). */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="btn-outline justify-center"
        >
          Tout refuser
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="btn-primary justify-center"
        >
          Tout accepter
        </button>
      </div>
    </div>
  );
}
