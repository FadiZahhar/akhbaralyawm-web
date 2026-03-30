import type { FeedItemDto } from "@/src/lib/api";
import { MostReadWidget } from "./most-read-widget";

type PageSidebarProps = {
  mostRead: FeedItemDto[];
};

export function PageSidebar({ mostRead }: PageSidebarProps) {
  return (
    <aside className="space-y-5">
      <MostReadWidget items={mostRead} />
    </aside>
  );
}
