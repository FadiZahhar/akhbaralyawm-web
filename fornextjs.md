# Copilot Prompt for Next.js Multilanguage Integration

Use this prompt in the Next.js frontend repository.

## Prompt
You are working in the Akhbar Al Youm Next.js project.

Your task is to implement production-grade multilingual consumption of the legacy backend API under `/v1`, with these locales:

- Arabic (`ar`) as default
- English (`en`)
- French (`fr`)

Important backend constraints:

1. The backend currently stores core content in Arabic in single fields (no translation tables in current schema).
2. API now accepts language request hints via:
   - query string: `?lang=ar|en|fr`
   - header: `Accept-Language`
3. API returns fallback metadata:
   - `requestedLanguage`
   - `contentLanguage`
   - `fallbackUsed`
4. If English/French content is not available, backend returns Arabic with `fallbackUsed=true`.

Your implementation must support full i18n UX while gracefully handling backend fallback.

## Backend Endpoints to Use

Primary CMS page endpoint:

- `GET /v1/pages/by-id.ashx?id={id}&lang={locale}`

Example response:

```json
{
  "id": 1,
  "title": "من نحن",
  "slugId": "1",
  "bodyHtml": "<p>...</p>",
  "updatedAt": "2026-03-31T08:00:00Z",
  "requestedLanguage": "en",
  "contentLanguage": "ar",
  "fallbackUsed": true
}
```

News endpoints (also language-aware with fallback metadata):

- `GET /v1/news.ashx?...&lang={locale}`
- `GET /v1/news.ashx?id={id}&lang={locale}`

## Implementation Requirements

1. Configure i18n routing in Next.js with locales `ar`, `en`, `fr` and default locale `ar`.
2. Build one API client layer used by all pages/server actions.
3. Always pass locale to backend using both:
   - `lang` query param
   - `Accept-Language` header
4. Parse and preserve fallback metadata from backend responses.
5. Render fallback indicator when `fallbackUsed=true` for non-default locale.
6. Keep page route `/read/[id]` working for all locales.
7. Use SSR (or server components fetch) for SEO-critical content.
8. Add robust error handling for 400/404/500 backend responses.
9. Add caching/revalidation strategy suitable for content pages.
10. Keep implementation typed with strict TypeScript interfaces.

## Best Practices to Apply

1. Single API wrapper:
   - Centralize base URL, headers, timeout, retries, and error normalization.
2. Locale contract:
   - Never hardcode Arabic in UI; derive from current Next.js locale.
3. Fallback UX:
   - When `requestedLanguage !== contentLanguage`, show subtle notice:
     - Example: "This article is currently available in Arabic."
4. Direction handling:
   - `ar` should use RTL.
   - `en` and `fr` should use LTR.
5. HTML safety:
   - For `bodyHtml`, sanitize with a trusted allowlist before rendering.
6. Observability:
   - Log fallback rate (`fallbackUsed`) by locale to track translation gaps.
7. Revalidation:
   - Use incremental revalidation for content pages (e.g. 60 to 300 seconds).
8. Typed errors:
   - Convert backend error payloads to app-level typed errors.

## Suggested TypeScript Contracts

```ts
export type Locale = "ar" | "en" | "fr";

export interface LanguageMeta {
  requestedLanguage: Locale;
  contentLanguage: Locale;
  fallbackUsed: boolean;
}

export interface PageByIdDto extends LanguageMeta {
  id: number;
  title: string;
  slugId: string;
  bodyHtml: string;
  updatedAt: string;
}

export interface NewsListDto extends LanguageMeta {
  data: Array<{
    id: number;
    title: string;
    smallbody: string | null;
    photo: string | null;
    tag: string | null;
    disdate: string;
    section_title: string | null;
    section_link: string | null;
    slug: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

## Suggested API Client Behavior

For every request:

1. Add `lang` query param from current locale.
2. Set header: `Accept-Language: <locale>`.
3. Set timeout and retry only for idempotent GET.
4. Normalize backend errors to `NotFound`, `BadRequest`, `ServerError`.

## `/read/[id]` Page Requirements

1. Load page using server-side request with locale.
2. If 404, return Next.js notFound.
3. If 400, show a bad request page.
4. If 500, show retry-friendly error UI.
5. Render fallback notice if `fallbackUsed=true` and locale is `en` or `fr`.
6. Set metadata/title from API response.

## Acceptance Criteria

1. `/{locale}/read/{id}` works for `ar`, `en`, `fr`.
2. API requests include `lang` and `Accept-Language`.
3. Arabic is default locale and default content fallback.
4. Fallback notice appears correctly when backend falls back.
5. No duplicated API-call logic across pages.
6. Strict TypeScript passes.
7. SEO content pages are server-rendered/revalidated.

## Manual Verification Checklist

1. Open:
   - `/ar/read/1`
   - `/en/read/1`
   - `/fr/read/1`
2. Inspect network request:
   - URL contains `lang=<locale>`
   - Header contains `Accept-Language`
3. Confirm fallback metadata handling:
   - `requestedLanguage` reflects selected locale
   - `contentLanguage` shows actual language
   - `fallbackUsed` toggles notice
4. Confirm proper direction:
   - Arabic pages render RTL
   - English/French pages render LTR

## What to Return When Done

1. Files changed in Next.js project.
2. API client implementation summary.
3. `/read/[id]` multilingual behavior summary.
4. Example fallback UI behavior.
5. Any remaining risks or follow-up items.
