# API Gaps Blocking Next Frontend Completion

Date: 2026-03-30

## Context
The frontend migration now covers home, article, category, author profile, search, mix, preview, redirects, and SEO metadata. Two critical read-model endpoints are still missing from the current public API and block full parity with legacy Web Forms.

## Gap 1: CMS Static Pages (Read.aspx parity)

Legacy source:
- Read.aspx
- Reads from TBS_Pages by id

Current status:
- No reachable endpoint found under /v1 for page content by id
- Probed candidates returned 404:
  - /v1/pages.ashx?id=1
  - /v1/page/by-id.ashx?id=1
  - /v1/read.ashx?id=1

Required endpoint contract:
- GET /v1/pages/by-id.ashx?id={id}

Suggested response shape:
- {
  "id": number,
  "title": string,
  "slugId": string,
  "bodyHtml": string,
  "updatedAt": string
}

Error behavior:
- 400 for invalid id
- 404 for missing page
- 500 for server error

Frontend target route:
- /read/[id]
- /about and /contact should continue aliasing id=1 and id=2

## Gap 2: Author Article Archive (Author.aspx full parity)

Legacy source:
- Author.aspx + Author.aspx.vb
- Uses stored proc Get_Author for paginated author posts

Current status:
- Author profile endpoint exists (/v1/authors.ashx)
- Archive is now reachable via /v1/news.ashx?author={id|slug}&page={n}&limit={m}
- Status: resolved for frontend integration

Required endpoint contract:
- GET /v1/authors/articles.ashx?link={slug}&page={n}&limit={m}
  or
- GET /v1/news.ashx?author={slug}&page={n}&limit={m}

Suggested response shape:
- {
  "data": [
    {
      "id": number,
      "title": string,
      "smallbody": string | null,
      "photoPath": string | null,
      "disdate": string,
      "section_title": string,
      "section_link": string,
      "slug": string
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "total_pages": number
  }
}

Frontend target route:
- /author/[slug]

## Why these gaps matter
- Without CMS page endpoint, /read/[id] cannot render real legacy page content.
- Author archive is no longer blocking and is now rendered on /author/[slug].

## Recommended backend priority
1. Add pages-by-id endpoint
2. Keep response format aligned with existing /v1/news.ashx pagination keys for consistency
