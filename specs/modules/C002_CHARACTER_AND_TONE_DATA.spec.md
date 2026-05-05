# Contract Specification: C002_CHARACTER_AND_TONE_DATA

## Overview
主人公、ヒロイン、客タイプ、口調ガイドの参照構造を定義し、口調ブレを防ぐ。

## Responsibility
- 主人公およびヒロインのマスターデータの定義。
- 口調ガイド（Tone Guide）の定義と、キャラクターごとの参照設定。
- キャラクターおよび口調ガイドの整合性バリデーションの提供。

## Data Structures

### Character
- `characterId`: `CH_NADIR`, `CH_HAKIMA`, `CH_MIRA`, `CH_DARIYA`
- `name`: 表示名
- `role`: `protagonist` または `heroine`
- `toneGuideId`: `TG_` で始まる口調ガイドID

### Tone Guide
- `toneGuideId`: ユニークなID
- `description`: 口調の特徴説明
- `rules`: 通常ルート(`normal`)と追加ルート(`extra`)の差分を含む口調ルール

## Master Data Constraints
- `CH_NADIR` は唯一の `protagonist` である。
- `heroine` として `CH_HAKIMA`, `CH_MIRA`, `CH_DARIYA` の3人が定義される。
- 全てのキャラクターは有効な `toneGuideId` を参照しなければならない。
- シナリオ本文そのものは、このデータに含めてはならない。

## Acceptance Criteria
- [ ] protagonist は nadir 1人だけ定義される。
- [ ] heroine は hakima, mira, dariya の3人が定義される。
- [ ] 全characterがtoneGuideIdを参照する。
- [ ] toneGuideは通常ルートと追加ルートの差分を持てる。
- [ ] customer type別の口調ガイドを参照できる。
- [ ] シナリオ本文をcharacter/tone guideに含めない。
