```markdown
# C005_AUDIO_MANIFEST 仕様書

## 概要 (Overview)
本仕様書は、ゲーム内の全オーディオアセット（BGM/SE）の管理と、それらの楽曲割り当て（マニフェスト）定義に関する要件を記述する。BGM、SE、ヒロイン別曲、ターン1固定曲、Extra曲、およびFree Play対象の楽曲を定義する。

## 責務 (Responsibility)
本モジュールは以下の責務を担う。

*   **全オーディオアセットの管理:** ゲーム内で使用される全てのBGMおよびSEの管理。
*   **楽曲割り当ての定義:** キャラクターやシーンに応じた楽曲の割り当てを定義する。
*   **エンディング曲の定義:** エンディング種別（Normal / Good）に応じた楽曲を定義する。
*   **Free Play管理:** Free Playモードにおける楽曲解放フラグの管理を行う。

## データ構造 (Data Structures)

### BGMカテゴリ定義
*   **System BGM:** ゲーム全体で共通利用される楽曲。
    *   `main01_title`: タイトル画面用BGM
    *   `main02_shop`: ショップ画面用BGM
    *   `main03_puzzle`: パズル画面用BGM
*   **Heroine Theme BGM:**
    *   `BGM_THEME_{HEROINE}`: 各ヒロインのテーマ曲
*   **Game Song BGM:**
    *   `BGM_GAME_{HEROINE}_{N}`: 各ヒロインのゲーム内楽曲（N=1〜4）
*   **Ending BGM:**
    *   `BGM_ED_{HEROINE}_{TYPE}`: エンディング曲（例: `BGM_ED_AICA_NORMAL`）
*   **Extra BGM:**
    *   その他演出用のBGM（例: イベント発生時、特定のシーンでの演出用）

### SEカテゴリ定義
*   **SE_QUIZ:** クイズ演出用のSE（正解、不正解、カウントダウンなど）
*   **SE_UI:** UI操作用のSE（決定、キャンセル、カーソル移動など）
*   **SE_DAY_END:** 1日の終了演出用のSE

### 固定曲定義
*   **Turn 1 固定曲:** 全員共通の固定曲として `main03_puzzle` を使用する。

### ヒロイン楽曲要件
*   各ヒロインに対し、以下の楽曲を定義する。
    *   テーマ曲：1曲
    *   ゲーム曲：4曲
    *   エンディング曲：2曲

## 受け入れ基準 (Acceptance Criteria)

以下の項目が満たされていることを確認する。

*   [ ] **System BGMの定義:** `main01_title`, `main02_shop`, `main03_puzzle` が正しく定義されていること。
*   [ ] **ヒロイン楽曲の定義:** 各ヒロインに対し、テーマ曲1曲、ゲーム曲4曲、エンディング曲2曲が定義されていること。
*   [ ] **Turn 1 固定曲の存在:** `main03_puzzle` がターン1の固定曲として存在すること。
*   [ ] **エンディング対応:** エンディングのNormal/Goodの対応がマニフェストで明示されていること。
*   [ ] **Extra BGMの定義:** 演出用のExtra BGMが、適切なムード（例: `BGM_EXTRA_HAPPY`）付きで定義されていること。
*   [ ] **SEカテゴリの充足:** SEカテゴリ（Quiz / UI / Day_End）が空でないこと。
*   [ ] **Free Play制御:** Free Play対象可否がマニフェストによって制御可能であること。
```
