import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { detectMode, getPublicApi } from "@/components/gestion/PmsProvider";
import { todayParis } from "@/lib/pms/dates";
import type { FoundStay } from "@/lib/pms/store";
import { SITE } from "@/content/site";

// Lien fixe du livret d'un logement, collé une fois pour toutes dans les messages programmés
// (gratuits) d'Airbnb, Booking et Abritel. Airbnb y ajoute le code de confirmation du voyageur
// (?code=HM…) : le livret personnel s'ouvre directement. Sinon le voyageur saisit son code ou
// sa date d'arrivée.
export const Route = createFileRoute("/livret/$link")({
  head: () => ({
    meta: [
      { title: "Votre séjour | Spinelle Conciergerie" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    code: typeof s["code"] === "string" ? (s["code"] as string).slice(0, 40) : undefined,
  }),
  ssr: false,
  component: LivretLookup,
});

function LivretLookup() {
  const { link } = Route.useParams();
  const { code: codeParam } = Route.useSearch();
  const navigate = useNavigate();
  const [info, setInfo] = useState<FoundStay | null | undefined>(undefined);
  const [code, setCode] = useState(codeParam ?? "");
  const [arrival, setArrival] = useState(todayParis());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(c: string | null, a: string | null) {
    setBusy(true);
    setError(null);
    try {
      const api = getPublicApi(await detectMode());
      const res = await api.findStay(link, c, a);
      setInfo(res);
      if (res?.guest_token) {
        navigate({ to: "/sejour/$token", params: { token: res.guest_token }, replace: true });
        return;
      }
      if (res && (c || a)) {
        setError(
          c
            ? "Code introuvable. Vérifiez-le, ou indiquez plutôt votre date d'arrivée. / Code not found: check it, or enter your arrival date instead."
            : "Séjour introuvable à cette date. Contactez-nous. / No stay found for this date, please contact us.",
        );
      }
    } catch {
      setInfo(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void lookup(codeParam?.trim() ? codeParam : null, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link]);

  function submit(e: FormEvent, by: "code" | "date") {
    e.preventDefault();
    void lookup(by === "code" ? code : null, by === "date" ? arrival : null);
  }

  if (info === undefined || (busy && !error && codeParam))
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand text-sm text-muted-foreground">
        …
      </div>
    );
  if (info === null)
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-6 text-center text-sm">
        Ce lien n'est plus valide. / This link is no longer valid.
      </div>
    );

  return (
    <div className="min-h-screen bg-sand">
      <div className="relative h-48 bg-ink">
        {info.photo_url && (
          <img
            src={info.photo_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-md px-5 pb-5 text-white">
          <p className="text-sm opacity-80">Spinelle Conciergerie</p>
          <h1 className="font-display text-2xl font-semibold">{info.property}</h1>
        </div>
      </div>
      <main className="mx-auto max-w-md space-y-4 px-4 py-5">
        <p className="text-sm">
          Accédez à votre livret d'accueil personnel (accès, wifi, bons plans, assistant 24 h/24).
          <span className="block text-muted-foreground">
            Open your personal guidebook (access, wifi, tips, 24/7 assistant).
          </span>
        </p>
        <form
          onSubmit={(e) => submit(e, "code")}
          className="space-y-2 rounded-2xl border border-border bg-white p-4"
        >
          <label className="block text-sm font-semibold">
            Code de réservation / Booking code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="HMABC12345"
              className="mt-1 block w-full rounded-md border border-input px-3 py-2 font-mono uppercase"
            />
          </label>
          <button className="btn-primary w-full" disabled={busy || !code.trim()}>
            Ouvrir mon livret / Open
          </button>
        </form>
        <form
          onSubmit={(e) => submit(e, "date")}
          className="space-y-2 rounded-2xl border border-border bg-white p-4"
        >
          <label className="block text-sm font-semibold">
            Ou votre date d'arrivée / Or your arrival date
            <input
              type="date"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input px-3 py-2"
            />
          </label>
          <button className="btn-outline w-full" disabled={busy}>
            Continuer / Continue
          </button>
        </form>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <p className="text-center text-xs text-muted-foreground">
          <a href={SITE.whatsapp} className="underline">
            WhatsApp {SITE.phone}
          </a>
        </p>
      </main>
    </div>
  );
}
