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
import { PopularNewsCarousel } from "@/src/components/mimic/sections/popular-news-carousel";
import { SectionGrid } from "@/src/components/mimic/sections/section-grid";
import { VideoNewsArea } from "@/src/components/mimic/sections/video-news-area-mimic";
import { MostReadStrip } from "@/src/components/mimic/sections/most-read-strip";
import { GoTopButton } from "@/src/components/mimic/sections/go-top-button";

export const revalidate = 120;

const FEATURED_SECTION_ID = 29; // خاص اليوم
const PROGRAMS_SECTION_ID = 56; // البرامج
const LOCAL_NEWS_SECTION_ID = 45; // أخبار محلية
const WORLD_SECTION_ID = 30; // العرب والعالم
const MISC_SECTION_ID = 39; // متفرقات

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
    getHomeFeed(100, locale),
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

  const [localNewsGroup, worldGroup, miscGroup] = await Promise.all([
    (async () => {
      const sec = await getSectionBySlugOrId(String(LOCAL_NEWS_SECTION_ID), locale);
      if (!sec) return null;
      const list = await getArticlesBySection(sec.link, 1, 8, locale);
      return { section: sec, items: list.items };
    })(),
    (async () => {
      const sec = await getSectionBySlugOrId(String(WORLD_SECTION_ID), locale);
      if (!sec) return null;
      const list = await getArticlesBySection(sec.link, 1, 8, locale);
      return { section: sec, items: list.items };
    })(),
    (async () => {
      const sec = await getSectionBySlugOrId(String(MISC_SECTION_ID), locale);
      if (!sec) return null;
      const list = await getArticlesBySection(sec.link, 1, 8, locale);
      return { section: sec, items: list.items };
    })(),
  ]);

  // Slice the feed into the various hero pieces.
  const tickerStrip = feed.slice(0, 5).map((f) => ({
    id: f.id,
    slugId: f.slugId,
    title: f.title,
    locale,
  }));
  const updates = feed.slice(0, 100).map((f) => ({
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
  // 3 small cards rendered in the right-hand col-lg-2 column of the hero,
  // matching the legacy `single-new-news` stack. Skip the first slide (which
  // is already shown as the big carousel card) so we don't repeat the lead.
  const sideCards = feed.slice(6, 9).map((f) => ({
    id: f.id,
    slugId: f.slugId,
    title: f.title,
    sectionTitle: f.sectionTitle,
    imageUrl: getAssetUrl(f.photoPath, locale),
  }));
  const moreNewsItems = feed.slice(10, 13);
  const liveUpdatesLabel = locale === "ar" ? "لحظة بلحظة" : dict.sidebar.lastMoment;
  const mostReadLabel = locale === "ar" ? "الأكثر قراءةً" : dict.sidebar.mostRead;

  return (
    <>
      <SiteHeaderMimic locale={locale} dict={{ nav: dict.nav, site: dict.site }} sections={sections} />

      {/* Compact top stories strip under the logo/navigation */}
      <MoreNewsArea locale={locale} items={moreNewsItems} />

      <div className="default-news-area pt-5 pb-4">
        {/* Hero: left live updates + right carousel */}
        <HeroNewsArea
          locale={locale}
          liveLabel={liveUpdatesLabel}
          slides={slides}
          updates={updates}
          sideCards={sideCards}
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
          <PopularNewsCarousel
            locale={locale}
            sectionTitle={featuredSection.title}
            sectionHref={`/${locale}/category/${featuredSection.slug}`}
            items={featuredItems.map((s) => ({
              id: s.id,
              slugId: s.slugId,
              title: s.title,
              imageUrl: getAssetUrl(s.photoPath, locale),
            }))}
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

        {/* أخبار محلية appears before programs on live homepage */}
        {localNewsGroup && localNewsGroup.items.length > 0 && (
          <SectionGrid
            locale={locale}
            sectionTitle={localNewsGroup.section.title}
            sectionHref={`/${locale}/category/${localNewsGroup.section.slug}`}
            items={localNewsGroup.items.slice(0, 3).map((s) => ({
              id: s.id,
              slugId: s.slugId,
              title: s.title,
              imageUrl: getAssetUrl(s.photoPath, locale),
            }))}
            variant="default"
          />
        )}

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

        {/* العرب والعالم */}
        {worldGroup && worldGroup.items.length > 0 && (
          <SectionGrid
            locale={locale}
            sectionTitle={worldGroup.section.title}
            sectionHref={`/${locale}/category/${worldGroup.section.slug}`}
            items={worldGroup.items.slice(0, 3).map((s) => ({
              id: s.id,
              slugId: s.slugId,
              title: s.title,
              imageUrl: getAssetUrl(s.photoPath, locale),
            }))}
            variant="hot"
            sectionClassName="ptb-40"
          />
        )}

        {/* متفرقات */}
        {miscGroup && miscGroup.items.length > 0 && (
          <SectionGrid
            locale={locale}
            sectionTitle={miscGroup.section.title}
            sectionHref={`/${locale}/category/${miscGroup.section.slug}`}
            items={miscGroup.items.slice(0, 3).map((s) => ({
              id: s.id,
              slugId: s.slugId,
              title: s.title,
              imageUrl: getAssetUrl(s.photoPath, locale),
            }))}
            variant="hot"
            sectionClassName="pb-40"
          />
        )}

        {/* Most-read closing strip */}
        <MostReadStrip
          locale={locale}
          sectionTitle={mostReadLabel}
          items={feed.slice(0, 12).map((f) => ({
            id: f.id,
            slugId: f.slugId,
            title: f.title,
            imageUrl: getAssetUrl(f.photoPath, locale),
          }))}
        />
      </div>

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
