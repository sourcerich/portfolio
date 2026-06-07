/* =============================================================================
   Intro preloader.
   -----------------------------------------------------------------------------
   Counts 000 → 100, then wipes up to reveal the page. On completion it
   dispatches a window 'app:reveal' event — the hero entrance and a
   ScrollTrigger.refresh() hang off that. Reduced-motion / no-preloader paths
   dispatch 'app:reveal' immediately so nothing downstream stalls.
   ========================================================================== */

import { gsap } from 'gsap';

const reveal = () => window.dispatchEvent(new Event('app:reveal'));

export function initPreloader(): void {
  const el = document.querySelector<HTMLElement>('[data-preloader]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!el) {
    reveal();
    return;
  }

  if (reduced) {
    el.style.display = 'none';
    reveal();
    return;
  }

  const counter = el.querySelector<HTMLElement>('[data-preloader-count]');
  const fill = el.querySelector<HTMLElement>('[data-preloader-fill]');
  document.documentElement.classList.add('is-loading');

  const finish = () => {
    el.style.display = 'none';
    document.documentElement.classList.remove('is-loading');
    reveal();
  };

  const tl = gsap.timeline({ onComplete: finish });
  const count = { v: 0 };

  tl.to(count, {
    v: 100,
    duration: 1.2,
    ease: 'power2.inOut',
    onUpdate: () => {
      const v = Math.round(count.v);
      if (counter) counter.textContent = String(v).padStart(3, '0');
      if (fill) fill.style.width = `${v}%`;
    },
  });
  tl.to(el, { duration: 0.2 }); // brief hold at 100
  tl.to(el, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' });

  // Safety net: never trap the page behind the overlay if the timeline stalls.
  window.setTimeout(() => {
    if (tl.isActive()) tl.progress(1);
  }, 5000);
}
