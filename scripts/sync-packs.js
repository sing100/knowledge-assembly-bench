#!/usr/bin/env node
// Single source of truth: packs/*.json
// index.html embeds the same packs in <script type="application/json" id="pack-*">
// so the page still works offline by double-clicking index.html (no fetch, no build).
// Do NOT edit the embedded JSON by hand. Edit packs/*.json, then run:
//   node scripts/sync-packs.js
// CI runs `node scripts/sync-packs.js --check` and fails if embedded != files.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const mapping = {
  "pack-stoicism": "packs/stoicism.json",
  "pack-thinking-fast-and-slow": "packs/thinking-fast-and-slow.json",
  "pack-atomic-habits": "packs/atomic-habits.json",
};
const check = process.argv.includes("--check");
let html = fs.readFileSync(htmlPath, "utf8");
let changed = false;
for (const [id, rel] of Object.entries(mapping)) {
  const file = path.join(root, rel);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const pretty = fs.readFileSync(file, "utf8").trim();
  const re = new RegExp(
    `(<script type="application/json" id="${id}">)[\\s\\S]*?(</script>)`
  );
  const m = html.match(re);
  if (!m) {
    console.error(`Missing embedded pack: ${id}`);
    process.exit(1);
  }
  const embedded = m[0].slice(m[1].length, m[0].length - m[2].length).trim();
  let embeddedJson;
  try { embeddedJson = JSON.parse(embedded); } catch (e) { embeddedJson = null; }
  const same = embeddedJson && JSON.stringify(embeddedJson) === JSON.stringify(data);
  if (!same) {
    if (check) {
      console.error(`Drift: embedded ${id} != ${rel}. Run: node scripts/sync-packs.js`);
      process.exit(1);
    }
    html = html.replace(re, `$1\n${pretty}\n$2`);
    changed = true;
    console.log(`Synced ${id} from ${rel}`);
  } else {
    console.log(`OK ${id} == ${rel}`);
  }
}
if (changed && !check) fs.writeFileSync(htmlPath, html);
if (check) console.log("Sync check passed: embedded packs match packs/*.json");
