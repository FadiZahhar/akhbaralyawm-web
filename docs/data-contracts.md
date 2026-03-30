# Data Contracts

Date: 2026-03-30
Phase: 4

## Objective
Define frontend-consumed DTO contracts and endpoint mappings so implementation and QA use one source of truth.

## Environment
- API_BASE_URL: expected to end with /v1/
- NEXT_PUBLIC_ASSET_HOST: asset host for relative media paths

## Frontend DTOs

### ArticleDto
Fields:
- id: number
- title: string
- slugId: string
- sectionId: number
- sectionTitle: string
- sectionLink: string
- photoPath: string | null
- bodyHtml: string
- disdate: string
- statusId: number

Used by:
- app/news/[slugId]/page.tsx

### FeedItemDto
Fields:
- id: number
- title: string
- slugId: string
- summary: string
- photoPath: string | null
- disdate: string
- sectionTitle: string
- sectionLink: string
- tag: string | null

Used by:
- home, category, search, mix, optional author archive

### SectionDto
Fields:
- id: number
- title: string
- link: string
- orderorder: number
- active?: boolean

Used by:
- header navigation, category resolution, mix/home section blocks

### AuthorDto
Fields:
- id: number
- title: string
- link: string
- photoPath: string | null
- bodyHtml: string
- orderorder: number

Used by:
- app/author/[slug]/page.tsx

### PaginatedFeedDto
Fields:
- items: FeedItemDto[]
- pagination:
  - page: number
  - limit: number
  - total: number
  - totalPages: number

Used by:
- category, optional author archive

### CmsPageDto (optional endpoint)
Fields:
- id: number
- title: string
- slugId: string
- bodyHtml: string
- updatedAt: string

Used by:
- app/read/[id]/page.tsx

## Endpoint Mapping

### Public Content
- GET /v1/home/feed.ashx?limit={n}
  - maps to FeedItemDto[]
- GET /v1/news.ashx?id={id}
  - maps to ArticleDto
- GET /v1/news.ashx?section={link}&page={n}&limit={n}
  - maps to PaginatedFeedDto
- GET /v1/search.ashx?q={term}&limit={n}
  - maps to FeedItemDto[]
- GET /v1/sections.ashx
- GET /v1/sections.ashx?id={id}
  - maps to SectionDto or list
- GET /v1/authors.ashx?id={id} or ?link={slug}
  - maps to AuthorDto

### Preview
- GET /v1/preview/token.ashx?id={id}
  - header: X-Shared-Secret
- GET /v1/preview/articles/by-id.ashx?id={id}
  - header: Authorization: Bearer {token}

### Optional Prewired Endpoints
Configured via env:
- API_CMS_PAGE_PATH (default /v1/pages/by-id.ashx)
- API_AUTHOR_ARTICLES_PATH (default /v1/news.ashx)
- API_AUTHOR_QUERY_KEY (default author)

If unavailable, frontend must degrade gracefully without crash.

## Error Handling Policy
- 404 from optional endpoints -> return null and render fallback UI.
- Non-404 non-2xx -> throw and surface route-level error handling.
- Missing required env variables -> fail fast on server.

## Media URL Policy
- If photo path is absolute, use as-is.
- If relative, prepend NEXT_PUBLIC_ASSET_HOST.

## Contract Validation Checklist
- Verify required fields for each DTO before render.
- Verify date fields are parseable or displayed as raw fallback.
- Verify slug/id canonicalization works from returned payload fields.
- Verify pagination keys exist where expected.
