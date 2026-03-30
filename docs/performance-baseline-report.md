# Performance and Accessibility Baseline Report

Date: 2026-03-30
Phase: 7

## Objective
Provide repeatable baseline measurements for Core Web Vitals and accessibility across key routes.

## Test Setup
- Runtime: production build (`npm run build` + `npm run start`)
- Device profiles:
  - Mobile: Lighthouse default mobile profile
  - Desktop: Lighthouse default desktop profile
- Network/CPU: Lighthouse simulated defaults
- Baseline artifacts: `docs/lighthouse-results/2026-03-30-224313/`

## Routes Under Test
- /
- /news/{known-slug-id}
- /category/{known-section}
- /author/{known-author}
- /search?q={term}

## Measurement Template
For each route record:
- Performance score
- Accessibility score
- Best Practices score
- SEO score
- LCP
- CLS
- INP (or TBT proxy if INP unavailable)

## Results

### Mobile
- /: score 86 | accessibility 96 | best practices 100 | SEO 100 | LCP 4.21s | CLS 0.000 | INP/TBT 20ms
- /news/420777: score 90 | accessibility 96 | best practices 100 | SEO 100 | LCP 3.54s | CLS 0.001 | INP/TBT 116ms
- /category/36: score 90 | accessibility 96 | best practices 100 | SEO 100 | LCP 3.61s | CLS 0.000 | INP/TBT 87ms
- /author/11: score 92 | accessibility 96 | best practices 96 | SEO 100 | LCP 3.31s | CLS 0.000 | INP/TBT 38ms
- /search?q=لبنان: score 89 | accessibility 96 | best practices 100 | SEO 66 | LCP 3.76s | CLS 0.000 | INP/TBT 26ms

### Desktop
- /: score 100 | accessibility 96 | best practices 100 | SEO 100 | LCP 0.71s | CLS 0.000 | INP/TBT 0ms
- /news/420777: score 100 | accessibility 96 | best practices 100 | SEO 100 | LCP 0.81s | CLS 0.007 | INP/TBT 0ms
- /category/36: score 100 | accessibility 96 | best practices 100 | SEO 100 | LCP 0.77s | CLS 0.000 | INP/TBT 0ms
- /author/11: score 100 | accessibility 96 | best practices 96 | SEO 100 | LCP 0.65s | CLS 0.000 | INP/TBT 0ms
- /search?q=لبنان: score 100 | accessibility 96 | best practices 100 | SEO 66 | LCP 0.65s | CLS 0.000 | INP/TBT 0ms

## Accessibility Findings
- Blocking issues: none observed in the first Lighthouse pass.
- Medium issues: `color-contrast` flagged across home, article, category, author, and search routes.
- Keyboard navigation notes: Lighthouse passed focusable controls and logical tab-order checks on tested mobile routes.
- Contrast notes: review low-contrast text/buttons in shell and secondary metadata rows first.

## Regressions and Actions
- Regression 1: mobile home LCP is the weakest result at 4.21s and should be reduced below 4s, ideally closer to 2.5-3s.
- Regression 2: search SEO score is 66 because the route is intentionally `noindex,follow`; treat as expected policy, not a release blocker.
- Regression 3: contrast audit failures require a targeted color pass before final accessibility sign-off.
- Owner: frontend
- ETA: before final go-live approval

## Post-Fix Checkpoint (2026-03-30)
- Applied contrast fixes in shared shell components and global accent tokens.
- Post-fix artifacts: `docs/lighthouse-results/postfix-2026-03-30-225934/`

### Mobile (Post-Fix)
- /: score 87 | accessibility 100 | best practices 100 | SEO 100 | LCP 3.99s | CLS 0.000 | INP/TBT 16ms
- /news/420777: score 90 | accessibility 100 | best practices 100 | SEO 100 | LCP 3.69s | CLS 0.000 | INP/TBT 38ms
- /category/36: score 93 | accessibility 100 | best practices 100 | SEO 100 | LCP 3.16s | CLS 0.000 | INP/TBT 48ms
- /author/11: score 91 | accessibility 100 | best practices 96 | SEO 100 | LCP 3.46s | CLS 0.000 | INP/TBT 54ms
- /search?q=لبنان: score 92 | accessibility 100 | best practices 100 | SEO 66 | LCP 3.31s | CLS 0.000 | INP/TBT 17ms

### Desktop (Post-Fix)
- /: score 98 | accessibility 100 | best practices 100 | SEO 100 | LCP 1.07s | CLS 0.000 | INP/TBT 0ms
- /news/420777: score 100 | accessibility 100 | best practices 100 | SEO 100 | LCP 0.79s | CLS 0.007 | INP/TBT 0ms
- /category/36: score 100 | accessibility 100 | best practices 100 | SEO 100 | LCP 0.69s | CLS 0.000 | INP/TBT 0ms
- /author/11: score 99 | accessibility 100 | best practices 96 | SEO 100 | LCP 0.86s | CLS 0.000 | INP/TBT 0ms
- /search?q=لبنان: score 100 | accessibility 100 | best practices 100 | SEO 66 | LCP 0.67s | CLS 0.000 | INP/TBT 4ms

### Post-Fix Notes
- Lighthouse `color-contrast` audit passes (score 1) across all post-fix route/profile runs.
- Search SEO score remains 66 by policy because search is intentionally `noindex,follow`.

## Acceptance Gate
- No critical accessibility errors on tested routes.
- No severe CWV regression vs approved baseline.
- Documented remediation plan for any unresolved medium issues.
