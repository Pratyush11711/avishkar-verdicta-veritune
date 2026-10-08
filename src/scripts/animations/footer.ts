// Wordmark sheen. A teal-to-blue glow is already travelling across "Avishkar AI"
// on load. Hovering the wordmark pauses that drift and lets the cursor carry it.
//
// data-anim:
//   wordmark-spot  the gradient clipped to the same glyphs (its parent is the hover target)

import { gsap } from '../motion/register';

const SHEEN = {
  teal: '#7ed6d0',
  blue: '#8db6ee',
  radius: 320,
  drift: 6.5,
  follow: 0.45,
} as const;

let dispose: (() => void) | null = null;
let bootToken = 0;

export function initFooter(): () => void {
  cleanup();
  const spot = document.querySelector<HTMLElement>('[data-anim="wordmark-spot"]');
  const mark = spot?.parentElement;
  if (!mark || !spot) return () => {};

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = gsap.context(() => {
    mark.style.setProperty('--orb-teal', SHEEN.teal);
    mark.style.setProperty('--orb-blue', SHEEN.blue);
    mark.style.setProperty('--spot-r', `${SHEEN.radius}px`);

    const place = () => {
      const box = mark.getBoundingClientRect();
      return { width: box.width || 1, height: box.height || 1 };
    };

    const { width, height } = place();
    gsap.set(spot, {
      autoAlpha: 1,
      '--mx': width * 0.22,
      '--my': height * 0.46,
    });

    let drift: gsap.core.Tween | null = null;

    const startDrift = () => {
      const box = place();
      drift?.kill();
      if (reduce) {
        gsap.to(spot, {
          '--mx': box.width * 0.5,
          '--my': box.height * 0.46,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        return;
      }
      gsap.set(spot, { '--my': box.height * 0.46 });
      drift = gsap.fromTo(
        spot,
        { '--mx': box.width * 0.18 },
        {
          '--mx': box.width * 0.82,
          duration: SHEEN.drift,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          overwrite: 'auto',
        },
      );
    };

    startDrift();

    const mxTo = gsap.quickTo(spot, '--mx', { duration: SHEEN.follow, ease: 'power3.out' });
    const myTo = gsap.quickTo(spot, '--my', { duration: SHEEN.follow, ease: 'power3.out' });

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      drift?.pause();
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      drift?.pause();
      const box = mark.getBoundingClientRect();
      mxTo(event.clientX - box.left);
      myTo(event.clientY - box.top);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      startDrift();
    };

    mark.addEventListener('pointerenter', onEnter);
    mark.addEventListener('pointermove', onMove);
    mark.addEventListener('pointerleave', onLeave);
    return () => {
      mark.removeEventListener('pointerenter', onEnter);
      mark.removeEventListener('pointermove', onMove);
      mark.removeEventListener('pointerleave', onLeave);
    };
  }, mark);

  dispose = () => ctx.revert();
  return dispose;
}

export function cleanup() {
  dispose?.();
  dispose = null;
}

async function boot() {
  const token = ++bootToken;
  await document.fonts.ready;
  if (token !== bootToken) return;
  initFooter();
}

void boot();
document.addEventListener('astro:page-load', () => {
  void boot();
});
document.addEventListener('astro:before-swap', cleanup);
