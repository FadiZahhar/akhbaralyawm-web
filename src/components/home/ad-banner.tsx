import Image from "next/image";
import Link from "next/link";
import { shimmerPlaceholder } from "@/src/lib/shimmer";

export type AdBannerItem = {
  imageUrl: string;
  href: string;
  alt: string;
};

type AdBannerProps = {
  /** Override with dynamic data when the API supports it */
  banner?: AdBannerItem;
  width?: number;
  height?: number;
};

const DEFAULT_BANNER: AdBannerItem = {
  imageUrl: "/assets/img/banner-placeholder.svg",
  href: "#",
  alt: "إعلان",
};

export function AdBanner({ banner, width = 900, height = 232 }: AdBannerProps) {
  const { imageUrl, href, alt } = banner ?? DEFAULT_BANNER;

  return (
    <section className="w-full" aria-label="إعلان">
      <Link
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer sponsored" : undefined}
        className="group mx-auto block w-full overflow-hidden rounded-lg"
        style={{ maxWidth: width }}
      >
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          sizes={`(max-width: ${width}px) 100vw, ${width}px`}
          placeholder="blur"
          blurDataURL={shimmerPlaceholder(width, height)}
          className="h-auto w-full rounded-lg transition-opacity duration-200 group-hover:opacity-90"
          priority={false}
        />
      </Link>
    </section>
  );
}
