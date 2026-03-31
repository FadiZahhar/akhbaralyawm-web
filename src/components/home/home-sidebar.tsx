import Link from "next/link";

import type { FeedItemDto } from "@/src/lib/api";
import { MostReadWidget } from "@/src/components/sidebar/most-read-widget";

type HomeSidebarProps = {
  locale: string;
  dict: {
    editorial: string;
    editorialTitle: string;
    editorialBody: string;
    browseMix: string;
    searchContent: string;
    mostRead: string;
  };
  feed: FeedItemDto[];
};

export function HomeSidebar({ locale, dict, feed }: HomeSidebarProps) {
  return (
    <aside className="space-y-5">
      <section className="rounded-sm border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-5 py-6 shadow-[0_14px_36px_rgba(13,35,77,0.08)]">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[color:var(--accent)]">{dict.editorial}</p>
        <h2 className="mt-3 text-[1.6rem] font-black leading-[1.9] text-[color:var(--ink)]">
          {dict.editorialTitle}
        </h2>
        <p className="mt-4 text-sm leading-8 text-zinc-700/95">
          {dict.editorialBody}
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5 border-t border-[color:var(--border-soft)] pt-5">
          <Link
            href={`/${locale}/mix`}
            className="rounded-sm border border-[color:var(--accent-strong)] bg-white px-4 py-2.5 text-sm font-extrabold text-[color:var(--accent-strong)] transition hover:bg-[color:var(--panel)]"
          >
            {dict.browseMix}
          </Link>
          <Link
            href={`/${locale}/search`}
            className="rounded-sm border border-[color:var(--border-soft)] px-4 py-2.5 text-sm font-extrabold text-[color:var(--ink)] transition hover:bg-white"
          >
            {dict.searchContent}
          </Link>
        </div>
      </section>

      <MostReadWidget locale={locale} label={dict.mostRead} items={feed} />
    </aside>
  );
}