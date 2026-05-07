# MadeInMaghribal Event DSL Specification

## 概要
イベントファイルは `content/events/*.event.cjs` に配置し、`tools/sync-events.cjs` を通じてゲームデータに変換されます。

## 基本構造
```javascript
module.exports = {
  id: "EV_ID_STRING",
  title: "イベントタイトル",
  heroineId: "HAKIMA" | "MIRA" | "DARIYA" | "COMMON",
  summary: "概要説明",
  unlock: { type: "always" },
  gallery: {
    category: "heroine" | "event",
    thumbnail: "IMAGE_ID",
    hiddenTitle: "？？？？",
    hiddenSummary: "解放条件..."
  },
  script: [
    { type: "bg", id: "BG_ID", transition: "fade" },
    // ...
    { type: "end", markSeen: true }
  ]
};
```

## 命令一覧

### 演出系
- **bg**: 背景変更
  - `id`: galleryManifest 内の背景ID
  - `transition`: "fade" (省略可)
- **still**: スチル表示
  - `id`: galleryManifest 内のスチルID
- **bgm**: BGM再生
  - `id`: audioManifest 内のBGM ID
  - `fadeMs`: フェード時間 (ms)
- **sfx**: 効果音再生
  - `id`: audioManifest 内のSE ID
- **enter**: キャラクター登場
  - `characterId`: キャラクターID
  - `expression`: 表情ID
  - `position`: "left" | "center" | "right"
- **exit**: キャラクター退場
  - `characterId`: キャラクターID

### メッセージ系
- **line**: セリフ
  - `speakerId`: 発話者ID
  - `text`: 内容
  - `expression`: 表情変更 (省略可)
- **narration**: ナレーション
  - `text`: 内容

### 制御系
- **wait**: 待機
  - `ms`: 時間 (ms)
- **choice**: 選択肢
  - `choices`: `{ text, jump }` の配列
- **label**: ジャンプ先ラベル
  - `id`: ラベルID
- **jump**: 指定ラベルへ移動
  - `id`: ラベルID
- **flag**: フラグ操作 (将来用)
  - `id`: フラグ名
  - `value`: 値
- **end**: イベント終了 (必須)
  - `markSeen`: true の場合既読にする

## 禁止事項
- 画像IDは `galleryManifest.js` に存在するものから選ぶこと
- BGM/SE IDは `audioManifest.cjs` に存在するものから選ぶこと
- 未知の `type` を使用しないこと
- 1つのイベント内でラベルIDを重複させないこと
- ジャンプ先が存在しないラベルを指定しないこと
- `end` 命令を必ず含めること
