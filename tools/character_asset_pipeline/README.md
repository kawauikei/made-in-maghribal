# Character Asset Preprocessing Tool

このディレクトリには、ヒロインの立ち絵や顔アイコンをゲーム用に最適化するためのツールと設定が含まれます。

## 運用フロー

1. **ソース画像の用意**: 背景透過済みのヒロイン画像を `source/characters/[heroine_id]/` に配置します。
2. **設定の作成**: `character_asset_config.json` を作成し、各ポーズや表情の切り出し位置を定義します。
3. **処理の実行**: `npm run assets:characters` を実行して画像を生成します。
4. **確認とデプロイ**: 生成された画像が `public/characters/` に配置されるので、実機で確認します。

## 設定項目 (character_asset_config.json)

- `faceCrop`: 顔アイコン（正方形）として切り出す座標とサイズ。
- `standing`: 立ち絵のスケールやオフセット補正。
- `background`: 背景透過処理の要否（手動修正推奨）。

## 注意事項
- 本ツールはローカル開発環境でのみ使用します。
- 生成された WebP 画像のみを `public/` に含め、ソース画像（大容量のPNG等）は Git 管理対象外とすることを推奨します。
