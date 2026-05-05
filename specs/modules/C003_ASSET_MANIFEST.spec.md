# Contract Specification: C003_ASSET_MANIFEST

## Overview
立ち絵、話者アイコン、表情差分、背景、アイテムアイコン、UI用画像のmanifestとusage制限を定義する。

## Responsibility
- ゲーム内で使用する全画像アセットの管理。
- 表情差分（Standing / Speaker Icon）の定義。
- キャラクターごとの表情使用制限（Usage Restriction）の定義。
- アセットの存在および参照整合性のバリデーション。

## Data Structures

### Expression Sets
- **通常表情 (Scenario Use):** `normal`, `joy`, `fun`, `surprise`, `sorrow`, `cry`, `anger`
- **UI専用表情 (UI Only):** `maid`, `social`, `student`

### Asset Manifest
- `AS_BG_{NAME}`: 背景
- `AS_ST_{CHAR}_{EXPR}`: 立ち絵
- `AS_IC_{CHAR}_{EXPR}`: 話者アイコン
- `AS_UI_{NAME}`: UIパーツ
- `AS_ITEM_{NAME}`: アイテムアイコン

### Usage Restrictions
- 主人公 (`CH_NADIR`) は `ui_only` 表情（`maid`, `social`, `student`）を持たない。
- シナリオ内で `ui_only` 表情を立ち絵として使用することは禁止される（バリデーションでエラー）。

## Acceptance Criteria
- [ ] 本編使用可能表情 normal, joy, fun, surprise, sorrow, cry, anger を定義する。
- [ ] UI専用表情 maid, social, student を ui_only として定義する。
- [ ] 主人公ナーディルには maid/social/student が存在しないことを検証する。
- [ ] scenario用参照とUI用参照のusage制限を検証できる。
- [ ] standingとspeaker iconで別々の表情を指定できる。
