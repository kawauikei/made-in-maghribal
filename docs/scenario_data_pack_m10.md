# M10-2A Story Data Pack

本資料は M10-2 Scenario Enrichment に向けた既存データ、世界観設定、UI仕様、および利用可能素材の集約版です。
ChatGPT や世界観担当とのストーリー作成・文体統一のインプットとして利用してください。
（※本資料は自動抽出されたものであり、このフェーズでの改稿・実装は行っていません）

---

## 1. Heroine Data

### ハキマアル＝ルハーン (ハキマ)
- **ID**: hakima
- **Role**: 品質鑑定見習い / 知己
- **Age**: 19
- **Theme Color**: #ffcc00
- **Theme Track ID**: HAKIMA-01
- **Music Mood**: 軽やかで少し照れくさい旋律
- **Route Theme**: 現在から育つ縁の象徴としての顔見知り関係
- **Visual Config**: facePosition: center 20%
- **Available Expressions**: `anger`, `cry`, `fun`, `joy`, `maid`, `normal`, `social`, `sorrow`, `student`, `surprise`

**Description**:
> アル＝ルハーン香材商会で素材を見分ける仕事に携わる少女。香りや色、手触りの違いを見抜く観察眼があり、星瓶堂でも頼れる協力者になる。

**Route Description**:
> かつてナーディルと共に学んだ、香材商会の若き主。今は離れた場所にいるが、ある品を探して星瓶堂の扉を叩くことになる。

**Personality**:
> ツンデレで負けず嫌い。怒っているようで実は相手を心配している世話焼きな性格。

**Relationship**:
> 通常ルートでは、同業・商会関係の顔見知り程度。星瓶堂を支える流れの中で、協力者として距離を縮めていく。

**Route Relationship**:
> 過去から続く縁。かつて交わした約束を胸に、再び協力者として歩み寄る関係。

**Greeting**:
> 来たわよ、ナーディル。今日も星瓶堂らしい目利き、見せてもらうから。

### ミラサフワーン (ミラ)
- **ID**: mira
- **Role**: 錬金大学の後輩 / 協力者
- **Age**: 16
- **Theme Color**: #3d5afe
- **Theme Track ID**: MIRA-01
- **Music Mood**: 知性的で透明感のある旋律
- **Route Theme**: 知識と好奇心がつなぐ協力関係
- **Visual Config**: facePosition: center 15%
- **Available Expressions**: `anger`, `cry`, `fun`, `joy`, `maid`, `normal`, `social`, `sorrow`, `student`, `surprise`

**Description**:
> 錬金大学で学ぶ少女。知識の吸収が早く、星瓶堂では新しい発想を持ち込んでくれる。

**Route Description**:
> (none)

**Personality**:
> 礼儀正しく賢い。子供扱いされるのを嫌い、一人前として見られたいと思っている。

**Relationship**:
> 課題の相談や素材の購入、試作品の確認などを通じて距離を縮める協力者。

**Route Relationship**:
> (none)

**Greeting**:
> こんにちは、先輩。今日は課題の材料について、少し相談させてください。

### ダリヤザフラーン (ダリヤ)
- **ID**: dariya
- **Role**: 王宮錬金局のエリート / 協力者
- **Age**: 23
- **Theme Color**: #f44336
- **Theme Track ID**: DARIYA-01
- **Music Mood**: 静かな緊張感を帯びた旋律
- **Route Theme**: 立場の強さと本音の揺れが交わる関係
- **Visual Config**: facePosition: center 25%
- **Available Expressions**: `anger`, `cry`, `fun`, `joy`, `maid`, `normal`, `social`, `sorrow`, `student`, `surprise`

**Description**:
> 王宮錬金局の要職にある女性。強く見える一方で、内面には疲れも抱えている。

**Route Description**:
> (none)

**Personality**:
> クールで皮肉屋だが、内面は重圧に疲れている。心を許した相手には弱さを見せることもある。

**Relationship**:
> 公務の合間に星瓶堂へ顔を出す協力者。落ち着いた大人の距離感を持つ。

**Route Relationship**:
> (none)

**Greeting**:
> 邪魔するよ、ナーディル。王宮の検証品について、少し見立てを借りたい。

---

## 2. Affection Events

