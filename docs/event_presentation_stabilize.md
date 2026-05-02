# EVENT / MEMORIES Presentation Stabilization

**Date:** 2026-05-02  
**Status:** STABILIZED (M-EVENT-PRESENTATION-STABILIZE-1)

---

## 採用方針

### 基本設計

1. **EVENT / MEMORIES 回想の中央立ち絵はヒロイン固定**
   - ナーディルを中央立ち絵で表示する対応は**行わない**
   - 中央立ち絵 = `activeHeroine`（現在アクティブなヒロイン）
   - ナーディル発話は VNBox の顔アイコンで表現する

2. **DailyTalk は話者ベースの立ち絵切替を維持**
   - ナーディル発話時：ナーディル立ち絵表示
   - ヒロイン発話時：ヒロイン立ち絵表示
   - これは既存実装を維持

3. **背景 fallback 仕様維持**
   - 現在のページ背景 → 前ページの背景 → イベント定義の背景
   - `prevEventBackgroundRef` で追跡

4. **暗幕スライド演出維持**
   - 背景切替時にカーテンスライド演出（650ms/120ms/450ms = 1220ms）
   - `bgTransitionPhase`: `"idle" | "covering" | "covered" | "revealing"`

---

## ナーディル中央立ち絵を諦める理由

### 技術的課題

1. **複雑性の増大**
   - ページごとにキャラを切り替えるロジックが複雑
   - ヒロイン・ナーディルの優先順位付けが困難
   - 表情管理がカオスになる

2. **表示カチャカチャ問題**
   - ナーディル発話→ヒロイン発話→ナーディル発話 で立ち絵が頻繁に切り替わる
   - ユーザー体験として不自然

3. **イベント構造とのミスマッチ**
   - `flashback_intro` のような現在/回想をまたぐイベントで制御が困難
   - 背景と立ち絵の整合性を取るロジックが過度に複雑

### デザイン判断

1. **役割分担の明確化**
   | 要素 | 表示内容 |
   |------|----------|
   | 中央立ち絵 | シーンの「主役」（ヒロイン） |
   | VNBox 顔アイコン | 現在の話者（ナーディル or ヒロイン） |

2. **DailyTalk との住み分け**
   - EVENT: ヒロインの愛着を深める場 → ヒロイン固定
   - DailyTalk: ナーディルとの会話劇 → 話者切替

3. **シンプルさの維持**
   - 複雑な条件分岐より予測可能な挙動
   - デバッグ容易性

---

## flashback_intro 表示ルール

### 背景ベースの表示判定

```javascript
const CURRENT_DAY_BACKGROUNDS = new Set([
  'shopExteriorDay',
  'shopExteriorNight',
  'shopInteriorService',
  'shopInteriorWorkshop'
]);

const effectiveBackgroundId = currentEventPage?.backgroundId || 
                               prevEventBackgroundRef.current || 
                               activeEvent.presentation?.backgroundId;

const isMemoryBackground = effectiveBackgroundId && 
                           !CURRENT_DAY_BACKGROUNDS.has(effectiveBackgroundId);

const shouldShowEventHeroine = isFlashbackIntro
  ? (isMemoryBackground || isHeroineSpeaker)  // 回想背景 OR ヒロイン発話
  : !still;  // 通常イベント：常に表示
```

### 期待挙動（hakima_0 の例）

| ページ | 背景 | 話者 | 立ち絵 |
|--------|------|------|--------|
| 1 | shopExteriorDay | ナーディル | **非表示** |
| 2-4 | marketCentral | ナーディル/ハキマ | **表示** |
| 5 | shopExteriorDay | ナーディル | **非表示** |

### 表情制御

```javascript
const displayedExpression = isHeroineSpeaker
  ? (currentPageExpression || eventHeroineExpression)
  : (eventHeroineExpression || 'normal');
```

- ヒロイン発話：ページ表情を使用
- ナーディル発話：直前の表情を維持（無理に変えない）

---

## 背景 fallback 仕様

### 優先順位

1. `currentPage.backgroundId` - 現在のページの背景
2. `prevEventBackgroundRef.current` - 前ページの背景（維持）
3. `activeEvent.presentation.backgroundId` - イベント定義の背景

### 実装

```javascript
const effectiveBackgroundId = currentEventPage?.backgroundId || 
                               prevEventBackgroundRef.current || 
                               activeEvent.presentation?.backgroundId;
```

