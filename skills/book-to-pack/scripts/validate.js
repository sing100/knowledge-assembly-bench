#!/usr/bin/env node
// 校验知识组装台知识包：node validate.js pack.json
const fs = require("fs");
const file = process.argv[2];
if (!file) { console.error("用法: node validate.js pack.json"); process.exit(2); }
let p, errs = [], warns = [];
try { p = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.error("JSON 解析失败: " + e.message); process.exit(1); }
for (const k of ["id", "title", "parts", "links"]) if (p[k] == null) errs.push("缺少字段 " + k);
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
  if (!["author", "source"].includes(r.type)) errs.push(`refs[${i}] type 应为 author 或 source`);
  if (!r.label) errs.push(`refs[${i}] 缺少 label`);
  if (edge.has(r.a + ">" + r.b) || edge.has(r.b + ">" + r.a)) errs.push(`refs[${i}] 与树边重复: ${r.a} → ${r.b}`);
});
if (parts.length < 10 || parts.length > 60) warns.push(`卡片数 ${parts.length}，建议 20～40`);
warns.forEach(w => console.log("提醒: " + w));
if (errs.length) { errs.forEach(e => console.error("错误: " + e)); process.exit(1); }
console.log(`通过：${parts.length} 张卡，${links.length} 条关系，${refs.length} 条关联线`);
