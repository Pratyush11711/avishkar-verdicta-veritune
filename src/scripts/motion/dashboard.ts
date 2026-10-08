// Section 3 — the dashboard card (#dashboard-showcase). Real HTML/SVG, animated with GSAP:
// a scrubbed 3D entrance for the card itself, then a one-shot "live" timeline for its contents.
import { gsap, ScrollTrigger } from './register';
import { STAGGER, reducedMotionFade } from './config';

/** Animates a numeric proxy and writes the rounded value into the element's text each tick. */
function countTo(el: Element, to: number, opts: { duration?: number; delay?: number } = {}) {
  const proxy = { val: 0 };
  return gsap.to(proxy, {
    val: to,
    duration: opts.duration ?? 1.2,
    delay: opts.delay ?? 0,
    ease: 'power1.out',
    snap: { val: 1 },
    onUpdate: () => {
      el.textContent = String(Math.round(proxy.val));
    },
  });
}

export function initDashboard(): () => void {
  const section = document.getElementById('dashboard-showcase');
  if (!section) return () => {};

  const cardWrap = section.querySelector<HTMLElement>('.dash-wrap');
  const card = section.querySelector<HTMLElement>('[data-anim="dash-card"]');
  const shadow = section.querySelector<HTMLElement>('[data-anim="dash-shadow"]');
  const sidebarItems = Array.from(section.querySelectorAll<HTMLElement>('[data-anim="dash-sidebar-item"]'));
  const title = section.querySelector<HTMLElement>('[data-anim="dash-title"]');
  const buttons = section.querySelector<HTMLElement>('[data-anim="dash-buttons"]');
  const filters = Array.from(section.querySelectorAll<HTMLElement>('[data-anim="dash-filter"]'));
  const stats = Array.from(section.querySelectorAll<HTMLElement>('[data-anim="dash-stat"]'));
  const bars = Array.from(section.querySelectorAll<HTMLElement>('[data-anim="dash-bar"]'));
  const gaugeArc = section.querySelector<SVGCircleElement>('[data-anim="dash-gauge-arc"]');
  const gaugeNumber = section.querySelector<HTMLElement>('[data-anim="dash-gauge-number"]');
  const legend = section.querySelector<HTMLElement>('[data-anim="dash-legend"]');
  const refresh = section.querySelector<HTMLElement>('[data-anim="dash-refresh"]');
  const statNumbers = Array.from(section.querySelectorAll<HTMLElement>('[data-anim="dash-stat-number"]'));

  const allTargets = [
    card,
    shadow,
    ...sidebarItems,
    title,
    buttons,
    refresh,
    ...filters,
    ...stats,
    ...statNumbers,
    ...bars,
    gaugeArc,
    gaugeNumber,
    legend,
  ].filter(Boolean) as Element[];

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: reduce)', () => {
      reducedMotionFade(allTargets);
      stats.forEach((stat) => {
        const number = stat.querySelector('[data-anim="dash-stat-number"]');
        if (number) number.textContent = String(stat.dataset.to ?? 0);
      });
      if (gaugeNumber) gaugeNumber.textContent = `${gaugeNumber.dataset.to ?? 0}%`;
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Every [data-anim] element starts `visibility:hidden` (global no-flash rule); flip it
      // back immediately and let each tween's own opacity/scale/clip-path/stroke do the reveal.
      gsap.set(allTargets, { visibility: 'inherit' });

      // ---------- Card entrance: scrubbed 3D settle, finishing near the centre of the viewport ----------
      if (card) gsap.set(card, { transformPerspective: 1200 });

      gsap.fromTo(
        card,
        { rotateX: 10, y: 80, scale: 0.94, opacity: 0.4 },
        {
          rotateX: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: cardWrap, start: 'top bottom', end: 'center center', scrub: 0.8 },
        },
      );
      if (shadow) {
        gsap.fromTo(
          shadow,
          { opacity: 0 },
          { opacity: 1, ease: 'none', scrollTrigger: { trigger: cardWrap, start: 'top bottom', end: 'center center', scrub: 0.8 } },
        );
      }

      // ---------- Once settled: a one-shot timeline brings the contents to life ----------
      const tl = gsap.timeline({
        scrollTrigger: { trigger: cardWrap, start: 'center 65%', toggleActions: 'play none none reverse' },
      });

      // 1. Sidebar items slide in from the left.
      if (sidebarItems.length) {
        tl.fromTo(sidebarItems, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 0);
      }

      // 2. Title and header buttons fade down into place.
      if (title) tl.fromTo(title, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.1);
      if (buttons) tl.fromTo(buttons, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.18);

      // 3. Stat cards rise; their numbers count up to the target in `data-to`.
      if (stats.length) {
        tl.fromTo(stats, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: STAGGER.normal, ease: 'power3.out' }, 0.3);
        stats.forEach((stat, i) => {
          const number = stat.querySelector('[data-anim="dash-stat-number"]');
          const to = Number(stat.dataset.to ?? 0);
          if (number) tl.add(countTo(number, to, { duration: 1 }), 0.4 + i * STAGGER.normal);
        });
      }

      // 4. Filter dropdowns fade in left to right.
      if (filters.length) {
        tl.fromTo(filters, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' }, 0.5);
      }

      // 5. Bar chart grows from the baseline. Highlighted bars animate last, with a tiny overshoot + glow pulse.
      const normalBars = bars.filter((b) => b.dataset.highlight !== 'true');
      const highlightBars = bars.filter((b) => b.dataset.highlight === 'true');
      if (normalBars.length) {
        tl.fromTo(normalBars, { scaleY: 0 }, { scaleY: 1, duration: 0.7, stagger: 0.07, ease: 'power4.out' }, 0.7);
      }
      if (highlightBars.length) {
        tl.fromTo(
          highlightBars,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.6, stagger: 0.07, ease: 'back.out(1.6)' },
          0.7 + normalBars.length * 0.07,
        );
      }

      // 6. Gauge: the arc draws from empty to `data-pct`, in sync with the number counting up.
      if (gaugeArc) {
        const circumference = Number(gaugeArc.dataset.circumference ?? 0);
        const pct = Number(gaugeArc.dataset.pct ?? 0);
        gsap.set(gaugeArc, { strokeDasharray: circumference });
        tl.fromTo(
          gaugeArc,
          { strokeDashoffset: circumference },
          { strokeDashoffset: circumference * (1 - pct / 100), duration: 1.1, ease: 'power2.out' },
          1.1,
        );
        if (gaugeNumber) tl.add(countTo(gaugeNumber, pct, { duration: 1.1 }), 1.1);
      }
      if (legend) {
        tl.fromTo(legend, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 2.3);
      }

      // ---------- Live feel, once visible: refresh pulse + bars breathing ----------
      if (refresh) {
        gsap.to(refresh, { scale: 1.15, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
      }
      bars.forEach((bar, i) => {
        gsap.to(bar, {
          scaleY: 1.03,
          duration: gsap.utils.random(2.5, 4.5),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          repeatRefresh: true,
          delay: 2 + i * 0.15,
        });
      });
    });
  }, section);

  return () => {
    ctx.kill();
    ScrollTrigger.getAll()
      .filter((st) => st.trigger === cardWrap)
      .forEach((st) => st.kill());
  };
}
