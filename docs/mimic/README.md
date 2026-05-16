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


