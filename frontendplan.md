# Frontend Migration Plan: IIS Web Forms to Next.js (Headless)

## 1) Goal
Migrate the existing Akhbar Alyawm Web Forms frontend to a modern Next.js App Router frontend while keeping the current backend as headless APIs.

Primary source systems:
- Legacy frontend source: `C:\inetpub\akhbaralyawm`
- Running IIS host for visual/design capture: `http://localhost:8081`
- API base target (configured): `http://localhost:8081/v1/`

## 2) Current Situation (Observed)
- Next.js project is initialized and already has:
  - Article route in `app/news/[slugId]/page.tsx`
  - Preview API handlers in `app/api/preview/route.ts` and `app/api/preview/exit/route.ts`
  - API helper layer in `src/lib/api.ts`
- `.env.local` is configured with:
  - `API_BASE_URL=http://localhost:8081/v1/`
  - `NEXT_PUBLIC_ASSET_HOST=http://localhost:8081`
- IIS root URL currently returns `403.14` (no default document at `/`), so design extraction must use direct known pages and source files from `C:\inetpub\akhbaralyawm`.
- Current probe to `http://localhost:8081/v1/article/by-id.ashx?id=1` returned `404`, so API route verification is an early mandatory step.

## 3) Migration Strategy
Use a phased strangler pattern:
1. Inventory and freeze legacy UI behavior.
2. Build a reusable design system in Next.js from the legacy HTML/CSS.
3. Replace Web Forms pages one route group at a time.
4. Keep backend data in API endpoints only.
5. Cut over route-by-route with measurable parity checks.

## 4) Phases (9 Total)

### Phase 0: Access and Contract Validation
Objective:
- Confirm exact API routes, IIS mappings, and working local environment.

Tasks:
- Validate IIS bindings and app roots (`/` vs `/ApiApp` vs virtual dirs).
- Identify the true API endpoints if `v1` is remapped.
- Capture 3-5 real JSON payload samples per endpoint (article, section, search, home blocks).
- Confirm required headers/auth for preview endpoints.

Deliverables:
- `docs/api-contracts.md` (endpoint list, request params, response schema, errors)
- `docs/env-matrix.md` (local/staging/prod variables)

Exit criteria:
- Every endpoint required by MVP pages responds consistently in local environment.

---

### Phase 1: Legacy Design and Route Inventory
Objective:
- Build a complete map of what must be migrated from Web Forms.

Tasks:
- Crawl and list legacy pages:
  - `Default.aspx`, `News.aspx`, `Newsdet.aspx`, `Search.aspx`, `Read.aspx`, etc.
- Extract shared layout pieces:
  - `MasterPage.master`, global CSS, JS includes, header/footer/nav blocks.
- Extract reusable user controls (`_box*.ascx`) and classify them as components.
- Screenshot baseline per major page (desktop + mobile widths).

Deliverables:
- `docs/legacy-route-map.md`
- `docs/component-inventory.md`
- `docs/visual-baseline/` screenshots

Exit criteria:
- 100% of high-traffic legacy routes mapped to target Next.js routes.

---

### Phase 2: Information Architecture and URL Canonicalization
Objective:
- Define final URL structure and redirect rules.

Tasks:
- Keep canonical article format: `/news/{slug}-{id}`.
- Map old querystring/Web Forms URLs to clean Next.js routes.
- Define 301 redirects table from legacy URLs to new routes.
- Align section/category URLs with SEO requirements.

Deliverables:
- `docs/routing-plan.md`
- `docs/redirects.csv`

Exit criteria:
- No ambiguous route mapping remains.

---

### Phase 3: Design System Extraction (Frontend Foundation)
Objective:
- Convert legacy visual language into reusable Next.js UI primitives.

Tasks:
- Build global tokens in CSS variables: colors, spacing, typography, shadows.
- Recreate shell components:
  - `SiteHeader`, `MainNav`, `Ticker`, `ArticleCard`, `SectionBlock`, `SiteFooter`.
- Port utility CSS from legacy while removing unused/duplicate rules.
- Normalize RTL behavior and responsive breakpoints.

Deliverables:
- `app/globals.css` tokenized and organized
- `src/components/*` base reusable components
- `docs/design-parity-checklist.md`

Exit criteria:
- Design parity >= 90% on primary templates vs baseline screenshots.

---

### Phase 4: Data Access Layer Hardening
Objective:
- Build a robust typed API layer for all frontend data needs.

