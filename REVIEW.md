# Review notes

Items for Arpit's sign-off, the image mapping, and every place where the build departs from or interprets the brief.

In `npm run dev`, every flagged string shows a dotted apricot underline and a "Needs sign-off" tooltip. The full note appears on hover through the `title` attribute. In `npm run build` the markers are off; set `PUBLIC_SHOW_REVIEW_FLAGS=true` to turn them on for a review deploy.

## (a) Strings that need sign-off

All of these live in `src/data/copy.ts` as `flag(...)` segments with `needsReview: true` and a `note`.

| # | Section | Text rendered | Where in `copy.ts` |
| --- | --- | --- | --- |
| 1 | 07 Multilingual, body | "English, Spanish, French, German, Portuguese, Arabic, Mandarin and Japanese" | `languages` constant, used in `multilingual.body` |
| 2 | 07 Multilingual, body | "Scoring, summaries and sentiment come back in English, so one QA team can review every region on the same dashboard." | `multilingual.body[3]` |
| 3 | 07 Multilingual, optional line | "Calls that switch languages mid-conversation are analysed as they happen, without splitting or manual tagging." Delete it by setting `multilingual.optionalLine = null`. | `multilingual.optionalLine` |
| 4 | 07 Multilingual, point 2 | "Summaries and action items in English for central QA and leadership" | `multilingual.points[1]` |
| 5 | 09 Pilot, note | "[X business days]". The placeholder renders as written. | `pilot.note[1]` |
| 6 | 09 Pilot, note | "Your data is used only for your pilot." | `pilot.note[3]` |
| 7 | 10 Enterprise, Integrations card | "Genesys Cloud, NICE CXone, Five9, Amazon Connect, Twilio and Avaya" (telephony) | `enterprise.cards[2].body[1]` |
| 8 | 10 Enterprise, Integrations card | "Salesforce, Microsoft Dynamics 365, HubSpot, Zendesk and ServiceNow" (CRM) | `enterprise.cards[2].body[3]` |
| 9 | 12 FAQ, languages answer | The same eight languages as item 1 | `faq.items[3]`, uses `languages` |
| 10 | 12 FAQ, pricing answer | "Pricing depends on monthly call volume and deployment type. We quote after the pilot, based on what you saw in it." | `faq.items[6]` |
| 11 | 04 and 05 Products | No product screenshots were supplied, so a framed placeholder is shown | `productScreenshots` in `src/data/media.ts` |

For items 2, 3, 4 and 10, the brief's instruction prefix ("Confirm:", "Keep only if confirmed:", "[Confirm]", "Confirm model, for example:") is kept in the `note`, not on the page.

## (b) Images and icons

### Slot-to-file mapping

The page serves web-sized copies from `public/optimized/`, written by `npm run optimize:images`. The originals in `public/images` and `public/icons` are untouched.

| Slot | Original file in `public/` | Size | Served as |
| --- | --- | --- | --- |
| Hero | `images/hero.png` | 2048 x 1143, 422 KB | `hero-{960,1600,2048}.webp` (8, 17, 37 KB), `hero-1600.jpg` (28 KB) |
| IMG 1 Problem | `images/Problem.png` | 1760 x 1328 (4:3) | `img1-problem-{640,1200}.webp`, `.jpg` |
| IMG 2 Verdicta | `images/Verdicta.png` | 1024 x 1024 | `img2-verdicta-{560,1024}.webp`, `.jpg` |
| IMG 3 Veritune | `images/Veritune.png` | 1024 x 1024 | `img3-veritune-{560,1024}.webp`, `.jpg` |
| IMG 4 Suite band | `images/Suite_band.png` | 2048 x 1152 (16:9) | `img4-suite-{960,2048}.webp`, `.jpg` |
| IMG 5 Multilingual | `images/Multilingual.png` | 1760 x 1328 (4:3) | `img5-multilingual-{640,1200}.webp`, `.jpg` |
| IMG 6 Final CTA | `images/Final_CTA.png` | 1344 x 752 (16:9) | `img6-cta-{960,1344}.webp`, `.jpg` |
| I1 Recordings | `icons/audio-waveform-sitting.svg` | 1024, about 464 KB | `i01-recordings.webp` / `.png`, 240 px |
| I2 Scorecard | `icons/clipboard-with-three.svg` | | `i02-scorecard` |
| I3 Report | `icons/document-with-small-bar-char.svg` | | `i03-report` |
| I4 Review | `icons/speech-bubbles.svg` | | `i04-review` |
| I5 Deployment | `icons/server-rack-inside-a-soft.svg` | | `i05-deployment` |
| I6 Security | `icons/shield-with-a-keyhole.svg` | | `i06-security` |
| I7 Integrations | `icons/two-plug-connectors.svg` | | `i07-integrations` |
| I8 Access control | `icons/key-with-three-small-user.svg` | | `i08-access` |
| I9 White-label | `icons/blank-tag.svg` | | `i09-whitelabel` |
| I10 Dashboards | `icons/floating-panel.svg` | | `i10-dashboards` |
| I11 Healthcare | `icons/heart-with-a-pulse-line-.svg` | | `i11-healthcare` |
| I12 BPO | `icons/call-centre-headset.svg` | | `i12-bpo` |
| I13 Telecom | `icons/signal-tower-with-three-arcs.svg` | | `i13-telecom` |
| I14 Finance | `icons/stack-of-three-coins.svg` | | `i14-finance` |
| Wordmark | `logo-dark.webp` (1852 x 395) | | `logo-dark-80.webp` (nav and footer) |
| Favicon | `favicon.ico` (existing) | | Used as is. No SVG favicon was supplied, and none was invented. |
| OG image | Generated from the hero | 1200 x 630 | `public/og-image.jpg`. This is a placeholder until a designed OG card exists. |

