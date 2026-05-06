# Contract Specification: C011_RENDER_MODEL

## Overview

現在の実装範囲では、VNシナリオステップおよびリズムクイズ問題を、ブラウザDOMに依存しない画面表示用JSONへ変換する。

TITLE、HEROINE_SELECT、TURN_RESULT の表示モデルは現ソースでは未実装であり、本コントラクトの完了済み範囲には含めない。必要になった段階で、仕様、実装、テストを同時に追加する。

## Responsibility

- VN表示に必要な背景、立ち絵、話者、本文、選択肢を描画モデルへ変換する。
- RHYTHM QUIZ表示に必要な楽曲ID、問題文、2択アイテム、進行状況、スコアを描画モデルへ変換する。
- ブラウザ環境（DOM、CSS、Canvas、Audio API）から分離された純粋な変換ロジックとして動作する。

## Data Structures

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

## Logic Rules

- `RenderModel` は変換器であり、副作用を持たない。
- DOM、CSS、Canvas、Audio API、`public/` への書き込みに依存しない。
- VN話者は `src/data/characters.cjs` の `CHARACTERS` から解決する。
- VN話者表情が未指定の場合、話者アイコンIDの表情部分は `normal` とする。
- VN選択肢が未指定の場合、`choices` は `[]` とする。

## Out of Scope

以下は現ソースでは未実装のため、本コントラクトの完了済み範囲から除外する。

- TITLE表示モデル。
- HEROINE_SELECT表示モデル。
- TURN_RESULT表示モデル。
- セーブデータ有無に基づくTITLE画面の「続きから」状態モデル化。
- ブラウザ具体層のDOM生成、CSS適用、Audio制御。

## Acceptance Criteria

- [x] VN表示モデルで背景、中央立ち絵、話者名、話者アイコン、本文、選択肢を返せる。
- [x] VN表示モデルで話者または立ち絵が無い場合に `null` を返せる。
- [x] RHYTHM表示モデルで現在問題、2択アイテム、楽曲ID、進行状況、スコアを返せる。
- [x] Render ModelはDOM、CSS、Audio API、public path書き込みに依存しない。
- [ ] TITLE / HEROINE_SELECT / TURN_RESULT の表示モデルを正式に扱う場合は、仕様、実装、テストを追加する。
