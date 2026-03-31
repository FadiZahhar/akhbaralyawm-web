import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = 'force-dynamic';

import { searchArticlesPaginated } from "@/src/lib/api";
import { SearchResultsList } from "@/src/components/search/search-results-list";
import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

type SearchValue = string | string[] | undefined;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: SearchValue;
    page?: SearchValue;
  }>;
};

const DEFAULT_SEARCH_PAGE_SIZE = 12;

function readQuery(value: SearchValue): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function parsePage(value: SearchValue): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function getSearchPageSize(): number {
  const rawValue = process.env.SEARCH_PAGE_SIZE;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : DEFAULT_SEARCH_PAGE_SIZE;

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return DEFAULT_SEARCH_PAGE_SIZE;
  }

  return Math.min(parsedValue, 50);
}

export async function generateMetadata({ params: paramsPromise, searchParams }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await paramsPromise;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);
  const params = await searchParams;
  const query = readQuery(params.q);
  const page = parsePage(params.page);

  return {
    title: query ? `${dict.search.resultsFor} ${query}` : dict.search.title,
    description: query ? `${dict.search.resultsFor} ${query}` : dict.search.placeholder,
    alternates: {
      canonical: query
        ? page > 1
          ? `/${locale}/search?q=${encodeURIComponent(query)}&page=${page}`
          : `/${locale}/search?q=${encodeURIComponent(query)}`
        : `/${locale}/search`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ params: paramsPromise, searchParams }: PageProps) {
  const { locale: rawLocale } = await paramsPromise;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);
  const params = await searchParams;
  const query = readQuery(params.q);
  const page = parsePage(params.page);
  const pageSize = getSearchPageSize();
  const feed = query ? await searchArticlesPaginated(query, page, pageSize, locale) : null;
  const basePath = query ? `/${locale}/search?q=${encodeURIComponent(query)}` : `/${locale}/search`;
  const totalPages = feed?.pagination?.totalPages ?? 1;
  const hasPrev = query && page > 1;
  const hasNext = query && page < totalPages;
  const prevHref = page - 1 <= 1 ? basePath : `${basePath}&page=${page - 1}`;
  const nextHref = `${basePath}&page=${page + 1}`;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3 rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">Search</p>
        <h1 className="text-[1.95rem] font-black text-[color:var(--ink)]">
          {query ? `${dict.search.resultsFor}: ${query}` : dict.search.placeholder}
        </h1>
        <p className="text-sm leading-8 text-zinc-600">
          {query
            ? `يعرض البحث النتائج لعبارة ${query} مع دعم التصفح على صفحات متعددة.`
            : "استخدم قيمة q في الرابط مثل /search?q=لبنان لعرض النتائج."}
        </p>
        {(hasPrev || hasNext) ? (
          <nav className="flex flex-wrap items-center gap-2.5 border-t border-[color:var(--border-soft)] pt-4 text-sm" aria-label="pagination">
            {hasPrev ? (
              <Link
                href={prevHref}
                className="rounded-sm border border-[color:var(--border-soft)] bg-white px-4 py-2 font-extrabold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
              >
                {dict.common.prevPage}
              </Link>
            ) : null}
            {hasNext ? (
              <Link
                href={nextHref}
                className="rounded-sm border border-[color:var(--border-soft)] bg-white px-4 py-2 font-extrabold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
              >
                {dict.common.nextPage}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </header>

      {query ? (
        <SearchResultsList
          query={query}
          basePath={basePath}
          initialItems={feed?.items ?? []}
          initialPage={page}
          pageSize={pageSize}
          totalPages={totalPages}
        />
      ) : (
        <section className="rounded-sm border border-dashed border-[color:var(--border-soft)] bg-white px-6 py-10 text-center text-zinc-600">
          {dict.search.noResults}
        </section>
      )}
    </main>
  );
}