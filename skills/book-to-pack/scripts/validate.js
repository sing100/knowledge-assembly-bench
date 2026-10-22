#!/usr/bin/env node
// 校验知识组装台知识包：node validate.js pack.json
const fs = require("fs");
const file = process.argv[2];
if (!file) { console.error("用法: node validate.js pack.json"); process.exit(2); }
let p, errs = [], warns = [];
try { p = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.error("JSON 解析失败: " + e.message); process.exit(1); }
for (const k of ["id", "title", "parts", "links"]) if (p[k] == null) errs.push("缺少字段 " + k);
const SHAPES = ["tree", "argument", "sequence"];
const REF_TYPES = ["author", "source", "depends", "causes", "contrasts", "example"];
if (p.shape != null && !SHAPES.includes(p.shape)) errs.push(`shape 应为 ${SHAPES.join(" / ")}`);
if (p.shape == null) warns.push("没有写 shape，按 tree 处理");
const parts = p.parts || [], links = p.links || [], refs = p.refs || [];
const ids = new Map();
parts.forEach((q, i) => {
  if (!q.id || !q.label) errs.push(`parts[${i}] 缺少 id 或 label`);
  if (ids.has(q.id)) errs.push("重复的 id: " + q.id);
  ids.set(q.id, q);
  if (!q.note) warns.push(`${q.id} 没有 note（含义）`);
  else if ([...q.note].length > 12) warns.push(`${q.id} 的 note 偏长: ${q.note}`);
});
const roots = parts.filter(q => q.parent == null);
if (roots.length !== 1) errs.push(`根节点应恰好 1 个，现在 ${roots.length} 个`);
parts.forEach(q => { if (q.parent != null && !ids.has(q.parent)) errs.push(`${q.id} 的 parent 不存在: ${q.parent}`); });
parts.forEach(q => { const seen = new Set(); let c = q.id; while (c != null) { if (seen.has(c)) { errs.push("出现环: " + q.id); break; } seen.add(c); c = ids.get(c) ? ids.get(c).parent : null; } });
const edge = new Set(parts.filter(q => q.parent != null).map(q => q.parent + ">" + q.id));
const lk = new Set();
links.forEach((l, i) => {
  const k = l.a + ">" + l.b;
  if (!edge.has(k)) errs.push(`links[${i}] ${k} 不是树上的边（a 应为上级，b 为下级）`);
  if (lk.has(k)) errs.push("重复的 link: " + k);
  lk.add(k);
  if (!l.label) errs.push(`links[${i}] 缺少 label`);
});
edge.forEach(k => { if (!lk.has(k)) errs.push("树边缺少关系词: " + k); });
refs.forEach((r, i) => {
  if (!ids.has(r.a) || !ids.has(r.b)) errs.push(`refs[${i}] 端点不存在: ${r.a} → ${r.b}`);
  if (!REF_TYPES.includes(r.type)) errs.push(`refs[${i}] type 应为 ${REF_TYPES.join(" / ")}`);
  if (!r.label) errs.push(`refs[${i}] 缺少 label`);
  if (edge.has(r.a + ">" + r.b) || edge.has(r.b + ">" + r.a)) errs.push(`refs[${i}] 与树边重复: ${r.a} → ${r.b}`);
});
// 深度与子节点数
const depth = id => { let d = 0, c = ids.get(id); while (c && c.parent != null) { d++; c = ids.get(c.parent); } return d; };
const maxD = Math.max(0, ...parts.map(q => depth(q.id)));
if (maxD > 4) warns.push(`树深 ${maxD} 层，建议不超过 4 层`);
const kids = new Map(); parts.forEach(q => { if (q.parent != null) kids.set(q.parent, (kids.get(q.parent) || 0) + 1); });
kids.forEach((n, id) => { if (n > 7) warns.push(`${id} 有 ${n} 个子节点，建议 2～7 个`); });
// 同级关系词重复
const sib = new Map(); links.forEach(l => { const k = l.a + "|" + l.label; sib.set(k, (sib.get(k) || 0) + 1); });
sib.forEach((n, k) => { if (n > 1) warns.push(`${k.split("|")[0]} 下有 ${n} 条同样的关系词「${k.split("|")[1]}」，若不是同类并列，学习者难以区分`); });
// sequence：子节点的 order 必须是 1..n
if (p.shape === "sequence") {
  const byPar = new Map(); parts.forEach(q => { if (q.order != null) { if (!byPar.has(q.parent)) byPar.set(q.parent, []); byPar.get(q.parent).push(q.order); } });
  if (!byPar.size) errs.push("shape 为 sequence 时，至少一组兄弟卡要写 order");
  byPar.forEach((os, par) => {
    const all = parts.filter(q => q.parent === par);
    if (os.length !== all.length) errs.push(`${par} 的子节点只有一部分写了 order`);
    const s = [...os].sort((a, b) => a - b);
    if (s.some((v, i) => v !== i + 1)) errs.push(`${par} 的子节点 order 应为 1..${all.length} 且不重复`);
  });
}
if (parts.length < 10 || parts.length > 60) warns.push(`卡片数 ${parts.length}，建议 20～40`);
warns.forEach(w => console.log("提醒: " + w));
if (errs.length) { errs.forEach(e => console.error("错误: " + e)); process.exit(1); }
console.log(`通过（${p.shape || "tree"}）：${parts.length} 张卡，${links.length} 条关系，${refs.length} 条关联线`);
