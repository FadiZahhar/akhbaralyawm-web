import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

import { getArticlesBySection, getAssetUrl, getSectionBySlugOrId } from "@/src/lib/api";

type PageParams = {
  slug: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.akhbaralyawm.com").replace(/\/+$/, "");

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
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
      canonical: `/category/${section.link}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const section = await getSectionBySlugOrId(slug);

  if (!section) {
    notFound();
  }

  if (slug !== section.link) {
    permanentRedirect(`/category/${section.link}`);
  }

  const feed = await getArticlesBySection(section.link, 1, 12);
  const categoryPath = `/category/${section.link}`;
  const categoryUrl = absoluteUrl(categoryPath);

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
        position: index + 1,
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
      </header>

      {feed.items.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-zinc-600">
          لا توجد مواد منشورة في هذا القسم حالياً.
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {feed.items.map((item) => {
            const imageUrl = getAssetUrl(item.photoPath);

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt=""
                    width={1200}
                    height={675}
                    className="aspect-[16/10] w-full bg-zinc-100 object-cover"
                  />
                ) : (
                  <div className="aspect-[16/10] w-full bg-zinc-100" />
                )}

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-4 text-xs text-zinc-500">
                    <span>{item.sectionTitle}</span>
                    <span>{formatDate(item.disdate)}</span>
                  </div>

                  <h2 className="text-lg font-semibold leading-8 text-zinc-900">
                    <Link href={`/news/${item.slugId}`} className="hover:text-emerald-700">
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
      )}
    </main>
  );
}