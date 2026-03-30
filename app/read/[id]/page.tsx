import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";

import { getCmsPageById } from "@/src/lib/api";

type PageParams = {
  id: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const parsedId = Number.parseInt(id, 10);
  const page = Number.isFinite(parsedId) ? await getCmsPageById(parsedId) : null;

  return {
    title: page?.title ?? `صفحة ${id}`,
    description: page
      ? `صفحة محتوى: ${page.title}`
      : "صفحة محتوى عامة ضمن مرحلة التحويل.",
    alternates: {
      canonical: `/read/${id}`,
    },
  };
}

export default async function ReadPage({ params }: PageProps) {
  const { id } = await params;
  const parsedId = Number.parseInt(id, 10);

  if (id === "1") {
    permanentRedirect("/about");
  }

  if (id === "2") {
    permanentRedirect("/contact");
  }

  const page = Number.isFinite(parsedId) ? await getCmsPageById(parsedId) : null;

  if (page) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3 border-b border-[color:var(--border-soft)] pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Read
          </p>
          <h1 className="text-3xl font-extrabold text-[color:var(--ink)]">{page.title}</h1>
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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-[color:var(--border-soft)] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">Read</p>
        <h1 className="text-3xl font-extrabold text-[color:var(--ink)]">صفحة قراءة #{id}</h1>
      </header>

      <section className="rounded-[1.75rem] border border-[color:var(--border-soft)] bg-white p-6 leading-8 text-zinc-700 shadow-[0_16px_50px_rgba(13,35,77,0.08)] sm:p-8">
        <p>
          هذه صفحة انتقالية لروابط المحتوى القديمة من نوع Read.aspx. عند توفر API مخصص
          لصفحات CMS الثابتة، سيتم ربط المحتوى مباشرة هنا.
        </p>
        <p className="mt-4">
          حتى ذلك الوقت، يمكن العودة إلى الصفحة الرئيسية أو استخدام البحث للوصول إلى
          المحتوى المنشور حالياً.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[color:var(--accent-strong)]"
          >
            الرئيسية
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-[color:var(--border-soft)] px-5 py-3 text-sm font-bold text-[color:var(--ink)] transition hover:bg-[color:var(--panel)]"
          >
            البحث
          </Link>
        </div>
      </section>
    </main>
  );
}