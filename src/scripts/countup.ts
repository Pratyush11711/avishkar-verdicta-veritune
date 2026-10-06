const DURATION_MS = 1400;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function run(el: HTMLElement) {
  const final = el.textContent ?? '';
  const to = Number(el.dataset.to);
  const suffix = el.dataset.suffix ?? '';
  // Small targets ("1 million", "5+") count with one decimal so the motion is visible.
  const decimals = to < 10 ? 1 : 0;
  if (!Number.isFinite(to)) return;

  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION_MS);
    if (t >= 1) {
      el.textContent = final;
      return;
    }
    el.textContent = `${(to * easeOutCubic(t)).toFixed(decimals)}${suffix}`;
    requestAnimationFrame(tick);
  };
  el.textContent = `${(0).toFixed(decimals)}${suffix}`;
  requestAnimationFrame(tick);
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = document.querySelectorAll<HTMLElement>('[data-countup]');

if (!reduce && els.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run(entry.target as HTMLElement);
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
}
