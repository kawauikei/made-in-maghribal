# プロジェクト棚卸し報告 (Gemini 担当)

## 0. Codex による批判的チェック追記

確認日: 2026-05-07

### 0.1 総評

- C011 の「仕様上は [x] だが実装/テストは VN と QUIZ のみ」という指摘は妥当。
- Blueprint の `src/browser/*` / `browserApp.js` 陳腐化指摘も妥当。
- ただし、一部の結論は設計判断を先取りしている。特に「app.js が `renderModel.cjs` を介さないこと」を即座にアーキテクチャ違反と断定するには、C011 と C012 の境界を先に再定義する必要がある。
- `project_blueprint.json` には C012 が存在するため、「blueprint 側で C012 が未整理」というより「blueprint fragment / project_blueprint / spec_index の同期不全」と表現する方が正確。

### 0.2 Gemini 指摘の妥当性評価

| 指摘 | 評価 | 補足 |
|---|---|---|
| 1.1 Blueprint Fragments の陳腐化 | 妥当 | `90_non_contract_integration.json` は `src/browser/browserApp.js` 等を参照しており現構造と不一致。 |
| 1.2 C011 の実装不足 | 妥当 | `renderModel.cjs` は `getVnRenderModel` / `getRhythmRenderModel` のみ。TITLE/HEROINE_SELECT/TURN_RESULT は未実装。 |
| 1.3 アーキテクチャのバイパス | 要修正 | C011が全画面モデルを担う前提なら問題。ただしC012が具体ブラウザ層を担うため、現行実装を直ちに不正と断定しない。 |
| 2.1 Render Model の統合 | 要注意 | いきなり全画面をC011へ寄せると、動作確認済みブラウザ実装を大きく揺らす。先にC011の責務縮小または拡張を決める。 |
| 2.2 ブラウザユーティリティ共通化 | 妥当だが低優先度 | `normalizeRouteMode` / storage guard / clone helper は重複。挙動変更リスクは低いが、先に仕様齟齬修正を優先。 |
| 2.3 Blueprint 整合性回復 | 妥当 | ただし C011 の [x] を戻すだけでなく、テスト仕様と `spec_index` の状態も合わせて更新が必要。 |
| 3.1 CSS TODO | 一部修正必要 | 「つづきから」は実装済み。CSSコメントの `stub` が古い可能性が高い。 |
| 3.2 C011 TODO | 妥当 | TITLE/HEROINE_SELECT/TURN_RESULT とテスト追加は未実装。 |
| 3.3 永続化TODO | 妥当だが補足必要 | item collection は既に別保存あり。event/image gallery は placeholder。 |

### 0.3 追加で見つかった齟齬・補足

#### G-CHECK-001: C012 は project_blueprint には存在するが spec_index には無い

- `project_blueprint.json` には `C012_BROWSER_SYSTEM_IMPLEMENTATION` が定義されている。
- 一方で `.kawazu/construct/spec_index.md` の Contracts / Source Lookup には C012 が出ていない。
- したがって、C012まわりの問題は「仕様が無い」ではなく、生成済みインデックスと blueprint の同期漏れ。

#### G-CHECK-002: C011 testspec 自体にも整形ノイズがある

