import type { FeedItemDto } from "@/src/lib/api";
import { DemoBannerStack } from "./demo-banner-stack";
import { MostReadWidget } from "./most-read-widget";

type PageSidebarProps = {
  locale: string;
  label: string;
  mostRead: FeedItemDto[];
};

export function PageSidebar({ locale, label, mostRead }: PageSidebarProps) {
  return (
    <aside className="space-y-5">
      <DemoBannerStack locale={locale} randomize />
      <MostReadWidget locale={locale} label={label} items={mostRead} />
      <DemoBannerStack locale={locale} maxItems={2} randomize />
    </aside>
  );
}
