// TODO: replace with the real pilot sign-up URL or form route. Used by every "Start a free pilot" button.
export const PILOT_CTA_HREF = '#';

// TODO: replace with the real contact route (calendar link, contact form or mailto supplied by Avishkar AI).
export const TALK_TO_TEAM_HREF = '#';

// TODO: replace with the production domain. Also update `site` in astro.config.mjs.
export const SITE_URL = 'https://example.com';

const flagEnv = import.meta.env.PUBLIC_SHOW_REVIEW_FLAGS;

/**
 * Shows review markers on unconfirmed copy and dev labels on placeholders.
 * Defaults to on in `astro dev` and off in `astro build`; override with PUBLIC_SHOW_REVIEW_FLAGS=true|false.
 */
export const SHOW_REVIEW_FLAGS: boolean =
  flagEnv === undefined || flagEnv === '' ? import.meta.env.DEV : flagEnv === 'true';

export const SECTION_IDS = {
  top: 'top',
  problem: 'problem',
  verdicta: 'verdicta',
  veritune: 'veritune',
  suite: 'suite',
  multilingual: 'languages',
  numbers: 'numbers',
  pilot: 'pilot',
  enterprise: 'enterprise',
  audience: 'who-its-for',
  faq: 'faq',
  finalCta: 'start',
} as const;

export interface FooterLink {
  label: string;
  href: string;
}

// Only links to sections that exist on this page.
// TODO: add Privacy policy and Terms links here once those pages exist. Do not link to pages that do not exist.
export const FOOTER_LINKS: FooterLink[] = [
  { label: 'Verdicta', href: `#${SECTION_IDS.verdicta}` },
  { label: 'Veritune', href: `#${SECTION_IDS.veritune}` },
  { label: 'How the pilot works', href: `#${SECTION_IDS.pilot}` },
  { label: 'FAQ', href: `#${SECTION_IDS.faq}` },
];

export const LEGAL_LINKS: FooterLink[] = [];
