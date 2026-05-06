# Contract Specification: C003_ASSET_MANIFEST

## Overview
立ち絵、話者アイコン、表情差分、背景、アイテムアイコン、UI用画像のmanifestとusage制限を定義する。

## Responsibility
- ゲーム内で使用する全画像アセットの管理。
- 表情差分（Standing / Speaker Icon）の定義。
- キャラクターごとの表情使用制限（Usage Restriction）の定義。
- アセットの存在および参照整合性のバリデーション。

## Data Structures

### Naming Conventions
- **キャラクターフォルダ:** 小文字 (`hakima`, `mira`, `dariya`, `nader`)
- **背景画像:** 小文字 + `.jpeg` (例: `bg_spot_oasis_view.jpeg`)
- **アイテム画像:** IDそのまま + `.png` (例: `IT_ADN_AS_01.png`)

### Expression Sets
- **通常表情 (Scenario Use):** `normal`, `joy`, `fun`, `surprise`, `sorrow`, `cry`, `anger`
- **UI専用表情 (UI Only):** `maid`, `social`, `student`
- **ファイル階層:** `characters/{char}/standing_proc/{expr}.png`

### Visual Profiles (NEW)
立ち絵画像を元に、ブラウザ側で動的にクロップ・スケーリングを行うための情報を定義する。
- **Target:** `Standing` (全画面表示用), `Face` (メッセージウィンドウ用アイコン)
- **Parameters:** `scale` (倍率), `originX`, `originY` (中心点), `cropX`, `cropY` (切り出し開始点)
- **Implementation:** `browser/utils/characterVisualProfiles.js` で一元管理される。

### Asset Manifest
- `AS_BG_{NAME}`: 背景 (実ファイル名は `bg_{type}_{name}.jpeg`)
- `AS_ST_{CHAR}_{EXPR}`: 立ち絵 (実ファイル名は `{expr}.png`)
- `AS_IC_{CHAR}_{EXPR}`: 話者アイコン (原則、立ち絵画像を元に Visual Profile で動的生成される)
- `AS_UI_{NAME}`: UIパーツ
- `AS_ITEM_{NAME}`: アイテムアイコン

### Usage Restrictions
- 主人公 (`CH_NADIR`) は `ui_only` 表情（`maid`, `social`, `student`）を持たない。
- シナリオ内で `ui_only` 表情を立ち絵として使用することは禁止される（バリデーションでエラー）。

## Acceptance Criteria
- [x] 本編使用可能表情 normal, joy, fun, surprise, sorrow, cry, anger を定義する。
- [x] UI専用表情 maid, social, student を ui_only として定義する。
- [x] 主人公ナーディルには maid/social/student が存在しないことを検証する。
- [x] scenario用参照とUI用参照のusage制限を検証できる。
- [x] standingとspeaker iconで別々の表情を指定できる。
- [ ] **Visual Profile による動的なクロップ/スケーリング規則を定義し、個別アイコン資産を不要とする。**
