// Shared GSAP feel for the QA, Score, Checklist and Dashboard sections.
// Tune the motion here rather than hunting through each section's file.
import { gsap } from 'gsap';

export const EASE = {
  /** Standard entrance: things arriving into place. */
  entrance: 'power3.out',
  /** Big reveals: headline lines, clip-path cards, the dashboard card landing. */
  reveal: 'expo.out',
  /** Scrubbed motion tied directly to scroll position. */
  scrub: 'none',
  /** Checklist circle pop. The one intentional overshoot in the system. */
  pop: 'back.out(1.7)',
} as const;

export const DURATION = {
  fast: 0.6,
  base: 1,
  headline: 1.1,
  reveal: 1.4,
} as const;

export const STAGGER = {
  tight: 0.06,
  normal: 0.1,
  loose: 0.15,
} as const;

/** ScrollTrigger defaults for every non-scrubbed section timeline. */
export const TRIGGER_DEFAULTS = {
  start: 'top 80%',
  toggleActions: 'play none none reverse',
} as const;

export const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
export const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Reduced motion: just an opacity fade, no transforms, no clip-path, no scroll scrubbing. */
export function reducedMotionFade(targets: gsap.DOMTarget) {
  gsap.set(targets, { autoAlpha: 1, clearProps: 'transform,filter,clipPath' });
}