### [hakima] Threshold 0: 牙と天秤の出会い
- **Event ID**: hakima_0
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: なし
- **Normal Route Pages**: 5
- **IF Route Pages**: 0
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [hakima] Threshold 5: もう一度、隣に
- **Event ID**: hakima_5
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 4
- **IF Route Pages**: 4
- **Still Image**: hakimaMorningVisit01
  - Title: 朝の来訪
  - Src: images/still/still_hakima_morning_visit_01.jpeg
- **表示形式**: stillあり (全画面スチル)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [hakima] Threshold 10: 狐の耳は嘘をつかない
- **Event ID**: hakima_10
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 4
- **IF Route Pages**: 4
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [hakima] Threshold 20: 重なる目利き
- **Event ID**: hakima_20
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 5
- **IF Route Pages**: 5
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [hakima] Threshold 30: 隣に並ぶ覚悟
- **Event ID**: hakima_climax
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 5
- **IF Route Pages**: 5
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [mira] Threshold 0: 天才とノートの余白
- **Event ID**: mira_0
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: なし
- **Normal Route Pages**: 5
- **IF Route Pages**: 0
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [mira] Threshold 5: 普通の女の子として
- **Event ID**: mira_5
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 4
- **IF Route Pages**: 4
- **Still Image**: miraAfterSchool01
  - Title: 放課後
  - Src: images/still/still_mira_after_school_01.jpeg
- **表示形式**: stillあり (全画面スチル)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [mira] Threshold 10: 商人の目利き
- **Event ID**: mira_10
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 4
- **IF Route Pages**: 4
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [mira] Threshold 20: 暮らしの錬金術
- **Event ID**: mira_20
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 5
- **IF Route Pages**: 5
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [mira] Threshold 30: 正解の前の私
- **Event ID**: mira_climax
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 5
- **IF Route Pages**: 5
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [dariya] Threshold 0: 王宮の鑑定依頼
- **Event ID**: dariya_0
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: なし
- **Normal Route Pages**: 5
- **IF Route Pages**: 0
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [dariya] Threshold 5: 安らぎの工房
- **Event ID**: dariya_5
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 4
- **IF Route Pages**: 4
- **Still Image**: dariyaAfterHours01
  - Title: 夜更けの訪問
  - Src: images/still/still_dariya_after_hours_01.jpeg
- **表示形式**: stillあり (全画面スチル)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [dariya] Threshold 10: 共鳴する真理
- **Event ID**: dariya_10
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 4
- **IF Route Pages**: 4
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [dariya] Threshold 20: 当たり前の重み
- **Event ID**: dariya_20
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 5
- **IF Route Pages**: 5
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [dariya] Threshold 30: 座らせてくれる場所
- **Event ID**: dariya_climax
- **Speaker**: なし
- **Expression**: なし
- **IF(long_history) 差分有無**: あり
- **Normal Route Pages**: 5
- **IF Route Pages**: 5
- **表示形式**: standingのみ (立ち絵表示)
- **M10-2 本文拡充対象**: はい

**通常ルート本文 (pages / text)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

**IFルート本文 (long_history)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]
> [object Object]

---

## 3. Endings

### [hakima] good Ending: 星瓶堂の灯が、やさしく続く
- **条件**: Affection 80以上 かつ Reputation(評判) 40以上 (App.jsx判定)
- **Expression**: なし
- **Background ID**: なし

**本文 (text/pages)**:
> [object Object]
> [object Object]
> [object Object]

### [hakima] normal Ending: いつもの一日が、少し特別になる
- **条件**: Affection 40以上79以下 または (Affection 80以上だがReputation 40未満) (App.jsx判定)
- **Expression**: なし
- **Background ID**: なし

**本文 (text/pages)**:
> [object Object]
> [object Object]
> [object Object]

### [hakima] bad Ending: 言えなかった言葉
- **条件**: Affection 40未満 (App.jsx判定)
- **Expression**: なし
- **Background ID**: なし

**本文 (text/pages)**:
> [object Object]
> [object Object]

### [mira] good Ending: ひらめきが、未来を照らす
- **条件**: Affection 80以上 かつ Reputation(評判) 40以上 (App.jsx判定)
- **Expression**: なし
- **Background ID**: なし

**本文 (text/pages)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [mira] normal Ending: 学びの途中で
- **条件**: Affection 40以上79以下 または (Affection 80以上だがReputation 40未満) (App.jsx判定)
- **Expression**: なし
- **Background ID**: なし

