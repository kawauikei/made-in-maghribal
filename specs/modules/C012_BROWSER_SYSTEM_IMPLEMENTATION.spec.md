# Integration Note: C012_BROWSER_SYSTEM_IMPLEMENTATION

## Status

`C012_BROWSER_SYSTEM_IMPLEMENTATION` は正式contractではなく、ブラウザ統合実装の non-contract メモとして扱う。

- `.kawazu/construct/spec_index.md` には登録しない。
- `project_blueprint.json` では `non_contract_files` 側に置く。
- ブラウザ実動作はPlaywright smoke testまたは人間確認で扱う。

## Overview

ブラウザ側での画面制御、演出エンジン、セッション永続化、アセット管理の統合実装を整理する。

この層は、core contractで検証済みのデータ/ロジックを、DOM、CSS、Audio API、localStorage、ビルド成果物へ接続する具体実装である。

## Responsibility

- **画面遷移:** TITLE、OPENING、HEROINE_SELECT、VN、QUIZ、TURN_RESULT、ENDING をDOM上で切り替える。
- **演出エンジン:**
  - `browser/utils/bgmEngine.js`: BGM再生、フェード、音量、ユーザー操作後unlock、トリム再生。
  - `browser/utils/sfxEngine.js`: 効果音再生、同時再生、ユーザー操作後unlock。
  - CSSアニメーションによるターン切り替え演出。
- **セッション永続化:**
  - `browser/utils/saveData.js`: 現在ランの保存/復元。
  - `browser/utils/playerProgress.js`: 長期進捗、ルート解放、エンディング履歴。
  - `browser/utils/itemCollection.js`: アイテム図鑑状態。
- **描画支援:**
  - `browser/utils/characterVisualProfiles.js`: 立ち絵/顔アイコンの表示プロファイル適用。
  - `browser/utils/preloadAssets.js`: 画像/音声リソースの事前読み込み。
- **UIコンポーネント:**
  - `browser/ui/hud.js`: 共通ステータス表示。
  - `browser/ui/resultStamp.js`: クイズ判定スタンプ。

## Current Save Data

現在ランは `madeinmaghribal.autosave.run.v1` に保存する。

主な保存対象:

- `session.phase`
- `session.subPhase`
- `session.turn`
- `session.selectedHeroineId`
- `session.routeMode`
- `session.scores`
- `quizState.questionIndex`
- `quizState.currentQuestion`
- `quizState.currentChoices`
- `quizState.turnItemLog`
- `quizState.turnStartScore`

長期進捗は `madeinmaghribal.playerProgress.v1`、アイテム図鑑は `madeinmaghribal.collection.items` に保存する。

## Logic Rules

- 画面ロジックとCSSは分離する。
- 論理解像度は 720x1280 を基準にし、アスペクト比を維持してスケーリングする。
- BGM/SFX再生はユーザー操作後にunlockする。
- アセット読み込み失敗はゲーム進行を止めない。
- ブラウザの戻るボタン制御は必須要件にしない。予期せぬ離脱やリロードにはオートセーブで予防的に対応する。
- ヒロイン別リソースのプリロードは、対象ヒロインIDを明示して要求する。

## Verification Scope

自動確認できる範囲:

- `npm run check:browser`
- `npm run test:core`
- `npm run test:browser`

人間確認に委ねる範囲:

- 体感テンポ。
- BGMフェードの自然さ。
- 画面遷移の違和感。
- モバイル実機での見え方。

## Acceptance Notes

- TITLEからENDINGまでの画面遷移が完走できること。
- リロード後に現在ランを復元できること。
- BGM切り替え時に急な音切れがないこと。
- キャラクター表情切り替え時にプロファイルが再適用されること。
- `tools/build-browser-bundle.cjs` により `public/bundle.js` が生成できること。
- ヒロイン選択/プレビュー時に、対象ヒロインの画像/BGMプリロードが開始されること。
