"use client";

import Link from "next/link";
import { useState } from "react";

import type { FeedItemDto } from "@/src/lib/api";

type AuthorArchiveListProps = {
  locale: string;
  authorId: string;
  authorLink: string;
  initialItems: FeedItemDto[];
  initialPage: number;
  pageSize: number;
  totalPages: number;
  dict: {
    loadMore: string;
    loading: string;
    loadError: string;
    noAuthorArticles: string;
    archiveLinks: string;
    page: string;
  };
};

export function AuthorArchiveList({
  locale,
  authorId,
  authorLink,
  initialItems,
  initialPage,
  pageSize,
  totalPages,
  dict,
}: AuthorArchiveListProps) {
  const [items, setItems] = useState<FeedItemDto[]>(initialItems);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMore = currentPage < totalPages;

  async function handleLoadMore() {
    if (!hasMore || isLoading) {
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/author/articles?author=${encodeURIComponent(authorId)}&page=${nextPage}&limit=${pageSize}&lang=${locale}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to load more articles");
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
    return <p className="text-sm leading-8 text-zinc-600">{dict.noAuthorArticles}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-sm border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-4 py-4">
            <h3 className="text-lg font-black leading-8 text-[color:var(--ink)]">
              <Link href={`/${locale}/news/${item.slugId}`} className="transition hover:text-[color:var(--accent-strong)]">
                {item.title}
              </Link>
            </h3>
            {item.summary ? <p className="mt-2 text-sm leading-7 text-zinc-600">{item.summary}</p> : null}
          </article>
        ))}
      </div>

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

      {totalPages > 1 ? (
        <nav className="border-t border-[color:var(--border-soft)] pt-4" aria-label={dict.archiveLinks}>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{dict.archiveLinks}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-sm border border-[color:var(--accent)] bg-[color:var(--panel)] px-3 py-1 text-xs font-extrabold text-[color:var(--accent-strong)]"
              aria-current="page"
            >
              {dict.page} {currentPage}
            </span>
            <span className="text-xs font-extrabold text-zinc-500">/ {totalPages}</span>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
