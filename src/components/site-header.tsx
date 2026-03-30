import Link from "next/link";

import { getSections } from "@/src/lib/api";

const PRIMARY_SECTION_IDS = [29, 45, 39, 30, 46, 33, 56];

const TOP_LINKS = [
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "اتصل بنا" },
  { href: "https://fr.akhbaralyawm.com/", label: "FR", external: true },
  { href: "https://en.akhbaralyawm.com/", label: "EN", external: true },
];

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/akhbaralyawm78/", label: "Facebook" },
  { href: "https://twitter.com/akhbaralyawm", label: "X" },
  { href: "https://www.instagram.com/akhbaralyawmleb/", label: "Instagram" },
  { href: "https://www.youtube.com/channel/UCKbs9xURKdoJ3I99QqFygdQ?sub_confirmation=1", label: "YouTube" },
];

function formatToday() {
  return new Intl.DateTimeFormat("ar-LB", {
    dateStyle: "medium",
  }).format(new Date());
}

export async function SiteHeader() {
  const sections = await getSections();
  const navItems = PRIMARY_SECTION_IDS.map((id) => sections.find((section) => section.id === id)).filter(
    (section) => section && section.link !== "/",
  );

  return (
    <header className="border-b border-[color:var(--border-soft)] bg-white/92 backdrop-blur-sm">
      <div className="border-b border-[color:var(--border-soft)] bg-[color:var(--ink)] text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-3 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/85">
            {TOP_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-white/85">
            <span>{formatToday()}</span>
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
            <Link href="/" className="inline-flex items-center gap-3 text-[color:var(--ink)]">
              <span className="rounded-full bg-[color:var(--accent)]/12 px-3 py-1 text-xs font-bold text-[color:var(--accent)]">
                Akhbar Al Youm
              </span>
              <span className="text-3xl font-extrabold tracking-tight">أخبار اليوم</span>
            </Link>
            <p className="max-w-2xl text-sm leading-7 text-zinc-600">
              منصة إخبارية عربية سريعة الإيقاع تركّز على الخبر، السياق، وسهولة الوصول من أي جهاز.
            </p>
          </div>

          <form action="/search" method="get" className="flex w-full max-w-md items-center gap-2 lg:w-[380px]">
            <input
              type="search"
              name="q"
              placeholder="ابحث في الأخبار"
              className="h-12 w-full rounded-full border border-[color:var(--border-soft)] bg-[color:var(--panel)] px-5 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-[color:var(--accent)]"
            />
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] px-5 text-sm font-bold text-white transition hover:bg-[color:var(--accent-strong)]"
            >
              بحث
            </button>
          </form>
        </div>

        <nav className="overflow-x-auto">
          <ul className="flex min-w-max items-center gap-2 text-sm font-bold text-[color:var(--ink)]">
            <li>
              <Link
                href="/"
                className="inline-flex rounded-full border border-transparent px-4 py-2 transition hover:border-[color:var(--border-soft)] hover:bg-[color:var(--panel)]"
              >
                الرئيسية
              </Link>
            </li>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/category/${item.link}`}
                  className="inline-flex rounded-full border border-transparent px-4 py-2 transition hover:border-[color:var(--border-soft)] hover:bg-[color:var(--panel)]"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/mix"
                className="inline-flex rounded-full border border-transparent px-4 py-2 transition hover:border-[color:var(--border-soft)] hover:bg-[color:var(--panel)]"
              >
                من كل شي
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}