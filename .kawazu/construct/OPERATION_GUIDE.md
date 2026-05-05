# Kawazu Construct Workflow

このプロジェクトは **Agent-First 直列製造 + 軽量レビュー補助** で進める。

## 0. 設計チャットと製造チャット

通常、blueprint fragment は製造チャットの外で作る。
MCPサーバ設計チャット、ChatGPT、Geminiなどで「○○を作りたい」と相談し、`blueprint_fragment_generation_prompt.md` を使って fragment を生成する。

`project_design_base_prompt.md` は企画やMVP範囲が曖昧な場合だけ補助的に使う。常に両方使うものではない。

## 1. 初期化

新規プロジェクトだけ `project_initialize` を実行する。既存プロジェクトでは `construct_status` から確認する。

## 2. blueprint fragment 配置

生成済み fragment を以下へ置く。

`.kawazu/construct/blueprint_fragments/`

## 3. blueprint 統合

`blueprint_merge merge`

merge は内部で lint 相当の検証と index 更新を行う。単独確認が必要な場合だけ `blueprint_merge lint` を使う。

## 4. キュー確認

`build_queue run`

build_queue は依存順に **次の1 contract** を返す。並走batchは前提にしない。

## 5. contract 製造

`contract_build_attempt <contract_id>`

担当は以下。

1. 仕様書: host agent
2. テスト仕様書: local/remote Gemma4 が下書き補助、host agentが正本判断
3. ソース: host agent
4. 仕様書 + ソース簡易レビュー: Google API high model
5. テストソース: host agent
6. テスト仕様書 + テストソース簡易レビュー: Google API low model
7. register / verify / finalize: ContractHub + host agent

Google API に source/test の正本を生成させない。
Gemma4 と Google API は補助であり、正本の作成・採否・修正は host agent が行う。

## 6. register / verify / finalize

4点セットが揃ったら順に実行する。

- `contract register c1`
- `contract verify c1`
- `contract finalize c1`

verify 失敗時は allowed_to_create 内だけ修正して再試行する。

## 7. 次へ進む

`build_queue tick` または `build_queue run` で次の ready contract を確認する。

## 8. 状態確認

通常の進捗確認は以下を見る。

`.kawazu/construct/logs/LATEST_STATUS.md`

詳細調査用の JSONL ログは logs 配下に蓄積される。

## 禁止

- `contracts.json` の直接編集
- `project_blueprint.json` の手編集
- 旧一括draft導線の使用
- Google API に source/test 正本を生成させること
- エージェントの並走挙動を前提にした運用
