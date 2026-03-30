import { NextRequest, NextResponse } from "next/server";

import { getArticlesByAuthor } from "@/src/lib/api";

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
  const author = request.nextUrl.searchParams.get("author");

  if (!author) {
    return NextResponse.json({ error: "Missing required query param: author" }, { status: 400 });
  }

  const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1);
  const limit = Math.min(parsePositiveInt(request.nextUrl.searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);

  try {
    const response = await getArticlesByAuthor(author, page, limit);

    if (!response) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch author archive" }, { status: 500 });
  }
}
