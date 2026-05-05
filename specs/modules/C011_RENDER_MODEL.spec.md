# Contract Specification: C011_RENDER_MODEL

## Overview
現在状態（GameSession等）から画面表示用JSONを作る。ブラウザDOM実装には依存しない。

## Responsibility
- ゲームの論理状態（Session, Data）をUIコンポーネントが消費しやすい「描画モデル（JSON）」に変換する。
- フェーズに応じた必要な表示情報の集計。
- 立ち絵と話者アイコンの整合性確保。
- ブラウザ環境（DOM, CSS, Canvas, Audio API）から完全に分離された純粋な変換ロジック。

## Data Structures

### Render Models

#### TITLE 表示モデル
- `title`: ゲームタイトル
- `backgroundId`: 背景画像ID
- `canContinue`: 続きから可能か

#### HEROINE_SELECT 表示モデル
- `heroines`: ヒロイン情報リスト（ID, 名前, 説明, 解放状態, アイコン）
- `canSelectExtra`: Extra Routeが選択可能か

#### VN 表示モデル
- `backgroundId`: 背景画像ID
- `standing`: { characterId, expressionId } (中央立ち絵)
- `speaker`: { name, iconAssetId } (話者)
- `text`: 表示本文
- `choices`: 選択肢リスト（テキスト, ID）

#### RHYTHM QUIZ 表示モデル
- `songId`: 再生中の楽曲ID
- `question`: { promptText, choices: [{ itemId, name, iconAssetId }] }
- `progress`: { current, total }
- `stats`: { revenue, satisfaction, reputation }

#### TURN RESULT 表示モデル
- `turn`: 対象ターン
- `stats`: { revenue, satisfaction, reputation, totalScore }
- `heroineComment`: ヒロインからの一言

## Logic Rules
- `GameSession` インスタンスを入力として受け取り、描画に必要な情報をマスタデータから引きいて構築する。
- 話者がいない（地の文）場合、`speaker` は null または empty になる。
- 中央立ち絵と話者アイコンが一致しないケース（例: ナーディルが喋っているが画面にはヒロインがいる）を正しく表現できる。

## Acceptance Criteria
- [ ] TITLE表示モデルを返せる。
- [ ] HEROINE_SELECT表示モデルでヒロイン説明、解放状態を返せる。
- [ ] VN表示モデルで背景、中央立ち絵、話者名、話者アイコン、本文を返せる。
- [ ] RHYTHM表示モデルで現在問題、2択アイテム、楽曲ID、残り問題数を返せる。
- [ ] TURN RESULT表示モデルで売上、満足度、評判、ヒロイン一言を返せる。
- [ ] Render ModelはDOM、CSS、Audio API、public path書き込みに依存しない。
