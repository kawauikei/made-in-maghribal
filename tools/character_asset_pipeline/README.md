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

## 管理方針 (Asset Tracking Policy)

本プロジェクトでは、アセットの再現性と公開サイズの両立のため、以下の分担で Git 管理を行っています。

1. **Root リポジトリ (本リポジトリ)**:
   - `tools/character_asset_pipeline/source/` 配下の **ソース画像（JPEG等）** を管理します。
   - これにより、開発環境をクローンした際にいつでも同一品質の画像を再生成できることを保証します。
   - 大容量化が顕著な場合は Git LFS の導入を検討します。

2. **Public リポジトリ (gh-pages用)**:
   - `public/characters/` 配下の **配信・加工済アセット（PNG/WebP等）** を管理します。
   - ゲーム実行に必要な軽量なアセットのみを含めます。

## 注意事項
- 本ツールはローカル開発環境でのみ使用します。
- ソース画像を追加した際は、必ず本リポジトリで `git add` して追跡対象に含めてください。
