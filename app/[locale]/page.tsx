import Image from "next/image";
import Link from "next/link";

import { getArticlesBySection, getAssetUrl, getHomeFeed, getSectionBySlugOrId } from "@/src/lib/api";

export const revalidate = 120;
import { HomeHero } from "@/src/components/home/home-hero";
import { HomeSectionBlock } from "@/src/components/home/home-section-block";
import { CategorySlider } from "@/src/components/home/category-slider";
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

  const feed = await getHomeFeed(20, locale);
  const [lead, ...rest] = feed;
  const updates = feed.slice(0, 10);
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

  // Pick one article from each different category for the side cards (max 3)
  const sideCards = homeSections
    .slice(0, 3)
    .map((group) => ({
      ...group.stories[0],
      sectionTitle: group.section.title,
    }))
    .filter((item) => item.id);

  return (
    <>
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      {/* Three-column hero area — ticker(4) | slider(6) | cards(3) */}
      <section className="grid gap-5 lg:grid-cols-[4fr_6fr_3fr]">
        {/* Right column (RTL first): لحظة بلحظة vertical ticker */}
        <HomeHero locale={locale} updates={updates} dict={{ lastMoment: dict.sidebar.lastMoment, live: dict.sidebar.live }} />

        {/* Middle column: large image swiper */}
        <CategorySlider items={sliderItems} label={dict.sidebar.latestCategories} />

        {/* Left column (RTL last): cards from different categories — match slider height */}
        <div className="flex flex-col gap-2">
          {sideCards.map((item) => {
            const photoUrl = getAssetUrl(item.photoPath);
            return (
              <Link
                key={item.id}
                href={`/${locale}/news/${item.slugId}`}
                className="group relative block flex-1 overflow-hidden rounded-sm"
              >
                <article className="relative h-full min-h-[60px] w-full">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#142963]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2.5">
                    <span className="inline-block w-fit rounded-sm bg-[#2FA14B] px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                      {item.sectionTitle || "أخبار"}
                    </span>
                    <h3 className="line-clamp-2 text-xs font-bold leading-snug text-white drop-shadow-sm">
                      {item.title}
                    </h3>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
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
