/* =============================================================================
   Hero particle field (Three.js)
   -----------------------------------------------------------------------------
   An interactive, slowly-drifting two-tone particle cloud that responds gently
   to the pointer (parallax + damped attraction — never chaotic). It is a
   BACKGROUND: low opacity, monochromatic-leaning, tuned to sit behind the
   headline without competing with it.

   Performance budget honoured here:
     • ≤ 1,500 particles on desktop, ~600 on mobile (detected via width).
     • devicePixelRatio capped at 2.
     • requestAnimationFrame paused when the tab is hidden OR the canvas
       scrolls offscreen (visibilitychange + IntersectionObserver).
     • prefers-reduced-motion → render a single static frame, no loop, no
       listeners.
     • Geometry / material / renderer are disposed on teardown; resize handled.
   ========================================================================== */

import * as THREE from 'three';

export interface HeroParticlesHandle {
  /** Stop the loop, detach listeners, and free all GPU resources. */
  destroy: () => void;
}

interface InitOptions {
  canvas: HTMLCanvasElement;
}

export function initHeroParticles({ canvas }: InitOptions): HeroParticlesHandle {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // --- Renderer ------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,            // points are soft-edged in-shader; MSAA wasted
    alpha: true,                 // let the page's near-black background show
    powerPreference: 'high-performance',
  });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2); // cap DPR at 2
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  // --- Scene & camera ------------------------------------------------------
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 7;

  // --- Particle attributes -------------------------------------------------
  const COUNT = isMobile ? 600 : 1500;
  const RADIUS = 5.5;

  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);
  const alphas = new Float32Array(COUNT);

  // Two tones only: a cool off-white base, with ~16% in the restrained hero
  // blue. Kept low-saturation so the field reads as texture, not decoration.
  const baseColor = new THREE.Color('#cfcfca');   // monochrome dust
  const accentColor = new THREE.Color('#d6ff3e'); // rare acid-lime spark

  for (let i = 0; i < COUNT; i++) {
    // Uniform-ish distribution inside a ball (cbrt keeps density even), then
    // flattened on Y so the cloud spreads wide behind the lower-left copy.
    const r = RADIUS * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    positions[i * 3 + 2] = r * Math.cos(phi);

    const tone = Math.random() < 0.06 ? accentColor : baseColor;
    colors[i * 3 + 0] = tone.r;
    colors[i * 3 + 1] = tone.g;
    colors[i * 3 + 2] = tone.b;

    scales[i] = 0.5 + Math.random() * 1.2;   // size variation
    alphas[i] = 0.25 + Math.random() * 0.6;  // per-particle opacity variation
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

  // --- Material: round, soft, two-tone points via a tiny shader ------------
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,                 // it's a translucent background blob
    blending: THREE.NormalBlending,   // normal (not additive) so it stays calm
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: isMobile ? 10 : 13 },
      uPixelRatio: { value: pixelRatio },
      uOpacity: { value: 0.4 },        // overall low opacity — a background
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSize;
      uniform float uPixelRatio;
      attribute float aScale;
      attribute vec3 aColor;
      attribute float aAlpha;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec3 p = position;
        // Gentle organic "breathing" — very low amplitude so it reads as
        // life, not motion.
        p.x += sin(uTime * 0.18 + position.z * 0.6) * 0.08;
        p.y += cos(uTime * 0.15 + position.x * 0.6) * 0.08;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        // Perspective size attenuation; uPixelRatio keeps CSS size consistent
        // across HiDPI displays.
        gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);

        vColor = aColor;
        vAlpha = aAlpha;
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Hard-edged square points — raw, brutalist "data dust".
        gl_FragColor = vec4(vColor, vAlpha * uOpacity);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // --- Pointer (damped parallax + gentle attraction) -----------------------
  const pointer = { x: 0, y: 0 };  // target, normalised -1..1
  const eased = { x: 0, y: 0 };    // damped follower

  function onPointerMove(event: PointerEvent) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  }

  // --- Resize --------------------------------------------------------------
  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false); // false: CSS owns the canvas size
    if (!running) renderer.render(scene, camera); // refresh while paused/static
  }

  // --- Animation loop & run-state -----------------------------------------
  const clock = new THREE.Clock();
  let elapsed = 0;            // advances only while running (no resume jump)
  let raf = 0;
  let running = false;
  let onscreen = true;
  let tabVisible = !document.hidden;

  function frame() {
    raf = requestAnimationFrame(frame);
    elapsed += clock.getDelta();

    // Damped pointer response — small magnitudes keep it subtle, not chaotic.
    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;

    points.rotation.y = elapsed * 0.04 + eased.x * 0.35; // slow drift + parallax
    points.rotation.x = eased.y * 0.25;

    camera.position.x += (eased.x * 0.6 - camera.position.x) * 0.05;
    camera.position.y += (-eased.y * 0.4 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    material.uniforms.uTime.value = elapsed;
    renderer.render(scene, camera);
  }

  function start() {
    if (running || prefersReducedMotion || !onscreen || !tabVisible) return;
    running = true;
    clock.start();              // reset delta baseline so elapsed never jumps
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  /** Run only when allowed to: visible tab, onscreen canvas, motion permitted. */
  function evaluateRunState() {
    if (onscreen && tabVisible && !prefersReducedMotion) start();
    else stop();
  }

  function onVisibilityChange() {
    tabVisible = !document.hidden;
    evaluateRunState();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      onscreen = entries[0]?.isIntersecting ?? false;
      evaluateRunState();
    },
    { threshold: 0 },
  );

  // --- Boot ----------------------------------------------------------------
  resize();

  if (prefersReducedMotion) {
    // Static frame only — no loop, no listeners (except resize, so a static
    // reframe stays correct if the window changes).
    renderer.render(scene, camera);
    window.addEventListener('resize', resize);
  } else {
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    // Pointer parallax only where a precise pointer exists (skip touch drag).
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }
    observer.observe(canvas);
    start();
  }

  // --- Teardown ------------------------------------------------------------
  function destroy() {
    stop();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pointermove', onPointerMove);
    observer.disconnect();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  return { destroy };
}
