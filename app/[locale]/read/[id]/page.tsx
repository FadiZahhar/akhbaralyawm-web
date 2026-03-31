import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

export const revalidate = 120;

import { ApiError, getCmsPageById } from "@/src/lib/api";
import { FallbackNotice } from "@/src/components/fallback-notice";
import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

type PageParams = {
  locale: string;
  id: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const parsedId = Number.parseInt(id, 10);
  const page = Number.isFinite(parsedId) ? await getCmsPageById(parsedId, locale) : null;

  return {
    title: page?.title ?? `${(await getDictionary(locale)).read.page} ${id}`,
    description: page
      ? `${(await getDictionary(locale)).read.page}: ${page.title}`
      : (await getDictionary(locale)).read.cmsPlaceholder,
    alternates: {
      canonical: `/${locale}/read/${id}`,
    },
  };
}

export default async function ReadPage({ params }: PageProps) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);
  const parsedId = Number.parseInt(id, 10);

  if (!Number.isFinite(parsedId)) {
    notFound();
  }

  if (id === "1") {
    permanentRedirect(`/${locale}/about`);
  }

  if (id === "2") {
    permanentRedirect(`/${locale}/contact`);
  }

  let page: Awaited<ReturnType<typeof getCmsPageById>> = null;
  let errorKind: "BadRequest" | "ServerError" | null = null;

  try {
    page = await getCmsPageById(parsedId, locale);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.kind === "NotFound") {
        notFound();
      }
      errorKind = error.kind === "BadRequest" ? "BadRequest" : "ServerError";
    } else {
      errorKind = "ServerError";
    }
  }

  if (!page && !errorKind) {
    notFound();
  }

  if (errorKind === "BadRequest") {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-6 px-4 py-16">
        <h1 className="text-2xl font-extrabold text-[color:var(--ink)]">{dict.common.badRequest}</h1>
      </main>
    );
  }

  if (errorKind === "ServerError" || !page) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-6 px-4 py-16">
        <h1 className="text-2xl font-extrabold text-[color:var(--ink)]">{dict.common.serverError}</h1>
        <Link
          href={`/${locale}`}
          className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[color:var(--accent-strong)]"
        >
          {dict.read.backHome}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-[color:var(--border-soft)] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">
          {dict.read.label}
        </p>
        <h1 className="text-3xl font-extrabold text-[color:var(--ink)]">{page.title}</h1>
        <FallbackNotice langMeta={page.langMeta} locale={locale} />
      </header>

      <section className="rounded-[1.75rem] border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_16px_50px_rgba(13,35,77,0.08)] sm:p-8">
        <article
          className="prose prose-zinc max-w-none leading-8"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      </section>
    </main>
  );
}
