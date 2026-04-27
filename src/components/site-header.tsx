import Image from "next/image";
import Link from "next/link";

import { getSections } from "@/src/lib/api";
import type { Locale } from "@/src/lib/i18n";
import { SOCIAL_LINKS, SocialIcon } from "@/src/components/social-icons";
import { MobileNav } from "@/src/components/mobile-nav";
import { HeaderSearch } from "@/src/components/header-search";
import { LanguageSwitcher } from "@/src/components/language-switcher";

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

  return (
    <header className="relative bg-white shadow-[0_2px_28px_rgba(0,0,0,0.06)]">
      {/* Top utility bar — legacy light gray */}
      <div className="header-utility-bar border-b border-[#EEEEEE] bg-[#F5F6FA]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-2 text-xs sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#8A8A8A]">
            {/* Visible language switcher: shows AR / EN / FR with the active one highlighted */}
            <LanguageSwitcher locale={locale} />
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
                  <SocialIcon platform={link.platform} className="h-3.5 w-3.5 fill-current" />
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

      {/* Single row: Logo + Navigation + Search icon */}
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="inline-flex shrink-0 items-center">
          <Image
            src={locale === "fr" ? "/assets/img/logo-fr.png" : locale === "en" ? "/assets/img/logo-en.png" : "/assets/img/logo.png"}
            alt={dict.site.name}
            width={238}
            height={60}
            className="h-auto w-[200px]"
            priority
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjM4IiBoZWlnaHQ9IjYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMzgiIGhlaWdodD0iNjAiIGZpbGw9IiNmNWY2ZmEiLz48L3N2Zz4="
          />
        </Link>

        {/* Desktop navigation — single row beside logo */}
        <nav className="hidden flex-1 md:block">
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
                  href={`/${locale}/category/${item.slug}`}
                  className="inline-flex px-2.5 py-2 transition hover:text-[#2FA14B]"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Search icon — opens overlay */}
        <div className="hidden md:flex">
          <HeaderSearch
            locale={locale}
            placeholder={dict.site.searchPlaceholder}
            buttonLabel={dict.site.searchButton}
          />
        </div>

        {/* Mobile hamburger */}
        <MobileNav
          locale={locale}
          homeHref={`/${locale}`}
          homeLabel={dict.nav.home}
          mixHref={`/${locale}/mix`}
          mixLabel={dict.nav.mix}
          navItems={navItems.map((item) => ({
            id: item.id,
            href: `/${locale}/category/${item.slug}`,
            label: item.title,
          }))}
        />
      </div>
    </header>
  );
}