// Soft spotlight that follows the pointer behind the hero text. Fine pointers only.
const text = document.querySelector<HTMLElement>('[data-hero-text]');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (text && canHover && !reduce) {
  let frame = 0;
  let x = 0;
  let y = 0;

  const paint = () => {
    frame = 0;
    text.style.setProperty('--mx', `${x}px`);
    text.style.setProperty('--my', `${y}px`);
  };

  text.addEventListener('pointermove', (e) => {
    const r = text.getBoundingClientRect();
    x = e.clientX - r.left;
    y = e.clientY - r.top;
    text.classList.add('is-spot');
    if (!frame) frame = requestAnimationFrame(paint);
  });

  text.addEventListener('pointerleave', () => text.classList.remove('is-spot'));
}
