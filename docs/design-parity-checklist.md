# Design Parity Checklist

Date: 2026-03-30
Phase: 3

## Objective
Measure visual/behavior parity between legacy Web Forms pages and Next.js pages before release.

## Baseline Inputs
- Legacy screenshots: docs/visual-baseline/
- Legacy mapping: docs/legacy-route-map.md
- Component map: docs/component-inventory.md

## Scoring Model
- Pass: indistinguishable or acceptable modernization with no UX regression.
- Partial: minor spacing/typography/icon variance with no functional impact.
- Fail: layout break, missing content block, broken navigation/interaction.

Target:
- Primary templates must score at least 90 percent parity.

## Global Shell Checks
- Header top links exist and route correctly.
- Main nav includes expected sections and highlights active context.
- Search input submits to /search?q=.
- Footer has social links and quick links.
- RTL alignment is correct for text and spacing.
- Mobile nav remains usable at 390px width.

## Home Page Checks
- Hero lead story block appears first.
- Live updates rail appears and links to valid articles.
- Highlight card grid appears and is responsive.
- Section blocks show heading plus three articles.
- Mix/quick-read side panels appear and are usable.
- Empty state behavior is graceful when feed is unavailable.

## Category Page Checks
- Category title matches route and metadata.
- Article cards show title, date, and summary.
- Card links resolve to canonical article URLs.
- Canonical redirect works for non-canonical slug/id route variants.
- Mobile card stacking and spacing remain readable.

## Article Page Checks
- H1 title, section label, date, and hero media render.
- Body HTML renders safely and legibly.
- Canonical redirect resolves legacy/non-canonical routes.
- Metadata and JSON-LD are present.
- Breadcrumb context is correct.

## Author Page Checks
- Author profile image/title/body render.
- Archive section behavior:
  - if API available: list appears with valid links
  - if API missing: fallback text appears clearly

## Search Page Checks
- Query shown in heading.
- Results list appears for valid query.
- Empty state appears for no query/no results.
- Page is noindex but follow.

## Static and Read Pages Checks
- /about and /contact are styled and readable.
- /read/1 and /read/2 redirect to canonical routes.
- /read/{id} fallback content appears when CMS endpoint unavailable.

## Interaction Checks
- Hover/focus states visible on links/buttons.
- Keyboard tab order is logical in shell and key routes.
- No horizontal overflow on mobile.

## Browser Matrix
- Chrome latest
- Edge latest
- Safari iOS latest

## Regression Log Template
- Route:
- Viewport:
- Issue type: visual | functional | content | accessibility
- Severity: low | medium | high
- Screenshot path:
- Expected:
- Actual:
- Fix owner:
- Status:
