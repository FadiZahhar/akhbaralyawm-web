type YoutubeEmbedProps = {
  sourceUrl: string | null;
  fallbackUrl?: string;
  title?: string;
};

function toYoutubeEmbedUrl(input: string): string | null {
  let parsed: URL;

  try {
    parsed = new URL(input);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const videoId = parsed.pathname.replace(/^\//, "").split("/")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (host !== "youtube.com" && host !== "m.youtube.com") {
    return null;
  }

  if (parsed.pathname.startsWith("/embed/")) {
    const videoId = parsed.pathname.replace("/embed/", "").split("/")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (parsed.pathname === "/watch") {
    const videoId = parsed.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (parsed.pathname.startsWith("/shorts/")) {
    const videoId = parsed.pathname.replace("/shorts/", "").split("/")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (parsed.pathname === "/embed" && parsed.searchParams.get("listType") === "playlist") {
    const list = parsed.searchParams.get("list");
    return list ? `https://www.youtube.com/embed?listType=playlist&list=${encodeURIComponent(list)}` : null;
  }

  if (parsed.pathname === "/playlist") {
    const list = parsed.searchParams.get("list");
    return list ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}` : null;
  }

  return null;
}

export function YoutubeEmbed({ sourceUrl, fallbackUrl, title = "YouTube video" }: YoutubeEmbedProps) {
  const embedUrl = toYoutubeEmbedUrl(sourceUrl || "") || (fallbackUrl ? toYoutubeEmbedUrl(fallbackUrl) : null);

  if (!embedUrl) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-sm border border-[color:var(--border-soft)] bg-white p-3 shadow-[0_12px_34px_rgba(13,35,77,0.08)] sm:p-4">
      <div className="aspect-video w-full overflow-hidden rounded-sm bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </section>
  );
}
