import type { Metadata } from "next";

export const revalidate = 120;

import { getCmsPageById } from "@/src/lib/api";
import { getHomeFeed } from "@/src/lib/api";
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
    title: dict.about.title,
    description: dict.about.description,
    alternates: {
      canonical: `/${locale}/about`,
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  const [mostRead, cmsPage] = await Promise.all([
    getHomeFeed(5, locale),
    getCmsPageById(1, locale),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
      <header className="space-y-3 rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">About</p>
        <h1 className="text-[1.95rem] font-black text-[color:var(--ink)]">{dict.about.title}</h1>
        <p className="max-w-3xl text-sm leading-8 text-zinc-600">
          {dict.about.description}
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
          <div className="space-y-4 text-[1.02rem] leading-9 text-zinc-700">
            <p>
              {locale === "ar"
                ? "أخبار اليوم منصة إخبارية عربية تهدف إلى تقديم محتوى سريع وواضح مع الحفاظ على الدقة والسياق."
                : locale === "fr"
                  ? "Akhbar Alyawm est une plateforme d'information arabe visant à fournir un contenu rapide et clair tout en maintenant la précision et le contexte."
                  : "Akhbar Alyawm is an Arabic news platform aiming to deliver fast, clear content while maintaining accuracy and context."}
            </p>
          </div>
        </section>
      )}
      </div>
      <PageSidebar mostRead={mostRead} />
      </div>
    </main>
  );
}
