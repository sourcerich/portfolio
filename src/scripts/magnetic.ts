/* =============================================================================
   Magnetic elements — [data-magnetic] pull toward the cursor while hovered.
   -----------------------------------------------------------------------------
   data-magnetic="0.4" sets pull strength (default 0.35). Inner content marked
   [data-magnetic-inner] gets a softer counter-pull for a layered feel. Skipped
   on touch + reduced motion. Uses gsap.quickTo for cheap, smooth updates.
   ========================================================================== */

import { gsap } from 'gsap';

export function initMagnetic(): void {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = document.querySelectorAll<HTMLElement>('[data-magnetic]');

  items.forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '') || 0.35;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const ix = inner ? gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3.out' }) : null;
    const iy = inner ? gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3.out' }) : null;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - (r.left + r.width / 2);
      const relY = e.clientY - (r.top + r.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
      ix?.(relX * strength * 0.4);
      iy?.(relY * strength * 0.4);
    };
    const reset = () => {
      xTo(0);
      yTo(0);
      ix?.(0);
      iy?.(0);
    };

    el.addEventListener('pointerenter', onMove);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
  });
}
