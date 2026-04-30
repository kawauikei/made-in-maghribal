# V25 Asset Pipeline History

## 背景
- `source_clean` のアップスケール素材導入。
- V13〜V16系で背景除去・顔cropの誤認や疑似ランドマーク問題があった。
- 「顔認識」と言いながら実際は手置き座標（hardcoded coordinates）だった問題が発覚。

## 方針転換
- **InsightFace bbox** を採用候補として検証。
- MediaPipe / OpenCV は今回のアニメ顔（Maghribal assets）には不安定だったため不採用。
- 顔認識結果は即反映せず、PNG / MD / JSON で追跡可能（auditable）にした。

## Face icon
- Dariya current を基準にする方針を撤回。
- Dariya D2 = `302,108 300x300` を新基準候補に設定。
- `v21_all_variants_d2_norm_table.md` を Phase 2b の入力候補として残存。

## Bustup
- `standing_proc` は既存互換として維持。
- `bustup_proc` を新規追加。
- 解像度: `480x640` (3:4 portrait)。
- 管理設定: `standing_normalization_config.json`。
- 状態管理: `bustup_manifest.json` で `asset_manifest.json` から独立管理。

## Phase 2a の完了
- 全37 variant のバストアップ画像を生成完了。
- `common/running_group` は除外。
- `mira/surprise` は confidence `0.53` だが目視により許容。
- `face_proc` / `standing_proc` は未変更（互換性維持）。

## 今後
- **Phase 2b**: face icon D2-Norm の正式反映（`character_asset_config.json` 更新）。
- **Phase 4**: UI側での `bustup_proc` 参照への切り替え。