**本文 (text/pages)**:
> [object Object]
> [object Object]
> [object Object]

### [mira] bad Ending: 少し遠回り
- **条件**: Affection 40未満 (App.jsx判定)
- **Expression**: なし
- **Background ID**: なし

**本文 (text/pages)**:
> [object Object]
> [object Object]
> [object Object]

### [dariya] good Ending: 静かな信頼
- **条件**: Affection 80以上 かつ Reputation(評判) 40以上 (App.jsx判定)
- **Expression**: なし
- **Background ID**: なし

**本文 (text/pages)**:
> [object Object]
> [object Object]
> [object Object]
> [object Object]

### [dariya] normal Ending: 気配を残して
- **条件**: Affection 40以上79以下 または (Affection 80以上だがReputation 40未満) (App.jsx判定)
- **Expression**: なし
- **Background ID**: なし

**本文 (text/pages)**:
> [object Object]
> [object Object]
> [object Object]

### [dariya] bad Ending: まだほどけない心
- **条件**: Affection 40未満 (App.jsx判定)
- **Expression**: なし
- **Background ID**: なし

**本文 (text/pages)**:
> [object Object]
> [object Object]

---

## 4. World / Protagonist / Shop

### SHOP: 星瓶堂 (せいびんどう / ダール・アル＝カワーキブ)
- **Location**: 交易街区
- **Description**: 王都から少し離れた交易街区にある老舗の錬金術店。カメラ開発で少し有名になった。

### PROTAGONIST: ナーディル・アル＝カーミル (ナーディル)
- **Role**: 若き錬金術師 / 星瓶堂店主
- **Age**: 20
- **Background**: 錬金大学を飛び級で卒業。実家の星瓶堂を継いだばかり。
- **Personality**: 穏やかで人当たりがよいが、根は真面目。
- **Goal**: 自分の力で工房を一人前にすること

### WORLD: マグリバル王国
- **Tone**: 優しい華やかさ、生活密着型錬金術
- **Keywords**: 砂漠の夕暮れ, 市場, 香料, 紅茶, 青い陶器, 金細工, 星明かり
- **Music Direction**: 民族楽器 + 小編成アンサンブル + 軽いゲーム音楽感

---

## 5. UI / VN表示仕様

- **VNBoxの仕様**:
  - 全てのシナリオ・イベントは画面下部の `VNBox` (オーバーレイテキストボックス) を通して表示される。
  - スピーカー名はボックス上部に、指定した色 (`themeColor`) で表示される。
  - クリックで1ページずつ進む。
- **1ページあたりの安全な文字量**: 
  - スマホや小窓での可読性を考慮し、最大でも **60〜80文字** 程度。3〜4行に収まる分量が望ましい。
- **各シーンでの表示概要**:
  - **PROLOGUE**: 立ち絵なし、背景 + VNBox のみで状況説明。
  - **INTRO (毎営業開始)**: ヒロインの `greeting` を表示。
  - **RESULT (毎営業終了)**: 営業成績に応じた短文と、ヒロインの好感度上昇を表示。
  - **DAY_END**: セーブ画面と次の営業への導線。
  - **EVENT**: 閾値(5, 10)到達時に挿入。スチルまたは立ち絵とともに、複数ページのイベント本文を展開。
  - **ENDING**: 10回の営業終了後、最終成績とヒロインの好感度により結末を表示。
- **画像仕様**:
  - イベント中は `stillImageId` が指定されていれば全画面スチルを表示。指定がなければ立ち絵を中央に表示。

---

## 6. Assets / BGM / SE

### Background Images
- **shopExteriorDay**: shop exterior day (src: images/background/bg_shop_exterior_day.jpeg)
- **shopExteriorNight**: shop exterior night (src: images/background/bg_shop_exterior_night.jpeg)
- **shopInteriorService**: shop interior service (src: images/background/bg_shop_interior_service.jpeg)
- **marketCentral**: market central (src: images/background/bg_market_central.jpeg)
- **palaceCorridor**: palace corridor (src: images/background/bg_palace_corridor.jpeg)
- **palaceLab**: palace lab (src: images/background/bg_palace_lab.jpeg)
- **spotFountain**: spot fountain (src: images/background/bg_spot_fountain.jpeg)
- **spotFestivalStreet**: spot festival street (src: images/background/bg_spot_festival_street.jpeg)
- **spotPortView**: spot port view (src: images/background/bg_spot_port_view.jpeg)
- **spotOasisView**: spot oasis view (src: images/background/bg_spot_oasis_view.jpeg)
- **spotRuins**: spot ruins (src: images/background/bg_spot_ruins.jpeg)
- **spotStarView**: spot star view (src: images/background/bg_spot_star_view.jpeg)

