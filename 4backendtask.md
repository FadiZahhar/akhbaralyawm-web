# Copilot Prompt for Backend i18n API Tasks

Use this prompt in the backend repository (IIS/.NET).

## Context

The Next.js frontend at `akhbaralyawm-web` has full multilingual routing for `ar`, `en`, `fr` locales.  
The frontend already sends `?lang={locale}` query param and `Accept-Language: {locale}` header on every API request.  
The frontend already handles `LanguageMeta` fields (`requestedLanguage`, `contentLanguage`, `fallbackUsed`) and renders a fallback notice when content falls back to Arabic.

The CMS pages endpoint (`/v1/pages/by-id.ashx`) already returns these fields correctly.  
The remaining endpoints do not yet return language metadata.

Your task is to implement the 4 backend tasks below so the frontend can deliver a complete multilingual experience.

---

## Task B1: Return LanguageMeta on All Endpoints

**Priority: HIGH — quick win**

### What to do

Add three fields to the JSON response of every public content endpoint:

```json
{
  "requestedLanguage": "en",
  "contentLanguage": "ar",
  "fallbackUsed": true
}
```

### Endpoints to update

| Endpoint | Current response | Change needed |
|----------|-----------------|---------------|
| `GET /v1/home/feed.ashx` | `{ data: [...] }` | Add `requestedLanguage`, `contentLanguage`, `fallbackUsed` at root level |
| `GET /v1/news.ashx` | `{ data: [...], pagination: {...} }` | Add `requestedLanguage`, `contentLanguage`, `fallbackUsed` at root level |
| `GET /v1/news.ashx?id={id}` | Single article object | Add `requestedLanguage`, `contentLanguage`, `fallbackUsed` to article object |
| `GET /v1/articles/by-id.ashx?id={id}` | Single article object | Add `requestedLanguage`, `contentLanguage`, `fallbackUsed` to article object |
| `GET /v1/search.ashx` | `{ data: [...], pagination: {...} }` | Add `requestedLanguage`, `contentLanguage`, `fallbackUsed` at root level |
| `GET /v1/sections.ashx` | `{ data: [...] }` | Add `requestedLanguage`, `contentLanguage`, `fallbackUsed` at root level |
| `GET /v1/authors.ashx` | Single or list | Add `requestedLanguage`, `contentLanguage`, `fallbackUsed` |

### Behavior

1. Read the `lang` query parameter. Accept values: `ar`, `en`, `fr`. Default to `ar` if missing or invalid.
2. Also read the `Accept-Language` header as a secondary source (query param takes precedence).
3. Set `requestedLanguage` to the locale the caller asked for.
4. Set `contentLanguage` to the locale of the content actually returned.
5. Set `fallbackUsed` to `true` when `requestedLanguage !== contentLanguage`.
6. Until translated content exists (Task B2), all non-Arabic requests return Arabic content with `fallbackUsed: true`.

### Example request

```
GET /v1/home/feed.ashx?limit=12&lang=en
Accept-Language: en
```

### Example response

```json
{
  "requestedLanguage": "en",
  "contentLanguage": "ar",
  "fallbackUsed": true,
  "data": [
    { "id": 530553, "title": "عنوان الخبر", ... }
  ]
}
```

### TypeScript contract the frontend expects

```ts
interface LanguageMeta {
  requestedLanguage: "ar" | "en" | "fr";
  contentLanguage: "ar" | "en" | "fr";
  fallbackUsed: boolean;
}
```

### Acceptance criteria

- [ ] All 7 endpoints above return the 3 new fields.
- [ ] `lang=ar` returns `fallbackUsed: false`.
- [ ] `lang=en` or `lang=fr` returns `fallbackUsed: true` (until B2 is done).
- [ ] Missing or invalid `lang` defaults to `ar`.
- [ ] Existing response shape is unchanged — new fields are additive only.
- [ ] No breaking changes to existing clients.

---

## Task B2: Content Translation Tables

**Priority: MEDIUM — large effort, enables real multilingual content**

### What to do

Extend the database schema to store translated content for articles, sections, authors, and CMS pages in English and French.

### Suggested schema approach

Option A — Translation table per entity:

```sql
CREATE TABLE ArticleTranslations (
    ArticleId INT NOT NULL REFERENCES Articles(Id),
    Locale VARCHAR(5) NOT NULL,        -- 'en' or 'fr'
    Title NVARCHAR(500) NOT NULL,
    BodyHtml NVARCHAR(MAX) NULL,
    SmallBody NVARCHAR(1000) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    PRIMARY KEY (ArticleId, Locale)
);

CREATE TABLE SectionTranslations (
    SectionId INT NOT NULL REFERENCES Sections(Id),
    Locale VARCHAR(5) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    PRIMARY KEY (SectionId, Locale)
);

CREATE TABLE AuthorTranslations (
    AuthorId INT NOT NULL REFERENCES Authors(Id),
    Locale VARCHAR(5) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    BodyHtml NVARCHAR(MAX) NULL,
    PRIMARY KEY (AuthorId, Locale)
);

CREATE TABLE PageTranslations (
    PageId INT NOT NULL REFERENCES Pages(Id),
    Locale VARCHAR(5) NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    BodyHtml NVARCHAR(MAX) NULL,
    PRIMARY KEY (PageId, Locale)
);
```

Option B — Single polymorphic translation table (simpler but less typed):

```sql
CREATE TABLE Translations (
    EntityType VARCHAR(50) NOT NULL,   -- 'Article', 'Section', 'Author', 'Page'
    EntityId INT NOT NULL,
    Locale VARCHAR(5) NOT NULL,
    Field VARCHAR(50) NOT NULL,        -- 'Title', 'BodyHtml', 'SmallBody'
    Value NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    PRIMARY KEY (EntityType, EntityId, Locale, Field)
);
```

