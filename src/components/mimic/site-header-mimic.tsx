import Link from "next/link";
import Image from "next/image";

import type { SectionDto } from "@/src/lib/api";
import type { Locale } from "@/src/lib/i18n";

import {
  IcoFontIcon,
} from "./icons";

type HeaderDict = {
  nav: { home: string; about: string; contact: string };
  site: { name: string; searchPlaceholder: string };
};

type Props = {
  locale: Locale;
  dict: HeaderDict;
  sections: SectionDto[];
  /** Slug or id of the section currently active (so its nav item gets highlighted). */
  activeSectionSlug?: string;
};

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/akhbaralyawm78/", label: "Facebook", icon: "facebook" },
  { href: "https://twitter.com/akhbaralyawm", label: "Twitter", icon: "twitter" },
  { href: "https://www.instagram.com/akhbaralyawmleb/", label: "Instagram", icon: "instagram" },
  { href: "https://www.youtube.com/channel/UCKbs9xURKdoJ3I99QqFygdQ?sub_confirmation=1", label: "YouTube", icon: "youtube" },
  { href: "https://nabd.com/akhbaralyawm", label: "RSS", icon: "rss" },
];

function formatDate(locale: Locale): string {
  const date = new Date();
  const lang = locale === "ar" ? "ar-LB" : locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(lang, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function SiteHeaderMimic({ locale, dict, sections, activeSectionSlug }: Props) {
  const homeHref = `/${locale}/v2`;
  const localeSwitch = [
    { code: "fr", href: "/fr/v2", label: "FR" },
    { code: "en", href: "/en/v2", label: "EN" },
  ].filter((l) => l.code !== locale);

  return (
    <header className="header-area">
      {/* Top utility bar */}
      <div className="top-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-8">
              <ul className="top-nav">
                {localeSwitch.map((l) => (
                  <li key={l.code}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
                <li>
                  <Link href={`/${locale}/about`}>{dict.nav.about}</Link>
                </li>
                <li>
                  <Link href={`/${locale}/contact`}>{dict.nav.contact}</Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-6 col-md-4 text-end">
              <ul className="top-social" aria-label="Social links">
                {SOCIAL_LINKS.map(({ href, label, icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <IcoFontIcon name={icon} />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="header-date">
                <IcoFontIcon name="clock-time" />
                {formatDate(locale)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="navbar-area">
        <div className="sinmun-mobile-nav">
          <div className="logo tt">
            <Link href={homeHref} aria-label={dict.site.name}>
              <Image src="/assets/img/logo.png" alt={dict.site.name} width={200} height={56} className="mm" />
              <Image src="/assets/img/logo.png" alt={dict.site.name} width={200} height={56} className="ll" />
            </Link>
          </div>
        </div>
        <div className="sinmun-nav">
          <div className="container">
            <nav className="navbar navbar-expand-md navbar-light tt">
              <Link href={homeHref} className="navbar-brand" aria-label={dict.site.name}>
                <Image
                  src="/assets/img/logo.png"
                  alt={dict.site.name}
                  width={200}
                  height={56}
                  priority
                  className="mm"
                />
              </Link>

              <div className="collapse navbar-collapse mean-menu" id="navbarSupportedContent" style={{ display: "block" }}>
                <ul className="navbar-nav">
                  <li className={`nav-item${!activeSectionSlug ? " mactive" : ""}`}>
                    <Link href={homeHref} className="nav-link">
                      {dict.nav.home}
                    </Link>
                  </li>
                  {sections.map((section) => {
                    const isActive =
                      activeSectionSlug != null &&
                      (activeSectionSlug === section.slug || activeSectionSlug === String(section.id));
                    return (
                      <li key={section.id} className={`nav-item${isActive ? " mactive" : ""}`}>
                        <Link href={`/${locale}/category/${section.slug}`} className="nav-link">
                          {section.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="others-options">
                  <div className="header-search d-inline-block">
                    <div className="nav-search">
                      <div className="nav-search-button" aria-hidden="true">
                        <IcoFontIcon name="ui-search" />
                      </div>
                      <form action={`/${locale}/search`} method="get" role="search">
                        <span className="nav-search-close-button" tabIndex={0}>✕</span>
                        <div className="nav-search-inner">
                          <input
                            name="q"
                            id="id"
                            placeholder="Search here...."
                            aria-label={dict.site.searchPlaceholder}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
