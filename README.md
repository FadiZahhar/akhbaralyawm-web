# Akhbar Al Youm Web

Next.js App Router frontend for the Akhbar Al Youm migration from legacy ASP.NET Web Forms.

## Requirements

- Node.js 20+
- npm 10+

## Environment

Create and configure local environment values using:

- [env.example](env.example)
- [.env.local](.env.local)

Key variables:

- API_BASE_URL
- NEXT_PUBLIC_ASSET_HOST
- NEXT_PUBLIC_SITE_URL
- AKHBAR_PREVIEW_SHARED_SECRET
- API_CMS_PAGE_PATH
- API_AUTHOR_ARTICLES_PATH
- API_AUTHOR_QUERY_KEY
- AUTHOR_ARCHIVE_PAGE_SIZE
- CATEGORY_ARCHIVE_PAGE_SIZE
- SEARCH_PAGE_SIZE

## Development

```bash
npm run dev
```

App runs on http://localhost:3000.

## Quality Checks

```bash
npm run lint
npm run build
```

## SEO Pagination Validation

Run the automated checker against a running deployment:

```bash
npm run seo:pagination-check -- --base http://localhost:3000
```

Optional arguments:

- --category /category/{slug}
- --search /search?q={term}
- --query {term}

## Runbooks

- [Go-live runbook](docs/go-live-runbook.md)
- [Rollback runbook](docs/rollback-runbook.md)
- [SEO checklist](docs/seo-checklist.md)

## Notes

- Search pages are intentionally noindex,follow.
- Category, author, and search archives use SSR pagination with load-more UX and crawlable page links.
