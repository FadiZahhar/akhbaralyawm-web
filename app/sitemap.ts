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

function buildAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = absoluteUrl(`/${locale}${path}`);
  }
  return alternates;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const locale: Locale = defaultLocale;

  const staticPaths = [
    { path: "/", changeFrequency: "hourly" as const, priority: 1 },
    { path: "/mix", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((entry) => ({
    url: absoluteUrl(`/${locale}${entry.path}`),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    alternates: { languages: buildAlternates(entry.path) },
  }));

  try {
    const [sections, feed] = await Promise.all([getSections(locale), getHomeFeed(200, locale)]);

    const sectionRoutes: MetadataRoute.Sitemap = sections
      .filter((section) => section.link && section.link !== "/")
      .map((section) => ({
        url: absoluteUrl(`/${locale}/category/${section.link}`),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
        alternates: { languages: buildAlternates(`/category/${section.link}`) },
      }));

    const articleRoutes: MetadataRoute.Sitemap = feed.map((item) => ({
      url: absoluteUrl(`/${locale}/news/${item.slugId}`),
      lastModified: item.disdate || now,
      changeFrequency: "daily" as const,
      priority: 0.7,
      alternates: { languages: buildAlternates(`/news/${item.slugId}`) },
    }));

    return [...staticRoutes, ...sectionRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}