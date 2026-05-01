"use client";

import { usePathname } from "next/navigation";

import { locales, type Locale } from "@/src/lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  ariaLabel?: string;
};

const LOCALE_LABELS: Record<Locale, string> = {
  ar: "AR",
  en: "EN",
  fr: "FR",
};

const LOCALE_FULL: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
};

// Routes whose URL is resolvable across locales:
//   - "" (homepage), "mix", "about", "contact", "search": stable path,
//     no per-locale slug.
//   - "news", "read": detail pages — the article page extracts the id /
//     resolves the slug per-locale and 301s to the locale-correct slug.
// "category" and "author" use per-locale slugs without an embedded id, so
// we drop the user at the locale homepage to avoid a guaranteed 404.
const STABLE_PREFIXES = ["", "mix", "about", "contact", "search", "news", "read"];

function rewritePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && (locales as readonly string[]).includes(segments[0])) {
    segments.shift();
  }

  const head = segments[0] ?? "";
  const isStable = STABLE_PREFIXES.includes(head);

  if (!isStable) {
    return `/${target}`;
  }

  const tail = segments.length > 0 ? `/${segments.join("/")}` : "";
  return `/${target}${tail}`;
}

export function LanguageSwitcher({ locale, ariaLabel = "Language" }: LanguageSwitcherProps) {
  const pathname = usePathname();

  // Build the target href for each locale up front. Using real <a> elements
  // (not buttons) means the browser performs a normal full-document
  // navigation, which is required because <html lang/dir>, the dictionary,
  // and the chrome rendered from the root layout (`app/layout.tsx`) all
  // depend on the request locale and cannot be swapped via a client-side
  // RSC navigation alone.
  //
  // IMPORTANT: do not read `window.*` during render — the server has no
  // window, so the href would differ between SSR and hydration and React
  // would throw a hydration mismatch. Search-query preservation is handled
  // in the click handler instead, where `window` is always available.
  function buildHref(target: Locale): string {
    return rewritePath(pathname || `/${locale}`, target);
  }

  function persistChoice(target: Locale) {
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, target: Locale) {
    persistChoice(target);
    // Preserve `?q=` when switching language on the search page. We can
    // only do this on the client, so override the anchor navigation here.
    const next = buildHref(target);
    if (next.endsWith("/search")) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        event.preventDefault();
        window.location.assign(`${next}?q=${encodeURIComponent(q)}`);
      }
    }
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center overflow-hidden rounded-sm border border-[#DCDCDC] bg-white text-[12px] font-bold"
    >
      {locales.map((l, idx) => {
        const isActive = l === locale;
        const baseClasses = [
          "px-2.5 py-1 transition select-none",
          idx > 0 ? "border-l border-[#DCDCDC]" : "",
        ].join(" ");

        if (isActive) {
          return (
            <span
              key={l}
              aria-current="true"
              aria-label={LOCALE_FULL[l]}
              title={LOCALE_FULL[l]}
              className={`${baseClasses} bg-[#142963] text-white cursor-default`}
            >
              {LOCALE_LABELS[l]}
            </span>
          );
        }

        return (
          <a
            key={l}
            href={buildHref(l)}
            hrefLang={l}
            aria-label={LOCALE_FULL[l]}
            title={LOCALE_FULL[l]}
            onClick={(event) => handleClick(event, l)}
            className={`${baseClasses} text-[#8A8A8A] hover:bg-[#F5F6FA] hover:text-[#142963]`}
          >
            {LOCALE_LABELS[l]}
          </a>
        );
      })}
    </div>
  );
}
