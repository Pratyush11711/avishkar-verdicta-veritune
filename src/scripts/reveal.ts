const STAGGER_MS = 70;

function reveal(el: Element) {
  if (el.hasAttribute('data-reveal-stagger')) {
    Array.from(el.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty('--reveal-delay', `${i * STAGGER_MS}ms`);
      child.classList.add('is-revealed');
    });
  }
  el.classList.add('is-revealed');
}

const targets = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');

if (!('IntersectionObserver' in window)) {
  targets.forEach(reveal);
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
  );
  targets.forEach((el) => io.observe(el));
}
