import type { Metadata } from "next";
import Link from "next/link";

import { searchArticles } from "@/src/lib/api";

type SearchValue = string | string[] | undefined;

type PageProps = {
  searchParams: Promise<{
    q?: SearchValue;
  }>;
};

function readQuery(value: SearchValue): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

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

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = readQuery(params.q);

  return {
    title: query ? `نتائج البحث عن ${query}` : "البحث",
    description: query ? `نتائج البحث عن ${query}` : "ابحث ضمن محتوى أخبار اليوم",
    alternates: {
      canonical: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = readQuery(params.q);
  const items = query ? await searchArticles(query, 12) : [];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-zinc-200 pb-6">
        <p className="text-sm font-medium text-emerald-700">البحث</p>
        <h1 className="text-3xl font-bold text-zinc-900">
          {query ? `نتائج البحث عن: ${query}` : "ابحث في الموقع"}
        </h1>
        <p className="text-sm leading-7 text-zinc-600">
          {query
            ? `تم العثور على ${items.length} نتيجة ضمن الطبقة الحالية من واجهات API العامة.`
            : "استخدم قيمة q في الرابط مثل /search?q=لبنان لعرض النتائج."}
        </p>
      </header>

      {query ? (
        items.length > 0 ? (
          <section className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
                  <span>{item.sectionTitle}</span>
                  <span>{formatDate(item.disdate)}</span>
                </div>

                <h2 className="text-xl font-semibold leading-8 text-zinc-900">
                  <Link href={`/news/${item.slugId}`} className="hover:text-emerald-700">
                    {item.title}
                  </Link>
                </h2>

                {item.summary ? (
                  <p className="mt-3 text-sm leading-7 text-zinc-600">{item.summary}</p>
                ) : null}
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-zinc-600">
            لا توجد نتائج مطابقة لعبارة البحث الحالية.
          </section>
        )
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-zinc-600">
          أضف قيمة البحث إلى الرابط ثم أعد المحاولة.
        </section>
      )}
    </main>
  );
}