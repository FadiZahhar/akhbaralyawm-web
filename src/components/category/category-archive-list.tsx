"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { getAssetUrl, type FeedItemDto } from "@/src/lib/api";

type CategoryArchiveListProps = {
  locale: string;
  sectionLink: string;
  sectionTitle: string;
  basePath: string;
  initialItems: FeedItemDto[];
  initialPage: number;
  pageSize: number;
  totalPages: number;
  dict: {
    loadMore: string;
    loading: string;
    loadError: string;
    noArticles: string;
    archiveLinks: string;
    page: string;
  };
};

/** Build a windowed page list for the crawlable pagination nav.
 * Always shows first page, last page, current page ±2, with ellipsis gaps.
 * Returns at most ~11 entries (numbers + null for gaps).
 */
function buildPageWindow(current: number, total: number): (number | null)[] {
  if (total <= 1) return [];
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null);
    result.push(sorted[i]);
  }
  return result;
}

export function CategoryArchiveList({
  locale,
  sectionLink,
  sectionTitle,
  basePath,
  initialItems,
  initialPage,
  pageSize,
  totalPages: initialTotalPages,
  dict,
}: CategoryArchiveListProps) {
  const [items, setItems] = useState<FeedItemDto[]>(initialItems);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reachedEnd, setReachedEnd] = useState(initialPage >= initialTotalPages);

  const hasMore = !reachedEnd && currentPage < totalPages;

  const pageWindow = useMemo(
    () => buildPageWindow(currentPage, totalPages),
    [currentPage, totalPages],
  );

  function formatDate(value: string): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-LB" : locale, { dateStyle: "medium" }).format(date);
  }

  async function handleLoadMore() {
    if (!hasMore || isLoading) return;

    const nextPage = currentPage + 1;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/category/articles?section=${encodeURIComponent(sectionLink)}&page=${nextPage}&limit=${pageSize}&lang=${locale}`,
        { cache: "no-store" },
      );

      if (!response.ok) throw new Error("Failed to load");

      const payload: { items: FeedItemDto[]; pagination: { page: number; totalPages: number } | null } =
        await response.json();

      const newPage = payload.pagination?.page ?? nextPage;
      const serverTotalPages = payload.pagination?.totalPages ?? totalPages;

      setItems((prev) => {
        const seenIds = new Set(prev.map((item) => item.id));
        return [...prev, ...payload.items.filter((item) => !seenIds.has(item.id))];
      });
      setCurrentPage(newPage);
      setTotalPages(serverTotalPages);

      if (newPage >= serverTotalPages || payload.items.length === 0) {
        setReachedEnd(true);
      }

      // Update URL so the user can share or bookmark the loaded state,
      // and search engines following <link rel="next"> can index deeper pages.
      if (typeof window !== "undefined") {
        const newUrl = newPage === 1 ? basePath : `${basePath}?page=${newPage}`;
        window.history.replaceState(null, "", newUrl);
      }
    } catch {
      setErrorMessage(dict.loadError);
    } finally {
      setIsLoading(false);
    }
  }

  if (!items.length) {
    return (
      <section className="rounded-sm border border-dashed border-[color:var(--border-soft)] bg-white px-6 py-10 text-center text-zinc-600">
        {dict.noArticles}
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const imageUrl = getAssetUrl(item.photoPath);

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-sm border border-[color:var(--border-soft)] bg-white shadow-[0_12px_30px_rgba(13,35,77,0.06)]"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  width={1200}
                  height={675}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2NzUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIj48c3RvcCBzdG9wLWNvbG9yPSIjZTJlNWVjIiBvZmZzZXQ9IjIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiNmMGYyZjUiIG9mZnNldD0iNTAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI2UyZTVlYyIgb2Zmc2V0PSI4MCUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2NzUiIGZpbGw9IiNlMmU1ZWMiLz48L3N2Zz4="
                  className="aspect-[16/10] w-full bg-zinc-100 object-cover"
                />
              ) : (
                <div className="aspect-[16/10] w-full bg-zinc-100" />
              )}

              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-4 text-xs text-zinc-500">
                  <span className="font-black uppercase tracking-[0.16em] text-[color:var(--accent)]">
                    {item.sectionTitle || sectionTitle}
                  </span>
                  <span>{formatDate(item.disdate)}</span>
                </div>

                <h2 className="text-lg font-black leading-8 text-[color:var(--ink)]">
                  <Link
                    href={`/${locale}/news/${item.slugId}`}
                    className="transition hover:text-[color:var(--accent-strong)]"
                  >
                    {item.title}
                  </Link>
                </h2>

                {item.summary ? (
                  <p className="line-clamp-3 text-sm leading-7 text-zinc-600">{item.summary}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>

      {/* Load More / end state */}
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
      ) : reachedEnd && items.length > pageSize ? (
        <p className="text-center text-sm text-zinc-500">{dict.noArticles}</p>
      ) : null}

      {/* SEO-crawlable pagination nav — windowed around current page so Googlebot
          can discover and index every page via <a href> links, while keeping the
          UI compact. The server renders page 1 (or whatever ?page= you opened),
          and this nav always includes page 1 and the last page so crawlers can
          fan out to all depths. */}
      {pageWindow.length ? (
        <nav className="border-t border-[color:var(--border-soft)] pt-4" aria-label={dict.archiveLinks}>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{dict.archiveLinks}</p>
          <div className="flex flex-wrap gap-2">
            {pageWindow.map((page, idx) =>
              page === null ? (
                <span
                  key={`gap-${idx}`}
                  className="flex items-end px-1 text-xs text-zinc-400"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <Link
                  key={page}
                  href={page === 1 ? basePath : `${basePath}?page=${page}`}
                  className={`rounded-sm border px-3 py-1 text-xs font-extrabold transition ${
                    page === currentPage
                      ? "border-[color:var(--accent)] bg-[color:var(--panel)] text-[color:var(--accent-strong)]"
                      : "border-[color:var(--border-soft)] bg-white text-zinc-600 hover:border-[color:var(--accent)]"
                  }`}
                >
                  {dict.page} {page}
                </Link>
              ),
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
