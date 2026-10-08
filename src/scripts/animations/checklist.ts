// Feature checklist — "audit pass".
// One master timeline per list: a teal scan beam travels the rows, and each row
// checks off at the moment the beam crosses it.
//
// data-anim attributes this file reads:
//   list         wrapper around the grid (positioning context + trigger)
//   scan-beam    the horizontal gradient line
//   row          one feature row (left and right columns share a timestamp)
//   divider      the row's top rule
//   divider-dot  the glow that rides the drawing rule
//   tile         the rounded check tile
//   tile-fill    solid-teal overlay used for the "passed" flash
//   ripple       ring that expands once per pass (and again on idle re-checks)
//   tick         the check icon (svg; the path inside is drawn)
//   text         the row copy, SplitText'd into masked lines
//   mark         an emphasis phrase inside the text
//   wash         faint white wash that lights the row as it passes
//   spotlight    cursor-follow radial gradient (hover only)
import { gsap, ScrollTrigger, SplitText } from '../motion/register';

/** Flip to true to drive the audit from scroll position instead of playing it once. */
const SCRUB_MODE = false;

const AUDIT = {
  beamDuration: 2.2,
  beamEase: 'power2.inOut',
  dividerDuration: 0.7,
  tileDuration: 0.5,
  tileEase: 'back.out(1.8)',
  tickDuration: 0.35,
  flashIn: 0.25,
  washDuration: 0.8,
  lineDuration: 0.55,
  lineStagger: 0.06,
  textDelay: 0.1,
  markDuration: 0.6,
  markEase: 'power3.out',
  highlightOpacity: 0.18,
  teal: '#1fa8a0',
  idleMin: 3000,
  idleMax: 5000,
  rippleScale: 2.2,
  magneticMax: 4,
} as const;

let dispose: (() => void) | null = null;
let bootToken = 0;
let pageHidden = false;

/** Rows that share an offsetTop are one visual row (left + right column). */
function groupRows(rows: HTMLElement[]) {
  const groups: HTMLElement[][] = [];
  for (const row of rows) {
    const group = groups.find((entry) => Math.abs(entry[0].offsetTop - row.offsetTop) < 8);
    if (group) group.push(row);
    else groups.push([row]);
  }
  return groups;
}

function tickLength(path: SVGPathElement) {
  const length = path.getTotalLength() || 24;
  path.dataset.len = String(length);
  return length;
}

function playRipple(ripple: HTMLElement) {
  gsap.fromTo(
    ripple,
    { scale: 1, autoAlpha: 1 },
    { scale: AUDIT.rippleScale, autoAlpha: 0, duration: 0.7, ease: 'power2.out', overwrite: 'auto' },
  );
}

