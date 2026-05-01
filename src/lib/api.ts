import DOMPurify from "isomorphic-dompurify";

import type { Locale } from "./i18n";
import { buildArticleSlug, buildSectionSlug, isNumericSlug } from "./slugify";

// ---------------------------------------------------------------------------
// Typed API errors
// ---------------------------------------------------------------------------

export type ApiErrorKind = "NotFound" | "BadRequest" | "ServerError";

export class ApiError extends Error {
  kind: ApiErrorKind;
  status: number;

  constructor(kind: ApiErrorKind, status: number, message?: string) {
    super(message ?? kind);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Language metadata
// ---------------------------------------------------------------------------

export type LanguageMeta = {
  requestedLanguage: Locale;
  contentLanguage: Locale;
  fallbackUsed: boolean;
};

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export type ArticleAlternate = {
  lang: Locale;
  url: string;
  slug?: string;
};

export type ArticleDto = {
  id: number;
  title: string;
  slugId: string;
  sectionId: number;
  sectionTitle: string;
  sectionLink: string;
  photoPath: string | null;
  bodyHtml: string;
  tags: string[];
  youtubeUrl: string | null;
  disdate: string;
  statusId: number;
  langMeta: LanguageMeta;
  alternates: ArticleAlternate[];
};

export type FeedItemDto = {
  id: number;
  title: string;
  slugId: string;
  summary: string;
  photoPath: string | null;
  disdate: string;
  sectionTitle: string;
  sectionLink: string;
  tag: string | null;
  langMeta: LanguageMeta;
};

export type SectionDto = {
  id: number;
  title: string;
  /** Original link from API — used for API calls */
  link: string;
  /** SEO-friendly slug for URLs */
  slug: string;
  orderorder: number;
  active?: boolean;
  langMeta: LanguageMeta;
};

export type AuthorDto = {
  id: number;
  title: string;
  /** Original link from API — used for API calls */
  link: string;
  /** SEO-friendly slug for URLs */
  slug: string;
  photoPath: string | null;
  bodyHtml: string;
  orderorder: number;
  langMeta: LanguageMeta;
};

export type PaginatedFeedDto = {
  items: FeedItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  langMeta: LanguageMeta;
};

export type CmsPageDto = {
  id: number;
  title: string;
  slugId: string;
  bodyHtml: string;
  updatedAt: string;
  langMeta: LanguageMeta;
};

const API_BASE_URL = process.env.API_BASE_URL;
const ASSET_HOST = process.env.NEXT_PUBLIC_ASSET_HOST;
// Each language is served from its own subdomain. The legacy hosting layout is:
//   AR -> https://www.akhbaralyawm.com
//   EN -> https://en.akhbaralyawm.com
//   FR -> https://fr.akhbaralyawm.com
// `NEXT_PUBLIC_ASSET_HOST` is the AR/default host. Per-locale overrides may be
// supplied via NEXT_PUBLIC_ASSET_HOST_{AR,EN,FR}; when missing we derive the
// EN/FR host by replacing the leading subdomain of the AR host.
const ASSET_HOST_AR = process.env.NEXT_PUBLIC_ASSET_HOST_AR;
const ASSET_HOST_EN = process.env.NEXT_PUBLIC_ASSET_HOST_EN;
const ASSET_HOST_FR = process.env.NEXT_PUBLIC_ASSET_HOST_FR;

type RawArticle = {
  id: number;
  title: string;
  slugId?: string;
  sectionId?: number;
  sectionTitle?: string;
  sectionLink?: string;
  category?: string;
  categoryLink?: string;
  photoPath?: string | null;
  photo?: string | null;
  bodyHtml?: string;
  body?: string;
  tag?: string | null;
  tags?: unknown;
  youtubeUrl?: string | null;
  youtube?: string | null;
  youtubeLink?: string | null;
  videoUrl?: string | null;
  video?: string | null;
  disdate?: string;
  statusId?: number;
  canonicalSlug?: string;
  alternates?: Array<{ lang?: string; url?: string; slug?: string }>;
  requestedLanguage?: string;
  contentLanguage?: string;
  fallbackUsed?: boolean;
};

type RawFeedItem = {
  id: number;
  title: string;
  slug?: string;
  slugId?: string;
  smallbody?: string | null;
  photo?: string | null;
  photoPath?: string | null;
  disdate?: string;
  section_title?: string;
  section_link?: string;
  sectionTitle?: string;
  sectionLink?: string;
  category?: string;
  categoryLink?: string;
  tag?: string | null;
  requestedLanguage?: string;
  contentLanguage?: string;
  fallbackUsed?: boolean;
};

type RawSection = {
  id: number;
  title: string;
  link: string;
  slug?: string;
  orderorder: number;
  active?: boolean;
  requestedLanguage?: string;
  contentLanguage?: string;
  fallbackUsed?: boolean;
};

type RawAuthor = {
  id: number;
  title: string;
  link: string;
  slug?: string;
  photo?: string | null;
  body?: string | null;
  orderorder: number;
  requestedLanguage?: string;
  contentLanguage?: string;
  fallbackUsed?: boolean;
};

type RawPagination = {
  page: number;
  limit: number;
  total?: number;         // old snake_case shape
  total_pages?: number;  // old snake_case shape
  totalItems?: number;   // new camelCase shape
  totalPages?: number;   // new camelCase shape
};

type RawPaginatedFeed = {
  data: RawFeedItem[];
  pagination?: RawPagination;
  requestedLanguage?: string;
  contentLanguage?: string;
  fallbackUsed?: boolean;
};

type RawListResponse<T> = {
  data: T[];
  requestedLanguage?: string;
  contentLanguage?: string;
  fallbackUsed?: boolean;
};

type RawSearchResponse = RawPaginatedFeed | RawListResponse<RawFeedItem>;

type RawCmsPage = {
  id: number;
  title: string;
  slugId?: string;
  bodyHtml?: string;
  body?: string;
  updatedAt?: string;
  updated_at?: string;
  requestedLanguage?: string;
  contentLanguage?: string;
  fallbackUsed?: boolean;
};

// Canonical v1 paths (no .ashx). Backwards-compat env overrides retained for emergencies.
const CMS_PAGE_PATH = process.env.API_CMS_PAGE_PATH || "/v1/pages/by-id";
const AUTHOR_ARTICLES_PATH = process.env.API_AUTHOR_ARTICLES_PATH || "/v1/news";
const AUTHOR_QUERY_KEY = process.env.API_AUTHOR_QUERY_KEY || "author";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertDataArray(
  payload: unknown,
  context: string,
): asserts payload is { data: unknown[] } {
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error(`Malformed API payload for ${context}: expected { data: [] }`);
  }
}

function assertRawArticle(raw: RawArticle, context: string): void {
  if (!isFiniteNumber(raw.id) || typeof raw.title !== "string") {
    throw new Error(`Malformed ${context}: missing required article fields`);
  }
}

function assertRawFeedItem(raw: RawFeedItem, context: string): void {
  if (!isFiniteNumber(raw.id) || typeof raw.title !== "string") {
    throw new Error(`Malformed ${context}: missing required feed item fields`);
  }
}

function assertRawSection(raw: RawSection, context: string): void {
  if (
    !isFiniteNumber(raw.id)
    || typeof raw.title !== "string"
    || typeof raw.link !== "string"
    || !isFiniteNumber(raw.orderorder)
  ) {
    throw new Error(`Malformed ${context}: missing required section fields`);
  }
}

function assertRawAuthor(raw: RawAuthor, context: string): void {
  if (
    !isFiniteNumber(raw.id)
    || typeof raw.title !== "string"
    || typeof raw.link !== "string"
    || !isFiniteNumber(raw.orderorder)
  ) {
    throw new Error(`Malformed ${context}: missing required author fields`);
  }
}

function assertRawCmsPage(raw: RawCmsPage, context: string): void {
  if (!isFiniteNumber(raw.id) || typeof raw.title !== "string") {
    throw new Error(`Malformed ${context}: missing required CMS page fields`);
  }
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function createUrl(path: string, params?: Record<string, string | number>): URL {
  const base = trimSlash(requireEnv("API_BASE_URL", API_BASE_URL));
  const url = new URL(path, `${base}/`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function fetchJson<T>(input: URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new ApiError("BadRequest", 400, `Bad request: ${input.pathname}`);
    }
    if (response.status === 404) {
      throw new ApiError("NotFound", 404, `Not found: ${input.pathname}`);
    }
    if (response.status >= 500) {
      throw new ApiError("ServerError", response.status, `Server error: ${response.status}`);
    }
    throw new ApiError("ServerError", response.status, `API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchOptionalJson<T>(input: URL, init?: RequestInit): Promise<T | null> {
  const response = await fetch(input, {
    ...init,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw new ApiError("BadRequest", 400, `Bad request: ${input.pathname}`);
    }
    if (response.status >= 500) {
      throw new ApiError("ServerError", response.status, `Server error: ${response.status}`);
    }
    throw new ApiError("ServerError", response.status, `API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Locale-aware fetch helpers
// ---------------------------------------------------------------------------

function buildLocaleHeaders(locale?: Locale): Record<string, string> {
  if (!locale) return {};
  return { "Accept-Language": locale };
}

function applyLocale(url: URL, locale?: Locale): URL {
  if (locale) {
    url.searchParams.set("lang", locale);
  }
  return url;
}

// ---------------------------------------------------------------------------
// Fallback logging
// ---------------------------------------------------------------------------

// Post-apiapp migration: backend never returns AR fallback for EN/FR (it 404s
// instead), and `fallbackUsed` is always false. This helper is now a no-op,
// kept only so existing call sites don't need to be touched.
function logFallback(_context: string, _langMeta: LanguageMeta): void {
  // intentionally empty
}

// ---------------------------------------------------------------------------
// LanguageMeta extraction
// ---------------------------------------------------------------------------

/**
 * Default langMeta when the backend response omits language metadata entirely.
 * The backend (post-Phase 1 of backendfix.md) always returns these fields, so
 * this is a last-resort fallback. We assume the requested locale was served
 * truthfully \u2014 we do NOT silently mark it as an Arabic fallback.
 */
function defaultLangMeta(locale: Locale = "ar"): LanguageMeta {
  return {
    requestedLanguage: locale,
    contentLanguage: locale,
    fallbackUsed: false,
  };
}

/** Extract langMeta from a raw API response. Trusts backend values. */
function extractLangMeta(
  raw: { requestedLanguage?: string; contentLanguage?: string; fallbackUsed?: boolean },
  locale: Locale = "ar",
): LanguageMeta {
  const requestedLang = (raw.requestedLanguage ?? locale) as Locale;
  // When backend doesn't tell us, assume it served what we asked for.
  const contentLang = (raw.contentLanguage ?? requestedLang) as Locale;
  return {
    requestedLanguage: requestedLang,
    contentLanguage: contentLang,
    fallbackUsed: raw.fallbackUsed ?? (requestedLang !== contentLang),
  };
}

/**
 * Strict locale isolation gate.
 *
 * Post-apiapp migration the backend returns 404 (not AR fallback) when a
 * translation is missing, and `fallbackUsed` is always false. This gate is
 * therefore a permissive pass-through — kept only so existing call sites
 * continue to compile while we drop the defensive layer.
 */
export function isPureLocale(
  _langMeta: LanguageMeta | undefined,
  _requestedLocale: Locale | undefined,
): boolean {
  return true;
}

// ---------------------------------------------------------------------------
// HTML sanitization
// ---------------------------------------------------------------------------

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "b", "i", "u", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th",
      "td", "div", "span", "hr", "iframe", "video", "source",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "id", "target", "rel",
      "width", "height", "style", "colspan", "rowspan", "frameborder",
      "allowfullscreen", "allow", "loading",
    ],
  });
}

// ---------------------------------------------------------------------------
// Locale-aware slug resolution
// ---------------------------------------------------------------------------

/** Detect whether a string contains Arabic Unicode characters. */
function containsArabic(value: string): boolean {
  return /[\u0600-\u06FF]/.test(value);
}

/**
 * Defensive: when the requested locale is non-AR and a backend slug is still
 * Arabic (which would only happen if the backend's per-locale slug column is
 * missing), prefer to slugify the locale-correct title instead. Used by
 * `pickLocaleSlug` / `pickLocaleSectionSlug`.
 */

/**
 * Pick the right slug for the requested locale.
 *
 * Order of preference:
 *   1. The backend-provided slug, IF it is non-empty, non-numeric, AND does not
 *      contain Arabic when the requested locale is EN/FR. (Backends sometimes
 *      ship the AR slug on EN/FR rows when translators forget to fill in the
 *      per-locale slug column.)
 *   2. A slug regenerated client-side from the title we received. Because we
 *      filter out fallback items earlier, the title at this point is in the
 *      requested locale, so slugifying it produces a locale-correct URL.
 *   3. The numeric ID as a last resort.
 */
function pickLocaleSlug(
  rawSlug: string | undefined,
  title: string,
  id: number,
  locale: Locale | undefined,
): string {
  const slug = (rawSlug ?? "").trim();
  const isNonArLocale = locale && locale !== "ar";

  if (slug && !isNumericSlug(slug)) {
    if (!isNonArLocale || !containsArabic(slug)) {
      return slug;
    }
    // Fall through: backend gave us an AR slug for an EN/FR request.
  }

  return buildArticleSlug(title, id);
}

/**
 * Section variant of pickLocaleSlug: prefers a non-Arabic backend slug, then
 * falls back to the original API `link`, then slugifies the (locale-correct)
 * title.
 */
function pickLocaleSectionSlug(
  rawSlug: string | undefined,
  link: string,
  title: string,
  id: number,
  locale: Locale | undefined,
): string {
  const slug = (rawSlug ?? "").trim();
  const isNonArLocale = locale && locale !== "ar";

  if (slug && !isNumericSlug(slug)) {
    if (!isNonArLocale || !containsArabic(slug)) {
      return slug;
    }
  }

  if (link && !isNumericSlug(link)) {
    if (!isNonArLocale || !containsArabic(link)) {
      return link;
    }
  }

  return buildSectionSlug(title, id);
}

function normalizeArticleTags(raw: RawArticle): string[] {
  const fromArray = Array.isArray(raw.tags)
    ? raw.tags.filter((item): item is string => typeof item === "string")
    : [];

  const fromCommaSeparated = typeof raw.tags === "string"
      ? raw.tags.split(/[,،]/)
    : [];

  const fromSingleTag = typeof raw.tag === "string"
      ? raw.tag.split(/[,،]/)
    : [];

  const normalized = [...fromArray, ...fromCommaSeparated, ...fromSingleTag]
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return Array.from(new Set(normalized));
}

function extractYoutubeUrlFromText(value: string): string | null {
  const iframeMatch = value.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (iframeMatch?.[1]) {
    return iframeMatch[1].trim();
  }

  const urlMatch = value.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s"'<>]+/i);
  if (urlMatch?.[0]) {
    return urlMatch[0].trim();
  }

  return null;
}

function extractArticleYoutubeUrl(raw: RawArticle): string | null {
  const directCandidates = [raw.youtubeUrl, raw.youtube, raw.youtubeLink, raw.videoUrl, raw.video];
  const direct = directCandidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  if (direct) {
    return direct.trim();
  }

  if (typeof raw.bodyHtml === "string") {
    const fromBodyHtml = extractYoutubeUrlFromText(raw.bodyHtml);
    if (fromBodyHtml) return fromBodyHtml;
  }

  if (typeof raw.body === "string") {
    const fromBody = extractYoutubeUrlFromText(raw.body);
    if (fromBody) return fromBody;
  }

  return null;
}

function normalizeArticle(raw: RawArticle, locale: Locale = "ar"): ArticleDto {
  assertRawArticle(raw, "article");

  // Backend (apiapp catalog) returns `canonicalSlug` for the requested locale.
  // Prefer it; fall back to slugId, then to a client-side slugify.
  const slugId = pickLocaleSlug(raw.canonicalSlug ?? raw.slugId, raw.title, raw.id, locale);

  const langMeta = extractLangMeta(raw, locale);

  const bodySource = raw.bodyHtml || raw.body || "";
  const sanitizedBody = sanitizeHtml(bodySource);
  const rawSectionTitle = raw.sectionTitle || raw.category || "";

  const alternates: ArticleAlternate[] = Array.isArray(raw.alternates)
    ? raw.alternates
        .filter((alt): alt is { lang: string; url: string; slug?: string } =>
          !!alt && typeof alt.lang === "string" && typeof alt.url === "string",
        )
        .map((alt) => ({ lang: alt.lang as Locale, url: alt.url, slug: alt.slug }))
    : [];

  return {
    id: raw.id,
    title: raw.title,
    slugId,
    sectionId: raw.sectionId ?? 0,
    sectionTitle: rawSectionTitle,
    sectionLink: raw.sectionLink || raw.categoryLink || "",
    photoPath: raw.photoPath ?? raw.photo ?? null,
    bodyHtml: sanitizedBody,
    tags: normalizeArticleTags(raw),
    youtubeUrl: extractArticleYoutubeUrl(raw),
    disdate: raw.disdate ?? "",
    statusId: raw.statusId ?? 0,
    langMeta,
    alternates,
  };
}

function normalizeFeedItem(
  raw: RawFeedItem,
  locale: Locale = "ar",
  parentLangMeta?: LanguageMeta,
): FeedItemDto {
  assertRawFeedItem(raw, "feed item");

  const slugId = pickLocaleSlug(raw.slugId ?? raw.slug, raw.title, raw.id, locale);

  // Per-item langMeta wins over the parent list's langMeta when the backend
  // supplies it (per backendfix.md §2.3). Otherwise inherit the parent's.
  const hasOwnLangMeta =
    raw.requestedLanguage !== undefined ||
    raw.contentLanguage !== undefined ||
    raw.fallbackUsed !== undefined;
  const langMeta = hasOwnLangMeta
    ? extractLangMeta(raw, locale)
    : (parentLangMeta ?? defaultLangMeta(locale));

  const rawSummary = raw.smallbody || "";
  const rawSectionTitle = raw.sectionTitle || raw.section_title || raw.category || "";
  const rawTag = raw.tag ?? null;

  return {
    id: raw.id,
    title: raw.title,
    slugId,
    summary: rawSummary,
    photoPath: raw.photoPath ?? raw.photo ?? null,
    disdate: raw.disdate ?? "",
    sectionTitle: rawSectionTitle,
    sectionLink: raw.sectionLink || raw.section_link || raw.categoryLink || "",
    tag: rawTag,
    langMeta,
  };
}

function normalizeSection(raw: RawSection, locale: Locale = "ar"): SectionDto {
  assertRawSection(raw, "section");

  const link = raw.link;
  const slug = pickLocaleSectionSlug(raw.slug, link, raw.title, raw.id, locale);

  return {
    id: raw.id,
    title: raw.title,
    link,
    slug,
    orderorder: raw.orderorder,
    active: raw.active,
    langMeta: extractLangMeta(raw, locale),
  };
}

function normalizeAuthor(raw: RawAuthor, locale: Locale = "ar"): AuthorDto {
  assertRawAuthor(raw, "author");

  const link = raw.link;
  const slug = pickLocaleSectionSlug(raw.slug, link, raw.title, raw.id, locale);
  const sanitizedBody = sanitizeHtml(raw.body || "");

  return {
    id: raw.id,
    title: raw.title,
    link,
    slug,
    photoPath: raw.photo ?? null,
    bodyHtml: sanitizedBody,
    orderorder: raw.orderorder,
    langMeta: extractLangMeta(raw, locale),
  };
}

function normalizePaginatedFeed(raw: RawPaginatedFeed, locale: Locale = "ar"): PaginatedFeedDto {
  if (!Array.isArray(raw.data)) {
    throw new Error("Malformed paginated feed payload: data must be an array");
  }

  const langMeta = extractLangMeta(raw, locale);
  logFallback("paginated feed", langMeta);

  // Strict locale isolation: when the list itself is an AR fallback for a
  // non-AR request, drop all items.
  const allowList = isPureLocale(langMeta, locale);
  const items = allowList
    ? raw.data
        .map((item) => normalizeFeedItem(item, locale, langMeta))
        .filter((item) => isPureLocale(item.langMeta, locale))
    : [];

  return {
    items,
    pagination: raw.pagination
      ? {
          page: raw.pagination.page,
          limit: raw.pagination.limit,
          total: raw.pagination.totalItems ?? raw.pagination.total ?? 0,
          totalPages: raw.pagination.totalPages ?? raw.pagination.total_pages ?? 1,
        }
      : null,
    langMeta,
  };
}

function normalizeCmsPage(raw: RawCmsPage, locale: Locale = "ar"): CmsPageDto {
  assertRawCmsPage(raw, "CMS page");

  const langMeta = extractLangMeta(raw, locale);
  logFallback(`CMS page ${raw.id}`, langMeta);

  return {
    id: raw.id,
    title: raw.title,
    slugId: raw.slugId ?? String(raw.id),
    bodyHtml: sanitizeHtml(raw.bodyHtml || raw.body || ""),
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
    langMeta,
  };
}

export async function getArticleById(id: number, locale?: Locale): Promise<ArticleDto | null> {
  // v1 contract: GET /v1/articles/by-id/{id}?lang= (path param, no .ashx)
  const url = applyLocale(createUrl(`/v1/articles/by-id/${id}`), locale);
  const raw = await fetchOptionalJson<RawArticle>(url, {
    headers: buildLocaleHeaders(locale),
  });
  if (!raw) return null;
  const article = normalizeArticle(raw, locale);
  return isPureLocale(article.langMeta, locale) ? article : null;
}

export async function getArticleBySlug(slug: string, locale?: Locale): Promise<ArticleDto | null> {
  // v1 contract: GET /v1/articles/by-slug/{slug}?lang=
  const url = applyLocale(createUrl(`/v1/articles/by-slug/${encodeURIComponent(slug)}`), locale);
  const raw = await fetchOptionalJson<RawArticle>(url, {
    headers: buildLocaleHeaders(locale),
  });
  if (!raw) return null;
  const article = normalizeArticle(raw, locale);
  return isPureLocale(article.langMeta, locale) ? article : null;
}

export async function getPreviewArticleById(
  id: number,
  token: string,
  locale?: Locale,
): Promise<ArticleDto | null> {
  // v1 contract: GET /v1/preview/articles/by-id/{id}?lang= (path param)
  const url = applyLocale(createUrl(`/v1/preview/articles/by-id/${id}`), locale);
  const raw = await fetchOptionalJson<RawArticle>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...buildLocaleHeaders(locale),
    },
  });
  if (!raw) return null;
  const article = normalizeArticle(raw, locale);
  return isPureLocale(article.langMeta, locale) ? article : null;
}

