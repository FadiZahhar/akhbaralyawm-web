# Slice 04: Author + Search Templates

Date: 2026-03-31
Status: in progress
Scope: fourth implementation slice for visual parity.

## Target Files
- app/author/[slug]/page.tsx
- app/search/page.tsx
- src/components/author/author-archive-list.tsx
- src/components/search/search-results-list.tsx

## Objective
Bring author and search template shells to first-pass legacy parity in hierarchy, spacing rhythm, and control styling while preserving metadata, robots, query behavior, and pagination behavior.

## Tasks
1. Author template parity
- Match profile shell framing, image treatment, heading hierarchy, and archive block styling.

2. Search template parity
- Match results header framing, heading scale, and pagination controls.

3. Archive/result list parity
- Match card/list framing, label treatment, headline emphasis, and archive/result links.

4. Token-safe refinements
- Keep styles tokenized and avoid semantic/behavioral regressions.

## Guardrails
- Keep one H1 per page template.
- Do not alter metadata, robots, or query logic.
- Keep keyboard interactions and CTA semantics intact.
- Keep route and pagination behavior unchanged.

## Acceptance Criteria
- No critical visual deltas for author/search shells on desktop/tablet/mobile.
- No lint/build regressions.
- No SEO pagination regression in automated checks.

## Validation Steps
1. Run lint and build.
2. Run SEO pagination checks.
3. Capture updated screenshots across 3 viewports.
4. Update parity matrix, template fidelity report, and regression gate report.

## Progress Notes
- Implemented first parity pass in:
  - app/author/[slug]/page.tsx
  - app/search/page.tsx
  - src/components/author/author-archive-list.tsx
  - src/components/search/search-results-list.tsx
- Kept metadata, robots, query logic, and route behavior unchanged.
- Validation completed:
  - npm run lint: pass
  - npm run build: pass
  - node scripts/seo-pagination-check.mjs: pass
  - Visual baseline capture: docs/visual-baseline/2026-03-31-001432 (author/search desktop/tablet/mobile included)
