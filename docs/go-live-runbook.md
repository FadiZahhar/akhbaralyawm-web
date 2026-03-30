# Go-Live Runbook

Date: 2026-03-30
Phase: 8

## Objective
Release the Next.js frontend safely with controlled risk and clear rollback criteria.

## Owners
- Release lead:
- Backend lead:
- Frontend lead:
- QA lead:
- Monitoring owner:

## Pre-Go-Live Checklist
- Production env variables verified.
- NEXT_PUBLIC_SITE_URL set to production domain.
- Redirect rules verified against docs/redirects.csv.
- robots and sitemap endpoints reachable.
- Preview flow validated in production-like environment.
- Lint/build pass in CI.
- Automated pagination SEO check pass:
   - npm run seo:pagination-check -- --base https://<release-domain>
   - or CI workflow_dispatch with:
     - target_environment=production
     - check_base_url=https://<release-domain>

## Deployment Steps
1. Deploy backend API changes first (if any).
2. Deploy Next.js frontend to production target.
3. Warm critical routes:
   - /
   - /news/{known-slug-id}
   - /category/{known-section}
   - /search?q={term}
4. Verify HTTP responses and redirect behavior.
5. Verify robots.txt and sitemap.xml.

## Canary Strategy
- Route 5 to 10 percent of traffic initially.
- Observe for 30 to 60 minutes.
- Expand to 50 percent, then 100 percent if healthy.

## Monitoring During Launch
- 5xx rate
- Request latency percentiles
- Cache hit ratio (if available)
- Redirect error counts
- Top route not-found rates
- Frontend runtime errors

## SEO Smoke Tests
- Canonical tags on article/category pages.
- Structured data present in page source.
- Legacy URLs redirect correctly.
- Category and search pagination previous/next links exist.
- Category CollectionPage ItemList positions continue across pages.
- Run automated check:
   - npm run seo:pagination-check -- --base https://<release-domain>
   - Optional overrides: --category /category/{slug}, --search /search?q={term}
   - CI live gate alternative:
     - Trigger CI workflow_dispatch with production environment and release URL

## Functional Smoke Tests
- Home page renders live feed.
- Article page renders and canonicalizes.
- Category page renders list.
- Author page renders profile and fallback/archive behavior.
- Read page fallback/cms behavior.
- Preview enter and exit flow.

## Launch Decision Gate
Proceed to full traffic only when:
- No critical errors in monitoring window.
- No broken canonical redirects.
- No major route-level regressions.
- Automated pagination SEO check reports pass.

## Post-Launch (first 24h)
- Recheck key dashboards hourly.
- Validate crawl behavior in Search Console (if available).
- Capture incident notes and follow-up tasks.
- Re-run:
   - npm run seo:pagination-check -- --base https://<release-domain>
