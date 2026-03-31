import type { Metadata } from "next";

export const revalidate = 120;

import { getCmsPageById, getHomeFeed } from "@/src/lib/api";
import { FallbackNotice } from "@/src/components/fallback-notice";
import { PageSidebar } from "@/src/components/sidebar/page-sidebar";
import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

type PageParams = {
  locale: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  return {
    title: dict.contact.title,
    description: dict.contact.description,
    alternates: {
      canonical: `/${locale}/contact`,
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  const [mostRead, cmsPage] = await Promise.all([
    getHomeFeed(5, locale),
    getCmsPageById(2, locale),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
      <header className="space-y-3 rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">Contact</p>
        <h1 className="text-[1.95rem] font-black text-[color:var(--ink)]">{dict.contact.title}</h1>
        <p className="max-w-3xl text-sm leading-8 text-zinc-600">
          {dict.contact.description}
        </p>
        {cmsPage ? <FallbackNotice langMeta={cmsPage.langMeta} locale={locale} /> : null}
      </header>

      {cmsPage ? (
        <section className="space-y-6 rounded-sm border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_16px_46px_rgba(13,35,77,0.07)] sm:p-8">
          <article
            className="prose prose-zinc max-w-none text-[1.02rem] leading-9"
            dangerouslySetInnerHTML={{ __html: cmsPage.bodyHtml }}
          />
        </section>
      ) : (
        <section className="space-y-6 rounded-sm border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_16px_46px_rgba(13,35,77,0.07)] sm:p-8">
          <ul className="grid gap-3 text-sm text-zinc-700 sm:grid-cols-2">
            <li className="rounded-sm border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-4 py-3">
              editorial@akhbaralyawm.com
            </li>
            <li className="rounded-sm border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-4 py-3">
              tech@akhbaralyawm.com
            </li>
          </ul>
        </section>
      )}
      </div>
      <PageSidebar mostRead={mostRead} />
      </div>
    </main>
  );
}
