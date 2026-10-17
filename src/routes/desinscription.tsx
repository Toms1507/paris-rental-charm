import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SITE } from "@/content/site";

// Page du lien de désinscription des e-mails de prospection. La désinscription demande un clic
// (les antivirus de messagerie ouvrent les liens automatiquement : pas de désinscription à l'ouverture).
export const Route = createFileRoute("/desinscription")({
  validateSearch: (search: Record<string, unknown>) => ({
    t: typeof search["t"] === "string" ? search["t"] : "",
  }),
  head: () => ({
    meta: [
      { title: `Désinscription | ${SITE.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Unsubscribe,
});

function Unsubscribe() {
  const { t } = Route.useSearch();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function confirm() {
    setState("sending");
    const res = await fetch(`/api/desinscription?t=${encodeURIComponent(t)}`, {
      method: "POST",
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }

  return (
    <section className="container-page py-24">
      <div className="mx-auto max-w-lg text-center">
        {state === "done" ? (
          <>
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <h1 className="mt-4 text-3xl">C'est noté</h1>
            <p className="mt-3 text-muted-foreground">
              Vous ne recevrez plus de message de {SITE.name}. Nous vous prions de nous excuser pour
              la gêne occasionnée.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl">Ne plus recevoir nos messages</h1>
            <p className="mt-3 text-muted-foreground">
              Confirmez pour ne plus recevoir aucun message de {SITE.name} à cette adresse.
            </p>
            <button
              type="button"
              onClick={confirm}
              disabled={!t || state === "sending"}
              className="btn-primary mt-8"
            >
              {state === "sending" && <Loader2 className="size-4 animate-spin" />}
              Confirmer la désinscription
            </button>
            {state === "error" && (
              <p className="mt-4 text-sm text-destructive">
                Le lien semble invalide. Écrivez-nous à {SITE.email} : nous vous retirons
                immédiatement de notre liste.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
