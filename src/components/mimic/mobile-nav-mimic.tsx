"use client";

// Mobile hamburger menu for the mimic header.
//
// Legacy desktop nav (`.sinmun-nav`) is hidden below 991px by the scoped
// legacy CSS — that left mobile with no way to navigate sections. The original
// site relied on the MeanMenu jQuery plugin to dynamically generate a
// hamburger. We do the same job with a plain React drawer (no plugin needed):
//   - Hamburger button rendered inside `.sinmun-mobile-nav` (visible <992px).
//   - Off-canvas drawer slides in from the inline-end (right in RTL).
//   - Backdrop click + Escape close it; body scroll is locked while open.
// Styling lives in src/components/mimic/mimic.css (`.mimic-mobile-nav-*`).

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Locale } from "@/src/lib/i18n";

type NavItem = { title: string; slug: string };

type Props = {
  locale: Locale;
  homeLabel: string;
  searchPlaceholder: string;
  aboutLabel: string;
  contactLabel: string;
  items: NavItem[];
  activeSectionSlug?: string;
};

export function MobileNavMimic({
  locale,
  homeLabel,
  searchPlaceholder,
  aboutLabel,
  contactLabel,
  items,
  activeSectionSlug,
}: Props) {
  const [open, setOpen] = useState(false);
  const homeHref = `/${locale}`;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mimic-mobile-nav-drawer"
        className="mimic-mobile-nav-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        className={`mimic-mobile-nav-backdrop${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="mimic-mobile-nav-drawer"
        className={`mimic-mobile-nav-drawer${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="mimic-mobile-nav-head">
          <button
            type="button"
            className="mimic-mobile-nav-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <form
          method="get"
          action={`/${locale}/search`}
          role="search"
          className="mimic-mobile-nav-search"
          onSubmit={() => setOpen(false)}
        >
          <input name="q" placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
          <button type="submit" aria-label="Search">
            <i className="icofont-ui-search" />
          </button>
        </form>

        <nav>
          <ul className="mimic-mobile-nav-list">
            <li>
              <Link
                href={homeHref}
                className={!activeSectionSlug ? "is-active" : undefined}
                onClick={() => setOpen(false)}
              >
                {homeLabel}
              </Link>
            </li>
            {items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/${locale}/category/${item.slug}`}
                  className={activeSectionSlug === item.slug ? "is-active" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            ))}
            <li className="mimic-mobile-nav-sep">
              <Link href={`/${locale}/about`} onClick={() => setOpen(false)}>
                {aboutLabel}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`} onClick={() => setOpen(false)}>
                {contactLabel}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
