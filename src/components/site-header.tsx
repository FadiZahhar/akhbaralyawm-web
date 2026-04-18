import Image from "next/image";
import Link from "next/link";

import { getSections } from "@/src/lib/api";
import type { Locale } from "@/src/lib/i18n";

const PRIMARY_SECTION_IDS = [29, 45, 39, 30, 46, 33, 56];

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/akhbaralyawm78/", label: "Facebook" },
  { href: "https://twitter.com/akhbaralyawm", label: "X" },
  { href: "https://www.instagram.com/akhbaralyawmleb/", label: "Instagram" },
  { href: "https://www.youtube.com/channel/UCKbs9xURKdoJ3I99QqFygdQ?sub_confirmation=1", label: "YouTube" },
];

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
    <header className="border-b border-zinc-300 bg-white">
      <div className="border-b border-zinc-300 bg-zinc-900 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-2 text-xs sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/90">
            {topLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
            <div className="h-4 w-px bg-white/20" />
            {langLinks.map((link) => (
              <Link key={link.label} href={link.href} className="font-bold transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-white/90">
            <span className="font-bold">{formatToday(locale)}</span>
            <div className="h-4 w-px bg-white/20" />
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <Image
                src="/assets/img/logo.png"
                alt={dict.site.name}
                width={238}
                height={60}
                className="h-auto w-[200px]"
                priority
              />
            </Link>
          </div>

          <form action={`/${locale}/search`} method="get" className="flex w-full max-w-md items-center gap-2 lg:w-[380px]">
            <input
              type="search"
              name="q"
              placeholder={dict.site.searchPlaceholder}
              className="h-12 w-full rounded-full border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-5 text-sm outline-none ring-0 placeholder:text-zinc-600 focus:border-[color:var(--accent)]"
            />
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-sm bg-[color:var(--accent)] px-5 text-sm font-bold text-white transition hover:bg-[color:var(--accent-strong)]"
            >
              {dict.site.searchButton}
            </button>
          </form>
        </div>

        <nav className="overflow-x-auto border-y border-zinc-300 py-2">
          <ul className="flex min-w-max items-center gap-2 text-sm font-bold text-[color:var(--ink)]">
            <li>
              <Link
                href={`/${locale}`}
                className="inline-flex border-b-2 border-transparent px-4 py-2 transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              >
                {dict.nav.home}
              </Link>
            </li>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/${locale}/category/${item.link}`}
                  className="inline-flex border-b-2 border-transparent px-4 py-2 transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/${locale}/mix`}
                className="inline-flex border-b-2 border-transparent px-4 py-2 transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
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