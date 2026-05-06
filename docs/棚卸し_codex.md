# 棚卸し_codex

作成日: 2026-05-07

## 前提

- ソースは動作確認済みのため、ソースを真とする。
- 今回は計画と確認のみ。編集対象は本ファイルのみ。
- 既存の未コミット変更として `browser/app.js` と `browser/styles/01_base.css` が存在するため、内容確認のみで触らない。
- `docs/棚卸し_codex.md` と `docs/棚卸し_gemini.md` は未追跡ファイル。

## 確認範囲

- MCP filesystem: ルート/`docs` 一覧、主要ソース、仕様書、既存ドキュメントの読み取り。
- PowerShell: `git status --short`、TODO検索、行数ランキング、仕様/ドキュメント内キーワード検索。
- `rg` は環境に存在しなかったため、MCP検索と `Get-ChildItem` / `Select-String` で代替。

## ソースを真とした齟齬

### D001: I001 testspec のレジューム未実装記述が古い

- ドキュメント: `specs/integration/I001_BROWSER_PLAYTHROUGH.testspec.md:52`
- 記述: 「レジューム: 現在は未実装（ブラウザリロードでリセットされるのが仕様）。」
- ソース実態:
  - `browser/utils/saveData.js` は `questionIndex`、`currentQuestion`、`currentChoices`、`turnItemLog`、`turnStartScore` を保存する。
  - `browser/app.js` は `continueFromSave()` と `title-continue` を持つ。
  - `tests/browser/browser-smoke.spec.js` には "Session persistence and resume after reload" がある。
- 判定: ドキュメントを更新対象。ソース変更は不要。

### D002: autosave_design_memo の「MVP後続」表現が古い

- ドキュメント: `docs/autosave_design_memo.md:3`
- 記述: 「MVP後続で実装するオートセーブの保存対象メモ。」
- ソース実態:
  - `browser/utils/saveData.js` は現在ランのオートセーブを実装済み。
  - `browser/utils/playerProgress.js` はヒロインルート解放、最高記録、エンディング履歴、イベント/画像プレースホルダを実装済み。
  - `browser/utils/itemCollection.js` はアイテム図鑑系の別保存を担う。
- 判定: 「未実装メモ」ではなく「実装済み範囲と後続範囲の整理」に更新対象。

### D003: loading_plan の BGM エンジン未実装記述が古い

- ドキュメント: `docs/loading_plan.md:12`
- 記述: 「Add the actual BGM playback engine separately from this preload layer.」
- ソース実態:
  - `browser/utils/bgmEngine.js` はフェード、ユーザー操作後 unlock、セッション別BGM選択、トリム再生を実装済み。
  - `browser/app.js` は `syncBgm()` から `playForSession()` を呼ぶ。
- 判定: ドキュメント更新対象。プリロード方針自体は一部維持。

### D004: C012 のヒロイン選択直後プリロード要件と実装の呼び出しが弱い

- ドキュメント: `specs/modules/C012_BROWSER_SYSTEM_IMPLEMENTATION.testspec.md:34`
- 記述: ヒロイン選択直後に、そのヒロイン専用BGMや立ち絵ロード開始。
- ソース実態:
  - `browser/utils/preloadAssets.js` の `preloadHeroineSelectAssets(heroineId)` は `heroineId` 必須。
  - `browser/app.js:295` と `browser/app.js:471` は引数なしで呼んでいる。
  - `selectHeroine(id, routeMode)` 内でも選択IDを渡したプリロード呼び出しは見当たらない。
- 判定: ソースを真とするなら「現在の実装は初期プリロード中心。選択ID別プリロードは未接続または弱接続」とドキュメント化する。後続リファクタリング候補。

### D005: C012 の「戻るボタン制御」は実装根拠が見当たらない

- ドキュメント: `specs/modules/C012_BROWSER_SYSTEM_IMPLEMENTATION.spec.md:54`
- 記述: ブラウザの「戻る」ボタン等による予期せぬ状態遷移を防止または制御。
- ソース実態:
  - `popstate` / `history.pushState` / `beforeunload` 系の制御は検索範囲で見当たらない。
  - セーブ復元は存在するが、ブラウザ履歴制御とは別機能。
- 判定: 要件を「未実装TODO」に落とすか、仕様から外すか確認対象。

### D006: C012 が spec_index に登録されていない

- ドキュメント: `.kawazu/construct/spec_index.md`
- 実態:
  - C001-C011 は active として登録済み。
  - `specs/modules/C012_BROWSER_SYSTEM_IMPLEMENTATION.spec.md` と testspec は存在するが、インデックスの Contracts / Source Lookup には未登録。
