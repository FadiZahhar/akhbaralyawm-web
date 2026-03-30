import Image from "next/image";
import Link from "next/link";

import type { FeedItemDto } from "@/src/lib/api";
import { getAssetUrl } from "@/src/lib/api";

type HomeHeroProps = {
  lead: FeedItemDto | undefined;
  updates: FeedItemDto[];
  formatDate: (value: string) => string;
};

export function HomeHero({ lead, updates, formatDate }: HomeHeroProps) {
  const heroImage = lead ? getAssetUrl(lead.photoPath) : null;

  return (
    <div className="overflow-hidden rounded-sm border border-[color:var(--border-soft)] bg-white shadow-[0_20px_50px_rgba(13,35,77,0.08)]">
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        {/* Lead story — large image with overlay */}
        {lead ? (
          <Link
            href={`/news/${lead.slugId}`}
            className="group relative block aspect-[16/11] overflow-hidden lg:aspect-auto"
          >
            {heroImage ? (
              <Image
                src={heroImage}
                alt={lead.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                priority
              />
            ) : (
              <div className="h-full w-full bg-[color:var(--panel)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 sm:p-6">
              {lead.sectionTitle ? (
                <span className="inline-flex rounded-sm bg-[color:var(--accent)] px-2.5 py-1 text-xs font-black text-white">
                  {lead.sectionTitle}
                </span>
              ) : null}
              <h2 className="text-xl font-black leading-[1.7] text-white sm:text-2xl">
                {lead.title}
              </h2>
            </div>
          </Link>
        ) : null}

        {/* Timestamped updates — اللحظة الأخيرة */}
        <div className="flex flex-col border-r border-[color:var(--border-soft)] lg:border-r-0 lg:border-l">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border-soft)] px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-1 rounded-sm bg-[color:var(--accent)]" />
              <h2 className="text-base font-black text-[color:var(--ink)]">اللحظة الأخيرة</h2>
            </div>
            <span className="rounded-sm bg-[color:var(--accent)] px-2.5 py-0.5 text-[10px] font-black text-white">
              Live
            </span>
          </div>
          <div className="flex-1 divide-y divide-[color:var(--border-soft)] overflow-y-auto">
            {updates.slice(0, 8).map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slugId}`}
                className="flex items-start gap-3 px-5 py-3 transition hover:bg-[color:var(--panel)]"
              >
                <span className="mt-1 shrink-0 text-xs font-bold tabular-nums text-[color:var(--accent)]">
                  {formatDate(item.disdate).split(" ").slice(0, 1).join("")}
                </span>
                <span className="text-sm font-bold leading-7 text-[color:var(--ink)]">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}