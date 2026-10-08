// Section 2 — "Score every call against the QA standard you already use" (#verdicta),
// and its mirror, #veritune. Runs once per `.product-section` root found on the page.
import { gsap, ScrollTrigger, SplitText } from './register';
import { DURATION, EASE, STAGGER, TRIGGER_DEFAULTS, canHover, isMobile, reducedMotionFade } from './config';

export function initScore(): () => void {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('.product-section'));
  if (!roots.length) return () => {};

  const cleanups = roots.map((root) => initOne(root));
  return () => cleanups.forEach((fn) => fn());
}

function initOne(root: HTMLElement): () => void {
  const tag = root.querySelector<HTMLElement>('[data-anim="score-tag"]');
  const tagDot = root.querySelector<HTMLElement>('[data-anim="score-tag-dot"]');
  const headline = root.querySelector<HTMLElement>('[data-anim="score-headline"]');
  const accent = root.querySelector<HTMLElement>('[data-anim="score-accent"]');
  const body = root.querySelector<HTMLElement>('[data-anim="score-body"]');
  const textCol = root.querySelector<HTMLElement>('[data-anim="score-text-col"]');
  const card = root.querySelector<HTMLElement>('[data-anim="score-card"]');
  const sweep = root.querySelector<HTMLElement>('[data-anim="score-sweep"]');
  const img = card?.querySelector<HTMLElement>('img') ?? null;
  const enterFrom = card?.dataset.enterFrom === 'right' ? 40 : -40;
  let tiltCleanup: (() => void) | null = null;

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    let split: SplitText | null = null;

    mm.add('(prefers-reduced-motion: reduce)', () => {
      const targets = [tag, tagDot, headline, accent, body, textCol, card, sweep].filter(Boolean) as Element[];
      reducedMotionFade(targets);
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const mobile = isMobile();

      // Every [data-anim] element starts `visibility:hidden` (global no-flash rule); flip it
      // back immediately and let each tween's own opacity/scale/clip-path do the actual reveal.
      gsap.set([tag, tagDot, headline, accent, body, textCol, card, sweep].filter(Boolean) as Element[], {
        visibility: 'inherit',
      });

      split = headline
        ? new SplitText(headline, { type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'score-line' })
        : null;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: TRIGGER_DEFAULTS.start, toggleActions: TRIGGER_DEFAULTS.toggleActions },
      });

      // Image card: enters from the side opposite the text, with the same clip-path reveal as section 1.
      if (card) {
        tl.fromTo(
          card,
          { autoAlpha: 0, x: enterFrom, clipPath: 'inset(100% 0% 0% 0% round 28px)' },
          { autoAlpha: 1, x: 0, clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: DURATION.reveal, ease: EASE.reveal },
          0,
        );
      }
      if (img) {
        tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: DURATION.reveal, ease: EASE.reveal }, 0);
      }

      // Light sweep across the card, once, shortly after it lands.
      if (sweep) {
        tl.fromTo(
          sweep,
          { x: '-120%', opacity: 0 },
          { x: '120%', opacity: 1, duration: 0.9, ease: 'power2.out' },
          0.5,
        ).to(sweep, { opacity: 0, duration: 0.3 }, '>-0.1');
      }

      // Text column slides in from the opposite side.
      if (textCol) {
        tl.fromTo(textCol, { autoAlpha: 0, x: -enterFrom }, { autoAlpha: 1, x: 0, duration: DURATION.headline, ease: EASE.entrance }, 0.1);
      }

      // Tag: scale + fade in; its dot pulses forever once visible.
      if (tag) {
        tl.fromTo(tag, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: DURATION.fast, ease: EASE.entrance }, 0.15);
      }
      if (tagDot) {
        gsap.to(tagDot, { scale: 1.6, opacity: 0, duration: 1.4, ease: 'sine.out', repeat: -1, delay: 1 });
      }

      // Headline lines.
      if (headline) {
        tl.set(headline, { autoAlpha: 1 }, 0.3);
        const lines = split?.lines ?? [];
        if (lines.length) {
          tl.fromTo(
            lines,
            { yPercent: 110 },
            { yPercent: 0, duration: DURATION.headline, stagger: STAGGER.normal, ease: EASE.reveal },
            0.3,
          );
        }
      }

      // "you already use" / "before they cancel": blur-to-sharp plus a soft glow that fades out.
      if (accent) {
        tl.fromTo(
          accent,
          { autoAlpha: 0, filter: 'blur(8px)', textShadow: '0 0 0px rgba(125, 211, 200, 0)' },
          { autoAlpha: 1, filter: 'blur(0px)', textShadow: '0 0 18px rgba(125, 211, 200, 0.55)', duration: DURATION.base, ease: EASE.entrance },
          0.85,
        ).to(accent, { textShadow: '0 0 0px rgba(125, 211, 200, 0)', duration: 0.8, ease: 'sine.out' }, '>+0.1');
      }

      // Body paragraph.
      if (body) {
        tl.fromTo(body, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: DURATION.base, ease: EASE.entrance }, 1.1);
      }

      // Desktop-only mouse tilt + static parallax on the card. Disabled on touch/below 768px.
      if (card && !mobile && canHover()) {
        gsap.set(card, { transformPerspective: 1200, transformStyle: 'preserve-3d' });
        const rotateX = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' });
        const rotateY = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' });

        const onMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          rotateY(px * 8); // +/- 4deg of travel each side
          rotateX(-py * 8);
        };
        const onLeave = () => {
          rotateX(0);
          rotateY(0);
        };

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
        tiltCleanup = () => {
          card.removeEventListener('mousemove', onMove);
          card.removeEventListener('mouseleave', onLeave);
        };
      }
    });
  }, root);

  return () => {
    tiltCleanup?.();
    ctx.kill();
    ScrollTrigger.getAll()
      .filter((st) => st.trigger === root)
      .forEach((st) => st.kill());
  };
}
