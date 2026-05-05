# Contract Specification: C008_RHYTHM_QUIZ_CORE

## Overview
ノーツ、判定、回答速度、リズム評価、1問処理を管理する。

## Responsibility
- リズム判定（タイミング）の計算。
- 回答速度の計測とボーナスポイントの算出。
- 1問ごとの処理結果（判定、正誤、ボーナス）の集計。
- ブラウザのDOMやAudioの実装には依存せず、タイムスタンプベースで処理する。

## Data Structures

### Question State
- `promptShownAt`: 要望が表示された時刻 (ms)
- `answeredAt`: プレイヤーが回答（アイテム選択）した時刻 (ms)
- `selectedItemId`: 選択されたアイテムID
- `correctItemId`: 正解のアイテムID
- `nearestBeatMs`: 回答時刻に最も近い拍（ジャストタイミング）の時刻 (ms)

### Judgement Types
- `PERFECT`: 誤差 ±50ms 以内
- `GOOD`: 誤差 ±150ms 以内
- `MISS`: 誤差 ±150ms 超過、または回答なし

## Logic Rules

### リズム判定 (Rhythm Judgement)
- `diff = Math.abs(answeredAt - nearestBeatMs)`
- `diff <= 50` -> `PERFECT` (評判ボーナス +2)
- `diff <= 150` -> `GOOD` (評判ボーナス +1)
- `else` -> `MISS` (評判ボーナス +0)

### 回答速度ボーナス (Response Speed Bonus)
- `responseTime = answeredAt - promptShownAt`
- `responseTime < 3000ms` -> 満足度ボーナス +2
- `responseTime < 5000ms` -> 満足度ボーナス +1
- `else` -> 満足度ボーナス +0

### 総合評価
- 正解（`selectedItemId === correctItemId`）であれば売上が発生する。
- リズムが悪くても正解なら売上は入る。

## Acceptance Criteria
- [ ] 1問は promptShownAt, answeredAt, selectedItemId, correctItemId, nearestBeatMs を評価できる。
- [ ] 回答速度は3秒以内 +2, 5秒以内 +1, 5秒超過 +0 の満足度ボーナスに変換できる。
- [ ] リズム評価は良い +2, そこそこ +1, 合っていない +0 の評判ボーナスに変換できる。
- [ ] リズムが悪くても正解なら売上は入る。
- [ ] 判定は PERFECT, GOOD, MISS, NONE を返せる。
- [ ] ノーツ密度は少なめを前提に生成・保持できる。
- [ ] ±ms差分をデバッグ表示用に返せる。
