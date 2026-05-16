# Mimic Execution Workspace

Date: 2026-03-31

Purpose:
- Track pixel-parity migration work from legacy design to current Next.js frontend.
- Keep implementation objective, measurable, and safe for SEO/semantics/a11y.

## Current Status
- **Slices 01–05**: complete (first-pass parity across all 7 templates)
- **Overlay scoring**: complete (legacy vs current screenshots compared per template)
- **Sign-off**: blocked — 6 critical structural gaps identified
- **Next phase**: Slices 06–10 to close structural gaps (sidebar, hero, ticker, share, related, mobile nav)

Files in this folder:
- design-tokens-map.md
- module-anatomy.md
- layout-diff-checklist.md — **scored** (8 layout checkpoints × 3 viewports)
- component-parity-matrix.md
- template-fidelity-report.md — **scored** (7 templates with concrete deltas + cross-template summary table)
- regression-gate-report.md — **conditional pass** with recommended next slices
- signoff.md — **blocked** pending critical gap resolution

## Slice Index
| Slice | Templates | Status |
|-------|-----------|--------|
| 01 | Header / Nav / Home Hero | ✅ complete |
| 02 | Sidebar / Section / Footer | ✅ complete |
| 03 | Article + Category | ✅ complete |
| 04 | Author + Search | ✅ complete |
| 05 | About + Contact | ✅ complete |
| 06 | Sidebar + most-read widget | ✅ complete |
| 07 | Hero grid + breaking-news ticker | 🔲 planned |
| 08 | Header palette + breadcrumbs + footer | 🔲 planned |
| 09 | Article social sharing + related articles | 🔲 planned |
| 10 | Mobile hamburger nav | 🔲 planned |

## Slice Docs
- slices/header-nav-home-hero.md
- slices/sidebar-section-footer.md
- slices/article-category-templates.md
- slices/author-search-templates.md
- slices/about-contact-templates.md

- slices/sidebar-most-read-widget.md

How to use:
1. Fill design references first (tokens and anatomy).
2. Execute one slice at a time.
3. Attach screenshot evidence per slice.
4. Run regression gate before marking slice complete.

## Pixel-parity feedback loop (PR #1, 2026-05-16)

The slice work above closes structural gaps qualitatively. To converge on the
legacy look numerically we run a three-step loop on every iteration:

1. **Extract** the legacy page from MHTML to a static snapshot:
   ```
   npm run mimic:extract
   ```
   Produces `public/legacy-snapshot/home-{ar,fr,en}/index.html`. The HTML
   keeps absolute CDN URLs so the snapshot renders identically to the live
   site (requires internet). Source MHTMLs live in `public/sourcehtml/`.

2. **Preview** side-by-side in the browser (left = /v2 candidate, right =
   extracted snapshot):
   ```
   http://localhost:3000/ar/v2/legacy-preview
   ```

3. **Diff** automatically with pixelmatch:
   ```
   npm run mimic:diff           # desktop + mobile
   node scripts/visual-diff.mjs desktop   # narrow to one viewport
   ```
   Writes `docs/visual-baseline/diff/<timestamp>/`:
   - `*.legacy.png`, `*.v2.png`, `*.diff.png` (red = mismatch)
   - `report.json` with `mismatchPercent` per route

Targets are configured in `scripts/visual-diff.mjs` (`TARGETS` array). Add a
new entry when a new template snapshot is extracted.

### Baseline as of this PR
| Iteration | Target | Viewport | Full | Header | Body-fold | Footer | Δheight |
|-----------|--------|----------|------|--------|-----------|--------|---------|
| 0 (baseline) | home-ar vs /ar/v2 | desktop | **31.16%** | — | — | — | — |
| 1 (header + footer port) | home-ar vs /ar/v2 | desktop | **31.22%** | 30.50% | 36.51% | 79.21% | — |
| 2 (most-read owl-strip) | home-ar vs /ar/v2 | desktop | **20.98%** | 6.51% | 29.10% | 86.94% | +154 px |
| 3 (hero 3-col + owl DOM) | home-ar vs /ar/v2 | desktop | **20.98%** | 6.51% | 29.10% | 86.94% | +154 px |
| 4 (image-aware diff — structural %) | home-ar vs /ar/v2 | desktop | **8.95%** | 2.47% | **1.31%** | 90.38% | +154 px |
| 5 (section-height fixes) | home-ar vs /ar/v2 | desktop | **9.47%** (raw 27.85%) | 27.96% | 19.15% | — | **−1,294 px** |

> Iteration 2 dropped the headline number by ~10 pp and crushed the header
> zone from 30.5% → 6.5% — the iteration-1 header port was correct; iteration 0
> had bogus header numbers because the page-height drift was throwing the
> zone slices off (footer cropped from the wrong row). Iteration 2 fixes the
> diff script to anchor the footer zone to the *legacy* footer position and
> reports `heightDelta` so page-length drift is now visible.
>
> The +154 px height delta means the v2 page is barely taller than legacy —
> the layouts are now structurally close. The 87% footer-zone number is the
> next thing to chase: at the legacy-footer row, the v2 page still shows a
> different module (likely the popular-news / hero block being too tall by
> ~600 px, pushing real footer pixels out of the slice).

