# MCP 運用メモ

## 標準ツール

### ContractHub

- `project_initialize`: 新規初期化
- `blueprint_merge`: merge / lint / index / find / get / patch / decision_apply
- `blueprint_lint`: 互換用の単独診断。通常手順では `blueprint_merge lint` を使う。
- `build_queue`: 依存順に次の1件を返す
- `contract`: register / verify / finalize / reset
- `construct_status`: 状態確認
- `contract_integrity_check`: 整合確認
- `dependency_decision_record`: 依存判断記録
- `dependency_decision_list`: 判断一覧
- `integration_build`: required contract完了後の統合

### DevHelper

- `contract_build_attempt`: Agent-First直列製造の補助入口
- `model_policy_status`: モデル・キー状態確認
- `monitor_status`: worker状態確認
- `model_benchmark`: Google API疎通確認
- `validate_syntax`: 構文確認
- `diff_summary`: 差分要約
- `changed_file_review`: 変更レビュー
- `analyze_semantic` / `model_chat`: 軽量相談

## 役割

- host agent: spec / source / test / 最終修正
- local/remote Gemma4: testspec下書き補助
- Google API high model: spec + source 簡易レビュー
- Google API low model: testspec + test 簡易レビュー
- ContractHub: registry / verify / finalize

## 方針

エージェントの並走能力はホストにより異なるため、MCPは直列で次の1件を返す。
並走は通常ワークフローに含めない。

`LATEST_STATUS.md` を最新状態の固定表示として使う。
