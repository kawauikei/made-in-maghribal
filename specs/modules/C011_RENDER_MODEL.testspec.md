# Test Specification: C011_RENDER_MODEL

## Overview

`src/core/renderModel.cjs` が、TITLE 表示モデル、HEROINE_SELECT 表示モデル、VN 表示モデル、RHYTHM QUIZ 表示モデル、TURN_RESULT 表示モデルを、ブラウザ環境に依存しない純粋なJSONとして返すことを検証する。

ブラウザ具体層からの全面利用は本テスト仕様の対象外とする。

## Test Environment

- Runtime: Node.js
- Test runner: `node:test`
- Target: `src/core/renderModel.cjs`
- Test file: `tests/core/C011_RENDER_MODEL.test.cjs`

## Test Cases

### T1: Title model without save data

- 入力:
  - なし。
- 期待結果:
  - `title` は `Made in Maghribal`。
  - `backgroundId` は `AS_BG_TITLE`。
  - `canContinue` は `false`。
  - `lastHeroineId` は `null`。

### T2: Title model with save summary

- 入力:
  - `saveSummary.selectedHeroineId`
  - `saveSummary.turn`
  - `saveSummary.phase`
- 期待結果:
  - `canContinue` は `true`。
  - `lastHeroineId` は `saveSummary.selectedHeroineId`。
  - `saveSummary` は入力オブジェクトと一致する。

### T3: Heroine select model with route unlocks

- 入力:
  - ヒロイン候補配列。
  - `progressSummary.heroineModeUnlocks`。
- 期待結果:
  - `heroines` に入力候補が保持される。
  - `normal` ルートは常に選択可能。
  - `long_history` は進捗に応じた可否になる。
  - いずれかの `long_history` が解放済みなら `canSelectExtra` は `true`。

### T4: VN model with speaker and standing

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

### T5: VN model without speaker or standing

- 入力:
  - `speakerId` なし。
  - `standingCharacterId` なし。
  - `choice` に選択肢配列を指定。
- 期待結果:
  - `speaker` は `null`。
  - `standing` は `null`。
  - `choices` は入力された配列。

### T6: Rhythm quiz model

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

### T7: Turn result model

- 入力:
  - `turn`
  - `scores`
  - `startScores`
  - `rank`
  - `heroineComment`
  - `unlocks`
- 期待結果:
  - `turn` が入力どおり。
  - `stats.totalScore` が revenue + satisfaction + reputation。
  - `stats.delta` が `scores - startScores`。
  - `rank`、`heroineComment`、`unlocks` が入力どおり。

## Out of Scope

- セーブデータ有無に基づくTITLEの `canContinue` モデル。
- ブラウザ具体層からのRender Model全面利用。
- DOM、CSS、Canvas、Audio API、ブラウザイベントの検証。

## Success Criteria

- `node --test tests/core/C011_RENDER_MODEL.test.cjs` が成功する。
- `npm run test:core` に含まれるC011テストが成功する。
