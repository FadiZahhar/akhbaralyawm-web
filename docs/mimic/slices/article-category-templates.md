# Slice 03: Article + Category Templates

Date: 2026-03-31
Status: in progress
Scope: third implementation slice for visual parity.

## Target Files
- app/news/[slugId]/page.tsx
- app/category/[slug]/page.tsx
- src/components/category/category-archive-list.tsx

## Objective
Bring article and category template shells to first-pass legacy parity in hierarchy, spacing rhythm, and control styling while preserving SEO metadata, structured data, and route behavior.

## Tasks
1. Article template parity
- Match title block hierarchy, section/date treatment, image framing, and body reading rhythm.

2. Category template parity
- Match section header framing, heading scale, and pagination controls.

3. Category archive card parity
- Match card frame, label treatment, headline emphasis, and archive link controls.

4. Token-safe refinements
- Keep styles tokenized and avoid semantic/behavioral regressions.

## Guardrails
- Keep one H1 per page template.
- Do not alter canonical/metadata/JSON-LD behavior.
- Keep keyboard interactions and CTA semantics intact.
- Keep route and redirect behavior unchanged.

## Acceptance Criteria
- No critical visual deltas for article/category shells on desktop/tablet/mobile.
- No lint/build regressions.
- No SEO pagination regression in automated checks.

## Validation Steps
1. Run lint and build.
2. Run SEO pagination checks.
3. Capture updated screenshots across 3 viewports.
4. Update parity matrix, template fidelity report, and regression gate report.

## Progress Notes
- Implemented first parity pass in:
  - app/news/[slugId]/page.tsx
  - app/category/[slug]/page.tsx
  - src/components/category/category-archive-list.tsx
- Kept metadata, JSON-LD, and route behavior unchanged.
- Validation completed:
  - npm run lint: pass
  - npm run build: pass
  - node scripts/seo-pagination-check.mjs: pass
  - Visual baseline capture: docs/visual-baseline/2026-03-31-000629 (article/category desktop/tablet/mobile included)
