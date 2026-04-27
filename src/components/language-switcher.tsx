"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

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

// Routes whose path segments are stable across locales. Anything else uses
// locale-specific slugs (news/{slugId}, category/{slug}, author/{slug},
// read/{id}) and cannot be safely rewritten without a backend lookup, so we
// drop the user at the homepage of the target locale instead of producing a
// 404.
const STABLE_PREFIXES = ["", "mix", "about", "contact", "search"];

function rewritePath(pathname: string, target: Locale): string {
  // Strip any leading locale segment.
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
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function handleSelect(target: Locale) {
    if (target === locale) return;

    // Persist the choice immediately so the next bare-domain visit honors it
    // even before the middleware response cookie lands.
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

    const nextPath = rewritePath(pathname || `/${locale}`, target);

    // Preserve the search query on the search page so users keep their results.
    let search = "";
    if (typeof window !== "undefined" && nextPath.endsWith("/search")) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) search = `?q=${encodeURIComponent(q)}`;
    }

    startTransition(() => {
      router.push(`${nextPath}${search}`);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center overflow-hidden rounded-sm border border-[#DCDCDC] bg-white text-[12px] font-bold"
    >
      {locales.map((l, idx) => {
        const isActive = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => handleSelect(l)}
            aria-current={isActive ? "true" : undefined}
            aria-label={LOCALE_FULL[l]}
            title={LOCALE_FULL[l]}
            className={[
              "px-2.5 py-1 transition",
              idx > 0 ? "border-l border-[#DCDCDC]" : "",
              isActive
                ? "bg-[#142963] text-white cursor-default"
                : "text-[#8A8A8A] hover:bg-[#F5F6FA] hover:text-[#142963]",
            ].join(" ")}
            disabled={isActive}
          >
            {LOCALE_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
