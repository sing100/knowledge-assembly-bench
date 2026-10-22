# 知识组装台 · Knowledge Assembly Bench

把一门知识拆成零件，用户自己动手把它们连回去：连对就亮灯，结构连完变成思维导图。

## 玩法
- **连线**：拖卡片右侧圆点到它的上级卡片，连对的卡片左侧亮绿灯
- **关系 / 含义**：把托盘里的词块拖到连线中点或卡片下方的槽位
- **关联线**：从书卡拖到作者或书中概念（书 → 作者 / 书 → 概念），青色虚线，不改变布局
- **提示**：只有点「提示」才画虚线指路，连错不会自动提示
- 没有关卡和强制顺序，按自己的节奏来

## 运行
直接用浏览器打开 `index.html`，无需构建、无外部网络请求。

## 知识包格式
`packs/stoicism.json` 是内置的斯多葛主义包（已内嵌在 index.html 中），可在页面里用「导入知识包」导入同格式的 JSON：

```json
{
  "id": "stoicism", "title": "斯多葛主义", "subtitle": "古希腊罗马哲学", "intro": "...",
  "parts": [{ "id": "core", "label": "斯多葛主义", "parent": null, "note": "古希腊罗马哲学" }],
  "links": [{ "a": "core", "b": "people", "label": "代表人物" }],
  "refs":  [{ "a": "meditations", "b": "marcus", "type": "author", "label": "作者" }]
}
```

- `parts`：卡片，`parent` 构成一棵树（根节点为 null），`note` 是卡片的含义
- `links`：树上每条边的关系词（a 为上级，b 为下级）
- `refs`（可选）：树外的关联线，方向始终是 书 → 作者（`author`）或 书 → 概念（`source`）

## 用 AI 拆书：book-to-pack 技能
`skills/book-to-pack/SKILL.md` 是一份给 AI 用的技能说明：把一本书或一个学派拆成上面格式的知识包，包括怎么拆树、写关系词和含义、加关联线、核对事实。把它交给支持 Skills 的 AI 工具（或直接贴进对话），再告诉它要拆哪本书即可。

拆完先校验再导入：

```bash
node skills/book-to-pack/scripts/validate.js your-pack.json
```

## 贡献
欢迎提交新的知识包到 `packs/`，提交前请通过校验脚本。

## 许可
MIT
