// Side-by-side parity preview. Left = current /v2 (Next.js mimic). Right =
// the extracted legacy MHTML snapshot. Two synced iframes so we can eyeball
// drift while iterating, and a deep link to the auto-generated pixel diff.
//
// This route only exists in dev/parity work — it's not part of the public IA.

import type { Locale } from "@/src/lib/i18n";
import { isLocale } from "@/src/lib/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const SNAPSHOT_BY_LOCALE: Record<Locale, string> = {
  ar: "/legacy-snapshot/home-ar/index.html",
  fr: "/legacy-snapshot/home-fr/index.html",
  en: "/legacy-snapshot/home-en/index.html",
};

export const dynamic = "force-static";

export default async function LegacyPreviewPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ar";
  const snapshot = SNAPSHOT_BY_LOCALE[locale];
  const candidate = `/${locale}/v2`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr",
        height: "100vh",
        background: "#111",
        color: "#eee",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          padding: "8px 12px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          borderBottom: "1px solid #333",
          fontSize: "13px",
        }}
      >
        <strong>Parity preview</strong>
        <span>locale: {locale}</span>
        <span>
          left: <code>{candidate}</code>
        </span>
        <span>
          right: <code>{snapshot}</code>
        </span>
        <span style={{ marginInlineStart: "auto", opacity: 0.7 }}>
          run <code>npm run mimic:diff</code> for pixel report
        </span>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", background: "#333" }}>
        <iframe
          src={candidate}
          title="Next.js /v2 candidate"
          style={{ width: "100%", height: "100%", border: 0, background: "#fff" }}
        />
        <iframe
          src={snapshot}
          title="Legacy MHTML snapshot"
          style={{ width: "100%", height: "100%", border: 0, background: "#fff" }}
        />
      </div>
    </div>
  );
}
