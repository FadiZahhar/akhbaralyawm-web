import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

import {
  getArticleById,
  getAssetUrl,
  getPreviewArticleById,
  type ArticleDto,
} from "@/src/lib/api";

type PageParams = {
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

async function fetchArticle(id: number): Promise<ArticleDto | null> {
  const cookieStore = await cookies();
  const previewToken = cookieStore.get("previewToken")?.value;

  if (previewToken) {
    try {
      const previewArticle = await getPreviewArticleById(id, previewToken);
      if (previewArticle) {
        return previewArticle;
      }
    } catch {
      // Fall back to public article when preview token is invalid or expired.
    }
  }

  return getArticleById(id);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slugId } = await params;
  const id = parseArticleIdFromSlugId(slugId);

  if (!id) {
    return {
      title: "الخبر غير موجود",
    };
  }

  const article = await fetchArticle(id);

  if (!article) {
    return {
      title: "الخبر غير موجود",
    };
  }

  return {
    title: article.title,
    alternates: {
      canonical: `/news/${article.slugId}`,
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slugId } = await params;
  const id = parseArticleIdFromSlugId(slugId);

  if (!id) {
    notFound();
  }

  const article = await fetchArticle(id);

  if (!article) {
    notFound();
  }

  if (slugId !== article.slugId) {
    permanentRedirect(`/news/${article.slugId}`);
  }

  const imageUrl = getAssetUrl(article.photoPath);
  const articlePath = `/news/${article.slugId}`;
  const articleUrl = absoluteUrl(articlePath);
  const sectionPath = article.sectionLink ? `/category/${article.sectionLink}` : "/";
  const sectionUrl = absoluteUrl(sectionPath);

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
        name: article.sectionTitle || "الأخبار",
        item: sectionUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    datePublished: article.disdate || undefined,
    dateModified: article.disdate || undefined,
    mainEntityOfPage: articleUrl,
    articleSection: article.sectionTitle || undefined,
    image: imageUrl ? [absoluteUrl(imageUrl)] : undefined,
    author: {
      "@type": "Organization",
      name: "Akhbar Alyawm",
    },
    publisher: {
      "@type": "Organization",
      name: "Akhbar Alyawm",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon.png"),
      },
    },
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <article className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-zinc-500">
            {article.sectionTitle}
            {article.disdate ? ` - ${article.disdate}` : ""}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-zinc-900">{article.title}</h1>
        </header>

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title}
            width={1200}
            height={675}
            className="h-auto w-full rounded-lg object-cover"
          />
        ) : null}

        <section
          className="prose prose-zinc max-w-none leading-8"
          dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
        />
      </article>
    </main>
  );
}