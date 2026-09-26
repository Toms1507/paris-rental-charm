import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  full_name: z.string().trim().min(2, "Merci d'indiquer votre nom").max(100),
  email: z.string().trim().email("Adresse email invalide").max(255),
  phone: z.string().trim().min(6, "Merci d'indiquer un numéro valide").max(30),
  property_type: z.string().trim().max(60).optional(),
  bedrooms: z.string().trim().max(30).optional(),
  surface: z.string().trim().max(30).optional(),
  district: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1500).optional(),
});

const PROPERTY_TYPES = ["Studio", "2 pièces", "3 pièces", "4 pièces ou plus", "Maison", "Loft", "Autre"];
const BEDROOMS = ["0 (studio)", "1", "2", "3", "4 et plus"];

export function LeadForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(form.entries()) as Record<string, string>;
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Merci de vérifier vos informations.");
      return;
    }

    setStatus("sending");
    const { error: insertError } = await supabase.from("leads").insert(parsed.data);
    if (insertError) {
      setStatus("idle");
      setError("L'envoi a échoué. Merci de réessayer dans un instant.");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-border bg-background p-8 text-center shadow-[var(--shadow-soft)]">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h3 className="mt-4 text-xl">Demande envoyée, merci !</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Nous étudions votre bien et revenons vers vous sous 24 h avec une estimation de revenus
          personnalisée.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-background p-6 shadow-[var(--shadow-soft)] sm:p-8"
    >
      <p className="eyebrow">Estimation gratuite en 1 minute</p>
      <h3 className="mt-2 text-2xl">Parlez-nous de votre bien</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Réponse sous 24 h avec une projection de revenus. Sans engagement.
      </p>

      <div className={`mt-6 grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <label className="block text-sm">
          <span className="font-medium">Nom et prénom *</span>
          <input name="full_name" required maxLength={100} className="field-input mt-1.5" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Email *</span>
          <input
            name="email"
            type="email"
            required
            maxLength={255}
            className="field-input mt-1.5"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Téléphone *</span>
          <input name="phone" type="tel" required maxLength={30} className="field-input mt-1.5" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Type de bien</span>
          <select name="property_type" className="field-input mt-1.5" defaultValue="">
            <option value="">Sélectionner…</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Nombre de chambres</span>
          <select name="bedrooms" className="field-input mt-1.5" defaultValue="">
            <option value="">Sélectionner…</option>
            {BEDROOMS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Surface (m²)</span>
          <input name="surface" maxLength={30} placeholder="35" className="field-input mt-1.5" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Quartier / arrondissement</span>
          <input
            name="district"
            maxLength={80}
            placeholder="Montmartre, 18e"
            className="field-input mt-1.5"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Ville</span>
          <input name="city" maxLength={80} placeholder="Paris" className="field-input mt-1.5" />
        </label>
        <label className={`block text-sm ${compact ? "" : "sm:col-span-2"}`}>
          <span className="font-medium">Précisions (facultatif)</span>
          <textarea
            name="message"
            rows={3}
            maxLength={1500}
            placeholder="Étage, ascenseur, équipements, disponibilités…"
            className="field-input mt-1.5"
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <button type="submit" disabled={status === "sending"} className="btn-primary mt-6 w-full">
        {status === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Envoi…
          </>
        ) : (
          "Recevoir mon estimation gratuite"
        )}
      </button>
      <p className="mt-3 text-xs text-muted-foreground">
        Vos informations ne servent qu'à vous répondre et ne sont jamais transmises à des tiers.
      </p>
    </form>
  );
}
