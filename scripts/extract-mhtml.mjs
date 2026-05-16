#!/usr/bin/env node
// Extract the HTML payload (and any inline CSS parts) from a Chrome-saved
// MHTML file into a flat, browser-loadable snapshot under `public/legacy-snapshot/<name>/`.
//
// Why: MHTML is a frozen, deterministic copy of the legacy site. We use it as
// the *target* for /v2 visual parity. The snapshot is served as a static file
// so we can iframe it next to /v2 and run pixel diffs against it.
//
// Asset strategy (PR #1, deliberately small):
//   - The HTML's absolute URLs (https://www.akhbaralyawm.com/...) are left
//     intact. The legacy CDN serves the assets, so the snapshot only needs
//     network during capture/compare runs.
//   - Inline CSS parts inside the MHTML are also written out for later use
//     (offline parity) but are NOT wired into the HTML in this pass.
//
// Usage:
//   node scripts/extract-mhtml.mjs public/sourcehtml/homear.mhtml home-ar
//   node scripts/extract-mhtml.mjs public/sourcehtml/Local\ News.mhtml local-news
//
// Output:
//   public/legacy-snapshot/<name>/index.html
//   public/legacy-snapshot/<name>/css/*.css

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function decodeQuotedPrintable(input) {
  // Remove soft line breaks then decode =XX hex octets to bytes.
  const normalized = input.replace(/=\r?\n/g, "");
  const bytes = [];
  let i = 0;
  while (i < normalized.length) {
    const ch = normalized.charCodeAt(i);
    if (ch === 0x3d /* = */ && i + 2 < normalized.length) {
      const hex = normalized.slice(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16));
        i += 3;
        continue;
      }
    }
    bytes.push(ch);
    i += 1;
  }
  return Buffer.from(bytes);
}

function parseHeaders(rawHeaderBlock) {
  const headers = {};
  // RFC 822 header folding: continuation lines start with whitespace.
  const unfolded = rawHeaderBlock.replace(/\r?\n[ \t]+/g, " ");
  for (const line of unfolded.split(/\r?\n/)) {
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const name = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    headers[name] = value;
  }
  return headers;
}

function getBoundary(headerBlock) {
  const headers = parseHeaders(headerBlock);
  const contentType = headers["content-type"] || "";
  const match = contentType.match(/boundary="?([^";]+)"?/i);
  if (!match) throw new Error("No multipart boundary found in MHTML envelope");
  return match[1];
}

function splitParts(raw, boundary) {
  const marker = `--${boundary}`;
  const parts = [];
  let cursor = raw.indexOf(marker);
  if (cursor === -1) throw new Error("Boundary not found in body");
  cursor += marker.length;
  while (cursor < raw.length) {
    // Skip CRLF after marker
    if (raw.startsWith("\r\n", cursor)) cursor += 2;
    else if (raw.startsWith("\n", cursor)) cursor += 1;
    // End marker?
    if (raw.startsWith("--", cursor)) break;
    const nextMarker = raw.indexOf(marker, cursor);
    if (nextMarker === -1) break;
    parts.push(raw.slice(cursor, nextMarker));
    cursor = nextMarker + marker.length;
  }
  return parts;
}

function parsePart(rawPart) {
  // Header/body separated by a blank line (CRLFCRLF or LFLF).
  const sepCrlf = rawPart.indexOf("\r\n\r\n");
  const sepLf = rawPart.indexOf("\n\n");
  let sep, sepLen;
  if (sepCrlf !== -1 && (sepLf === -1 || sepCrlf < sepLf)) {
    sep = sepCrlf;
    sepLen = 4;
  } else if (sepLf !== -1) {
    sep = sepLf;
    sepLen = 2;
  } else {
    return null;
  }
  const headerBlock = rawPart.slice(0, sep);
  const body = rawPart.slice(sep + sepLen).replace(/\r?\n$/, "");
  const headers = parseHeaders(headerBlock);
  const encoding = (headers["content-transfer-encoding"] || "").toLowerCase();
  const contentType = (headers["content-type"] || "").toLowerCase();
  const contentLocation = headers["content-location"] || "";

  let buffer;
  if (encoding === "base64") {
    buffer = Buffer.from(body.replace(/\s+/g, ""), "base64");
  } else if (encoding === "quoted-printable") {
    buffer = decodeQuotedPrintable(body);
  } else {
    buffer = Buffer.from(body, "utf8");
  }

  return { headers, contentType, contentLocation, encoding, buffer };
}

