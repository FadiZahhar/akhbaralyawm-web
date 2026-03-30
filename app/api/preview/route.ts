import { NextRequest, NextResponse } from "next/server";

import { mintPreviewToken } from "@/src/lib/api";

const PREVIEW_COOKIE_NAME = "previewToken";

function isValidId(input: string | null): input is string {
  return input !== null && /^\d+$/.test(input);
}

function safePath(input: string | null, fallback: string): string {
  if (!input || !input.startsWith("/")) {
    return fallback;
  }

  return input;
}

export async function GET(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get("id");

  if (!isValidId(idParam)) {
    return NextResponse.json(
      { error: "Invalid or missing id query parameter" },
      { status: 400 },
    );
  }

  const id = Number.parseInt(idParam, 10);
  const slugId = request.nextUrl.searchParams.get("slugId");
  const redirectPath = safePath(slugId ? `/news/${slugId}` : null, `/news/article-${id}`);

  try {
    const token = await mintPreviewToken(id);
    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    response.cookies.set({
      name: PREVIEW_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to enable preview mode",
        message: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 502 },
    );
  }
}