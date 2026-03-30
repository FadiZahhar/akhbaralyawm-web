# Slice 05: About + Contact Templates

Date: 2026-03-31
Status: in progress
Scope: fifth implementation slice for visual parity.

## Target Files
- app/about/page.tsx
- app/contact/page.tsx

## Objective
Bring the static about and contact templates to first-pass legacy parity in shell framing, heading treatment, and content block rhythm while preserving metadata and semantic structure.

## Tasks
1. About template parity
- Match page header framing, heading scale, and body block treatment.

2. Contact template parity
- Match page header framing, heading scale, and contact information block rhythm.

3. Token-safe refinements
- Keep styles tokenized and avoid semantic or metadata regressions.

## Guardrails
- Keep one H1 per page template.
- Do not alter metadata logic.
- Keep content semantics intact.
- Avoid unnecessary structural refactors.

## Acceptance Criteria
- No critical visual deltas for about/contact shells on desktop/tablet/mobile.
- No lint/build regressions.
- No SEO regression in automated checks.

## Validation Steps
1. Run lint and build.
2. Run SEO pagination checks.
3. Capture updated screenshots across 3 viewports.
4. Update parity matrix, template fidelity report, and regression gate report.

## Progress Notes
- Implemented first parity pass in:
  - app/about/page.tsx
  - app/contact/page.tsx
- Kept metadata and semantic structure unchanged.
- Validation completed:
  - npm run lint: pass
  - npm run build: pass
  - node scripts/seo-pagination-check.mjs: pass
  - Visual baseline capture: docs/visual-baseline/2026-03-31-001816 (about/contact desktop/tablet/mobile included)
