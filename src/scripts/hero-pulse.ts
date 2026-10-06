// The pulse itself is pure CSS. This only pauses it while the hero is off screen.
const hero = document.querySelector<HTMLElement>('[data-hero]');

if (hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => hero.toggleAttribute('data-offscreen', !entry.isIntersecting)).observe(hero);
}
