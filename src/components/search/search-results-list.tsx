"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { FeedItemDto } from "@/src/lib/api";

type SearchResultsListProps = {
  query: string;
  basePath: string;
  initialItems: FeedItemDto[];
  initialPage: number;
  pageSize: number;
  totalPages: number;
};

function formatDate(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ar-LB", {
    dateStyle: "medium",
  }).format(date);
}

export function SearchResultsList({
  query,
  basePath,
  initialItems,
  initialPage,
  pageSize,
  totalPages,
}: SearchResultsListProps) {
  const [items, setItems] = useState<FeedItemDto[]>(initialItems);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMore = currentPage < totalPages;

  const crawlablePages = useMemo(() => {
    if (totalPages <= 1) {
      return [] as number[];
    }

    const maxLinks = Math.min(totalPages, 12);
    return Array.from({ length: maxLinks }, (_, index) => index + 1);
  }, [totalPages]);

  async function handleLoadMore() {
    if (!hasMore || isLoading) {
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/search/articles?q=${encodeURIComponent(query)}&page=${nextPage}&limit=${pageSize}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to load search page");
      }

      const payload: { items: FeedItemDto[] } = await response.json();

      setItems((previousItems) => {
        const seenIds = new Set(previousItems.map((item) => item.id));
        const dedupedNewItems = payload.items.filter((item) => !seenIds.has(item.id));
        return [...previousItems, ...dedupedNewItems];
      });
      setCurrentPage(nextPage);
    } catch {
      setErrorMessage("تعذر تحميل المزيد الآن. حاول مرة أخرى بعد قليل.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!items.length) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-zinc-600">
        لا توجد نتائج مطابقة لعبارة البحث الحالية.
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
              <span>{item.sectionTitle}</span>
              <span>{formatDate(item.disdate)}</span>
            </div>

            <h2 className="text-xl font-semibold leading-8 text-zinc-900">
              <Link href={`/news/${item.slugId}`} className="hover:text-emerald-700">
                {item.title}
              </Link>
            </h2>

            {item.summary ? <p className="mt-3 text-sm leading-7 text-zinc-600">{item.summary}</p> : null}
          </article>
        ))}
      </section>

      {hasMore ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "جاري التحميل..." : "تحميل المزيد"}
          </button>
          {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
        </div>
      ) : null}

      {crawlablePages.length ? (
        <nav className="border-t border-zinc-200 pt-4" aria-label="صفحات نتائج البحث">
          <p className="mb-2 text-xs font-bold tracking-wide text-zinc-500">روابط النتائج</p>
          <div className="flex flex-wrap gap-2">
            {crawlablePages.map((page) => (
              <Link
                key={page}
                href={page === 1 ? basePath : `${basePath}&page=${page}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  page === currentPage
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                صفحة {page}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
