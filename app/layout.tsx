import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";

import { PreviewModeBanner } from "@/src/components/preview-mode-banner";
import { SiteFooter } from "@/src/components/site-footer";
import { SiteHeader } from "@/src/components/site-header";
import { isLocale, getDirection, type Locale } from "@/src/lib/i18n";

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

export const metadata: Metadata = {
  title: {
    default: "أخبار اليوم",
    template: "%s | أخبار اليوم",
  },
  description: "منصة إخبارية عربية حديثة مبنية على Next.js وتجربة Headless CMS.",
  metadataBase: new URL(SITE_URL),
};

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

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Akhbar Alyawm",
    url: SITE_URL,
    logo: absoluteUrl("/favicon.png"),
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
          {isPreviewMode ? <PreviewModeBanner /> : null}
          <SiteHeader locale={locale} />
          <div className="flex min-h-[calc(100vh-12rem)] flex-col">{children}</div>
          <SiteFooter locale={locale} />
        </div>
      </body>
    </html>
  );
}
