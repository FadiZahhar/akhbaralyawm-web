import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

export const revalidate = 120;

import { getArticlesBySection, getAssetUrl, getHomeFeed, getSectionBySlugOrId } from "@/src/lib/api";
import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { FallbackNotice } from "@/src/components/fallback-notice";
import { CategoryArchiveList } from "@/src/components/category/category-archive-list";
import { MostReadSlider } from "@/src/components/home/most-read-slider";
import { PageSidebar } from "@/src/components/sidebar/page-sidebar";
import { isLocale, getDictionary, getOgLocale, type Locale } from "@/src/lib/i18n";

type PageParams = {
  locale: string;
  slug: string;
};

type PageProps = {
  params: Promise<PageParams>;
  searchParams: Promise<{
    page?: string;
  }>;
};

const DEFAULT_CATEGORY_ARCHIVE_PAGE_SIZE = 12;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.akhbaralyawm.com").replace(/\/+$/, "");

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

function getCategoryArchivePageSize(): number {
  const rawValue = process.env.CATEGORY_ARCHIVE_PAGE_SIZE;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : DEFAULT_CATEGORY_ARCHIVE_PAGE_SIZE;

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return DEFAULT_CATEGORY_ARCHIVE_PAGE_SIZE;
  }

  return Math.min(parsedValue, 50);
}

function parsePageValue(rawPage: string | undefined): number {
  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;
  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug: rawSlug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const slug = decodeURIComponent(rawSlug);
  const { page: rawPage } = await searchParams;
  const page = parsePageValue(rawPage);
  const metaDict = await getDictionary(locale);
  const section = await getSectionBySlugOrId(slug, locale);

  if (!section) {
    return {
      title: metaDict.category.notFound,
    };
  }

  const categoryBase = `/${locale}/category/${section.slug}`;
  const feed = await getArticlesBySection(section.link, page, getCategoryArchivePageSize(), locale);
  const totalPages = feed.pagination?.totalPages ?? 1;

  return {
    title: page > 1 ? `${section.title} — ${metaDict.archive.page} ${page}` : section.title,
    description: metaDict.category.totalArticles.replace("{count}", section.title),
    alternates: {
      canonical: page > 1 ? `${categoryBase}?page=${page}` : categoryBase,
    },
    openGraph: { locale: getOgLocale(locale) },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale, slug: rawSlug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const slug = decodeURIComponent(rawSlug);
  const { page: rawPage } = await searchParams;
  const page = parsePageValue(rawPage);
  const pageSize = getCategoryArchivePageSize();
  const section = await getSectionBySlugOrId(slug, locale);

  if (!section) {
    notFound();
  }

  if (slug !== section.slug) {
    permanentRedirect(`/${locale}/category/${section.slug}`);
  }

  const dict = await getDictionary(locale);
  const feed = await getArticlesBySection(section.link, page, pageSize, locale);
  const mostRead = await getHomeFeed(5, locale);
  const categoryPath = `/${locale}/category/${section.slug}`;
  const categoryUrl = absoluteUrl(page > 1 ? `${categoryPath}?page=${page}` : categoryPath);
  const totalPages = feed.pagination?.totalPages ?? 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const prevHref = page - 1 <= 1 ? categoryPath : `${categoryPath}?page=${page - 1}`;
  const nextHref = `${categoryPath}?page=${page + 1}`;
  const itemPositionStart = ((page - 1) * (feed.pagination?.limit ?? pageSize)) + 1;
  const prevLabel = dict.common.prevPage;
  const nextLabel = dict.common.nextPage;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: dict.nav.home,
        item: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: section.title,
        item: categoryUrl,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: section.title,
    url: categoryUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: feed.items.map((item, index) => ({
        "@type": "ListItem",
        position: itemPositionStart + index,
        url: absoluteUrl(`/${locale}/news/${item.slugId}`),
        name: item.title,
      })),
    },
  };

  return (
    <>
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      {hasPrev ? <link rel="prev" href={prevHref} /> : null}
      {hasNext ? <link rel="next" href={nextHref} /> : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
      <Breadcrumbs items={[
        { label: dict.nav.home, href: `/${locale}` },
        { label: section.title },
      ]} />
      <FallbackNotice langMeta={feed.langMeta} locale={locale} message={dict.fallback.notice} />
      <header className="space-y-3 rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">{dict.category.label}</p>
        <h1 className="text-[1.95rem] font-black text-[color:var(--ink)]">{section.title}</h1>
        <p className="max-w-3xl text-sm leading-8 text-zinc-600">
          {feed.pagination
            ? dict.category.totalArticles.replace("{count}", String(feed.pagination.total))
            : dict.category.latestArticles}
        </p>
        {(hasPrev || hasNext) ? (
          <nav className="flex flex-wrap items-center gap-2.5 border-t border-[color:var(--border-soft)] pt-4 text-sm" aria-label="pagination">
            {hasPrev ? (
              <Link
                href={prevHref}
                className="rounded-sm border border-[color:var(--border-soft)] bg-white px-4 py-2 font-extrabold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
              >
                {prevLabel}
              </Link>
            ) : null}
            {hasNext ? (
              <Link
                href={nextHref}
                className="rounded-sm border border-[color:var(--border-soft)] bg-white px-4 py-2 font-extrabold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
              >
                {nextLabel}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </header>

      <CategoryArchiveList
        locale={locale}
        sectionLink={section.link}
        sectionTitle={section.title}
        basePath={categoryPath}
        initialItems={feed.items}
        initialPage={page}
        pageSize={pageSize}
        totalPages={totalPages}
        dict={{
          loadMore: dict.archive.loadMore,
          loading: dict.archive.loading,
          loadError: dict.archive.loadError,
          noArticles: dict.archive.noArticles,
          archiveLinks: dict.archive.archiveLinks,
          page: dict.archive.page,
        }}
      />
      </div>
      <PageSidebar locale={locale} label={dict.sidebar.mostRead} mostRead={mostRead} />
      </div>
    </main>
    <MostReadSlider
      label={dict.sidebar.mostRead}
      items={mostRead.map((item) => ({
        id: item.id,
        slugId: item.slugId,
        title: item.title,
        imageUrl: getAssetUrl(item.photoPath),
        locale,
      }))}
    />
    </>
  );
}
