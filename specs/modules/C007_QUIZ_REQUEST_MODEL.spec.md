# Contract Specification: C007_QUIZ_REQUEST_MODEL

## Overview
客タイプ、要望テンプレート、簡単な2択問題生成、正解候補/不正解候補選定を管理する。

## Responsibility
- クイズ要望テンプレートの定義。
- 要望条件（ジャンル、術理、ランク等）に基づく正解アイテムの判定。
- 2択クイズ（正解1つ、不正解1つ）の生成ロジックの提供。
- クイズデータの整合性バリデーション。

## Data Structures

### Quiz Request Template
- `templateId`: ユニークなID
- `customerType`: 客タイプ（`STANDARD`, `HAKIMA`, `MIRA`, `DARIYA` 等）
- `conditions`: 判定条件の配列
  - `type`: `genre`, `principle`, `rank`
  - `value`: 条件値
- `text`: 要望の表示テキスト（プレースホルダ対応可）

### Generated Question
- `questionId`: 一意なID
- `promptText`: 画面に表示する要望テキスト
- `correctItemId`: 正解のアイテムID
- `wrongItemId`: 不正解のアイテムID
- `difficulty`: 難易度（通常は条件1つ、Extraは最大2つ）

## Logic Rules
- **正解選定:** 指定された全ての条件を満たすアイテムを `C004` マスターから1つ選ぶ。
- **不正解選定:** 条件の少なくとも1つを満たさないアイテムを `C004` マスターから1つ選ぶ。
- **重複禁止:** 正解アイテムと不正解アイテムは必ず異なるものでなければならない。

## Acceptance Criteria
- [ ] conditionType は genre, principle, rank を扱える（MVP範囲）。
- [ ] MVP通常難易度では原則1条件の問題を生成する。
- [ ] extra難易度では最大2条件を許可できる。
- [ ] 各問題の正解候補は1つだけ。
- [ ] 不正解候補は正解候補と重複しない。
- [ ] request template は存在するcustomerTypeのみ参照する。
- [ ] 客タイプにより同じ条件でも文体を変えられる。
