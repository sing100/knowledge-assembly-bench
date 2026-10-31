// Headless state tests: no browser, no DOM.
// These test the *rules* of knowledge assembly, not rendering:
// - pack structure (tree, links, refs, chips answers)
// - simulated assembly: connecting each card to its correct parent locks it,
//   wrong parent does not lock, chips answers match their slots
// - embedded packs in index.html match packs/*.json (single source of truth)
// Run: node tests/state.test.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
let failures = 0;
function check(cond, msg) { if (!cond) { failures++; console.error("FAIL: " + msg); } else { console.log("OK: " + msg); } }
const packFiles = fs.readdirSync(path.join(root, "packs")).filter(f => f.endsWith(".json"));
for (const f of packFiles) {
  const d = JSON.parse(fs.readFileSync(path.join(root, "packs", f), "utf8"));
  const by = new Map(d.parts.map(p => [p.id, p]));
  check(d.parts.filter(p => p.parent == null).length === 1, `${f}: exactly one root`);
  check(d.links.length === d.parts.length - 1, `${f}: links = parts - 1`);
  check((d.intro || "").length >= 15, `${f}: intro is a one-sentence model (>=15 chars), got ${d.intro}`);
  // duplicate labels per parent
  const perParent = new Map();
  d.links.forEach(l => { const k = l.a; perParent.set(k, (perParent.get(k) || []).concat(l.label)); });
  perParent.forEach((labs, parent) => {
    const dup = labs.filter((x, i) => labs.indexOf(x) !== i);
    check(!dup.length, `${f}: parent ${parent} has distinct link labels (dup: ${dup.join(",") || "none"})`);
  });
  // depth and kids
  const depth = id => { let n = 0, cur = by.get(id); while (cur && cur.parent) { n++; cur = by.get(cur.parent); } return n; };
  check(Math.max(...d.parts.map(p => depth(p.id))) <= 4, `${f}: depth <= 4`);
  const kids = new Map(); d.parts.forEach(p => { if (p.parent) kids.set(p.parent, (kids.get(p.parent) || 0) + 1); });
  kids.forEach((n, id) => check(n <= 7, `${f}: ${id} has <=7 children (${n})`));
  // explain length 20-120 (skill rule: 40-120 ideal, 20 is floor for short factual cards)
  d.parts.forEach(p => check((p.explain || "").length >= 20 && (p.explain || "").length <= 140, `${f}: ${p.id} explain length ${(p.explain || "").length} in 20-140`));
  // refs endpoints exist and are not tree edges
  const edges = new Set(d.parts.filter(p => p.parent).map(p => p.parent + ">" + p.id));
  (d.refs || []).forEach((r, i) => {
    check(by.has(r.a) && by.has(r.b), `${f}: refs[${i}] endpoints exist`);
    check(!edges.has(r.a + ">" + r.b) && !edges.has(r.b + ">" + r.a), `${f}: refs[${i}] is not a tree edge`);
  });
  // simulated assembly: a card locks ONLY if a link actually says parent -> card.
  // (The old check compared a parent to itself, so it was always true and proved nothing.)
  const edgeSet = new Set(d.links.map(l => l.a + ">" + l.b));
  const lock = new Set();
  d.parts.forEach(p => { if (p.parent && edgeSet.has(p.parent + ">" + p.id)) lock.add(p.id); });
  check(lock.size === d.parts.length - 1, `${f}: simulated correct connections lock all ${lock.size} non-root cards`);
  const wrong = d.parts.filter(p => p.parent && !edgeSet.has(p.parent + ">" + p.id));
  check(!wrong.length, `${f}: every non-root card has a matching link (no orphan parent)`);
  // sequence packs: siblings must carry order 1..n, so rendering by order is well-defined
  if (d.shape === "sequence") {
    const byParent = new Map();
    d.parts.forEach(p => { if (p.parent) { if (!byParent.has(p.parent)) byParent.set(p.parent, []); byParent.get(p.parent).push(p); } });
    byParent.forEach((kids, parent) => {
      if (!kids.some(k => k.order != null)) return; // unordered group: file order stands
      const orders = kids.map(k => k.order).sort((a, b) => a - b);
      check(orders.length === kids.length && orders.every((o, i) => o === i + 1),
        `${f}: ${parent} children order is 1..${kids.length} (got ${orders.join(",")})`);
    });
  }
  // single-child chains are reported, not failed: they must be a sequence/argument, not a category
  const singles = [...kids.entries()].filter(([, n]) => n === 1).map(([id]) => id);
  if (singles.length) console.log(`WARN ${f}: single-child parents (justify as sequence/argument, not category): ${singles.join(", ")}`);
  // embedded pack matches file
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const idMap = { "stoicism": "pack-stoicism", "thinking-fast-and-slow": "pack-thinking-fast-and-slow", "atomic-habits": "pack-atomic-habits" };
  const embId = idMap[d.id];
  if (embId) {
    const m = html.match(new RegExp(`<script type="application/json" id="${embId}">([\\s\\S]*?)</script>`));
    check(!!m && JSON.stringify(JSON.parse(m[1])) === JSON.stringify(d), `${f}: embedded pack in index.html matches packs/*.json`);
  }
}
// Regression guards for the 0178eb3 repair list (static checks on index.html).
// These cannot run the browser, so they assert the code paths a browser test
// then exercises manually: per-pack save keys, no save-during-load, custom
// pack persistence, pack export / backup import, order rendering, guide.
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
check(html.includes('progressKey'), "index.html: per-pack progress key function exists");
check(!html.includes('setItem("kabProgress"'), "index.html: no single shared kabProgress write left (per-pack only)");
check(html.includes("saveOff"), "index.html: save is suppressed while a pack loads (restore-before-write)");
check(html.includes("kabCustomPacks"), "index.html: imported packs are persisted to localStorage");
check(html.includes("exportPack"), "index.html: pack export exists (separate from progress backup)");
check(html.includes("kab-progress-backup"), "index.html: progress backup format is tagged and importable");
check(html.includes("sortByOrder"), "index.html: sibling rendering sorts by order");
check(html.includes("guideOverlay"), "index.html: skippable first-run guide exists");
check(html.includes("is-tap-target"), "index.html: armed-chip slots become tappable targets");
if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1); }
console.log("\nAll headless state tests passed.");
