import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

export const revalidate = 120;

import { getArticlesBySection, getHomeFeed, getSectionBySlugOrId } from "@/src/lib/api";
import { CategoryArchiveList } from "@/src/components/category/category-archive-list";
import { PageSidebar } from "@/src/components/sidebar/page-sidebar";
import { isLocale, type Locale } from "@/src/lib/i18n";

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
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const { page: rawPage } = await searchParams;
  const page = parsePageValue(rawPage);
  const section = await getSectionBySlugOrId(slug, locale);

  if (!section) {
    return {
      title: locale === "ar" ? "القسم غير موجود" : "Section not found",
    };
  }

  return {
    title: section.title,
    description: locale === "ar" ? `آخر الأخبار ضمن قسم ${section.title}` : `Latest news in ${section.title}`,
    alternates: {
      canonical: page > 1 ? `/${locale}/category/${section.link}?page=${page}` : `/${locale}/category/${section.link}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const { page: rawPage } = await searchParams;
  const page = parsePageValue(rawPage);
  const pageSize = getCategoryArchivePageSize();
  const section = await getSectionBySlugOrId(slug, locale);

  if (!section) {
    notFound();
  }

  if (slug !== section.link) {
    permanentRedirect(`/${locale}/category/${section.link}`);
  }

  const feed = await getArticlesBySection(section.link, page, pageSize, locale);
  const mostRead = await getHomeFeed(5, locale);
  const categoryPath = `/${locale}/category/${section.link}`;
  const categoryUrl = absoluteUrl(page > 1 ? `${categoryPath}?page=${page}` : categoryPath);
  const totalPages = feed.pagination?.totalPages ?? 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const prevHref = page - 1 <= 1 ? categoryPath : `${categoryPath}?page=${page - 1}`;
  const nextHref = `${categoryPath}?page=${page + 1}`;
  const itemPositionStart = ((page - 1) * (feed.pagination?.limit ?? pageSize)) + 1;
  const prevLabel = locale === "ar" ? "الصفحة السابقة" : locale === "fr" ? "Page précédente" : "Previous page";
  const nextLabel = locale === "ar" ? "الصفحة التالية" : locale === "fr" ? "Page suivante" : "Next page";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "ar" ? "الرئيسية" : "Home",
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
      <header className="space-y-3 rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">Section</p>
        <h1 className="text-[1.95rem] font-black text-[color:var(--ink)]">{section.title}</h1>
        <p className="max-w-3xl text-sm leading-8 text-zinc-600">
          {feed.pagination
            ? (locale === "ar" ? `يعرض هذا القسم ${feed.pagination.total} مادة منشورة حتى الآن.` : `This section shows ${feed.pagination.total} published articles.`)
            : (locale === "ar" ? "أحدث المواد المنشورة ضمن هذا القسم." : "Latest articles in this section.")}
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
        sectionLink={section.link}
        sectionTitle={section.title}
        basePath={categoryPath}
        initialItems={feed.items}
        initialPage={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />
      </div>
      <PageSidebar mostRead={mostRead} />
      </div>
    </main>
  );
}
