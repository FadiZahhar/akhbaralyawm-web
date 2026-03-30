# Visual Baseline Capture Checklist (Phase 1)

Date: 2026-03-30

## Objective
Capture reference screenshots from legacy pages before redesign/migration to avoid visual regressions.

## Required Viewports
- Desktop: 1440x900
- Tablet: 1024x768
- Mobile: 390x844

## Pages to Capture
- /
- /news/{id}/{slug}
- /category/{idOrLink}
- /author/{idOrLink}
- /search?id={term}
- /mix
- /about
- /contact

## Capture Rules
- Use same browser for all captures.
- Keep zoom at 100%.
- Capture above-the-fold and one full-page scroll capture.
- Capture both light/dark if legacy theme toggle exists.
- Save with naming pattern:
  - home-desktop.png
  - article-mobile.png
  - category-tablet.png

## Storage Convention
Store screenshots in this folder:
- docs/visual-baseline/

## QA Notes Template
For each screenshot set, record:
- URL
- viewport
- date/time
- content id/slug used
- notable dynamic elements (ads, ticker, random widgets)
