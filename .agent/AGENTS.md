# Project Agent Rules

このプロジェクトは `C:\Users\khqv\.gemini\GEMINI.md` をグローバル正本とし、この `.agent` 配下をプロジェクト固有の補助ルールとして扱います。

## Standard Policy

- Agent-First ContractHub workflow を使う。
- Agent が実装し、KawazuContractHub が blueprint / registry / verify / finalize を管理する。
- KawazuDevHelper は軽量解析・構文確認・モデル状態確認・diff review に限定する。

## Do Not

- `.kawazu/construct/contracts.json` を直接編集しない。
- contract作業中に build_queue が許可した4点セット以外を触らない。
- package.json / public / browser / tools / integration は required contract 完了前に触らない。

## Contract Bundle

1 contract は必ず以下の4点セットで扱う。

- spec
- testspec
- source
- test

## Source Modification & Documentation

ソースコードを変更した際は、必ず以下のセットを同期して更新してください。

- 仕様書 (`specs/`)
- テスト仕様書 (`testspecs/`)
- `project_blueprint.json`
- `spec_index.md`

## Verification Policy

- **ブラウザ操作ツールは使用しない:** Agent自身によるブラウザ操作テスト（Playwright等の自動ツール実行以外）は行わない。
- **デバッグURLによる依頼:** 実装内容の目視確認が必要な場合は、デバッグ用URL（`?debug=1&jump=...`）を生成し、ユーザーに確認を依頼すること。
