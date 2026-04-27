import type { MetadataRoute } from "next";

export const revalidate = 120;

import { getHomeFeed, getSections } from "@/src/lib/api";
import { locales, defaultLocale, type Locale } from "@/src/lib/i18n";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.akhbaralyawm.com").replace(/\/+$/, "");

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

/**
 * Build the per-locale alternates map for a given locale-agnostic path.
 * The current locale's URL is also included (Google requires self-reference)
 * plus an `x-default` pointing at the default locale.
 */
function buildAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = absoluteUrl(`/${locale}${path}`);
  }
  alternates["x-default"] = absoluteUrl(`/${defaultLocale}${path}`);
  return alternates;
}

type StaticEntry = {
  path: string;
  changeFrequency: "hourly" | "daily" | "monthly";
  priority: number;
};

const STATIC_PATHS: StaticEntry[] = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/mix", changeFrequency: "daily", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Static routes \u2014 emit one entry per locale so the sitemap covers the full
  // multilingual surface, and each entry carries hreflang alternates.
  for (const locale of locales) {
    for (const entry of STATIC_PATHS) {
      entries.push({
        url: absoluteUrl(`/${locale}${entry.path}`),
        lastModified: now,
        changeFrequency: entry.changeFrequency,
        priority: entry.priority,
        alternates: { languages: buildAlternates(entry.path) },
      });
    }
  }

  // Dynamic routes per locale. Each locale fetches its own translated set so
  // section/article slugs reflect the locale (post backendfix Phase 1).
  await Promise.all(
    locales.map(async (locale: Locale) => {
      try {
        const [sections, feed] = await Promise.all([
          getSections(locale),
          getHomeFeed(200, locale),
        ]);

        for (const section of sections) {
          if (!section.link || section.link === "/") continue;
          entries.push({
            url: absoluteUrl(`/${locale}/category/${section.slug}`),
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
            alternates: { languages: buildAlternates(`/category/${section.slug}`) },
          });
        }

        for (const item of feed) {
          entries.push({
            url: absoluteUrl(`/${locale}/news/${item.slugId}`),
            lastModified: item.disdate || now,
            changeFrequency: "daily",
            priority: 0.7,
            alternates: { languages: buildAlternates(`/news/${item.slugId}`) },
          });
        }
      } catch {
        // Per-locale failures must not break the whole sitemap.
      }
    }),
  );

  return entries;
}