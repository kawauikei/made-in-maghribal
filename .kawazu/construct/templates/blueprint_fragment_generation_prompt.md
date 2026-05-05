# 依頼: blueprint fragment JSON 一括生成

大きい題材向けに、KawazuContractHub の `blueprint_merge` に渡す複数の blueprint fragment JSON を生成してください。

このテンプレートは単独で使います。`project_design_base_prompt.md` とは併用しません。
コード、spec本文、test本文は作りません。

## 入力

この下に project_name / summary / MVP範囲 / non_goals / constraints を貼ります。

## ルール

- required contract は初期MVPの最小閉路。
- required は optional/deferred/non_contract に依存しない。
- browser/public/CSS/bundle は non_contract fragment に入れる。
- sources/tests は配列形式を優先。
- required_commands は具体的な `node --test ...`。
- fragment間で contract_id / path を重複させない。

## 出力

以下を複数の JSON コードブロックで出してください。

1. `split_manifest.json`
2. `00_project.json`
3. branch/area別 contracts fragment JSON
4. `90_non_contract_integration.json`

各JSONは、あとで `.kawazu/construct/blueprint_fragments/` に保存して `blueprint_merge` に渡す前提です。
