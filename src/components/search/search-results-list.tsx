"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { FeedItemDto } from "@/src/lib/api";

type SearchResultsListProps = {
  locale: string;
  query: string;
  basePath: string;
  initialItems: FeedItemDto[];
  initialPage: number;
  pageSize: number;
  totalPages: number;
  dict: {
    loadMore: string;
    loading: string;
    loadError: string;
    noResults: string;
    resultLinks: string;
    page: string;
  };
};

export function SearchResultsList({
  locale,
  query,
  basePath,
  initialItems,
  initialPage,
  pageSize,
  totalPages,
  dict,
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

  function formatDate(value: string): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-LB" : locale, { dateStyle: "medium" }).format(date);
  }

  async function handleLoadMore() {
    if (!hasMore || isLoading) {
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/search/articles?q=${encodeURIComponent(query)}&page=${nextPage}&limit=${pageSize}&lang=${locale}`,
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
      setErrorMessage(dict.loadError);
    } finally {
      setIsLoading(false);
    }
  }

  if (!items.length) {
    return (
      <section className="rounded-sm border border-dashed border-[color:var(--border-soft)] bg-white px-6 py-10 text-center text-zinc-600">
        {dict.noResults}
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-sm border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_rgba(13,35,77,0.06)]">
            <div className="mb-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
              <span className="font-black uppercase tracking-[0.16em] text-[color:var(--accent)]">{item.sectionTitle}</span>
              <span>{formatDate(item.disdate)}</span>
            </div>

            <h2 className="text-xl font-black leading-8 text-[color:var(--ink)]">
              <Link href={`/${locale}/news/${item.slugId}`} className="transition hover:text-[color:var(--accent-strong)]">
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
            className="inline-flex h-11 items-center justify-center rounded-sm bg-[color:var(--accent)] px-6 text-sm font-black text-white transition hover:bg-[color:var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? dict.loading : dict.loadMore}
          </button>
          {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
        </div>
      ) : null}

      {crawlablePages.length ? (
        <nav className="border-t border-[color:var(--border-soft)] pt-4" aria-label={dict.resultLinks}>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{dict.resultLinks}</p>
          <div className="flex flex-wrap gap-2">
            {crawlablePages.map((page) => (
              <Link
                key={page}
                href={page === 1 ? basePath : `${basePath}&page=${page}`}
                className={`rounded-sm border px-3 py-1 text-xs font-extrabold transition ${
                  page === currentPage
                    ? "border-[color:var(--accent)] bg-[color:var(--panel)] text-[color:var(--accent-strong)]"
                    : "border-[color:var(--border-soft)] bg-white text-zinc-600 hover:border-[color:var(--accent)]"
                }`}
              >
                {dict.page} {page}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
