import Image from "next/image";
import Link from "next/link";

import type { FeedItemDto } from "@/src/lib/api";
import { getAssetUrl } from "@/src/lib/api";

type HomeHeroProps = {
  locale: string;
  updates: FeedItemDto[];
  dict: {
    lastMoment: string;
    live: string;
  };
};

function formatTime(value: string, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-LB" : locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function HomeHero({ locale, updates, dict }: HomeHeroProps) {
  const items = updates.slice(0, 10);

  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-[color:var(--border-soft)] bg-white shadow-[0_14px_36px_rgba(13,35,77,0.08)]">
      {/* Header bar */}
      <div className="flex shrink-0 items-center justify-between gap-3 bg-[#142963] px-4 py-2.5">
        <h2 className="text-sm font-black text-white">{dict.lastMoment}</h2>
        <span className="rounded-sm bg-[#2FA14B] px-2 py-0.5 text-[9px] font-black text-white">
          {dict.live}
        </span>
      </div>

      {/* Scrollable list — max 5 visible rows, rest scroll */}
      <div className="ticker-scroll max-h-[325px] divide-y divide-[color:var(--border-soft)]">
        {items.map((item) => {
          const photoUrl = getAssetUrl(item.photoPath);
          return (
            <Link
              key={item.id}
              href={`/${locale}/news/${item.slugId}`}
              className="group relative flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-[color:var(--panel)]"
            >
              {/* Accent bar on hover */}
              <span className="absolute inset-y-0 start-0 w-[3px] rounded-e bg-[#2FA14B] opacity-0 transition-opacity group-hover:opacity-100" />

              {/* Thumbnail */}
              {photoUrl ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={photoUrl}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-sm bg-[color:var(--panel)]" />
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="line-clamp-2 text-xs font-bold leading-5 text-[color:var(--ink)] transition-colors group-hover:text-[#2FA14B]">
                  {item.title}
                </span>
                <span className="text-[10px] font-semibold tabular-nums text-[#2FA14B]">
                  {formatTime(item.disdate, locale)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}