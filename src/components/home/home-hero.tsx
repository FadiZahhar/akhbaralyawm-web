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
    <div className="rounded-[2rem] bg-[color:var(--ink)] px-6 py-5 text-white shadow-[0_24px_80px_rgba(13,35,77,0.24)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">واجهة اليوم</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight">أبرز ما يحدث الآن</h1>
        </div>
        <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/80">Live</span>
      </div>

      {lead ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <StoryCard
            href={`/news/${lead.slugId}`}
            title={lead.title}
            summary={lead.summary}
            imageUrl={getAssetUrl(lead.photoPath)}
            eyebrow={lead.sectionTitle || "آخر الأخبار"}
          />

          <div className="space-y-3 rounded-[1.75rem] bg-white/6 p-4">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <h2 className="text-base font-bold">لحظة بلحظة</h2>
              <span className="text-xs text-white/55">تحديثات سريعة</span>
            </div>
            <div className="space-y-2">
              {updates.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slugId}`}
                  className="block rounded-2xl border border-white/8 bg-white/4 px-4 py-3 transition hover:bg-white/8"
                >
                  <div className="mb-1 text-xs text-white/55">{formatDate(item.disdate)}</div>
                  <div className="text-sm font-bold leading-7 text-white">{item.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}