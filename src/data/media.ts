/**
 * Single source of truth for every image and icon slot.
 * Originals live untouched in /public/images and /public/icons; the page serves the
 * web-sized copies in /public/optimized written by `npm run optimize:images`.
 */

export interface ImageSource {
  /** Width descriptor for srcset. */
  w: number;
  src: string;
}

export interface ImageSlot {
  slot: string;
  /** Original file as provided, for reference. */
  original: string;
  /** Intrinsic size of the original render, used for width/height and aspect ratio. */
  width: number;
  height: number;
  webp: ImageSource[];
  /** JPEG or PNG fallback for browsers without WebP. */
  fallback: string;
  alt: string;
  /** 9:16 art-directed version for viewports under 768px. None supplied yet. */
  mobileSrc?: string;
  /** Used when a mobile version is missing and the desktop render is cropped by object-fit. */
  mobileObjectPosition?: string;
}

export interface IconSlot {
  slot: string;
  original: string;
  webp: string;
  png: string;
  size: number;
}

const O = '/optimized';

const img = (
  slot: string,
  name: string,
  original: string,
  width: number,
  height: number,
  widths: number[],
  fallbackWidth: number,
  alt: string,
  extra: Partial<ImageSlot> = {},
): ImageSlot => ({
  slot,
  original,
  width,
  height,
  webp: widths.map((w) => ({ w, src: `${O}/${name}-${w}.webp` })),
  fallback: `${O}/${name}-${fallbackWidth}.jpg`,
  alt,
  ...extra,
});

export const images = {
  hero: img(
    'Hero',
    'hero',
    '/images/hero.png',
    2048,
    1143,
    [960, 1600, 2048],
    1600,
    'A frosted glass telephone cord uncoils into a straight line on a pale pastel floor, with four small glass orbs beneath it, the last one glowing apricot',
    { mobileObjectPosition: '78% 60%' },
  ),
  problem: img(
    'IMG 1',
    'img1-problem',
    '/images/Problem.png',
    1760,
    1328,
    [640, 1200],
    1200,
    'A grid of clear glass marbles with only three glowing, representing the small share of calls a QA team hears',
  ),
  verdicta: img(
    'IMG 2',
    'img2-verdicta',
    '/images/Verdicta.png',
    1024,
    1024,
    [560, 1024],
    1024,
    'Seven glass bars of different heights joined by a thin glass cord like a scorecard, with one short bar glowing apricot to mark a fatal miss',
  ),
  veritune: img(
    'IMG 3',
    'img3-veritune',
    '/images/Veritune.png',
    1024,
    1024,
    [560, 1024],
    1024,
    'A glass cord shaped like an audio waveform whose light shifts from cool blue to warm apricot, with a small apricot orb resting beneath its highest peak',
  ),
  suite: img(
    'IMG 4',
    'img4-suite',
    '/images/Suite_band.png',
    2048,
    1152,
    [960, 2048],
    2048,
    'Two glass orbs, one aqua and one blue, resting side by side beneath a single straight glass cord',
    { mobileObjectPosition: '50% 100%' },
  ),
  multilingual: img(
    'IMG 5',
    'img5-multilingual',
    '/images/Multilingual.png',
    1760,
    1328,
    [640, 1200],
    1200,
    'Five glass cords tinted aqua, blue, mint, lilac and apricot loop in from the left and merge into one clear straight cord',
  ),
  finalCta: img(
    'IMG 6',
    'img6-cta',
    '/images/Final_CTA.png',
    1344,
    752,
    [960, 1344],
    1344,
    'A straight glass cord ends in a rounded tip beside a single glowing apricot orb',
    { mobileObjectPosition: '42% 100%' },
  ),
} satisfies Record<string, ImageSlot>;

export type ImageKey = keyof typeof images;

/** Product UI screenshots for sections 04 and 05. */
export const productScreenshots: Record<'verdicta' | 'veritune', ImageSlot | null> = {
  verdicta: img(
    'IMG 7',
    'img7-verdicta-dash',
    '/dashboard/Calm glassmorphic campaign analytics dashboard (1).png',
    1670,
    942,
    [640, 1680],
    1680,
    'Verdicta dashboard showing total samples, SIP and bucket counts, a category analytics chart scored by parameter, and an overall achievement gauge',
  ),
  veritune: img(
    'IMG 8',
    'img8-veritune-dash',
    '/dashboard/veritune-analysis.jpg',
    1024,
    582,
    [640, 1024],
    1024,
    'Veritune call analysis panel with audio playback, a call summary and a detailed script adherence breakdown for a single call',
  ),
};

const icon = (slot: string, name: string, original: string): IconSlot => ({
  slot,
  original: `/icons/${original}`,
  webp: `${O}/${name}.webp`,
  png: `${O}/${name}.png`,
  size: 240,
});

export const icons = {
  recordings: icon('I1', 'i01-recordings', 'audio-waveform-sitting.svg'),
  scorecard: icon('I2', 'i02-scorecard', 'clipboard-with-three.svg'),
  report: icon('I3', 'i03-report', 'document-with-small-bar-char.svg'),
  review: icon('I4', 'i04-review', 'speech-bubbles.svg'),
  deployment: icon('I5', 'i05-deployment', 'server-rack-inside-a-soft.svg'),
  security: icon('I6', 'i06-security', 'shield-with-a-keyhole.svg'),
  integrations: icon('I7', 'i07-integrations', 'two-plug-connectors.svg'),
  access: icon('I8', 'i08-access', 'key-with-three-small-user.svg'),
  whiteLabel: icon('I9', 'i09-whitelabel', 'blank-tag.svg'),
  dashboards: icon('I10', 'i10-dashboards', 'floating-panel.svg'),
  healthcare: icon('I11', 'i11-healthcare', 'heart-with-a-pulse-line-.svg'),
  bpo: icon('I12', 'i12-bpo', 'call-centre-headset.svg'),
  telecom: icon('I13', 'i13-telecom', 'signal-tower-with-three-arcs.svg'),
  finance: icon('I14', 'i14-finance', 'stack-of-three-coins.svg'),
} satisfies Record<string, IconSlot>;

export type IconKey = keyof typeof icons;

export const logo = {
  src: '/optimized/logo-dark-80.webp',
  original: '/logo-dark.webp',
  width: 375,
  height: 80,
  alt: 'Avishkar AI',
};

/**
 * Hero geometry, measured on the hero render as percentages of the image box.
 * Retune here if the hero image changes.
 *  - orbs: centre of each orb.
 *  - side: card sits above (over the cord) or below (on the floor) the orb.
 *  - stem: px from the card's left edge where the connector meets the orb.
 *  - pulse: start of the straight part of the cord, its length as % of image width, and its angle.
 */
export const heroGeometry = {
  orbRadius: 1.45,
  orbs: {
    aqua: { x: 58.95, y: 67.9, side: 'below', stem: 252 },
    sky: { x: 67.0, y: 69.0, side: 'above', stem: 236 },
    mint: { x: 74.4, y: 70.1, side: 'below', stem: 28 },
    apricot: { x: 81.6, y: 71.8, side: 'above', stem: 96 },
  },
  pulse: { x: 49.8, y: 62.0, length: 50.4, angle: 6.1 },
} as const;

export type OrbKey = keyof typeof heroGeometry.orbs;
