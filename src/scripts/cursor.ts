/* =============================================================================
   Reactive custom cursor.
   -----------------------------------------------------------------------------
   A precise dot + a lagging ring. Over interactive elements the ring grows;
   over [data-cursor-label="View"] targets it fills to an accent disc showing
   the label. Fine-pointer only; native cursor hidden solely while active.
   ========================================================================== */

export function initCursor(): void {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const root = document.querySelector<HTMLElement>('.cursor');
  const ring = root?.querySelector<HTMLElement>('.cursor__ring');
  const dot = root?.querySelector<HTMLElement>('.cursor__dot');
  const label = root?.querySelector<HTMLElement>('.cursor__label');
  if (!root || !ring || !dot) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const follow = reduced ? 1 : 0.2;

  document.body.classList.add('has-cursor');
  root.style.opacity = '1';

  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: mouse.x, y: mouse.y };
  let raf = 0;

  const onMove = (e: PointerEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };

  const render = () => {
    raf = requestAnimationFrame(render);
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    ringPos.x += (mouse.x - ringPos.x) * follow;
    ringPos.y += (mouse.y - ringPos.y) * follow;
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
  };

  const interactive = 'a, button, input, textarea, select, [data-cursor], [data-magnetic]';

  const onOver = (e: Event) => {
    const target = e.target as Element;
    const labeled = target.closest?.('[data-cursor-label]') as HTMLElement | null;
    if (labeled) {
      if (label) label.textContent = labeled.dataset.cursorLabel || '';
      root.classList.add('is-labeled');
      root.classList.remove('is-interactive');
    } else if (target.closest?.(interactive)) {
      root.classList.add('is-interactive');
    }
  };
  const onOut = (e: Event) => {
    const target = e.target as Element;
    if (target.closest?.('[data-cursor-label]')) root.classList.remove('is-labeled');
    else if (target.closest?.(interactive)) root.classList.remove('is-interactive');
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerover', onOver);
  document.addEventListener('pointerout', onOut);
  render();

  const destroy = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onOut);
    document.body.classList.remove('has-cursor');
  };
  document.addEventListener('astro:before-swap', destroy, { once: true });
  if (import.meta.hot) import.meta.hot.dispose(destroy);
}