export async function getPreviewArticleBySlug(
  slug: string,
  token: string,
  locale?: Locale,
): Promise<ArticleDto | null> {
  // v1 contract: GET /v1/preview/articles/by-slug/{slug}?lang=
  const url = applyLocale(createUrl(`/v1/preview/articles/by-slug/${encodeURIComponent(slug)}`), locale);
  const raw = await fetchOptionalJson<RawArticle>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...buildLocaleHeaders(locale),
    },
  });
  if (!raw) return null;
  const article = normalizeArticle(raw, locale);
  return isPureLocale(article.langMeta, locale) ? article : null;
}

export async function mintPreviewToken(id: number): Promise<string> {
  const sharedSecret = requireEnv(
    "AKHBAR_PREVIEW_SHARED_SECRET",
    process.env.AKHBAR_PREVIEW_SHARED_SECRET,
  );

  const url = createUrl("/v1/preview/token", { id });
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Shared-Secret": sharedSecret,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Preview token request failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { token?: string };
    if (payload?.token) {
      return payload.token;
    }
  }

  const raw = (await response.text()).trim();
  if (!raw) {
    throw new Error("Preview token API returned an empty token");
  }

  return raw;
}

export async function getHomeFeed(limit = 12, locale?: Locale): Promise<FeedItemDto[]> {
  const url = applyLocale(createUrl("/v1/home/feed", { limit }), locale);
  let response: unknown;
  try {
    response = await fetchJson<unknown>(url, {
      headers: buildLocaleHeaders(locale),
    });
  } catch (error) {
    // Resilience: the home feed is rendered in the global layout. A 5xx from
    // the backend (e.g. broken EN/FR translation row) must not take the whole
    // app down — degrade to an empty feed and log instead.
    if (error instanceof ApiError && error.status >= 500) {
      console.warn(`[api] home feed ${locale ?? "ar"} returned ${error.status}; rendering empty feed`);
      return [];
    }
    throw error;
  }
  assertDataArray(response, "home feed");
  const langMeta = extractLangMeta(response as RawListResponse<RawFeedItem>, locale);
  logFallback("home feed", langMeta);
  // Strict locale isolation: drop the entire feed for non-AR if backend fell back to AR.
  if (!isPureLocale(langMeta, locale)) return [];
  return response.data
    .map((item) => normalizeFeedItem(item as RawFeedItem, locale, langMeta))
    .filter((item) => isPureLocale(item.langMeta, locale));
}

