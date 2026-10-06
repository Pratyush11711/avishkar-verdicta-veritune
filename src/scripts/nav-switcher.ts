const switcher = document.querySelector<HTMLElement>('[data-nav-switcher]');
const pill = document.querySelector<HTMLElement>('[data-nav-pill]');

if (switcher && pill) {
  const items = Array.from(switcher.querySelectorAll<HTMLAnchorElement>('[data-nav-item]'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current: HTMLAnchorElement | null = null;
  let hovered: HTMLAnchorElement | null = null;
  let lastLeft = 0;
  let lockUntil = 0;

  const target = () => hovered ?? current;

  const place = (el: HTMLAnchorElement | null) => {
    if (!el) {
      pill.classList.remove('is-visible');
      return;
    }
    const next = el.offsetLeft;
    const width = el.offsetWidth;
    const moving = pill.classList.contains('is-visible');
    if (moving && !reduce && next !== lastLeft) {
      pill.style.setProperty('--pill-origin', next > lastLeft ? 'left' : 'right');
      const stretch = Math.abs(next - lastLeft) > 96 ? '1.16' : '1.1';
      pill.style.setProperty('--pill-stretch', stretch);
      pill.classList.remove('is-stretching');
      void pill.offsetWidth;
      pill.classList.add('is-stretching');
    }
    pill.style.setProperty('--pill-x', `${next}px`);
    pill.style.setProperty('--pill-w', `${width}px`);
    pill.classList.add('is-visible');
    lastLeft = next;
  };

  const setCurrent = (el: HTMLAnchorElement | null) => {
    current = el;
    for (const item of items) {
      if (item === el) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    }
    if (!hovered) place(el);
  };

  const sectionOf = (hash: string) => document.getElementById(hash.replace('#', ''));

  const syncFromScroll = () => {
    if (performance.now() < lockUntil) return;
    const mark = window.innerHeight * 0.28;
    let active: HTMLAnchorElement | null = null;
    for (const item of items) {
      const section = sectionOf(item.hash);
      if (!section) continue;
      if (section.getBoundingClientRect().top <= mark) active = item;
    }
    setCurrent(active);
  };

  for (const item of items) {
    item.addEventListener('pointerenter', () => {
      hovered = item;
      place(item);
    });
    item.addEventListener('focus', () => {
      hovered = item;
      place(item);
    });
    item.addEventListener('click', () => {
      hovered = null;
      lockUntil = performance.now() + 1000;
      setCurrent(item);
      place(item);
    });
  }

  switcher.addEventListener('pointerleave', () => {
    hovered = null;
    place(current);
  });
  switcher.addEventListener('focusout', (e) => {
    if (!switcher.contains((e as FocusEvent).relatedTarget as Node | null)) {
      hovered = null;
      place(current);
    }
  });

  pill.addEventListener('animationend', () => pill.classList.remove('is-stretching'));

  window.addEventListener('scroll', syncFromScroll, { passive: true });
  window.addEventListener('hashchange', syncFromScroll);
  window.addEventListener('resize', () => place(target()), { passive: true });
  syncFromScroll();
}
