# Changelog

All notable changes to Knowledge Assembly Bench are documented here.

## Unreleased — 0178eb3 repair list, branch only, 2026-10-31 (not merged)

### Fixed
- Save reliability: progress is no longer overwritten by a fresh empty state during load (save is suppressed until restore finishes, and the "已恢复" toast only appears when something was actually restored). Progress is now stored per pack (`kabProgress:<packId>`, with one-time migration from the old shared key), so switching packs no longer overwrites the previous pack.
- Imported packs now persist across refreshes (localStorage `kabCustomPacks`) and can be removed: ⋯ → 删除当前导入包 / 重置全部导入包, which also clear their saved progress.
- Mouse click-to-connect: clicking a card now arms it as the source and a second click on another card connects (drag and keyboard unchanged; a drag-moved click does not arm, shift-click stays multi-select, arming a chip clears an armed source and vice versa).
- Chip slots: empty open slots are now focusable (Tab) even as dots, and when a chip is armed its open slots expand into tappable 64×32 targets, so tap/keyboard placement no longer depends on drag proximity.
- Mobile: the initial fit floor on ≤600px is now 1.0 instead of 0.6, so card text stays at its 13px size instead of shrinking to ~7.8px; the board is panned instead of shrunk. Port hit area on phones is 44×44.
- Pack order: siblings with an `order` field now render in that order in layouts, branch routes and exported outlines (file order is kept where no order is given).
- Export/import: ⋯ → 导出知识包 downloads a valid pack JSON that re-imports; 导出进度备份 is now tagged `kab-progress-backup` and re-imports into its pack, restoring locks/refs/chips/positions. Import shows a preview summary (title, card/link/ref counts) and a clear error for a backup whose pack is not loaded, instead of a generic failure.
- Tests: the simulated-assembly check no longer compares a parent to itself; it now requires a real link edge for every locked card, plus sequence-order checks and static regression guards for per-pack keys, save suppression, custom-pack persistence, pack export/backup and order rendering.

### Added
- Skippable first-run guide (⋯ → 新手示范 reopens it): read a card → connect → place a chip → finish one branch, in about a minute. It does not auto-complete progress.

### Notes
- Browser checks for refresh restore, per-pack isolation, mouse click connect, chip tap placement and 390px readability are being run as a separate live-browser test on this branch; headless Node tests and `sync-packs --check` pass, but they do not cover DOM interaction.
No history rewrite: earlier commits are left as-is; from this entry on,
each change is one clean commit with a single clear message, and releases
are tagged instead of relying on "latest main".

## Unreleased — Mobile tray gap + 601-900px compact top bar, 2026-10-25

### Changed
- Mobile tray moved from `bottom: 76px` to `bottom: 16px`, so there is no empty board strip between the tray and the detail panel; toasts already go to the board top on ≤900px, so they cannot cover the tray. Mobile detail top padding reduced from 20px to 12px.
- Top bar compact rule extended from 600px to 900px: 601-900px used to get the desktop top bar wrapped to two rows together with the mobile column body, wasting about 50px of board height and leaving the second row's left side empty. Now the header is a single row throughout the column layout: logo only (brand text hidden), pack selector narrowed, import / reshuffle / tidy / mute and the progress bar hidden into the ⋯ menu, hint and detail stay on the bar, progress text wraps on the right.
- Detail empty-state hint changed from "点卡片 → 右侧看它是什么" to "点卡片 → 看它是什么", because on mobile the panel is below, not on the right.

## Unreleased — Branch colour + whole-route explanation, 2026-10-25

### Added
- When a first-level branch is fully done (tree link + relation + meaning all correct, the existing `cardDone` standard), its edges and card borders take that branch's colour immediately, instead of waiting for the whole map to finish. The colour is the same branch palette used by the final radial map, so it stays consistent.
- When a branch completes, the detail panel jumps to that branch card and shows a "支线完成" route block: root → branch chain, then the branch subtree in order, each step with its relation word and its pack explain. No new explanation text is invented; it is assembled from the pack's own labels/explains. Tapping a completed branch card later shows the same route block again.
- Restoring a saved completed branch colours it but does not hijack focus (`suppressRoute` during pack load).

