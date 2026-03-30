# Frontend Migration Status

Date: 2026-03-30

## Overall Status
The Next.js frontend migration is largely implemented and validated.

Current state:
- Core frontend routes are implemented.
- SEO, redirects, metadata, structured data, preview flow, pagination UX, and CI validation are in place.
- Accessibility and Lighthouse follow-up work has been completed to a strong baseline.
- The main remaining blocker to full parity is a backend API gap for CMS static pages used by legacy `Read.aspx` behavior.

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
Status: complete for planned frontend routes, except backend-dependent CMS content parity

Completed:
- Home page
- Article page
- Category page
- Search page
- Author page
- Mix page
- About page
- Contact page
- Read compatibility route

Still open:
- Full CMS page rendering parity for `/read/[id]` depends on missing backend endpoint.

Key routes:
- [app/page.tsx](app/page.tsx)
- [app/news/[slugId]/page.tsx](app/news/[slugId]/page.tsx)
- [app/category/[slug]/page.tsx](app/category/[slug]/page.tsx)
- [app/search/page.tsx](app/search/page.tsx)
- [app/author/[slug]/page.tsx](app/author/[slug]/page.tsx)
- [app/read/[id]/page.tsx](app/read/[id]/page.tsx)

### Phase 6: Preview, CMS Workflow, and Editorial QA
Status: mostly complete

Completed:
- Preview token flow works.
- Preview article resolution works.
- Preview mode indicator banner is implemented.
- Editorial QA checklist exists.

Still open:
- CMS static page preview/public parity remains limited by missing backend CMS endpoint.

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

### 1. Backend CMS Static Pages Endpoint
This is the main blocker to full migration parity.

Impact:
- `/read/[id]` cannot render real CMS page content from the API.
- Legacy `Read.aspx` parity is incomplete until backend exposes a page-by-id endpoint.

Reference:
- [docs/api-gaps.md](docs/api-gaps.md)

### 2. Optional Legacy Screenshot Comparison
The project now has automated Next-side baseline capture, but final visual sign-off may still require direct legacy IIS screenshot capture for exact before/after review.

### 3. Production Execution
Release gates and runbooks are ready, but production rollout and stabilization have not yet been executed.

## Launch Readiness

Frontend implementation readiness: high

Meaning:
- The Next.js frontend itself is in strong shape.
- Most remaining work is backend dependency resolution or operational rollout.

Frontend is ready for:
- continued QA
- staging validation
- canary planning

Frontend is not fully ready for final parity sign-off until:
- backend CMS page endpoint is implemented
- optional final legacy-vs-Next visual comparison is completed if required by stakeholders

## Recommended Next Step
Highest priority:

1. Implement the backend CMS page endpoint described in [docs/api-gaps.md](docs/api-gaps.md).

After that:

2. Revalidate `/read/[id]` rendering with real CMS payloads.
3. Execute staging and production runbooks.