import { useEffect } from "react";

/** Délai d'apparition en cascade pour le i-ème élément d'un groupe. */
export const stagger = (i: number, step = 110) =>
  ({ "--reveal-delay": `${i * step}ms` }) as React.CSSProperties;

/**
 * Fait apparaître les éléments [data-reveal] quand ils entrent dans l'écran.
 *
 * Lors d'un changement de page sans rechargement, le contenu de la nouvelle page peut arriver
 * après coup (chargement différé de la page) : un MutationObserver surveille donc en continu
 * les éléments ajoutés, pour qu'aucun ne reste invisible.
 */
export function useScrollReveal() {
  useEffect(() => {
    document.documentElement.classList.add("reveal-ready");

    // Attribut plutôt que classe : React réécrit className lors des mises à jour, pas cet attribut.
    const show = (el: Element) => el.setAttribute("data-shown", "");
    if (!("IntersectionObserver" in window) || !("MutationObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const watch = (scope: Element | Document) => {
      const nodes = [
        ...(scope instanceof Element && scope.matches("[data-reveal]") ? [scope] : []),
        ...scope.querySelectorAll("[data-reveal]"),
      ];
      for (const el of nodes) if (!el.hasAttribute("data-shown")) io.observe(el);
    };

    watch(document);
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations)
        m.addedNodes.forEach((node) => {
          if (node instanceof Element) watch(node);
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
