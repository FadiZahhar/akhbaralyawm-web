import Image from "next/image";
import Link from "next/link";

type StoryCardProps = {
  href: string;
  title: string;
  summary?: string;
  imageUrl?: string | null;
  eyebrow?: string;
  compact?: boolean;
};

export function StoryCard({ href, title, summary, imageUrl, eyebrow, compact = false }: StoryCardProps) {
  return (
    <article className="overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-[0_12px_30px_rgba(13,35,77,0.07)]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          width={1200}
          height={675}
          className={compact ? "aspect-[16/11] w-full object-cover" : "aspect-[16/10] w-full object-cover"}
        />
      ) : (
        <div
          className={
            compact
              ? "aspect-[16/11] w-full bg-[color:var(--panel)]"
              : "aspect-[16/10] w-full bg-[color:var(--panel)]"
          }
        />
      )}
      <div className="space-y-3 p-5">
        {eyebrow ? (
          <p className="inline-flex rounded-sm bg-[color:var(--accent)]/10 px-2 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={
            compact
              ? "text-lg font-bold leading-8 text-[color:var(--ink)]"
              : "text-2xl font-extrabold leading-10 text-[color:var(--ink)]"
          }
        >
          <Link href={href} className="transition hover:text-[color:var(--accent-strong)]">
            {title}
          </Link>
        </h2>
        {summary ? <p className="line-clamp-3 text-sm leading-7 text-zinc-600">{summary}</p> : null}
      </div>
    </article>
  );
}