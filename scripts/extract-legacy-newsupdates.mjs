// Extract Apr 18 frozen newsUpdate-item data from the legacy snapshot.
// Output: tests/fixtures/legacy-newsupdates-ar.json
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const html = await fs.readFile(
  path.join(ROOT, "public/legacy-snapshot/home-ar/index.html"),
  "utf8",
);

// Each newsUpdate-item is wrapped in an <a href="..."><div class="row newsUpdate-item">
//   <div class="col-2 col-sm-3 col-lg-2">HH:MM</div>
//   <div class="col-10 col-sm-9 col-lg-10">TITLE</div>
// </div></a>
const ITEM_RE =
  /<a\s+href="([^"]+)"[^>]*>\s*<div class="row newsUpdate-item"[^>]*>\s*<div class="col-2 col-sm-3 col-lg-2"[^>]*>([^<]+)<\/div>\s*<div class="col-10 col-sm-9 col-lg-10"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/a>/g;

const items = [];
let m;
while ((m = ITEM_RE.exec(html)) !== null) {
  const href = m[1].trim();
  const time = m[2].trim();
  const title = m[3].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  // href like https://www.akhbaralyawm.com/news/12345/slug — extract id
  const idMatch = href.match(/\/news\/(\d+)/);
  items.push({
    href,
    slugId: idMatch ? idMatch[1] : href,
    id: idMatch ? Number(idMatch[1]) : items.length + 1,
    time,
    title,
  });
}

const outPath = path.join(ROOT, "tests/fixtures/legacy-newsupdates-ar.json");
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, JSON.stringify(items, null, 2));
console.log(`Extracted ${items.length} newsUpdate-item rows → ${path.relative(ROOT, outPath)}`);
console.log("First 3:");
items.slice(0, 3).forEach((i) => console.log(` ${i.time} | ${i.title.slice(0, 80)}`));
