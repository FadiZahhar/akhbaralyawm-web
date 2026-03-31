# Frontend Migration Status

Date: 2026-03-31

## Overall Status
The Next.js frontend migration is implemented, validated, and now includes full multilingual (i18n) support for Arabic, English, and French locales.

Current state:
- Core frontend routes are implemented under `app/[locale]/` with locale-prefixed URLs.
- i18n infrastructure includes proxy-based locale detection, UI string dictionaries, RTL/LTR direction, and language fallback notices.
- CMS static page endpoint is integrated via `getCmsPageById()` with locale-aware requests.
- HTML content is sanitized with DOMPurify (isomorphic-dompurify).
- SEO, redirects, metadata, structured data, preview flow, pagination UX, and CI validation are in place.
- Accessibility and Lighthouse follow-up work has been completed to a strong baseline.
- All pages use `force-dynamic` rendering — no build-time API dependency.
- TypeScript and ESLint pass cleanly. Dev server verified working for all locales.
- Note: `npm run build` hangs at "Collecting page data" — this is a pre-existing Turbopack issue (verified with original code) unrelated to i18n changes.

## Plan Status by Phase

### Phase 0: Access and Contract Validation
Status: complete

Completed:
- API routes were verified against the real IIS-hosted backend.
- Preview token and preview article contract were validated.
- Environment variables were aligned and documented.

Key artifacts:
- [docs/api-contracts.md](docs/api-contracts.md)
- [docs/env-matrix.md](docs/env-matrix.md)

### Phase 1: Legacy Design and Route Inventory
Status: mostly complete

Completed:
- Legacy route inventory documented.
- Component inventory documented.
- Next-side visual baseline capture implemented and generated.

Still open:
- Strict legacy-vs-Next screenshot parity capture from IIS pages is still an optional remaining QA step if final visual sign-off requires direct before/after comparison.

Key artifacts:
- [docs/legacy-route-map.md](docs/legacy-route-map.md)
- [docs/component-inventory.md](docs/component-inventory.md)
- [docs/visual-baseline/README.md](docs/visual-baseline/README.md)
- [docs/visual-baseline/2026-03-30-222543](docs/visual-baseline/2026-03-30-222543)

### Phase 2: Information Architecture and URL Canonicalization
Status: complete

Completed:
- Canonical route model defined and implemented.
- Redirect plan documented and wired into Next config.
- Category, article, search, author, and compatibility route behavior aligned.

Key artifacts:
- [docs/routing-plan.md](docs/routing-plan.md)
- [docs/redirects.csv](docs/redirects.csv)

### Phase 3: Design System Extraction
Status: complete

Completed:
- Shared shell and reusable UI components implemented.
- Global design tokens established.
- RTL layout and responsive behavior implemented.

Key artifacts:
- [app/globals.css](app/globals.css)
- [src/components/site-header.tsx](src/components/site-header.tsx)
- [src/components/site-footer.tsx](src/components/site-footer.tsx)
- [docs/design-parity-checklist.md](docs/design-parity-checklist.md)

### Phase 4: Data Access Layer Hardening
Status: complete for frontend scope

Completed:
- Typed API client expanded across page domains.
- Runtime payload guards added for core response shapes.
- Optional endpoint behavior degrades safely.

Key artifacts:
- [src/lib/api.ts](src/lib/api.ts)
- [docs/data-contracts.md](docs/data-contracts.md)

### Phase 5: Route-by-Route Page Migration
Status: complete — all routes restructured under `app/[locale]/`

Completed:
- Home page
- Article page
- Category page
- Search page
- Author page
- Mix page
- About page (CMS content via API)
- Contact page (CMS content via API)
- Read compatibility route (CMS content via API with typed error handling)
- All pages accept locale param and render locale-aware content

Key routes (now under [locale]):
- [app/[locale]/page.tsx](app/[locale]/page.tsx)
- [app/[locale]/news/[slugId]/page.tsx](app/[locale]/news/[slugId]/page.tsx)
- [app/[locale]/category/[slug]/page.tsx](app/[locale]/category/[slug]/page.tsx)
- [app/[locale]/search/page.tsx](app/[locale]/search/page.tsx)
- [app/[locale]/author/[slug]/page.tsx](app/[locale]/author/[slug]/page.tsx)
- [app/[locale]/read/[id]/page.tsx](app/[locale]/read/[id]/page.tsx)
- [app/[locale]/about/page.tsx](app/[locale]/about/page.tsx)
- [app/[locale]/contact/page.tsx](app/[locale]/contact/page.tsx)
- [app/[locale]/mix/page.tsx](app/[locale]/mix/page.tsx)