export async function getSections(locale?: Locale): Promise<SectionDto[]> {
  const url = applyLocale(createUrl("/v1/sections"), locale);
  let response: unknown;
  try {
    response = await fetchJson<unknown>(url, {
      headers: buildLocaleHeaders(locale),
    });
  } catch (error) {
    // Resilience: sections drive the primary nav rendered in the global layout.
    // Treat 5xx as "no sections available" rather than crashing the entire app.
    if (error instanceof ApiError && error.status >= 500) {
      console.warn(`[api] sections ${locale ?? "ar"} returned ${error.status}; rendering empty nav`);
      return [];
    }
    throw error;
  }
  assertDataArray(response, "sections");
  return response.data
    .map((item) => normalizeSection(item as RawSection, locale))
    .filter((section) => isPureLocale(section.langMeta, locale));
}

/**
 * Resolve a section's API link to its SEO-friendly slug.
 * Falls back to the original link if the section isn't found.
 */
export async function getSectionSlug(sectionLink: string, locale?: Locale): Promise<string> {
  if (!sectionLink) return sectionLink;
  const sections = await getSections(locale);
  const match = sections.find((s) => s.link === sectionLink);
  return match ? match.slug : sectionLink;
}

export async function getSectionBySlugOrId(slugOrId: string, locale?: Locale): Promise<SectionDto | null> {
  // Pure numeric ID — fetch directly by ID
  if (/^\d+$/.test(slugOrId)) {
    const url = applyLocale(createUrl("/v1/sections", { id: slugOrId }), locale);
    const response = await fetchOptionalJson<RawSection>(url, {
      headers: buildLocaleHeaders(locale),
    });
    if (!response) return null;
    const section = normalizeSection(response, locale);
    return isPureLocale(section.langMeta, locale) ? section : null;
  }

  const sections = await getSections(locale);

  // Try exact match on original API link first
  const byLink = sections.find((section) => section.link === slugOrId);
  if (byLink) return byLink;

  // Try match on generated SEO slug
  const bySlug = sections.find((section) => section.slug === slugOrId);
  if (bySlug) return bySlug;

  // Try extracting trailing numeric ID from a slugified URL (e.g., "سياسة-45")
  const trailingIdMatch = slugOrId.match(/-(\d+)$/);
  if (trailingIdMatch) {
    const id = trailingIdMatch[1];
    const url = applyLocale(createUrl("/v1/sections", { id }), locale);
    const response = await fetchOptionalJson<RawSection>(url, {
      headers: buildLocaleHeaders(locale),
    });
    if (!response) return null;
    const section = normalizeSection(response, locale);
    return isPureLocale(section.langMeta, locale) ? section : null;
  }

  return null;
}

