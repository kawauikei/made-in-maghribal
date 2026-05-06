# Contract Specification: C011_RENDER_MODEL

## Overview

現在の実装範囲では、TITLE状態、HEROINE_SELECT候補、VNシナリオステップ、リズムクイズ問題、TURN_RESULT情報を、ブラウザDOMに依存しない画面表示用JSONへ変換する。

ブラウザ具体層への全面接続は別作業とし、本コントラクトでは純粋な表示モデル生成を扱う。

## Responsibility

- TITLE表示に必要なタイトル、背景、続きから可否、前回ヒロイン情報を描画モデルへ変換する。
- HEROINE_SELECT表示に必要なヒロイン候補、ルート解放状態、持ち越し値を描画モデルへ変換する。
- VN表示に必要な背景、立ち絵、話者、本文、選択肢を描画モデルへ変換する。
- RHYTHM QUIZ表示に必要な楽曲ID、問題文、2択アイテム、進行状況、スコアを描画モデルへ変換する。
- TURN_RESULT表示に必要なターン、スコア、差分、ランク、ヒロインコメント、解放情報を描画モデルへ変換する。
- ブラウザ環境（DOM、CSS、Canvas、Audio API）から分離された純粋な変換ロジックとして動作する。

## Data Structures

### TITLE Render Model

- `title`: ゲームタイトル。未指定時は `Made in Maghribal`。
- `backgroundId`: 背景画像ID。未指定時は `AS_BG_TITLE`。
- `canContinue`: `saveSummary` が存在する場合は `true`。
- `lastHeroineId`: `saveSummary.selectedHeroineId`。未指定時は `null`。
- `saveSummary`: 呼び出し側から渡された保存サマリ。未指定時は `null`。

### VN Render Model

- `backgroundId`: 背景画像ID。未指定時は `AS_BG_SHOP`。
- `standing`: 中央立ち絵。存在しない場合は `null`。
  - `characterId`: キャラクターID。
  - `expressionId`: 表情ID。
- `speaker`: 話者情報。話者がいない場合、または不明な話者IDの場合は `null`。
  - `name`: 話者名。
  - `iconAssetId`: `AS_IC_{speakerId}_{expression}` 形式のアイコンID。
- `text`: 表示本文。
- `choices`: 選択肢配列。未指定時は空配列。

### Rhythm Quiz Render Model

- `songId`: `session.currentSong`。
- `question`: 現在問題。
  - `promptText`: 問題文。
  - `choices`: 正解アイテムと不正解アイテムの2択。
- `progress`: 進行状況。
  - `current`: `session.turnProgress`。未指定時は `0`。
  - `total`: 現行実装では `10`。
- `stats`: `session.scores`。

### HEROINE_SELECT Render Model

- `heroines`: ヒロイン候補配列。
  - `heroineId`: ヒロインID。
  - `name`: 表示名。
  - `title`: 肩書き。
  - `description`: 説明文。
  - `iconAssetId`: アイコンID。未指定時は `null`。
  - `routeModes`: `normal` と `long_history` の選択可否。
  - `carryover`: 持ち越し情報。未指定時は `null`。
- `canSelectExtra`: いずれかのヒロインで `long_history` が解放済みなら `true`。

### TURN_RESULT Render Model

- `turn`: 対象ターン。
- `stats`: スコア情報。
  - `revenue`
  - `satisfaction`
  - `reputation`
  - `delta`: 開始時スコアとの差分。
  - `totalScore`: revenue + satisfaction + reputation。
  - `rank`: ランク。未指定時は `null`。
- `heroineComment`: ヒロインコメント。未指定時は空文字。
- `unlocks`: 解放情報配列。未指定時は空配列。

## Logic Rules

- `RenderModel` は変換器であり、副作用を持たない。
- DOM、CSS、Canvas、Audio API、`public/` への書き込みに依存しない。
- TITLEモデルは保存データを直接読み込まない。呼び出し側から渡された `saveSummary` を使う。
- HEROINE_SELECTモデルは進捗を直接読み込まない。呼び出し側から渡された `progressSummary` を使う。
- VN話者は `src/data/characters.cjs` の `CHARACTERS` から解決する。
- VN話者表情が未指定の場合、話者アイコンIDの表情部分は `normal` とする。
- VN選択肢が未指定の場合、`choices` は `[]` とする。

## Out of Scope

以下は本コントラクトの完了済み範囲から除外する。

- ブラウザ具体層での各Render Model全面利用。
- ブラウザ具体層のDOM生成、CSS適用、Audio制御。

## Acceptance Criteria

- [x] TITLE表示モデルでタイトル、背景、続きから可否、前回ヒロインID、保存サマリを返せる。
- [x] HEROINE_SELECT表示モデルでヒロイン説明、ルート解放状態、持ち越し値を返せる。
- [x] VN表示モデルで背景、中央立ち絵、話者名、話者アイコン、本文、選択肢を返せる。
- [x] VN表示モデルで話者または立ち絵が無い場合に `null` を返せる。
- [x] RHYTHM表示モデルで現在問題、2択アイテム、楽曲ID、進行状況、スコアを返せる。
- [x] TURN_RESULT表示モデルで売上、満足度、評判、差分、総合値、ランク、ヒロイン一言、解放情報を返せる。
- [x] Render ModelはDOM、CSS、Audio API、public path書き込みに依存しない。
- [ ] ブラウザ具体層から各Render Modelを段階的に利用する。
