# Contract Specification: C005_AUDIO_MANIFEST

## Overview
BGM/SE、ヒロイン別曲、Turn1固定曲、extra曲、Free Play対象、Ending用途をmanifest化する。

## Responsibility
- 全オーディオアセット（BGM, SE）の管理。
- キャラクターやシーンに応じた楽曲割り当ての定義。
- エンディング種別（Normal / Good）に応じた楽曲の定義。
- Free Playモードでの楽曲解放フラグの管理。

## Data Structures

### Audio Resource Object
全ての音声リソースは以下のオブジェクト形式、またはパスを含む構造で定義される。
- `id`: 文字列 (一意識別子)
- `path`: 文字列 (public/ からの相対パス)
- `title`: 文字列 (任意。表示用タイトル)

### BGM Categories
- **System:** `main01_title`, `main02_shop`, `main03_puzzle`
- **Heroine Themes:** `BGM_THEME_{HEROINE}`
- **Game Songs:** `BGM_GAME_{HEROINE}_{N}` (1-4)
- **Ending Songs:** `BGM_ED_{HEROINE}_{TYPE}` (NORMAL/GOOD)
- **Extra:** その他演出用BGM (mood属性を含む)

### SE Categories
- `SE_QUIZ_{NAME}`: クイズ演出（正解、不正解、カウントダウン等）
- `SE_UI_{NAME}`: UI操作（決定、キャンセル、カーソル等）
- `SE_DAY_END`: 1日の終了演出

### Fixed Songs
- **Turn 1:** 全員 `main03_puzzle` 固定。

### Heroine Song Requirements
- 各ヒロインに対し、テーマ1曲、ゲーム曲4曲、エンディング曲2曲を定義する。

## Acceptance Criteria
- [ ] main01_title, main02_shop, main03_puzzle を定義する。
- [ ] 各ヒロインに theme 1曲, game 4曲, ending 2曲を定義する。
- [ ] Turn1固定曲 main03_puzzle が存在する。
- [ ] ending normal/good の対応をmanifestで明示する。
- [ ] extra BGMをmood付きで定義する。
- [ ] SEカテゴリ quiz/ui/day_end が空でない。
- [ ] Free Play対象可否をmanifestで制御できる。
