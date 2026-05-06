# Contract Specification: C012_BROWSER_SYSTEM_IMPLEMENTATION

## Overview
ブラウザ側での画面制御、演出エンジン、セッション永続化、アセット管理の統合実装を定義する。
本コントラクトは、`C011_RENDER_MODEL` で生成されたモデルを実際にブラウザ上で描画・制御する具象レイヤーである。

## Responsibility
- **画面遷移 (Screen Routing):** TITLE, HEROINE_SELECT, VN, QUIZ, RESULT 等の画面をDOM上で切り替える。
- **演出エンジン (Effects Engine):** 
    - `bgmEngine.js`: BGMの再生、クロスフェード、ボリューム管理。
    - `sfxEngine.js`: 効果音のトリガー、同時再生管理。
    - CSSアニメーションによるターン切り替え演出。
- **セッション永続化 (Persistence):** 
    - `saveData.js`: ゲームの進行状況（現在のターン、ヒロイン、スコア、フラグ）を `localStorage` に保存・復元。
    - `playerProgress.js`: 全プレイを通じた累計実績や解放要素の管理。
- **描画支援 (Rendering Helpers):**
    - `characterVisualProfiles.js`: キャラクター立ち絵の動的な拡大・クロップ位置の適用（CSS変数経由）。
    - `preloadAssets.js`: 画面遷移前に必要なリソースをバックグラウンドで読み込む。
- **UIコンポーネント (Reusable Components):**
    - `hud.js`: 画面上部に表示される共通ステータス（売上等）。
    - `resultStamp.js`: リザルト画面でのスタンプ演出。

## Data Structures

### Save Slot Structure (JSON in LocalStorage)
```json
{
  "version": "1.0",
  "lastUpdated": "ISO_DATE",
  "session": {
    "currentPhase": "PHASE_ID",
    "turn": 1,
    "heroineId": "ID",
    "score": { "revenue": 100, "satisfaction": 80, "reputation": 90 }
  },
  "progress": {
    "unlockedHeroines": ["ID"],
    "goodEndings": ["ID"]
  }
}
```

## Logic Rules
- **View-Source Separation:** 画面ロジック（`.js`）とデザイン（`.css`）を厳密に分離し、デザイン変更がロジックに影響しないようにする。
- **Resolution Safety:** `01_base.css` 等で定義された論理解像度 (720x1280) を基準とし、アスペクト比を維持したままスケーリングする。
- **Audio Guard:** ユーザーの初動インタラクション（タイトルクリック）なしに音声再生を開始しない。
- **Error Handling:** アセット（画像・音声）の読み込み失敗時は、代替表示（プレースホルダ）またはサイレントスキップを行い、ゲーム進行を停止させない。

## Acceptance Criteria
- [ ] TITLEからENDINGまでの全画面遷移がスムーズに行える。
- [ ] ページリロード時に、中断した直前のフェーズ（またはターンの開始点）から再開できる。
- [ ] BGM切り替え時にクロスフェードが適用され、急な音の途切れがない。
- [ ] キャラクターの表情切り替え時に、定義されたスケール・クロップが即座に反映される。
- [ ] ブラウザの「戻る」ボタン等による予期せぬ状態遷移を防止または制御できている。
- [ ] `build-browser-bundle.cjs` により、全モジュールが単一の `bundle.js` に正しく集約される。
