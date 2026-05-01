# Made in Maghribal - Integrated Todo / Roadmap

## 完了済み (Done)

### M-ROUTE-FLASHBACK-INTRO-DATA (2026-05-01)
- [x] `hakima_0` / `mira_0` / `dariya_0` を `kind: "flashback_intro"` として追加。
- [x] 通常の親密度イベントではなく、初回営業前の初対面回想として扱う。
- [x] ページ単位 `backgroundId` をデータに保持。

### M-ROUTE-FLASHBACK-INTRO-TRIGGER (2026-05-01)
- [x] ヒロイン初回選択時、未読の `_0` flashback_intro を一度だけ再生。
- [x] 完了時に `seenEventIds` へ追加し、回想後は INTRO へ復帰。
- [x] 通常の親密度5/10イベントの解禁ロジックとは分離。

### M-EVENT-PAGE-BACKGROUND-OVERRIDE (2026-05-01)
- [x] `page.backgroundId` によるイベントページ単位の背景切替を実装。
- [x] イベント終了時、タイトル復帰時、Memories再生開始時に override をクリアし残留を防止。

### M-SAVEDATA-TEST-CLEANUP (2026-05-01)
- [x] `saveData.test.cjs` の異常系テスト出力から期待される SyntaxError ログを抑制。

### M-NARRATIVE-EDIT-PACK-OP (2026-05-01)
- [x] Edit Pack 運用基盤構築・初期拡張完了。

### M-34-ASSET-FINAL-VERIFICATION (2026-05-01)
- [x] 3:4差し替え後の BG / STILL / Gallery / Event 表示確認完了。

---

## 継続改善 / 中長期課題 (Ongoing)

- [ ] **M-UI-VN-HEROINE-FADE** (Priority B): INTRO等の別れ際でのヒロイン立ち絵退場演出追加。

---

## Current / Next Candidates

### 1. M-SCENARIO-ROUTE-FOUNDATION
- [ ] OP強化。
- [ ] ナーディル背景の見せ方改善。
- [ ] ヒロイン別ルート導線 / normal / long_history の整理。
- [ ] DailyTalkより長いイベント本文の追加方針策定。

### 2. M-QUIZ-PROMPT-TUNING-CONT
- [ ] クイズ文言、分類、難易度の継続調整。

---

## Deferred / Later

### Rhythm Game Foundation
- [ ] Rhythm Game Foundation / UI Engine / Sync。
- 理由: Future / Later。

---

## Current Policy Notes

- 画像生成禁止。
- Browser task / Browser Subagent は原則禁止。
- public は nested repo / gh-pages。`public/.git` を維持。
- 3:4 asset policy への完全移行済み。
- No-Scroll Core Game UI (390x780 logical canvas) を維持。
- `flashback_intro` は親密度イベントではなく route intro / first meeting flashback として扱う。
- 通常の `checkNewEventUnlock` では発火させない。
- Memories に表示されてもよいが、通常の親密度イベントとは意味が異なる。
- `docs/daily_talk_audit_report.html` は timestamp-only diff なら restore、監査内容に意味のある差分がある場合のみ commit。
