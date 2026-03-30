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

const API_BASE_URL = process.env.API_BASE_URL;
const ASSET_HOST = process.env.NEXT_PUBLIC_ASSET_HOST;

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

export async function getArticleById(id: number): Promise<ArticleDto | null> {
  const url = createUrl("/v1/article/by-id.ashx", { id });
  return fetchJson<ArticleDto | null>(url);
}

export async function getPreviewArticleById(
  id: number,
  token: string,
): Promise<ArticleDto | null> {
  const url = createUrl("/v1/preview/article/by-id.ashx", { id, token });
  return fetchJson<ArticleDto | null>(url);
}

export async function mintPreviewToken(): Promise<string> {
  const sharedSecret = requireEnv(
    "AKHBAR_PREVIEW_SHARED_SECRET",
    process.env.AKHBAR_PREVIEW_SHARED_SECRET,
  );

  const url = createUrl("/v1/preview/token.ashx");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Akhbar-Preview-Secret": sharedSecret,
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