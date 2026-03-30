import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

import { getArticlesByAuthor, getAssetUrl, getAuthorBySlugOrId } from "@/src/lib/api";
import { AuthorArchiveList } from "@/src/components/author/author-archive-list";

type PageParams = {
  slug: string;
};

type PageProps = {
  params: Promise<PageParams>;
  searchParams: Promise<{
    page?: string;
  }>;
};

const DEFAULT_AUTHOR_ARCHIVE_PAGE_SIZE = 12;

function getAuthorArchivePageSize(): number {
  const rawValue = process.env.AUTHOR_ARCHIVE_PAGE_SIZE;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : DEFAULT_AUTHOR_ARCHIVE_PAGE_SIZE;

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return DEFAULT_AUTHOR_ARCHIVE_PAGE_SIZE;
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
  const author = await getAuthorBySlugOrId(slug);

  if (!author) {
    return {
      title: "الكاتب غير موجود",
    };
  }

  return {
    title: author.title,
    description: `صفحة الكاتب ${author.title}`,
    alternates: {
      canonical: page > 1 ? `/author/${author.link}?page=${page}` : `/author/${author.link}`,
    },
  };
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const page = parsePageValue(rawPage);
  const pageSize = getAuthorArchivePageSize();
  const author = await getAuthorBySlugOrId(slug);

  if (!author) {
    notFound();
  }

  if (slug !== author.link) {
    permanentRedirect(`/author/${author.link}`);
  }

  const imageUrl = getAssetUrl(author.photoPath);
  const articles = await getArticlesByAuthor(String(author.id), page, pageSize);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <nav className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-emerald-700">
          الرئيسية
        </Link>
        <span className="px-2">/</span>
        <span>الكتّاب</span>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[220px_minmax(0,1fr)] md:p-8">
          <div>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={author.title}
                width={800}
                height={800}
                className="aspect-square w-full rounded-2xl bg-zinc-100 object-cover"
              />
            ) : (
              <div className="aspect-square w-full rounded-2xl bg-zinc-100" />
            )}
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-emerald-700">كاتب</p>
            <h1 className="text-3xl font-bold text-zinc-900">{author.title}</h1>
            {author.bodyHtml ? (
              <section
                className="prose prose-zinc max-w-none leading-8"
                dangerouslySetInnerHTML={{ __html: author.bodyHtml }}
              />
            ) : (
              <p className="text-sm leading-7 text-zinc-600">
                لا توجد نبذة متاحة لهذا الكاتب حالياً.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-zinc-900">أرشيف الكاتب</h2>
        <AuthorArchiveList
          authorId={String(author.id)}
          authorLink={author.link}
          initialItems={articles?.items ?? []}
          initialPage={page}
          pageSize={pageSize}
          totalPages={articles?.pagination?.totalPages ?? 1}
        />
      </section>
    </main>
  );
}