import type { LanguageMeta } from "@/src/lib/api";
import type { Locale } from "@/src/lib/i18n";

const messages: Record<Locale, string> = {
  ar: "هذا المحتوى متوفر حالياً باللغة العربية.",
  en: "This content is currently available in Arabic only.",
  fr: "Ce contenu est actuellement disponible uniquement en arabe.",
};

type FallbackNoticeProps = {
  langMeta: LanguageMeta;
  locale: Locale;
};

export function FallbackNotice({ langMeta, locale }: FallbackNoticeProps) {
  if (!langMeta.fallbackUsed || locale === "ar") {
    return null;
  }

  return (
    <div
      className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      role="status"
    >
      {messages[locale]}
    </div>
  );
}