function bindHover(row: HTMLElement) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};

  const tile = row.querySelector<HTMLElement>('[data-anim="tile"]');
  const fill = row.querySelector<HTMLElement>('[data-anim="tile-fill"]');
  const text = row.querySelector<HTMLElement>('[data-anim="text"]');
  const spot = row.querySelector<HTMLElement>('[data-anim="spotlight"]');
  const tick = row.querySelector<SVGPathElement>('[data-anim="tick"] path');
  if (!tile || !spot) return () => {};

  const mx = gsap.quickTo(row, '--mx', { duration: 0.35, ease: 'power3.out' });
  const my = gsap.quickTo(row, '--my', { duration: 0.35, ease: 'power3.out' });
  const pullX = gsap.quickTo(tile, 'x', { duration: 0.3, ease: 'power3.out' });
  const pullY = gsap.quickTo(tile, 'y', { duration: 0.3, ease: 'power3.out' });

  const onMove = (event: MouseEvent) => {
    const rect = row.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    mx(localX);
    my(localY);
    // offsetLeft/Top ignore the live transform, so the pull doesn't chase itself.
    const originX = tile.offsetLeft + tile.offsetWidth / 2;
    const originY = tile.offsetTop + tile.offsetHeight / 2;
    pullX(gsap.utils.clamp(AUDIT.magneticMax * -1, AUDIT.magneticMax, localX - originX));
    pullY(gsap.utils.clamp(AUDIT.magneticMax * -1, AUDIT.magneticMax, localY - originY));
  };

  const onEnter = () => {
    gsap.to(spot, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' });
    if (fill) gsap.to(fill, { autoAlpha: 1, duration: AUDIT.flashIn, overwrite: 'auto' });
    if (text) gsap.to(text, { x: 4, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
    if (tick) {
      const length = Number(tick.dataset.len || tickLength(tick));
      gsap.fromTo(
        tick,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: AUDIT.tickDuration, ease: 'power2.out', overwrite: 'auto' },
      );
    }
  };

  const onLeave = () => {
    gsap.to(spot, { autoAlpha: 0, duration: 0.4, overwrite: 'auto' });
    if (fill) gsap.to(fill, { autoAlpha: 0, duration: 0.35, overwrite: 'auto' });
    if (text) gsap.to(text, { x: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
    pullX(0);
    pullY(0);
  };

  row.addEventListener('mousemove', onMove);
  row.addEventListener('mouseenter', onEnter);
  row.addEventListener('mouseleave', onLeave);
  return () => {
    row.removeEventListener('mousemove', onMove);
    row.removeEventListener('mouseenter', onEnter);
    row.removeEventListener('mouseleave', onLeave);
  };
}

function initList(list: HTMLElement): () => void {
  list.style.setProperty('--checklist-teal', AUDIT.teal);
  list.style.setProperty('--mark-opacity', String(AUDIT.highlightOpacity));

  let generation = 0;
  let ctx: gsap.Context | null = null;
  let idleTimer = 0;
  let resizeTimer = 0;
  let inView = false;
  const hoverCleanups: Array<() => void> = [];

  const stopIdle = () => window.clearTimeout(idleTimer);

  const clearHover = () => {
    hoverCleanups.splice(0).forEach((fn) => fn());
  };

  const arm = () => {
    const gen = ++generation;
    stopIdle();
    clearHover();
    ctx?.revert();

    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      let played = false;
      let ready = false;

      const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-anim="row"]'));
      const beam = list.querySelector<HTMLElement>('[data-anim="scan-beam"]');

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // No beam, ripples, spotlight or idle loop. Ticks are already drawn.
        gsap.set(list, { autoAlpha: 1 });
        if (beam) gsap.set(beam, { autoAlpha: 0 });
        rows.forEach((row) => {
          const tick = row.querySelector<SVGPathElement>('[data-anim="tick"] path');
          if (tick) {
            tick.style.strokeDasharray = '';
            tick.style.strokeDashoffset = '0';
          }
          const marks = Array.from(row.querySelectorAll('[data-anim="mark"]'));
          if (marks.length) gsap.set(marks, { autoAlpha: 1, '--mark-scale': 1 });
          gsap.set(
            [
              row,
              row.querySelector('[data-anim="divider"]'),
              row.querySelector('[data-anim="tile"]'),
              row.querySelector('[data-anim="tick"]'),
              row.querySelector('[data-anim="text"]'),
            ].filter(Boolean) as Element[],
            { autoAlpha: 1, scale: 1, rotation: 0, scaleX: 1 },
          );
          gsap.set(
            [
              row.querySelector('[data-anim="ripple"]'),
              row.querySelector('[data-anim="tile-fill"]'),
              row.querySelector('[data-anim="wash"]'),
              row.querySelector('[data-anim="spotlight"]'),
              row.querySelector('[data-anim="divider-dot"]'),
            ].filter(Boolean) as Element[],
            { autoAlpha: 0 },
          );
        });
        gsap.fromTo(rows, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.04, ease: 'power1.out' });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const lineMap = new Map<HTMLElement, Element[]>();

        // The global no-flash rule hides every [data-anim] node. Reveal the shell now and
        // hold each piece in its "before the beam" state until its own tween starts.
        gsap.set(list, { autoAlpha: 1 });
        gsap.set(rows, { autoAlpha: 1 });
        if (beam) gsap.set(beam, { autoAlpha: 0, y: 0 });

        rows.forEach((row) => {
          const text = row.querySelector<HTMLElement>('[data-anim="text"]');
          const tile = row.querySelector<HTMLElement>('[data-anim="tile"]');
          const tickSvg = row.querySelector<SVGSVGElement>('[data-anim="tick"]');
          const tick = tickSvg?.querySelector<SVGPathElement>('path') ?? null;
          const divider = row.querySelector<HTMLElement>('[data-anim="divider"]');
          const marks = Array.from(row.querySelectorAll<HTMLElement>('[data-anim="mark"]'));

          if (divider) gsap.set(divider, { autoAlpha: 1, scaleX: 0, transformOrigin: 'left center' });
          if (tile) gsap.set(tile, { autoAlpha: 0, scale: 0.6, rotation: -12, transformOrigin: 'center' });
          if (tick && tickSvg) {
            const length = tickLength(tick);
            gsap.set(tickSvg, { autoAlpha: 1 });
            gsap.set(tick, { strokeDasharray: length, strokeDashoffset: length });
          }
          if (marks.length) gsap.set(marks, { autoAlpha: 1, '--mark-scale': 0 });
          gsap.set(
            [
              row.querySelector('[data-anim="divider-dot"]'),
              row.querySelector('[data-anim="tile-fill"]'),
              row.querySelector('[data-anim="ripple"]'),
              row.querySelector('[data-anim="wash"]'),
              row.querySelector('[data-anim="spotlight"]'),
            ].filter(Boolean) as Element[],
            { autoAlpha: 0 },
          );

          if (text) {
            gsap.set(text, { autoAlpha: 1 });
            const split = new SplitText(text, {
              type: 'lines',
              mask: 'lines',
              autoSplit: true,
              linesClass: 'checklist-line',
              onSplit: (self) => {
                lineMap.set(text, self.lines);
                gsap.set(self.lines, { yPercent: played ? 0 : 100 });
                // autoSplit re-splits on resize. Rebuild only if the audit hasn't played,
                // so the master timeline keeps targeting live line nodes.
                if (ready && !played && gen === generation) {
                  window.clearTimeout(resizeTimer);
                  resizeTimer = window.setTimeout(() => {
                    if (gen === generation && !played) arm();
                  }, 160);
                }
              },
            });
            gsap.set(split.lines, { yPercent: played ? 0 : 100 });
          }
        });

        // One timeline. Position params (not delays) keep the beam and each row locked together.
        const tl = gsap.timeline({
          scrollTrigger: SCRUB_MODE
            ? { trigger: list, start: 'top 70%', end: 'bottom 40%', scrub: 0.6, invalidateOnRefresh: true }
            : { trigger: list, start: 'top 75%', toggleActions: 'play none none none', invalidateOnRefresh: true },
          onComplete: () => {
            if (SCRUB_MODE || gen !== generation) return;
            played = true;
            rows.forEach((row) => hoverCleanups.push(bindHover(row)));
            inView = true;
            startIdle();
          },
        });

        // 1. Scan beam: top to bottom, then fade out.
        if (beam) {
          tl.fromTo(
            beam,
            { y: 0, autoAlpha: 1 },
            { y: () => list.offsetHeight, duration: AUDIT.beamDuration, ease: AUDIT.beamEase, immediateRender: false },
            0,
          );
          tl.to(beam, { autoAlpha: 0, duration: 0.35, immediateRender: false }, AUDIT.beamDuration - 0.3);
        }

        const height = list.offsetHeight || 1;
        groupRows(rows).forEach((group) => {
          // Row fires as the beam crosses its top edge. Both columns share this time.
          const at = (group[0].offsetTop / height) * AUDIT.beamDuration;
          group.forEach((row) => addRow(tl, row, at, lineMap));
        });

        const startIdle = () => {
          stopIdle();
          const loop = () => {
            idleTimer = window.setTimeout(() => {
              if (gen !== generation) return;
              if (!pageHidden && inView) {
                const row = rows[Math.floor(Math.random() * rows.length)];
                recheck(row);
              }
              if (gen === generation) loop();
            }, gsap.utils.random(AUDIT.idleMin, AUDIT.idleMax));
          };
          loop();
        };

        ScrollTrigger.create({
          trigger: list,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            inView = self.isActive;
          },
        });

        ready = true;
      });
    }, list);
  };

  arm();

  return () => {
    generation += 1;
    stopIdle();
    clearHover();
    window.clearTimeout(resizeTimer);
    ctx?.revert();
  };
}

