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

## M-UI-SPEAKER-FOCUS: Character Dialogue Presentation System

- **ステータス**: TODO（設計完了）
- **優先度**: Medium（UX向上）
- **追加日**: 2026-05-01

### 目的

小画面（390px幅）での二人会話劇において、話者と聞き手の役割を視覚的に強調し、UIの視認性と物語の没入感を向上させる。

### 想定機能

- VNBoxの `speaker` 名に基づき、立ち絵の `opacity`, `z-index`, `height`, `position` を自動または宣言的に切り替える仕組み。
- スチル（Still）表示中は立ち絵を自動で非表示またはフェードアウトさせる演出。
- 画面左右の立ち絵領域に対するクリックイベントの管理。

### 実装方針

- `src/ui/VNBox.jsx` または親コンポーネントで話者状態を管理する。
- CSS Transition を活用し、話者切り替え時のサイズ変更・フェードをスムーズに行う。
- `HeroineDisplay` コンポーネントを拡張し、`isFocused`, `isBackground` 等のプロップでスタイルを制御できるようにする。

### 参照

- `docs/current_design.md` — 会話劇の立ち絵演出方針 (話者フォーカス制)
- `src/App.jsx` (HeroineDisplay) — 既存の立ち絵コンポーネント

---

## M-UI-VNBOX-POLISH: VNBox Speaker / Narration Display Polish

- **ステータス**: 実施済み
- **優先度**: 中〜高（可読性向上）
- **追加日**: 2026-05-01
- **完了日**: 2026-05-01

### 目的

VNBox内の話者表示を整理し、ナレーション・キャラ台詞・選択肢UIに適した表示にする。

### 成果

- ナレーション無記名化、テキスト上詰めイタリック表示の実装。
- キャラ台詞時の顔アイコン表示サポート（`speakerId` 連動）。
- `VNBox` 内部での `getFaceIcon` 解決。

---

## M-UI-TRANSITION-POLISH: Screen Transition / UI Reveal Polish

- **ステータス**: TODO（未着手）
- **優先度**: 中（UX向上）
- **追加日**: 2026-05-01

### 目的

画面転換・ボタン表示・選択肢表示にフェードインや軽い出現演出を追加し、VN/ゲームとしての手触りを改善する。

### 方針

- **ボタン / 選択肢のフェードイン**: VNBox読了後のボタン等は、`opacity` と `translateY` を用いた短いフェードイン演出で出現させる。
- **画面転換の強化**: 既存の `screen-enter` アニメーションを洗練させ、背景のクロスフェードやUIスタックの遅延表示を検討する。
- **入力可能状態の明示**: ボタン出現時に軽い `glow` や `scale` 変化を加え、プレイヤーの視線を誘導する。

### 参照

- `src/App.jsx` — `renderThemeStyles` 内のアニメーション定義
- `src/ui/VNBox.jsx`
- `src/ui/PrologueScreen.jsx`
- `src/ui/IntroScreen.jsx`

---

## M-UI-VNBOX-LOWER-DOCK: VNBox Lower Dock Polish

- **ステータス**: 実施済み
- **優先度**: 中〜高（可視性向上）
- **追加日**: 2026-05-01
- **完了日**: 2026-05-01

### 目的

INTRO / PROLOGUE などのVN画面で、VNBoxを下部に半固定し、キャラクター立ち絵を見せる領域とテキストUI領域を明確に分ける。

### 成果

- ヒント表示を VNBox 内部（左下）に統合し、画面下部の縦積みを整理。
- 下部ドックのレイアウト（マージン、ボタンサイズ）の統一。
- 390px幅での表示安定化。

---

## M-UI-SELECTION-PREVENTION: Touch Interaction / Selection Prevention Polish

- **ステータス**: TODO（未着手）
- **優先度**: 中〜高（基本品質）
- **追加日**: 2026-05-01

### 目的

ゲーム中に、クリック・タップしたつもりがテキスト選択や画像ドラッグになってしまう問題を防ぐ。

### 方針

- **テキスト選択禁止**: `.game-root` 全体または `VNBox` / `Button` 等に `user-select: none` を適用。
- **画像ドラッグ禁止**: `HeroineDisplay` 等の画像要素に `draggable={false}` および `-webkit-user-drag: none` を適用。
- **タッチ操作の最適化**: ボタンやカードに `touch-action: manipulation` を指定し、ズーム遅延を抑制。
- **例外管理**: ログ画面や開発パネルなど、コピーが必要な箇所は選択可能のまま維持。

### 参照

- `src/ui/theme.js` または `renderThemeStyles`
- `src/ui/VNBox.jsx`
- `src/App.jsx` (HeroineDisplay)

---

## M-QUIZ-PROMPT-TUNING: Quiz Prompt / Difficulty Tuning

- **ステータス**: TODO（未着手）
- **優先度**: 中（納得感向上）
- **追加日**: 2026-05-01

### 目的

クイズ問題文と分類ルールの自然さを見直し、プレイヤーの納得感を上げる。

### 方針

- **自然な語彙の採用**: 金属の色は金色/銀色/銅色、紫/青/緑などは宝石や薬液として表現し、不自然な組み合わせ（「紫色の鉄」など）を避ける。
- **itemType連動**: アイテムの種類ごとに自然な色の語彙を整理し、問題文を生成する。
- **レビュー**: 代表的な問題文を一覧出力し、目視による文言レビューを実施。

---

## M-UI-VN-CHOICE-POLICY: VN Choice / Bottom Dock Interaction Policy

- **ステータス**: TODO（設計検討）
- **優先度**: 中（UX一貫性）
- **追加日**: 2026-05-01

### 目的

将来的なVN選択肢UIに備え、VNBox・選択肢・単一進行ボタンの配置ルールを整理する。

### 方針

- **ボタン配置**: 単一ボタンの場合は画面中央付近、複数選択肢の場合はVNBox上のドック領域に横並びで配置する案を検討。
- **アクセシビリティ**: 選択肢が1つの場合は領域全体を入力可能にするなど、プレイヤーに押す場所を探させない設計を目指す。

---

## M-RHYTHM-UI-0: Quiz Rhythm UI Layout Plan

- **ステータス**: TODO（設計着手）
- **優先度**: 中（新機能準備）
- **追加日**: 2026-05-01

### 目的

将来の音ゲー化（リズムクイズ）に備えて、QUIZ画面のUI配置を検討・設計する。

### 方針

- **画面構成**: 背景に `shopInteriorService` を表示し、中央にビートレーン、下部にアイテム選択カードを配置するレイアウトを設計。
- **リズム連携**: BGMを止めず、事前解析済みビートマップと同期させるための構造を検討。

---

> 新規エントリを追加する場合は、上記と同じフォーマットで `## <ID>: <タイトル>` セクションを追加してください。
