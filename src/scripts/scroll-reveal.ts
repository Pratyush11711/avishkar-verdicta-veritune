// Scroll reveal (React Bits): rotation scrubs from 3° to 0, and each word
// fades from 0.1 and unblurs from 4px. Stagger matches a 0.5s tween stepped by 0.05.
const BASE_OPACITY = 0.1;
const BASE_ROTATION = 3;
const BLUR = 4;
const WORD_DURATION = 0.5;
const STAGGER = 0.05;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function rangeProgress(value: number, start: number, end: number) {
  if (end >= start - 1) return value <= start ? 1 : 0;
  return clamp((start - value) / (start - end), 0, 1);
}

function paint(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const rotation = rangeProgress(rect.top, vh, vh - rect.height);
  el.style.transform = `rotate(${BASE_ROTATION * (1 - rotation)}deg)`;

  const wordStart = vh * 0.8;
  let wordEnd = vh - rect.height;
  if (wordEnd >= wordStart - 1) wordEnd = vh * 0.45;

  const progress = rangeProgress(rect.top, wordStart, wordEnd);
  const words = el.querySelectorAll<HTMLElement>('.scroll-reveal__word');
  const total = WORD_DURATION + Math.max(0, words.length - 1) * STAGGER;

  words.forEach((word, i) => {
    const local = clamp((progress * total - i * STAGGER) / WORD_DURATION, 0, 1);
    const blur = BLUR * (1 - local);
    word.style.opacity = String(BASE_OPACITY + (1 - BASE_OPACITY) * local);
    word.style.filter = blur < 0.05 ? 'none' : `blur(${blur}px)`;
  });
}

const targets = document.querySelectorAll<HTMLElement>('[data-scroll-reveal]');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce && targets.length) {
  let running = false;
  const tick = () => {
    running = false;
    targets.forEach(paint);
  };
  const kick = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  };

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  kick();
}
