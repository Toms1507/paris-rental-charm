import { createFileRoute } from "@tanstack/react-router";
import { buildIcal } from "@/lib/pms/ical";
import { PLATFORMS, type Platform } from "@/lib/pms/types";

// Calendrier unifié d'un logement, à importer dans Airbnb, Booking.com et Abritel : une réservation
// prise sur une plateforme bloque automatiquement les mêmes dates sur les autres.
export const Route = createFileRoute("/api/pms/calendrier/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = params.token.replace(/\.ics$/, "");
        const { anonClient } = await import("@/lib/pms/cron.server");
        const { data, error } = await anonClient().rpc("pms_get_export", { p_token: token });
        if (error || !data) return new Response("Calendrier introuvable", { status: 404 });
        const view = data as {
          property: { name: string };
          reservations: {
            id: string;
            check_in: string;
            check_out: string;
            platform: Platform;
            status: string;
          }[];
        };
        const ics = buildIcal(
          `${view.property.name} (Spinelle)`,
          view.reservations
            // Les blocages importés ne sont pas réexportés, pour éviter les boucles entre plateformes.
            .filter((r) => r.status === "confirmee" || r.platform === "direct")
            .map((r) => ({
              uid: r.id,
              start: r.check_in,
              end: r.check_out,
              summary: `Réservé (${PLATFORMS[r.platform]?.label ?? r.platform})`,
            })),
        );
        return new Response(ics, {
          headers: {
            "content-type": "text/calendar; charset=utf-8",
            "cache-control": "no-store",
            "x-robots-tag": "noindex",
          },
        });
      },
    },
  },
});
