# Autosave Design Memo

現行ソースに基づくオートセーブと長期進捗保存の整理メモ。

## 方針

- 基本はオートセーブ。
- タイトルの「つづきから」は保存データがある場合に現在ランを復元する。
- 手動ロード画面・個別スロットは後続実装。

## 実装済みの保存範囲

- `browser/utils/saveData.js`
  - 現在ランの進行状態。
  - phase / subPhase / turn / heroine / routeMode / scores。
  - quizState の questionIndex / totalQuestions / currentQuestion / currentChoices / turnItemLog / turnStartScore。
- `browser/utils/playerProgress.js`
  - 各ヒロインのモード解放状態。
  - 各ヒロイン各モードの最高満足度、最高評判、最高売上、最高好感度。
  - エンディング到達履歴。
  - eventSeen / imageSeen の保存枠。
- `browser/utils/itemCollection.js`
  - クイズ候補として出現したアイテムの図鑑状態。

## 後続候補

- 手動ロード画面。
- 個別セーブスロット。
- eventSeen / imageSeen と実際のイベント/ギャラリーUIの接続。
- セーブデータ削除タイミングとタイトルUI文言の精密化。

## 注意

- 本メモは設計メモであり、現時点では保存仕様の正式contractではない。
- core/contract側の仕様変更が必要になった段階で、改めてテストと仕様書を追加する。
