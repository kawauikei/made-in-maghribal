# KawazuContractHub 相談チャット起動用コンテキスト

このチャットは KawazuContractHub MCP サーバの設計・運用・更新を相談するための継続メンテナンス用チャットです。
作業を始める前に、以下を前提として扱ってください。

## 目的

KawazuContractHub は、Agent が安全に contract 駆動開発を進めるための MCP サーバです。
モデル実行やプロンプト分配ではなく、blueprint / registry / verify / finalize / integration の足場を提供します。

## 公開ツール

- project_initialize
- blueprint_merge
- blueprint_merge lint
- build_queue
- contract
- construct_status
- contract_integrity_check
- dependency_decision_record
- dependency_decision_list
- integration_build

## 主経路

```text
project_initialize
→ blueprint_merge（fragment運用時のみ）
→ blueprint_merge lint
→ build_queue
→ Agentが4点セット作成
→ contract action=register
→ contract action=verify
→ contract action=finalize
→ contract_integrity_check
→ integration_build
```

## 責務分担

- ChatGPT: MCPサーバ本体の更新、設計判断、方針整理。
- Agent: build_queue が許可した4点セット作成。
- KawazuContractHub: contract管理と検証。
- KawazuDevHelper: 解析・レビュー・構文確認・モデル状態確認。

## 継続メンテ方針

KawazuContractHub MCPサーバ本体の更新は、この相談チャットで検討し、ChatGPT側でパッチ化します。
使わないツールやルートは「念のため残す」のではなく削除します。
公開ツール数を増やすより、主経路を短く保つことを優先します。

## 禁止・注意

- contracts.json を直接編集しない。
- ContractHub にモデル実行ロジックを持たせない。
- 旧prompt生成系/agent_build系/parallel_plan系/旧一括draft導線を復活させない。
- workflowが分岐しすぎる変更は避ける。

## 相談時に見るべき主ファイル

- dev_constructor.py
- scripts/construct/layout.py
- scripts/construct/blueprint.py
- scripts/construct/lifecycle.py
- scripts/construct/verify.py
- scripts/construct/dependency_guard.py
- scripts/construct/decisions.py
