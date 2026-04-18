import Image from "next/image";
import Link from "next/link";

import { getArticlesBySection, getAssetUrl, getHomeFeed, getSectionBySlugOrId } from "@/src/lib/api";

export const revalidate = 120;
import { HomeHero } from "@/src/components/home/home-hero";
import { HomeSectionBlock } from "@/src/components/home/home-section-block";
import { CategorySlider } from "@/src/components/home/category-slider";
import { AdBanner } from "@/src/components/home/ad-banner";
import { FeaturedSectionSlider } from "@/src/components/home/featured-section-slider";
import { VideoPrograms } from "@/src/components/home/video-programs";
import { MostReadSlider } from "@/src/components/home/most-read-slider";
import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

const FEATURED_SECTION_ID = 29;
const PROGRAMS_SECTION_ID = 56;
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

  // Fetch 20 articles for the featured slider section
  const featuredGroup = homeSections.find((g) => g.section.id === FEATURED_SECTION_ID);
  let featuredSliderItems: { id: number; slugId: string; title: string; imageUrl: string | null; locale: string }[] = [];
  if (featuredGroup) {
    const featuredStories = await getArticlesBySection(featuredGroup.section.link, 1, 20, locale);
    featuredSliderItems = featuredStories.items.map((story) => ({
      id: story.id,
      slugId: story.slugId,
      title: story.title,
      imageUrl: getAssetUrl(story.photoPath),
      locale,
    }));
  }

  const regularSections = homeSections.filter((g) => g.section.id !== FEATURED_SECTION_ID);

  // Fetch programs (البرامج) section for video slider
  const programsSection = await getSectionBySlugOrId(String(PROGRAMS_SECTION_ID), locale);
  let videoItems: { id: number; title: string; thumbnail: string | null; youtubeId: string }[] = [];
  if (programsSection && programsSection.link !== "/") {
    const programStories = await getArticlesBySection(programsSection.link, 1, 20, locale);
    videoItems = programStories.items.map((story) => ({
      id: story.id,
      title: story.title,
      thumbnail: getAssetUrl(story.photoPath),
      youtubeId: "", // API doesn't provide YouTube IDs yet
    }));
  }
  // Fallback: use Akhbar Alyawm YouTube channel videos until API supports video URLs
  const FALLBACK_VIDEOS = [
    { id: 9001, title: "بالفيديو- هل سيصمد سعر الصرف والاقتصاد؟! ... الاموال الموجودة في مصرف لبنان ليست له", thumbnail: "https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg", youtubeId: "JGwWNGJdvx8" },
    { id: 9002, title: "بالفيديو – ملف الاسلاميين الذين غادروا إلى سوريا فتح بقوة والحل بعفو عام", thumbnail: "https://img.youtube.com/vi/LXb3EKWsInQ/hqdefault.jpg", youtubeId: "LXb3EKWsInQ" },
    { id: 9003, title: "حوار خاص مع الوزير السابق حول مستقبل الاقتصاد اللبناني", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", youtubeId: "dQw4w9WgXcQ" },
    { id: 9004, title: "ندوة حول الاصلاحات المطلوبة في القطاع المصرفي", thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg", youtubeId: "9bZkp7q19f0" },
    { id: 9005, title: "تقرير خاص: التحديات الامنية على الحدود الشمالية", thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg", youtubeId: "kJQP7kiw5Fk" },
    { id: 9006, title: "مقابلة حصرية حول ملف النازحين والعودة الطوعية", thumbnail: "https://img.youtube.com/vi/RgKAFK5djSk/hqdefault.jpg", youtubeId: "RgKAFK5djSk" },
  ];
  // Use API items if they have youtubeIds, otherwise use fallback
  const finalVideos = videoItems.some((v) => v.youtubeId) ? videoItems : FALLBACK_VIDEOS;

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
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciPjxzdG9wIHN0b3AtY29sb3I9IiNlMmU1ZWMiIG9mZnNldD0iMjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI2YwZjJmNSIgb2Zmc2V0PSI1MCUiLz48c3RvcCBzdG9wLWNvbG9yPSIjZTJlNWVjIiBvZmZzZXQ9IjgwJSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZTJlNWVjIi8+PC9zdmc+"
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

      {/* Banner ad between hero and sections */}
      <AdBanner />

      {/* Featured section — one-by-one slider */}
      {featuredGroup && featuredSliderItems.length > 0 && (
        <FeaturedSectionSlider
          locale={locale}
          sectionTitle={featuredGroup.section.title}
          sectionLink={featuredGroup.section.link}
          items={featuredSliderItems}
        />
      )}

      <section className="grid gap-8">
        {regularSections.map((group, index) => (
          <div key={group.section.id}>
            <HomeSectionBlock
              locale={locale}
              section={group.section}
              stories={group.stories}
              formatDate={formatDate}
              dict={{ section: dict.sidebar.section, showMore: dict.common.showMore }}
            />
            {/* Second banner after the first section (politics) */}
            {index === 0 && (
              <div className="mt-8">
                <AdBanner banner={{ imageUrl: "/assets/img/banner-placeholder-2.svg", href: "#", alt: "إعلان" }} />
              </div>
            )}
            {/* Programs video section after second banner */}
            {index === 0 && (
              <div className="mt-8">
                <VideoPrograms
                  sectionTitle={programsSection?.title ?? "البرامج"}
                  items={finalVideos}
                />
              </div>
            )}
          </div>
        ))}
      </section>
    </main>

    {/* Most Read — full-width green slider before footer */}
    <MostReadSlider
      label={dict.sidebar.mostRead}
      items={feed.slice(0, 15).map((item) => ({
        id: item.id,
        slugId: item.slugId,
        title: item.title,
        imageUrl: getAssetUrl(item.photoPath),
        locale,
      }))}
    />
    </>
  );
}
