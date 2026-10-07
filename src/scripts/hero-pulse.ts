// React Bits Scroll Float, without GSAP: each card rises out of a vertical stretch
// and settles with a slight overshoot as it scrolls into view. Later cards lag behind.
const floatCards = [...document.querySelectorAll<HTMLElement>('[data-scroll-float]')];

if (floatCards.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const homes: number[] = [];

  const backInOut = (t: number) => {
    const overshoot = 2;
    let p = t * 2;
    if (p < 1) return 0.5 * p * p * ((overshoot + 1) * p - overshoot);
    p -= 2;
    return 0.5 * (p * p * ((overshoot + 1) * p + overshoot) + 2);
  };

  const measure = () => {
    for (const card of floatCards) card.style.transform = 'none';
    floatCards.forEach((card, i) => {
      homes[i] = card.getBoundingClientRect().top + window.scrollY;
    });
  };

  const render = () => {
    const viewH = window.innerHeight;
    const start = viewH * 1.05;
    const end = viewH * 0.4;
    floatCards.forEach((card, i) => {
      const raw = (start - (homes[i] - window.scrollY)) / (start - end);
      const t = Math.min(1, Math.max(0, (raw - i * 0.08) / 0.72));
      const e = backInOut(t);
      const y = (1 - e) * 72;
      const sx = 0.88 + 0.12 * e;
      const sy = 1.28 - 0.28 * e;
      card.style.transform = `translateY(${y}%) scale(${sx}, ${sy})`;
      card.style.opacity = String(Math.min(1, Math.max(0, e)));
    });
  };

  measure();
  render();
  window.addEventListener('scroll', render, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    render();
  });
  window.addEventListener('load', () => {
    measure();
    render();
  });
}

// The pulse itself is pure CSS. This only pauses it while the hero is off screen.
const hero = document.querySelector<HTMLElement>('[data-hero]');

if (hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => hero.toggleAttribute('data-offscreen', !entry.isIntersecting)).observe(hero);
}
