// React Bits CountUp (https://reactbits.dev/text-animations/count-up), ported to vanilla JS.
// Same spring as the source: damping = 20 + 40 / duration, stiffness = 100 / duration, mass 1,
// whole numbers, starts once when the number scrolls into view.
const DURATION_S = 2;
const DAMPING = 20 + 40 * (1 / DURATION_S);
const STIFFNESS = 100 * (1 / DURATION_S);
const STAGGER_MS = 120;

const format = new Intl.NumberFormat('en-US', { useGrouping: false, maximumFractionDigits: 0 });

function run(el: HTMLElement, delayMs: number) {
  const final = el.textContent ?? '';
  const to = Number(el.dataset.to);
  const suffix = el.dataset.suffix ?? '';
  if (!Number.isFinite(to)) return;

  let x = 0;
  let v = 0;
  let last = 0;

  el.textContent = `${format.format(0)}${suffix}`;

  const tick = (now: number) => {
    if (!last) last = now;
    // Fixed 1/120s sub-steps keep the spring stable if a frame runs long.
    let dt = Math.min(0.064, (now - last) / 1000);
    last = now;
    while (dt > 0) {
      const step = Math.min(dt, 1 / 120);
      const accel = STIFFNESS * (to - x) - DAMPING * v;
      v += accel * step;
      x += v * step;
      dt -= step;
    }

    // Once the rounded value is the target, the tail is invisible: show the real text and stop.
    if (Math.abs(to - x) < 0.5 && Math.abs(v) < 0.5) {
      el.textContent = final;
      return;
    }
    el.textContent = `${format.format(x)}${suffix}`;
    requestAnimationFrame(tick);
  };

  window.setTimeout(() => requestAnimationFrame(tick), delayMs);
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = [...document.querySelectorAll<HTMLElement>('[data-countup]')];

if (!reduce && els.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        run(el, els.indexOf(el) * STAGGER_MS);
        io.unobserve(el);
      }
    },
    { threshold: 0.4 },
  );
  els.forEach((el) => io.observe(el));
}