export async function getArticlesBySection(
  sectionLink: string,
  page = 1,
  limit = 12,
  locale?: Locale,
): Promise<PaginatedFeedDto> {
  // v1 contract: GET /v1/news?lang=&page=&limit=. The backend is expected to
  // accept either `sectionSlug` (preferred for SEO) or `sectionId` as filters.
  // We send `sectionSlug` and keep legacy `section` alias for backwards compat
  // until the backend confirms which key is final.
  const params: Record<string, string | number> = {
    page,
    limit,
    sectionSlug: sectionLink,
    section: sectionLink, // legacy alias — remove once backend ships sectionSlug
  };
  if (/^\d+$/.test(sectionLink)) {
    params.sectionId = sectionLink;
  }
  const url = applyLocale(createUrl("/v1/news", params), locale);
  let response: RawPaginatedFeed;
  try {
    response = await fetchJson<RawPaginatedFeed>(url, {
      headers: buildLocaleHeaders(locale),
    });
  } catch (error) {
    // Resilience: the home page fans out one of these calls per section. A
    // single bad section must not crash the whole layout — degrade to an
    // empty paginated feed and log instead.
    if (error instanceof ApiError && error.status >= 500) {
      console.warn(`[api] section "${sectionLink}" (${locale ?? "ar"}) returned ${error.status}; rendering empty list`);
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 1 },
        langMeta: defaultLangMeta(locale),
      };
    }
    throw error;
  }
  return normalizePaginatedFeed(response, locale);
}

