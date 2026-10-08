// Section 1 — "Your QA team hears a small fraction of your calls" (#problem).
// Text left, image right. One gsap.context per call, scoped to #problem.
import { gsap, ScrollTrigger, SplitText } from './register';
import { DURATION, EASE, STAGGER, TRIGGER_DEFAULTS, isMobile, reducedMotionFade } from './config';

export function initQA(): () => void {
  const root = document.getElementById('problem');
  if (!root) return () => {};

  const headline = root.querySelector<HTMLElement>('[data-anim="qa-headline"]');
  const accent = root.querySelector<HTMLElement>('[data-anim="qa-accent"]');
  const paras = Array.from(root.querySelectorAll<HTMLElement>('[data-anim="qa-para"]'));
  const dash = root.querySelector<HTMLElement>('[data-anim="qa-dash"]');
  const transitionText = root.querySelector<HTMLElement>('[data-anim="qa-transition-text"]');
  const card = root.querySelector<HTMLElement>('[data-anim="qa-card"]');
  const floatWrap = root.querySelector<HTMLElement>('.qa-card-float');
  const img = card?.querySelector<HTMLElement>('img') ?? null;

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    let split: SplitText | null = null;

    mm.add('(prefers-reduced-motion: reduce)', () => {
      const targets = [headline, accent, ...paras, dash, transitionText, card].filter(Boolean) as Element[];
      reducedMotionFade(targets);
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const mobile = isMobile();

      // Every [data-anim] element starts `visibility:hidden` (global no-flash rule). Flip that
      // back on immediately; each tween below still controls when it actually becomes visible
      // via opacity/scale/clip-path, so nothing flashes unanimated.
      gsap.set([headline, accent, ...paras, dash, transitionText, card].filter(Boolean) as Element[], {
        visibility: 'inherit',
      });

      split = headline
        ? new SplitText(headline, { type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'qa-line' })
        : null;

      // One timeline, triggered once the section is ~80% into the viewport.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: TRIGGER_DEFAULTS.start, toggleActions: TRIGGER_DEFAULTS.toggleActions },
      });

      // Image card: clip-path reveal + inner scale settle, in parallel with the headline.
      if (card) {
        tl.fromTo(
          card,
          { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0% round 24px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: DURATION.reveal, ease: EASE.reveal },
          0,
        );
      }
      if (img) {
        tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: DURATION.reveal, ease: EASE.reveal }, 0);
      }

      // Headline lines, masked, sliding up.
      if (headline) {
        tl.set(headline, { autoAlpha: 1 }, 0);
        const lines = split?.lines ?? [];
        if (lines.length) {
          tl.fromTo(
            lines,
            { yPercent: 110 },
            { yPercent: 0, duration: DURATION.headline, stagger: STAGGER.normal, ease: EASE.reveal },
            0,
          );
        }
      }

      // "small fraction": blur-to-sharp + letter-spacing settle, then its underline draws.
      if (accent) {
        tl.fromTo(
          accent,
          { autoAlpha: 0, filter: 'blur(8px)', letterSpacing: '0.1em' },
          { autoAlpha: 1, filter: 'blur(0px)', letterSpacing: '0em', duration: DURATION.base, ease: EASE.entrance },
          0.55,
        );
        tl.to(accent, { '--underline-scale': 1, duration: 0.6, ease: 'power2.out' }, 0.95);
      }

      // Paragraphs fade up, starting 0.3s after the headline lands.
      if (paras.length) {
        tl.fromTo(
          paras,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: DURATION.base, stagger: STAGGER.loose, ease: EASE.entrance },
          DURATION.headline + 0.3,
        );
      }

      // "— Verdicta and Veritune listen to all of it": the dash draws, then the text fades in from x:-12.
      if (dash) {
        tl.fromTo(dash, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: EASE.entrance }, '>+0.1');
      }
      if (transitionText) {
        tl.fromTo(transitionText, { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: EASE.entrance }, '<+0.15');
      }

      // Scrubbed parallax on the image, once the reveal has had a chance to land. Desktop only.
      if (img && !mobile) {
        gsap.fromTo(
          img,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: EASE.scrub,
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }

      // Idle float on the card wrapper: slow, always on, independent of scroll position.
      if (floatWrap) {
        gsap.to(floatWrap, {
          y: -8,
          duration: 5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: DURATION.reveal * 0.5,
        });
      }
    });
  }, root);

  return () => {
    ctx.kill();
    ScrollTrigger.getAll()
      .filter((st) => st.trigger === root)
      .forEach((st) => st.kill());
  };
}
