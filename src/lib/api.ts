export type ArticleDto = {
  id: number;
  title: string;
  slugId: string;
  sectionId: number;
  sectionTitle: string;
  sectionLink: string;
  photoPath: string | null;
  bodyHtml: string;
  disdate: string;
  statusId: number;
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
};

export type SectionDto = {
  id: number;
  title: string;
  link: string;
  orderorder: number;
  active?: boolean;
};

export type AuthorDto = {
  id: number;
  title: string;
  link: string;
  photoPath: string | null;
  bodyHtml: string;
  orderorder: number;
};

export type PaginatedFeedDto = {
  items: FeedItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
};

export type CmsPageDto = {
  id: number;
  title: string;
  slugId: string;
  bodyHtml: string;
  updatedAt: string;
};

const API_BASE_URL = process.env.API_BASE_URL;
const ASSET_HOST = process.env.NEXT_PUBLIC_ASSET_HOST;

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
  disdate?: string;
  statusId?: number;
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
};

type RawSection = {
  id: number;
  title: string;
  link: string;
  orderorder: number;
  active?: boolean;
};

type RawAuthor = {
  id: number;
  title: string;
  link: string;
  photo?: string | null;
  body?: string | null;
  orderorder: number;
};

type RawPagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

type RawPaginatedFeed = {
  data: RawFeedItem[];
  pagination?: RawPagination;
};

type RawListResponse<T> = {
  data: T[];
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
};

const CMS_PAGE_PATH = process.env.API_CMS_PAGE_PATH || "/v1/pages/by-id.ashx";
const AUTHOR_ARTICLES_PATH = process.env.API_AUTHOR_ARTICLES_PATH || "/v1/news.ashx";
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
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchOptionalJson<T>(input: URL, init?: RequestInit): Promise<T | null> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

function normalizeArticle(raw: RawArticle): ArticleDto {
  assertRawArticle(raw, "article");

  return {
    id: raw.id,
    title: raw.title,
    slugId: raw.slugId ?? String(raw.id),
    sectionId: raw.sectionId ?? 0,
    sectionTitle: raw.sectionTitle ?? raw.category ?? "",
    sectionLink: raw.sectionLink ?? raw.categoryLink ?? "",
    photoPath: raw.photoPath ?? raw.photo ?? null,
    bodyHtml: raw.bodyHtml ?? raw.body ?? "",
    disdate: raw.disdate ?? "",
    statusId: raw.statusId ?? 0,
  };
}

function normalizeFeedItem(raw: RawFeedItem): FeedItemDto {
  assertRawFeedItem(raw, "feed item");

  return {
    id: raw.id,
    title: raw.title,
    slugId: raw.slugId ?? raw.slug ?? String(raw.id),
    summary: raw.smallbody ?? "",
    photoPath: raw.photoPath ?? raw.photo ?? null,
    disdate: raw.disdate ?? "",
    sectionTitle: raw.sectionTitle ?? raw.section_title ?? raw.category ?? "",
    sectionLink: raw.sectionLink ?? raw.section_link ?? raw.categoryLink ?? "",
    tag: raw.tag ?? null,
  };
}

function normalizeSection(raw: RawSection): SectionDto {
  assertRawSection(raw, "section");

  return {
    id: raw.id,
    title: raw.title,
    link: raw.link,
    orderorder: raw.orderorder,
    active: raw.active,
  };
}

function normalizeAuthor(raw: RawAuthor): AuthorDto {
  assertRawAuthor(raw, "author");

  return {
    id: raw.id,
    title: raw.title,
    link: raw.link,
    photoPath: raw.photo ?? null,
    bodyHtml: raw.body ?? "",
    orderorder: raw.orderorder,
  };
}

function normalizePaginatedFeed(raw: RawPaginatedFeed): PaginatedFeedDto {
  if (!Array.isArray(raw.data)) {
    throw new Error("Malformed paginated feed payload: data must be an array");
  }

  return {
    items: raw.data.map(normalizeFeedItem),
    pagination: raw.pagination
      ? {
          page: raw.pagination.page,
          limit: raw.pagination.limit,
          total: raw.pagination.total,
          totalPages: raw.pagination.total_pages,
        }
      : null,
  };
}

