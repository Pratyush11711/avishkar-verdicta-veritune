// Writes web-sized copies of the provided renders and icons into /public/optimized.
// Originals in /public/images and /public/icons are never modified.
// Run with: npm run optimize:images
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'public/optimized';
fs.mkdirSync(OUT, { recursive: true });

/** name -> source file and output widths. Largest width is roughly 2x display size. */
const images = {
  hero: { src: 'public/images/hero.png', widths: [960, 1600, 2048] },
  'img1-problem': { src: 'public/images/Problem.png', widths: [640, 1200] },
  'img2-verdicta': { src: 'public/images/Verdicta.png', widths: [560, 1024] },
  'img3-veritune': { src: 'public/images/Veritune.png', widths: [560, 1024] },
  'img4-suite': { src: 'public/images/Suite_band.png', widths: [960, 2048] },
  'img5-multilingual': { src: 'public/images/Multilingual.png', widths: [640, 1200] },
  'img6-cta': { src: 'public/images/Final_CTA.png', widths: [960, 1344] },
  'img7-verdicta-dash': { src: 'public/dashboard/Calm glassmorphic campaign analytics dashboard (1).png', widths: [640, 1680] },
  'img8-veritune-dash': { src: 'public/dashboard/veritune-analysis.jpg', widths: [640, 1024] },
};

const icons = {
  'i01-recordings': 'audio-waveform-sitting.svg',
  'i02-scorecard': 'clipboard-with-three.svg',
  'i03-report': 'document-with-small-bar-char.svg',
  'i04-review': 'speech-bubbles.svg',
  'i05-deployment': 'server-rack-inside-a-soft.svg',
  'i06-security': 'shield-with-a-keyhole.svg',
  'i07-integrations': 'two-plug-connectors.svg',
  'i08-access': 'key-with-three-small-user.svg',
  'i09-whitelabel': 'blank-tag.svg',
  'i10-dashboards': 'floating-panel.svg',
  'i11-healthcare': 'heart-with-a-pulse-line-.svg',
  'i12-bpo': 'call-centre-headset.svg',
  'i13-telecom': 'signal-tower-with-three-arcs.svg',
  'i14-finance': 'stack-of-three-coins.svg',
};

const kb = (file) => `${Math.round(fs.statSync(file).size / 1024)} KB`;

for (const [name, { src, widths }] of Object.entries(images)) {
  console.log(`${name}  source ${kb(src)}`);
  for (const w of widths) {
    const webp = path.join(OUT, `${name}-${w}.webp`);
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(webp);
    console.log(`  ${webp}  ${kb(webp)}`);
  }
  const fallbackW = widths[Math.min(1, widths.length - 1)];
  const jpg = path.join(OUT, `${name}-${fallbackW}.jpg`);
  await sharp(src).resize({ width: fallbackW, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(jpg);
  console.log(`  ${jpg}  ${kb(jpg)}`);
}

for (const [name, file] of Object.entries(icons)) {
  const src = path.join('public/icons', file);
  // The renders carry ~25% transparent padding; trim it so the glass object fills the tile.
  const trimmed = await sharp(src).png().trim({ threshold: 4 }).toBuffer();
  const raster = sharp(trimmed).resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const webp = path.join(OUT, `${name}.webp`);
  const png = path.join(OUT, `${name}.png`);
  await raster.clone().webp({ quality: 82, alphaQuality: 90 }).toFile(webp);
  await raster.clone().png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(png);
  console.log(`${name}  source ${kb(src)}  ->  webp ${kb(webp)}, png ${kb(png)}`);
}

await sharp('public/logo-dark.webp').resize({ height: 80 }).webp({ quality: 90 }).toFile(path.join(OUT, 'logo-dark-80.webp'));
await sharp('public/images/hero.png')
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile('public/og-image.jpg');
console.log('logo-dark-80.webp and og-image.jpg written');
