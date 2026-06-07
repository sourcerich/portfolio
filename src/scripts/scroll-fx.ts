/* =============================================================================
   Scroll choreography (GSAP + ScrollTrigger, driven by Lenis).
   -----------------------------------------------------------------------------
   - [data-split]      headings reveal word-by-word as they enter view
   - [data-parallax]   subtle scrubbed vertical parallax
   - [data-h-scroll]   pins and scrubs a horizontal track (desktop only)
   Reduced motion: bail entirely; CSS keeps everything static + visible.
   ========================================================================== */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitWords } from './split-text';

export function initScrollFx(): void {
  gsap.registerPlugin(ScrollTrigger);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 1) Kinetic heading reveals.
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 110 });
    gsap.to(words, {
      yPercent: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // 2) Scrubbed parallax.
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '') || 0.15;
    gsap.to(el, {
      yPercent: -speed * 100,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // 3) Pinned horizontal track. gsap.matchMedia auto-reverts (and restores the
  //    native-scroll fallback) when leaving the desktop breakpoint.
  const wrap = document.querySelector<HTMLElement>('[data-h-scroll]');
  const track = wrap?.querySelector<HTMLElement>('[data-h-track]');
  if (wrap && track) {
    gsap.matchMedia().add('(min-width: 821px)', () => {
      wrap.classList.add('is-pinned'); // CSS: overflow hidden while GSAP drives it
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => wrap.classList.remove('is-pinned');
    });
  }

  // Re-measure once everything that affects layout has settled.
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('app:reveal', refresh, { once: true });
  window.addEventListener('load', refresh);
  if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});

  document.addEventListener(
    'astro:before-swap',
    () => ScrollTrigger.getAll().forEach((t) => t.kill()),
    { once: true },
  );
}
