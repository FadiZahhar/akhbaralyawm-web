# API Contracts (Phase 0 Verified)

Date: 2026-03-30
Host: http://localhost:8081
Base URL: http://localhost:8081/v1

## Verification Summary
- Public API base is reachable at /v1.
- Home feed, sections, search, and article endpoints return JSON successfully.
- Preview token endpoint requires GET with id and X-Shared-Secret header.
- Preview token and preview article endpoints both verified with the configured local SHARED_SECRET value.

## Confirmed Endpoints

### GET /v1/home/feed.ashx
Purpose:
- Latest home feed list.

Query params:
- limit (optional, int, 1-100, default 20)

Sample call:
- /v1/home/feed.ashx?limit=3

Sample success shape:
- { data: [{ id, title, smallbody, photo, disdate, category, categoryLink, slugId, photoPath }] }

### GET /v1/articles/by-id.ashx
Purpose:
- Public article details by numeric id.

Query params:
- id (required, positive int)

Sample call:
- /v1/articles/by-id.ashx?id=420777

Sample success shape:
- { id, title, smallbody, body, photo, tag, disdate, category, categoryLink, authorName, slugId?, photoPath? }

### GET /v1/articles/by-slug.ashx
Purpose:
- Article details by slug ending in -{id}.

Query params:
- slug (required, format ...-{id})

Sample call:
- /v1/articles/by-slug.ashx?slug=test-420777

Behavior:
- Rewrites internally to /v1/articles/by-id.ashx?id={id}.

### GET /v1/sections.ashx
Purpose:
- List active sections.

Query params:
- id (optional, positive int for single section)

Sample call:
- /v1/sections.ashx

Sample success shape:
- { data: [{ id, title, link, orderorder }] }

### GET /v1/search.ashx
Purpose:
- Search by query or tag.

Query params:
- q (required if tag missing)
- tag (fallback if q missing)
- limit (optional, int, max 100)

Sample call:
- /v1/search.ashx?q=مصر&limit=2

Sample success shape:
- { data: [{ id, title, smallbody, photo, tag, disdate, slugId, photoPath }] }

### GET /v1/preview/token.ashx
Purpose:
- Mint short-lived preview token tied to an article id.

Query params:
- id (required, positive int)

Headers:
- X-Shared-Secret: <server shared secret>

Sample call:
- /v1/preview/token.ashx?id=420777

Success shape:
- { token, articleId }

Observed local behavior:
- With mismatched secret, returns 401 unauthorized.
- With SHARED_SECRET from ApiApp Web.config, returns 200 and token payload.

### GET /v1/preview/articles/by-id.ashx
Purpose:
- Retrieve preview article payload.

Query params:
- id (required, positive int)

Headers:
- Authorization: Bearer <token>

Failure behavior:
- 401 if token missing/invalid/expired.

### GET /v1/preview/articles/by-slug.ashx
Purpose:
- Preview article by slug with id suffix.

Query params:
- slug (required, format ...-{id})

Behavior:
- Rewrites internally to /v1/preview/articles/by-id.ashx?id={id}.

## Additional Public Endpoints Found (Not Yet Exercised)
- GET /v1/news.ashx
- GET /v1/authors.ashx
- GET /v1/categories.ashx
- POST /v1/auth/token.ashx (separate auth flow)

## Integration Notes For Next.js
- API_BASE_URL should remain http://localhost:8081/v1/.
- Article details endpoint path must be /v1/articles/by-id.ashx (plural articles).
- Preview token endpoint uses GET (not POST), and requires X-Shared-Secret header.
- Preview article endpoint expects Bearer token in Authorization header, not token query parameter.
