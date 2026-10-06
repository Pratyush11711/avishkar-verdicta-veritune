const header = document.querySelector<HTMLElement>('[data-nav]');

if (header) {
  const onScroll = () => header.toggleAttribute('data-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

    sheet.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('a')) setOpen(false, false);
    });

    document.addEventListener('keydown', (e) => {
      if (sheet.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    window.matchMedia('(min-width: 1024px)').addEventListener('change', (mq) => {
      if (mq.matches && !sheet.hidden) setOpen(false, false);
    });
  }
}
