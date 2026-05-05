# 依頼: project_blueprint JSON 作成

契約駆動AI開発で小規模Webアプリを作るため、KawazuContractHub に渡す project_blueprint JSON を作成してください。

## ルール

- コードは書かない。
- spec/testspec/source/test の本文は作らない。
- 1 contract は最終的に spec / testspec / source / test の4点セットを持つ。
- Contract source は CommonJS / Node.js testable / 外部ライブラリなしを優先。
- DOM / CSS / browser event / public / bundle は non_contract。
- required contract は初期MVPに必須な最小閉路にする。
- required は optional / deferred / non_contract に依存しない。
- depends_on は直接呼び出すcontractだけ。
- allowed_dependency_apis を依存先ごとに明示する。
- required_commands は `node --test tests/core/<file>.test.js` のように具体化する。`test` だけは禁止。
- `specs/modules/`, `src/core/`, `tests/core/` を基本にする。

## 出力

最後に JSON だけを出してください。コードや解説は不要です。