A large share of the remaining red in `*.diff.png` is **data-driven** (live API
returns different headlines and photos than the frozen Apr 18 snapshot). Those
pixels will go quiet automatically once iteration 2+ aligns the layout and the
image positions remain stable; they should not be chased as design defects.

### Iteration log
- **Iteration 0** — Tooling in place (extract + diff + side-by-side preview).
  Baseline captured at 31.16% full-page mismatch on `home-ar` desktop.
- **Iteration 1** — Header + footer verbatim port. Replaced inline SVG icons
  with `<i class="icofont-...">` so the legacy icon font (already bundled via
  `legacy/index.css`) renders the glyphs. Switched footer image paths to
  `/assets/icons/*.png` and `/assets/img/{app,whatsapp}.png`; copied the
  matching PNGs into `public/assets/`. Date format aligned to `MMM D, YYYY`.
  Top-nav restored to legacy order (FR, EN, About, Contact). Added per-zone
  reporting to `visual-diff.mjs` (header / body-fold / footer crops).
- **Iteration 2** — Most-read carousel strip ported to verbatim legacy
  owl-carousel DOM (`src/components/mimic/sections/most-read-strip.tsx`).
  Frozen widths from MHTML inline styles (398.667 px card + 30 px gutter,
  4 visible cards). Replaced the embla-based `CarouselSection` invocation in
  `/v2` with the new server component. Also hardened `visual-diff.mjs`:
  footer zone now anchors to legacy bottom, and `heightDelta` is reported so
  page-length drift is no longer masked by zone-cropping artefacts.
- **Iteration 3** — Hero block (`<section class="new-news-area ptb-40">`)
  rewritten as a verbatim 3-column server component. Added the missing
  `col-lg-2` right column with three `single-new-news` side cards (the
  candidate had been missing this column entirely, which let the hero row
  collapse to col-4 + col-6 = 10 of 12 columns). Replaced the embla-based
  main carousel with a static `owl-stage-outer/owl-stage/owl-item active`
  skeleton + `owl-nav` chrome (same pattern as iteration 2). Wired a new
  `sideCards = feed.slice(6, 9)` data slice in `app/[locale]/v2/page.tsx`.
  Structural port is complete and the new column renders, but the diff
  numbers did not move — see "Data-drift floor" below.
- **Iteration 4** — Image-aware diff. `visual-diff.mjs` now collects the
  bounding boxes of every `<img>/<picture>/<video>/<iframe>` in both legacy
  and candidate pages, builds a union exclusion mask, and reports a
  `structural` mismatch % alongside the `raw` one. Also writes
  `*.imgmask.png` (red overlay) so reviewers can see what's being ignored.
  This is the single most informative change so far: the body-fold zone
  dropped from 29.10% raw → **1.31% structural** (essentially solved), and
  the full-page number dropped from 20.98% → **8.95%** structural. The footer
  zone went the *wrong* way (86.94% → 90.38% structural) because that zone
  has very few photos to exclude and the remaining ~150 px vertical offset
  between v2 and legacy now dominates — see next bullet.

### Where the remaining structural mismatch lives

After iteration 4, the convergence map is clear:
- **Header (2.47% structural)**: essentially done.
- **Body-fold (1.31% structural)**: essentially done.
- **Footer (90.38% structural)**: the v2 page is 154 px taller than legacy.
  In a text-heavy area, even a 50 px vertical offset reads as ~100% mismatch
  because every text row lands on whitespace in the other image. So this
  zone won't budge until `heightDeltaPx` drops to roughly 0. The +154 px is
  almost certainly distributed across several section margins (e.g. the
  `.text-center pt-5 pb-5` banner wrappers, the `mt-5 tb` on more-news-area,
  the `ptb-40` paddings repeated across sections that the legacy may
  override). Iteration 5 should measure section heights side-by-side rather
  than chase pixels in the footer zone directly.

### Data-drift floor (after iteration 3)

The candidate fetches **today's** articles from the live API; the legacy
snapshot is the frozen Apr 18 MHTML. From iteration 3 onward, any zone whose
pixels are dominated by article photos and headlines (hero, most-read,
section carousels, footer) will have a per-zone mismatch floor of
~25–90% **regardless of how perfect the layout is** — different photos at
the same pixel coordinates count as 100% mismatch in that bounding box.

This is why iteration 3's headline number (20.98%, full) and per-zone numbers
(body-fold 29.10%, footer 86.94%) are byte-identical to iteration 2: the new
column and the new owl-stage chrome occupy the same rectangles that the
embla wrapper did, so the data-driven red pixels are the same red pixels.

