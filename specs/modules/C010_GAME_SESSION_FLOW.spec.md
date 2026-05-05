# Contract Specification: C010_GAME_SESSION_FLOW

## Overview
タイトルから5ターン、エンディング、解放までの統合状態を管理する。

## Responsibility
- ゲーム全体のセッション状態（フェーズ、ターン、選択ヒロイン等）の管理。
- フェーズ間の遷移ロジックの提供。
- 1ターン内のサイクル（開店前、クイズ、結果、閉店後）の進行管理。
- 5ターン終了後のエンディング判定呼び出しと遷移。
- クリア情報の永続化（解放状態）の管理。

## Data Structures

### Session Phase
- `TITLE`, `OPENING`, `HEROINE_SELECT`, `MAIN_GAME`, `ENDING`

### Session State
- `phase`: 現在のフェーズ
- `turn`: 現在のターン (1〜5)
- `subPhase`: ターン内の小フェーズ (`BEFORE_OPEN`, `QUIZ`, `TURN_RESULT`, `AFTER_CLOSE`)
- `selectedHeroineId`: 選択中のヒロイン
- `routeMode`: `normal` または `extra`
- `scores`: 現在のスコア累計
- `affection`: ヒロインごとの好感度累計

### Unlock State
- `goodEndingCleared`: ヒロインごとのクリアフラグ
- `extraRouteAvailable`: Extra Routeが選択可能かどうかのフラグ

## Flow Rules

### ターン進行
- 1ターンは10問のクイズで構成される。
- Turn 1: 全員 `main03_puzzle` 固定。
- Turn 2 / Turn 5: ヒロインと routeMode に応じた game 曲を選択。
- Turn 3 / Turn 4: Extra 曲から選択。

### エンディング
- Turn 5 終了後、`C009` の判定ロジックを呼び出し、`ENDING` フェーズへ遷移。
- GOOD ENDING 達成時は `unlockState` を更新し、次回から Extra Route を選択可能にする。

## Acceptance Criteria
- [ ] TITLE, OPENING, HEROINE_SELECT, MAIN_GAME, ENDING の遷移を扱える。
- [ ] 1ターンは beforeOpen, rhythmQuiz, turnResult, afterClose の順で進む。
- [ ] 5ターン制を扱える。
- [ ] 1ターン10問、合計50問の進行を管理できる。
- [ ] Turn 1 は全員 `main03_puzzle` 固定。
- [ ] Turn 2 / Turn 5 はヒロインと routeMode に応じた曲が選ばれる。
- [ ] Good Ending 済みヒロインで extra route 選択を許可できる。
- [ ] ゲーム開始時に解放状態（クリア情報）を反映できる。
