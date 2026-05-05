# Contract Specification: C006_SCENARIO_AND_TALK_SCHEMA

## Overview
VNシナリオ、Daily Talk、閉店後会話、デートイベントのデータ構造と参照検証を定義する。

## Responsibility
- シナリオデータの構造定義。
- デイリートーク（Daily Talk）の構造定義。
- 各種ID（話者、表情、背景、ジャンプ先等）の参照整合性バリデーション。
- 演出フラグ（リズムゲーム開始等）の制御。

## Data Structures

### Scenario Step
1つのステップ（画面更新単位）は以下のフィールドを持つ。
- `speakerId`: 話者のキャラクターID（空なら地の文）
- `speakerExpression`: 話者アイコンの表情ID
- `standingCharacterId`: 画面中央に表示するキャラクターID
- `standingExpression`: 立ち絵の表情ID
- `backgroundId`: 背景アセットID
- `text`: 表示テキスト
- `choice`: 選択肢（`text`, `jump` の配列）
- `jump`: 次のシーンIDまたはステップ番号へのジャンプ
- `rhythmStageStart`: リズムゲームパート開始フラグ（楽曲ID等を含む）
- `flags`: 演出用フラグ

### Daily Talk
- `topicId`: 話題ID
- `timing`: 発生タイミング（開店前、閉店後等）
- `heroineId`: ヒロインID
- `routeMode`: ルートモード
- `scoreBand`: 必要なスコア帯（低・中・高）
- `lines`: 会話テキストの配列

## Validation Rules
- `speakerId`, `standingCharacterId` は `C002` で定義された有効なIDであること。
- `speakerExpression`, `standingExpression` は `C003` で定義された、各キャラクターに対して有効な表情IDであること。
- シナリオ内で `ui_only` 表情（`maid`, `social`, `student`）が使用されている場合はエラー。
- `jump` 先の `sceneId` は有効な形式であること。

## Acceptance Criteria
- [ ] scene steps は speakerId, speakerExpression, standingCharacterId, standingExpression, backgroundId, text, choice, jump, rhythmStageStart, flags を表現できる。
- [ ] 中央立ち絵と話者アイコンを別々に指定できる。
- [ ] Daily Talkは topicId, timing, heroineId, routeMode, scoreBand, lines を持つ。
- [ ] MVPでは各ヒロイン・各routeModeに最低1件のダミーDaily Talkを持てる。
- [ ] speakerId, standingCharacterId, expressionId, jump先sceneId を検証できる。
- [ ] ui_only表情が通常シナリオに出た場合に警告またはエラーにできる。