To make further parity progress measurable, **one of these has to land first**:

1. **Freeze API responses for the diff run** — intercept `fetch` in the
   Playwright context, replace responses with a HAR captured on Apr 18.
   Highest fidelity; most engineering.
2. **Image-aware diff** — pre-compute a mask of `<img>` bounding boxes (from
   either side) and exclude those pixels from the mismatch count. Catches
   layout/typography/chrome drift while ignoring inevitable photo churn.
3. **Per-row diff strip** — visualise mismatch as a 1-px-wide column of
   per-row mismatch %. Makes structural drift (a row shifted by N pixels)
   visually obvious without needing a single headline number.

Recommendation: option 2 is the lowest-effort and gives the biggest signal.
Option 1 should follow if and when the layout is genuinely converged and the
remaining red is in typography/chrome.

### Iteration 5 — section-height convergence (2026-05-16)

Built `scripts/section-heights.mjs` to align legacy and candidate sections
side-by-side (treating `default-news-area` as a container, not a section).
That immediately surfaced three structural offenders that the pixel diff
could not name:

1. **MostReadStrip rendered as 5,816 px** instead of legacy's 405 px — the
   12 cards were wrapping onto multiple rows. Fixed by adding
   `overflow: hidden` to `.owl-stage-outer` and
   `display: flex; flex-wrap: nowrap` to `.owl-stage` (plus `flex: 0 0 auto`
   on each item) so the frozen stage clips like the live owl-carousel does.
2. **3 sections using embla CarouselSection rendered as vertical stacks** —
   legacy renders them as `col-lg-4 col-md-6` 3-column grids (أخبار محلية,
   العرب والعالم, متفرقات), not carousels. Only خاص اليوم uses a
   `popular-news-slides` owl-carousel. Built two new server components:
   - `popular-news-carousel.tsx` — verbatim owl-stage (301.5 px cards,
     30 px gutters) for خاص اليوم only.
   - `section-grid.tsx` — two variants (`default` = `popular-news-area
     default-news-area`, `hot` = `hot-news-area > around-the-world-news`)
     rendering the `single-around-the-world-news` card in a 3-col grid.
   Swapped all four CarouselSection invocations in `app/[locale]/v2/page.tsx`.
3. **Hero `لحظة بلحظة` column rendered 100 items as 1,241 px** vs legacy's
   7,494 px — probe revealed the candidate only had **20 items** in the DOM
   because `getHomeFeed(20, locale)` was the cap. Bumped to
   `getHomeFeed(100, locale)`. Each item now renders at the same ~75 px
   height as legacy.

Net result on the height profile:

| section | legacy (px) | iter 4 candidate (px) | iter 5 candidate (px) |
|---|---|---|---|
| header | 175 | 175 | 175 |
| more-news (top) | 200 | 177 | 177 |
| hero (لحظة بلحظة + carousel + side) | 7,625 | 879 | 6,653 |
| خاص اليوم | 507 | 596 (vertical embla) | 507 |
| أخبار محلية | 559 | 548 (vertical embla) | 559 |
| البرامج (video) | 592 | 445 | 445 |
| العرب والعالم | 599 | 1,418 (vertical embla) | 599 |
| متفرقات | 559 | 1,436 (vertical embla) | 559 |
| الأكثر قراءةً (most-read) | 405 | 5,816 (wrapped owl) | 405 |
| footer | 441 | 441 | 441 |
| **cumulative Δ** | — | **−6,454 px** | **−1,137 px** |

Visual-diff numbers (desktop):

| metric | iter 4 | iter 5 |
|---|---|---|
| raw full | 45.47% | **27.85%** |
| structural full | 8.95% best | **9.47%** |
| heightDelta | −7,030 px | **−1,294 px** |

The header (27.96%) and body-fold (19.15%) zone numbers are not directly
comparable to iter 4 (2.47% / 1.31%) because those zones are coordinate-fixed
crops — when the page is shorter than legacy by 7 k px (iter 4 measured
state), `cropToCommonSize` cuts off most of legacy at row ~5,200, leaving the
header-row pixels still at row 0. Now that pages align, the header/body-fold
zones are showing actual mismatch from data-driven content (live API today
vs frozen Apr 18 photos at the same pixel coordinates with same layout).

Remaining hero −972 px is most likely the backend returning ~87 items
instead of the requested 100. The screenshot delta is no longer the bottleneck.

Next-iteration candidates:
- Re-baseline header/body-fold structural mismatch now that the page heights
  align; rebuild the image-exclusion mask after fixing the cap.
- Wire `nodeBoxes` to also exclude text nodes whose innerText differs between
  legacy and candidate (separate data-drift from typography drift).
- Investigate the −188 px on البرامج (`video-news-area`) and confirm whether
  HomeFeedSection layout already matches or needs the same SectionGrid treatment.



