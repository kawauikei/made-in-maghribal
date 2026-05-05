```markdown
# C003_ASSET_MANIFEST 仕様書

## 概要 (Overview)
本仕様書は、ゲーム内で使用される全画像アセット（テクスチャ）の管理と、それらの使用制限（Usage Restriction）を定義する。具体的には、表情差分（Expression）と、キャラクターごとの使用制限を定義し、アセットの存在と参照整合性を保証する。

## 責任範囲 (Responsibility)
本モジュールは以下の責任を担う。

1. **アセット管理:** ゲーム内で使用される全画像アセットの管理。
2. **表情差分定義:** キャラクターの表情差分（Standing / Speaker Icon）の定義。
3. **使用制限定義:** キャラクターごとの表情使用制限（Usage Restriction）の定義。
4. **バリデーション:** アセットの存在および参照整合性の検証。

## データ構造 (Data Structures)

### 1. 表情セット (Expression Sets)
使用される表情の種類を定義する。

*   **通常表情 (Scenario Use):** `normal`, `joy`, `fun`, `surprise`, `sorrow`, `cry`, `anger`
*   **UI専用表情 (UI Only):** `maid`, `social`, `student`

### 2. アセットマニフェスト (Asset Manifest)
アセットの命名規則と定義。

*   `AS_BG_{NAME}`: 背景アセット
*   `AS_ST_{CHAR}_{EXPR}`: 立ち絵アセット (Standing)
*   `AS_IC_{CHAR}_{EXPR}`: 話者アイコンアセット (Speaker Icon)
*   `AS_UI_{NAME}`: UIパーツアセット
*   `AS_ITEM_{NAME}`: アイテムアイコンアセット

### 3. 使用制限 (Usage Restrictions)
アセットの使用に関する制約条件。

*   **主人公（`CH_NADIR`）の制限:** 主人公は、UI専用表情（`maid`, `social`, `student`）を保持しない。
*   **シナリオ内使用制限:** シナリオ内での使用時、UI専用表情の使用を禁止する（バリデーションでエラーを発生させる）。

## 受入基準 (Acceptance Criteria)

以下の項目が満たされることを確認する。

- [ ] **表情定義の確認:** 本編で使用される表情（`normal`, `joy`, `fun`, `surprise`, `sorrow`, `cry`, `anger`）が正しく定義されていること。
- [ ] **UI専用表情の定義:** UI専用表情（`maid`, `social`, `student`）が正しく定義されていること。
- [ ] **主人公の制限検証:** 主人公ナーディルが、UI専用表情（`maid`, `social`, `student`）を持たないことが検証できること。
- [ ] **参照制限の検証:** シナリオ用参照とUI用参照の使い分け（Usage Restriction）が検証できること。
- [ ] **アセットの分離:** 立ち絵（Standing）と話者アイコン（Speaker Icon）で、それぞれ異なる表情を指定できること。
```
