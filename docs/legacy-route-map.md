# Legacy Route Map (Phase 1)

Date: 2026-03-30
Source: C:/inetpub/akhbaralyawm

## Scope
This map covers public-facing Web Forms routes and rewrite aliases that must be migrated to Next.js.
Backoffice/admin paths under backoffice20prod20adm are excluded from this frontend migration wave.

## Public Entry Files (Root)
- Default.aspx
- News.aspx
- Newsdet.aspx
- Search.aspx
- Author.aspx
- Read.aspx
- Mix.aspx
- js.aspx (utility)
- main1.aspx and main2019.aspx (legacy/alternate entry)

## IIS Rewrite Rules (Observed)
From legacy Web.config, public URL patterns are:
- /category/{idOrLink} -> news.aspx?id={idOrLink}
- /news/{id} -> newsdet.aspx?id={id}
- /news/{id}/{slug} -> newsdet.aspx?id={id}
- /author/{idOrLink} -> author.aspx?id={idOrLink}
- /read/{id} -> read.aspx?id={id}
- /tag/{term} -> search.aspx?id={term}
- /search -> search.aspx
- /mix -> mix.aspx
- /about and /about-us -> read.aspx?id=1
- /contact and /contact-us -> read.aspx?id=2

## Legacy to Next.js Target Mapping

### Home
- Legacy: / and /Default.aspx
- Source files:
  - Default.aspx
  - _box10.ascx, _box11.ascx, _box13.ascx, _box14.ascx, _box15.ascx, _box0.ascx
- Next target:
  - / (app/page.tsx)
- Data source target:
  - /v1/home/feed.ashx and section/article APIs

### Article Details
- Legacy:
  - /news/{id}
  - /news/{id}/{slug}
  - /Newsdet.aspx?id={id}
- Source files:
  - Newsdet.aspx
  - Newsdet.aspx.vb
- Next target:
  - /news/{slugId} where slugId ends with -{id}
  - Existing route: app/news/[slugId]/page.tsx
- Notes:
  - Legacy route accepts numeric id and optional slug segment.
  - Next should enforce canonical slugId and redirect non-canonical requests.

### Section/Category Listing
- Legacy:
  - /category/{idOrLink}
  - /News.aspx?id={idOrLink}
- Source files:
  - News.aspx
  - News.aspx.vb
- Next target:
  - /category/{slugOrId}
- Notes:
  - Legacy uses stored proc Get_Category with paging (page size 7).
  - Includes infinite scroll via WebMethod News.aspx/GetCustomers.

### Author Listing
- Legacy:
  - /author/{idOrLink}
  - /Author.aspx?id={idOrLink}
- Source files:
  - Author.aspx
  - Author.aspx.vb
- Next target:
  - /author/{slugOrId}
- Notes:
  - Legacy uses stored proc Get_Author with paging (page size 7).
  - Includes infinite scroll via WebMethod Author.aspx/GetCustomers.

### Search/Tag Results
- Legacy:
  - /tag/{term}
  - /search
  - /Search.aspx?id={term}
- Source files:
  - Search.aspx
  - Search.aspx.vb
- Next target:
  - /search?q={term}
  - optional compatibility alias /tag/{term}
- Notes:
  - Legacy uses query key id for search term.
  - SQL filters title/body/tag by same term.

### Static/Editorial Page
- Legacy:
  - /read/{id}
  - /about, /about-us, /contact, /contact-us
  - /Read.aspx?id={id}
- Source files:
  - Read.aspx
  - Read.aspx.vb
- Next target:
  - /read/{id} (or migrated clean slugs later)
  - /about, /contact as static aliases to canonical content routes
- Notes:
  - Content comes from TBS_Pages table by id.

### Mixed Sections Hub
- Legacy:
  - /mix
  - /Mix.aspx
- Source files:
  - Mix.aspx
  - Mix.aspx.vb
- Next target:
  - /mix
- Notes:
  - Aggregates sections with ids 68, 80, 58.

## Shared Layout Dependencies
- Master shell file: MasterPage.master
- Shared elements found:
  - Header top bar and nav menu
  - Logo variants and menu state logic
  - Search form
  - Optional news updates block on non-article pages
  - Footer with latest lists and links
  - Global scripts for analytics, pixel, push

## Route Risk Notes
- Legacy URLs still permit raw aspx endpoints; Next cutover needs explicit redirects.
- Legacy article URLs may contain numeric id without slug; preserve compatibility redirect.
- Search currently uses id key; Next should normalize to q while supporting old format.

## Phase 1 Acceptance
- Public routes identified and mapped: complete.
- Rewrite aliases captured: complete.
- Next target routes defined for all major page types: complete.
