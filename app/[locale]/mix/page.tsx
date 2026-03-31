import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 120;

import { getArticlesBySection, getSectionBySlugOrId } from "@/src/lib/api";
import { isLocale, getDictionary, getOgLocale, type Locale } from "@/src/lib/i18n";

const MIX_SECTION_IDS = [68, 80, 58];

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  return {
    title: dict.nav.mix,
    alternates: {
      canonical: `/${locale}/mix`,
    },
    openGraph: { locale: getOgLocale(locale) },
  };
}

export default async function MixPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  function formatDate(value: string): string {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale === "ar" ? "ar-LB" : locale, {
      dateStyle: "medium",
    }).format(date);
  }

  const sections = await Promise.all(
    MIX_SECTION_IDS.map(async (id) => {
      const section = await getSectionBySlugOrId(String(id), locale);

      if (!section || section.link === "/") {
        return null;
      }

      const feed = await getArticlesBySection(section.link, 1, 6, locale);
      return {
        section,
        items: feed.items,
      };
    }),
  );

  const groups = sections.filter((group) => group !== null);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium text-emerald-700">{dict.mix.label}</p>
        <h1 className="text-3xl font-bold text-zinc-900">{dict.mix.title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-zinc-600">
          {dict.mix.description}
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.section.id} className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-zinc-900">{group.section.title}</h2>
            <Link
              href={`/${locale}/category/${group.section.link}`}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              {dict.common.showMore}
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
                  <span>{item.sectionTitle}</span>
                  <span>{formatDate(item.disdate)}</span>
                </div>

                <h3 className="text-lg font-semibold leading-8 text-zinc-900">
                  <Link href={`/${locale}/news/${item.slugId}`} className="hover:text-emerald-700">
                    {item.title}
                  </Link>
                </h3>

                {item.summary ? (
                  <p className="mt-3 text-sm leading-7 text-zinc-600">{item.summary}</p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}