# AkhbarAlyawm Web (Next.js) — Copilot Plan

Repo: `FadiZahhar/akhbaralyawm-web`  
Stack: Next.js (App Router) + TypeScript + Tailwind  
Language: Arabic RTL

## Environment
- `API_BASE_URL=https://api.akhbaralyawm.com`
- `NEXT_PUBLIC_ASSET_HOST=https://www.akhbaralyawm.com`
- `AKHBAR_PREVIEW_SHARED_SECRET=...` (server-only; never expose to client)

## Canonical SEO routing
Canonical article URL:
- `/news/{slug}-{id}` (example: `/news/عنوان-الخبر-530553`)

Rules:
- Parse `id` as trailing digits after the last `-`
- Fetch article by id from API
- If requested `slugId` != `article.slugId`, redirect to `/news/{article.slugId}`

## API (MVP)
Public:
- `GET /v1/article/by-id.ashx?id={id}`

Preview:
- `POST /v1/preview/token.ashx` with header `X-Akhbar-Preview-Secret`
- `GET /v1/preview/article/by-id.ashx?id={id}&token={token}`

ArticleDto expected JSON:
- `id, title, slugId, sectionId, sectionTitle, sectionLink, photoPath, bodyHtml, disdate, statusId`
Photo is relative: `/upload/...` and must be rendered with:
`NEXT_PUBLIC_ASSET_HOST + photoPath`

## Implementation order
1) `app/layout.tsx` => `<html lang="ar" dir="rtl">`
2) `src/lib/api.ts` => typed fetchers + image URL helper
3) `app/news/[slugId]/page.tsx` => parse id, fetch, render, canonical redirect
4) `app/api/preview/route.ts` => mint preview token (server), store HttpOnly cookie `previewToken`, redirect
5) `app/api/preview/exit/route.ts` => clear preview cookie