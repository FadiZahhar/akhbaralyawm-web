import { NextRequest, NextResponse } from "next/server";

const PREVIEW_COOKIE_NAME = "previewToken";

function safePath(input: string | null): string {
  if (!input || !input.startsWith("/")) {
    return "/";
  }

  return input;
}

export async function GET(request: NextRequest) {
  const redirectPath = safePath(request.nextUrl.searchParams.get("redirect"));
  const response = NextResponse.redirect(new URL(redirectPath, request.url));

  response.cookies.set({
    name: PREVIEW_COOKIE_NAME,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}