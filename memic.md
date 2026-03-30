# Legacy Design Mimic Plan (Pixel-Perfect + Modern Next.js)

Date: 2026-03-30
Goal: Recreate the legacy website look and feel in the Next.js frontend with near pixel-perfect parity, without regressing SEO, semantics, accessibility, performance, or maintainability.

## 1. Feasibility Verdict
Yes, this is absolutely possible.

What is realistic:
- 95-99% visual parity on static and semi-static regions.
- 90-95% parity on highly dynamic blocks (ads, tickers, feed-dependent modules).

What should remain modernized:
- SEO metadata model and canonical/redirect strategy.
- HTML semantics (H1-H6 hierarchy, paragraphs, links, CTA meaning).
- Accessibility and performance safeguards.

## 2. Non-Negotiable Guardrails
These guardrails are mandatory through all phases:

1. SEO preservation
- Keep existing canonical, redirects, robots, sitemap, structured data.
- Do not reintroduce duplicate URL variants.

2. Semantic structure preservation
- Keep one primary H1 per page.
- Keep heading depth logical (H2 under H1, etc.).
- Keep paragraph and CTA semantics (no div-as-button anti-patterns).

3. Accessibility baseline
- Maintain color contrast and keyboard navigation pass.
- Do not use visual-only text replacements that break screen readers.

4. Performance budget
- Keep CLS near current baseline.
- Avoid adding large blocking CSS/JS from legacy without pruning.

## 3. Success Criteria (Definition of Done)
Design mimic is complete when all conditions are true:

1. Visual parity
- Home, article, category, author, search, about, contact: >= 95% parity in approved checklist.

2. Structural parity
- Header/nav/footer/module ordering matches legacy composition.

3. Semantic parity
- Heading hierarchy, paragraph structure, CTA behavior remain valid and intentional.

4. SEO parity and integrity
- Existing SEO checks remain green.
- No canonical, redirect, or indexation regressions.

5. Performance and accessibility non-regression
- Lighthouse/accessibility outcomes remain at or above current accepted baseline.

## 4. Execution Phases

## Phase A: Legacy Forensics and Design Token Extraction
Objective: Convert old visual language into explicit tokens and component specs.

Tasks:
1. Capture legacy references from https://www.akhbaralyawm.com for target templates.
2. Build a token map from legacy:
- Typography: families, sizes, line-heights, weights, letter spacing.
- Color: surfaces, text, accent states, borders, tags, alerts.
- Spacing: container widths, gutters, block spacing, card padding.
- Radius, shadow, separators, icon sizing.
3. Document exact module anatomy:
- Header bands, nav rhythm, ticker placement, card proportions.

Deliverables:
- docs/mimic/design-tokens-map.md
- docs/mimic/module-anatomy.md

Exit criteria:
- No visual decision remains implicit.

## Phase B: Layout Skeleton Parity
Objective: Match macro layout and composition before styling details.

Tasks:
1. Reproduce page grids and container widths exactly.
2. Match legacy vertical rhythm:
- Section order, spacing between modules, fold behavior.
3. Match responsive breakpoints and stacking behavior.
4. Preserve current semantic markup while matching visual order.

Deliverables:
- Updated shell/layout components.
- docs/mimic/layout-diff-checklist.md

Exit criteria:
- Side-by-side screenshots show matching macro structure.

## Phase C: Component-by-Component Pixel Pass
Objective: Make every core component visually equivalent.

Priority components:
1. SiteHeader
2. Main navigation and ticker
3. Hero and lead cards
4. Section blocks and article cards
5. Side rail modules
6. Footer

Tasks per component:
1. Match type scale and spacing.
2. Match border, radius, and shadows.
3. Match iconography and micro-label styles.
4. Match hover/focus/active states.
5. Preserve accessibility semantics and keyboard behavior.

Deliverables:
- docs/mimic/component-parity-matrix.md

Exit criteria:
- Each component marked pass with screenshot evidence.

## Phase D: Template Fidelity Pass
Objective: Validate entire page templates after component convergence.

Templates:
1. Home
2. Article
3. Category
4. Author
5. Search
6. About
7. Contact

Tasks:
1. Run before/after overlay comparisons.
2. Tune typography wrapping, line breaks, and card heights.
3. Handle dynamic content edge cases:
- long titles, missing images, empty summaries.

