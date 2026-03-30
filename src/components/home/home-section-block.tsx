import Link from "next/link";

import type { FeedItemDto, SectionDto } from "@/src/lib/api";
import { getAssetUrl } from "@/src/lib/api";

import { StoryCard } from "./story-card";

type HomeSectionBlockProps = {
  section: SectionDto;
  stories: FeedItemDto[];
  formatDate: (value: string) => string;
};

export function HomeSectionBlock({ section, stories, formatDate }: HomeSectionBlockProps) {
  return (
    <section className="space-y-4 rounded-sm border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_rgba(13,35,77,0.06)] sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border-soft)] pb-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">Section</p>
          <h2 className="mt-2 text-[1.45rem] font-black text-[color:var(--ink)]">{section.title}</h2>
        </div>
        <Link
          href={`/category/${section.link}`}
          className="rounded-sm border border-[color:var(--border-soft)] bg-white px-4 py-2 text-sm font-extrabold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
        >
          عرض المزيد
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            href={`/news/${story.slugId}`}
            title={story.title}
            summary={story.summary}
            imageUrl={getAssetUrl(story.photoPath)}
            eyebrow={formatDate(story.disdate)}
            compact
          />
        ))}
      </div>
    </section>
  );
}