# EXECUTE: KawazuConstructHub Integration Build

この出力は説明ではなく、エージェントがこの場で実行するための作業指示です。
required contract が active / passed になった後、ブラウザ実動に必要な non_contract integration を作成してください。

## 目的
- app_summary: ブラウザで動く小規模Webアプリ
- contract source を壊さず、index / entrypoint / browser bundle / styles などの統合層で実動化する。
- CommonJS/browser差、bundle require解決、viewport/canvas差分、演出の表示手順を non_contract 側で吸収する。

## Active Contracts
- `C001_DATA_ID_SCHEMA` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C001_DATA_ID_SCHEMA/20260505T201538+0900.json`
  - sources: `src/core/idSchema.cjs`
  - tests: `tests/core/C001_DATA_ID_SCHEMA.test.cjs`
  - required_commands: `node --test tests/core/C001_DATA_ID_SCHEMA.test.cjs`
- `C002_CHARACTER_AND_TONE_DATA` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C002_CHARACTER_AND_TONE_DATA/20260505T210931+0900.json`
  - sources: `src/data/characters.cjs`, `src/data/toneGuides.cjs`, `src/core/characterValidator.cjs`, `src/core/toneGuideValidator.cjs`
  - tests: `tests/core/C002_CHARACTER_AND_TONE_DATA.test.cjs`
  - required_commands: `node --test tests/core/C002_CHARACTER_AND_TONE_DATA.test.cjs`
- `C004_ITEM_MASTER_AND_TEXT` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C004_ITEM_MASTER_AND_TEXT/20260505T210931+0900.json`
  - sources: `src/data/itemTaxonomy.cjs`, `src/data/itemMaster.cjs`, `src/data/itemTexts.cjs`, `src/core/itemValidator.cjs`
  - tests: `tests/core/C004_ITEM_MASTER_AND_TEXT.test.cjs`
  - required_commands: `node --test tests/core/C004_ITEM_MASTER_AND_TEXT.test.cjs`
- `C003_ASSET_MANIFEST` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C003_ASSET_MANIFEST/20260505T210931+0900.json`
  - sources: `src/data/assets.cjs`, `src/core/assetValidator.cjs`
  - tests: `tests/core/C003_ASSET_MANIFEST.test.cjs`
  - required_commands: `node --test tests/core/C003_ASSET_MANIFEST.test.cjs`
- `C005_AUDIO_MANIFEST` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C005_AUDIO_MANIFEST/20260505T210931+0900.json`
  - sources: `src/data/audioManifest.cjs`, `src/core/audioValidator.cjs`
  - tests: `tests/core/C005_AUDIO_MANIFEST.test.cjs`
  - required_commands: `node --test tests/core/C005_AUDIO_MANIFEST.test.cjs`
- `C006_SCENARIO_AND_TALK_SCHEMA` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C006_SCENARIO_AND_TALK_SCHEMA/20260505T210932+0900.json`
  - sources: `src/data/scenarioSamples.cjs`, `src/data/dailyTalkSamples.cjs`, `src/core/scenarioSchema.cjs`, `src/core/scenarioValidator.cjs`
  - tests: `tests/core/C006_SCENARIO_AND_TALK_SCHEMA.test.cjs`
  - required_commands: `node --test tests/core/C006_SCENARIO_AND_TALK_SCHEMA.test.cjs`
- `C007_QUIZ_REQUEST_MODEL` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C007_QUIZ_REQUEST_MODEL/20260505T210932+0900.json`
  - sources: `src/data/quizRequestTemplates.cjs`, `src/core/quizRequestModel.cjs`, `src/core/quizValidator.cjs`
  - tests: `tests/core/C007_QUIZ_REQUEST_MODEL.test.cjs`
  - required_commands: `node --test tests/core/C007_QUIZ_REQUEST_MODEL.test.cjs`
- `C008_RHYTHM_QUIZ_CORE` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C008_RHYTHM_QUIZ_CORE/20260505T210932+0900.json`
  - sources: `src/core/rhythmTiming.cjs`, `src/core/rhythmQuizCore.cjs`
  - tests: `tests/core/C008_RHYTHM_QUIZ_CORE.test.cjs`
  - required_commands: `node --test tests/core/C008_RHYTHM_QUIZ_CORE.test.cjs`
