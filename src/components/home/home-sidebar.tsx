import Link from "next/link";

import type { FeedItemDto } from "@/src/lib/api";
import { MostReadWidget } from "@/src/components/sidebar/most-read-widget";
import { CategorySlider } from "@/src/components/home/category-slider";

type SliderItem = {
  id: number;
  slugId: string;
  title: string;
  sectionTitle: string;
  imageUrl: string | null;
  locale: string;
};

type HomeSidebarProps = {
  locale: string;
  dict: {
    editorial: string;
    editorialTitle: string;
    editorialBody: string;
    browseMix: string;
    searchContent: string;
    mostRead: string;
    latestCategories: string;
  };
  feed: FeedItemDto[];
  sliderItems: SliderItem[];
};

export function HomeSidebar({ locale, dict, feed, sliderItems }: HomeSidebarProps) {
  return (
    <aside className="space-y-5">
      <CategorySlider items={sliderItems} label={dict.latestCategories} />

      <MostReadWidget locale={locale} label={dict.mostRead} items={feed} />
    </aside>
  );
}