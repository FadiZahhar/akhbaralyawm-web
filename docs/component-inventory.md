# Component Inventory (Phase 1)

Date: 2026-03-30
Source: C:/inetpub/akhbaralyawm

## Shared Shell Components (from MasterPage.master)

### SiteHeader
Purpose:
- Top utility links and date/social context.
- Primary brand/logo rendering.

Candidate Next component:
- SiteHeader

### MainNav
Purpose:
- Primary navigation with active item logic and dropdowns.

Candidate Next component:
- MainNav

### SiteSearchBar
Purpose:
- Header search form currently posting to /search.

Candidate Next component:
- SiteSearchBar

### NewsTicker/Updates (conditional)
Purpose:
- Lightweight updates list shown outside specific pages.

Candidate Next component:
- NewsUpdatesTicker

### SiteFooter
Purpose:
- Footer columns and latest lists.

Candidate Next component:
- SiteFooter

## Public User Controls (_box*.ascx)

### _box0.ascx
Current role:
- Most read slider (top viewed in last 2 days).
Used in:
- Default.aspx, News.aspx, Author.aspx, Search.aspx, Read.aspx, Mix.aspx
Candidate Next component:
- MostReadCarousel
Data dependency:
- /v1/news.ashx or dedicated most-read endpoint (if added)

### _box1.ascx
Current role:
- Right sidebar ads + compact most-read list.
Used in:
- News.aspx, Author.aspx, Search.aspx, Read.aspx
Candidate Next component:
- SidebarRail
Subcomponents:
- AdSlotBlock
- MostReadCompactList

### _box10.ascx
Current role:
- Home hero zone:
  - updates column
  - featured slider
  - pinned short list
Used in:
- Default.aspx
Candidate Next components:
- HomeHeroGrid
- LiveUpdatesList
- FeaturedCarousel
- PinnedNewsList

### _box11.ascx
Current role:
- Section blocks (special section + local section cards).
Used in:
- Default.aspx
Candidate Next components:
- SectionCarouselBlock
- SectionCardGrid

### _box12.ascx
Current role:
- Authors/writers style section block.
Used in:
- Commented in Default.aspx currently (inactive)
Candidate Next component:
- WritersSectionBlock
Migration note:
- Keep optional behind feature flag until editorial confirms usage.

### _box13.ascx
Current role:
- Programs/video slider with youtube links.
Used in:
- Default.aspx
Candidate Next component:
- VideoProgramsCarousel

### _box14.ascx
Current role:
- Arabs and world section card grid.
Used in:
- Default.aspx
Candidate Next component:
- SectionPreviewGrid

### _box15.ascx
Current role:
- Misc section card grid (active part), older variant commented out.
Used in:
- Default.aspx
Candidate Next component:
- MiscSectionGrid

## Page Templates to Build in Next

### HomeTemplate
Legacy source:
- Default.aspx + _box10/_box11/_box13/_box14/_box15/_box0

### SectionListingTemplate
Legacy source:
- News.aspx
Reusable subparts:
- Top cards + paged list + sidebar rail

### ArticleTemplate
Legacy source:
- Newsdet.aspx
Reusable subparts:
- Metadata head
- Article media block
- Body renderer
- Related blocks/embeds
- Share actions

### AuthorListingTemplate
Legacy source:
- Author.aspx
Reusable subparts:
- SectionListingTemplate variant with author header

### SearchTemplate
Legacy source:
- Search.aspx
Reusable subparts:
- SectionListingTemplate variant with search header

### StaticReadTemplate
Legacy source:
- Read.aspx
Reusable subparts:
- Rich content renderer + sidebar rail

### MixedSectionsTemplate
Legacy source:
- Mix.aspx
Reusable subparts:
- Multi-section loop block

## Priority Order for Component Extraction
1. SiteHeader
2. MainNav
3. SiteFooter
4. HomeHeroGrid (_box10)
5. MostReadCarousel (_box0)
6. SidebarRail (_box1)
7. Section preview blocks (_box11, _box14, _box15)
8. VideoProgramsCarousel (_box13)

## Notes for Phase 3
- Remove inline SQL-bound assumptions and replace with API-driven props.
- Keep CSS class parity initially to speed visual matching.
- Convert legacy repeated card markup into reusable card primitives.