- `C009_SCORE_AFFECTION_ENDING` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C009_SCORE_AFFECTION_ENDING/20260505T210932+0900.json`
  - sources: `src/core/scoreModel.cjs`, `src/core/affectionModel.cjs`, `src/core/endingBranch.cjs`
  - tests: `tests/core/C009_SCORE_AFFECTION_ENDING.test.cjs`
  - required_commands: `node --test tests/core/C009_SCORE_AFFECTION_ENDING.test.cjs`
- `C010_GAME_SESSION_FLOW` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C010_GAME_SESSION_FLOW/20260505T210932+0900.json`
  - sources: `src/core/gameSessionFlow.cjs`, `src/core/stageSchedule.cjs`, `src/core/unlockState.cjs`
  - tests: `tests/core/C010_GAME_SESSION_FLOW.test.cjs`
  - required_commands: `node --test tests/core/C010_GAME_SESSION_FLOW.test.cjs`
- `C011_RENDER_MODEL` status=`active` kind=`module` latest_run_status=`passed` latest_run=`.kawazu/construct/runs/C011_RENDER_MODEL/20260505T210932+0900.json`
  - sources: `src/core/renderModel.cjs`
  - tests: `tests/core/C011_RENDER_MODEL.test.cjs`
  - required_commands: `node --test tests/core/C011_RENDER_MODEL.test.cjs`

## non_contract target files
- `exists` `public/index.html`

## Detected integration hints
- Canvas/viewport/input座標の統合リスクあり。logical座標とdisplay座標を分離してください。
- ロジック結果とpresentation/animation stepsを分けてください。contract coreへ演出状態を混ぜないでください。
- CommonJS contract sourceをブラウザへ載せる必要があります。contract sourceは書き換えずbundle側で吸収してください。
- DOM/UI event層はnon_contract側に寄せ、contract API境界を保ってください。
- 音声はユーザー操作後に開始し、contract coreへブラウザAPI依存を入れないでください。

## 実行手順
1. `construct_status` と `contract_integrity_check` を確認する。
2. active contract の public API / module.exports / require関係を確認する。
3. contract source は CommonJS のまま維持する。ESM化や `type: module` 追加で解決しない。
4. 必要なら `src/browser-bundle.js` に IIFE + local require registry の薄い bundle を作る。
5. `index.html` は browser bundle を読む。
6. `src/styles.css` で viewport中央配置、9:16/scale-to-fit、HUD、Canvas/DOM表示を整える。
7. ブラウザで実動確認し、黒画面・require解決・Canvas resize・pointer座標ズレを潰す。
8. contract 側に不整合が見つかった場合は、コードだけ/仕様書だけ/テストだけの単独修正を避け、影響contractの spec/testspec/source/test をセットで整合して verify する。

## CommonJS browser bundle checklist
- contract source の `require` / `module.exports` を直接書き換えていない。
- browser bundle に module registry がある。
- `./x.js` / `../core/x.js` / `src/core/x.js` などの相対requireを解決できる。
- bundle内のmodule idとcontract source pathが対応している。
- bundle修正後も `contract` / `contract_integrity_check` でcontract sourceの破壊がないことを確認する。

## Canvas / viewport checklist
- logical size と display size を分ける。
- viewportに scale-to-fit し、アスペクト比を維持する。
- letterbox/crop 方針をREADMEまたはdecisionに短く残す。
- devicePixelRatio を使う場合、ctxのscaleが二重になっていない。
- resize時に canvas backing size / transform / pointer変換を再計算する。
- pointer/mouse/touch座標は logical coordinate に変換してからgame/inputへ渡す。

## Match-3 / animation-step checklist
- swap判定、match検出、cascade/refillなどのロジック結果と、画面に見せる手順を混ぜない。
- ロジックが一瞬で解ける場合でも、presentation steps として `swap -> clear -> fall -> refill -> recheck` を表現できる余地を残す。
- アニメーション都合で core rule を歪めない。演出状態は integration / render model / animation model 側に寄せる。

## 完了確認
- ブラウザで起動する。
- required MVP操作ができる。
- viewportサイズ変更で大きく破綻しない。
- `contract` または各 required verify が引き続き通る。
- `contract_integrity_check` 結果を確認する。

## 報告形式
```text
変更ファイル:
browser integration方式:
bundle/require解決の判断:
viewport/canvas確認:
contract変更の有無:
verify結果:
integrity_check結果:
残課題:
```

## Settings
- project_root: `c:\AI\projects\P0007_MadeInMaghribalt3`