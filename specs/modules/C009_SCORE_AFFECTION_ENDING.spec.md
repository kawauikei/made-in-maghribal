# Contract Specification: C009_SCORE_AFFECTION_ENDING

## Overview
売上、満足度、評判、好感度、エンディング分岐、クリア後解放を管理する。

## Responsibility
- ゲーム全体および各ターンのスコア（売上、満足度、評判）の集計。
- ヒロインごとの好感度計算（売上・満足度・評判の複合計算）。
- エンディング分岐（Normal / Good）の判定ロジック。
- クリア後の追加ルートおよびFree Play解放フラグの管理。

## Data Structures

### Game Score
- `revenue`: 売上（ディナール）。最大 500。正解ごとに +10。
- `satisfaction`: 満足度。最大 100。速度ボーナスの累計。
- `reputation`: 評判。最大 100。リズム判定ボーナスの累計。

### Affection
- `affection`: ヒロインごとの好感度 (0〜100)。
- **計算式:** `(売上 + 満足度 + 評判) / 5`

### Ending Branch
- **通常ルート:** 好感度 60 以上で Good Ending
- **追加ルート:** 好感度 80 以上で Good Ending

## Acceptance Criteria
- [x] 正解時に売上 +10 を加算する。
- [x] 満足度最大 100, 評判最大 100, 売上最大 500 を扱える。
- [x] 好感度 = (売上 + 満足度 + 評判) / 5 を計算できる。
- [x] 好感度は 100 で上限クリップする。
- [x] 通常ルートは好感度 60 以上で Good Ending。
- [x] 追加ルートは好感度 80 以上で Good Ending。
- [x] Good Ending 後の追加ルート/Free Play 解放フラグを計算できる。
