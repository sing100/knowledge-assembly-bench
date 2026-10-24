# 知识组装台 · Knowledge Assembly Bench

把一本书拆成知识卡片，自己动手把它们连回去：先读懂每张卡是什么，再推理它挂在哪。连对就亮灯，结构连完变成思维导图。适合从零开始学一本学习类的书。

**在线试玩：** https://sing100.github.io/knowledge-assembly-bench/

内置三个知识包：斯多葛主义、《思考，快与慢》、《原子习惯》。

## 怎么用

三种方式，任选一种：

1. **在线打开（最简单）**：直接访问上面的网址，什么都不用装。
2. **下载到本地**：在本页点绿色的 **Code → Download ZIP**，解压后双击 `index.html`，用浏览器打开就能玩。可以离线使用，不需要构建、不发网络请求。
3. **用 git**：
   ```bash
   git clone https://github.com/sing100/knowledge-assembly-bench.git
   cd knowledge-assembly-bench
   open index.html        # Windows 用 start index.html
   ```

## 玩法
- **看懂再连**：点任意卡片，右侧「这是什么」会用大白话解释它
- **一层一层来**：开局只有根卡和一级卡，连对一张，它的下级卡才出现；想自测可在「⋯ → 全部摆出」一次摆出所有卡
- **连线**：拖卡片右侧圆点到它的上级卡片，连对的卡片左侧亮绿灯
- **关系 / 含义**：把托盘里的词块拖到连线中点或卡片下方的槽位
- **关联线**：树以外的横向关系（作者、出处、前提、因果、对比、例子）。默认隐藏，选中或悬停一张卡时才显示；「⋯ → 显示全部关联线」可全部显示
- **提示**：只有点「提示」才画虚线指路，连错不会自动提示
- 没有关卡和强制顺序，按自己的节奏来

## 知识包格式
`packs/*.json` 是唯一数据源。`index.html` 里内嵌的同名包是为了离线双击打开而生成的副本，不要手改内嵌包：改完 `packs/*.json` 后运行 `node scripts/sync-packs.js`，CI（`.github/workflows/validate.yml`）会检查内嵌包是否与文件一致，不一致就失败。

进度：组装进度（已连对的边、已解锁的卡、关联线、词块答案、卡片位置）会存到浏览器 localStorage，刷新后按包恢复；「⋯ → 清除已保存进度」可清掉重来。静音开关以前就是这么存的，现在进度也是。

连线除了拖拽，还可以点一点连：点卡片右侧圆点选起点，再点目标卡连线；键盘用户可以 Tab 聚焦卡片、回车选起点、回车连目标，Esc 取消。拖拽行为不变。

可在页面里用「导入知识包」导入同格式的 JSON：

```json
{
  "id": "atomic-habits", "title": "原子习惯", "subtitle": "詹姆斯·克利尔", "intro": "...",
  "kind": "book", "shape": "sequence",
  "parts": [{ "id": "root", "label": "《原子习惯》", "parent": null, "note": "微小改变，巨大成就", "explain": "……" }],
  "links": [{ "a": "root", "b": "basics", "label": "为什么" }],
  "refs":  [{ "a": "law1", "b": "cue", "type": "depends", "label": "作用于" }]
}
```

- `shape`：书的骨架，`tree`（分类）/ `argument`（论证）/ `sequence`（顺序），默认 `tree`
- `parts`：卡片，`parent` 构成一棵树（根节点为 null）；`note` 是简短含义，`explain` 是给零基础学习者的解释；`sequence` 包里有先后的兄弟卡带 `order`
- `links`：树上每条边的关系词（a 为上级，b 为下级）
- `refs`（可选）：树外的关联线，`type` 为 `author` / `source` / `depends` / `causes` / `contrasts` / `example`

只做学习知识类书籍，不做小说。

## 用 AI 拆书：book-to-pack 技能
`skills/book-to-pack/SKILL.md` 是一份给 AI 用的技能说明：先判定书的骨架，再拆树、写关系词、含义和解释、加关联线、核对事实。把整个 `skills/book-to-pack` 文件夹放进支持 Skills 的 AI 工具（或直接把 SKILL.md 贴进对话），再告诉它要拆哪本书即可。

拆完先校验再导入（需要 Node.js）。注意：页面里的 JS 校验和 `validate.js` 是同一套规则的两份实现，改规则要两边一起改，见 `CHANGELOG.md` 的已知限制：

```bash
node skills/book-to-pack/scripts/validate.js your-pack.json
```

## 变更记录

见 `CHANGELOG.md`。提交请一个改动一个提交、写清楚信息，不要重复提交同一条信息；发版请打 tag，不要只依赖 main 最新版。

## 贡献
欢迎提交新的知识包到 `packs/`，提交前请通过校验脚本。

## 许可
MIT
