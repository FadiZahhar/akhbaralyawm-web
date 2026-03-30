import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرف إلى منصة أخبار اليوم ورسالتها التحريرية.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-[color:var(--border-soft)] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">About</p>
        <h1 className="text-3xl font-extrabold text-[color:var(--ink)]">من نحن</h1>
      </header>

      <section className="rounded-[1.75rem] border border-[color:var(--border-soft)] bg-white p-6 leading-8 text-zinc-700 shadow-[0_16px_50px_rgba(13,35,77,0.08)] sm:p-8">
        <p>
          أخبار اليوم منصة إخبارية عربية تهدف إلى تقديم محتوى سريع وواضح مع الحفاظ على
          الدقة والسياق. نعمل حالياً على نقل الواجهة من النظام القديم إلى بنية حديثة تعتمد
          على Next.js مع إدارة محتوى Headless لضمان أداء أفضل وتجربة قراءة أكثر سلاسة.
        </p>
        <p className="mt-4">
          ضمن خطة التحديث، سيتم تحسين صفحات الأقسام والمقالات والبحث بشكل تدريجي مع الحفاظ
          على الأرشيف وروابطه التاريخية عبر تحويلات SEO آمنة.
        </p>
      </section>
    </main>
  );
}