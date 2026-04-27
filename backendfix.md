# Backend Fix Plan — Akhbar Al Youm v1 API (Multilingual + SEO Slugs)

> **Audience:** GitHub Copilot working on the Akhbar Al Youm **backend** repo (separate VS Code instance). The Next.js front-end consumes this API and currently cannot serve English or French because of the gaps below.
>
> **Reference:** see `Akhbar Al Youm v1 API.postman_collection.json` for the current contract.
>
> **Goal:** make `lang=ar | en | fr` work consistently on every public endpoint, return truthful language metadata, and expose stable SEO-friendly per-locale slugs.

---

## 0) Ground rules (apply to every endpoint below)

1. **Never** suffix endpoints with `.ashx` in new responses, examples, or docs. Keep `.ashx` only as a temporary backwards-compatible alias that 308-redirects to the clean path.
2. Every endpoint that accepts `lang` must accept the values: `ar`, `en`, `fr`. Default = `ar` when omitted or invalid.
3. Every endpoint that returns localizable content **must** include this language metadata in the JSON response (top-level for single resources, top-level alongside `data` for lists):
   ```json
   {
     "requestedLanguage": "en",
     "contentLanguage": "en",
     "fallbackUsed": false
   }
   ```
   - `requestedLanguage` = the `lang` value the client asked for.
   - `contentLanguage` = the language actually returned (after fallback).
   - `fallbackUsed` = `true` when `requestedLanguage !== contentLanguage`.
4. Fallback chain: `fr → en → ar`, `en → ar`, `ar → ar`. Never silently return Arabic when the client asked for English without setting `fallbackUsed: true`.
5. All localizable text fields (`title`, `body`, `bodyHtml`, `summary`, `smallbody`, section/author `title`, tag names, page titles, etc.) MUST be returned in `contentLanguage`. No mixing.
6. Date format: ISO-8601 UTC (`2026-04-27T10:00:00Z`). Locale-formatted dates are the front-end's job.
7. JSON keys: `camelCase`. Keep snake_case aliases temporarily for backwards compatibility but mark them `@deprecated` in OpenAPI.

---

## 1) Per-locale SEO slugs (THE most important change)

Add a stable, URL-safe `slug` field to every section, author, and article — **per locale**.

### Schema additions

For `Section`, `Author`, `Article`, `CmsPage`:
```json
{
  "id": 45,
  "title": "Politics",          // localized to contentLanguage
  "slug": "politics",            // localized, URL-safe (a-z0-9-)
  "link": "politics",            // KEEP for backwards compat = same as slug
  "oldSlugs": ["politics-old"]  // optional, for 301 redirects
}
```

### Slug generation rules

- Lowercase ASCII for `en` and `fr`. Use Unidecode/transliteration.
- Arabic slugs: keep Arabic letters but normalize (remove diacritics, replace whitespace with `-`, strip punctuation).
- Slug must be **stable**: do not regenerate on every title edit. Store it. When the editor changes the slug intentionally, push the previous value to `oldSlugs[]`.
- Slug must be **unique per (entity-type, locale)**. Append a numeric disambiguator only on collision.
- Empty / numeric-only slugs are forbidden.

### Migration

Write a one-shot migration that backfills `slug` for every existing row in every locale by running the slug generator on `title`. Persist results.

---

## 2) Endpoint-by-endpoint changes

> Each section lists: **current shape (Postman)** → **required shape**.

### 2.1 `GET /v1/` (root categories) and `GET /v1/categories`

- Already public. Add `lang` param.
- Response: `{ data: Category[], requestedLanguage, contentLanguage, fallbackUsed }`.
- Each `Category` MUST include localized `title`, `slug`, `link`, `id`.

### 2.2 `GET /v1/sections?lang=&id=`

- List shape: `{ data: Section[], requestedLanguage, contentLanguage, fallbackUsed }`.
- Detail shape (when `id` present): `{ ...Section, requestedLanguage, contentLanguage, fallbackUsed }`.
- Each `Section`: `{ id, title, slug, link, orderorder, active, parentId? }` — all localized.
- **Add lookup by slug:** `GET /v1/sections?slug=politics&lang=en` — returns the same Detail shape, or `404`.

### 2.3 `GET /v1/home/feed?lang=&limit=`

- Already in collection. Confirm:
  - Each `data[i]` has localized `title`, `summary` (or `smallbody`), `slug`, `slugId`, `sectionTitle`, `sectionLink` (= section slug).
  - Top-level `requestedLanguage`, `contentLanguage`, `fallbackUsed` present.
