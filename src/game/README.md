# src/game

ゲームルールの純粋な処理を置く。
Reactに依存しない関数を優先する。

## 責務
- quizEngine.js: 問題生成、正解候補/ダミー候補選択
- scoring.js: 正誤判定、スコア計算、品質判定
- progress.js: 20問進行、ターン管理
- ending.js: ED分岐判定