### API behavior after B2

1. When `lang=en` is requested, check for a translation row for that entity + locale.
2. If a translation exists, return the translated content with `contentLanguage: "en"` and `fallbackUsed: false`.
3. If no translation exists, return Arabic content with `contentLanguage: "ar"` and `fallbackUsed: true`.
4. Field-level fallback: if only `Title` is translated but `BodyHtml` is not, return the translated title with Arabic body. Set `fallbackUsed: true` (partial fallback).

### Acceptance criteria

- [ ] Translation tables created with proper foreign keys and indexes.
- [ ] API endpoints join to translation tables when `lang != ar`.
- [ ] Fallback to Arabic when no translation exists.
- [ ] `fallbackUsed` is `false` only when ALL requested fields have translations.
- [ ] Admin UI or import mechanism exists to add/edit translations.
- [ ] Existing Arabic content is unaffected (zero migration risk).

---

## Task B3: Sitemap Endpoint for All Articles

**Priority: LOW — SEO improvement**

### What to do

Create a dedicated sitemap endpoint that returns all published article slugs, not just the most recent feed.

### Endpoint

```
GET /v1/sitemap.ashx?page={page}&limit={limit}
```

### Response shape

```json
{
  "data": [
    {
      "slugId": "عنوان-الخبر-530553",
      "disdate": "2026-03-31T08:00:00Z",
      "sectionLink": "politics"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 1000,
    "total": 45000,
    "total_pages": 45
  }
}
```

### Requirements

1. Return only published articles (statusId indicating published).
2. Support pagination with default `limit=1000`.
3. Order by `disdate` descending (newest first).
4. Return minimal fields only: `slugId`, `disdate`, `sectionLink`.
5. No authentication required (public endpoint).
6. Should handle high total counts efficiently (index on statusId + disdate).

### Acceptance criteria

- [ ] `GET /v1/sitemap.ashx` returns paginated article slugs.
- [ ] Response includes `pagination` metadata.
- [ ] Only published articles are included.
- [ ] Query performs well with 50k+ articles (indexed).
- [ ] No rate limiting needed (called infrequently by Next.js sitemap generation).

---

## Task B4: Analytics Fallback Tracking Endpoint

**Priority: LOW — observability improvement, optional**

### What to do

Create an endpoint that accepts fallback usage reports from the frontend so you can track which locales and pages are hitting fallback most often.

### Endpoint

```
POST /v1/analytics/fallback
Content-Type: application/json
```

### Request body

```json
{
  "locale": "en",
  "path": "/en/news/530553",
  "endpoint": "/v1/articles/by-id.ashx",
  "fallbackUsed": true,
  "contentLanguage": "ar",
  "timestamp": "2026-03-31T10:00:00Z"
}
```

### Requirements

1. Accept POST with JSON body.
2. Validate that `locale` is one of `ar`, `en`, `fr`.
3. Store in a lightweight analytics table or append to a log file.
4. No authentication required but rate-limit to prevent abuse (e.g., 100 req/min per IP).
5. Return `204 No Content` on success.
6. Failures should not affect the caller — return `204` even if storage fails.

### Suggested storage table

```sql
CREATE TABLE FallbackAnalytics (
    Id INT IDENTITY PRIMARY KEY,
    Locale VARCHAR(5) NOT NULL,
    Path NVARCHAR(500) NOT NULL,
    Endpoint NVARCHAR(200) NOT NULL,
    FallbackUsed BIT NOT NULL,
    ContentLanguage VARCHAR(5) NOT NULL,
    Timestamp DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX IX_FallbackAnalytics_Locale ON FallbackAnalytics(Locale, Timestamp);
```

### Useful queries after implementation

```sql
-- Fallback rate by locale (last 7 days)
SELECT Locale, COUNT(*) AS Total,
       SUM(CASE WHEN FallbackUsed = 1 THEN 1 ELSE 0 END) AS Fallbacks,
       CAST(SUM(CASE WHEN FallbackUsed = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS FallbackRate
FROM FallbackAnalytics
WHERE Timestamp > DATEADD(DAY, -7, GETUTCDATE())
GROUP BY Locale;

-- Most-requested untranslated pages
SELECT Path, COUNT(*) AS Hits
FROM FallbackAnalytics
WHERE FallbackUsed = 1 AND Locale = 'en'
AND Timestamp > DATEADD(DAY, -7, GETUTCDATE())
GROUP BY Path
ORDER BY Hits DESC;
```

### Acceptance criteria

- [ ] `POST /v1/analytics/fallback` accepts JSON body and returns `204`.
- [ ] Invalid locale is rejected with `400`.
- [ ] Rate limiting is in place (100 req/min per IP or similar).
- [ ] Storage failure does not return error to caller.
- [ ] Data is queryable for reporting.

---

## Summary

| Task | Priority | Effort | Frontend blocked? |
|------|----------|--------|-------------------|
| B1: LanguageMeta on all endpoints | HIGH | Small (add 3 fields to 7 handlers) | No — frontend works with fallback, but UX improves |
| B2: Translation tables | MEDIUM | Large (schema + admin + API changes) | No — frontend shows Arabic with fallback notice |
| B3: Sitemap endpoint | LOW | Small (new read-only endpoint) | No — sitemap works with feed, just incomplete |
| B4: Fallback analytics | LOW | Small (new POST endpoint + table) | No — frontend logs to console for now |

**Recommended order:** B1 → B3 → B4 → B2

B1 is the quick win that immediately improves the multilingual UX. B2 is the long-term investment for real translated content.