### Still Images
- **hakimaMorningVisit01**: 朝の来訪 (src: images/still/still_hakima_morning_visit_01.jpeg)
- **hakimaFestivalNight01**: 祭りの夜 (src: images/still/still_hakima_festival_night_01.jpeg)
- **hakimaMarketArgument01**: 市場の小競り合い (src: images/still/still_hakima_market_argument_01.jpeg)
- **hakimaRainShelter01**: 雨宿り (src: images/still/still_hakima_rain_shelter_01.jpeg)
- **miraAfterSchool01**: 放課後 (src: images/still/still_mira_after_school_01.jpeg)
- **miraAssignmentConsult01**: 課題相談 (src: images/still/still_mira_assignment_consult_01.jpeg)
- **miraStarryRooftop01**: 星見の屋上 (src: images/still/still_mira_starry_rooftop_01.jpeg)
- **miraVisitSick01**: 見舞い (src: images/still/still_mira_visit_sick_01.jpeg)
- **dariyaAfterHours01**: 夜更けの訪問 (src: images/still/still_dariya_after_hours_01.jpeg)
- **dariyaLimitNight01**: 限界の夜 (src: images/still/still_dariya_limit_night_01.jpeg)
- **dariyaPalaceCollaboration01**: 王宮との協力 (src: images/still/still_dariya_palace_collaboration_01.jpeg)
- **dariyaRainCorridor01**: 雨の回廊 (src: images/still/still_dariya_rain_corridor_01.jpeg)

### Heroine Visuals
- 全ヒロインに対して `standing_proc` (立ち絵) と `face_proc` (顔アイコン)、一部 `bustup_proc` が提供されています。
- 表情差分は face_proc の存在確認に基づく。standing_proc / bustup_proc の実在差分はイベント実装前に個別確認すること。

