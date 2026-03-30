import Link from "next/link";

import type { FeedItemDto } from "@/src/lib/api";
import { getAssetUrl } from "@/src/lib/api";

import { StoryCard } from "./story-card";

type HomeHeroProps = {
  lead: FeedItemDto | undefined;
  updates: FeedItemDto[];
};

type FormatDate = (value: string) => string;

export function HomeHero({ lead, updates, formatDate }: HomeHeroProps & { formatDate: FormatDate }) {
  return (
    <div className="rounded-sm border border-zinc-300 bg-white px-6 py-5 text-[color:var(--ink)] shadow-[0_20px_50px_rgba(13,35,77,0.08)]">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--accent)]">واجهة اليوم</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[color:var(--ink)]">أبرز ما يحدث الآن</h1>
        </div>
        <span className="rounded-sm bg-[color:var(--accent)] px-4 py-2 text-xs font-bold text-white">Live</span>
      </div>

      {lead ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <StoryCard
            href={`/news/${lead.slugId}`}
            title={lead.title}
            summary={lead.summary}
            imageUrl={getAssetUrl(lead.photoPath)}
            eyebrow={lead.sectionTitle || "آخر الأخبار"}
          />

          <div className="space-y-3 rounded-sm border border-zinc-200 bg-[color:var(--panel)] p-4">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
              <h2 className="text-base font-bold text-[color:var(--ink)]">لحظة بلحظة</h2>
              <span className="text-xs text-zinc-600">تحديثات سريعة</span>
            </div>
            <div className="space-y-2">
              {updates.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slugId}`}
                  className="block rounded-sm border border-zinc-200 bg-white px-4 py-3 transition hover:border-[color:var(--accent)] hover:bg-zinc-50"
                >
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs text-zinc-600">
                    <span>{formatDate(item.disdate)}</span>
                    <span className="font-bold text-[color:var(--accent)]">{index + 1}</span>
                  </div>
                  <div className="text-sm font-bold leading-7 text-[color:var(--ink)]">{item.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}