- 判定: 仕様運用上のTODO。契約対象にするなら registry 側の更新が必要。

### D007: .kawazu review の一部はソース現状に対して古い可能性がある

- 例: `.kawazu/construct/reviews/C008_RHYTHM_QUIZ_CORE/spec_source_review.md` は「回答速度ボーナス」「正誤判定」「売上発生」等を未実装と記述。
- ソース実態:
  - `src/core/rhythmQuizCore.cjs` は `isCorrect`、`rating`、`reputationBonus`、`satisfactionBonus` を返す。
  - 売上更新は `src/core/scoreModel.cjs` と `browser/app.js` 側で統合されている。
- 判定: review は過去レビューとして扱い、現行判断には使わない。必要なら再レビュー生成。

## 横断リファクタリング候補

### R001: `browser/app.js` の責務分割

- 現状: 約1002行。ルーティング、入力イベント、typewriter、音声同期、セーブ、クイズ進行、ターン遷移が集中。
- 方針:
  - `controllers/inputController.js`: クリック分岐、タイトル/モーダル/クイズ入力。
  - `controllers/sessionPersistenceController.js`: `saveData` / `playerProgress` 連携。
  - `controllers/turnTransitionController.js`: ターン遷移オーバーレイ、タイマー、skip処理。
  - `controllers/typewriterController.js`: typewriter 状態と更新。
- 注意: 動作確認済みソースを真とするため、まず関数移動のみ。振る舞い変更は禁止。

### R002: HTML文字列生成の共通化と escape 方針の明示

- 対象: `browser/screens/*.js`、`browser/ui/*.js`、`browser/app.js`
- 現状: `innerHTML` が多く、表示名・説明文・パスをテンプレートへ直接埋め込む箇所が多い。
- 方針:
  - 表示専用の小さな `escapeHtml` / `attrs` helper を導入。
  - データ由来テキストは `textContent` 更新へ寄せる。
  - ただし、現在のローカル固定データ前提で安全性は相対的に高い。優先度は中。

### R003: プリロードAPIの呼び出し契約を整理

- 対象: `browser/utils/preloadAssets.js`、`browser/app.js`、`browser/screens/heroineSelectScreen.js`
- 現状: `preloadHeroineSelectAssets(heroineId)` はID必須だが、controller wrapper は引数なし。
- 方針:
  - 画面表示時: 全ヒロインの軽量プレビューをプリロード。
  - 選択/プレビュー切替時: 対象ヒロインの全表情/BGMをプリロード。
  - 関数名を `preloadHeroineAssets(heroineId)` などへ寄せ、引数なし関数と区別。

### R004: CSSの肥大化分割

- 上位:
  - `browser/styles/10_title.css`: 約1069行
  - `browser/styles/51_turn_result.css`: 約1064行
  - `browser/styles/40_quiz.css`: 約934行
- 方針:
  - title: ベース、パネル、ギャラリー/サウンドテスト、装飾に分割。
  - result: layout、reveal animation、rank/theme、graphs/log に分割。
  - quiz: lane、choice cards、faces、track info に分割。
- 注意: `tools/build-style.cjs` の結合順に依存するため、分割前にビルド順を固定する。

### R005: 巨大データファイルの扱いを明確化

- 上位:
  - `src/data/generated/rhythmNoteMaps.cjs`: 約19027行
  - `src/data/itemDisplayNames.cjs`: 約3013行
  - `src/data/itemTexts.cjs`: 約1256行
- 方針:
  - `generated/rhythmNoteMaps.cjs` は生成物として手編集禁止を明記。
  - item系はカテゴリ/品質/言語などの粒度で分割、または生成元を確立。
  - 既存 `.kawazu/construct/spec_index.md` の行数警告と連動して対処する。

### R006: C012 の契約化または non_contract 扱いの決定

- 現状: C012仕様書はあるが、`.kawazu/construct/spec_index.md` 未登録。
- 方針:
  - 契約として扱うなら sources/tests/required_commands を registry に追加。
  - non_contract 統合層として扱うなら、C012文書を現行の実装メモへ格下げし、AC表現を実装済み/未実装で分ける。

## TODO 洗い出し

### T001: ドキュメント更新

- `specs/integration/I001_BROWSER_PLAYTHROUGH.testspec.md` のレジューム未実装記述を更新。
- `docs/autosave_design_memo.md` を実装済み/後続対象に分け直す。
- `docs/loading_plan.md` の BGM エンジン未実装記述を更新。
- `docs/source_structure.md` に現行の screen / ui / utils 分割と今後の app.js 分割方針を追記。
- C012 を registry に登録するか、non_contract メモにするか決める。

