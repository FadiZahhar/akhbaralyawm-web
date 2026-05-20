// Locale layout: applies the legacy (mimic) chrome — header + footer +
// scoped Bootstrap CSS — around every locale-scoped page so the site
// frame matches akhbaralyawm.com across home, category, news, author, etc.
//
// `.mimic-root` is applied ONLY around the header and footer here. Pages
// that need legacy Bootstrap on their body (the home page) wrap their own
// content in `.mimic-root` so modern Tailwind pages (category, news, …)
// are unaffected by the scoped Bootstrap reboot.
//
// The pre-mimic modern home is preserved at /[locale]/v1.

import { notFound } from "next/navigation";

import "@/src/components/mimic/legacy/index.css";
import "@/src/components/mimic/mimic.css";

import { SiteHeaderMimic } from "@/src/components/mimic/site-header-mimic";
import { SiteFooterMimic } from "@/src/components/mimic/site-footer-mimic";
import { GoTopButton } from "@/src/components/mimic/sections/go-top-button";
import { getSections } from "@/src/lib/api";
import { isLocale, getDictionary, type Locale } from "@/src/lib/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const [dict, sections] = await Promise.all([
    getDictionary(locale),
    getSections(locale),
  ]);

  return (
    <>
      {/* Legacy fonts (Cairo + Noto Kufi Arabic). React 19 hoists <link>
          tags into <head>. These mirror the original CDN requests so the
          header text metrics match the legacy snapshot exactly. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100;200;300;400;500;600;700;800;900&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      />

      <div className="mimic-root">
        <SiteHeaderMimic
          locale={locale}
          dict={{ nav: dict.nav, site: dict.site }}
          sections={sections}
        />

        {children}

        <SiteFooterMimic
          locale={locale}
          navDict={dict.nav}
          siteName={dict.site.name}
        />
        <GoTopButton />
      </div>
    </>
  );
}
