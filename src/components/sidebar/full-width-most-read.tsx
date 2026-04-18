import type { FeedItemDto } from "@/src/lib/api";
import { MostReadWidget } from "./most-read-widget";

type FullWidthMostReadProps = {
  locale: string;
  label: string;
  items: FeedItemDto[];
};

export function FullWidthMostRead({ locale, label, items }: FullWidthMostReadProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="grid gap-8">
        <MostReadWidget locale={locale} label={label} items={items} />
      </div>
    </section>
  );
}
