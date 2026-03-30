# Layout Diff Checklist

Date: 2026-03-31
Status: scored

## Viewports
- Desktop 1440x900
- Tablet 1024x768
- Mobile 390x844

## Checklist

### Container width parity
- Desktop: **Partial** — legacy uses ~1140px container with ~300px sidebar; current uses full-width single-column (max-w-3xl/4xl). Main content column is narrower but sidebar column is absent.
- Tablet: **Partial** — same sidebar absence; main content fills viewport.
- Mobile: **Pass** — both collapse to single column at mobile; no sidebar visible on legacy mobile either.

### Header band heights parity
- Desktop: **Partial** — legacy has 3-tier header (top utility bar ~32px + logo/nav ~70px + ad banner ~120px); current has 2-tier header (top bar ~28px + logo/search/nav ~90px). Total header height differs by ~100px due to missing ad banner.
- Tablet: **Partial** — same structural difference.
- Mobile: **Partial** — legacy collapses to hamburger with different treatment; current nav wraps horizontally.

### Nav wrapping behavior parity
- Desktop: **Partial** — legacy nav is single row left-aligned with search icon; current nav is single row right-aligned with search bar always visible. Item count matches (الرئيسية, خاص اليوم, سياسة, تكنولوجيا, العرب والعالم, اقتصاد, رياضة, البرامج, من كل شي).
- Tablet: **Partial** — minor compression differences.
- Mobile: **Fail** — legacy uses hamburger; current wraps nav items horizontally.

### Hero block placement parity
- Desktop: **Fail** — legacy has large hero image with overlay text + 2 side thumbnails in a grid; current has card-based section with category blocks.
- Tablet: **Fail** — same structural mismatch.
- Mobile: **Partial** — both stack vertically; difference is less visible.

### Sidebar stack order parity
- Desktop: **Fail** — legacy has right sidebar (ads → most-read → related) on Home/Article/Category/About/Contact; current has no sidebar at all.
- Tablet: **Fail** — legacy sidebar still present on tablet; absent in current.
- Mobile: **Pass** — neither shows sidebar at mobile width.

### Footer block order parity
- Desktop: **Partial** — legacy footer has 3-column layout: social icons | app badges (Google Play, App Store) | WhatsApp group. Current footer has 3-column layout: site description + social links (text) | quick links | apps + community. Structure similar but content and presentation differ (icon buttons vs text links).
- Tablet: **Partial** — same content gap.
- Mobile: **Pass** — both stack into single column; minor content differences.

### Section spacing parity
- Desktop: **Partial** — legacy sections separated by thin borders and dense vertical spacing; current uses card-based sections with more white space. Gap rhythm differs by ~12-20px per section.
- Tablet: **Partial** — same spacing rhythm difference.
- Mobile: **Partial** — slightly tighter in legacy.

### Mobile stacking parity
- Desktop: n/a
- Tablet: **Partial** — minor differences in card stacking breakpoints.
- Mobile: **Partial** — both stack single-column; card padding and image aspect ratios differ slightly.

## Summary Scores

| Checkpoint | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| Container width | Partial | Partial | Pass |
| Header band heights | Partial | Partial | Partial |
| Nav wrapping | Partial | Partial | Fail |
| Hero block placement | Fail | Fail | Partial |
| Sidebar stack order | Fail | Fail | Pass |
| Footer block order | Partial | Partial | Pass |
| Section spacing | Partial | Partial | Partial |
| Mobile stacking | n/a | Partial | Partial |

## Top Priority Fixes (to reach Pass)
1. **Add right sidebar** — most-read widget + placeholder ad slots for Home, Article, Category, About, Contact
2. **Implement hero grid** — match legacy 3-image hero layout on Home
3. **Add mobile hamburger nav** — match legacy responsive nav behavior
4. **Align header color palette** — switch to legacy dark-blue brand header
5. **Add breaking-news ticker** — horizontal scroll strip below nav
6. **Add footer social icons + app badges** — port real icon links from legacy

## Evidence
- Legacy reference: docs/visual-baseline/2026-03-31-002552/
- Current reference: docs/visual-baseline/2026-03-31-001816/
- Delta notes: see template-fidelity-report.md for per-template breakdown
