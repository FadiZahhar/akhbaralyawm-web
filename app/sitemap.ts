import type { MetadataRoute } from "next";

import { getHomeFeed, getSections } from "@/src/lib/api";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.akhbaralyawm.com").replace(/\/+$/, "");

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: absoluteUrl("/mix"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const [sections, feed] = await Promise.all([getSections(), getHomeFeed(200)]);

    const sectionRoutes: MetadataRoute.Sitemap = sections
      .filter((section) => section.link && section.link !== "/")
      .map((section) => ({
        url: absoluteUrl(`/category/${section.link}`),
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      }));

    const articleRoutes: MetadataRoute.Sitemap = feed.map((item) => ({
      url: absoluteUrl(`/news/${item.slugId}`),
      lastModified: item.disdate || now,
      changeFrequency: "daily",
      priority: 0.7,
    }));

    return [...staticRoutes, ...sectionRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}