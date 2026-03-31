import type { LanguageMeta } from "@/src/lib/api";

type FallbackNoticeProps = {
  langMeta: LanguageMeta;
  locale: string;
  message: string;
};

export function FallbackNotice({ langMeta, locale, message }: FallbackNoticeProps) {
  if (!langMeta.fallbackUsed || locale === "ar") {
    return null;
  }

  return (
    <div
      className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      role="status"
    >
      {message}
    </div>
  );
}
