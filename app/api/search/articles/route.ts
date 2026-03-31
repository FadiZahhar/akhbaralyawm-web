import { NextRequest, NextResponse } from "next/server";

import { searchArticlesPaginated } from "@/src/lib/api";
import { isLocale, type Locale } from "@/src/lib/i18n";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing required query param: q" }, { status: 400 });
  }

  const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1);
  const limit = Math.min(parsePositiveInt(request.nextUrl.searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);
  const rawLang = request.nextUrl.searchParams.get("lang");
  const locale: Locale | undefined = rawLang && isLocale(rawLang) ? rawLang : undefined;

  try {
    const response = await searchArticlesPaginated(query, page, limit, locale);
    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}
