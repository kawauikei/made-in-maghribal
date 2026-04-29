# Testing & Verification Policy

Made in Maghribal の品質維持と、検証コスト（時間・リソース）のバランスを取るためのポリシーを定義します。

## 1. 検証レベル (Verification Levels)

変更内容に応じて、実行すべきテストの範囲を限定します。

| レベル | 対象内容 | 実行すべきアクション |
| :--- | :--- | :--- |
| **Level 0** | docs / text / データのみ | `npm test` のみ、または目視確認。build/E2E不要。 |
| **Level 1** | ロジック小変更 | `npm test` + 関連する単体テスト。build/Full E2E不要。 |
| **Level 2** | UI小修正 | `npm test` + 対象のPlaywrightテスト。buildは必要時のみ。 |
| **Level 3** | 重要導線 (保存/遷移/Menu) | `npm test` + 対象E2E + mobile(390x780)確認。 |
| **Level 4** | リリース / 節目確認 | `npm test` + `npm run build` + `npm run test:e2e` + 全環境確認。 |

---

## 2. E2E 失敗時の対応ルール

Playwright 等の E2E テストが失敗した場合、無限ループを防ぐため以下のルールに従います。

1.  **特定**: 失敗したテスト名と原因（Timeout, Assertion等）を特定する。
2.  **局所化**: まず対象のテスト1本のみ（`-g` オプション等）を実行し、再現性を確認する。
3.  **最小修正**: 修正対象を可能な限り1ファイルに絞る。`App.jsx` を変更する場合は理由を明記する。
4.  **ループ制限**: 修正ループは最大 1〜2 回までとし、解決しない場合は詳細を報告して停止（Safety Stop）する。
5.  **クリーンアップ**: 実行後に生成された `test-results/` は必ず削除する。
6.  **確認**: コミット前に `git diff --stat` で意図しない破壊的変更がないか確認する。

---

## 3. Public Build & Push ルール

GitHub Pages 用の `public/` ディレクトリ（nested repository）の運用ルールです。

*   **更新頻度**: 毎タスクの build/push は必須ではない。大きな節目や公開確認が必要な時のみ行う。
*   **構造維持**: `public/.git` は nested repository として機能しているため、削除や移動を禁止する。
*   **ビルド管理**: 
    - Build query hash はソースのルートハッシュに基づく。
    - `public` ポインタの更新後にルートハッシュが変化しても、再ビルドループ（追いかけっこ）は行わない。
*   **整合性**: `public/` への push 前に、必ず root と public 両方の `git status` が clean であることを確認する。