## Unreleased — Zoom top-right + detail open by default, 2026-10-25

### Changed
- Zoom control moved from board bottom-right to board top-right (`right: 16px; top: 16px`), so it no longer sits between the tray and the detail panel or covers bottom cards.
- Detail panel (`详情`) is now open by default on both desktop and mobile: removed the ≤900px auto-close on load. The 详情 button still toggles it closed manually.

## Unreleased — Frontend + packs + skill, 2026-10-25

### Added
- Chip tap-to-place: tap a tray chip, then tap an open relation/meaning slot; keyboard Enter on a chip arms it, Enter on a focused slot places it, Esc cancels. Tree tap-connect from the previous round is unchanged.
- Export: ⋯ → 导出组装结果 downloads a JSON with pack, locked tree, refs, chip answers, progress and a text outline, so a completed assembly leaves evidence.
- `tests/state.test.js`: headless Node tests, no browser — pack structure, distinct labels, depth/kids, explain lengths, refs, simulated correct assembly, and embedded-pack sync. Run with `node tests/state.test.js`.

### Changed
- Packs: stoicism 35→37 cards (晨间准备, 晚间回顾 under 修习), atomic-habits 27→29 cards (加入同类群体 under 让它有吸引力, 自动化 under 让它简便易行, balancing single-child laws); thinking-fast-and-slow people explain expanded from 12 to 36 chars; stoicism root explain now clarifies doctrinal three branches vs people/books/practice, instead of saying only “分三块”.
- book-to-pack SKILL: single-child rule (chain vs category), distinct-label rule strengthened (no “三大分支/四主德” as labels), intro must be a one-sentence model and match root explain, explain floor 20 chars, and a 3-command delivery checklist (validate.js + state.test.js + sync-packs.js).

### Notes
- Single-child chains that remain (stoicism physics/logos/passion/logic/impression, thinking repr/peakend) are reported as warnings in state tests, justified as sequence/argument/example chains, not categories.
- Full DOM state extraction into a separate module was NOT done in this round: it would be a large refactor with high break risk for a single-file offline page. Headless tests cover state rules without a browser; DOM rendering stays in index.html.

## Unreleased — Audit fixes, 2026-10-25

### Fixed
- Packs are now single-source: `packs/*.json` is authoritative, embedded
  packs in `index.html` are generated by `node scripts/sync-packs.js`.
  CI fails if embedded != files (`--check`).
- Assembly progress is now saved to localStorage (tree edges, visibility,
  refs, chip answers, card positions) and restored on reload, per pack.
  "⋯ → 清除已保存进度" clears it. Previously only the mute flag was saved.
- Tap / click-to-connect and keyboard alternative to drag: tap a port
  (or focus a card and press Enter) to arm it, then tap / Enter on the
  target card to connect. Esc cancels. Drag behaviour is unchanged.
- Stoicism pack: distinct relation labels for the three branches
  (宇宙本性 / 如何生活 / 如何思考) and for the four virtues
  (判断善恶 / 面对恐惧 / 公正待人 / 欲望有度). Validate warnings for
  duplicate labels are gone. Intro is now a one-sentence model:
  "幸福只取决于品格和判断，不取决于外在遭遇。"
- Removed duplicate CSS shadow variables (`--x-sh` etc. defined twice).

### Added
- `scripts/sync-packs.js` — sync / check embedded packs.
- `.github/workflows/validate.yml` — CI runs validate.js on all packs
  and the sync check on push to main and on pull requests.
- This changelog.

### Notes / known limitations
- Page-side pack validation (in `index.html`) and Node `validate.js`
  are two implementations of the same rules. They are documented as
  needing to stay in sync; a shared-module extraction is a future
  task, not done here, to avoid breaking offline single-file use.
- Progress restore covers tree, refs and chips by answer text. It does
  not restore transient "bad" edges (they auto-retract after 530ms
  in the original design) or view zoom/pan.

## v4 — 2026-10-22 (pre-changelog)
- Hint-only guide, layered unlock, recall round, relation / meaning
  chips, refs, import pack, offline single-file page.
  See git history for details; history was not rewritten.
