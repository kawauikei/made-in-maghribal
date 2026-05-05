# Contract Specification: C004_ITEM_MASTER_AND_TEXT

## Overview
10ジャンル×各5品目×5術理属性の250アイテム、分類、品質別テキストを定義する。

## Responsibility
- アイテム分類（ジャンル、術理属性）の定義。
- 250種類のアイテムマスターデータの管理。
- アイテムごとの品質別（Normal, Success, Great Success）テキストの提供。
- アイテムデータの整合性バリデーション。

## Data Structures

### Item Taxonomy
- `GENRES`: `ARM`, `FOD`, `MED`, `ADN`, `CLT`, `DAY`, `WRK`, `TRV`, `RIT`, `TRD` (計10)
- `PRINCIPLES`: `AS`, `EL`, `LI`, `ME`, `SA` (計5)

### Item ID Format
- `IT_{GENRE}_{PRINCIPLE}_{INDEX}`
- `INDEX` は `01` から `05` までの5段階。

### Item Data
- `itemId`: 一意なID
- `name`: アイテム名
- `genre`: ジャンルID
- `principle`: 術理属性ID
- `rank`: 1〜5のランク

### Item Texts
- `itemId` に紐づく品質別テキスト。
- `normal`: 通常の出来栄え
- `success`: 成功
- `great_success`: 大成功

## Acceptance Criteria
- [ ] genre は ARM, FOD, MED, ADN, CLT, DAY, WRK, TRV, RIT, TRD の10種類。
- [ ] principle は AS, EL, LI, ME, SA の5種類。
- [ ] 各genreに5品目を持つ。
- [ ] 250アイテムを生成または参照できる。
- [ ] itemId は IT_{GENRE}_{PRINCIPLE}_{INDEX} 形式。
- [ ] item text は normal, success, great_success の品質別説明を持つ。
- [ ] item masterとitem textを分離する。