### BGM Tracks
- **MAIN-01**: Alchemy Shop in the Desert (メインBGM) [audio/bgm/main/main01_title.mp3]
- **MAIN-02**: Spice Market Breeze (メインBGM) [audio/bgm/main/main02_shop.mp3]
- **MAIN-03**: Measure The Mortar (メインBGM) [audio/bgm/main/main03_puzzle.mp3]
- **HAKIMA-01**: Two Cups of Cardamom (ハキマ関連) [audio/bgm/hakima/hakima01_theme.mp3]
- **HAKIMA-02**: Copper and Cumin (ハキマ関連) [audio/bgm/hakima/hakima02_game_a.mp3]
- **HAKIMA-03**: Copper and Sand (ハキマ関連) [audio/bgm/hakima/hakima03_game_b.mp3]
- **HAKIMA-04**: Saffron and Silk (ハキマ関連) [audio/bgm/hakima/hakima04_game_c.mp3]
- **HAKIMA-05**: Golden Hour Market (ハキマ関連) [audio/bgm/hakima/hakima05_game_d.mp3]
- **HAKIMA-06**: Morning Beside You (ハキマ関連) [audio/bgm/hakima/hakima06_ending.mp3]
- **HAKIMA-07**: Sunset Promises (ハキマ関連) [audio/bgm/hakima/hakima07_ending2.mp3]
- **MIRA-01**: The Glass Bottle Genius (ミラ関連) [audio/bgm/mira/mira01_theme.mp3]
- **MIRA-02**: The Alchemist's Arithmetic (ミラ関連) [audio/bgm/mira/mira02_game_a.mp3]
- **MIRA-03**: Proof of the Prodigy (ミラ関連) [audio/bgm/mira/mira03_game_b.mp3]
- **MIRA-04**: Logic and Lace (ミラ関連) [audio/bgm/mira/mira04_game_c.mp3]
- **MIRA-05**: Starlight Solution (ミラ関連) [audio/bgm/mira/mira05_game_d.mp3]
- **MIRA-06**: Finally Just Me (ミラ関連) [audio/bgm/mira/mira06_ending.mp3]
- **MIRA-07**: The Tomorrow We Found (ミラ関連) [audio/bgm/mira/mira07_ending2.mp3]
- **DARIYA-01**: Tea and Copper Stills (ダリヤ関連) [audio/bgm/dariya/dariya01_theme.mp3]
- **DARIYA-02**: The Alchemist's Ledger (ダリヤ関連) [audio/bgm/dariya/dariya02_game_a.mp3]
- **DARIYA-03**: Clockwork Gambit (ダリヤ関連) [audio/bgm/dariya/dariya03_game_b.mp3]
- **DARIYA-04**: Royal Reflection (ダリヤ関連) [audio/bgm/dariya/dariya04_game_c.mp3]
- **DARIYA-05**: The Bureaucrat's Dream (ダリヤ関連) [audio/bgm/dariya/dariya05_game_d.mp3]
- **DARIYA-06**: Tea Under the Rising Sun (ダリヤ関連) [audio/bgm/dariya/dariya06_ending.mp3]
- **DARIYA-07**: Quiet Moonlight (ダリヤ関連) [audio/bgm/dariya/dariya07_ending2.mp3]
- **extra_joy_1**: 共通：喜び 1 (共通イベントBGM) [audio/bgm/extra/joy1.mp3]
- **extra_joy_2**: 共通：喜び 2 (共通イベントBGM) [audio/bgm/extra/joy2.mp3]
- **extra_anger_1**: 共通：怒り 1 (共通イベントBGM) [audio/bgm/extra/anger1.mp3]
- **extra_anger_2**: 共通：怒り 2 (共通イベントBGM) [audio/bgm/extra/anger2.mp3]
- **extra_sorrow_1**: 共通：悲しみ 1 (共通イベントBGM) [audio/bgm/extra/sorrow1.mp3]
- **extra_sorrow_2**: 共通：悲しみ 2 (共通イベントBGM) [audio/bgm/extra/sorrow2.mp3]
- **extra_fun_1**: 共通：楽しさ 1 (共通イベントBGM) [audio/bgm/extra/fun1.mp3]
- **extra_fun_2**: 共通：楽しさ 2 (共通イベントBGM) [audio/bgm/extra/fun2.mp3]
- **extra_surprise_1**: 共通：驚き 1 (共通イベントBGM) [audio/bgm/extra/surprise1.mp3]
- **extra_surprise_2**: 共通：驚き 2 (共通イベントBGM) [audio/bgm/extra/surprise2.mp3]

### SE
- **uiTapBottle**: Small glass bottle tap for general selection (ui_tap) [audio/se/ui_tap_bottle_01.mp3]
- **uiConfirmChime**: Soft brass chime for confirmation (ui_confirm) [audio/se/ui_confirm_chime_01.mp3]
- **quizChoicePick**: Ceramic click when picking an item (quiz_choice) [audio/se/quiz_choice_pick_01.mp3]
- **quizCorrectStarChime**: Tiny star-like crystalline chime for correct answers (quiz_correct) [audio/se/quiz_correct_star_chime_01.mp3]
- **quizWrongSandTap**: Muffled sand-like tap for wrong answers (quiz_wrong) [audio/se/quiz_wrong_sand_tap_01.mp3]
- **workshopDayEnd**: Wooden door latch or shop bell for day end (workshop_day_end) [audio/se/workshop_day_end_01.mp3]

---

## 7. Story Writing Fixed Rules (禁則事項・世界観注意点)

- **ヒロインの立ち位置**: ヒロインは星瓶堂の従業員・常駐者ではない。あくまで「客」「協力者」「訪問者」として関わる。
- **禁則語**: 以下の語句の使用は禁止されている。
  - ❌ `店番`
  - ❌ `働く`
  - ❌ `雇う`
  - ❌ `再建`
- **ルートの概念**:
  - **通常ルート**: 「現在から育つ縁」 (UI表示: 現在の縁)
  - **IFルート**: 「過去から続く縁」 (UI表示: 過去の縁)
  - IFルートは通常ルートの直接的な続編や「真ルート」ではなく、二周目以降を想定した別世界線・パラレルである。
- **営業単位**: 
  - 10ターンは厳密な「10日間」という暦上の日数ではなく、ゲーム上の「営業単位」である。
  - 表記上は「営業」「10回の営業」「次の営業」等を使用すること。
