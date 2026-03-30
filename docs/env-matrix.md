# Environment Matrix (Phase 0)

Date: 2026-03-30

## Local
- API_BASE_URL=http://localhost:8081/v1/
- NEXT_PUBLIC_ASSET_HOST=http://localhost:8081
- AKHBAR_PREVIEW_SHARED_SECRET={PLACEHOLDER_SHARED_SECRET}

Status:
- API_BASE_URL verified for public endpoints.
- Asset host appears valid for /upload paths.
- Preview secret verified against /v1/preview/token.ashx and /v1/preview/articles/by-id.ashx.

## Staging (To Define)
- API_BASE_URL=https://<staging-host>/v1/
- NEXT_PUBLIC_ASSET_HOST=https://<staging-host>
- AKHBAR_PREVIEW_SHARED_SECRET=<staging secret>

## Production (To Define)
- API_BASE_URL=https://<prod-host>/v1/
- NEXT_PUBLIC_ASSET_HOST=https://<prod-host>
- AKHBAR_PREVIEW_SHARED_SECRET=<prod secret>

## Validation Checklist
- Public API responds:
  - /v1/home/feed.ashx
  - /v1/articles/by-id.ashx?id={id}
  - /v1/sections.ashx
  - /v1/search.ashx?q={term}
- Preview token returns 200 with real secret:
  - /v1/preview/token.ashx?id={id}
- Preview article returns 200 with bearer token:
  - /v1/preview/articles/by-id.ashx?id={id}
