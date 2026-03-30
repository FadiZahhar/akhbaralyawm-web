import Link from "next/link";

import type { FeedItemDto } from "@/src/lib/api";

type MostReadWidgetProps = {
  items: FeedItemDto[];
};

export function MostReadWidget({ items }: MostReadWidgetProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-sm border border-[color:var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.08)]">
      <div className="mb-3.5 flex items-center gap-3 border-b border-[color:var(--border-soft)] pb-3">
        <span className="inline-block h-5 w-1 rounded-sm bg-[color:var(--accent)]" />
        <h2 className="text-lg font-black text-[color:var(--ink)]">الأكثر قراءة</h2>
      </div>
      <div className="space-y-2.5">
        {items.slice(0, 5).map((item, index) => (
          <Link
            key={item.id}
            href={`/news/${item.slugId}`}
            className="flex items-start gap-3 rounded-sm border border-transparent px-2.5 py-2.5 transition hover:border-[color:var(--border-soft)] hover:bg-[color:var(--panel)]"
          >
            <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-sm bg-[color:var(--panel)] px-1 text-xs font-black text-[color:var(--accent)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-sm font-extrabold leading-7 text-[color:var(--ink)]">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
