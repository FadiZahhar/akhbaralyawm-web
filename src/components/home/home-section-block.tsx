import Link from "next/link";

import type { FeedItemDto, SectionDto } from "@/src/lib/api";
import { getAssetUrl } from "@/src/lib/api";

import { StoryCard } from "./story-card";

type HomeSectionBlockProps = {
  locale: string;
  section: SectionDto;
  stories: FeedItemDto[];
  formatDate: (value: string) => string;
  dict: {
    section: string;
    showMore: string;
  };
};

export function HomeSectionBlock({ locale, section, stories, formatDate, dict }: HomeSectionBlockProps) {
  return (
    <section className="space-y-4 rounded-sm border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_12px_30px_rgba(13,35,77,0.06)] sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border-soft)] pb-3">
        <h2 className="border-s-[3px] border-[color:var(--accent)] ps-2.5 text-[25px] font-bold text-[color:var(--ink)]">
          {section.title}
        </h2>
        <Link
          href={`/${locale}/category/${section.slug}`}
          className="rounded-sm border border-[color:var(--border-soft)] bg-white px-4 py-2 text-sm font-extrabold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
        >
          {dict.showMore}
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            href={`/${locale}/news/${story.slugId}`}
            title={story.title}
            summary={story.summary}
            imageUrl={getAssetUrl(story.photoPath, locale)}
            eyebrow={formatDate(story.disdate)}
            compact
          />
        ))}
      </div>
    </section>
  );
}