- If an article has no translation in `lang`, either skip it OR include it with its own `fallbackUsed: true` per-item flag (preferred: per-item flag so the home page still has 12 cards).

### 2.4 `GET /v1/news?lang=&page=&limit=`  (paginated list)

- **Add filter parameters:**
  - `sectionId={id}` — filter by numeric section id.
  - `sectionSlug={slug}` — filter by section slug (preferred for SEO routes).
  - `tag={tag}` — filter by tag.
- Response: `{ data: FeedItem[], pagination: { page, limit, totalItems, totalPages }, requestedLanguage, contentLanguage, fallbackUsed }`.
- Pagination keys: **`totalItems` and `totalPages`** (camelCase). Keep `total`/`total_pages` as deprecated aliases.

### 2.5 `GET /v1/news?id=&lang=`  (single news = legacy alias)

- Keep as a 308 redirect to `/v1/articles/by-id/{id}?lang=` for backwards compat. Do not duplicate logic.

### 2.6 `GET /v1/articles/by-id/{id}?lang=`

- Path param for `id`. Confirm in code.
- Response: full `Article` object (see schema below) + language meta.
- 404 when no article exists in any locale. If article exists in AR but not EN and `lang=en`: return AR with `fallbackUsed: true`.

### 2.7 `GET /v1/articles/by-slug/{slug}?lang=`

- Path param for `slug`. The `slug` may be `ar` or `en` or `fr` slug — the API resolves across locales by checking `slug` AND `oldSlugs[]` in any locale.
- If the matched article's slug in `lang` differs from the requested `slug`, return the article AND a `canonicalSlug` field so the front-end can issue a 301 to the canonical URL.
- 404 when slug matches nothing.

### 2.8 `Article` schema (single source of truth)

```json
{
  "id": 420777,
  "title": "Sample article",
  "slug": "sample-article",
  "slugId": "sample-article-420777",
  "canonicalSlug": "sample-article",
  "sectionId": 25,
  "sectionTitle": "Politics",
  "sectionSlug": "politics",
  "sectionLink": "politics",
  "photoPath": "/uploads/2026/04/abc.jpg",
  "bodyHtml": "<p>...</p>",
  "summary": "Short teaser.",
  "tags": ["election", "egypt"],
  "youtubeUrl": "https://youtu.be/...",
  "authorId": 11,
  "authorName": "John Doe",
  "authorSlug": "john-doe",
  "disdate": "2026-04-27T10:00:00Z",
  "statusId": 1,
  "requestedLanguage": "en",
  "contentLanguage": "en",
  "fallbackUsed": false
}
```

### 2.9 `GET /v1/sections?id=&lang=` — section detail with articles

- Currently undocumented whether section detail embeds articles. **Decision:** do NOT embed. Front-end will call `/v1/news?sectionId=&lang=&page=&limit=`.

### 2.10 `GET /v1/authors?lang=` and `?id=` and `?link=`

- Add `slug=` lookup (parallel to `link=`).
- `Author` schema: `{ id, title, slug, link, photo, body, orderorder }` — `title` and `body` localized.
- Add `GET /v1/authors/{id}/articles?lang=&page=&limit=` (cleaner than overloading `/v1/news?author=...`). Same paginated shape as 2.4.

### 2.11 `GET /v1/pages/by-id?id=&lang=`

- Drop `.ashx` (keep redirect alias).
- Add `GET /v1/pages/by-slug/{slug}?lang=` mirroring articles.
- `CmsPage` schema: `{ id, title, slug, slugId, bodyHtml, updatedAt, requestedLanguage, contentLanguage, fallbackUsed }`.

### 2.12 `GET /v1/search?q=&lang=&page=&limit=`

- Add `page` parameter (currently only `limit`).
- Response: paginated shape from §2.4.
- Search must respect `lang`: only return results whose `contentLanguage === lang`. Do NOT mix locales in one result set.
- If the `lang` index is empty, return `{ data: [], pagination: { ... }, requestedLanguage, contentLanguage: lang, fallbackUsed: false }` — empty is empty, not a fallback.

### 2.13 `GET /v1/sitemap?page=&limit=`

- Add `lang` filter. Without it, return all locales (each entry tagged with its `lang`).
- Each entry: `{ url, lang, lastmod, alternates: [{ lang, url }] }` so the front-end can build `hreflang`.

### 2.14 `POST /v1/analytics/fallback`

- Already accepts the body shown in the Postman collection. Confirm:
  - No auth required (or accept anonymous + rate limit).
  - Persist for monitoring.
  - Return `204 No Content`.

