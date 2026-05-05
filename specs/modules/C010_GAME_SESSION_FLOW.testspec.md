```markdown
# テスト仕様書：C010_ゲームセッションフロー

## 概要 (Overview)
本仕様書は、ゲームセッション全体の状態管理（フェーズ、ターン、選択ヒロインなど）を定義し、ゲーム進行のロジックを記述するものです。タイトル画面からエンディング、そして解放状態の管理までを統合的に扱います。

## 責務 (Responsibility)
本モジュールは以下の責務を担います。

*   **セッション状態管理:** ゲーム全体のセッション状態（フェーズ、ターン、選択ヒロインなど）を管理します。
*   **遷移ロジックの提供:** フェーズ間の遷移ロジック（例: `OPENING` $\rightarrow$ `MAIN_GAME`）を提供します。
*   **ターン内サイクル管理:** 1ターン内のサイクル（開店前 $\rightarrow$ クイズ $\rightarrow$ 結果 $\rightarrow$ 閉店後）の進行を管理します。
*   **エンディング判定:** 5ターン終了後のエンディング判定呼び出しと遷移を管理します。
*   **解放状態管理:** クリア情報（解放状態）の永続化を管理します。

## データ構造 (Data Structures)

### セッションフェーズ (Session Phase)
ゲームの進行段階を定義します。
*   `TITLE`: タイトル画面
*   `OPENING`: オープニング（導入）
*   `HEROINE_SELECT`: ヒロイン選択
*   `MAIN_GAME`: メインゲーム（本編）
*   `ENDING`: エンディング

### セッション状態 (Session State)
ゲーム実行中の状態を保持します。
*   `phase`: 現在のフェーズ (`Session Phase` の値)
*   `turn`: 現在のターン数 (1〜5)
*   `subPhase`: ターン内の小フェーズ (`BEFORE_OPEN`, `QUIZ`, `TURN_RESULT`, `AFTER_CLOSE`)
*   `selectedHeroineId`: 選択中のヒロインID
*   `routeMode`: プレイモード (`normal` または `extra`)
*   `scores`: 現在のスコア累計値
*   `affection`: ヒロインごとの好感度累計値

### 解放状態 (Unlock State)
ゲームのクリア状況を保持します。
*   `goodEndingCleared`: ヒロインごとのクリアフラグ（達成済みか否か）
*   `extraRouteAvailable`: Extra Routeが選択可能かどうかのフラグ

## 遷移ルール (Flow Rules)

### ターン進行
*   **基本構成:** 1ターンは10問のクイズで構成されます。
*   **Turn 1:** 全員 `main03_puzzle` の固定コンテンツを使用します。
*   **Turn 2 / Turn 5:** ヒロインと `routeMode` に応じた専用のゲーム曲を選択します。
*   **Turn 3 / Turn 4:** Extra Route専用のゲーム曲を選択します。

### エンディング判定
*   **判定タイミング:** 5ターン終了後、`C009` の判定ロジックを呼び出し、`ENDING` フェーズへ遷移します。
*   **解放処理:** GOOD ENDING達成時、`unlockState` を更新し、次回以降のセッションで Extra Route の選択を許可します。

## 受入基準 (Acceptance Criteria)

以下の項目が満たされることを確認します。

*   [ ] **フェーズ遷移の網羅性:** `TITLE`, `OPENING`, `HEROINE_SELECT`, `MAIN_GAME`, `ENDING` の全てのフェーズ遷移が正しく処理されること。
*   [ ] **ターン内サイクル:** 1ターンが `beforeOpen` $\rightarrow$ `rhythmQuiz` $\rightarrow$ `turnResult` $\rightarrow$ `afterClose` の順序で進行すること。
*   [ ] **ターン数:** 5ターン制の進行が完全にサポートされること。
*   [ ] **総問数:** 1ターン10問、合計50問の進行管理が正確に行われること。
*   [ ] **Turn 1 特殊処理:** Turn 1が固定コンテンツ (`main03_puzzle`) を使用すること。
*   [ ] **Turn 2/5 特殊処理:** Turn 2およびTurn 5が、ヒロインと `routeMode` に応じた曲を正しく選択すること。
*   [ ] **Extra Route 許可:** Good Endingが達成されたヒロインについて、Extra Routeの選択が許可されること。
*   [ ] **初期状態反映:** ゲーム開始時に、解放状態（クリア情報）が正しく反映されること。
```