Tasks:
- Expand `src/lib/api.ts` with typed fetchers by domain:
  - home, sections, article details, related, search, trending.
- Add runtime validation for critical payloads (lightweight schema checks).
- Define failure behavior per API call (fallback UI vs hard failure).
- Decide cache mode per route (`no-store`, revalidate, or static).

Deliverables:
- Typed API client coverage for MVP routes
- `docs/data-contracts.md`

Exit criteria:
- All target pages can render using only API responses, without HTML scraping at runtime.

---

### Phase 5: Route-by-Route Page Migration (Core)
Objective:
- Implement Next.js pages in migration waves.

Wave A (MVP):
- Home page
- Article details page
- Section listing page

Wave B:
- Search results
- Author pages
- Read/special layout pages

Wave C:
- Remaining static/utility pages (privacy, policy, misc)

Tasks per route:
- Build server component page structure
- Add metadata and canonical tags
- Match legacy UX patterns and ad/widget placeholders
- Add loading and not-found states

Deliverables:
- Working Next.js routes for all prioritized pages

Exit criteria:
- Functional parity for MVP routes in production-like environment.

---

### Phase 6: Preview, CMS Workflow, and Editorial QA
Objective:
- Ensure editorial preview and publishing workflow works end-to-end.

Tasks:
- Validate `app/api/preview/route.ts` token flow against backend.
- Validate preview-to-public content differences.
- Add preview banners/indicators for editors.
- Create QA checklist for draft, publish, rollback scenarios.

Deliverables:
- `docs/editorial-qa.md`

Exit criteria:
- Editors can preview draft content safely and predictably.

---

### Phase 7: Performance, SEO, and Accessibility Hardening
Objective:
- Ensure the new frontend is faster and SEO-safe.

Tasks:
- Add structured metadata per page type (title, description, canonical, OG).
- Verify internal linking and crawl paths.
- Optimize images and fonts; reduce layout shift.
- Run accessibility checks for keyboard/contrast/semantics.

Deliverables:
- Lighthouse and CWV benchmark report
- `docs/seo-checklist.md`

Exit criteria:
- No critical SEO regressions and acceptable performance baselines.

---

### Phase 8: Release, Cutover, and Stabilization
Objective:
- Roll out safely with rollback options.

Tasks:
- Deploy behind feature flag or route-switch rules.
- Route a small traffic percentage first (canary).
- Monitor errors, response times, and indexing.
- Finalize 301 redirects and retire old Web Forms routes progressively.

Deliverables:
- Go-live runbook
- Rollback runbook

Exit criteria:
- Stable production behavior and successful migration sign-off.

## 5) Execution Model (Suggested Timeline)
- Week 1: Phases 0-1
- Week 2: Phases 2-3
- Week 3: Phase 4 + Wave A from Phase 5
- Week 4: Wave B/C + Phase 6
- Week 5: Phases 7-8

Note: If API contract instability remains after Phase 0, timeline extends by 1-2 weeks.

## 6) Technical Rules During Migration
- Do not fetch legacy rendered HTML at runtime from IIS into Next.js pages.
- Use legacy HTML/CSS only as migration reference and component blueprint.
- Keep all dynamic data API-driven from `v1` endpoints.
- Keep route canonicalization and redirects strict to protect SEO.
- Maintain RTL-first rendering across all new components.

## 7) Immediate Next Actions (Start Now)
1. Confirm exact live API path and fix local `.env.local` if base path differs.
2. Produce endpoint contract snapshots for all required page types.
3. Build and approve legacy route map from `C:\inetpub\akhbaralyawm`.
4. Replace default `app/page.tsx` with real home template scaffold.
5. Begin Phase 3 component extraction from `MasterPage.master` and `_box*.ascx`.

## 8) Risks and Mitigations
- Risk: API endpoints not reachable at configured base URL.
  - Mitigation: complete Phase 0 first and block page migration until green.

- Risk: Legacy pages contain hidden server-side logic in `.vb` code-behind.
  - Mitigation: inventory and map each behavior to API or Next.js server logic explicitly.

- Risk: Visual drift from legacy brand.
  - Mitigation: screenshot parity checklist and sign-off per template.

- Risk: SEO loss during route changes.
  - Mitigation: canonical enforcement + tested redirect matrix before cutover.

## 9) Definition of Done (Project)
- All targeted legacy routes replaced by Next.js routes.
- API-only content flow is stable and typed.
- Editorial preview works.
- SEO and performance baselines pass acceptance.
- Cutover completed with monitored stability window.