### 2.15 Auth — `POST /v1/auth/token.ashx`

- Rename canonical path to `POST /v1/auth/token` (keep `.ashx` as alias).
- Confirm public endpoints (`/v1/home/feed`, `/v1/news`, `/v1/sections`, `/v1/articles/*`, `/v1/authors`, `/v1/pages/*`, `/v1/search`, `/v1/sitemap`) work **without** the Bearer token. Document this explicitly.
- Bearer remains required for `/v1/preview/*` only.

### 2.16 Preview endpoints

- `GET /v1/preview/token?id=` — drop `.ashx`. Keep `X-Shared-Secret` header.
- `GET /v1/preview/articles/by-id/{id}?lang=` — path param, accept `lang`.
- `GET /v1/preview/articles/by-slug/{slug}?lang=` — add this, mirror public.

---

## 3) Cross-cutting requirements

### 3.1 Caching headers
- Public GET endpoints: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- Add `Vary: Accept-Language` on every response that varies by `lang` (even when the client passes `lang` as query — protects shared CDN caches).
- `ETag` based on `(entity, locale, updatedAt)`.

### 3.2 CORS
- Allow the front-end origin(s). Allow `Accept-Language` and `Authorization` headers.

### 3.3 Error shape
Return a consistent JSON error envelope:
```json
{ "error": { "code": "NOT_FOUND", "message": "Article 420777 not found", "lang": "en" } }
```
HTTP status remains the source of truth (400/404/500).

### 3.4 OpenAPI / Postman
- Generate or hand-write an OpenAPI 3.1 spec covering every endpoint above.
- Update `Akhbar Al Youm v1 API.postman_collection.json` to match (same name, same variables) so the front-end repo stays in sync.

### 3.5 Tests
For each endpoint, add tests that assert:
- `lang=ar`, `lang=en`, `lang=fr` each return their own `contentLanguage`.
- `fallbackUsed` is true exactly when content for `lang` is missing.
- `slug` is non-empty, URL-safe, and stable across two consecutive calls.
- Pagination keys are camelCase.
- 404 vs 200-with-fallback behaviour matches the rules above.

---

## 4) Migration & rollout order

1. **Schema + slug backfill migration** (offline). Verify uniqueness.
2. **Add `langMeta` to every response** (additive, non-breaking).
3. **Add new endpoints**: `articles/by-slug`, `sections?slug=`, `authors?slug=`, `authors/{id}/articles`, `pages/by-slug`. Non-breaking.
4. **Add filter params** to `/v1/news` (`sectionId`, `sectionSlug`, `tag`). Non-breaking.
5. **Add `page` to `/v1/search`.** Non-breaking.
6. **Publish OpenAPI + updated Postman.**
7. **Coordinate front-end cutover** — front-end switches to clean (no `.ashx`) URLs and per-locale slugs.
8. **Deprecate `.ashx` aliases** with a 308 + `Deprecation` header for one release cycle, then remove.

---

## 5) Acceptance checklist (Definition of Done)

- [ ] Postman collection updated; every request runs green for `lang=ar`, `lang=en`, `lang=fr`.
- [ ] No endpoint returns Arabic text when `lang=en` without `fallbackUsed: true`.
- [ ] Every section, author, article, and CMS page has a non-empty, URL-safe, stable `slug` per locale.
- [ ] `/v1/articles/by-slug/{slug}?lang=en` returns canonical EN slug or 301-hint via `canonicalSlug`.
- [ ] `/v1/news?sectionSlug=politics&lang=en&page=2&limit=12` returns EN-only articles paginated.
- [ ] `/v1/search?q=test&lang=en&page=1&limit=12` returns EN-only results, paginated.
- [ ] `/v1/sitemap?lang=en` lists EN URLs and includes `alternates` for `ar` and `fr`.
- [ ] `Vary: Accept-Language` set on every localized response.
- [ ] OpenAPI spec committed and published.
- [ ] No public endpoint requires the Bearer token (or, if it does, the requirement is documented and the token TTL is published).

---

## 6) Copilot, please

Please:
1. Read the current backend project structure (controllers, services, repositories) before changing anything.
2. Open `Akhbar Al Youm v1 API.postman_collection.json` (in the front-end repo, ask the user for the path) so you understand the existing contract.
3. Implement the changes in the order in §4. Do not skip the slug migration.
4. After each section, run the test suite and update the Postman collection.
5. When in doubt about Arabic slug rules, ask the user — do not invent transliteration policy.
