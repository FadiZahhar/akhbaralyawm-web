import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

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

function parseArticleIdFromSlugId(slugId: string): number | null {
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
    redirect(`/news/${article.slugId}`);
  }

  const imageUrl = getAssetUrl(article.photoPath);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <article className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-zinc-500">
            {article.sectionTitle}
            {article.disdate ? ` - ${article.disdate}` : ""}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-zinc-900">{article.title}</h1>
        </header>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title}
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