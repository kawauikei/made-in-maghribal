# Contract Specification: C001_DATA_ID_SCHEMA

## Overview
全データで使うID規則、列挙値、参照キーの最小スキーマを定義する。

## Responsibility
- 各種ID（キャラクター、ヒロイン、ルート、表情、アセット、アイテム、BGM、SE、シーン等）の命名規則の定義。
- IDのバリデーションロジックの提供。
- 不正なIDに対して適切なエラー理由を返す。

## Data Types and Enums

### ヒロインID (HeroineId)
- `hakima`: ハキマ
- `mira`: ミラ
- `dariya`: ダリヤ

### ルートモード (RouteMode)
- `normal`: 通常ルート
- `extra`: 追加ルート（Good Ending後）

### キャラクターID (CharacterId)
- 形式: `CH_{NAME}`
- 例: `CH_NADIR`, `CH_HAKIMA`

### 表情ID (ExpressionId)
- 形式: `{EMOTION}`
- 定義済み: `normal`, `joy`, `fun`, `surprise`, `sorrow`, `cry`, `anger`, `maid`, `social`, `student`

### アセットID (AssetId)
- 形式: `AS_{CATEGORY}_{NAME}`
- カテゴリ: `BG` (背景), `ST` (立ち絵), `IC` (アイコン), `UI` (UIパーツ)

### アイテムID (ItemId)
- 形式: `IT_{GENRE}_{PRINCIPLE}_{INDEX}`
- ジャンル (GenreId): `ARM`, `FOD`, `MED`, `ADN`, `CLT`, `DAY`, `WRK`, `TRV`, `RIT`, `TRD`
- 術理属性 (PrincipleId): `AS` (星), `EL` (地), `LI` (光), `ME` (月), `SA` (砂)

### BGM / SE ID
- 形式: `BGM_{NAME}`, `SE_{NAME}`

### シーンID (SceneId)
- 形式: `SC_{CATEGORY}_{NAME}`
- カテゴリ: `TITLE`, `OP`, `ED`, `TURN`, `EVENT`

### その他
- `topicId`: デイリートーク等の話題ID
- `requestTemplateId`: クイズ要望のテンプレートID

## Acceptance Criteria
- [ ] characterId, heroineId, routeMode, expressionId, assetId, itemId, itemTypeId, genreId, principleId, bgmId, seId, sceneId, topicId, requestTemplateId の命名規則を検証できる。
- [ ] routeMode は `normal` と `extra` を扱える。
- [ ] heroineId は `hakima`, `mira`, `dariya` を扱える。
- [ ] 不正IDを理由付きで拒否できる。