### 背景 ID 例

**現在パート:**
- `shopExteriorDay` - 工房外観（昼）
- `shopExteriorNight` - 工房外観（夜）
- `shopInteriorService` - 店内
- `shopInteriorWorkshop` - 工房

**回想パート:**
- `marketCentral` - 市場中央
- `palaceCorridor` - 宮殿廊下
- `palaceLab` - 宮殿研究室
- その他イベント固有背景

---

## 暗幕スライド仕様

### タイミング

| フェーズ | 時間 | 説明 |
|----------|------|------|
| covering | 650ms | 暗幕が左から右へ |
| covered | 120ms | 完全暗転（背景切替） |
| revealing | 450ms | 暗幕が右から左へ |
| **合計** | **1220ms** | |

### CSS

```css
transition: 'transform 0.65s ease-in-out'
```

### 実装フロー

```javascript
setBgTransitionPhase("covering");
setTimeout(() => {
  setBgTransitionPhase("covered");
  setEventBackgroundOverride(newBgId);  // 背景切替
  setTimeout(() => {
    setBgTransitionPhase("revealing");
    setTimeout(() => {
      setBgTransitionPhase("idle");
    }, 450);
  }, 120);
}, 650);
```

### 発動条件

- 背景 ID が変更されるページ遷移
- `bgTransitionPhase === "idle"` の場合のみ（連続遷移防止）
- スチルイベントでは発動しない

---

## 今後触る時の注意点

### ⚠️ 絶対やってはいけないこと

1. **ナーディル中央立ち絵の再実装**
   - やる場合は M-EVENT-PRESENTATION-STABILIZE-1 の経緯を再読
   - 複雑性 vs 便益のトレードオフを再考

2. **DailyTalk runtime の改変**
   - DailyTalk は話者ベースの立ち絵切替を維持
   - EVENT とは設計思想が異なる

3. **背景 fallback ロジックの削除**
   - ページに背景定義がない場合に必須
   - 削除すると背景が単色に戻るバグ

4. **暗幕スライドの無効化**
   - 背景切替の視認性向上に必須
   - スチルイベントでは不要（still が背景のため）

### ✅ やってもよいこと

1. **タイミング調整**
   - 暗幕速度のカスタマイズ
   - 表情遷移の平滑化

2. **新規イベント背景の追加**
   - `CURRENT_DAY_BACKGROUNDS` に追加する場合は要検討
   - 現在パートか回想パートかの分類を明確に

3. **flashback_intro 以外のイベント種別の追加**
   - 表示ルールを `activeEvent.kind` で拡張可能

### 📝 関連ファイル

| ファイル | 役割 |
|----------|------|
| `src/App.jsx` | EVENT 表示ロジック（1458-1770 行目） |
| `src/game/eventSystem.js` | `getEventPages()` 背景 ID 保存 |
| `src/data/affectionEvents.js` | イベント定義（backgroundId） |
| `src/data/imageAssets.js` | 背景画像定義 |

### 🧪 検証チェックリスト

新規イベント追加時:

- [ ] 背景 ID は定義済みか？
- [ ] flashback_intro の場合、背景は現在/回想のどちらか？
- [ ] 立ち絵表示は自然か？
- [ ] 暗幕は背景切替時のみ発動するか？
- [ ] スチルイベントの場合、立ち絵は非表示か？

---

## 変更履歴

| 日付 | 修正 | 理由 |
|------|------|------|
| 2026-05-02 | M-EVENT-PRESENTATION-FIX-5 | ヒロイン固定、表情更新制御 |
| 2026-05-02 | M-EVENT-PRESENTATION-FIX-6 | flashback_intro ページベース表示（撤回） |
| 2026-05-02 | M-EVENT-PRESENTATION-FIX-7 | 背景ベース表示（採用） |
| 2026-05-02 | M-EVENT-PRESENTATION-STABILIZE-1 | 方針固定・文書化 |

---

## 結論

**EVENT / MEMORIES は「ヒロインの舞台」**

- 中央立ち絵 = ヒロイン固定
- ナーディルは VNBox 顔アイコンで
- flashback_intro は背景で現在/回想を判定
- 複雑さより予測可能性を優先

この方針は 2026-05-02 時点で安定しており、今後のイベント追加でも踏襲する。
