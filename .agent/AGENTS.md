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
