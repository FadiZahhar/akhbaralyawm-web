/**
 * Generate SEO-friendly slugs from titles in any language (Arabic, French, English).
 *
 * - Keeps Unicode letters (Arabic, accented Latin, etc.) — Google indexes them fine.
 * - Strips punctuation, collapses whitespace into single hyphens.
 * - Lowercases Latin characters for consistency.
 * - Preserves Arabic character composition (hamza, etc.) via NFC normalization.
 */

/**
 * Convert a title string into a URL-safe slug.
 * Does NOT append an ID — use `buildArticleSlug` or `buildSectionSlug` for that.
 */
export function slugify(text: string): string {
  return (
    text
      // Normalize Unicode — decompose for Latin diacritic removal
      .normalize("NFKD")
      // Remove Latin combining diacritical marks (é→e, ñ→n, etc.)
      .replace(/[\u0300-\u036f]/g, "")
      // Recompose Arabic characters (أ stays أ, not ا+combining hamza)
      .normalize("NFC")
      // Lowercase Latin characters only
      .replace(/[A-Z]/g, (ch) => ch.toLowerCase())
      // Replace any character that is NOT a Unicode letter, digit, or hyphen with a space
      .replace(/[^\p{L}\p{N}-]/gu, " ")
      // Collapse multiple spaces/hyphens into a single hyphen
      .replace(/[\s-]+/g, "-")
      // Trim leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * Build an article slug from its title + numeric ID.
 * Format: `title-words-here-12345`
 *
 * If the title produces an empty slug, falls back to just the ID.
 */
export function buildArticleSlug(title: string, id: number): string {
  const base = slugify(title);
  if (!base) return String(id);
  return `${base}-${id}`;
}

/**
 * Build a section/category slug from its title.
 * No ID suffix needed since sections are looked up by slug.
 *
 * Falls back to the numeric ID string if title produces an empty slug.
 */
export function buildSectionSlug(title: string, id: number): string {
  const base = slugify(title);
  return base || String(id);
}

/**
 * Detect whether a slug is just a bare numeric ID (SEO-unfriendly).
 */
export function isNumericSlug(slug: string): boolean {
  return /^\d+$/.test(slug);
}
