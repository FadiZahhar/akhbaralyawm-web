# UX Routing Principles (Phase 2)

Date: 2026-03-30

## Objective
Make navigation predictable for users while aligning route structure with SEO and editorial clarity.

## Core Principles

### One Meaning Per URL
- Users should infer page type from the route alone.
- Route families should be obvious:
  - `/news/...` for articles
  - `/category/...` for section archives
  - `/author/...` for author archives
  - `/search?...` for search results
  - `/read/...` or named static routes for CMS pages

### Readable URLs
- Keep article slugs human-readable and title-derived.
- Prefer meaningful slugs over ids for categories and authors.
- Preserve ids in article URLs for stability and conflict-free lookup.

### Predictable Back Navigation
- Canonical redirect rules should prevent users from landing on fragmented legacy views.
- Old links from search, WhatsApp, Facebook, or bookmarks should land on the same final route users would reach from internal navigation.

### Clear Wayfinding
- Breadcrumbs should be visible on article, category, author, and static pages.
- Page title, route, breadcrumb, and nav state should all describe the same location.

## Route-Type UX Rules

### Article Pages
- Show category context near the top.
- Keep headline, date, author, and main media above the fold where possible.
- If a stale legacy article URL is opened, redirect immediately to canonical URL before render.

### Category Pages
- Use a strong page heading matching the category title.
- Support scanning with consistent card hierarchy.
- Keep pagination or load-more behavior consistent on all archive pages.

### Author Pages
- Use the same archive mental model as category pages.
- Distinguish author identity with a clear heading and optional bio/photo.

### Search Pages
- Search input should always submit to `/search?q=...`.
- Preserve the user query visibly in the search box and page heading.
- Empty states must be explicit and helpful, not blank.

### Static Pages
- Named routes like `/about` and `/contact` should be preferred over numeric ids for user trust.
- Generic `/read/{id}` should remain a migration fallback, not a primary navigation pattern.

## Mobile UX Rules
- Routes must remain understandable on mobile share previews and browser address bars.
- Headlines should wrap without layout breakage.
- Breadcrumbs may be simplified visually on mobile, but route context should remain present.
- Back-to-section navigation should remain obvious.

## Search and Discovery UX
- Header search must behave identically across all pages.
- Search result routes should be shareable and reproducible.
- Search should not silently switch between tag mode and general mode without clear labeling.

## Error and Edge-Case UX
- Invalid article ids should return a real not-found page.
- Missing category or author slugs should return not-found or redirect to resolved canonical when deterministically known.
- Unknown read pages should not render broken shells with empty content.

## Redirect UX Rules
- Redirect once, not multiple times.
- Preserve user intent during redirects.
- Do not send users from one content type to another unless the mapping is exact.

## Navigation Consistency Rules
- Main nav links must point only to canonical routes.
- Footer links must follow the same route rules as header links.
- Shared components must not leak legacy `.aspx` URLs.

## Acceptance Checklist
- Users can distinguish route types from the URL alone.
- Old bookmarks land on the correct canonical pages.
- Search is predictable and preserves query state.
- Breadcrumbs and headings reinforce route meaning.
- Mobile navigation remains clear for primary route families.