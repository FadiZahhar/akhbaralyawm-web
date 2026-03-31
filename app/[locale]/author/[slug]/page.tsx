import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

export const revalidate = 120;

import { getArticlesByAuthor, getAssetUrl, getAuthorBySlugOrId } from "@/src/lib/api";
import { AuthorArchiveList } from "@/src/components/author/author-archive-list";
import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

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
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const { page: rawPage } = await searchParams;
  const page = parsePageValue(rawPage);
  const author = await getAuthorBySlugOrId(slug, locale);

  if (!author) {
    return {
      title: (await getDictionary(locale)).author.notFound,
    };
  }

  return {
    title: author.title,
    description: `${(await getDictionary(locale)).author.archive} - ${author.title}`,
    alternates: {
      canonical: page > 1 ? `/${locale}/author/${author.link}?page=${page}` : `/${locale}/author/${author.link}`,
    },
  };
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);
  const { page: rawPage } = await searchParams;
  const page = parsePageValue(rawPage);
  const pageSize = getAuthorArchivePageSize();
  const author = await getAuthorBySlugOrId(slug, locale);

  if (!author) {
    notFound();
  }

  if (slug !== author.link) {
    permanentRedirect(`/${locale}/author/${author.link}`);
  }

  const imageUrl = getAssetUrl(author.photoPath);
  const articles = await getArticlesByAuthor(String(author.id), page, pageSize, locale);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <nav className="text-sm text-zinc-500">
        <Link href={`/${locale}`} className="transition hover:text-[color:var(--accent-strong)]">
          {dict.nav.home}
        </Link>
        <span className="px-2">/</span>
        <span>{dict.nav.authors}</span>
      </nav>

      <section className="overflow-hidden rounded-sm border border-[color:var(--border-soft)] bg-white shadow-[0_16px_46px_rgba(13,35,77,0.07)]">
        <div className="grid gap-6 p-5 md:grid-cols-[220px_minmax(0,1fr)] md:p-7">
          <div>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={author.title}
                width={800}
                height={800}
                className="aspect-square w-full rounded-sm border border-[color:var(--border-soft)] bg-zinc-100 object-cover"
              />
            ) : (
              <div className="aspect-square w-full rounded-sm border border-[color:var(--border-soft)] bg-zinc-100" />
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">Author</p>
            <h1 className="text-[1.95rem] font-black text-[color:var(--ink)]">{author.title}</h1>
            {author.bodyHtml ? (
              <section
                className="prose prose-zinc max-w-none text-[1.02rem] leading-9"
                dangerouslySetInnerHTML={{ __html: author.bodyHtml }}
              />
            ) : (
              <p className="text-sm leading-8 text-zinc-600">
                {dict.author.noBio}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-sm border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:p-6">
        <h2 className="border-b border-[color:var(--border-soft)] pb-3 text-[1.45rem] font-black text-[color:var(--ink)]">{dict.author.archive}</h2>
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
