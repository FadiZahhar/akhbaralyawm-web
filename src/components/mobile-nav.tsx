"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type NavItem = {
  id?: number;
  href: string;
  label: string;
};

type MobileNavProps = {
  homeHref: string;
  homeLabel: string;
  mixHref: string;
  mixLabel: string;
  navItems: NavItem[];
};

export function MobileNav({ homeHref, homeLabel, mixHref, mixLabel, navItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on route change (clicks on links)
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    // close on escape key
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [open]);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded text-[#272B2B] transition hover:bg-[#F5F6FA]"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Slide-down panel */}
      <div
        ref={panelRef}
        className={`absolute start-0 end-0 top-full z-50 border-b border-[#EEEEEE] bg-white shadow-lg transition-all duration-200 ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <nav className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <ul className="flex flex-col gap-1 text-[15px] font-bold text-[#142963]">
            <li>
              <Link
                href={homeHref}
                onClick={() => setOpen(false)}
                className="block rounded px-3 py-2.5 transition hover:bg-[#F5F6FA] hover:text-[#2FA14B]"
              >
                {homeLabel}
              </Link>
            </li>
            {navItems.map((item) => (
              <li key={item.id ?? item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-3 py-2.5 transition hover:bg-[#F5F6FA] hover:text-[#2FA14B]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={mixHref}
                onClick={() => setOpen(false)}
                className="block rounded px-3 py-2.5 transition hover:bg-[#F5F6FA] hover:text-[#2FA14B]"
              >
                {mixLabel}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