### T002: ソースTODO/コメントTODO

- `browser/styles/10_title.css:280`: `TODO2: title layout tune / autosave continue stub`
- `browser/styles/20_heroine.css:179`: `TODO2: HD heroine select tune`
- `browser/styles/30_vn.css:170`: `TODO2: ADV readability / speaker icon / standing entrance tune`
- `public/style.css` に同内容がビルド成果物として反映されている。
- 判定: `public/style.css` は生成物扱い。対応は `browser/styles/*` 側で行う。

### T003: 実装TODO候補

- ヒロインID別プリロード呼び出しの接続確認/修正。
- ブラウザ戻るボタン制御を実装するか、仕様から外すか決定。
- C012 Playwright に戻るボタン/プリロード/BGMフェード/セーブ形式確認を追加するか決定。
- `title-continue` の「stub」表現が残るCSSコメントを、実装済みに合わせて更新。

### T004: テストTODO

- `npm run verify` は今回未実行。ユーザー前提ではソース動作確認済み。
- 後続で実施するなら、まず現在の未コミット変更をユーザー変更として保護したうえで、`npm run check:browser`、`npm run test:core`、`npm run test:browser` の順で確認。
- C012 を契約化するなら、`tests/browser/browser-smoke.spec.js` を required_commands に紐づける。

## 次の推奨手順

1. ドキュメント齟齬を先に修正する。対象は `docs/*.md` と `specs/integration/I001_BROWSER_PLAYTHROUGH.testspec.md`。
2. C012 の扱いを決める。契約登録するか、non_contract 統合仕様として扱うかを固定する。
3. `browser/app.js` の関数移動リファクタを小単位で行う。最初は typewriter または turnTransition が安全。
4. プリロード呼び出し契約を整理する。挙動確認済み状態を壊さないよう、ログ/テストで先に現状を固定する。
5. CSS TODO2 をデザイン課題として別チケット化し、生成物 `public/style.css` はビルドで更新する。

## Gemini による批判的レビューと補足

Codex 報告書は既存ドキュメントの「古さ」を鋭く指摘していますが、以下の点においてソースと仕様の逆転現象や、より深い設計上の課題を見逃している可能性があります。

### 批判的指摘 1: C011 (RENDER_MODEL) の「スペック先行」
- **指摘:** Codex は C001-C011 を「登録済み・アクティブ」として扱っていますが、`C011_RENDER_MODEL` の実態はスペック上の Acceptance Criteria を満たしていません。
- **詳細:** スペックでは TITLE, HEROINE_SELECT, TURN_RESULT モデルが完了とされていますが、`src/core/renderModel.cjs` には VN と QUIZ のコードしかありません。
- **リスク:** 「ドキュメントが古い」のではなく「仕様書だけが完了を装っている」状態であり、ソースを真とすると、このコントラクトは「未完了」に差し戻すべきです。

### 批判的指摘 2: リファクタリング方針 (R001) の不十分さ
- **指摘:** Codex は `app.js` をブラウザ側の Controller に分割することを提案していますが、これは「ブラウザ層の中での整理」に留まっています。
- **詳細:** 現在 `app.js` 内にインラインで書かれている「セッション状態から描画データへの変換ロジック」は、本来 C011 (Render Model) がコアロジック（CommonJS層）として担うべきものです。
- **改善案:** `app.js` を分割する前に、まず **Render Model をバイパスしている現状を修正**し、変換ロジックを `src/core/renderModel.cjs` へ抽出する「コアへの押し戻し」を優先すべきです。

### 批判적指摘 3: Blueprint Fragments の放置
- **指摘:** `.kawazu/construct/blueprint_fragments/90_non_contract_integration.json` 内のパス指定が `src/browser/` となっている（現在は `browser/`）など、ディレクトリ構造の齟齬が放置されています。
- **リスク:** 統合ビルドや将来の blueprint 再生成時に、誤ったパスに基づいてファイルが生成・検索される危険があります。

### 追加 TODO:
- [ ] **C011 ステータスのダウングレード:** 実態に合わせて TITLE, HEROINE_SELECT, TURN_RESULT の AC を未完了に戻す。
- [ ] **Render Model へのロジック抽出:** `app.js` 内の `updateVnContent` 呼び出し用引数生成ロジックを `renderModel.cjs` に移行する。
- [ ] **NCxxx 系のパス修正:** Blueprint fragments の `src/browser/` を `browser/` に一括修正、または C012 へ完全移行して削除。
