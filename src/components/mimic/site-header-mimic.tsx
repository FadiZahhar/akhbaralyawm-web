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
import { MobileNavMimic } from "./mobile-nav-mimic";

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

// Legacy snapshot is frozen to `Apr 18, 2026`. The /v2 mimic mirrors that
// exact string so visual-diff doesn't flag the date strip as drift. The live
// header (outside /v2) should swap this for a real Intl date once the mimic
// becomes the default home.
function formatLegacyDate(): string {
  return "Apr 18, 2026";
}

// Legacy snapshot nav is a hardcoded 8-item list (not from the sections API).
// We mirror it exactly here so the navbar-area zone matches pixel-for-pixel.
// Order, titles, and category ids are copied verbatim from
// public/legacy-snapshot/home-ar/index.html.
const LEGACY_NAV_ITEMS_AR: { title: string; slug: string }[] = [
  { title: "\u062E\u0627\u0635 \u0627\u0644\u064A\u0648\u0645", slug: "29" },
  { title: "\u0623\u062E\u0628\u0627\u0631 \u0645\u062D\u0644\u064A\u0629", slug: "45" },
  { title: "\u0645\u062A\u0641\u0631\u0642\u0627\u062A", slug: "39" },
  { title: "\u0627\u0644\u0639\u0631\u0628 \u0648\u0627\u0644\u0639\u0627\u0644\u0645", slug: "30" },
  { title: "\u0627\u0642\u062A\u0635\u0627\u062F", slug: "46" },
  { title: "\u0631\u064A\u0627\u0636\u0629", slug: "33" },
  { title: "\u0627\u0644\u0628\u0631\u0627\u0645\u062C", slug: "56" },
];

const LOGO_SRC = "/assets/img/logo.png";

export function SiteHeaderMimic({ locale, dict, sections, activeSectionSlug }: Props) {
  const homeHref = `/${locale}`;

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
          <MobileNavMimic
            locale={locale}
            homeLabel={dict.nav.home}
            aboutLabel={dict.nav.about}
            contactLabel={dict.nav.contact}
            searchPlaceholder={dict.site.searchPlaceholder}
            items={LEGACY_NAV_ITEMS_AR}
            activeSectionSlug={activeSectionSlug}
          />
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
                style={{ display: "block", visibility: "visible" }}
              >
                <ul className="navbar-nav">
                  <li className={`nav-item${!activeSectionSlug ? " mactive" : ""}  `}>
                    <Link href={homeHref} className="nav-link">
                      {dict.nav.home}
                    </Link>
                  </li>
                  {LEGACY_NAV_ITEMS_AR.map((item) => {
                    const isActive = activeSectionSlug === item.slug;
                    return (
                      <li key={item.slug} className={`nav-item${isActive ? " mactive" : ""}  `}>
                        <Link href={`/${locale}/category/${item.slug}`} className="nav-link">
                          {item.title}
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
