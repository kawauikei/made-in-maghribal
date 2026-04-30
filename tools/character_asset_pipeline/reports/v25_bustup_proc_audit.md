# V25 Asset Pipeline Audit Report (Phase 2a: Bustup Only)

## 1. 概要 (Executive Summary)
Phase 2a において、新規格 3:4 バストアップ画像 (`bustup_proc`) の全量生成を完了しました。既存の顔アイコン (`face_proc`) および全身立ち絵 (`standing_proc`) への副作用を完全に排除し、新規資産のみを独立した管理体系で追加しました。

- **実施日時**: 2026-04-30
- **実施内容**: `face_normalization.py --bustup-only` による一括生成
- **主要成果**: 480x640 portrait 資産の完備

## 2. 生成統計 (Generation Statistics)
| 項目 | 統計 | 備考 |
| :--- | :--- | :--- |
| **総バリアント数** | 38 | `character_asset_config.json` 定義数 |
| **生成成功数** | 37 | 4 ヒロインの全バリアント |
| **スキップ/失敗数** | 1 | `common/running_group` |
| **寸法チェック** | **PASS** | 全 37 枚が 480x640 であることを検証済 |

### 除外対象の詳細
- **`common/running_group`**: グループ集合写真（横長）のため、単体 portrait 用の V25 バストアップ正規化ロジック（InsightFace + Target Height 準拠）から除外しました。

## 3. 信頼度監査 (Audit Log)
InsightFace による顔検出信頼度が基準値 (0.6) を下回ったバリアントは以下の 1 件です。

| Variant | Confidence | 状態 | 判定 |
| :--- | :--- | :--- | :--- |
| **`mira/surprise`** | 0.53 | 目視確認済 | 許容範囲内。フレーミングに大きな崩れなし。 |

## 4. 整合性検証 (Integrity Check)

### Public Submodule (Assets)
`git -C public status --short` の結果、既存ファイルへの変更が皆無であることを確認。
- **`face_proc/`**: **変更なし** (LEGACY / V16.3 状態を維持)
- **`standing_proc/`**: **変更なし** (LEGACY / V16.3 状態を維持)
- **`bustup_proc/`**: **新規追加のみ**

### Manifest (Status Tracking)
設計通り、状態管理ファイルを分離しました。
- **`asset_manifest.json`**: **V16.3 維持**。既存の顔/全身トラックを保護。
- **`bustup_manifest.json`**: **V25 管理**。新規バストアップの進捗を独立して記録。

## 5. ロールバック手順 (Rollback)
- **資産の削除**: `public/characters/*/bustup_proc/` ディレクトリを削除。
- **管理の破棄**: `tools/character_asset_pipeline/bustup_manifest.json` を削除。
- **スクリプトの復元**: `face_normalization.py` の `--bustup-only` 追加分を revert。

## 6. 次フェーズへの提言
- **Phase 2b (Face Icon D2-Norm)**: `character_asset_config.json` の `faceCrop` 値を精査し、正式採用が確定した段階で `face_proc` の一括再生成を行う。
- **Phase 4 (UI Reflection)**: `getHeroineAsset` に `bustup_proc` 優先オプションを追加。HeroineDisplay 画面から試験導入を開始する。

---
**監査者**: Antigravity
**監査資料**: [v25_all_variants_bustup_contact_sheet.jpg](./v25_all_variants_bustup_contact_sheet.jpg)
