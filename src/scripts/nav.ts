// Sticky nav: entrance, scroll-spy pill, and the frosted bar after 40px.
// The pill is one shared element. Section triggers move it; clicks scroll with it.
import { gsap, ScrollTrigger } from './motion/register';

const DURATION = {
  enter: 0.9,
  pill: 0.6,
  lock: 900,
} as const;

const EASE = {
  enter: 'power3.out',
  pill: 'power3.inOut',
} as const;

const SCROLL = {
  frostAt: 40,
} as const;

let dispose: (() => void) | null = null;

export function cleanup() {
  dispose?.();
  dispose = null;
}

export function initNav() {
  cleanup();

  const header = document.querySelector<HTMLElement>('[data-anim="nav"]');
  if (!header) return cleanup;

  const pill = header.querySelector<HTMLElement>('[data-anim="nav-pill"]');
  const links = Array.from(header.querySelectorAll<HTMLAnchorElement>('[data-anim="nav-link"]'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const abort = new AbortController();
  const { signal } = abort;
  let active: HTMLAnchorElement | null = null;
  let lockUntil = 0;

  const ctx = gsap.context(() => {
    // 9. Bar drops in at load. Reduced motion just appears.
    if (reduce) {
      gsap.set(header, { autoAlpha: 1, y: 0 });
      if (links.length) gsap.set(links, { autoAlpha: 1 });
    } else {
      gsap.fromTo(
        header,
        { autoAlpha: 0, y: -24 },
        { autoAlpha: 1, y: 0, duration: DURATION.enter, ease: EASE.enter },
      );
      if (links.length) {
        gsap.fromTo(links, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.04, delay: 0.15 });
      }
    }

    const place = (link: HTMLAnchorElement | null, animate: boolean, commit = true) => {
      if (!pill) return;
      if (!link) {
        pill.classList.remove('is-visible');
        gsap.to(pill, { autoAlpha: 0, duration: reduce ? 0 : 0.25, overwrite: 'auto' });
        for (const item of links) item.removeAttribute('aria-current');
        return;
      }
      const x = link.offsetLeft;
      const width = link.offsetWidth;
      pill.classList.add('is-visible');
      const vars = { x, width, autoAlpha: 1, overwrite: 'auto' as const };
      if (animate && !reduce) gsap.to(pill, { ...vars, duration: DURATION.pill, ease: EASE.pill });
      else gsap.set(pill, vars);
      if (commit) active = link;
      for (const item of links) {
        if (item === link) item.setAttribute('aria-current', 'location');
        else item.removeAttribute('aria-current');
      }
    };

    // First paint: sit on the active section with no slide.
    const activeOnLoad = [...links].reverse().find((link) => {
      const section = link.hash ? document.getElementById(link.hash.slice(1)) : null;
      return !!section && section.getBoundingClientRect().top <= window.innerHeight * 0.4;
    });
    place(activeOnLoad ?? null, false);

    for (const link of links) {
      const id = link.hash.replace('#', '');
      const section = id ? document.getElementById(id) : null;
      if (!section) continue;

      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (!self.isActive || performance.now() < lockUntil) return;
          place(link, true);
        },
      });

      // Click scrolls to the section and the pill leaves with it.
      link.addEventListener(
        'click',
        (event) => {
          if (!section) return;
          event.preventDefault();
          lockUntil = performance.now() + DURATION.lock;
          place(link, true);
          section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        },
        { signal },
      );

      link.addEventListener('pointerenter', () => place(link, true, false), { signal });
      link.addEventListener('focus', () => place(link, true, false), { signal });
    }

    const switcher = header.querySelector<HTMLElement>('[data-nav-switcher]');
    switcher?.addEventListener('pointerleave', () => place(active, true, false), { signal });
    switcher?.addEventListener(
      'focusout',
      (event) => {
        if (!switcher.contains(event.relatedTarget as Node | null)) place(active, true, false);
      },
      { signal },
    );

    // Stronger shadow and blur once the page has moved. Glass filter stays put.
    ScrollTrigger.create({
      start: SCROLL.frostAt,
      end: 99999,
      onToggle: (self) => {
        header.classList.toggle('is-scrolled', self.isActive);
        header.toggleAttribute('data-scrolled', self.isActive);
      },
    });
  }, header);

  const toggle = header.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const sheet = document.getElementById(toggle?.getAttribute('aria-controls') ?? '');

  if (toggle && sheet) {
    const focusables = () => [toggle, ...sheet.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];

    const setOpen = (open: boolean, restoreFocus = true) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      sheet.hidden = !open;
      header.toggleAttribute('data-menu-open', open);
      if (open) sheet.querySelector<HTMLElement>('a[href]')?.focus();
      else if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'), { signal });
    sheet.addEventListener(
      'click',
      (event) => {
        if ((event.target as HTMLElement).closest('a')) setOpen(false, false);
      },
      { signal },
    );
    document.addEventListener(
      'keydown',
      (event) => {
        if (sheet.hidden) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
          return;
        }
        if (event.key !== 'Tab') return;
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      },
      { signal },
    );
    window.matchMedia('(min-width: 1024px)').addEventListener(
      'change',
      (mq) => {
        if (mq.matches && !sheet.hidden) setOpen(false, false);
      },
      { signal },
    );
  }

  dispose = () => {
    abort.abort();
    ctx.revert();
  };
  requestAnimationFrame(() => ScrollTrigger.refresh());
  return cleanup;
}

void initNav();
document.addEventListener('astro:page-load', () => {
  initNav();
});
document.addEventListener('astro:before-swap', cleanup);

if (document.readyState === 'complete') ScrollTrigger.refresh();
else window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