export async function searchArticles(query: string, limit = 12, locale?: Locale): Promise<FeedItemDto[]> {
  const response = await searchArticlesPaginated(query, 1, limit, locale);
  return response.items;
}

export async function searchArticlesPaginated(
  query: string,
  page = 1,
  limit = 12,
  locale?: Locale,
): Promise<PaginatedFeedDto> {
  const url = applyLocale(createUrl("/v1/search", { q: query, limit }), locale);
  url.searchParams.set("page", String(page));

  const response = await fetchJson<RawSearchResponse>(url, {
    headers: buildLocaleHeaders(locale),
  });

  assertDataArray(response, "search");

  if ("pagination" in response || "data" in response) {
    const langMeta = extractLangMeta(response as RawListResponse<RawFeedItem>, locale);
    logFallback("search", langMeta);
    const allowList = isPureLocale(langMeta, locale);
    const list = allowList
      ? response.data
          .map((item) => normalizeFeedItem(item, locale, langMeta))
          .filter((item) => isPureLocale(item.langMeta, locale))
      : [];
    const pagination = "pagination" in response && response.pagination
      ? {
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.totalItems ?? response.pagination.total ?? 0,
          totalPages: response.pagination.totalPages ?? response.pagination.total_pages ?? 1,
        }
      : {
          page,
          limit,
          total: page * limit + (list.length < limit ? 0 : limit),
          totalPages: page + (list.length === limit ? 1 : 0),
        };

    return {
      items: list,
      pagination,
      langMeta,
    };
  }

  return {
    items: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 1,
    },
    langMeta: defaultLangMeta(locale),
  };
}

