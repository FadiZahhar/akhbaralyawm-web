import Link from "next/link";

import type { FeedItemDto } from "@/src/lib/api";

type HomeSidebarProps = {
  feed: FeedItemDto[];
};

export function HomeSidebar({ feed }: HomeSidebarProps) {
  return (
    <aside className="space-y-6">
      <section className="rounded-[2rem] border border-[color:var(--border-soft)] bg-[color:var(--panel)] p-6 shadow-[0_18px_60px_rgba(13,35,77,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">افتتاحية</p>
        <h2 className="mt-3 text-2xl font-extrabold leading-10 text-[color:var(--ink)]">
          نسخة انتقالية جاهزة للبناء التحريري
        </h2>
        <p className="mt-4 text-sm leading-8 text-zinc-700">
          هذه الصفحة أصبحت متصلة فعلياً مع واجهات الـ API العامة، وتشكّل قاعدة التنفيذ
          للهوية الجديدة قبل الانتقال إلى استخراج التصميم الكامل من Web Forms.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/mix"
            className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[color:var(--accent-strong)]"
          >
            تصفح من كل شي
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-[color:var(--border-soft)] px-5 py-3 text-sm font-bold text-[color:var(--ink)] transition hover:bg-white"
          >
            البحث في المحتوى
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_18px_60px_rgba(13,35,77,0.08)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-[color:var(--ink)]">سريع القراءة</h2>
          <span className="text-xs font-bold text-zinc-400">Top 5</span>
        </div>
        <div className="space-y-3">
          {feed.slice(0, 5).map((item, index) => (
            <Link
              key={item.id}
              href={`/news/${item.slugId}`}
              className="flex items-start gap-4 rounded-2xl border border-transparent px-3 py-3 transition hover:border-[color:var(--border-soft)] hover:bg-[color:var(--panel)]"
            >
              <span className="mt-1 text-sm font-extrabold text-[color:var(--accent)]">0{index + 1}</span>
              <span className="text-sm font-bold leading-7 text-[color:var(--ink)]">{item.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}