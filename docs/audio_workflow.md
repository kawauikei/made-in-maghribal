# Audio Workflow

Made in Maghribal における音声素材（BGM/SFX）の追加、管理、検証のワークフローを定義します。

## 1. BGM 追加ワークフロー

### 1.1 素材の配置
BGM素材は以下のディレクトリに配置します。

*   **メインBGM**: `public/audio/bgm/main/`
*   **ヒロイン別BGM**: `public/audio/bgm/[heroine_name]/`
*   **共通イベントBGM**: `public/audio/bgm/extra/`

### 1.2 命名規則
*   ファイル名は小文字英数字を使用し、アンダースコアまたはハイフンで区切ります。
*   原則として `.mp3` と `.mp4` (AAC) のペアを用意します。

### 1.3 マニフェスト登録 (`src/data/tracks.js`)
`TRACKS` オブジェクトに新しいトラックを追加します。

```javascript
"track_id": {
  id: "track_id",
  src: "audio/bgm/.../filename.mp3",
  loop: true,
  title: "表示名",
  category: "カテゴリ名 (例: 共通イベントBGM)"
}
```

*   **track_id**: `extra_joy_1` のように用途がわかるIDを指定します。
*   **category**: Sound Test 等でグループ表示するために使用します。

### 1.4 Sound Test での確認
`src/data/tracks.js` に登録されたBGMは、自動的に設定画面の「サウンド設定 Test (Sound Test)」に表示されます。

---

## 2. 用途タグと演出

イベントからBGMを指定する際は、以下のタグを参考に演出意図を統一します。

*   `joy`: 喜び、明るい
*   `fun`: 楽しさ、コミカル
*   `sorrow`: 悲しみ、しんみり
*   `anger`: 怒り、緊張
*   `surprise`: 驚き、急展開
*   `romantic`: 恋愛、甘い
*   `tension`: 緊迫、シリアス
*   `mystery`: 不思議、謎
*   `calm`: 平穏、日常

---

## 3. 検証項目

新しい音声を追加した際は、以下の項目を確認します。

1.  **パスの妥当性**: `public/` 内の実ファイルパスと一致しているか。
2.  **IDの重複**: 他のトラックとIDが重なっていないか。
3.  **mp3/mp4 ペア**: 両方の形式が揃っているか（ブラウザ互換性のため）。
4.  **再生確認**: Sound Test で実際に再生し、音量設定が反映されるか。
5.  **ループ設定**: BGMとして適切なループ設定になっているか。
