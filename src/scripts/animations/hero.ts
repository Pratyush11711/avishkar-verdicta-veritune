// Verdicta + Veritune band. Calm, heavy, never bouncy.
// The scene ships as one image, so sphere / tube / glow beats run only when those
// layers are in the DOM. Otherwise the whole scene gets the clip reveal and parallax.
import { gsap, ScrollTrigger, SplitText } from '../motion/register';

const DURATION = {
  eyebrow: 0.9,
  lines: 1.1,
  word: 0.7,
  sub: 0.8,
  scene: 1.6,
  streak: 1.4,
  spheres: 1.8,
  settle: 0.4,
  glow: 1.2,
} as const;

const EASE = {
  out: 'power3.out',
  expo: 'expo.out',
  sweep: 'power2.inOut',
  settle: 'power2.out',
  drift: 'none',
} as const;

const STAGGER = {
  lines: 0.12,
  words: 0.05,
} as const;

const SPHERE = {
  travel: '18vw',
  drop: -30,
  startScale: 0.92,
  rotation: 40,
  overshoot: 6,
} as const;

const PARALLAX = {
  teal: 22,
  blue: 30,
  tube: 10,
  glow: 14,
  floor: 6,
  tilt: 6,
  duration: 1.2,
  ease: 'power3.out',
} as const;

const FLOAT = {
  amplitude: 6,
  rotation: 3,
  teal: 4.5,
  blue: 5.5,
  reflection: 0.5,
  opacity: [0.5, 0.65] as const,
} as const;

const SCROLL = {
  scrub: 0.8,
  apart: '8vw',
  scale: 1.08,
  tube: -10,
  background: 8,
  glow: 0.3,
  copyY: -40,
  copyOpacity: 0.4,
  mobile: 0.5,
} as const;

/** Scene card: small until the section is scrolled up, then it fills the band. */
const BOX = {
  start: 0.58,
  startMobile: 0.72,
  radius: 36,
} as const;

const COLOR = {
  teal: '#7ed6d0',
  peach: '#f4ae62',
} as const;

type Layer = HTMLElement | null;

let dispose: (() => void) | null = null;
let heroCtx: gsap.Context | null = null;

const within = (run: () => void) => {
  if (heroCtx) heroCtx.add(run);
  else run();
};

const byAnim = (root: ParentNode, name: string) => root.querySelector<HTMLElement>(`[data-anim="${name}"]`);

function settleText(headline: Layer, italic: Layer, lines: Element[], words: Element[]) {
  if (headline) gsap.set(headline, { autoAlpha: 1 });
  if (italic) gsap.set(italic, { autoAlpha: 1 });
  if (lines.length) gsap.set(lines, { yPercent: 0 });
  if (words.length) gsap.set(words, { autoAlpha: 1, y: 0, filter: 'blur(0px)' });
}

function reduced(root: HTMLElement) {
  // autoAlpha uses visibility:inherit, so the section itself has to be shown first
  // or every child inherits the no-flash `visibility: hidden`.
  gsap.set(root, { autoAlpha: 1 });
  const scene = byAnim(root, 'scene');
  if (scene) gsap.set(scene, { scale: 1, borderRadius: 0, clipPath: 'none' });
  const nodes = root.querySelectorAll('[data-anim]');
  gsap.fromTo(nodes, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, stagger: 0.03, overwrite: 'auto' });
}

