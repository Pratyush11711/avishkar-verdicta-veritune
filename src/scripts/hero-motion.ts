// Hero GSAP motion: page-load intro, ambient drift, pointer parallax/magnetic CTAs,
// and scroll-driven behaviour. Motion-only — no markup, colour, copy or layout changes.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();

  const root = document.querySelector<HTMLElement>('[data-hero]');
  if (!root) return;

  const eyebrow = root.querySelector<HTMLElement>('[data-anim="eyebrow"]');
  const dot = root.querySelector<HTMLElement>('.hero-dot');
  const headline = root.querySelector<HTMLElement>('[data-anim="headline"]');
  const accent = root.querySelector<HTMLElement>('[data-anim="headline-accent"]');
  const sub = root.querySelector<HTMLElement>('[data-anim="sub"]');
  const ctas = Array.from(root.querySelectorAll<HTMLElement>('[data-anim="cta"]'));
  const microcopy = root.querySelector<HTMLElement>('[data-anim="microcopy"]');
  const blobs = Array.from(root.querySelectorAll<HTMLElement>('[data-anim="blob"]'));

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    let splitHeadline: SplitText | null = null;
    let splitSub: SplitText | null = null;

    mm.add('(prefers-reduced-motion: reduce)', () => {
      // Show the finished page immediately. A short fade is fine; no motion.
      // Note: nav lives outside `root`, so it's queried globally rather than via a
      // context-scoped string selector (gsap.context auto-scopes string selectors to `root`).
      const targets = [...root.querySelectorAll('[data-anim]')] as Element[];
      gsap.set(targets, { autoAlpha: 1, clearProps: 'transform,filter' });

      return () => {
        /* nothing to tear down */
      };
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      splitHeadline = headline ? new SplitText(headline, { type: 'lines', mask: 'lines', linesClass: 'hero-line' }) : null;
      splitSub = sub ? new SplitText(sub, { type: 'lines', mask: 'lines', linesClass: 'hero-line' }) : null;

      // ---------- Page-load timeline ----------
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      if (blobs.length) {
        tl.fromTo(blobs, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 0.55, scale: 1, duration: 1.6 }, 0);
      }

      if (eyebrow) {
        tl.fromTo(eyebrow, { autoAlpha: 0, y: 16, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 }, 0.3);
      }

      if (headline) {
        tl.set(headline, { autoAlpha: 1 }, 0.45);
        const lines = splitHeadline?.lines ?? [];
        if (lines.length) {
          tl.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' }, 0.45);
        }
      }

      if (accent) {
        tl.fromTo(
          accent,
          { autoAlpha: 0, filter: 'blur(10px)' },
          { autoAlpha: 1, filter: 'blur(0px)', duration: 0.9 },
          0.9,
        );
        // One-time gradient sweep once the accent phrase has landed.
        tl.fromTo(
          accent,
          { backgroundPosition: '0% 50%' },
          { backgroundPosition: '100% 50%', duration: 1.4, ease: 'sine.inOut' },
          1.8,
        );
      }

      if (sub) {
        tl.set(sub, { autoAlpha: 1 }, 1.0);
        const lines = splitSub?.lines ?? [];
        if (lines.length) {
          tl.fromTo(lines, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08 }, 1.0);
        } else {
          tl.fromTo(sub, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.0);
        }
      }

      if (ctas.length) {
        // Opacity stays at 1. Fading these left the ink button unreadable on the mist,
        // and a resize replay could leave them stuck at autoAlpha 0.
        gsap.set(ctas, { autoAlpha: 1, y: 20 });
        tl.to(ctas, { y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 1.2);
      }

      if (microcopy) {
        tl.fromTo(microcopy, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.45);
      }

      // ---------- Ambient motion (starts immediately, loops forever) ----------
      const ambientTweens: gsap.core.Tween[] = [];

      blobs.forEach((blob, i) => {
        const depth = Number(blob.dataset.depth ?? 0.5);
        const dx = gsap.utils.random(30, 60) * (i % 2 === 0 ? 1 : -1);
        const dy = gsap.utils.random(30, 60) * (i % 3 === 0 ? 1 : -1);
        const dur = gsap.utils.random(10, 16);
        ambientTweens.push(
          gsap.to(blob, {
            x: `+=${dx}`,
            y: `+=${dy}`,
            scale: 1 + 0.08 * depth,
            duration: dur,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 0.4,
          }),
        );
      });

      if (dot) {
        ambientTweens.push(
          gsap.to(dot, {
            keyframes: [
              { scale: 1.6, opacity: 0.4 },
              { scale: 1, opacity: 1 },
            ],
            duration: 2,
            ease: 'sine.inOut',
            repeat: -1,
          }),
        );
      }

      // ---------- Pointer interactions (hover-capable + fine pointer only) ----------
      let onMouseMove: ((e: MouseEvent) => void) | null = null;
      const magneticCleanups: Array<() => void> = [];

      if (isDesktop && !isMobile) {
        const blobSetters = blobs.map((blob) => ({
          depth: Number(blob.dataset.depth ?? 0.5),
          x: gsap.quickTo(blob, 'x', { duration: 1.2, ease: 'power3.out' }),
          y: gsap.quickTo(blob, 'y', { duration: 1.2, ease: 'power3.out' }),
        }));

        let throttled = false;
        onMouseMove = (e: MouseEvent) => {
          if (throttled) return;
          throttled = true;
          requestAnimationFrame(() => {
            throttled = false;
          });

          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;

          blobSetters.forEach(({ depth, x, y }) => {
            const px = 10 + depth * 30;
            x(-nx * px);
            y(-ny * px);
          });
        };
        root.addEventListener('mousemove', onMouseMove);

        // Magnetic CTAs.
        ctas.forEach((cta) => {
          const qx = gsap.quickTo(cta, 'x', { duration: 0.3, ease: 'power3.out' });
          const qy = gsap.quickTo(cta, 'y', { duration: 0.3, ease: 'power3.out' });

          const onMove = (e: MouseEvent) => {
            const rect = cta.getBoundingClientRect();
            const relX = e.clientX - (rect.left + rect.width / 2);
            const relY = e.clientY - (rect.top + rect.height / 2);
            qx(gsap.utils.clamp(-8, 8, relX * 0.3));
            qy(gsap.utils.clamp(-8, 8, relY * 0.3));
          };
          const onLeave = () => {
            gsap.to(cta, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
          };

          cta.addEventListener('mousemove', onMove);
          cta.addEventListener('mouseleave', onLeave);
          magneticCleanups.push(() => {
            cta.removeEventListener('mousemove', onMove);
            cta.removeEventListener('mouseleave', onLeave);
          });
        });
      }

      // ---------- Scroll behaviour ----------
      const scrollDistance = isMobile ? -30 : -60;

      // Headline and sub fade as the hero leaves. The CTAs stay fully opaque —
      // scrubbing their opacity left the dark button as a gray ghost on the mist.
      if (headline && sub) {
        gsap.timeline({
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
        }).to([headline, sub], { y: scrollDistance, opacity: 0.2 }, 0);
      }

      if (blobs.length) {
        const scrollTl = gsap.timeline({
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
        blobs.forEach((blob) => {
          const depth = Number(blob.dataset.depth ?? 0.5);
          scrollTl.to(blob, { y: (isMobile ? -60 : -140) * depth }, 0);
        });
      }

      // Navbar stays fixed. Scroll squash/settle lives in nav.ts so glass shadows stay intact.

      ScrollTrigger.refresh();

      return () => {
        tl.kill();
        ambientTweens.forEach((t) => t.kill());
        if (onMouseMove) root.removeEventListener('mousemove', onMouseMove);
        magneticCleanups.forEach((fn) => fn());
        splitHeadline?.revert();
        splitSub?.revert();
      };
    });
  }, root);

  cleanup = () => {
    ctx.kill();
  };

  // Rebuild (debounced) on resize so SplitText re-splits at the new width.
  let resizeTimer: number | undefined;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => init(), 200);
  };
  window.addEventListener('resize', onResize, { once: true });

  // Recompute ScrollTrigger positions once images/fonts settle.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

document.fonts.ready.then(init);