function normalizeCmsPage(raw: RawCmsPage): CmsPageDto {
  assertRawCmsPage(raw, "CMS page");

  return {
    id: raw.id,
    title: raw.title,
    slugId: raw.slugId ?? String(raw.id),
    bodyHtml: raw.bodyHtml ?? raw.body ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}

export async function getArticleById(id: number): Promise<ArticleDto | null> {
  const url = createUrl("/v1/articles/by-id.ashx", { id });
  const raw = await fetchOptionalJson<RawArticle>(url);
  return raw ? normalizeArticle(raw) : null;
}

export async function getPreviewArticleById(
  id: number,
  token: string,
): Promise<ArticleDto | null> {
  const url = createUrl("/v1/preview/articles/by-id.ashx", { id });
  const raw = await fetchOptionalJson<RawArticle>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return raw ? normalizeArticle(raw) : null;
}

export async function mintPreviewToken(id: number): Promise<string> {
  const sharedSecret = requireEnv(
    "AKHBAR_PREVIEW_SHARED_SECRET",
    process.env.AKHBAR_PREVIEW_SHARED_SECRET,
  );

  const url = createUrl("/v1/preview/token.ashx", { id });
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

export async function getHomeFeed(limit = 12): Promise<FeedItemDto[]> {
  const url = createUrl("/v1/home/feed.ashx", { limit });
  const response = await fetchJson<unknown>(url);
  assertDataArray(response, "home feed");
  return response.data.map((item) => normalizeFeedItem(item as RawFeedItem));
}

export async function getSections(): Promise<SectionDto[]> {
  const url = createUrl("/v1/sections.ashx");
  const response = await fetchJson<unknown>(url);
  assertDataArray(response, "sections");
  return response.data.map((item) => normalizeSection(item as RawSection));
}

export async function getSectionBySlugOrId(slugOrId: string): Promise<SectionDto | null> {
  if (/^\d+$/.test(slugOrId)) {
    const url = createUrl("/v1/sections.ashx", { id: slugOrId });
    const response = await fetchOptionalJson<RawSection>(url);
    return response ? normalizeSection(response) : null;
  }

  const sections = await getSections();
  return sections.find((section) => section.link === slugOrId) ?? null;
}

export async function getArticlesBySection(
  sectionLink: string,
  page = 1,
  limit = 12,
): Promise<PaginatedFeedDto> {
  const url = createUrl("/v1/news.ashx", {
    section: sectionLink,
    page,
    limit,
  });
  const response = await fetchJson<RawPaginatedFeed>(url);
  return normalizePaginatedFeed(response);
}

export async function searchArticles(query: string, limit = 12): Promise<FeedItemDto[]> {
  const response = await searchArticlesPaginated(query, 1, limit);
  return response.items;
}

export async function searchArticlesPaginated(
  query: string,
  page = 1,
  limit = 12,
): Promise<PaginatedFeedDto> {
  const url = createUrl("/v1/search.ashx", { q: query, limit });
  url.searchParams.set("page", String(page));

  const response = await fetchJson<RawSearchResponse>(url);

  assertDataArray(response, "search");

  if ("pagination" in response || "data" in response) {
    const list = response.data.map(normalizeFeedItem);
    const pagination = "pagination" in response && response.pagination
      ? {
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.total_pages,
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
  };
}

export async function getAuthorBySlugOrId(slugOrId: string): Promise<AuthorDto | null> {
  const params: Record<string, string> = /^\d+$/.test(slugOrId) ? { id: slugOrId } : { link: slugOrId };
  const url = createUrl("/v1/authors.ashx", params);
  const response = await fetchOptionalJson<RawAuthor>(url);
  return response ? normalizeAuthor(response) : null;
}

export async function getCmsPageById(id: number): Promise<CmsPageDto | null> {
  const url = createUrl(CMS_PAGE_PATH, { id });
  const response = await fetchOptionalJson<RawCmsPage>(url);
  return response ? normalizeCmsPage(response) : null;
}

export async function getArticlesByAuthor(
  slugOrId: string,
  page = 1,
  limit = 12,
): Promise<PaginatedFeedDto | null> {
  const url = createUrl(AUTHOR_ARTICLES_PATH, {
    [AUTHOR_QUERY_KEY]: slugOrId,
    page,
    limit,
  });

  const response = await fetchOptionalJson<RawPaginatedFeed>(url);
  return response ? normalizePaginatedFeed(response) : null;
}

export function getAssetUrl(photoPath: string | null | undefined): string | null {
  if (!photoPath) {
    return null;
  }

  if (/^https?:\/\//i.test(photoPath)) {
    return photoPath;
  }

  const host = trimSlash(requireEnv("NEXT_PUBLIC_ASSET_HOST", ASSET_HOST));
  const path = photoPath.startsWith("/") ? photoPath : `/${photoPath}`;
  return `${host}${path}`;
}