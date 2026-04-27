import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

export const revalidate = 120;

import {
  getArticleById,
  getAssetUrl,
  getHomeFeed,
  getPreviewArticleById,
  getSectionSlug,
  type ArticleDto,
} from "@/src/lib/api";
import { Breadcrumbs } from "@/src/components/breadcrumbs";
import { FallbackNotice } from "@/src/components/fallback-notice";
import { SocialShare } from "@/src/components/article/social-share";
import { RelatedArticles } from "@/src/components/article/related-articles";
import { YoutubeEmbed } from "@/src/components/article/youtube-embed";
import { AdBanner } from "@/src/components/home/ad-banner";
import { MostReadSlider } from "@/src/components/home/most-read-slider";
import { PageSidebar } from "@/src/components/sidebar/page-sidebar";
import { isLocale, getDictionary, getOgLocale, locales, defaultLocale, type Locale } from "@/src/lib/i18n";
type PageParams = {
  locale: string;
  slugId: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.akhbaralyawm.com").replace(/\/+$/, "");
const YOUTUBE_FALLBACK_URL = "https://www.youtube.com/embed?listType=playlist&list=UUKbs9xURKdoJ3I99QqFygdQ";

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
  const { locale: rawLocale, slugId: rawSlugId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const slugId = decodeURIComponent(rawSlugId);
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

  // Per-locale hreflang alternates. Article slugs are locale-specific
  // (post backendfix Phase 1), but the safest cross-locale link target
  // we have without an extra round-trip is the canonical article slug
  // for the current locale; if a locale doesn't have its own translation,
  // the backend fallback at request time will surface it.
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `/${l}/news/${article.slugId}`;
  }
  languages["x-default"] = `/${defaultLocale}/news/${article.slugId}`;

  return {
    title: article.title,
    description: article.title,
    alternates: {
      canonical: canonicalPath,
      languages,
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
  const { locale: rawLocale, slugId: rawSlugId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const slugId = decodeURIComponent(rawSlugId);
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
  const sectionSlug = article.sectionLink ? await getSectionSlug(article.sectionLink, locale) : "";

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
              item: absoluteUrl(`/${locale}/category/${sectionSlug}`),
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
    <>
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
        <AdBanner height={222} />

        <Breadcrumbs items={[
          { label: dict.nav.home, href: `/${locale}` },
          ...(article.sectionTitle && article.sectionLink
            ? [{ label: article.sectionTitle, href: `/${locale}/category/${sectionSlug}` }]
            : []),
          { label: article.title },
        ]} />

        <FallbackNotice langMeta={article.langMeta} locale={locale} message={dict.fallback.notice} />

        <header className="space-y-3 rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:px-6">
          {article.sectionTitle ? (
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">
              {article.sectionTitle}
            </p>
          ) : null}
          <h1 className="text-[1.95rem] font-black leading-snug text-[color:var(--ink)]">{article.title}</h1>
           <div className="flex flex-wrap items-center justify-between gap-3">
             {article.disdate ? (
               <p className="text-sm text-zinc-500">{formatDate(article.disdate)}</p>
             ) : <span />}
             <SocialShare
               variant="compact"
               url={canonicalUrl}
               title={article.title}
               dict={{
                 share: dict.article.share,
                 copyLink: dict.article.copyLink,
                 copied: dict.article.copied,
               }}
             />
           </div>
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
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciPjxzdG9wIHN0b3AtY29sb3I9IiNlMmU1ZWMiIG9mZnNldD0iMjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI2YwZjJmNSIgb2Zmc2V0PSI1MCUiLz48c3RvcCBzdG9wLWNvbG9yPSIjZTJlNWVjIiBvZmZzZXQ9IjgwJSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI5MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjZTJlNWVjIi8+PC9zdmc+"
            />
          </div>
        ) : null}

        <section className="rounded-sm border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_16px_46px_rgba(13,35,77,0.07)] sm:p-8">
          <div
            className="prose prose-zinc max-w-none text-[1.05rem] leading-9"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />
          {article.tags.length > 0 ? (
            <div className="mt-8 border-t border-[color:var(--border-soft)] pt-5">
              <h2 className="mb-3 text-base font-bold text-[color:var(--ink)]">{dict.article.tags}</h2>
              <ul className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <li key={tag} className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-sm font-medium text-[color:var(--ink)]">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* Social share buttons */}
        <SocialShare
          url={canonicalUrl}
          title={article.title}
          dict={{
            share: dict.article.share,
            copyLink: dict.article.copyLink,
            copied: dict.article.copied,
          }}
        />

        <YoutubeEmbed
          sourceUrl={article.youtubeUrl}
          fallbackUrl={YOUTUBE_FALLBACK_URL}
          title={article.title}
        />

        {/* Related articles */}
        {article.sectionLink ? (
          <RelatedArticles
            locale={locale}
            sectionLink={article.sectionLink}
            excludeId={article.id}
            label={dict.article.relatedArticles}
          />
        ) : null}
      </article>
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
