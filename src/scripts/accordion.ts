for (const root of document.querySelectorAll<HTMLElement>('[data-accordion]')) {
  const triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger]'));

  const setOpen = (btn: HTMLButtonElement, open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    const panel = document.getElementById(btn.getAttribute('aria-controls') ?? '');
    if (panel) panel.dataset.open = String(open);
    btn.closest('[data-accordion-item]')?.toggleAttribute('data-open', open);
  };

  for (const btn of triggers) {
    btn.addEventListener('click', () => {
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      for (const other of triggers) if (other !== btn) setOpen(other, false);
      setOpen(btn, willOpen);
    });

    btn.addEventListener('keydown', (e) => {
      const i = triggers.indexOf(btn);
      const next = {
        ArrowDown: triggers[(i + 1) % triggers.length],
        ArrowUp: triggers[(i - 1 + triggers.length) % triggers.length],
        Home: triggers[0],
        End: triggers[triggers.length - 1],
      }[e.key];
      if (next) {
        e.preventDefault();
        next.focus();
      }
    });
  }
}
