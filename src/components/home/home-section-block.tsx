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
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">Section</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--ink)]">{section.title}</h2>
        </div>
        <Link
          href={`/category/${section.link}`}
          className="rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-2 text-sm font-bold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
        >
          عرض المزيد
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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