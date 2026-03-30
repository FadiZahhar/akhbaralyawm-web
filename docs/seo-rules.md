# SEO Rules (Phase 2)

Date: 2026-03-30

## Objective
Protect rankings and link equity during migration by eliminating duplicate route variants, defining canonical metadata rules, and keeping all core content crawlable on first response.

## Canonical URL Policy
- Each content item must have exactly one canonical public URL.
- Canonical URL patterns:
  - Home: `/`
  - Article: `/news/{slug}-{id}`
  - Category: `/category/{slug}`
  - Author: `/author/{slug}`
  - Search: `/search?q={term}`
  - Static pages: `/about`, `/contact`, `/read/{id}`
- All legacy or alternate variants must redirect permanently to the canonical route.

## Redirect Rules
- Redirect legacy `.aspx` endpoints to clean routes.
- Redirect article URLs with missing or stale slugs to the current canonical slug.
- Redirect duplicate static aliases like `/about-us` to `/about`.
- Avoid chain redirects and redirect loops.

## Metadata Rules

### Global
- Every indexable page must return:
  - `title`
  - `description`
  - `alternates.canonical`
  - Open Graph title, description, URL, image where applicable
  - Twitter card metadata

### Article Pages
- Title must use article title, not generic site title.
- Description should be sourced from `smallbody` or a safe plain-text excerpt from article body.
- Canonical must always match `/news/{slug}-{id}`.
- Primary image should use the article photo.
- Include NewsArticle structured data.

### Category Pages
- Title should include category name and site name.
- Description should summarize the category or editorial scope.
- Canonical should match the slug route only.
- Include BreadcrumbList structured data.

### Author Pages
- Title should include author name.
- Description should use author bio if available, otherwise a neutral listing description.
- Canonical should match `/author/{slug}`.

### Search Pages
- Use descriptive title including the query.
- Set `robots` to `noindex, follow`.
- Do not let search result combinations create many indexable variants.

## Robots and Indexing Policy
- Index:
  - Home
  - Articles
  - Categories
  - Authors
  - Stable editorial landing pages
- Noindex:
  - Search results
  - Empty-result pages
  - Preview pages
  - Temporary compatibility routes

## Structured Data Policy
- Add `NewsArticle` for article detail pages.
- Add `BreadcrumbList` for article, category, author, and static pages.
- Add `Organization` and `WebSite` at site level once branding metadata is finalized.

## Content Rendering Policy
- Core article, category, author, and static content must render server-side.
- Do not depend on client-only rendering for primary SEO content.
- First response HTML should contain the main heading, body excerpt or body, and navigational context.

## Internal Linking Policy
- All internal links must point to canonical routes only.
- Do not emit links to `.aspx` endpoints anywhere in the Next app.
- Link consistency matters more than supporting every historical pattern in-page.

## Pagination and Parameter Policy
- Use one pagination model per page type.
- Do not allow multiple param names to represent the same concept.
- Strip tracking params from canonical evaluation.

## Media and Performance SEO
- Ensure article images resolve to absolute URLs for metadata.
- Use optimized image delivery where possible without breaking legacy asset paths.
- Avoid layout shift on hero and article images by reserving space.

## Migration Acceptance Checklist
- No known duplicate article pages render with `200`.
- Legacy public URLs redirect directly to final canonical URLs.
- Search pages are not indexable.
- Metadata is route-specific, not generic.
- Structured data validates for article pages.