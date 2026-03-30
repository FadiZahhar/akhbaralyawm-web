# Slice 02: Sidebar + Section Blocks + Footer

Date: 2026-03-30
Status: in progress
Scope: second implementation slice for visual parity.

## Target Files
- src/components/home/home-sidebar.tsx
- src/components/home/home-section-block.tsx
- src/components/site-footer.tsx

## Objective
Bring homepage sidebar modules, section strips, and global footer closer to legacy visual structure and rhythm while preserving current semantics, SEO, and accessibility behavior.

## Tasks
1. Sidebar widget parity
- Match module frame shape, title treatment, list-row rhythm, and ranking badge behavior.

2. Section block parity
- Match section header band, CTA framing, card strip spacing, and visual separation between blocks.

3. Footer parity
- Match hierarchy and rhythm of footer columns, separator behavior, and link emphasis.

4. Token-safe refinements
- Keep styling adjustments token-based and component-scoped.

## Guardrails
- Keep heading hierarchy intact.
- Do not alter canonical/metadata/route logic.
- Keep keyboard focus and link semantics preserved.
- Avoid introducing layout instability.

## Acceptance Criteria
- No critical visual deltas in sidebar/section/footer on desktop/tablet/mobile.
- No lint/build regressions.
- No SEO regression in existing automated checks.

## Validation Steps
1. Run lint and build.
2. Run SEO pagination check.
3. Capture updated screenshots across 3 viewports.
4. Update parity matrix and fidelity/regression reports.

## Progress Notes
- Implemented first parity pass in:
  - src/components/home/home-sidebar.tsx
  - src/components/home/home-section-block.tsx
  - src/components/site-footer.tsx
- Kept semantics and route behavior unchanged.
- Validation completed:
  - npm run lint: pass
  - npm run build: pass
  - node scripts/seo-pagination-check.mjs: pass
  - Visual baseline capture: docs/visual-baseline/2026-03-31-000049 (home desktop/tablet/mobile included)
