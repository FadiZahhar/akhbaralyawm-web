export type Locale = "ar" | "en" | "fr";

export const locales: Locale[] = ["ar", "en", "fr"];
export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getHtmlLang(locale: Locale): string {
  return locale;
}

const OG_LOCALE_MAP: Record<Locale, string> = {
  ar: "ar_AR",
  en: "en_US",
  fr: "fr_FR",
};

export function getOgLocale(locale: Locale): string {
  return OG_LOCALE_MAP[locale];
}

const dictionaries = {
  ar: () => import("@/dictionaries/ar.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  fr: () => import("@/dictionaries/fr.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
