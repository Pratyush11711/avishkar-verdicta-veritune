// React Bits Glass Surface: builds the edge-refraction map and switches the
// bar to backdrop-filter: url(#filter) where Chromium supports it.
// https://reactbits.dev/components/glass-surface

const BORDER_WIDTH = 0.07;
const BRIGHTNESS = 50;
const MAP_OPACITY = 0.93;
const BLUR = 11;
const DISPLACE = 0;
const DISTORTION = -180;
const CHANNELS = { red: 0, green: 10, blue: 20 } as const;
const X_CHANNEL = 'R';
const Y_CHANNEL = 'G';
const BLEND = 'difference';

function supportsSvgFilters(filterId: string) {
  const webkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  if (webkit || /Firefox/.test(navigator.userAgent)) return false;
  const probe = document.createElement('div');
  probe.style.backdropFilter = `url(#${filterId})`;
  return probe.style.backdropFilter !== '';
}

function displacementMap(width: number, height: number, radius: number, gradId: string) {
  const edge = Math.min(width, height) * (BORDER_WIDTH * 0.5);
  const svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradId}-x" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/>
      </linearGradient>
      <linearGradient id="${gradId}-y" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="black"/>
    <rect width="${width}" height="${height}" rx="${radius}" fill="url(#${gradId}-x)"/>
    <rect width="${width}" height="${height}" rx="${radius}" fill="url(#${gradId}-y)" style="mix-blend-mode:${BLEND}"/>
    <rect x="${edge}" y="${edge}" width="${Math.max(0, width - edge * 2)}" height="${Math.max(0, height - edge * 2)}" rx="${radius}" fill="hsl(0 0% ${BRIGHTNESS}% / ${MAP_OPACITY})" style="filter:blur(${BLUR}px)"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function mount(el: HTMLElement) {
  if (el.dataset.glass === 'blur') return;
  const filterId = el.dataset.filterId;
  const feImage = el.querySelector('feImage');
  if (!filterId || !feImage) return;

  const channels = el.querySelectorAll<SVGFEDisplacementMapElement>('[data-channel]');
  for (const node of channels) {
    const offset = CHANNELS[node.dataset.channel as keyof typeof CHANNELS] ?? 0;
    node.setAttribute('scale', String(DISTORTION + offset));
    node.setAttribute('xChannelSelector', X_CHANNEL);
    node.setAttribute('yChannelSelector', Y_CHANNEL);
  }
  el.querySelector('feGaussianBlur')?.setAttribute('stdDeviation', String(DISPLACE));

  const paint = () => {
    const width = el.clientWidth;
    const height = el.clientHeight;
    if (width < 2 || height < 2) return;
    const radius = el.dataset.radius === 'auto' ? Math.min(width, height) / 2 : Number(el.dataset.radius) || 20;
    const href = displacementMap(Math.round(width), Math.round(height), radius, filterId);
    feImage.setAttribute('href', href);
  };

  paint();
  if ('ResizeObserver' in window) new ResizeObserver(paint).observe(el);

  if (supportsSvgFilters(filterId)) {
    el.style.setProperty('--glass-filter', `url(#${filterId})`);
    el.dataset.mode = 'svg';
  }
}

document.querySelectorAll<HTMLElement>('[data-glass-surface]').forEach(mount);
