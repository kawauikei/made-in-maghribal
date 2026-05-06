# Integration Test Note: C012_BROWSER_SYSTEM_IMPLEMENTATION

## Status

本書は正式contract testspecではなく、ブラウザ統合層の確認メモである。

ブラウザ実動作確認はPlaywright smoke testまたは人間確認で扱う。今回の自動化対象は構文、bundle生成、coreテスト、既存browser smoke testの範囲に限定する。

## Test Environment

- Runtime: Browser
- Automated smoke: Playwright
- Target: `public/index.html`
- Bundle: `tools/build-browser-bundle.cjs`

## Automated Checks

- `npm run check:browser`
  - `browser/app.js` の構文確認。
  - `tools/build-browser-bundle.cjs` による `public/bundle.js` 生成。
  - 生成後 `public/bundle.js` の構文確認。
- `npm run test:core`
  - core contractsのNodeテスト。
- `npm run test:browser`
  - 既存Playwright smoke test。

## Manual Verification Items

### 1. Basic flow

- TITLEからOPENINGへ進む。
- HEROINE_SELECTでヒロインを選択する。
- BEFORE_OPENからQUIZへ進む。
- 10問回答後にTURN_RESULTへ進む。
- Turn 5後にENDINGへ進む。
- ENDINGからTITLEへ戻る。

### 2. Resume

- 現在ランの保存がある状態でタイトルの「つづきから」を押す。
- クイズ中の保存では、問題番号、現在問題、選択肢が復元される。
- セーブデータが無い場合のタイトル表示とメッセージが破綻しない。

### 3. Audio and effects

- 初回操作前にBGM/SFXが再生されない。
- 初回操作後にBGM/SFXがunlockされる。
- BGM切り替え時のフェードが不自然でない。
- クイズ正誤、UI操作、ターン切り替えのSFXが鳴る。

### 4. Character visuals

- 立ち絵と顔アイコンのプロファイルが反映される。
- 表情切り替え時に表示崩れがない。
- ヒロイン選択画面のプレビュー切り替えで表示が破綻しない。

### 5. Preload

- ヒロイン選択/プレビュー時に対象ヒロインIDつきでプリロードが要求される。
- プリロード未完了でも画面表示がクラッシュしない。

## Out of Scope

- ブラウザ戻るボタンの履歴制御。
- 複数セーブスロット。
- 高精度な音声ラグ測定。
- `.kawazu/construct/blueprint_fragments` の最新化。
