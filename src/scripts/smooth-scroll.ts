/* =============================================================================
   Smooth scroll (Lenis) + GSAP integration
   -----------------------------------------------------------------------------
   Initialised once, globally. Lenis is driven by the GSAP ticker (a single
   shared rAF loop) and notifies ScrollTrigger on every scroll, so future
   scroll-pinned sections stay perfectly in sync.

   Reduced-motion users get native scrolling (Lenis is skipped entirely).
   ========================================================================== */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initSmoothScroll(): void {
  gsap.registerPlugin(ScrollTrigger);

  // Respect the user's preference: no scroll hijacking when motion is reduced.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });

  // Keep ScrollTrigger aware of Lenis-driven scroll positions.
  lenis.on('scroll', ScrollTrigger.update);

  // One rAF loop for everything: GSAP's ticker advances Lenis (s → ms).
  const update = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(update);
  gsap.ticker.lagSmoothing(0);

  // Clean up on SPA navigation / dev HMR.
  function destroy() {
    gsap.ticker.remove(update);
    lenis.destroy();
  }
  document.addEventListener('astro:before-swap', destroy, { once: true });
  if (import.meta.hot) import.meta.hot.dispose(destroy);
}
