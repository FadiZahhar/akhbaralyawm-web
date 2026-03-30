# SEO Checklist

Date: 2026-03-30
Phase: 7

## Canonical Routing
- Article canonical is /news/{slug}-{id}.
- Legacy article variants redirect to canonical URL.
- Category canonical uses /category/{slug}.
- Author canonical uses /author/{slug}.
- /about and /contact are canonical static routes.
- Category/search paginated pages keep canonical with ?page={n} for n > 1.

## Redirect Validation
- Default.aspx redirects to /
- Newsdet.aspx?id={id} redirects to /news/{canonical}
- News.aspx?id={x} redirects to /category/{x}
- Author.aspx?id={x} redirects to /author/{x}
- Search.aspx?id={q} redirects to /search?q={q}
- tag/{term} redirects to /search?q={term}
- Mix.aspx redirects to /mix
- Read.aspx?id=1,2 redirect to /about,/contact

## Metadata
- Every indexable page sets title and description.
- Canonical link present and matches intended route.
- Open Graph metadata exists for article pages.
- Twitter card metadata exists on article pages.

## Structured Data
- Organization and WebSite schema present globally.
- NewsArticle schema present on article pages.
- BreadcrumbList schema present on article and category pages.
- CollectionPage schema present on category pages.

## Robots and Sitemap
- robots.txt is generated and reachable.
- sitemap.xml is generated and reachable.
- sitemap includes core static routes.
- sitemap includes category routes.
- sitemap includes article URLs.

## Indexing Policy
- Search route is noindex, follow.
- API routes are disallowed in robots.
- Preview routes are not indexable.

## Internal Linking
- No internal links to .aspx endpoints.
- Header and footer links point to canonical routes.
- Card/story links point to canonical article URLs.
- Category and search pages expose crawlable links to page 2+.
- Category/search page 2+ expose a previous-page link back to prior pages.

## Pagination Schema
- Category CollectionPage ItemList positions continue across pages.
- Page 2 first ItemList position should be > 1.

## Performance and UX Signals
- Largest contentful elements load without major delay.
- No major layout shifts for above-the-fold media.
- Mobile readability and tap targets are acceptable.

## Verification Tools
- Manual route tests using browser and curl.
- Lighthouse SEO and Performance categories.
- Rich Results test for schema validation.
- Search Console URL inspection (post-deploy).
- Automated pagination check command:
	- npm run seo:pagination-check
	- Optional args: --base, --category, --search, --query

## Sign-off
- Environment:
- Date:
- SEO owner:
- Blocking issues:
