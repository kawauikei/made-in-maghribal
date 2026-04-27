# Made in Maghribal - Antigravity Rules

## 開発フローと責任範囲
実装の変更は常に `src/` 配下のソースコードに対して行い、`build.bat` または `npm run build` を実行して成果物を更新してください。

### 直接編集してはいけないファイル (生成物)
- `public/main.js`: GitHub Pages / loader 用のビルド成果物。
- `main.canvas.jsx`: Gemini Canvas 直貼り用のビルド成果物。

### 編集対象
- `src/` 配下の全ファイル
- `public/` 配下の素材資産 (`characters/`, `items/`, `data/` など)
- `loader.js`: 必要に応じてローダー設定を変更する場合のみ

## ディレクトリ構成
- `src/`: ソースコード
- `public/`: 静的資産および `main.js` (デプロイ対象)
- `tools/`: ビルド補助スクリプト (`post-build.js`)
- `dist/`: ビルド中間生成物 (Git管理対象外)

## ビルド方針
- `main.js` は React JSX Runtime を含めない軽量 ES module 形式 (`React.createElement` 使用) で出力する。
- `main.canvas.jsx` は Gemini Canvas 上で人間が読み書きしやすいよう、JSX を保持した単一ファイル形式で出力する。