`avishkar-logo.png` (a white mark on transparency) and `logo-white-nav.webp` are not used. The page has no dark surface for them.

### Placeholders still showing

- Product screenshots for sections 04 and 05. A glass frame with an abstract skeleton is shown in production too, because the PDF says "Leave framed placeholders until they arrive". The caption "Product screenshot to be supplied" shows only when review flags are on.
- No other slot uses a fallback. Every IMG and I slot has a real file.

### Missing mobile (9:16) versions

None were supplied for the hero, IMG 4 or IMG 6. Instead:

- **Hero, under 768 px:** the desktop render is cropped to 4:3 with `object-position: 78% 60%`, so the orbs stay in view. Two cards sit below the image.
- **IMG 4 and IMG 6, under 768 px:** the render fills only the bottom 24rem of the section (`object-fit: cover`, biased toward the subject). The text sits above it on the page background, so it never overlaps the cord or the orbs.

Add `mobileSrc` in `media.ts` when proper 9:16 renders exist.

### Images that differ from their slot description

- **Hero:** 2048 x 1143 PNG, about 422 KB. The original is left as supplied. The served WebP is the 2048 px copy.
- **IMG 4 and IMG 6 are 16:9, not 21:9.** They are shown at 16:9 on tablet and desktop, capped at 56rem tall and cropped from the top on very wide screens. The upper empty area is still clear for the text.
- **IMG 6 is only 1344 px wide.** That is below 2x for a full-bleed band, so it upscales on large screens. The soft gradient hides most of it, but a 2688 px or wider export would be sharper.
- **IMG 1:** the brief asks for three marbles glowing pale aqua. The render has two aqua and one apricot. It still reads as "only three glow". Confirm the apricot one is acceptable.
- **IMG 2:** the brief asks for six aqua and mint bars and one apricot. The render also has one powder-blue bar, and the cord at the base is segmented between bars rather than continuous.
- **Icons:** each SVG wraps a 1024 px PNG plus a mask, at 300 to 600 KB per file, about 6.3 MB for the set. The served copies trim the transparent padding and are 6 to 15 KB each. Most icons share the same iridescent aqua tint, so the per-slot colour differences in the brief (lilac I8, apricot I9 and I14, mint I4, I6 and I11) only show for the tag and the coins.
- **Icon backdrop:** the icons are pale glass and nearly disappear on white glass cards. Each one sits on a small Mist-to-Frost tile, which matches the "very pale seafoam background" in the icon prompt.

## (c) Deviations and interpretations

- **Astro version:** the project was already on Astro 7.3.6 (Vite 8), which is newer than the "Astro 5" in the build prompt. Nothing in the build depends on the difference.
- **FAQ heading:** the brief gives no heading for section 12. It renders as "FAQ", reusing the nav label, because the section needs an `h2`.
- **Card titles:** Enterprise cards ("Deployment: our cloud, ...") and Who it's for cards ("I11 HEALTHCARE") are split into a title and a body. The first letter of each body is capitalised (for example "Our cloud, your private cloud ..."). No words were changed.
- **Pilot steps:** each step is split at its first sentence. "Share a batch of recordings." becomes the title and the rest is the body.
- **Nav label:** the page map says "Pilot" while the copy section says "How the pilot works". The copy section's label is used.
- **Suite line:** rendered as a large paragraph, not a heading, because it is a statement rather than a section title. The section is labelled by it.
- **Hero cards:** content is the suggested illustrative set, never a result claim. Each card is matched to an orb by colour meaning:
  - Aqua orb: Verdicta, required disclosure, Fatal.
  - Sky orb: Veritune, tone shift, Flag.
  - Mint orb: Verdicta, script adherence, Pass.
  - Apricot orb: Veritune, competitor mention, Flag.

  Cards connect to their orbs with hairline stems. All four anchor to the orbs at 1280 px and up. Below that, two cards (Pass and competitor mention) sit under the image. The cards are `aria-hidden` because they are illustrative.
