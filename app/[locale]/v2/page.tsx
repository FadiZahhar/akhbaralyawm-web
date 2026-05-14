import {
  getArticlesBySection,
  getAssetUrl,
  getHomeFeed,
  getSectionBySlugOrId,
  getSections,
} from "@/src/lib/api";
import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

import { SiteHeaderMimic } from "@/src/components/mimic/site-header-mimic";
import { SiteFooterMimic } from "@/src/components/mimic/site-footer-mimic";
import { MoreNewsArea } from "@/src/components/mimic/sections/more-news-area";
import { NewsTickerStrip } from "@/src/components/mimic/sections/news-ticker-strip";
import { HeroNewsArea } from "@/src/components/mimic/sections/hero-news-area";
import { CarouselSection } from "@/src/components/mimic/sections/carousel-section";
import { VideoNewsArea } from "@/src/components/mimic/sections/video-news-area";
import { GoTopButton } from "@/src/components/mimic/sections/go-top-button";

export const revalidate = 120;

const FEATURED_SECTION_ID = 29; // خاص اليوم
const PROGRAMS_SECTION_ID = 56; // البرامج
const HOT_SECTION_IDS = [45, 30, 39, 46, 33];

type PageProps = {
  params: Promise<{ locale: string }>;
};

function formatTime(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default async function MimicHomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  // Parallel fetch — the home page is one big fan-out, but every leaf already
  // degrades gracefully on 5xx (see api.ts), so failures here are bounded.
  const [feed, sections, featuredSection, programsSection] = await Promise.all([
    getHomeFeed(20, locale),
    getSections(locale),
    getSectionBySlugOrId(String(FEATURED_SECTION_ID), locale),
    getSectionBySlugOrId(String(PROGRAMS_SECTION_ID), locale),
  ]);

  const featuredItems = featuredSection
    ? (await getArticlesBySection(featuredSection.link, 1, 12, locale)).items
    : [];
  const programsItems = programsSection
    ? (await getArticlesBySection(programsSection.link, 1, 8, locale)).items
    : [];

  // One row of horizontal "popular" cards per featured ID (in parallel).
  const hotGroups = await Promise.all(
    HOT_SECTION_IDS.map(async (id) => {
      const sec = await getSectionBySlugOrId(String(id), locale);
      if (!sec) return null;
      const list = await getArticlesBySection(sec.link, 1, 8, locale);
      return { section: sec, items: list.items };
    }),
  );
  const validHotGroups = hotGroups.filter((g): g is NonNullable<typeof g> => g !== null && g.items.length > 0);

  // Slice the feed into the various hero pieces.
  const tickerStrip = feed.slice(0, 5).map((f) => ({
    id: f.id,
    slugId: f.slugId,
    title: f.title,
    locale,
  }));
  const updates = feed.slice(0, 12).map((f) => ({
    id: f.id,
    slugId: f.slugId,
    title: f.title,
    time: formatTime(f.disdate),
  }));
  const slides = feed.slice(0, 6).map((f) => ({
    id: f.id,
    slugId: f.slugId,
    title: f.title,
    sectionTitle: f.sectionTitle,
    imageUrl: getAssetUrl(f.photoPath, locale),
  }));
  const moreNewsItems = feed.slice(10, 13);

  return (
    <>
      <SiteHeaderMimic locale={locale} dict={{ nav: dict.nav, site: dict.site }} sections={sections} />

      {/* Compact top stories strip under the logo/navigation */}
      <MoreNewsArea locale={locale} items={moreNewsItems} />

      {/* Hero: left live updates + right carousel */}
      <HeroNewsArea
        locale={locale}
        liveLabel={dict.sidebar.lastMoment}
        slides={slides}
        updates={updates}
      />

      <div className="text-center pt-5 pb-5">
        <a target="_blank" rel="noopener noreferrer" href="https://lexuslebanon.com/newvehicles/60/nx">
          <img
            src="/%D8%A7%D9%84%D9%8A%D9%88%D9%85_files/yaris.jpg"
            alt="Lexus banner"
            style={{ maxWidth: 900, width: "100%", transform: "scale(1)" }}
          />
        </a>
      </div>

      {/* Featured (خاص اليوم) carousel */}
      {featuredSection && featuredItems.length > 0 && (
        <CarouselSection
          locale={locale}
          sectionTitle={featuredSection.title}
          sectionHref={`/${locale}/category/${featuredSection.slug}`}
          items={featuredItems.map((s) => ({
            id: s.id,
            slugId: s.slugId,
            title: s.title,
            imageUrl: getAssetUrl(s.photoPath, locale),
          }))}
          variant="popular"
        />
      )}

      <div className="text-center pt-5 pb-5">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.whish.money/download?utm_source=Download+Akhbar+Al+Yawm+&utm_medium=970+x+250+px"
        >
          <img
            src="/%D8%A7%D9%84%D9%8A%D9%88%D9%85_files/whishbig.jpg"
            alt="Whish banner"
            style={{ maxWidth: 900, width: "100%", transform: "scale(1)" }}
          />
        </a>
      </div>

      {/* Programs (البرامج) videos */}
      {programsSection && programsItems.length > 0 && (
        <VideoNewsArea
          locale={locale}
          sectionTitle={programsSection.title}
          sectionHref={`/${locale}/category/${programsSection.slug}`}
          items={programsItems.map((s) => ({
            id: s.id,
            slugId: s.slugId,
            title: s.title,
            imageUrl: getAssetUrl(s.photoPath, locale),
            sectionTitle: s.sectionTitle,
          }))}
        />
      )}

      {/* Hot sections (one carousel per section) */}
      {validHotGroups.map((g, i) => (
        <CarouselSection
          key={g.section.id}
          locale={locale}
          sectionTitle={g.section.title}
          sectionHref={`/${locale}/category/${g.section.slug}`}
          items={g.items.map((s) => ({
            id: s.id,
            slugId: s.slugId,
            title: s.title,
            imageUrl: getAssetUrl(s.photoPath, locale),
          }))}
          variant="default"
        />
      ))}

      {/* Most-read closing strip */}
      <CarouselSection
        locale={locale}
        sectionTitle={dict.sidebar.mostRead}
        sectionHref={`/${locale}/v2`}
        items={feed.slice(0, 12).map((f) => ({
          id: f.id,
          slugId: f.slugId,
          title: f.title,
          imageUrl: getAssetUrl(f.photoPath, locale),
        }))}
        variant="hot"
      />

      <SiteFooterMimic
        locale={locale}
        navDict={dict.nav}
        siteName={dict.site.name}
      />

      <NewsTickerStrip label={dict.ticker.breaking} items={tickerStrip} />

      <GoTopButton />
    </>
  );
}
