// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// TODO: keep in sync with SITE_URL in src/data/config.ts once the production domain is confirmed.
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
