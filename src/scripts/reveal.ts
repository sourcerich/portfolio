/* =============================================================================
   Scroll reveal — one shared IntersectionObserver for the whole page.
   -----------------------------------------------------------------------------
   This is the vanilla equivalent of Astro's `client:visible`: elements marked
   with [data-reveal] animate in as they enter the viewport (CSS handles the
   motion; this just toggles the .is-revealed class, once). Static sections
   that don't opt in ship nothing extra. Reduced-motion + no-JS users always
   see content immediately (the hiding is CSS-gated — see global.css).
   ========================================================================== */

export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!targets.length) return;

  // No IntersectionObserver (or motion reduced) → just show everything.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target); // reveal once, then stop watching
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );

  targets.forEach((el) => observer.observe(el));

  document.addEventListener('astro:before-swap', () => observer.disconnect(), { once: true });
  if (import.meta.hot) import.meta.hot.dispose(() => observer.disconnect());
}
