// Wires the four section animations together. Comment any of the init* calls out to
// disable that section's motion without touching its file.
import { initQA } from './qa-section';
import { initScore } from './score-section';
import { initDashboard } from './dashboard';
import { ScrollTrigger } from './register';

let cleanupFns: Array<() => void> = [];

export function init() {
  cleanup();
  // The checklist has its own module (src/scripts/animations/checklist.ts).
  cleanupFns = [initQA(), initScore(), initDashboard()];
}

export function cleanup() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}

// This project does not use Astro's <ClientRouter />, so there's only ever one real
// navigation and `init()` runs once, after fonts are ready (SplitText needs final metrics).
// If the project adopts <ClientRouter /> later, swap the two lines below for:
//   document.addEventListener('astro:page-load', () => document.fonts.ready.then(init));
//   document.addEventListener('astro:before-swap', cleanup);
document.fonts.ready.then(init);

window.addEventListener('load', () => {
  // Defer one tick so images/fonts have settled before measuring trigger positions.
  requestAnimationFrame(() => ScrollTrigger.refresh());
});
