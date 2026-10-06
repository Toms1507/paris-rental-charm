import { createFileRoute } from "@tanstack/react-router";

// Ancienne adresse de l'article sur la réglementation (plafond passé de 120 à 90 nuits à Paris) :
// redirection permanente pour conserver le référencement acquis.
export const Route = createFileRoute("/blog/regles-airbnb-paris-120-jours")({
  server: {
    handlers: {
      GET: ({ request }) =>
        Response.redirect(new URL("/blog/regles-airbnb-paris-90-jours", request.url), 301),
    },
  },
});
