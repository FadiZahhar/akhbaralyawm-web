import type { Metadata } from "next";
import Link from "next/link";

import { getArticlesBySection, getSectionBySlugOrId } from "@/src/lib/api";

const MIX_SECTION_IDS = [68, 80, 58];

export const metadata: Metadata = {
  title: "من كل شي",
  description: "تجميعة مختارة من أقسام متعددة",
  alternates: {
    canonical: "/mix",
  },
};

function formatDate(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ar-LB", {
    dateStyle: "medium",
  }).format(date);
}

export default async function MixPage() {
  const sections = await Promise.all(
    MIX_SECTION_IDS.map(async (id) => {
      const section = await getSectionBySlugOrId(String(id));

      if (!section || section.link === "/") {
        return null;
      }

      const feed = await getArticlesBySection(section.link, 1, 6);
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
        <p className="text-sm font-medium text-emerald-700">Mix</p>
        <h1 className="text-3xl font-bold text-zinc-900">من كل شي</h1>
        <p className="max-w-3xl text-sm leading-7 text-zinc-600">
          مساحة جامعة لعرض أحدث المواد من مجموعة أقسام تحريرية مختارة.
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.section.id} className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-zinc-900">{group.section.title}</h2>
            <Link
              href={`/category/${group.section.link}`}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              عرض المزيد
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
                  <Link href={`/news/${item.slugId}`} className="hover:text-emerald-700">
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