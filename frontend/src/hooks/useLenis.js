import { useEffect } from "react";
import Lenis from "lenis";

// Smooth scrolling for the whole page.
// People who ask their device for less motion get normal scrolling.
// To let a box scroll on its own (like the history panel), give it
// the data-lenis-prevent attribute.
export function useLenis() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    let frame;
    const loop = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}
