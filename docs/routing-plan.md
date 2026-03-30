# Routing Plan (Phase 2)

Date: 2026-03-30
Scope: Public frontend routes only

## Objective
Define one canonical URL structure for each content type, preserve legacy equity through permanent redirects, and ensure all Next.js implementation work follows one routing model.

## Canonical Route Rules

### Home
- Canonical route: `/`
- Legacy compatibility:
  - `/Default.aspx` -> `/`

### Article Details
- Canonical route: `/news/{slug}-{id}`
- Rules:
  - `id` is required and must be trailing numeric digits.
  - `slug` is human-readable Arabic/Latin text derived from title.
  - The backend lookup is authoritative by `id`.
  - If the incoming slug does not match the article's current canonical slug, redirect permanently to the canonical URL.
- Accepted compatibility inputs:
  - `/news/{id}`
  - `/news/{id}/{legacy-slug}`
  - `/Newsdet.aspx?id={id}`
- Next.js target:
  - Existing route: `app/news/[slugId]/page.tsx`

### Category/Section Listing
- Canonical route: `/category/{slug}`
- Transitional compatibility route:
  - `/category/{idOrLink}` can be accepted during migration, but public links should move to slug-only values.
- Accepted compatibility inputs:
  - `/News.aspx?id={slugOrId}`
- Rules:
  - Prefer section `link` value as canonical segment.
  - If numeric ids are still required for a subset, redirect to resolved slug when possible.

### Author Listing
- Canonical route: `/author/{slug}`
- Transitional compatibility route:
  - `/author/{idOrLink}` may be accepted until author slug mapping is fully validated.
- Accepted compatibility inputs:
  - `/Author.aspx?id={slugOrId}`
- Rules:
  - Prefer author `link` value as canonical segment.
  - Resolve legacy ids to canonical slug before rendering.

### Search
- Canonical route: `/search?q={term}`
- Compatibility routes:
  - `/tag/{term}` -> `/search?q={term}`
  - `/Search.aspx?id={term}` -> `/search?q={term}`
- Rules:
  - Search state is query-driven, not path-driven.
  - Empty search requests should render a user-friendly search page but remain non-indexable.

### Static Pages / CMS Pages
- Canonical routes:
  - `/about`
  - `/contact`
- Transitional compatibility:
  - `/read/{id}` for remaining CMS page ids
  - `/Read.aspx?id={id}`
- Rules:
  - Named static pages should replace id-based URLs where editorial meaning is stable.
  - Keep `/read/{id}` for uncategorized or not-yet-renamed CMS pages.

### Mix Hub
- Canonical route: `/mix`
- Legacy compatibility:
  - `/Mix.aspx` -> `/mix`

## Indexability Policy by Route Type
- `/`: index
- `/news/{slug}-{id}`: index
- `/category/{slug}`: index
- `/author/{slug}`: index
- `/mix`: index only if editorially valuable and stable
- `/search?q={term}`: noindex, follow
- `/read/{id}`: case-by-case; named pages like `/about` and `/contact` should be indexable

## Canonicalization Rules
- Every rendered page must declare a self-referencing canonical URL.
- Non-canonical variants must redirect rather than render duplicate HTML.
- Internal links must always point to canonical destinations.
- Query parameters unrelated to content identity must not generate distinct canonicals.

## Redirect Policy
- Use permanent redirects for legacy-to-canonical route migrations.
- In Next.js, `permanent: true` may emit `308`; this is acceptable for SEO and preferred over keeping duplicates live.
- Avoid redirect chains. Legacy URLs should redirect directly to final canonical URLs.

## Breadcrumb Model
- Home -> Category -> Article
- Home -> Author
- Home -> Search
- Home -> Static Page

## Metadata Expectations Per Route Type

### Article
- Unique title
- Description from article summary/body excerpt
- Canonical URL
- Open Graph image
- NewsArticle structured data

### Category
- Unique title with section name
- Intro description for section where available
- Canonical URL
- Breadcrumb structured data

### Author
- Unique title with author name
- Author bio snippet if available
- Canonical URL

### Search
- Title reflecting user query
- `robots: noindex, follow`
- No canonical to arbitrary filtered variants beyond the current `q`

## Final Target Route Set
- `/`
- `/news/{slug}-{id}`
- `/category/{slug}`
- `/author/{slug}`
- `/search?q={term}`
- `/mix`
- `/about`
- `/contact`
- `/read/{id}`

## Implementation Notes
- Do not expose `.aspx` routes from the new frontend.
- Keep article id in URL permanently for uniqueness and recovery.
- Migrate section and author routes toward slug-only addressing as soon as slug resolution is stable.
- Preserve legacy aliases via redirect table, not by serving duplicate content.