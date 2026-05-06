# Test Specification: C011_RENDER_MODEL

## Overview

`src/core/renderModel.cjs` が、現行実装範囲である VN 表示モデルと RHYTHM QUIZ 表示モデルを、ブラウザ環境に依存しない純粋なJSONとして返すことを検証する。

TITLE、HEROINE_SELECT、TURN_RESULT の表示モデルは現ソースでは未実装のため、本テスト仕様の対象外とする。

## Test Environment

- Runtime: Node.js
- Test runner: `node:test`
- Target: `src/core/renderModel.cjs`
- Test file: `tests/core/C011_RENDER_MODEL.test.cjs`

## Test Cases

### T1: VN model with speaker and standing

- 入力:
  - `speakerId`: `CH_HAKIMA`
  - `speakerExpression`: `joy`
  - `standingCharacterId`: `CH_HAKIMA`
  - `standingExpression`: `joy`
  - `backgroundId`: `AS_BG_SHOP`
  - `text`: 任意の本文
- 期待結果:
  - 話者名が `CHARACTERS` から解決される。
  - `speaker.iconAssetId` が `AS_IC_CH_HAKIMA_joy` になる。
  - `standing.characterId` と `standing.expressionId` が入力どおりになる。
  - `text` が入力どおりになる。

### T2: VN model without speaker or standing

- 入力:
  - `speakerId` なし。
  - `standingCharacterId` なし。
  - `choice` に選択肢配列を指定。
- 期待結果:
  - `speaker` は `null`。
  - `standing` は `null`。
  - `choices` は入力された配列。

### T3: Rhythm quiz model

- 入力:
  - `session.currentSong`
  - `session.scores`
  - `session.turnProgress`
  - `question.promptText`
  - `question.correctItemId`
  - `question.wrongItemId`
- 期待結果:
  - `songId` が `session.currentSong` と一致する。
  - `question.promptText` が入力どおりになる。
  - `question.choices` が正解/不正解の2択を含む。
  - `progress.current` が `session.turnProgress` と一致する。
  - `progress.total` は現行実装どおり `10`。
  - `stats` が `session.scores` と一致する。

## Out of Scope

- TITLE表示モデル。
- HEROINE_SELECT表示モデル。
- TURN_RESULT表示モデル。
- セーブデータ有無に基づくTITLEの `canContinue` モデル。
- DOM、CSS、Canvas、Audio API、ブラウザイベントの検証。

## Success Criteria

- `node --test tests/core/C011_RENDER_MODEL.test.cjs` が成功する。
- `npm run test:core` に含まれるC011テストが成功する。
