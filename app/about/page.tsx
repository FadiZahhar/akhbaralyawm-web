import type { Metadata } from "next";

import { getHomeFeed } from "@/src/lib/api";
import { PageSidebar } from "@/src/components/sidebar/page-sidebar";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرف إلى منصة أخبار اليوم ورسالتها التحريرية.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  const mostRead = await getHomeFeed(5);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
      <header className="space-y-3 rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.06)] sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">About</p>
        <h1 className="text-[1.95rem] font-black text-[color:var(--ink)]">من نحن</h1>
        <p className="max-w-3xl text-sm leading-8 text-zinc-600">
          نظرة مختصرة على هوية أخبار اليوم ومسار التحول التحريري والتقني الحالي.
        </p>
      </header>

      <section className="space-y-6 rounded-sm border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_16px_46px_rgba(13,35,77,0.07)] sm:p-8">
        <div className="border-b border-[color:var(--border-soft)] pb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--accent)]">Mission</p>
          <h2 className="mt-2 text-[1.45rem] font-black text-[color:var(--ink)]">هوية تحريرية واضحة</h2>
        </div>

        <div className="space-y-4 text-[1.02rem] leading-9 text-zinc-700">
          <p>
            أخبار اليوم منصة إخبارية عربية تهدف إلى تقديم محتوى سريع وواضح مع الحفاظ على
            الدقة والسياق. نعمل حالياً على نقل الواجهة من النظام القديم إلى بنية حديثة تعتمد
            على Next.js مع إدارة محتوى Headless لضمان أداء أفضل وتجربة قراءة أكثر سلاسة.
          </p>
          <p>
            ضمن خطة التحديث، سيتم تحسين صفحات الأقسام والمقالات والبحث بشكل تدريجي مع الحفاظ
            على الأرشيف وروابطه التاريخية عبر تحويلات SEO آمنة.
          </p>
        </div>
      </section>
      </div>
      <PageSidebar mostRead={mostRead} />
      </div>
    </main>
  );
}