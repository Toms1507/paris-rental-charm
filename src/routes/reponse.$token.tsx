import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Pencil } from "lucide-react";
import { detectMode, getPublicApi } from "@/components/gestion/PmsProvider";
import { formatDateTime, formatDay } from "@/lib/pms/dates";
import type { Escalation, PublicApi } from "@/lib/pms/store";
import { cn } from "@/lib/utils";

// Page ouverte depuis le lien WhatsApp : le gérant valide la réponse proposée par l'assistant,
// ou écrit la sienne. Le voyageur la voit aussitôt dans son livret. Pas de validation
// automatique à l'ouverture du lien (WhatsApp ouvre les liens pour en faire un aperçu).
export const Route = createFileRoute("/reponse/$token")({
  head: () => ({
    meta: [
      { title: "Réponse au voyageur | Spinelle" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  ssr: false,
  component: AnswerPage,
});

function AnswerPage() {
  const { token } = Route.useParams();
  const [api, setApi] = useState<PublicApi | null>(null);
  const [esc, setEsc] = useState<Escalation | null | undefined>(undefined);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [learn, setLearn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(a: PublicApi) {
    try {
      const e = await a.getEscalation(token);
      setEsc(e);
      setText(e?.final_answer ?? e?.proposed_answer ?? "");
    } catch {
      setEsc(null);
    }
  }

  useEffect(() => {
    detectMode().then((m) => {
      const a = getPublicApi(m);
      setApi(a);
      void load(a);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function send(answer: string) {
    if (!api || !answer.trim()) return;
    setBusy(true);
    setError(null);
    try {
      if (!(await api.answerEscalation(token, answer, learn))) throw new Error("Envoi impossible");
      await load(api);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (esc === undefined)
    return <div className="flex min-h-screen items-center justify-center bg-sand text-sm">…</div>;
  if (!esc)
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-6 text-center text-sm">
        Lien introuvable ou expiré.
      </div>
    );

  const answered = esc.status !== "en_attente";
  const changed = text.trim() !== (esc.proposed_answer ?? "").trim();

  return (
    <div className="min-h-screen bg-sand pb-10">
      <header className="bg-ink px-4 pb-5 pt-6 text-white">
        <div className="mx-auto max-w-lg">
          <p className="text-sm opacity-80">Spinelle · Réponse au voyageur</p>
          <h1 className="font-display text-xl font-semibold">{esc.property}</h1>
          <p className="text-sm opacity-90">
            {esc.guest_name ?? "Voyageur"} · {formatDay(esc.check_in)} → {formatDay(esc.check_out)}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        <section className="rounded-2xl border border-border bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Question · {formatDateTime(esc.created_at)}
          </div>
          <p className="mt-1 whitespace-pre-line">{esc.question}</p>
          {esc.reason && (
            <p className="mt-2 text-xs text-amber-800">Pourquoi je vous demande : {esc.reason}</p>
          )}
        </section>

        {answered ? (
          <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <CheckCircle2 className="size-5" /> Réponse envoyée{" "}
              {esc.answered_at ? `· ${formatDateTime(esc.answered_at)}` : ""}
            </div>
            <p className="mt-2 whitespace-pre-line text-sm">{esc.final_answer}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Le voyageur la voit dans son livret.
            </p>
          </section>
        ) : (
          <section className="space-y-3 rounded-2xl border border-border bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {editing ? "Votre réponse" : "Réponse proposée"}
            </div>
            {editing ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                autoFocus
                className="w-full rounded-lg border border-input px-3 py-2 text-sm"
              />
            ) : (
              <p className="whitespace-pre-line rounded-lg bg-sand p-3 text-sm">
                {esc.proposed_answer}
              </p>
            )}
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={learn}
                onChange={(e) => setLearn(e.target.checked)}
                className="mt-0.5 size-4"
              />
              <span>
                Ajouter au livret du logement
                <span className="block text-xs text-muted-foreground">
                  L'assistant saura répondre seul à cette question la prochaine fois.
                </span>
              </span>
            </label>
            {error && <p className="text-sm text-red-700">{error}</p>}
            {editing ? (
              <div className="flex gap-2">
                <button
                  className="btn-outline flex-1"
                  onClick={() => {
                    setText(esc.proposed_answer ?? "");
                    setEditing(false);
                  }}
                >
                  Annuler
                </button>
                <button
                  className="btn-primary flex-1"
                  disabled={busy || !text.trim()}
                  onClick={() => send(text)}
                >
                  {busy ? "Envoi…" : changed ? "Envoyer ma réponse" : "Envoyer"}
                </button>
              </div>
            ) : (
              <div className="grid gap-2">
                <button
                  className={cn("btn-primary flex items-center justify-center gap-2 py-3")}
                  disabled={busy || !esc.proposed_answer}
                  onClick={() => send(esc.proposed_answer ?? "")}
                >
                  <CheckCircle2 className="size-5" />{" "}
                  {busy ? "Envoi…" : "Oui, envoyer cette réponse"}
                </button>
                <button
                  className="btn-outline flex items-center justify-center gap-2 py-3"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="size-4" /> Non, je réponds autrement
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
