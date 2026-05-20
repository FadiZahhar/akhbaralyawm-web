"use client";

// Top-down search overlay for the mimic header.
//
// UX: clicking the search icon slides a compact white bar down from the top
// edge of the viewport (~120px), with a darkened backdrop covering the rest
// of the page. The bar holds a large input + a close (✕) button. Submitting
// navigates to /[locale]/search?q=... (plain form GET). Escape closes,
// body scroll is locked while open, focus is moved to the input on open.

import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/src/lib/i18n";

type Props = {
  locale: Locale;
  placeholder: string;
  /** Icon button extra className (lets caller blend with mobile vs desktop bar) */
  triggerClassName?: string;
  /** Visually-hidden label (defaults to "Search") */
  triggerAriaLabel?: string;
};

export function SearchOverlayMimic({
  locale,
  placeholder,
  triggerClassName,
  triggerAriaLabel = "Search",
}: Props) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`mimic-search-trigger${triggerClassName ? ` ${triggerClassName}` : ""}`}
        aria-label={triggerAriaLabel}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <i className="icofont-ui-search" aria-hidden="true" />
      </button>

      <div
        className={`mimic-search-overlay${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="mimic-search-backdrop"
          aria-label="Close search"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />
        <div className="mimic-search-panel" role="dialog" aria-modal="true" aria-label={triggerAriaLabel}>
          <form
            method="get"
            action={`/${locale}/search`}
            role="search"
            className="mimic-search-form"
          >
            <input
              ref={inputRef}
              name="q"
              type="search"
              placeholder={placeholder}
              aria-label={placeholder}
              autoComplete="off"
              tabIndex={open ? 0 : -1}
            />
            <button type="submit" className="mimic-search-submit" tabIndex={open ? 0 : -1}>
              <i className="icofont-ui-search" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="mimic-search-close"
              aria-label="Close"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
