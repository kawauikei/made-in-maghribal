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
- `canContinue`: セーブデータが存在し、続きから可能か
- `lastHeroineId`: 前回選択したヒロインID

#### HEROINE_SELECT 表示モデル
- `heroines`: ヒロイン情報リスト（ID, 名前, 説明, 解放状態, アイコン, 持ち越し値）
- `canSelectExtra`: Extra Routeが選択可能か

#### VN 表示モデル
- `backgroundId`: 背景画像ID
- `standing`: { characterId, expressionId, visualProfile } (中央立ち絵)
- `speaker`: { name, iconAssetId, visualProfile } (話者)
- `text`: 表示本文
- `choices`: 選択肢リスト（テキスト, ID）

#### RHYTHM QUIZ 表示モデル
- `songId`: 再生中の楽曲ID
- `question`: { promptText, choices: [{ itemId, name, iconAssetId }] }
- `progress`: { current, total }
- `stats`: { revenue, satisfaction, reputation }
- `visuals`: { stageType, effectType }

#### TURN RESULT 表示モデル
- `turn`: 対象ターン
- `stats`: { revenue, satisfaction, reputation, totalScore, rank }
- `heroineComment`: ヒロインからの一言
- `unlocks`: 解放されたアイテムや実績情報

## Logic Rules
- `GameSession` インスタンスおよび `SaveData` 状態を入力として受け取り、描画モデルを構築する。
- 立ち絵表示には `characterVisualProfiles.js` で定義されたプロファイル情報を付与し、ブラウザ側での正確な描画を支援する。
- `RenderModel` 自体は変換器であり、副作用（描画実行）を持たない。

## Acceptance Criteria
- [x] TITLE表示モデルを返せる。
- [x] HEROINE_SELECT表示モデルでヒロイン説明、解放状態、持ち越し値を返せる。
- [x] VN表示モデルで背景、中央立ち絵、話者名、話者アイコン、本文を返せる。
- [x] RHYTHM表示モデルで現在問題、2択アイテム、楽曲ID、残り問題数を返せる。
- [x] TURN RESULT表示モデルで売上、満足度、評判、ヒロイン一言、ランクを返せる。
- [x] Render ModelはDOM、CSS、Audio API、public path書き込みに依存しない。
- [ ] **セーブデータの有無に基づき、TITLE画面での「続きから」状態を正確にモデル化できる。**
