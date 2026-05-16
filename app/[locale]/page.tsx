// Default home page = the mimic/legacy layout (was /v2 before May 17 2026).
// The legacy CSS, fonts, header and footer live in app/[locale]/layout.tsx
// so they wrap every locale-scoped page (category, news, author, …).
// The pre-mimic modern home is preserved at /[locale]/v1.

import fs from "node:fs/promises";
import path from "node:path";

import {
  getArticlesBySection,
  getAssetUrl,
  getHomeFeed,
  getSectionBySlugOrId,
} from "@/src/lib/api";
import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

import { MoreNewsArea } from "@/src/components/mimic/sections/more-news-area";
import { NewsTickerStrip } from "@/src/components/mimic/sections/news-ticker-strip";
import { HeroNewsArea } from "@/src/components/mimic/sections/hero-news-area";
import { PopularNewsCarousel } from "@/src/components/mimic/sections/popular-news-carousel";
import { SectionGrid } from "@/src/components/mimic/sections/section-grid";
import { VideoNewsArea } from "@/src/components/mimic/sections/video-news-area-mimic";
import { MostReadStrip } from "@/src/components/mimic/sections/most-read-strip";

export const revalidate = 120;

const FEATURED_SECTION_ID = 29; // خاص اليوم
const PROGRAMS_SECTION_ID = 56; // البرامج
const LOCAL_NEWS_SECTION_ID = 45; // أخبار محلية
const WORLD_SECTION_ID = 30; // العرب والعالم
const MISC_SECTION_ID = 39; // متفرقات

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatTime(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default async function MimicHomePage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const sp = await searchParams;
  const useFixture = sp.fixture === "1";
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  const [feed, featuredSection, programsSection] = await Promise.all([
    getHomeFeed(100, locale),
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

  // Pixel-parity fixture mode (?fixture=1, ar only). Freezes newsUpdates +
  // section card titles to the Apr 18 reference snapshot for visual diff.
  let updatesForRender = updates;
  let sectionTitles: Record<string, string[]> = {};
  if (locale === "ar" && useFixture) {
    try {
      const fixturePath = path.join(
        process.cwd(),
        "tests/fixtures/legacy-newsupdates-ar.json",
      );
      const raw = await fs.readFile(fixturePath, "utf8");
      const parsed = JSON.parse(raw) as Array<{
        id: number;
        slugId: string;
        title: string;
        time: string;
      }>;
      updatesForRender = parsed.slice(0, 100);
    } catch (err) {
      console.warn("[home] failed to load newsUpdates fixture:", err);
    }
    try {
      const secPath = path.join(
        process.cwd(),
        "tests/fixtures/legacy-sections-ar.json",
      );
      const secRaw = await fs.readFile(secPath, "utf8");
      const secParsed = JSON.parse(secRaw) as Record<
        string,
        Array<{ href: string; title: string }>
      >;
      for (const [k, arr] of Object.entries(secParsed)) {
        sectionTitles[k.replace(/\s+/g, " ").trim()] = arr.map((a) => a.title);
      }
    } catch (err) {
      console.warn("[home] failed to load sections fixture:", err);
    }
  }
  const applyTitles = <T extends { title: string }>(
    items: T[],
    key: string | undefined,
  ): T[] => {
    if (!useFixture || !key) return items;
    const normKey = key.replace(/\s+/g, " ").trim();
    const titles = sectionTitles[normKey];
    if (!titles?.length) return items;
    return items.map((it, i) =>
      i < titles.length ? { ...it, title: titles[i] } : it,
    );
  };

  const slides = feed.slice(0, 6).map((f) => ({
    id: f.id,
    slugId: f.slugId,
    title: f.title,
    sectionTitle: f.sectionTitle,
    imageUrl: getAssetUrl(f.photoPath, locale),
  }));
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
    <div className="mimic-root">
      <MoreNewsArea locale={locale} items={moreNewsItems} />

      <div className="default-news-area pt-5 pb-4">
        <HeroNewsArea
          locale={locale}
          liveLabel={liveUpdatesLabel}
          slides={slides}
          updates={updatesForRender}
          sideCards={sideCards}
        />
      </div>

      <div className="text-center pt-5 pb-5">
        <a target="_blank" rel="noopener noreferrer" href="https://lexuslebanon.com/newvehicles/60/nx">
          <img
            src="/%D8%A7%D9%84%D9%8A%D9%88%D9%85_files/yaris.jpg"
            alt="Lexus banner"
            style={{ maxWidth: 900, width: "100%", transform: "scale(1)" }}
          />
        </a>
      </div>

      <hr />

      {featuredSection && featuredItems.length > 0 && (
        <PopularNewsCarousel
          locale={locale}
          sectionTitle={featuredSection.title}
          sectionHref={`/${locale}/category/${featuredSection.slug}`}
          items={applyTitles(featuredItems.map((s) => ({
            id: s.id,
            slugId: s.slugId,
            title: s.title,
            imageUrl: getAssetUrl(s.photoPath, locale),
          })), featuredSection?.title)}
        />
      )}

      {localNewsGroup && localNewsGroup.items.length > 0 && (
        <SectionGrid
          locale={locale}
          sectionTitle={localNewsGroup.section.title}
          sectionHref={`/${locale}/category/${localNewsGroup.section.slug}`}
          items={applyTitles(localNewsGroup.items.slice(0, 3).map((s) => ({
            id: s.id,
            slugId: s.slugId,
            title: s.title,
            imageUrl: getAssetUrl(s.photoPath, locale),
          })), localNewsGroup.section.title)}
          variant="default"
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

      {programsSection && programsItems.length > 0 && (
        <VideoNewsArea
          locale={locale}
          sectionTitle={programsSection.title}
          sectionHref={`/${locale}/category/${programsSection.slug}`}
          items={applyTitles(programsItems.map((s) => ({
            id: s.id,
            slugId: s.slugId,
            title: s.title,
            imageUrl: getAssetUrl(s.photoPath, locale),
            sectionTitle: s.sectionTitle,
          })), programsSection?.title)}
        />
      )}

      {worldGroup && worldGroup.items.length > 0 && (
        <SectionGrid
          locale={locale}
          sectionTitle={worldGroup.section.title}
          sectionHref={`/${locale}/category/${worldGroup.section.slug}`}
          items={applyTitles(worldGroup.items.slice(0, 3).map((s) => ({
            id: s.id,
            slugId: s.slugId,
            title: s.title,
            imageUrl: getAssetUrl(s.photoPath, locale),
          })), worldGroup.section.title)}
          variant="hot"
          sectionClassName="ptb-40"
        />
      )}

      <hr />

      {miscGroup && miscGroup.items.length > 0 && (
        <SectionGrid
          locale={locale}
          sectionTitle={miscGroup.section.title}
          sectionHref={`/${locale}/category/${miscGroup.section.slug}`}
          items={applyTitles(miscGroup.items.slice(0, 3).map((s) => ({
            id: s.id,
            slugId: s.slugId,
            title: s.title,
            imageUrl: getAssetUrl(s.photoPath, locale),
          })), miscGroup.section.title)}
          variant="hot"
          sectionClassName="pb-40"
        />
      )}

      <MostReadStrip
        locale={locale}
        sectionTitle={mostReadLabel}
        items={applyTitles(feed.slice(0, 12).map((f) => ({
          id: f.id,
          slugId: f.slugId,
          title: f.title,
          imageUrl: getAssetUrl(f.photoPath, locale),
        })), mostReadLabel)}
      />

      <NewsTickerStrip label={dict.ticker.breaking} items={tickerStrip} />
    </div>
  );
}
