# Future Candidates / Technical Debt

実装を保留にしているタスク、将来の候補機能、技術的負債を追跡します。
各エントリには優先度・ステータス・詳細な仕様候補を記載します。

---

## M-DEVTOOLS-1: Debug / QA Control Panel

- **ステータス**: TODO（未着手）
- **優先度**: Low（開発効率化）
- **追加日**: 2026-04-30

### 目的

手動検証の負担を減らし、以下の回帰確認を効率化するための開発用デバッグパネルを追加する。
- ENDING / EVENT 表示確認
- routeMode（normal / long_history）切替確認
- saveData の状態確認・リセット
- affection / threshold 操作による各シナリオへのジャンプ

### 想定機能

| カテゴリ | 機能 |
|---|---|
| ゲーム状態 | ターン / 営業回数の直接変更 |
| ゲーム状態 | 親密度（affection）の直接変更 |
| ゲーム状態 | reputation / workshopState の変更 |
| クイズ | クイズ即スキップ |
| クイズ | 全問正解 / 全問不正解で完了 |
| イベント | 任意イベントの強制発火 |
| イベント | seenEventIds のリセット / 個別追加 |
| ルート | normal / long_history の切替 |
| 画面遷移 | FINAL_RESULT / ENDING へ即ジャンプ |
| ヒロイン | 任意ヒロインへの切替 |
| セーブ | セーブ状態の表示 / 削除 |
| デバッグ情報 | 現在の screen / state の表示 |

### 実装方針

- **今すぐ実装しない**（仕様確定後に別タスクとして着手）
- production では非表示にする
- `import.meta.env.DEV` によるガードを必須とする
- UI の配置候補：
  - Options 画面内の隠し項目（長押し or 特定キー入力で表示）
  - または右下の小さな「Dev」ボタン（画面上に常駐）
- saveData との整合性を保ち、Dev操作後も通常ゲームフローを壊さないこと
- UI 本編とは独立したコンポーネント（`DevPanel.jsx` 等）として分離することを推奨

### 参照

- `src/App.jsx` — screen state / activeHeroineId / affection 等の state 管理
- `src/game/saveData.js` — セーブデータ構造
- `src/data/affectionEvents.js` — イベント定義
- `src/data/endings.js` — エンディング定義

---

> 新規エントリを追加する場合は、上記と同じフォーマットで `## <ID>: <タイトル>` セクションを追加してください。