Deliverables:
- docs/mimic/template-fidelity-report.md

Exit criteria:
- >= 95% parity on all key templates.

## Phase E: SEO + Semantics + A11y Regression Gate
Objective: Ensure mimic work did not break core engineering quality.

Tasks:
1. Re-run SEO checklist and pagination checks.
2. Validate heading hierarchy route by route.
3. Re-run Lighthouse and accessibility checks.
4. Validate CTA discoverability and focus states.

Deliverables:
- docs/mimic/regression-gate-report.md

Exit criteria:
- No critical regression introduced by mimic work.

## Phase F: Final Sign-Off and Rollout
Objective: Ship mimic update safely.

Tasks:
1. Stakeholder review with side-by-side evidence.
2. Final polish pass for top 10 visual deltas.
3. Canary release and monitoring.

Deliverables:
- docs/mimic/signoff.md

Exit criteria:
- Design and engineering sign-off complete.

## 5. Measurement System (How We Judge Pixel-Perfect)

1. Screenshot matrix
- Viewports: 1440x900, 1024x768, 390x844.
- Above-the-fold and full-page captures.

2. Overlay diff protocol
- Compare template captures against legacy references.
- Track delta classes: spacing, typography, color, structure, interaction.

3. Scoring
- Critical: header/nav/hero/card rhythm/CTA contrast.
- Major: module spacing, typography scale.
- Minor: tiny spacing or shadow variance.

Pass rule:
- Zero critical deltas.
- <= 3 major deltas per template.

## 6. Engineering Plan (Practical Workstream)

1. Branch strategy
- feature/mimic-phase-a
- feature/mimic-phase-b
- ...

2. Change isolation
- Keep mimic CSS changes scoped to shell/components first.
- Avoid mixed refactors and mimic in same PR.

3. PR checklist
- Visual diff screenshots attached.
- SEO checks run.
- Accessibility checks run.
- No semantic hierarchy regressions.

4. Daily cadence
- Day start: choose 1 template + 2 components.
- Day end: screenshot diff, score, and blockers logged.

## 7. Risks and Mitigations

1. Risk: Overfitting to one viewport.
- Mitigation: enforce 3-viewport parity rule.

2. Risk: Visual mimic breaks semantics.
- Mitigation: semantic audit in every PR.

3. Risk: Legacy styles degrade performance.
- Mitigation: prune unused legacy rules, keep tokenized approach.

4. Risk: Team debates subjective visual quality.
- Mitigation: enforce objective parity checklist and scoring thresholds.

## 8. Suggested Timeline

Week 1:
- Phase A + Phase B

Week 2:
- Phase C (header/nav/hero/cards)

Week 3:
- Phase C (remaining components) + Phase D

Week 4:
- Phase E + Phase F (sign-off and staged release)

## 9. Immediate Next Actions

1. Approve this plan and freeze parity scope (which templates must be exact).
2. Create docs/mimic/ folder and tracking files listed above.
3. Start with header/nav/home hero parity as the first implementation slice.
4. Run post-slice SEO + accessibility gate before moving to the next slice.

## 10. Tracking Files (Created)

Use these files as the active execution workspace:

- [docs/mimic/README.md](docs/mimic/README.md)
- [docs/mimic/design-tokens-map.md](docs/mimic/design-tokens-map.md)
- [docs/mimic/module-anatomy.md](docs/mimic/module-anatomy.md)
- [docs/mimic/layout-diff-checklist.md](docs/mimic/layout-diff-checklist.md)
- [docs/mimic/component-parity-matrix.md](docs/mimic/component-parity-matrix.md)
- [docs/mimic/template-fidelity-report.md](docs/mimic/template-fidelity-report.md)
- [docs/mimic/regression-gate-report.md](docs/mimic/regression-gate-report.md)
- [docs/mimic/signoff.md](docs/mimic/signoff.md)

First implementation slice:

- [docs/mimic/slices/header-nav-home-hero.md](docs/mimic/slices/header-nav-home-hero.md)

---

This plan targets visual mimic with strict engineering discipline: pixel fidelity where it matters, and zero loss of SEO/semantics/a11y quality already achieved.