- `specs/modules/C011_RENDER_MODEL.testspec.md` は先頭が ```markdown で始まり、末尾にもフェンスが残っている。
- 内容以前に、Markdown文書として余計なコードフェンスが混入している可能性がある。
- 後続でC011を直すなら、spec / testspec / test / source を同時に棚卸しする。

#### G-CHECK-003: `C011` を「正」にして app.js を寄せる前に選択肢を決めるべき

選択肢は少なくとも2つある。

1. C011を全画面の純粋RenderModel層として拡張し、`browser/app.js` から順次利用する。
2. C011をVN/QUIZ中心の補助モデルへ縮小し、TITLE/HEROINE_SELECT/TURN_RESULT の [x] を外す。

現時点で「C011遵守」を前提に大規模リファクタすると、C012の具体ブラウザ実装と二重責務になりやすい。

#### G-CHECK-004: `title-continue` は stub ではなく実装済み

- `browser/app.js` は `data-action="title-continue"` を処理し、`continueFromSave()` を呼ぶ。
- `browser/utils/saveData.js` は `RUN_SAVE_KEY` に現在ランを保存する。
- CSSコメント `TODO2: title layout tune / autosave continue stub` は古い可能性が高い。
- TODO表現は「つづきからスタブ実装」ではなく「つづきからUIコメント/文言の更新、保存データ表示の精度改善」とする方が正確。

#### G-CHECK-005: 永続化は3系統に分かれている

- 現在ラン: `browser/utils/saveData.js`
- 長期進捗: `browser/utils/playerProgress.js`
- アイテム図鑑: `browser/utils/itemCollection.js`
- Gemini版の `playerProgress.js: イベント/ギャラリーフラグの placeholder` は妥当だが、アイテム図鑑まで未実体化と読める表現は避ける。

### 0.4 優先度の再整理

高:
- C011 の spec / testspec / source / test の不一致を解消する。
- C012 の project_blueprint / spec_index 同期不全を解消する。
- レジューム実装済みに対する古いドキュメントを更新する。

中:
- `app.js` の責務分割。ただしC011統合前提ではなく、まず typewriter / turnTransition / input handling の安全な関数移動から始める。
- `saveData.js` / `playerProgress.js` / `itemCollection.js` の storage helper 共通化。

低:
- CSS TODO2 のデザイン調整。
- `renderModel.cjs` の全面適用。ただしC011を全画面モデルとして維持する方針が決まった場合は優先度を高に上げる。

## 1. ドキュメント・ソースの齟齬確認

ソースコードを正本として確認した結果、以下の主要な齟齬を発見しました。

### 1.1 Blueprint Fragments の陳腐化
- **問題:** `.kawazu/construct/blueprint_fragments/90_non_contract_integration.json` に記載されている `NCxxx` 系のアイテムが、現在の実装構造と一致していません。
- **詳細:**
    - パスが `src/browser/` となっていますが、実体は `browser/` 直下にあります。
    - ファイル名が `browserApp.js` ではなく `app.js` になるなど、複数の不一致があります。
    - すでにコントラクト `C012_BROWSER_SYSTEM_IMPLEMENTATION` が定義されており、`NCxxx` の役割を代替している可能性がありますが、blueprint 側で整理されていません。

### 1.2 コントラクト C011 (RENDER_MODEL) の実装不足
- **問題:** `specs/modules/C011_RENDER_MODEL.spec.md` では、TITLE, HEROINE_SELECT, TURN_RESULT 等のモデルが「完了（[x]）」とされていますが、実際の `src/core/renderModel.cjs` にはこれらの実装が存在しません（VN と QUIZ のみ）。
- **詳細:** テストコード `tests/core/C011_RENDER_MODEL.test.cjs` も VN と QUIZ しか検証しておらず、スペック上の完了マークが実態を追い越しています。

### 1.3 アーキテクチャのバイパス
- **問題:** `browser/app.js` において、`src/core/renderModel.cjs` を介さずにセッション状態から直接レンダラーへデータを渡しています。
- **詳細:** 本来 C011 が担うべき「描画モデルへの変換ロジック」が `app.js` 内にインラインで記述されており、コアロジックとブラウザ実装の分離が不完全です。

### 1.4 整合性が取れている箇所 (好例)
- **C010 (GAME_SESSION_FLOW):** スペックと `gameSessionFlow.cjs`, `stageSchedule.cjs` の実装がよく一致しています。
- **計算ロジック:** `scoreModel.cjs`, `affectionModel.cjs`, `endingBranch.cjs` もスペック通りのロジック（売上+10, 好感度算出, 60/80分岐等）が正確に実装されています。

---

## 2. 横断リファクタリング案

ソースコードの健全性を高めるための提案事項です。

### 2.1 Render Model の統合 (C011 遵守)
- `app.js` 内のステート変換ロジックを `src/core/renderModel.cjs` に集約する。
- 画面側のレンダラー（`vnScreen.js` 等）が、この統一されたモデルのみを受け取るようにリファクタリングする。

### 2.2 ブラウザユーティリティの共通化
- `saveData.js` と `playerProgress.js` で重複しているロジック（`normalizeRouteMode`, `cloneJson`, `safeLocalStorage` 等）を、`browser/utils/common.js`（仮）に抽出・統合する。

### 2.3 Blueprint の整合性回復
- `90_non_contract_integration.json` を削除、または `C012` との役割分担を明確にしてパスを修正する。
- C011 スペックの完了マークを実態に合わせて修正する（TITLE/HEROINE_SELECT/TURN_RESULT を [ ] に戻す）。

---

## 3. TODO 洗い出し

ソースコード内および設計上の未完了タスクです。

### 3.1 CSS / UI 演出 (TODO2 ランク)
- [ ] タイトル画面のレイアウト微調整と「つづきから」スタブの実装 (`10_title.css`)
- [ ] ヒロイン選択画面の HD 調整 (`20_heroine.css`)
- [ ] ADV (VN) の可読性向上、話者アイコン、立ち絵登場演出の調整 (`30_vn.css`)

### 3.2 コアロジック
- [ ] `C011`: セーブデータの有無に基づき、TITLE画面での「続きから」状態を正確にモデル化する機能の実装。
- [ ] `C011`: HEROINE_SELECT, TURN_RESULT モデルの実装とテスト。

### 3.3 永続化・進行管理
- [ ] `playerProgress.js`: イベント/ギャラリーフラグの placeholder を実体化。
- [ ] `saveData.js`: 途中保存データのクリーンアップタイミングの厳密化。