/** Everything that happens to one row the moment the beam reaches it. */
function addRow(tl: gsap.core.Timeline, row: HTMLElement, at: number, lineMap: Map<HTMLElement, Element[]>) {
  const divider = row.querySelector<HTMLElement>('[data-anim="divider"]');
  const dot = row.querySelector<HTMLElement>('[data-anim="divider-dot"]');
  const tile = row.querySelector<HTMLElement>('[data-anim="tile"]');
  const fill = row.querySelector<HTMLElement>('[data-anim="tile-fill"]');
  const ripple = row.querySelector<HTMLElement>('[data-anim="ripple"]');
  const tick = row.querySelector<SVGPathElement>('[data-anim="tick"] path');
  const text = row.querySelector<HTMLElement>('[data-anim="text"]');
  const marks = Array.from(row.querySelectorAll<HTMLElement>('[data-anim="mark"]'));
  const wash = row.querySelector<HTMLElement>('[data-anim="wash"]');
  const lines = text ? lineMap.get(text) : undefined;

  // 2. Divider draws left to right; the dot rides the leading edge, then fades.
  if (divider) {
    tl.fromTo(
      divider,
      { scaleX: 0 },
      { scaleX: 1, duration: AUDIT.dividerDuration, ease: 'power2.inOut', immediateRender: false },
      at,
    );
  }
  if (dot) {
    tl.fromTo(
      dot,
      { x: 0, autoAlpha: 1 },
      { x: () => row.offsetWidth, duration: AUDIT.dividerDuration, ease: 'power2.inOut', immediateRender: false },
      at,
    );
    tl.to(dot, { autoAlpha: 0, duration: 0.2, immediateRender: false }, at + AUDIT.dividerDuration - 0.15);
  }

  // 3. Check tile: pop, draw the tick, flash solid teal, send one ripple.
  if (tile) {
    tl.fromTo(
      tile,
      { autoAlpha: 0, scale: 0.6, rotation: -12 },
      {
        autoAlpha: 1,
        scale: 1,
        rotation: 0,
        duration: AUDIT.tileDuration,
        ease: AUDIT.tileEase,
        immediateRender: false,
      },
      at,
    );
  }
  if (tick) {
    tl.to(tick, { strokeDashoffset: 0, duration: AUDIT.tickDuration, ease: 'power2.out', immediateRender: false }, at + 0.12);
  }
  if (fill) {
    tl.fromTo(fill, { autoAlpha: 0 }, { autoAlpha: 1, duration: AUDIT.flashIn, ease: 'power2.out', immediateRender: false }, at + 0.15);
    tl.to(fill, { autoAlpha: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, at + 0.15 + AUDIT.flashIn);
  }
  if (ripple) {
    tl.fromTo(
      ripple,
      { scale: 1, autoAlpha: 1 },
      { scale: AUDIT.rippleScale, autoAlpha: 0, duration: 0.7, ease: 'power2.out', immediateRender: false },
      at + 0.1,
    );
  }

  // 4. Masked lines rise just after the tile pops. The highlight sweeps once the line has landed.
  const lineAt = at + AUDIT.textDelay;
  if (lines?.length) {
    tl.fromTo(
      lines,
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: AUDIT.lineDuration,
        stagger: AUDIT.lineStagger,
        ease: 'power3.out',
        immediateRender: false,
      },
      lineAt,
    );
  }
  if (marks.length) {
    tl.to(
      marks,
      { '--mark-scale': 1, duration: AUDIT.markDuration, stagger: 0.05, ease: AUDIT.markEase, immediateRender: false },
      lineAt + AUDIT.lineDuration,
    );
  }

  // 5. A short white wash, so the beam appears to light the row as it passes.
  if (wash) {
    tl.fromTo(wash, { autoAlpha: 0 }, { autoAlpha: 0.5, duration: 0.25, ease: 'power1.out', immediateRender: false }, at);
    tl.to(wash, { autoAlpha: 0, duration: AUDIT.washDuration - 0.25, ease: 'power1.in', immediateRender: false }, at + 0.25);
  }
}

