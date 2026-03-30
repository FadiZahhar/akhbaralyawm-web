import type { Metadata } from "next";
import Link from "next/link";

import { searchArticlesPaginated } from "@/src/lib/api";
import { SearchResultsList } from "@/src/components/search/search-results-list";

type SearchValue = string | string[] | undefined;

type PageProps = {
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

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = readQuery(params.q);
  const page = parsePage(params.page);

  return {
    title: query ? `نتائج البحث عن ${query}` : "البحث",
    description: query ? `نتائج البحث عن ${query}` : "ابحث ضمن محتوى أخبار اليوم",
    alternates: {
      canonical: query
        ? page > 1
          ? `/search?q=${encodeURIComponent(query)}&page=${page}`
          : `/search?q=${encodeURIComponent(query)}`
        : "/search",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = readQuery(params.q);
  const page = parsePage(params.page);
  const pageSize = getSearchPageSize();
  const feed = query ? await searchArticlesPaginated(query, page, pageSize) : null;
  const basePath = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
  const totalPages = feed?.pagination?.totalPages ?? 1;
  const hasPrev = query && page > 1;
  const hasNext = query && page < totalPages;
  const prevHref = page - 1 <= 1 ? basePath : `${basePath}&page=${page - 1}`;
  const nextHref = `${basePath}&page=${page + 1}`;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium text-emerald-700">البحث</p>
        <h1 className="text-3xl font-bold text-zinc-900">
          {query ? `نتائج البحث عن: ${query}` : "ابحث في الموقع"}
        </h1>
        <p className="text-sm leading-7 text-zinc-600">
          {query
            ? `يعرض البحث النتائج لعبارة ${query} مع دعم التصفح على صفحات متعددة.`
            : "استخدم قيمة q في الرابط مثل /search?q=لبنان لعرض النتائج."}
        </p>
        {(hasPrev || hasNext) ? (
          <nav className="flex flex-wrap items-center gap-3 text-sm" aria-label="تنقل صفحات نتائج البحث">
            {hasPrev ? (
              <Link
                href={prevHref}
                className="rounded-full border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition hover:border-zinc-400"
              >
                الصفحة السابقة
              </Link>
            ) : null}
            {hasNext ? (
              <Link
                href={nextHref}
                className="rounded-full border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition hover:border-zinc-400"
              >
                الصفحة التالية
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
        <section className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-zinc-600">
          أضف قيمة البحث إلى الرابط ثم أعد المحاولة.
        </section>
      )}
    </main>
  );
}