function full(root: HTMLElement, mobile: boolean) {
  root.style.setProperty('--suite-teal', COLOR.teal);
  root.style.setProperty('--suite-peach', COLOR.peach);

  const eyebrow = byAnim(root, 'eyebrow');
  const headline = byAnim(root, 'headline');
  const italic = byAnim(root, 'italic');
  const sub = byAnim(root, 'sub');
  const copy = byAnim(root, 'copy');
  const frame = byAnim(root, 'frame');
  const scene = byAnim(root, 'scene');
  const sceneBg = byAnim(root, 'scene-bg');
  const tube = byAnim(root, 'tube');
  const teal = byAnim(root, 'sphere-teal');
  const blue = byAnim(root, 'sphere-blue');
  const glow = byAnim(root, 'glow');
  const reflectionTeal = byAnim(root, 'reflection-teal');
  const reflectionBlue = byAnim(root, 'reflection-blue');
  const floorShine = byAnim(root, 'floor-shine');
  const layered = Boolean(teal && blue);

  // Wrappers must be visible. autoAlpha's "inherit" would otherwise keep the
  // copy and the scene hidden behind [data-anim="suite"].
  gsap.set([root, frame, copy, scene, sceneBg].filter(Boolean), { autoAlpha: 1 });
  const boxStart = mobile ? BOX.startMobile : BOX.start;

  let headlineSplit: SplitText | null = null;
  let italicSplit: SplitText | null = null;
  let intro: gsap.core.Timeline | null = null;
  let entered = false;
  let splitFrame = 0;
  const floats: gsap.core.Tween[] = [];
  const stops: Array<() => void> = [];
  let lifeOn = false;

  const scale = mobile ? SCROLL.mobile : 1;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const glowWords = (words: Element[]) =>
    words.filter((word) => /customers|reacted/i.test(word.textContent ?? ''));

  const markGlow = (words: Element[]) => {
    for (const word of glowWords(words)) {
      word.classList.remove('suite-word-glow');
      void (word as HTMLElement).offsetWidth;
      word.classList.add('suite-word-glow');
    }
  };

  // Light streak across the tube. Injected so the flat image needs no extra markup.
  let streak = byAnim(root, 'tube-streak');
  if (tube && !streak) {
    streak = document.createElement('span');
    streak.dataset.anim = 'tube-streak';
    streak.setAttribute('aria-hidden', 'true');
    tube.append(streak);
  }

  let ring = byAnim(root, 'floor-ring');
  if (glow && !ring) {
    ring = document.createElement('span');
    ring.dataset.anim = 'floor-ring';
    ring.setAttribute('aria-hidden', 'true');
    glow.parentElement?.append(ring);
  }

  const buildIntro = () => {
    const lines = headlineSplit?.lines ?? [];
    const words = italicSplit?.words ?? [];
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        startLife();
        if (!mobile && finePointer) bindParallax();
      },
    });

    // 1. Eyebrow: tracking settles and the blur clears.
    if (eyebrow) {
      tl.fromTo(
        eyebrow,
        { autoAlpha: 0, letterSpacing: '0.4em', filter: 'blur(8px)' },
        {
          autoAlpha: 1,
          letterSpacing: '0.2em',
          filter: 'blur(0px)',
          duration: DURATION.eyebrow,
          ease: EASE.out,
        },
        0,
      );
    }

    // 2. Bold lines rise out of the mask.
    if (headline && lines.length) {
      tl.set(headline, { autoAlpha: 1 }, 0.4);
      tl.fromTo(
        lines,
        { yPercent: 110 },
        { yPercent: 0, duration: DURATION.lines, stagger: STAGGER.lines, ease: EASE.expo },
        0.4,
      );
    }

    // 3. Italic line, word by word. "customers reacted" takes a teal glow that CSS fades.
    const italicAt = 0.4 + DURATION.lines * 0.72;
    if (italic && words.length) {
      tl.set(italic, { autoAlpha: 1 }, italicAt);
      tl.fromTo(
        words,
        { autoAlpha: 0, y: 12, filter: 'blur(10px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: DURATION.word,
          stagger: STAGGER.words,
          ease: EASE.out,
        },
        italicAt,
      );
      tl.add(() => markGlow(words), italicAt + DURATION.word * 0.45);
    }

    // 4. Subtext overlaps the end of the italic line.
    if (sub) {
      const wordSpan = words.length ? DURATION.word + Math.max(0, words.length - 1) * STAGGER.words : DURATION.word;
      tl.fromTo(
        sub,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: DURATION.sub, ease: EASE.out },
        italicAt + Math.max(0, wordSpan - 0.3),
      );
    }

    // 5. Size is scroll-driven (see the grow trigger). The intro only fades the plate in.
    const sceneAt = italicAt + 0.35;
    if (scene) tl.set(scene, { autoAlpha: 1 }, sceneAt);

    if (!layered) return tl;

    // 6. Tube fades up and a single streak crosses it.
    if (tube) {
      tl.fromTo(
        tube,
        { autoAlpha: 0, scaleY: 0.6 },
        { autoAlpha: 1, scaleY: 1, duration: DURATION.streak, ease: EASE.out, transformOrigin: '50% 100%' },
        sceneAt + 0.25,
      );
    }
    if (streak) {
      tl.fromTo(
        streak,
        { xPercent: -100 },
        { xPercent: 100, duration: DURATION.streak, ease: EASE.sweep },
        sceneAt + 0.35,
      );
    }

    // 7. Spheres roll in and settle 6px past centre, then rest. Not a bounce.
    const rollAt = sceneAt + 0.45;
    if (teal) {
      tl.fromTo(
        teal,
        { autoAlpha: 0, x: `-${SPHERE.travel}`, y: SPHERE.drop, scale: SPHERE.startScale, rotation: -SPHERE.rotation },
        {
          autoAlpha: 1,
          x: SPHERE.overshoot,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: DURATION.spheres,
          ease: EASE.out,
        },
        rollAt,
      );
      tl.to(teal, { x: 0, duration: DURATION.settle, ease: EASE.settle }, rollAt + DURATION.spheres - 0.05);
    }
    if (blue) {
      tl.fromTo(
        blue,
        { autoAlpha: 0, x: SPHERE.travel, y: SPHERE.drop, scale: SPHERE.startScale, rotation: SPHERE.rotation },
        {
          autoAlpha: 1,
          x: -SPHERE.overshoot,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: DURATION.spheres,
          ease: EASE.out,
        },
        rollAt,
      );
      tl.to(blue, { x: 0, duration: DURATION.settle, ease: EASE.settle }, rollAt + DURATION.spheres - 0.05);
    }
    if (reflectionTeal) {
      tl.fromTo(
        reflectionTeal,
        { autoAlpha: 0, x: `-${SPHERE.travel}`, y: -SPHERE.drop, filter: 'blur(6px)' },
        { autoAlpha: 0.6, x: 0, y: 0, filter: 'blur(6px)', duration: DURATION.spheres, ease: EASE.out },
        rollAt,
      );
    }
    if (reflectionBlue) {
      tl.fromTo(
        reflectionBlue,
        { autoAlpha: 0, x: SPHERE.travel, y: -SPHERE.drop, filter: 'blur(6px)' },
        { autoAlpha: 0.6, x: 0, y: 0, filter: 'blur(6px)', duration: DURATION.spheres, ease: EASE.out },
        rollAt,
      );
    }

    // 8. Peach bloom once the spheres meet, plus one soft ring on the floor.
    const meetAt = rollAt + DURATION.spheres * 0.72;
    if (glow) {
      tl.fromTo(
        glow,
        { autoAlpha: 0, scale: 0.6 },
        { autoAlpha: 1, scale: 1, duration: DURATION.glow, ease: EASE.out },
        meetAt,
      );
    }
    if (ring) {
      tl.fromTo(
        ring,
        { autoAlpha: 0.5, scale: 0.5 },
        { autoAlpha: 0, scale: 2, duration: DURATION.glow, ease: EASE.out },
        meetAt,
      );
    }

    return tl;
  };

  // Measured before the splits so a synchronous onSplit can read it.
  const rect = root.getBoundingClientRect();
  const skipIntro = rect.bottom < 0;

  const finishNow = () => {
    gsap.set([eyebrow, headline, italic, sub, scene, sceneBg, copy, frame].filter(Boolean), { autoAlpha: 1 });
    if (scene) gsap.set(scene, { scale: 1, borderRadius: 0, clipPath: 'none' });
    if (sceneBg) gsap.set(sceneBg, { scale: 1 });
    settleText(headline, italic, headlineSplit?.lines ?? [], italicSplit?.words ?? []);
    startLife();
  };

  const sync = () => {
    within(() => {
      if (skipIntro) {
        finishNow();
        return;
      }
      if (intro && intro.progress() > 0 && intro.progress() < 1) return;
      if (intro && intro.progress() === 1) {
        settleText(headline, italic, headlineSplit?.lines ?? [], italicSplit?.words ?? []);
        return;
      }
      intro?.kill();
      intro = buildIntro();
      if (entered) intro.play();
    });
  };

  let splitsReady = 0;
  const splitsExpected = (headline ? 1 : 0) + (italic ? 1 : 0);
  const onSplit = () => {
    splitsReady += 1;
    if (splitsReady < splitsExpected) return;
    cancelAnimationFrame(splitFrame);
    splitFrame = requestAnimationFrame(sync);
  };

  if (headline) {
    headlineSplit = SplitText.create(headline, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      linesClass: 'suite-line',
      onSplit,
    });
  }
  if (italic) {
    italicSplit = SplitText.create(italic, {
      type: 'words',
      autoSplit: true,
      wordsClass: 'suite-word',
      onSplit,
    });
  }
  if (!headline && !italic) onSplit();

  // The band sits below the fold, so the intro plays as it arrives.
  // Already on screen: play on the next frame. Already passed: onSplit shows the end state.
  if (!skipIntro && rect.top < window.innerHeight * 0.85) {
    entered = true;
    onSplit();
  } else if (!skipIntro) {
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        entered = true;
        intro?.play();
      },
    });
    stops.push(() => trigger.kill());
  }

  // The card starts small and fills the band as the section scrolls up.
  const box = frame ?? scene;
  if (box && !skipIntro) {
    const grow = gsap.fromTo(
      box,
      { scale: boxStart, borderRadius: BOX.radius },
      {
        scale: 1,
        borderRadius: 0,
        ease: 'none',
        immediateRender: true,
        scrollTrigger: {
          trigger: root,
          start: 'top 48%',
          end: 'top 6%',
          scrub: 0.65,
        },
      },
    );
    stops.push(() => grow.scrollTrigger?.kill());
  }

  // Scroll drift. Half the travel under 768px. Flat image: background and copy only.
  const drift = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: 'bottom top',
      scrub: SCROLL.scrub,
    },
  });
  if (sceneBg) drift.to(sceneBg, { yPercent: SCROLL.background * scale, ease: EASE.drift }, 0);
  if (copy) drift.to(copy, { y: SCROLL.copyY * scale, opacity: SCROLL.copyOpacity, ease: EASE.drift }, 0);
  if (layered && teal && blue) {
    drift.to(teal, { x: `-${SCROLL.apart}`, scale: 1 + (SCROLL.scale - 1) * scale, ease: EASE.drift }, 0);
    drift.to(blue, { x: SCROLL.apart, scale: 1 + (SCROLL.scale - 1) * scale, ease: EASE.drift }, 0);
  }
  if (tube) drift.to(tube, { yPercent: SCROLL.tube * scale, ease: EASE.drift }, 0);
  if (glow) drift.to(glow, { autoAlpha: SCROLL.glow, ease: EASE.drift }, 0);
  stops.push(() => drift.scrollTrigger?.kill());

  function setLife(play: boolean) {
    lifeOn = play && !document.hidden;
    for (const tween of floats) {
      if (lifeOn) tween.play();
      else tween.pause();
    }
  }

  function startLife() {
    if (!layered || floats.length || !teal || !blue) return;

    // Idle float. Different periods so the two spheres never lock step.
    floats.push(
      gsap.to(teal, {
        y: FLOAT.amplitude,
        rotation: FLOAT.rotation,
        duration: FLOAT.teal,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
      }),
      gsap.to(blue, {
        y: -FLOAT.amplitude,
        rotation: -FLOAT.rotation,
        duration: FLOAT.blue,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
      }),
    );
    if (reflectionTeal) {
      floats.push(
        gsap.to(reflectionTeal, {
          y: -FLOAT.amplitude * FLOAT.reflection,
          autoAlpha: FLOAT.opacity[1],
          duration: FLOAT.teal,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          paused: true,
        }),
      );
    }
    if (reflectionBlue) {
      floats.push(
        gsap.to(reflectionBlue, {
          y: FLOAT.amplitude * FLOAT.reflection,
          autoAlpha: FLOAT.opacity[0],
          duration: FLOAT.blue,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          paused: true,
        }),
      );
    }

    // Repeat the tube glint every 6–8s.
    if (streak) {
      const loop = () => {
        if (!lifeOn) {
          gsap.delayedCall(1, loop);
          return;
        }
        gsap.fromTo(
          streak,
          { xPercent: -100 },
          {
            xPercent: 100,
            duration: DURATION.streak,
            ease: EASE.sweep,
            onComplete: () => gsap.delayedCall(gsap.utils.random(6, 8), loop),
          },
        );
      };
      gsap.delayedCall(gsap.utils.random(6, 8), loop);
    }

    const watch = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => setLife(self.isActive),
    });
    const onHide = () => setLife(watch.isActive);
    document.addEventListener('visibilitychange', onHide);
    stops.push(() => {
      watch.kill();
      document.removeEventListener('visibilitychange', onHide);
      floats.forEach((tween) => tween.kill());
    });
    setLife(watch.isActive);
  }

  function bindParallax() {
    if (!finePointer || mobile) return;
    const pairs: Array<{ el: Layer; depth: number; mirror?: Layer; flipX?: boolean }> = [
      { el: teal, depth: PARALLAX.teal, mirror: reflectionTeal },
      { el: blue, depth: PARALLAX.blue, mirror: reflectionBlue, flipX: true },
      { el: tube, depth: PARALLAX.tube },
      { el: glow, depth: PARALLAX.glow },
      { el: floorShine, depth: PARALLAX.floor },
    ];
    const live = pairs.filter((pair): pair is { el: HTMLElement; depth: number; mirror?: Layer; flipX?: boolean } => !!pair.el);
    const movers = live.map((pair) => ({
      ...pair,
      x: gsap.quickTo(pair.el, 'x', { duration: PARALLAX.duration, ease: PARALLAX.ease }),
      y: gsap.quickTo(pair.el, 'y', { duration: PARALLAX.duration, ease: PARALLAX.ease }),
      tilt: pair.el === teal || pair.el === blue ? gsap.quickTo(pair.el, 'rotateY', { duration: PARALLAX.duration, ease: PARALLAX.ease }) : null,
      mx: pair.mirror ? gsap.quickTo(pair.mirror, 'x', { duration: PARALLAX.duration, ease: PARALLAX.ease }) : null,
      my: pair.mirror ? gsap.quickTo(pair.mirror, 'y', { duration: PARALLAX.duration, ease: PARALLAX.ease }) : null,
    }));

    const onMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      for (const mover of movers) {
        const dir = mover.flipX ? -1 : 1;
        mover.x(nx * mover.depth * dir);
        mover.y(ny * mover.depth * 0.45);
        mover.tilt?.(nx * PARALLAX.tilt * dir);
        mover.mx?.(nx * mover.depth * dir);
        mover.my?.(-ny * mover.depth * 0.45);
      }
    };
    const onLeave = () => {
      for (const mover of movers) {
        mover.x(0);
        mover.y(0);
        mover.tilt?.(0);
        mover.mx?.(0);
        mover.my?.(0);
      }
    };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    stops.push(() => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
    });
  }

  return () => {
    cancelAnimationFrame(splitFrame);
    intro?.kill();
    headlineSplit?.kill();
    italicSplit?.kill();
    stops.forEach((stop) => stop());
  };
}

export function cleanup() {
  dispose?.();
  dispose = null;
}

export function initHero() {
  cleanup();
  const root = document.querySelector<HTMLElement>('[data-anim="suite"]');
  if (!root) return cleanup;

  heroCtx = gsap.context(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: reduce)', () => {
      reduced(root);
    });
    mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767px)', () => full(root, true));
    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => full(root, false));
  }, root);

  dispose = () => {
    heroCtx?.revert();
    heroCtx = null;
  };
  requestAnimationFrame(() => ScrollTrigger.refresh());
  return cleanup;
}

let bootToken = 0;

async function boot() {
  const token = ++bootToken;
  await document.fonts.ready;
  if (token !== bootToken) return;
  initHero();
}

void boot();
document.addEventListener('astro:page-load', () => {
  void boot();
});
document.addEventListener('astro:before-swap', cleanup);

if (document.readyState === 'complete') ScrollTrigger.refresh();
else window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
