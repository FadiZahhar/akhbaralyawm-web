import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

export const revalidate = 120;

import {
  getArticleById,
  getAssetUrl,
  getHomeFeed,
  getPreviewArticleById,
  type ArticleDto,
} from "@/src/lib/api";
import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { PageSidebar } from "@/src/components/sidebar/page-sidebar";
import { isLocale, getDictionary, getOgLocale, type Locale } from "@/src/lib/i18n";
type PageParams = {
  locale: string;
  slugId: string;
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

function parseArticleIdFromSlugId(slugId: string): number | null {
  if (/^\d+$/.test(slugId)) {
    const direct = Number.parseInt(slugId, 10);
    return Number.isFinite(direct) ? direct : null;
  }

  const match = slugId.match(/-(\d+)$/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchArticle(id: number, locale?: Locale): Promise<ArticleDto | null> {
  const cookieStore = await cookies();
  const previewToken = cookieStore.get("previewToken")?.value;

  if (previewToken) {
    try {
      const previewArticle = await getPreviewArticleById(id, previewToken, locale);
      if (previewArticle) {
        return previewArticle;
      }
    } catch {
      // Fall back to public article when preview token is invalid or expired.
    }
  }

  return getArticleById(id, locale);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slugId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const metaDict = await getDictionary(locale);
  const id = parseArticleIdFromSlugId(slugId);

  if (!id) {
    return {
      title: metaDict.article.notFound,
    };
  }

  const article = await fetchArticle(id, locale);

  if (!article) {
    return {
      title: metaDict.article.notFound,
    };
  }

  const canonicalPath = `/${locale}/news/${article.slugId}`;
  const photoUrl = getAssetUrl(article.photoPath);

  return {
    title: article.title,
    description: article.title,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: article.title,
      type: "article",
      url: absoluteUrl(canonicalPath),
      locale: getOgLocale(locale),
      ...(photoUrl ? { images: [{ url: photoUrl }] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale: rawLocale, slugId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const id = parseArticleIdFromSlugId(slugId);

  if (!id) {
    notFound();
  }

  const article = await fetchArticle(id, locale);

  if (!article) {
    notFound();
  }

  if (slugId !== article.slugId) {
    permanentRedirect(`/${locale}/news/${article.slugId}`);
  }

  const photoUrl = getAssetUrl(article.photoPath);
  const canonicalUrl = absoluteUrl(`/${locale}/news/${article.slugId}`);
  const dict = await getDictionary(locale);
  const mostRead = await getHomeFeed(5, locale);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    url: canonicalUrl,
    datePublished: article.disdate || undefined,
    ...(photoUrl ? { image: photoUrl } : {}),
    publisher: {
      "@type": "Organization",
      name: "Akhbar Alyawm",
      url: SITE_URL,
    },
    mainEntityOfPage: canonicalUrl,
  };

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
      ...(article.sectionTitle && article.sectionLink
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: article.sectionTitle,
              item: absoluteUrl(`/${locale}/category/${article.sectionLink}`),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: article.sectionTitle && article.sectionLink ? 3 : 2,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  function formatDate(value: string): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-LB" : locale, {
      dateStyle: "long",
    }).format(date);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article className="flex flex-col gap-6">
        <Breadcrumbs items={[
          { label: dict.nav.home, href: `/${locale}` },
          ...(article.sectionTitle && article.sectionLink
            ? [{ label: article.sectionTitle, href: `/${locale}/category/${article.sectionLink}` }]
            : []),
          { label: article.title },
        ]} />

        <header className="space-y-3 rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:px-6">
          {article.sectionTitle ? (
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">
              {article.sectionTitle}
            </p>
          ) : null}
          <h1 className="text-[1.95rem] font-black leading-snug text-[color:var(--ink)]">{article.title}</h1>
          {article.disdate ? (
            <p className="text-sm text-zinc-500">{formatDate(article.disdate)}</p>
          ) : null}
        </header>

        {photoUrl ? (
          <div className="overflow-hidden rounded-sm border border-[color:var(--border-soft)]">
            <Image
              src={photoUrl}
              alt={article.title}
              width={900}
              height={500}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        ) : null}

        <section className="rounded-sm border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_16px_46px_rgba(13,35,77,0.07)] sm:p-8">
          <div
            className="prose prose-zinc max-w-none text-[1.05rem] leading-9"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />
        </section>
      </article>
      <PageSidebar locale={locale} label={dict.sidebar.mostRead} mostRead={mostRead} />
      </div>
    </main>
  );
}
