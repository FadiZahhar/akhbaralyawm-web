# Slice 01: Header + Nav + Home Hero

Date: 2026-03-30
Status: in progress
Scope: first implementation slice for visual parity.

## Target Files
- src/components/site-header.tsx
- src/components/home/home-hero.tsx
- src/components/home/story-card.tsx
- app/globals.css

## Objective
Bring header, top nav, search strip, and home hero area to high-fidelity visual parity with legacy design while preserving current semantics and SEO behavior.

## Tasks
1. Header top band parity
- Match height, typography weight, spacing, and divider behavior.

2. Main nav parity
- Match nav item spacing, active/hover styles, and wrap behavior.

3. Search control parity
- Match input height, border, placeholder weight, button shape, and hover/focus states.

4. Hero block parity
- Match lead card hierarchy, image ratio, title scale, excerpt spacing, and metadata treatment.

5. Token-level adjustments
- Apply only tokenized CSS changes in app/globals.css when possible.

## Guardrails
- Keep one H1 on home template.
- Do not alter canonical/metadata logic.
- Keep keyboard focus visible.
- Keep existing route behavior unchanged.

## Acceptance Criteria
- No critical visual deltas in header/nav/hero on desktop/tablet/mobile.
- No lint/build regressions.
- No SEO regression in existing automated checks.

## Validation Steps
1. Run lint and build.
2. Capture updated screenshots for home across 3 viewports.
3. Update component-parity-matrix status.
4. Update template-fidelity-report home section.

## Progress Notes
- Implemented first parity pass in:
	- src/components/site-header.tsx
	- src/components/home/home-hero.tsx
	- src/components/home/story-card.tsx
	- app/globals.css
- Kept semantic structure and route behavior unchanged.
- Validation completed:
	- npm run lint: pass
	- npm run build: pass
	- node scripts/seo-pagination-check.mjs: pass
	- Visual baseline capture: docs/visual-baseline/2026-03-30-235424 (home desktop/tablet/mobile included)
