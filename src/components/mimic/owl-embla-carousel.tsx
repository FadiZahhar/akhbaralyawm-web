"use client";

// Shared Embla-powered slider that renders the same owl-carousel markup the
// legacy CSS expects (.owl-carousel, .owl-stage-outer, .owl-stage, .owl-nav,
// .owl-prev/.owl-next). Replaces the previously frozen static "scroll
// position 0" snapshots used by the home page carousels — gives real drag,
// swipe, RTL, autoplay, and looping while preserving every legacy class so
// no styling changes.
//
// Drop the manual lead/trail clones the old static sections did — embla's
// `loop: true` handles infinite-loop cloning natively.

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

type Props = {
  /** Outer carousel class — e.g. `more-news-slides`, `popular-news-slides`. */
  carouselClassName: string;
  children: React.ReactNode;
  loop?: boolean;
  autoplay?: boolean;
  autoplayDelayMs?: number;
  slidesToScroll?: number;
  /** Hide nav buttons when content fits the viewport. Default true. */
  hideNavIfNoScroll?: boolean;
};

export function OwlEmblaCarousel({
  carouselClassName,
  children,
  loop = true,
  autoplay = true,
  autoplayDelayMs = 4000,
  slidesToScroll = 1,
  hideNavIfNoScroll = true,
}: Props) {
  const plugins = autoplay
    ? [Autoplay({ delay: autoplayDelayMs, stopOnInteraction: false, stopOnMouseEnter: true })]
    : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop, direction: "rtl", align: "start", slidesToScroll, containScroll: loop ? false : "trimSnaps" },
    plugins,
  );

  const [canScroll, setCanScroll] = useState(true);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => setCanScroll(emblaApi.canScrollNext() || emblaApi.canScrollPrev() || loop);
    update();
    emblaApi.on("reInit", update);
    emblaApi.on("select", update);
    return () => {
      emblaApi.off("reInit", update);
      emblaApi.off("select", update);
    };
  }, [emblaApi, loop]);

  const onPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const onNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const showNav = !hideNavIfNoScroll || canScroll;

  return (
    <div
      className={`${carouselClassName} owl-carousel owl-theme owl-rtl owl-loaded owl-drag`}
      style={{ position: "relative" }}
    >
      <div className="owl-stage-outer" ref={emblaRef} style={{ overflow: "hidden" }}>
        <div className="owl-stage" style={{ display: "flex", flexWrap: "nowrap" }}>
          {children}
        </div>
      </div>
      {showNav && (
        <div className="owl-nav">
          <button type="button" className="owl-prev" aria-label="Previous" onClick={onPrev}>
            <i className="icofont-rounded-right" aria-hidden="true" />
          </button>
          <button type="button" className="owl-next" aria-label="Next" onClick={onNext}>
            <i className="icofont-rounded-left" aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="owl-dots disabled" />
    </div>
  );
}
