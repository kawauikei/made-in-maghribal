```markdown
# テスト仕様書：C006_SCENARIO_AND_TALK_SCHEMA

## 概要
本仕様書は、ゲーム内のシナリオ（Scene）と会話（Talk）のデータ構造および参照整合性を検証するためのテスト仕様を定義する。これにより、ゲーム内のイベントフローと表示ロジックが正しく動作することを保証する。

## 目的
本仕様は、以下の要素のデータ構造と整合性を検証する。
1. シナリオデータ（Scene）の構造定義。
2. デイリートーク（Daily Talk）の構造定義。
3. 各種ID（話者、表情、背景、ジャンプ先等）の参照整合性バリデーション。
4. 演出フラグ（リズムゲーム開始等）の制御。

## データ構造定義

### 1. シナリオステップ (Scenario Step)
一つのシナリオステップは、以下のフィールドを持つ。

| フィールド名 | 型 | 説明 |
| :--- | :--- | :--- |
| `speakerId` | ID | 話者のキャラクターID（空の場合は地の文） |
| `speakerExpression` | ID | 話者アイコンの表情ID |
| `standingCharacterId` | ID | 画面中央に表示するキャラクターID |
| `standingExpression` | ID | 立ち絵の表情ID |
| `backgroundId` | ID | 背景アセットID |
| `text` | String | 表示テキスト |
| `choice` | Array | 選択肢（`text`, `jump` のペア） |
| `jump` | ID/Index | 次のシーンIDまたはステップ番号へのジャンプ指定 |
| `rhythmStageStart` | Flag | リズムゲームパート開始フラグ（楽曲ID等を含む） |
| `flags` | Array | 演出用フラグ（例：特定の演出トリガー） |

### 2. デイリートーク (Daily Talk)
会話イベントのデータ構造。

| フィールド名 | 型 | 説明 |
| :--- | :--- | :--- |
| `topicId` | ID | 話題ID |
| `timing` | Enum | 発生タイミング（例：開店前、閉店後） |
| `heroineId` | ID | ヒロインID |
| `routeMode` | ID | ルートモード（どのルートの会話か） |
| `scoreBand` | Enum | 必要なスコア帯（低・中・高） |
| `lines` | Array | 会話テキストの配列 |

## バリデーションルール (Validation Rules)

以下のルールに基づき、データ構造の整合性を検証する。

1. **ID参照整合性:**
    *   `speakerId` および `standingCharacterId` は、既存のキャラクター定義（`C002`）に存在する有効なIDであること。
    *   `speakerExpression` および `standingExpression` は、対応するキャラクター（`C002`）の定義済み表情ID（`C003`）であること。
2. **特殊フラグの検証:**
    *   シナリオ内で `ui_only` 表情（例: `maid`, `social`, `student`）が使用されている場合、その使用箇所が適切であること。
3. **ジャンプ先の検証:**
    *   `jump` 先の `sceneId` は、有効なシーンID形式（例: `SCENE_XXX`）であること。

## 受入基準 (Acceptance Criteria)

以下の項目が満たされることを確認する。

*   **[ ] シナリオステップの完全性:**
    *   全ての必須フィールド（`speakerId`, `speakerExpression`, `standingCharacterId`, `standingExpression`, `backgroundId`, `text`, `choice`, `jump`, `rhythmStageStart`, `flags`）が定義され、データ型が一致していること。
*   **[ ] キャラクター指定の独立性:**
    *   中央立ち絵と話者アイコンの指定が、それぞれ独立したIDで正しく設定されていること。
*   **[ ] Daily Talkの網羅性:**
    *   `topicId`, `timing`, `heroineId`, `routeMode`, `scoreBand`, `lines` の全てのフィールドが定義されていること。
*   **[ ] MVPの充足:**
    *   最低限、全てのヒロインと全てのルートモードに対して、最低1件のダミーDaily Talkが定義されていること。
*   **[ ] 参照検証の成功:**
    *   `speakerId`, `standingCharacterId`, `expressionId`, `jump` 先の `sceneId` が、参照先の定義と一致していること。
*   **[ ] 警告/エラー処理:**
    *   `ui_only` 表情が通常シナリオ（非UI専用）に出現した場合、システムが警告（Warning）またはエラー（Error）を適切に発報できること。

---
**補足:**
本仕様書は、データ構造とバリデーションルールを定義する「契約」であり、実装コード（例：`C006_SCENARIO_AND_TALK_SCHEMA.testspec.md`）は、この仕様書が定義する構造をテストするための具体的なテストケース記述を指します。
```
