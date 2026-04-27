import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";

import { PreviewModeBanner } from "@/src/components/preview-mode-banner";
import { SiteFooter } from "@/src/components/site-footer";
import { SiteHeader } from "@/src/components/site-header";
import { StickyHeaderWrapper } from "@/src/components/sticky-header-wrapper";
import { BreakingTicker } from "@/src/components/home/breaking-ticker";
import { RouteProgressBar } from "@/src/components/route-progress";
import { getHomeFeed, getAssetUrl } from "@/src/lib/api";
import { isLocale, getDirection, getDictionary, locales, defaultLocale, type Locale } from "@/src/lib/i18n";

import "./globals.css";

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.akhbaralyawm.com").replace(/\/+$/, "");

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const rawLocale = headerStore.get("x-locale") ?? "ar";
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dict = await getDictionary(locale);

  // Build per-locale hreflang alternates for the current path. We can't read
  // the request path reliably at the root layout, so we point each locale at
  // its own homepage as the safe default. Page-level metadata (article,
  // category, author) overrides `alternates.canonical` and adds path-aware
  // hreflang where it matters most for SEO.
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${SITE_URL}/${l}`;
  }
  languages["x-default"] = `${SITE_URL}/${defaultLocale}`;

  return {
    title: {
      default: dict.site.name,
      template: `%s | ${dict.site.name}`,
    },
    description: dict.site.description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.png", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      siteName: dict.site.name,
      locale: locale === "ar" ? "ar_AR" : locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locales.filter((l) => l !== locale).map((l) => (l === "ar" ? "ar_AR" : l === "fr" ? "fr_FR" : "en_US")),
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const isPreviewMode = Boolean(cookieStore.get("previewToken")?.value);

  const rawLocale = headerStore.get("x-locale") ?? "ar";
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const dir = getDirection(locale);
  const dict = await getDictionary(locale);

  const feed = await getHomeFeed(20, locale);
  const tickerItems = feed.map((item) => ({
    id: item.id,
    slugId: item.slugId,
    title: item.title,
    photoUrl: getAssetUrl(item.photoPath),
  }));

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Akhbar Alyawm",
    url: SITE_URL,
    logo: absoluteUrl("/assets/img/logo.png"),
    sameAs: [
      "https://www.facebook.com/akhbaralyawm78/",
      "https://twitter.com/akhbaralyawm",
      "https://www.instagram.com/akhbaralyawmleb/",
      "https://www.youtube.com/channel/UCKbs9xURKdoJ3I99QqFygdQ?sub_confirmation=1",
      "https://nabd.com/akhbaralyawm",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Akhbar Alyawm",
    url: SITE_URL,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${notoKufiArabic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[color:var(--page-bg)] text-[color:var(--foreground)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <div className="min-h-full">
          <RouteProgressBar />
          {isPreviewMode ? <PreviewModeBanner activeLabel={dict.preview.active} exitLabel={dict.preview.exit} /> : null}
          <StickyHeaderWrapper>
            <SiteHeader locale={locale} dict={{ nav: dict.nav, site: dict.site }} />
            <BreakingTicker locale={locale} label={dict.ticker.breaking} items={tickerItems} />
          </StickyHeaderWrapper>
          <div className="flex min-h-[calc(100vh-12rem)] flex-col">{children}</div>
          <SiteFooter locale={locale} dict={dict.footer} navDict={dict.nav} />
        </div>
      </body>
    </html>
  );
}
