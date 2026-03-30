# Rollback Runbook

Date: 2026-03-30
Phase: 8

## Objective
Provide a clear and fast rollback path if production stability or SEO integrity is at risk.

## Rollback Triggers
- Sustained 5xx increase above baseline.
- Broken redirects causing high-volume 404s.
- Critical page rendering failures on home/article/category.
- Severe SEO metadata/canonical regression on indexable pages.

## Immediate Actions
1. Declare incident and assign incident commander.
2. Freeze further deployments.
3. Communicate status to stakeholders.

## Rollback Paths

### Path A: Platform rollback
- Revert frontend deployment to last known good release.
- Confirm previous release health before re-opening traffic.

### Path B: Traffic switch rollback
- Route traffic back to legacy frontend origin.
- Keep API unchanged unless API is root cause.

### Path C: Partial feature rollback
- Disable risky route groups if platform supports selective routing.
- Keep only stable canonical routes live.

## Verification After Rollback
- Health checks return expected status codes.
- Core user journeys work.
- Redirects no longer causing error spikes.
- Monitoring trends return to baseline.
- Pagination SEO check passes on rollback target:
	- npm run seo:pagination-check -- --base https://<rollback-domain>

## SEO Safety During Rollback
- Ensure canonical URLs remain deterministic.
- Avoid redirect loops between old/new systems.
- Preserve robots and sitemap availability.
- Ensure category/search pagination links remain crawlable.
- Ensure search keeps robots noindex,follow.

## Communication Template
- Incident started:
- User impact:
- Rollback path used:
- Current status:
- ETA for next update:

## Recovery Plan
- Perform root-cause analysis.
- Patch in staging and re-run smoke checks.
- Re-attempt canary rollout only after sign-off from engineering and QA.
