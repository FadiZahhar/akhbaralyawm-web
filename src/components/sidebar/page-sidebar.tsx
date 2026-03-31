import type { FeedItemDto } from "@/src/lib/api";
import { MostReadWidget } from "./most-read-widget";

type PageSidebarProps = {
  locale: string;
  label: string;
  mostRead: FeedItemDto[];
};

export function PageSidebar({ locale, label, mostRead }: PageSidebarProps) {
  return (
    <aside className="space-y-5">
      <MostReadWidget locale={locale} label={label} items={mostRead} />
    </aside>
  );
}
