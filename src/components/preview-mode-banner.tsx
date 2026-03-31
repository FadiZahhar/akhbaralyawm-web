"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type PreviewModeBannerProps = {
  activeLabel: string;
  exitLabel: string;
};

export function PreviewModeBanner({ activeLabel, exitLabel }: PreviewModeBannerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const redirectPath = `${pathname}${query ? `?${query}` : ""}`;
  const exitUrl = `/api/preview/exit?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <div className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 sm:px-2">
        <p className="font-semibold">{activeLabel}</p>
        <Link
          href={exitUrl}
          className="rounded-full bg-amber-900 px-4 py-1.5 text-xs font-bold text-amber-100 transition hover:bg-amber-800"
        >
          {exitLabel}
        </Link>
      </div>
    </div>
  );
}