export async function getAuthorBySlugOrId(slugOrId: string, locale?: Locale): Promise<AuthorDto | null> {
  // Pure numeric ID
  if (/^\d+$/.test(slugOrId)) {
    const url = applyLocale(createUrl("/v1/authors", { id: slugOrId }), locale);
    const response = await fetchOptionalJson<RawAuthor>(url, {
      headers: buildLocaleHeaders(locale),
    });
    if (!response) return null;
    const author = normalizeAuthor(response, locale);
    return isPureLocale(author.langMeta, locale) ? author : null;
  }

  // Try original link value
  const url = applyLocale(createUrl("/v1/authors", { link: slugOrId }), locale);
  const response = await fetchOptionalJson<RawAuthor>(url, {
    headers: buildLocaleHeaders(locale),
  });
  if (response) {
    const author = normalizeAuthor(response, locale);
    if (isPureLocale(author.langMeta, locale)) return author;
  }

  // Try extracting trailing numeric ID from slugified URL (e.g., "author-name-42")
  const trailingIdMatch = slugOrId.match(/-(\d+)$/);
  if (trailingIdMatch) {
    const idUrl = applyLocale(createUrl("/v1/authors", { id: trailingIdMatch[1] }), locale);
    const idResponse = await fetchOptionalJson<RawAuthor>(idUrl, {
      headers: buildLocaleHeaders(locale),
    });
    if (!idResponse) return null;
    const author = normalizeAuthor(idResponse, locale);
    return isPureLocale(author.langMeta, locale) ? author : null;
  }

  return null;
}

