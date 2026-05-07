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
  - C012 non-contract補助テストとして、過去問履歴の保存順、件数上限、summary反映を確認する。
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

### 3. Logs and history

- グローバルUIのログボタンからログモーダルを開ける。
- 会話ログタブと過去問履歴タブを切り替えられる。
- 過去問履歴には最新の回答が先頭に表示される。
- 過去問履歴には問題文、左右選択肢、正解、選択、結果が表示される。
- 過去問履歴が100件を超える場合にページングできる。
- 保存データにHTML風文字列が含まれていても、ログ表示でHTMLとして解釈されない。

### 4. Audio and effects

- 初回操作前にBGM/SFXが再生されない。
- 初回操作後にBGM/SFXがunlockされる。
- BGM切り替え時のフェードが不自然でない。
- クイズ正誤、UI操作、ターン切り替えのSFXが鳴る。

### 5. Character visuals

- 立ち絵と顔アイコンのプロファイルが反映される。
- 表情切り替え時に表示崩れがない。
- ヒロイン選択画面のプレビュー切り替えで表示が破綻しない。

### 6. Preload

- ヒロイン選択/プレビュー時に対象ヒロインIDつきでプリロードが要求される。
- プリロード未完了でも画面表示がクラッシュしない。

### 7. Save deletion

- オプションのセーブデータ削除で現在ラン、長期進捗、過去問履歴、アイテム図鑑状態が削除される。
- 削除後にタイトルへ戻り、つづきからが使えない状態になる。

## Out of Scope

- ブラウザ戻るボタンの履歴制御。
- 複数セーブスロット。
- 高精度な音声ラグ測定。
- `.kawazu/construct/blueprint_fragments` の最新化。
