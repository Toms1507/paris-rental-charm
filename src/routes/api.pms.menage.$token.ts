import { createFileRoute } from "@tanstack/react-router";
import { buildIcal } from "@/lib/pms/ical";
import type { CleanerView } from "@/lib/pms/types";

// Planning des ménages d'un prestataire, à ajouter dans l'agenda de son téléphone
// (Google Agenda, Apple Calendrier…) : il se met à jour tout seul.
export const Route = createFileRoute("/api/pms/menage/$token")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const token = params.token.replace(/\.ics$/, "");
        const { anonClient } = await import("@/lib/pms/cron.server");
        const { data, error } = await anonClient().rpc("pms_get_cleaner", { p_token: token });
        if (error || !data) return new Response("Planning introuvable", { status: 404 });
        const view = data as CleanerView;
        const portal = `${new URL(request.url).origin}/menage/${token}`;
        const ics = buildIcal(
          `Ménages Spinelle – ${view.cleaner.name}`,
          view.tasks.map(({ task, property, next }) => ({
            uid: `menage-${task.id}`,
            start: task.date,
            end: task.date,
            startTime: task.window_start ?? "11:00",
            endTime: task.window_end ?? "16:00",
            summary: `Ménage ${property.name}${next && next.check_in === task.date ? " (arrivée le jour même)" : ""}`,
            description: [
              property.address,
              next
                ? `Prochains voyageurs : ${next.guests} personne(s), arrivée le ${next.check_in}`
                : "Pas d'arrivée prévue juste après",
              `Détails, check-list et photos : ${portal}`,
            ]
              .filter(Boolean)
              .join("\n"),
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
