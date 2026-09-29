import { useEffect } from "react";

/** Délai d'apparition en cascade pour le i-ème élément d'un groupe. */
export const stagger = (i: number, step = 110) =>
  ({ "--reveal-delay": `${i * step}ms` }) as React.CSSProperties;

/**
 * Observe tous les éléments [data-reveal] de la page et leur ajoute .is-visible dès qu'ils
 * entrent dans l'écran. Relancé à chaque changement de page (clé `path`).
 */
export function useScrollReveal(path: string) {
  useEffect(() => {
    document.documentElement.classList.add("reveal-ready");
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [path]);
}
