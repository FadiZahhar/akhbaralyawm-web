import Image from "next/image";
import Link from "next/link";

export type DemoBanner = {
  src: string;
  href: string;
  alt: string;
};

type DemoBannerStackProps = {
  locale: string;
  banners?: DemoBanner[];
  maxItems?: number;
  randomize?: boolean;
};

function shuffleBanners(items: DemoBanner[]): DemoBanner[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const DEFAULT_BANNERS: DemoBanner[] = [
  {
    src: "/assets/img/demo-banners/sidebar-banner-01.svg",
    href: "#",
    alt: "City transfer offer demo banner",
  },
  {
    src: "/assets/img/demo-banners/sidebar-banner-02.svg",
    href: "#",
    alt: "Auto spotlight demo banner",
  },
  {
    src: "/assets/img/demo-banners/sidebar-banner-03.svg",
    href: "#",
    alt: "Weekend events demo banner",
  },
];

export function DemoBannerStack({ locale, banners = DEFAULT_BANNERS, maxItems = 3, randomize = false }: DemoBannerStackProps) {
  const normalizedMax = Math.max(1, Math.min(maxItems, 3));
  const sourceBanners = randomize ? shuffleBanners(banners) : banners;
  const visibleBanners = sourceBanners.slice(0, normalizedMax);

  return (
    <section className="mx-auto w-full max-w-[300px] space-y-3" aria-label="Promotional banners">
      {visibleBanners.map((banner, index) => (
        <Link
          key={`${banner.src}-${index}`}
          href={banner.href}
          locale={locale}
          aria-label={banner.alt}
          className="group block overflow-hidden rounded-sm border border-[color:var(--border-soft)] bg-white shadow-[0_10px_24px_rgba(13,35,77,0.08)]"
        >
          <div className="relative aspect-square w-full">
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={index === 0}
            />
          </div>
        </Link>
      ))}
    </section>
  );
}