- **Hero contrast:** a soft Mist veil sits behind the text block, and the top of the hero image fades in. Measured against the rendered pixels, Slate body text is at least 4.6:1 at 375, 768 and 1440 px. The under-button line sat closest to the cord and only reached 4.05 to 4.3:1 in Slate, so it uses Ink at 75% (at least 5.2:1).
- **Glass blur:** `backdrop-filter: blur(20px)` is used only where something sits over imagery or scrolling content: the nav, the hero cards, the eyebrow and secondary buttons. Cards on flat page backgrounds use the same white 60% fill, white border and Ink 6% shadow without blur. On a flat background they look identical, and blur would only cost GPU time. A solid fallback is provided for browsers without `backdrop-filter`.
- **Accent phrases (serif italic):** used on these headings, one phrase each:
  - Hero: "every call"
  - Problem: "small fraction"
  - Verdicta: "you already use"
  - Veritune: "before they cancel"
  - Pilot: "your own calls"
  - Who it's for: "every call counts"
  - Final CTA: "missing"

  Numbers, Multilingual, Enterprise and FAQ have no accent, to keep restraint. The headline wording is unchanged.
- **Stat rules:** every numbers card uses the same Ink hairline. The 80% card no longer has a separate apricot rule. The number text stays Ink.
- **Count-up:** "1 million" and "5+" count with one decimal ("0.6 million") so the motion is visible. Each stat always settles on the exact PDF value, which is also in the static HTML.
- **Multilingual points:** marked with Mint dots for "positive tone". Product features use Aqua (Verdicta) or Sky (Veritune) dots. No accent colour is used for text anywhere.
- **Footer:** adds "© 2026 Avishkar AI" in the bottom bar. This line is not in the brief; remove it in `Footer.astro` if unwanted. There is a slot (`LEGAL_LINKS` in `config.ts`) for Privacy and Terms links once those pages exist.
- **Section anchors:** `#top`, `#problem`, `#verdicta`, `#veritune`, `#suite`, `#languages`, `#numbers`, `#pilot`, `#enterprise`, `#who-its-for`, `#faq`, `#start` (final CTA).
- **Links still to set:** `PILOT_CTA_HREF`, `TALK_TO_TEAM_HREF` and `SITE_URL` in `src/data/config.ts` are `#` and `https://example.com` placeholders. `site` in `astro.config.mjs` needs the same domain. The canonical URL, OG URLs and JSON-LD all use `SITE_URL`.
- **Mobile H2 size:** the brief gives H2 sizes for desktop only. Mobile H2 is 32 px, scaling to 44 px.
- **Fallback font metrics:** the metric overrides (`size-adjust` and the ascent/descent overrides) for the local Arial and Times fallbacks are approximate. They cut layout shift during the font swap but don't remove it.
- **Lucide icons:** the few UI icons (arrow, chevron, menu, close, shield) are inlined Lucide paths at 1.5 px stroke, rather than the `lucide-astro` package. This avoids a dependency.

## (d) Corrected stat label

The PDF reads "1 million minutes call minutes analysed to date", with a repeated word. It renders as the value **1 million** with the label **call minutes analysed to date**.

## Checks run

- `npm run build` and `npm run check`: 0 errors, 0 warnings.
- No horizontal scroll at 375, 768, 1024, 1280, 1440, 1536 and 1920 px.
- Production HTML has one `h1` and one `h2` per section. Every `img` has `width` and `height`. No review markers or dev labels appear with flags off.
- Custom JavaScript is about 3.2 KB raw, 1.3 KB gzipped, inlined by Astro. CSS is 13 KB gzipped.
- Keyboard and behaviour:
  - FAQ: one item open at a time, Enter and Space toggle, arrow keys and Home/End move focus.
  - Mobile menu: opens with focus on the first link, traps focus, Escape closes and returns focus, and clicking a link closes it.
- With reduced motion: no reveal hiding, no pulse, and stats show their final values. With JavaScript disabled, all content is visible and the FAQ answers are expanded.
- Not yet run: Lighthouse. Run it on the deployed URL once real CTA links and the domain are set.
