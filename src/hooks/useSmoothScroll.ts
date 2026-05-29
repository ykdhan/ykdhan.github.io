import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Buttery momentum scrolling via Lenis, wired into a rAF loop.
 * Respects prefers-reduced-motion (skips smoothing entirely).
 * Exposes a global `window.__lenis` so anchor links can scrollTo.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4
    });

    // @ts-expect-error attach for anchor navigation
    window.__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      // @ts-expect-error cleanup
      delete window.__lenis;
    };
  }, []);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  // @ts-expect-error global lenis
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -10 });
  else el.scrollIntoView({ behavior: "smooth" });
}
