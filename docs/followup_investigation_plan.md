# Follow-up Investigation and Implementation Plan

作成日: 2026-05-07

本書は `docs/棚卸し.md` の追加TODOに対するソース調査結果と実装計画である。現時点では計画系のみで、ブラウザ実装変更は行っていない。

## 1. タイトル画像比率と全画面表示

### 調査結果

- `#game-viewport` は `720px x 1280px` の固定論理画面で、`GameController.updateViewportScale()` が `scale = min(availableWidth / 720, availableHeight / 1280)` を計算し、CSS transformで表示サイズへ合わせている。
- タイトルのlogoは `browser/styles/10_title.css` の `.title-logo-anchor` で `width: min(78vw, 615px)` を使っている。
- タイトルのclockは `.title-clock-crop` で `width/height: clamp(170px, 25vw, 260px)` を使っている。
- `vw` はブラウザviewport基準であり、720x1280の論理画面基準ではない。そのため、外側で `#game-viewport` をscaleしている構造と相性が悪く、画面サイズ変更時にlogo/clockの比率が論理画面内で一定にならない。
- `toggleFullscreen()` は `#game-viewport` 自体に `requestFullscreen()` を呼ぶ。一方で `updateViewportScale()` は同じ `#game-viewport` に `position: fixed`、`left/top`、`transform: scale(...)` を再適用する。この二重責務が全画面時のアスペクト崩れや操作不能の原因候補になる。

### 実装計画

1. タイトル内部のサイズ指定から `vw` を除き、720x1280論理画面内の `px`、`%`、または専用CSS変数へ寄せる。
2. `.title-logo-anchor` は `width: 560px` 前後と `max-width: calc(100% - 96px)` の組み合わせにする。
3. `.title-clock-crop` は `width/height: 220px` 前後とし、必要なら `clamp()` ではなく論理画面幅に対する `%` で指定する。
4. 全画面対象は `#game-viewport` ではなく、`document.documentElement` または専用外枠に変更する。`#game-viewport` は常に720x1280論理画面として維持する。
5. fullscreenchange後は既存の `scheduleViewportScaleUpdate()` を維持し、letterbox前提で中央配置する。
6. 検証は 720x1280、1080x1920、1920x1080、1366x768、全画面縦横で行う。

## 2. クイズ利用楽曲ルール

### 調査結果

- 現在の選曲は `browser/utils/bgmEngine.js` の `getGameTrack(heroineId, turn)` が担っている。
- 現行ルールは以下。
- Turn 1: `main03_puzzle`。
- Turn 2以降: 選択ヒロインの `game` 配列を `(turn - 2) % gameTracks.length` で選ぶ。
- `audioManifest.cjs` には各ヒロインのgame曲A-D相当が4曲ずつ、汎用extra曲が10曲ある。
- 追加要望にある「汎用BGMからランダム」は現行の通常クイズ選曲では使っていない。
- `debugJump.js` の `jump=quiz` は `controller.session.turn = 1` 固定で、URLの `turn` パラメータを無視する。したがってデバッグでターン指定した際の楽曲確認には不適切。
- `before_open`、`after_close`、`turn_result` は `turn` パラメータを読むが、実際にクイズBGMが鳴るのは `subPhase === 'QUIZ'` の時である。

### 未確定点

- 追加要望の2行は、5ターン構成の候補として読むなら「共通 -> ヒロインA/B -> 汎用ランダム -> 汎用ランダム -> ヒロインC/D」と解釈できる。
- ただし、A/B/C/Dの切り替え条件が通常ルート内のランダムなのか、ヒロインごとのパターンなのか、routeMode差なのかはソースからは確定できない。

### 実装計画

1. `src/core` または `browser/utils` に選曲ルール関数を切り出す。候補名は `getQuizBgmTrackForTurn({ heroineId, turn, routeMode, runSeed })`。
2. 5ターンの候補スロットを明示する。
3. 汎用BGMランダムは完全ランダムではなく、`heroineId + routeMode + turn + runSeed` から決定する再現可能な疑似ランダムにする。
4. `debugJump.js` の `jump=quiz` で `turn` パラメータを読むようにする。
5. 選曲ルールの単体テストを追加し、デバッグURLのturn指定と通常進行が同じ関数を通るようにする。
6. 人間確認用に `tools/debug-links.html` のクイズリンクでturn選択が反映されることを確認する。

## 3. デバッグ機能集約

### 調査結果

- タイトル画面のデバッグボタンは `browser/screens/titleScreen.js` で `controller.isDebugMode()` がtrueの時だけ表示される。
- クリック時は `data-title-stub="デバッグ"` として未実装メッセージを出すだけで、実質的な機能はない。
- 実際のデバッグ導線は `tools/debug-links.html` と `browser/utils/debugJump.js` にある。
- `tools/debug-links.html` は `heroine`、`turn`、`textSpeed` をURLに付与できる。
- ただし `debugJump.js` 側の `jump=quiz` がturnを無視しているため、リンク側だけでは完全ではない。

### 実装計画

1. `titleScreen.js` からデバッグボタン生成を削除する。
2. `tools/debug-links.html` に必要な導線が揃っているか確認する。
3. 足りない導線は `tools/debug-links.html` と `debugJump.js` に追加する。
4. `jump=quiz` のturn反映を修正し、楽曲ルール確認にも使えるようにする。
5. `docs/debug_urls.md` を `tools/debug-links.html` 優先の説明に更新する。

