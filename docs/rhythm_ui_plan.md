# Made in Maghribal / Rhythm UI Layout Plan (M-RHYTHM-UI-0A)

## 1. 基本方針 (Basic Policy)

*   **クイズの基本構造維持**: クイズの基本行動は「2択選択」のまま変更しない。リズム要素は「回答タイミングの指示」や「演出」として機能させる。
*   **BGMの連続性**: リズムUI導入中もBGMは停止させず、楽曲のテンポ（BPM）に同期したプレイ体験を提供する。
*   **将来的な拡張性**: 将来的には事前解析済みのbeatmap（タイミングデータ）を使用することを前提とする。
*   **非実装範囲**: 本ドキュメントの段階では、beatmapの自動生成ロジックや、複雑なリズム判定（Perfect/Great等）の実装は行わない。
*   **視線誘導の最適化**: まずは画面配置とユーザーの視線誘導を設計し、リズム要素がクイズの邪魔にならないバランスを確立する。

## 2. 390x780 Logical Canvas 前提 (Technical Constraints)

*   **論理キャンバスの維持**: 390x780の論理キャンバスサイズを厳守する。
*   **変形禁止**: `visualViewport.height` 等による内部キャンバスの動的な変形は行わず、外側のCSS `scale` プロパティでのフィッティングを維持する。
*   **スクロール禁止**: Core Game UI（クイズ・会話画面等）における縦スクロールは一切禁止する。
*   **表示枠の限定**: 極端に低い表示枠（アスペクト比が著しく異なる環境）はサポート対象外として割り切る。

## 3. QUIZ画面レイアウト案 (Layout Design)

視線移動を **「上（出題） → 中央（リズム/予兆） → 下（回答）」** の垂直フローに整理する。

*   **上部〜中央上 (Prompt Area)**:
    *   Prompt Bubble: 左端・読み始め位置を固定。
    *   Customer Silhouette / Text: 左寄せを維持し、視線の起点を安定させる。
*   **中央 (Rhythm / Feedback Area)**:
    *   Beat Lane / Timing Indicator: 画面中央に配置。流れてくるノートやタイミングゲージを表示。
*   **下部 (Choice Area)**:
    *   2択 Item Cards: 画面下部に配置。
    *   レイアウト: 左右2カラム（グリッド）を維持。

## 4. Rhythm UI Candidates (UI候補)

以下の要素を検討対象とする（現時点では実装しない）:

*   **Horizontal Beat Lane**: 画面中央を横切るノートレーン。
*   **Circular Timing Ring**: アイテムカードや中央に表示される円形のタイミングインジケーター。
*   **Small Pulse Marker**: Prompt Bubbleの付近で鼓動するように点滅するビートマーカー。
*   **Beat Dots above Choices**: 選択肢カードの上部でカウントダウンするように並ぶドット。
*   **Answer Enable Timing Indicator**: 「今が押し時」であることを示す視覚的な合図。

## 5. 次回以降の実装タスク候補 (Future Roadmap)

*   **M-RHYTHM-UI-0B**: QUIZ画面内での静的レイアウトモック作成。
*   **M-RHYTHM-UI-1**: 視覚的なビートレーン表示のみの実装。
*   **M-RHYTHM-UI-2**: 回答有効タイミング（Answer Enable Delay）と予兆演出の実装。
*   **M-RHYTHM-BEATMAP-1**: BGM解析によるオフラインbeatmap生成ツールの作成。

---
*Created: 2026-05-01*
