```markdown
# Test Specification: C001_DATA_ID_SCHEMA

## 概要 (Overview)
本テスト仕様書は、データ全体で使用される各種ID（キャラクター、ヒロイン、ルート、表情、アセット、アイテム、BGM、SE、シーンなど）の命名規則とバリデーションロジックが、契約仕様書 (C001_DATA_ID_SCHEMA) に従って正しく機能することを検証するために定義する。

## テスト対象範囲 (Scope)
本テストは、以下のデータ型および関連する命名規則の検証に焦点を当てる。

*   `HeroineId`
*   `RouteMode`
*   `CharacterId`
*   `ExpressionId`
*   `AssetId`
*   `ItemId`
*   `BGMId` / `SEId`
*   `SceneId`
*   `TopicId`
*   `RequestTemplateId`

## テスト目的 (Objective)
1.  定義された全てのIDの命名規則が、入力データに対して正しく適用されることを確認する。
2.  有効なIDが正しく認識され、処理されることを確認する。
3.  無効なIDが入力された場合、仕様書で定義された適切なエラー理由を返却することを検証する。

---

## テストケース一覧 (Test Cases)

### 1. HeroineId の検証
| ID | テストケース名 | 入力値 (Input) | 期待される結果 (Expected Result) | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| TC-H001 | 有効なID (Hakima) | `hakima` | 成功 (Valid) | |
| TC-H002 | 有効なID (Mira) | `mira` | 成功 (Valid) | |
| TC-H003 | 有効なID (Dariya) | `dariya` | 成功 (Valid) | |
| TC-H004 | 無効なID (存在しない) | `yumi` | 失敗 (Invalid) | エラー理由: "Unknown Heroine ID" |
| TC-H005 | 無効なID (形式エラー) | `hakima_extra` | 失敗 (Invalid) | エラー理由: "Format Mismatch" |

### 2. RouteMode の検証
| ID | テストケース名 | 入力値 (Input) | 期待される結果 (Expected Result) | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| TC-R001 | 有効なID (Normal) | `normal` | 成功 (Valid) | |
| TC-R002 | 有効なID (Extra) | `extra` | 成功 (Valid) | |
| TC-R003 | 無効なID (スペルミス) | `norml` | 失敗 (Invalid) | エラー理由: "Unknown Route Mode" |
| TC-R004 | 無効なID (空) | `""` | 失敗 (Invalid) | エラー理由: "ID cannot be empty" |

### 3. CharacterId の検証 (`CH_{NAME}`)
| ID | テストケース名 | 入力値 (Input) | 期待される結果 (Expected Result) | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| TC-C001 | 有効なID (標準) | `CH_NADIR` | 成功 (Valid) | |
| TC-C002 | 有効なID (大文字) | `CH_HAKIMA` | 成功 (Valid) | |
| TC-C003 | 無効なID (プレフィックス欠如) | `NADIR` | 失敗 (Invalid) | エラー理由: "Missing Prefix" |
| TC-C004 | 無効なID (区切り文字欠如) | `CHNADIR` | 失敗 (Invalid) | エラー理由: "Missing Underscore" |
| TC-C005 | 無効なID (名前部分が空) | `CH_` | 失敗 (Invalid) | エラー理由: "Name segment is empty" |

### 4. ExpressionId の検証 ({EMOTION})
| ID | テストケース名 | 入力値 (Input) | 期待される結果 (Expected Result) | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| TC-E001 | 有効なID (Joy) | `joy` | 成功 (Valid) | |
| TC-E002 | 有効なID (Anger) | `anger` | 成功 (Valid) | |
| TC-E003 | 有効なID (Maid) | `maid` | 成功 (Valid) | |
| TC-E004 | 無効なID (存在しない) | `sadness` | 失敗 (Invalid) | エラー理由: "Unknown Expression ID" |
| TC-E005 | 無効なID (大文字) | `Joy` | 失敗 (Invalid) | ※仕様により大文字を許容しない場合 |

### 5. AssetId の検証 (`AS_{CATEGORY}_{NAME}`)
| ID | テストケース名 | 入力値 (Input) | 期待される結果 (Expected Result) | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| TC-A001 | 有効なID (BG) | `AS_BG_FOREST` | 成功 (Valid) | |
| TC-A002 | 有効なID (UI) | `AS_UI_BUTTON_OK` | 成功 (Valid) | |
| TC-A003 | 無効なID (カテゴリ欠如) | `AS_FOREST` | 失敗 (Invalid) | エラー理由: "Missing Category" |
| TC-A004 | 無効なID (名前欠如) | `AS_BG_` | 失敗 (Invalid) | エラー理由: "Missing Asset Name" |
| TC-A005 | 無効なID (カテゴリ不正) | `AS_MAP_FOREST` | 失敗 (Invalid) | エラー理由: "Unknown Category" |

### 6. ItemId の検証 (`IT_{GENRE}_{PRINCIPLE}_{INDEX}`)
| ID | テストケース名 | 入力値 (Input) | 期待される結果 (Expected Result) | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| TC-I001 | 有効なID (標準) | `IT_ARM_AS_001` | 成功 (Valid) | |
| TC-I002 | 有効なID (異なる組み合わせ) | `IT_FOD_EL_12` | 成功 (Valid) | |
| TC-I003 | 無効なID (ジャンル不正) | `IT_XYZ_AS_001` | 失敗 (Invalid) | エラー理由: "Unknown Genre ID" |
| TC-I004 | 無効なID (術理不正) | `IT_ARM_XX_001` | 失敗 (Invalid) | エラー理由: "Unknown Principle ID" |
| TC-I005 | 無効なID (インデックス欠如) | `IT_ARM_AS_` | 失敗 (Invalid) | エラー理由: "Missing Index" |

### 7. BGM/SE および SceneId の検証
| ID | テストケース名 | 入力値 (Input) | 期待される結果 (Expected Result) | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| TC-B001 | BGM 有効 | `BGM_TOWN_DAY` | 成功 (Valid) | |
| TC-B002 | BGM 無効 | `BGM_UNKNOWN` | 失敗 (Invalid) | エラー理由: "Unknown BGM Name" |
| TC-S001 | Scene 有効 (OP) | `SC_OP_OPENING` | 成功 (Valid) | |
| TC-S002 | Scene 有効 (EVENT) | `SC_EVENT_BOSS_FIGHT` | 成功 (Valid) | |
| TC-S003 | Scene 無効 (カテゴリ不正) | `SC_INTRO_START` | 失敗 (Invalid) | エラー理由: "Unknown Scene Category" |

### 8. その他IDの検証 (TopicId / RequestTemplateId)
| ID | テストケース名 | 入力値 (Input) | 期待される結果 (Expected Result) | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| TC-T001 | TopicId 有効 | `topic_daily_weather` | 成功 (Valid) | （命名規則は自由だが、ここではスネークケースを想定） |
| TC-T002 | TopicId 無効 | `TopicDailyWeather` | 失敗 (Invalid) | （大文字始まりなど、想定外の形式） |
| TC-R003 | RequestTemplateId 有効 | `request_template_quiz_01` | 成功 (Valid) | |
| TC-R004 | RequestTemplateId 無効 | `RTQZ_01` | 失敗 (Invalid) | （プレフィックスが想定外） |

---

## 期待される動作サマリー (Summary of Expected Behavior)

1.  **成功時 (Positive Test):** 入力されたIDが定義された全ての命名規則と列挙値に合致する場合、バリデーションは成功し、IDは有効であると判断される。
2.  **失敗時 (Negative Test):**
    *   **形式不一致:** プレフィックス、区切り文字、構造が仕様と異なる場合。
    *   **値不一致:** 列挙値（例: `normal` ではない値）が使用されている場合。
    *   **欠損:** 必須の要素（例: `AssetId` の名前部分）が欠落している場合。
3.  **エラーハンドリング:** 失敗時には、単に「無効」とするだけでなく、**「なぜ無効なのか」**を具体的に示すエラーメッセージ（例: "Unknown Heroine ID", "Missing Category"）が返却されることを確認する。
```
