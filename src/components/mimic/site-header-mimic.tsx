// Iteration 1 header: verbatim port of the legacy `<header class="header-area">`
// markup from public/legacy-snapshot/home-ar/index.html. Class names, element
// order, and inline structure are preserved so the already-scoped legacy CSS
// in src/components/mimic/legacy/ paints it identically to the snapshot.
//
// Differences vs the snapshot are intentional and small:
//   - Nav links are wired to Next.js `/[locale]/category/<slug>` paths.
//   - Search form posts to `/[locale]/search` and uses `q` instead of `id`.
//   - Date is rendered server-side as the current day (legacy snapshot froze
//     it at "Apr 18, 2026" — this delta is data, not design).
//
// Icons use `<i class="icofont-...">` (icofont.min.css is bundled via the
// scoped legacy stylesheets), not SVG components — that matches legacy glyphs.

import Link from "next/link";

import type { SectionDto } from "@/src/lib/api";
import type { Locale } from "@/src/lib/i18n";

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
  { href: "https://www.facebook.com/akhbaralyawm78/", label: "Facebook", icon: "icofont-facebook" },
  { href: "https://twitter.com/akhbaralyawm", label: "Twitter", icon: "icofont-twitter" },
  { href: "https://www.instagram.com/akhbaralyawmleb/", label: "Instagram", icon: "icofont-instagram" },
  {
    href: "https://www.youtube.com/channel/UCKbs9xURKdoJ3I99QqFygdQ?sub_confirmation=1",
    label: "YouTube",
    icon: "icofont-youtube",
  },
  { href: "https://nabd.com/akhbaralyawm", label: "Nabd", icon: "icofont-rss" },
];

// Legacy renders `Apr 18, 2026` — short month + day + year in English regardless
// of the page locale.
function formatLegacyDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

const LOGO_SRC = "/assets/img/logo.png";

export function SiteHeaderMimic({ locale, dict, sections, activeSectionSlug }: Props) {
  const homeHref = `/${locale}/v2`;

  return (
    <header className="header-area ">
      <div className="top-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-8">
              <ul className="top-nav">
                <li>
                  <a href="https://fr.akhbaralyawm.com/">FR</a>
                </li>
                <li>
                  <a href="https://en.akhbaralyawm.com/">EN</a>
                </li>
                <li>
                  <Link href={`/${locale}/about`}>{dict.nav.about}</Link>
                </li>
                <li>
                  <Link href={`/${locale}/contact`}>{dict.nav.contact}</Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-6 col-md-4 text-end">
              <ul className="top-social">
                {SOCIAL_LINKS.map(({ href, label, icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <i className={icon} />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="header-date">
                <i className="icofont-clock-time" />
                {formatLegacyDate()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="navbar-area">
        <div className="sinmun-mobile-nav">
          <div className="logo tt">
            <Link href={homeHref} aria-label={dict.site.name}>
              {/* Plain <img> on purpose — next/image would alter the markup and
                  prevent the legacy `.mm` / `.ll` CSS rules from matching cleanly. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img width={200} src={LOGO_SRC} alt="logo" className="mm" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img width={200} src={LOGO_SRC} alt="logo" className="ll" />
            </Link>
          </div>
        </div>
        <div className="sinmun-nav">
          <div className="container">
            <nav className="navbar navbar-expand-md navbar-light tt">
              <Link className="navbar-brand" href={homeHref} aria-label={dict.site.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img width={200} src={LOGO_SRC} alt="logo" className="mm" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img width={200} src={LOGO_SRC} alt="logo" className="ll" />
              </Link>
              <div
                className="collapse navbar-collapse mean-menu"
                id="navbarSupportedContent"
                style={{ display: "block" }}
              >
                <ul className="navbar-nav">
                  <li className={`nav-item${!activeSectionSlug ? " mactive" : ""}  `}>
                    <Link href={homeHref} className="nav-link">
                      {dict.nav.home}
                    </Link>
                  </li>
                  {sections.map((section) => {
                    const isActive =
                      activeSectionSlug != null &&
                      (activeSectionSlug === section.slug || activeSectionSlug === String(section.id));
                    return (
                      <li key={section.id} className={`nav-item${isActive ? " mactive" : ""}  `}>
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
                      <div className="nav-search-button">
                        <i className="icofont-ui-search" />
                      </div>
                      <form method="get" action={`/${locale}/search`} role="search">
                        <span className="nav-search-close-button" tabIndex={0}>
                          ✕
                        </span>
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