function recheck(row: HTMLElement) {
  const fill = row.querySelector<HTMLElement>('[data-anim="tile-fill"]');
  const ripple = row.querySelector<HTMLElement>('[data-anim="ripple"]');
  if (fill) {
    gsap.fromTo(fill, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, yoyo: true, repeat: 1, overwrite: 'auto' });
  }
  if (ripple) playRipple(ripple);
}

export function initChecklist(): () => void {
  cleanup();
  const stops = Array.from(document.querySelectorAll<HTMLElement>('[data-anim="list"]')).map(initList);
  const onVis = () => {
    pageHidden = document.hidden;
  };
  document.addEventListener('visibilitychange', onVis);
  dispose = () => {
    stops.forEach((stop) => stop());
    document.removeEventListener('visibilitychange', onVis);
  };
  requestAnimationFrame(() => ScrollTrigger.refresh());
  return dispose;
}

export function cleanup() {
  dispose?.();
  dispose = null;
}

async function boot() {
  const token = ++bootToken;
  await document.fonts.ready;
  if (token !== bootToken) return;
  initChecklist();
}

// This project has no <ClientRouter />, so boot() is what actually runs.
// The listeners cover a later switch to client-side routing: page-load rebuilds,
// before-swap reverts contexts and kills the ScrollTriggers they created.
void boot();
document.addEventListener('astro:page-load', () => {
  void boot();
});
document.addEventListener('astro:before-swap', cleanup);

if (document.readyState === 'complete') ScrollTrigger.refresh();
else window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
