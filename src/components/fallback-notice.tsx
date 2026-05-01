import type { LanguageMeta } from "@/src/lib/api";

type FallbackNoticeProps = {
  langMeta: LanguageMeta;
  locale: string;
  message: string;
};

/**
 * Post-apiapp migration: the backend never serves AR fallbacks for EN/FR;
 * it returns 404 instead, and `fallbackUsed` is always `false`. The "showing
 * Arabic version" notice is therefore unreachable. Kept as a no-op so all
 * existing call sites continue to compile while we phase the component out.
 */
export function FallbackNotice(_props: FallbackNoticeProps) {
  return null;
}