function safeFilenameFromUrl(url, fallbackExt) {
  try {
    const parsed = new URL(url);
    const base = path.posix.basename(parsed.pathname) || `asset${fallbackExt}`;
    return base.replace(/[^\w.\-]+/g, "_");
  } catch {
    return `asset${fallbackExt}`;
  }
}

async function main() {
  const [, , inputArg, nameArg] = process.argv;
  if (!inputArg || !nameArg) {
    console.error("Usage: node scripts/extract-mhtml.mjs <input.mhtml> <snapshot-name>");
    process.exit(2);
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const outDir = path.resolve(process.cwd(), "public", "legacy-snapshot", nameArg);
  const cssDir = path.join(outDir, "css");
  await mkdir(cssDir, { recursive: true });

  const raw = await readFile(inputPath, "utf8");

  // Split into envelope headers + body at the first blank line.
  const sepIdx = raw.search(/\r?\n\r?\n/);
  if (sepIdx === -1) throw new Error("Malformed MHTML: no envelope/body separator");
  const envelopeHeaders = raw.slice(0, sepIdx);
  const body = raw.slice(sepIdx).replace(/^\r?\n\r?\n/, "");
  const boundary = getBoundary(envelopeHeaders);

  const parts = splitParts(body, boundary);

  let htmlPart = null;
  const cssParts = [];

  for (const rawPart of parts) {
    const parsed = parsePart(rawPart);
    if (!parsed) continue;
    if (parsed.contentType.startsWith("text/html") && !htmlPart) {
      htmlPart = parsed;
    } else if (parsed.contentType.startsWith("text/css")) {
      cssParts.push(parsed);
    }
  }

  if (!htmlPart) throw new Error("No text/html part found in MHTML");

  // Strip dead `cid:...@mhtml.blink` references that only resolve inside an
  // MHTML viewer. The page also loads the same stylesheets via absolute URLs,
  // so the visual outcome is unchanged once these are removed.
  const cleanedHtml = htmlPart.buffer
    .toString("utf8")
    .replace(/<link[^>]*href=["']cid:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/\s+(src|href)=["']cid:[^"']+["']/gi, "");
  htmlPart = { ...htmlPart, buffer: Buffer.from(cleanedHtml, "utf8") };

  // Write CSS parts so a future pass can wire them in for fully-offline parity.
  for (let idx = 0; idx < cssParts.length; idx += 1) {
    const css = cssParts[idx];
    const filename = safeFilenameFromUrl(css.contentLocation, ".css") || `part-${idx}.css`;
    await writeFile(path.join(cssDir, filename), css.buffer);
  }

  await writeFile(path.join(outDir, "index.html"), htmlPart.buffer);

  // Minimal manifest for traceability.
  const manifest = {
    source: path.relative(process.cwd(), inputPath).replace(/\\/g, "/"),
    extractedAt: new Date().toISOString(),
    htmlBytes: htmlPart.buffer.length,
    cssParts: cssParts.length,
    note: "Asset URLs in index.html remain absolute (https://www.akhbaralyawm.com/...). Network required to render.",
  };
  await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  console.log(
    `Extracted ${nameArg}: ${(htmlPart.buffer.length / 1024).toFixed(1)} KB HTML, ${cssParts.length} CSS parts -> ${path.relative(process.cwd(), outDir)}`,
  );
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
