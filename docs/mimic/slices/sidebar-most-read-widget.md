# Slice 06 — Sidebar + Most-Read Widget

Date: 2026-03-31
Status: complete

## Scope
Add a reusable "الأكثر قراءة" (most-read) sidebar widget to five page templates,
converting them from single-column to 2-column layouts matching the legacy design pattern.

## Target Pages
- Home (enhance existing sidebar with shared MostReadWidget)
- Article (new 2-column: article + sidebar)
- Category (new 2-column: header+archive + sidebar)
- About (new 2-column: content + sidebar)
- Contact (new 2-column: content + sidebar)

## Components Created
- `src/components/sidebar/most-read-widget.tsx` — reusable numbered article list (top 5)
- `src/components/sidebar/page-sidebar.tsx` — sidebar shell wrapping the most-read widget

## Files Modified
- `src/components/home/home-sidebar.tsx` — replaced inline "سريع القراءة" section with shared MostReadWidget
- `app/news/[slugId]/page.tsx` — widened to max-w-6xl, added grid wrapper + PageSidebar
- `app/category/[slug]/page.tsx` — added grid wrapper + PageSidebar
- `app/about/page.tsx` — widened to max-w-6xl, added grid wrapper + PageSidebar, made async
- `app/contact/page.tsx` — widened to max-w-6xl, added grid wrapper + PageSidebar, made async

## Layout Pattern
```
lg:grid-cols-[minmax(0,1fr)_300px]
```
- Main content fills available space
- Sidebar fixed at 300px on desktop (lg breakpoint)
- Stacks to single column on tablet/mobile

## Data Source
- Uses `getHomeFeed(5)` for most-read articles (no dedicated "most read" API endpoint exists)
- Home page reuses existing feed data via the shared MostReadWidget component

## Validation
- ESLint: pass (0 errors, 0 warnings)
- TypeScript: pass (compiled successfully)
- Next.js build: pass (Turbopack, all routes compiled)
- IDE errors: none across all 7 files

## Evidence
- Screenshots: docs/visual-baseline/2026-03-31-012444/
  - article-desktop.png — sidebar visible with 5 numbered articles
  - category-desktop.png — sidebar visible alongside section header
  - about-desktop.png — sidebar visible alongside about content
  - contact-desktop.png — sidebar visible alongside contact content
  - home-desktop.png — existing sidebar now uses shared MostReadWidget

## Gap Closure
Addresses the #1 critical gap from the overlay scoring phase:
> "Right sidebar (most-read widget) missing on Home, Article, Category, About, Contact"

Status: **resolved** — all 5 target pages now have the "الأكثر قراءة" sidebar widget in a 2-column layout.
