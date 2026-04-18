import Image from "next/image";
import Link from "next/link";

import { getSections } from "@/src/lib/api";
import type { Locale } from "@/src/lib/i18n";
import { SOCIAL_LINKS, SocialIcon } from "@/src/components/social-icons";
import { MobileNav } from "@/src/components/mobile-nav";

const PRIMARY_SECTION_IDS = [29, 45, 39, 30, 46, 33, 56];

function formatToday(locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-LB" : locale, {
    dateStyle: "medium",
  }).format(new Date());
}

type SiteHeaderProps = {
  locale?: Locale;
  dict: {
    nav: { home: string; about: string; contact: string; mix: string };
    site: { name: string; tagline: string; searchPlaceholder: string; searchButton: string };
  };
};

export async function SiteHeader({ locale = "ar" as Locale, dict }: SiteHeaderProps) {
  const sections = await getSections(locale);
  const navItems = PRIMARY_SECTION_IDS.map((id) => sections.find((section) => section.id === id)).filter(
    (section): section is NonNullable<(typeof sections)[number]> => Boolean(section && section.link !== "/"),
  );

  const topLinks = [
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const langLinks = (["ar", "en", "fr"] as const)
    .filter((l) => l !== locale)
    .map((l) => ({ href: `/${l}`, label: l.toUpperCase() }));

  return (
    <header className="relative bg-white shadow-[0_2px_28px_rgba(0,0,0,0.06)]">
      {/* Top utility bar — legacy light gray */}
      <div className="border-b border-[#EEEEEE] bg-[#F5F6FA]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-2 text-xs sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#8A8A8A]">
            {langLinks.map((link) => (
              <Link key={link.label} href={link.href} className="font-bold transition hover:text-[#142963]">
                {link.label}
              </Link>
            ))}
            <div className="h-4 w-px bg-[#DCDCDC]" />
            {topLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-[#142963]">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Social icons */}
            <div className="flex items-center gap-2 text-[#8A8A8A]">
              {SOCIAL_LINKS.slice(0, 5).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="transition hover:text-[#2FA14B]"
                >
                  <SocialIcon platform={link.platform} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
            <div className="h-4 w-px bg-[#DCDCDC]" />
            {/* Date badge — legacy green */}
            <span className="rounded-sm bg-[#2FA14B] px-3 py-1.5 text-[13px] font-semibold text-white">
              {formatToday(locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Logo + Search bar + Mobile hamburger */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:justify-between">
          <Link href={`/${locale}`} className="inline-flex shrink-0 items-center">
            <Image
              src={locale === "fr" ? "/assets/img/logo-fr.png" : locale === "en" ? "/assets/img/logo-en.png" : "/assets/img/logo.png"}
              alt={dict.site.name}
              width={238}
              height={60}
              className="h-auto w-[200px]"
              priority
            />
          </Link>

          <form action={`/${locale}/search`} method="get" className="hidden w-full max-w-md items-center gap-2 md:flex lg:w-[380px]">
            <div className="relative w-full">
              <input
                type="search"
                name="q"
                placeholder={dict.site.searchPlaceholder}
                className="h-11 w-full rounded border border-[#DCDCDC] bg-transparent px-4 pe-10 text-sm text-[#70798B] outline-none focus:border-[#2FA14B]"
              />
              <button
                type="submit"
                className="absolute end-0 top-0 flex h-11 w-11 items-center justify-center text-[#70798B] transition hover:text-[#2FA14B]"
                aria-label={dict.site.searchButton}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Mobile hamburger */}
          <MobileNav
            homeHref={`/${locale}`}
            homeLabel={dict.nav.home}
            mixHref={`/${locale}/mix`}
            mixLabel={dict.nav.mix}
            navItems={navItems.map((item) => ({
              id: item.id,
              href: `/${locale}/category/${item.link}`,
              label: item.title,
            }))}
          />
        </div>

        {/* Desktop navigation — hidden on mobile */}
        <nav className="hidden border-t border-[#EEEEEE] pt-2 md:block">
          <ul className="flex flex-wrap items-center gap-1 text-[17px] font-bold text-[#142963]">
            <li>
              <Link
                href={`/${locale}`}
                className="inline-flex px-2.5 py-2 transition hover:text-[#2FA14B]"
              >
                {dict.nav.home}
              </Link>
            </li>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/${locale}/category/${item.link}`}
                  className="inline-flex px-2.5 py-2 transition hover:text-[#2FA14B]"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/${locale}/mix`}
                className="inline-flex px-2.5 py-2 transition hover:text-[#2FA14B]"
              >
                {dict.nav.mix}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}