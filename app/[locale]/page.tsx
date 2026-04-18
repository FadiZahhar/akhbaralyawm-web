import { getArticlesBySection, getAssetUrl, getHomeFeed, getSectionBySlugOrId } from "@/src/lib/api";
import { BreakingTicker } from "@/src/components/home/breaking-ticker";

export const revalidate = 120;
import { HomeHero } from "@/src/components/home/home-hero";
import { HomeSectionBlock } from "@/src/components/home/home-section-block";
import { HomeSidebar } from "@/src/components/home/home-sidebar";
import { StoryCard } from "@/src/components/home/story-card";
import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

const HOME_SECTION_IDS = [29, 45, 30, 39];

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  function formatDate(value: string): string {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale === "ar" ? "ar-LB" : locale, {
      dateStyle: "medium",
    }).format(date);
  }

  const feed = await getHomeFeed(12, locale);
  const [lead, ...rest] = feed;
  const highlighted = rest.slice(0, 4);
  const updates = feed.slice(0, 8);
  const tickerItems = feed.slice(0, 6).map((item) => ({
    id: item.id,
    slugId: item.slugId,
    title: item.title,
    photoUrl: getAssetUrl(item.photoPath),
  }));
  const sections = await Promise.all(
    HOME_SECTION_IDS.map(async (id) => {
      const section = await getSectionBySlugOrId(String(id), locale);

      if (!section || section.link === "/") {
        return null;
      }

      const stories = await getArticlesBySection(section.link, 1, 3, locale);
      return {
        section,
        stories: stories.items,
      };
    }),
  );

  const homeSections = sections.filter((section) => section !== null);

  // Build slider items from the first article of each loaded section
  const sliderItems = homeSections
    .flatMap((group) =>
      group.stories.slice(0, 2).map((story) => ({
        id: story.id,
        slugId: story.slugId,
        title: story.title,
        sectionTitle: group.section.title,
        imageUrl: getAssetUrl(story.photoPath),
        locale,
      })),
    )
    .slice(0, 8);

  return (
    <>
    <BreakingTicker locale={locale} label={dict.ticker.breaking} items={tickerItems} />
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <HomeHero locale={locale} lead={lead} updates={updates} dict={{ lastMoment: dict.sidebar.lastMoment, live: dict.sidebar.live }} />

          <div className="grid gap-6 md:grid-cols-2">
            {highlighted.map((item) => (
              <StoryCard
                key={item.id}
                href={`/${locale}/news/${item.slugId}`}
                title={item.title}
                summary={item.summary}
                imageUrl={getAssetUrl(item.photoPath)}
                eyebrow={item.sectionTitle}
                compact
              />
            ))}
          </div>
        </div>

        <HomeSidebar locale={locale} dict={{ editorial: dict.sidebar.editorial, editorialTitle: dict.sidebar.editorialTitle, editorialBody: dict.sidebar.editorialBody, browseMix: dict.sidebar.browseMix, searchContent: dict.sidebar.searchContent, mostRead: dict.sidebar.mostRead, latestCategories: dict.sidebar.latestCategories }} feed={feed} sliderItems={sliderItems} />
      </section>

      <section className="grid gap-8">
        {homeSections.map((group) => (
          <HomeSectionBlock
            key={group.section.id}
            locale={locale}
            section={group.section}
            stories={group.stories}
            formatDate={formatDate}
            dict={{ section: dict.sidebar.section, showMore: dict.common.showMore }}
          />
        ))}
      </section>
    </main>
    </>
  );
}