## 4. イベント集

### 調査結果

- 現在のイベント集は `titlePanelScreen.js` の `renderEventGallery()` で、ヒロイン別クリア状況を表示する仮実装である。
- `playerProgress.js` には `eventSeen` があるが、イベント単位の閲覧記録はまだ接続されていない。
- C006のシナリオ構造は `speakerId`、`speakerExpression`、`standingCharacterId`、`standingExpression`、`backgroundId`、`text`、`choice`、`jump`、`flags` を想定している。
- 現行サンプルは `src/data/scenarioSamples.cjs` と `src/data/dailyTalkSamples.cjs` に分かれている。
- ヒロイン説明は `heroineSelectScreen.js` のローカル定数、評価時セリフは `browser/data/resultComments.js` にあり、世界観担当の単一ソース管理にはなっていない。

### 実装計画

1. 世界観担当の編集対象として、単一の著者向けファイルを作る。候補は `content/world_events.md`。
2. 著者向けファイルは「ヒロイン定義」「イベント定義」「評価時セリフ」「Daily Talk」を同居させる。
3. ビルドまたは生成スクリプトで以下を生成する。
- `src/data/generated/eventManifest.cjs`
- `src/data/generated/heroineProfiles.cjs`
- `src/data/generated/resultCommentData.cjs`
- `src/data/generated/dailyTalkData.cjs`
4. 手書き編集対象と生成物を明確に分ける。生成物は `docs/source_structure.md` に追記する。
5. イベント演出はC006のScenario Stepを拡張し、最低限以下を扱う。
- 背景変更
- 話者指定
- 話者表情
- 立ち絵キャラクター
- 立ち絵表情
- BGM/SE指定
- 選択肢
- フラグ付与
6. イベント回想は `playerProgress.eventSeen[eventId]` に閲覧履歴を保存し、イベント集はこの履歴から解放状態を表示する。

## 5. 画像集

### 調査結果

- 既存画像は `public/images/background`、`public/images/still`、`public/characters/*/(standing_proc|face_proc)`、`public/images/ui`、`public/images/items` にある。
- `public/images/still` にはヒロイン名を含むスチルが12件ある。
- `playerProgress.js` には `imageSeen` があるが、現在の画像集は `imageSeenCount` を表示するだけで、画像ファイル一覧とは接続されていない。
- 追加要望では画像集はイベント集と異なり履歴管理をしない方針である。

### 実装計画

1. 画像集はビルド時またはツール実行時に既存画像ファイルを走査してmanifestを生成する。
2. 生成先候補は `src/data/generated/imageGalleryManifest.cjs`。
3. 分類は以下。
- `common`: 背景、UI、共通スチル。
- `heroine`: ファイル名またはディレクトリから `HAKIMA`、`MIRA`、`DARIYA` を判定できる画像。
- `item`: アイテム図鑑側で扱うため画像集からは除外候補。
4. 解放判定は保存履歴ではなく `playerProgress.endings` から計算する。
5. 共通画像は三人の通常クリアで解放する。
6. ヒロイン固有画像は該当ヒロインの通常クリアで解放する。
7. 画像集の閲覧有無は保存しない。`playerProgress.imageSeen` は使わないか、後方互換のため残すだけにする。

## 6. フリープレイ

### 調査結果

- タイトルには `data-title-stub="フリープレイ"` の入口だけがある。
- クイズ進行は通常ランの `session` と `quizState` に強く依存している。
- BGM一覧は `audioManifest.cjs` に揃っており、音楽集でも走査済みである。

### 実装計画

1. タイトルのフリープレイ入口を専用パネル化する。
2. 楽曲は `AUDIO_MANIFEST.bgm.system`、各ヒロインの `game`、`extra` から選択可能にする。
3. 問題数は5から20問の範囲で選択可能にする。
4. 通常ランの `GameSession` とは別に `freePlayState` を持つ。
5. クイズ問題生成は既存の `generateQuestion()` を使う。
6. スコア表示はフリープレイ専用の簡易結果にし、エンディング、ヒロイン進捗、オートセーブ、アイテム図鑑登録へ影響させない。
7. BGMは選択曲を直接 `bgm.play(track)` で再生する。通常進行の `syncBgm()` と競合しないよう、フリープレイ中のBGM同期条件を分ける。

## 推奨コミット順

1. タイトル比率と全画面表示の修正。
2. デバッグターン指定と楽曲ルール関数の整理。
3. デバッグボタン削除と `tools/debug-links.html` 集約。
4. イベント集の著者向け単一ソースと生成方針。
5. 画像集manifest生成。
6. フリープレイ専用状態と画面。

## 検証方針

- ソース変更時は `npm run check:browser` を必ず実行する。
- core側に選曲関数を追加する場合は `npm run test:core` も実行する。
- 画面比率と全画面表示は自動テストで拾いにくいため、人間確認またはブラウザ確認項目に追加する。
- デバッグターン指定は `tools/debug-links.html` から `jump=quiz&turn=1..5` を開き、表示中BGMカテゴリが期待値になることを確認する。