export async function getCmsPageById(id: number, locale?: Locale): Promise<CmsPageDto | null> {
  const url = applyLocale(createUrl(CMS_PAGE_PATH, { id }), locale);
  const response = await fetchOptionalJson<RawCmsPage>(url, {
    headers: buildLocaleHeaders(locale),
    next: { revalidate: 120 },
  });
  if (!response) return null;
  const page = normalizeCmsPage(response, locale);
  return isPureLocale(page.langMeta, locale) ? page : null;
}

export async function getArticlesByAuthor(
  slugOrId: string,
  page = 1,
  limit = 12,
  locale?: Locale,
): Promise<PaginatedFeedDto | null> {
  const url = applyLocale(createUrl(AUTHOR_ARTICLES_PATH, {
    [AUTHOR_QUERY_KEY]: slugOrId,
    page,
    limit,
  }), locale);

  const response = await fetchOptionalJson<RawPaginatedFeed>(url, {
    headers: buildLocaleHeaders(locale),
  });
  return response ? normalizePaginatedFeed(response, locale) : null;
}

function deriveLocaleHost(baseHost: string, locale: string): string {
  // Replace the leading hostname label, e.g. `www.akhbaralyawm.com` ->
  // `en.akhbaralyawm.com`. If the URL has no recognisable subdomain we fall
  // back to prefixing.
  try {
    const url = new URL(baseHost);
    const parts = url.hostname.split(".");
    if (parts.length >= 3) {
      // Replace the first label (e.g. "www" or existing locale code).
      parts[0] = locale;
    } else {
      // bare apex like example.com -> en.example.com
      parts.unshift(locale);
    }
    url.hostname = parts.join(".");
    return trimSlash(url.toString());
  } catch {
    return baseHost;
  }
}

function resolveAssetHost(locale?: string): string {
  const baseAr = trimSlash(
    ASSET_HOST_AR ?? requireEnv("NEXT_PUBLIC_ASSET_HOST", ASSET_HOST),
  );
  if (!locale || locale === "ar") return baseAr;
  if (locale === "en") return trimSlash(ASSET_HOST_EN ?? deriveLocaleHost(baseAr, "en"));
  if (locale === "fr") return trimSlash(ASSET_HOST_FR ?? deriveLocaleHost(baseAr, "fr"));
  return baseAr;
}

export function getAssetUrl(
  photoPath: string | null | undefined,
  locale?: string,
): string | null {
  if (!photoPath) {
    return null;
  }

  if (/^https?:\/\//i.test(photoPath)) {
    return photoPath;
  }

  const host = resolveAssetHost(locale);
  const path = photoPath.startsWith("/") ? photoPath : `/${photoPath}`;
  return `${host}${path}`;
}