"use client";

import { useEffect, useRef, useState } from "react";

type HeaderSearchProps = {
  locale: string;
  placeholder: string;
  buttonLabel: string;
};

export function HeaderSearch({ locale, placeholder, buttonLabel }: HeaderSearchProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Search icon button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={buttonLabel}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#142963] transition-colors duration-200 hover:bg-[#F5F6FA] hover:text-[#2FA14B]"
      >
        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>

      {/* Search overlay — slides down above the nav */}
      <div
        className={`absolute inset-x-0 top-0 z-50 border-b border-[#EEEEEE] bg-white shadow-lg transition-all duration-300 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <form
            action={`/${locale}/search`}
            method="get"
            className="flex flex-1 items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="search"
                name="q"
                placeholder={placeholder}
                className="h-11 w-full rounded-md border border-[#DCDCDC] bg-transparent px-4 pe-10 text-sm text-[#70798B] outline-none transition-colors focus:border-[#2FA14B]"
              />
              <button
                type="submit"
                className="absolute end-0 top-0 flex h-11 w-11 items-center justify-center text-[#70798B] transition hover:text-[#2FA14B]"
                aria-label={buttonLabel}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>
          </form>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#70798B] transition hover:bg-[#F5F6FA] hover:text-[#142963]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
