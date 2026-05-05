```markdown
# テスト仕様書：C008_RHYTHM_QUIZ_CORE

## 概要 (Overview)
本モジュールは、リズム判定（タイミング）、回答速度の計測、およびそれらに基づくボーナスポイントの算出、そして1問ごとの処理結果（判定、正誤、ボーナス）の集計を管理します。

## 責務 (Responsibility)
本モジュールは以下の責務を担います。

1.  **リズム判定（タイミング）の計算:** ユーザーの回答タイミングと最も近い拍との差分を評価します。
2.  **回答速度の計測とボーナス算出:** 提示されたタイミングと回答タイミングの差分から、満足度ボーナスを算出します。
3.  **1問処理の集計:** 上記の判定と速度に基づき、最終的な評価（売上発生の有無）を決定します。
4.  **依存性:** ブラウザのDOMやAudioオブジェクトへの直接的な依存を避け、純粋なタイムスタンプベースの処理を行います。

## データ構造 (Data Structures)

### 質問状態 (Question State)
各質問（クイズ）が持つ状態データ。

*   `promptShownAt`: 要望が表示された時刻 (ms)
*   `answeredAt`: プレイヤーが回答（アイテム選択）した時刻 (ms)
*   `selectedItemId`: 選択されたアイテムID
*   `correctItemId`: 正解のアイテムID
*   `nearestBeatMs`: 回答時刻に最も近い拍（ジャストタイミング）の時刻 (ms)

### 判定タイプ (Judgement Types)
リズム判定の結果として得られる判定値。

*   `PERFECT`: 誤差 $\pm 50\text{ms}$ 以内
*   `GOOD`: 誤差 $\pm 150\text{ms}$ 以内
*   `MISS`: 誤差 $\pm 150\text{ms}$ 超過、または回答なし

## 処理ロジック (Logic Rules)

### 1. リズム判定 (Rhythm Judgement)
回答タイミングと最寄りの拍との差分を計算します。

*   **判定ロジック:**
    *   `diff = Math.abs(answeredAt - nearestBeatMs)`
    *   `diff <= 50` $\rightarrow$ **PERFECT** (評判ボーナス +2)
    *   `diff <= 150` $\rightarrow$ **GOOD** (評判ボーナス +1)
    *   `else` $\rightarrow$ **MISS** (評判ボーナス +0)

### 2. 回答速度ボーナス (Response Speed Bonus)
回答にかかった時間（応答時間）を評価します。

*   **速度計算:**
    *   `responseTime = answeredAt - promptShownAt`
*   **ボーナス付与:**
    *   `responseTime < 3000ms` $\rightarrow$ 満足度ボーナス +2
    *   `responseTime < 5000ms` $\rightarrow$ 満足度ボーナス +1
    *   `else` $\rightarrow$ 満足度ボーナス +0

### 3. 総合評価 (Overall Evaluation)
最終的な評価と売上発生の有無を決定します。

*   **売上発生条件:**
    *   正解（`selectedItemId === correctItemId`）であれば売上が発生します。
    *   リズムが悪くても正解であれば売上は発生します。

## 受け入れ基準 (Acceptance Criteria)

以下の条件が満たされることを確認します。

*   [ ] **基本評価:** 1問が `promptShownAt`, `answeredAt`, `selectedItemId`, `correctItemId`, `nearestBeatMs` を全て受け取り、評価できること。
*   [ ] **速度判定:** 回答速度が 3秒以内 $\rightarrow$ +2、5秒以内 $\rightarrow$ +1、5秒超過 $\rightarrow$ +0 の満足度ボーナスに変換できること。
*   [ ] **リズム判定:** リズム評価が PERFECT $\rightarrow$ +2、GOOD $\rightarrow$ +1、MISS $\rightarrow$ +0 の評判ボーナスに変換できること。
*   [ ] **売上判定:** リズムが悪くても正解（`selectedItemId === correctItemId`）であれば、売上が発生すること。
*   [ ] **判定出力:** 判定結果として `PERFECT`, `GOOD`, `MISS`, `NONE` のいずれかを正確に返せること。
*   [ ] **ノーツ密度:** ノーツ密度が少なめであることを前提として、処理が安定して実行できること。
*   [ ] **デバッグ表示:** 差分（$\text{ms}$）がデバッグ表示用に返せること。

---
**補足:**
本仕様書は、上記ロジックに基づき、全ての入力値が定義された通りに処理され、期待される出力値（判定、ボーナス）が返されることを保証します。
```
