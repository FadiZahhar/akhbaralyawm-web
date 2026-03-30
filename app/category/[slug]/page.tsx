import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { getArticlesBySection, getSectionBySlugOrId } from "@/src/lib/api";
import { CategoryArchiveList } from "@/src/components/category/category-archive-list";

type PageParams = {
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
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const page = parsePageValue(rawPage);
  const section = await getSectionBySlugOrId(slug);

  if (!section) {
    return {
      title: "القسم غير موجود",
    };
  }

  return {
    title: section.title,
    description: `آخر الأخبار ضمن قسم ${section.title}`,
    alternates: {
      canonical: page > 1 ? `/category/${section.link}?page=${page}` : `/category/${section.link}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const page = parsePageValue(rawPage);
  const pageSize = getCategoryArchivePageSize();
  const section = await getSectionBySlugOrId(slug);

  if (!section) {
    notFound();
  }

  if (slug !== section.link) {
    permanentRedirect(`/category/${section.link}`);
  }

  const feed = await getArticlesBySection(section.link, page, pageSize);
  const categoryPath = `/category/${section.link}`;
  const categoryUrl = absoluteUrl(page > 1 ? `${categoryPath}?page=${page}` : categoryPath);
  const totalPages = feed.pagination?.totalPages ?? 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const prevHref = page - 1 <= 1 ? categoryPath : `${categoryPath}?page=${page - 1}`;
  const nextHref = `${categoryPath}?page=${page + 1}`;
  const itemPositionStart = ((page - 1) * (feed.pagination?.limit ?? pageSize)) + 1;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "الرئيسية",
        item: absoluteUrl("/"),
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
        url: absoluteUrl(`/news/${item.slugId}`),
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
      <header className="space-y-3 border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium text-emerald-700">القسم</p>
        <h1 className="text-3xl font-bold text-zinc-900">{section.title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-zinc-600">
          {feed.pagination
            ? `يعرض هذا القسم ${feed.pagination.total} مادة منشورة حتى الآن.`
            : "أحدث المواد المنشورة ضمن هذا القسم."}
        </p>
        {(hasPrev || hasNext) ? (
          <nav className="flex flex-wrap items-center gap-3 text-sm" aria-label="تنقل صفحات القسم">
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

      <CategoryArchiveList
        sectionLink={section.link}
        sectionTitle={section.title}
        basePath={categoryPath}
        initialItems={feed.items}
        initialPage={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />
    </main>
  );
}