### Phase 6: Preview, CMS Workflow, and Editorial QA
Status: complete

Completed:
- Preview token flow works.
- Preview article resolution works.
- Preview mode indicator banner is implemented.
- Editorial QA checklist exists.
- CMS static page endpoint integrated — about, contact, and read pages fetch content from API.

Key artifacts:
- [app/api/preview/route.ts](app/api/preview/route.ts)
- [app/api/preview/exit/route.ts](app/api/preview/exit/route.ts)
- [src/components/preview-mode-banner.tsx](src/components/preview-mode-banner.tsx)
- [docs/editorial-qa.md](docs/editorial-qa.md)

### Phase 7: Performance, SEO, and Accessibility Hardening
Status: complete for frontend baseline

Completed:
- Metadata and structured data implemented.
- Robots and sitemap implemented.
- SEO pagination validation automated.
- Lighthouse baseline captured and documented.
- Accessibility contrast issues were remediated in the tested routes.

Key artifacts:
- [docs/seo-checklist.md](docs/seo-checklist.md)
- [docs/performance-baseline-report.md](docs/performance-baseline-report.md)
- [docs/lighthouse-results/postfix-2026-03-30-225934](docs/lighthouse-results/postfix-2026-03-30-225934)

### Phase 8: Release, Cutover, and Stabilization
Status: tooling and runbooks complete, live cutover not yet executed

Completed:
- Go-live runbook prepared.
- Rollback runbook prepared.
- CI workflow includes quality and SEO validation gates.

Still open:
- Real staging/production cutover and canary execution remain operational tasks.

Key artifacts:
- [docs/go-live-runbook.md](docs/go-live-runbook.md)
- [docs/rollback-runbook.md](docs/rollback-runbook.md)
- [.github/workflows/ci.yml](.github/workflows/ci.yml)

## Remaining Gaps

### 1. Build Hang (Pre-existing Turbopack Issue)
`npm run build` hangs at "Collecting page data using 11 workers" — verified to occur with both the original and updated code. This is a Turbopack issue. Dev server (`npm run dev`) works correctly.

### 2. Optional Legacy Screenshot Comparison
The project now has automated Next-side baseline capture, but final visual sign-off may still require direct legacy IIS screenshot capture for exact before/after review.

### 3. Production Execution
Release gates and runbooks are ready, but production rollout and stabilization have not yet been executed.

## i18n Implementation (Phase 9)

### Status: complete

Infrastructure created:
- `proxy.ts` — locale detection from Accept-Language header, redirect to `/{locale}/path`
- `src/lib/i18n.ts` — Locale type, direction helper, dictionary loader
- `dictionaries/ar.json`, `en.json`, `fr.json` — UI string dictionaries
- `src/components/fallback-notice.tsx` — shows notice when backend returns content in fallback language
- `app/[locale]/layout.tsx` — locale validation layout

API client updates (`src/lib/api.ts`):
- `ApiError` class with typed error kinds (NotFound, BadRequest, ServerError)
- `LanguageMeta` type for language fallback metadata
- `sanitizeHtml()` with DOMPurify for bodyHtml content
- Locale-aware headers and query params for API requests
- `getCmsPageById()` accepts locale parameter

All pages updated:
- Moved from `app/` to `app/[locale]/`
- Accept locale param, use dictionaries for UI strings
- Locale-prefixed links throughout
- `force-dynamic` export on all data-fetching pages
- Date formatting uses locale-aware `Intl.DateTimeFormat`

Verified working:
- `/` redirects to `/ar/` (307)
- `/ar`, `/en`, `/fr` — home pages (200)
- `/ar/about`, `/en/about` — about pages (200)
- `/ar/contact` — contact page (200)
- TypeScript: clean
- ESLint: clean

## Launch Readiness

Frontend implementation readiness: high

Meaning:
- The Next.js frontend is in strong shape with full multilingual support.
- CMS page endpoint is integrated.
- Remaining work is operational rollout and resolving the pre-existing Turbopack build hang.

Frontend is ready for:
- continued QA across all locales
- staging validation
- canary planning

Frontend is not fully ready for production until:
- Turbopack build hang is resolved (or deployment uses dev/start mode)
- optional final legacy-vs-Next visual comparison is completed if required by stakeholders

## Recommended Next Step
Highest priority:

1. Investigate and resolve the Turbopack build hang (pre-existing, affects both old and new code).
2. Execute staging and production runbooks from [docs/go-live-runbook.md](docs/go-live-runbook.md).