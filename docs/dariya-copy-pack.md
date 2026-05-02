# Dariya Character Pack (M-COPY-CHARACTER-PACK-EXPORT-1)

**作成日**: 2026-05-02
**対象**: ダリヤ関連の全本文
**目的**: 世界観担当チャットへ渡し、口調・関係性の一貫性をレビュー

---

## メタ情報

- **ヒロイン ID**: `dariya`
- **種族**: 鬼族
- **関係**: 王宮錬金術師・先輩・友人
- **口調**: 知的・冷静・余裕 (時々皮肉)
- **一人称**: 私
- **ナーディル呼称**: 君 (後輩)
- **BGM**: `DARIYA-01`

---

## 1. Greetings

**source**: `src/data/greetings.js`

### greet_sunny (sunny_day)

```yaml
id: greet_sunny
sourceFile: src/data/greetings.js
routeMode: both
speakerId: dariya
```

**arrival**:
```
邪魔するよ、ナーディル。……ふむ、今日の店先は一段と眩しいな
```

**response**:
```
いらっしゃい、ダリヤさん。光が強い日は、石の地色がよく見えるんです
```

---

### greet_hot (hot_day)

```yaml
id: greet_hot
sourceFile: src/data/greetings.js
routeMode: both
speakerId: dariya
```

**arrival**:
```
ナーディル、少し熱に中られたか？ 王宮の冷房装置を貸してやりたいくらいだ
```

**response**:
```
はは……お気遣いありがとうございます。冷茶を飲んで、シャキッとしますよ
```

---

### greet_calm (calm_day)

```yaml
id: greet_calm
sourceFile: src/data/greetings.js
routeMode: both
speakerId: dariya
```

**arrival**:
```
邪魔するよ。今日は風がないな。王宮の騒がしさが嘘のようだ
```

**response**:
```
いらっしゃい。静かな朝は、鑑定の目も研ぎ澄まされる気がします
```

---

### greet_cloudy (cloudy_day)

```yaml
id: greet_cloudy
sourceFile: src/data/greetings.js
routeMode: both
speakerId: dariya
```

**arrival**:
```
ふむ、曇り空か。ナーディル、君ならこの光をどう活かす？
```

**response**:
```
地色を見るのに最適です。今日は普段見落としがちな微細な傷も見抜けますよ
```

---

## 2. DailyTalks - Intro

### dariya_palace_tea

```yaml
id: dariya_palace_tea
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: work
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
王宮の茶葉はどれも最高級だが……この店の、少しスパイスが混ざったような香りは悪くない。

speaker: ナーディル, expression: normal
そう言ってもらえると嬉しいです。ここでは、少しでも息をつけるようにしておきます。

```

---

### dariya_palace_protocol

```yaml
id: dariya_palace_protocol
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: work
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
王宮の検証書類は、瓶の中身より重いことがある。

speaker: ダリヤ, expression: fun
中身を一滴調べるために、紙を十枚書く。優雅な仕事だろう？

```

---

### dariya_resting_place

```yaml
id: dariya_resting_place
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: personal
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
ここは、王宮ほど静かではないのに妙に落ち着くな。瓶の音も、人の声もある。

speaker: ダリヤ, expression: fun
完璧に整っていないからだろうか。少なくとも、息苦しさは少ない。

```

---

### dariya_oni_aesthetic

```yaml
id: dariya_oni_aesthetic
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: personal
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
鬼族の里では、私は少し細すぎると言われる。王都では逆のことを言われるがね。

speaker: ダリヤ, expression: fun
美しさの基準など、場所が変わればすぐ変わる。実に頼りない真理だ。

```

---

### dariya_verification_sample

```yaml
id: dariya_verification_sample
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: work
minAffection: 5
```

**pages**:
```
speaker: ダリヤ, expression: normal
王宮から検証用の小瓶を預かってきた。正式な依頼ではない、少し厄介な確認だ。

speaker: ナーディル, expression: normal
厄介な確認を持ち込まれるくらいには、信用されたと思っておきます。

speaker: ダリヤ, expression: fun
前向きだな。そういう若さは、王宮の空気に少し分けてやりたいよ。

```

---

### dariya_imperfect_shelf

```yaml
id: dariya_imperfect_shelf
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: personal
minAffection: 5
```

**pages**:
```
speaker: ダリヤ, expression: normal
この棚は、瓶の高さが微妙に揃っていないな。王宮なら直される。

speaker: ナーディル, expression: fun
すみません。気を抜くと、よく使う瓶だけ前に出てくるんです。

speaker: ダリヤ, expression: joy
謝ることはない。使われている棚の方が、飾られた棚より私は好きだ。

```

---

### dariya_dress_choice

```yaml
id: dariya_dress_choice
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: personal
minAffection: 10
```

**pages**:
```
speaker: ダリヤ, expression: fun
今日の装い、どうかしら？ 交易商の会合だから、少し「武装」してきたの。

speaker: ナーディル, expression: surprise
……武装、ですか。確かに、いつにもまして隙がないように見えます。

speaker: ダリヤ, expression: joy
なら上々だ。隙を見せる相手くらい、自分で選びたいのでね。

```

---

### dariya_tea_leaf

```yaml
id: dariya_tea_leaf
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: work
minAffection: 5
```

**pages**:
```
speaker: ダリヤ, expression: normal
ナーディル、新しい茶葉を見つけた。香りの層が面白い。後で試してみるか。

speaker: ナーディル, expression: joy
それは楽しみです。ダリヤさんの選ぶ茶葉は、いつも香りの理由まで面白いですから。

speaker: ダリヤ, expression: joy
いい答えだ。では、君の感想も検証材料に加えさせてもらおう。

```

---

### dariya_not_perfect

```yaml
id: dariya_not_perfect
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: personal
minAffection: 10
```

**pages**:
```
speaker: ダリヤ, expression: sorrow
今日は少し、王宮錬金術師らしくない顔をしているかもしれない。

speaker: ナーディル, expression: sorrow
ここでは、肩書きより先にダリヤさんが座ってくれれば十分です。

speaker: ダリヤ, expression: joy
……君は時々、こちらが困るほど自然に逃げ道を作るな。

```

---

### dariya_palace_window

```yaml
id: dariya_palace_window
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: work
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
王宮の窓は美しいよ。磨かれすぎて、外の光まで少し緊張して見える。

speaker: ダリヤ, expression: fun
ここは少し埃っぽいが、そのぶん光がやわらかい。悪くない違いだ。

```

---

### dariya_royal_safety

```yaml
id: dariya_royal_safety
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: intro
category: work
minAffection: 5
```

**pages**:
```
speaker: ダリヤ, expression: normal
王宮の調合品は、効能より先に安全証明を求められる。美しいが、息の詰まる仕事だ。

speaker: ナーディル, expression: normal
暮らしに届く品ほど、安心して使えることが大事ですからね。

speaker: ダリヤ, expression: joy
そうだな。君は、王宮が時々忘れる当たり前を覚えている。

```

---

## 3. DailyTalks - After Result

### dariya_result_evaluation

```yaml
id: dariya_result_evaluation
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: after_result
category: work
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
王宮の検証品と比べても、君の見立てには筋が通っている。用途を見失わないのは、簡単ではない。

speaker: ダリヤ, expression: fun
……少し褒めすぎたかな。だが、悪くない。星瓶堂らしい柔らかさがある。

```

---

### dariya_result_palace_measure

```yaml
id: dariya_result_palace_measure
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: after_result
category: work
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
王宮の基準で測っても、君の品には一貫した筋がある。用途と美しさの両立は、簡単ではない。

speaker: ダリヤ, expression: fun
……星瓶堂の柔らかさは、王宮にはない魅力だ。大切にしなさい。

```

---

### dariya_after_result_craft

```yaml
id: dariya_after_result_craft
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: after_result
category: work
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
品の仕上げ、丁寧だったな。

speaker: ダリヤ, expression: joy
王宮の品にも負けていない。

```

---

### dariya_after_result_material

```yaml
id: dariya_after_result_material
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: after_result
category: personal
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
素材の選び方、参考になった。

speaker: ダリヤ, expression: fun
工房でも応用できそうだ。

```

---

## 4. DailyTalks - Day End

### dariya_day_end_tea

```yaml
id: dariya_day_end_tea
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: day_end
category: personal
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
そろそろ王宮へ戻らないと。夜の回廊は静かだが、書類だけは眠ってくれない。

speaker: ダリヤ, expression: joy
……だが、君の茶の香りはまだ袖に残っている。悪くない。少しだけ、戻る足取りが軽くなる。

```

---

### dariya_day_end_quiet_tea

```yaml
id: dariya_day_end_quiet_tea
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: day_end
category: personal
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
夜の茶は、昼とは違う深みがある。君の淹れる茶は、特にそうだ。

speaker: ダリヤ, expression: joy
……王宮の書類も、この香りさえあれば、少しは軽くなる。また寄らせてもらう。

```

---

### dariya_day_end_fire

```yaml
id: dariya_day_end_fire
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: day_end
category: work
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
帰りに工房の火を消してくる。

speaker: ダリヤ, expression: sorrow
今日の炎の色、少し落ち着きすぎだったか。

```

---

### dariya_day_end_tool

```yaml
id: dariya_day_end_tool
sourceFile: src/data/dailyTalks.js
routeMode: both
timing: day_end
category: personal
minAffection: 0
```

**pages**:
```
speaker: ダリヤ, expression: normal
道具の手入れ、星瓶堂も行き届いているな。

speaker: ダリヤ, expression: joy
店主の心がけが感じられる。

```

---

## 5. DailyTalks - long_history Intro

### dariya_long_old_chair

```yaml
id: dariya_long_old_chair
sourceFile: src/data/dailyTalks.js
routeMode: long_history
timing: intro
category: personal
minAffection: 5
```

**pages**:
```
speaker: ダリヤ, expression: fun
この椅子、昔より座り心地がよくなっていないか。ますます立ち上がれなくなる。

speaker: ナーディル, expression: fun
昔から長居していたのは、椅子のせいだけじゃないでしょう。

speaker: ダリヤ, expression: sorrow
……そうだな。君の店は昔から、私が少し黙っていられる場所だった。

```

---

### dariya_long_seen_weakness

```yaml
id: dariya_long_seen_weakness
sourceFile: src/data/dailyTalks.js
routeMode: long_history
timing: intro
category: personal
minAffection: 10
```

**pages**:
```
speaker: ダリヤ, expression: cry
君は昔から、私が平気な顔をしている時ほど、何も聞かずに茶を出す。

speaker: ナーディル, expression: normal
聞かれたくない日もあるでしょう。でも、一人で戻らなくていい日はあっていい。

speaker: ダリヤ, expression: joy
……本当に、困った後輩だ。おかげで私は、また少し立て直せてしまう。

```

---

### dariya_long_first_weakness

```yaml
id: dariya_long_first_weakness
sourceFile: src/data/dailyTalks.js
routeMode: long_history
timing: intro
category: personal
minAffection: 5
```

**pages**:
```
speaker: ダリヤ, expression: sorrow
昔、君に一度だけ失敗した実験を見られたな。あれは、今でも少し悔しい。

speaker: ナーディル, expression: normal
俺は、失敗よりも、その後で何度も検証し直していた姿を覚えています。

speaker: ダリヤ, expression: joy
……そういう覚え方をするから、君の前では格好をつけにくいんだ。

```

---

### dariya_long_intro_corner

```yaml
id: dariya_long_intro_corner
sourceFile: src/data/dailyTalks.js
routeMode: long_history
timing: intro
category: personal
minAffection: 5
```

**pages**:
```
speaker: ダリヤ, expression: fun
この隅の席、まだ空けておいてくれるのか。

speaker: ナーディル, expression: fun
君が座る場所くらい、覚えていないと。

speaker: ダリヤ, expression: joy
……ふん。王宮より、この一角の方が落ち着くんだよ。

```

---

### dariya_long_intro_shelter

```yaml
id: dariya_long_intro_shelter
sourceFile: src/data/dailyTalks.js
routeMode: long_history
timing: intro
category: personal
minAffection: 10
```

**pages**:
```
speaker: ハキマ, expression: fun
弟が、今度は香りの変わるしおりを欲しがってるの。小瓶の次は紙だなんて、忙しい子よね。

speaker: ナーディル, expression: normal
本に挟むなら、香りは弱めがいいな。強すぎると紙に移って、読むたびに気が散る。

speaker: ハキマ, expression: joy
……ふうん。そこまで考えるなら、星瓶堂に頼む価値はありそうね。弟も喜ぶと思うわ。

```

---

## 6. Affection Events - Normal Route

### dariya_0 (flashback_intro)

```yaml
id: dariya_0
sourceFile: src/data/affectionEvents.js
routeMode: both
threshold: 0
kind: flashback_intro
title: 王宮の鑑定依頼
```

**summary**:
```
開店前、ダリヤさんとの出会いを思い出す。王宮錬金局からの正式な鑑定依頼が、彼女との始まりだった。
```

**pages**:
```
speaker: ナーディル, expression: normal, backgroundId: shopExteriorDay
ダリヤさんは……最初は本当に『公務』として、この店に来たんだよな。

speaker: ダリヤ, expression: normal, backgroundId: palaceLab
「王宮錬金局のダリヤ・アル＝アズラクです。星瓶堂の技術、王室の基準に照らして確認させていただきます」
検証室で会った時の彼女は、氷のように冷たく、完璧な公務員だった。

speaker: ナーディル, expression: sorrow, backgroundId: palaceLab
「厳しいですね。でも、俺の作る品に嘘はありません」
俺が差し出した試作瓶を、彼女は無言で、しかし誰よりも真剣な眼差しで解析し始めた。

speaker: ダリヤ, expression: joy, backgroundId: palaceLab
「……不合格。理論が古すぎるわ。でも、使い手の体温まで計算されている。嫌いな設計じゃない」
最後に微かに見せたその笑みが、今の「友人」としての関係の種だったんだと思う。

speaker: ナーディル, expression: joy, backgroundId: shopExteriorDay
今では良き関係者として、王宮との橋渡しまでしてくれている。……さあ、背筋を伸ばして始めよう。

```

---

### dariya_5

```yaml
id: dariya_5
sourceFile: src/data/affectionEvents.js
routeMode: both
threshold: 5
title: 安らぎの工房
stillImageId: dariyaAfterHours01
```

**summary**:
```
王宮での重圧を抱えるダリヤが、星瓶堂でだけは鎧を下ろし、一人の人として息をつく。
```

**pages**:
```
speaker: ダリヤ, expression: normal
閉店後の星瓶堂に、ダリヤは細い瓶を抱えて現れた。
「公務の確認だ。……半分は、口実かもしれないが」

expression: sorrow
王宮印の封蝋は冷たく、瓶の中身よりも重く見えた。
ナーディルは黙って椅子を引き、温かい茶を置く。

speaker: ダリヤ, expression: sorrow
ダリヤは少しだけ目を伏せた。
「君の店は困るな。立ち上がる理由を、忘れてしまいそうになる」

expression: joy
その笑みは疲れていたが、初めて肩の力が抜けていた。
星瓶堂の夜は、どんな霊薬より静かに彼女を休ませた。

```

---

### dariya_10

```yaml
id: dariya_10
sourceFile: src/data/affectionEvents.js
routeMode: both
threshold: 10
title: 共鳴する真理
```

**summary**:
```
完璧でなければならないという呪縛から解き放たれ、ダリヤはナーディルの前でだけ弱さを共有する。
```

**pages**:
```
expression: normal
王宮錬金局の検証室は、音まで整いすぎていた。
ダリヤは手順書を閉じ、静かに眉を寄せる。

speaker: ダリヤ, expression: sorrow
「完璧な配合だ。……だが、君の作ったものより冷たい」
彼女は、星瓶堂から持ち帰った香りをそっと嗅いだ。

speaker: ダリヤ, expression: joy
「君の理論は、いつも少しだけ隙がある。だから人が入る余地があるんだ」
それは、王立錬金術師の評価ではなく、一人の友人としての言葉だった。

speaker: ダリヤ, expression: joy
「……また明日、君の店に行こう。少しだけ、あの隙間が恋しい」
彼女の横顔は、昼間よりずっと穏やかだった。

```

---

### dariya_20

```yaml
id: dariya_20
sourceFile: src/data/affectionEvents.js
routeMode: both
threshold: 20
title: 当たり前の重み
```

**summary**:
```
王宮の案件をナーディルに相談するダリヤ。王宮が忘れがちな「当たり前」を大切にするナーディルの視点を高く評価する。
```

**pages**:
```
speaker: ダリヤ, expression: normal
王宮の検証案件を、星瓶堂にも相談したい。君の目は、研究所と少し違う。

speaker: ナーディル, expression: surprise
王宮の案件を俺に？ 光栄ですけど、少し緊張しますね。

speaker: ダリヤ, expression: fun
緊張くらいでちょうどいい。王宮には、緊張しすぎて息を忘れる者も多いからね。

speaker: ナーディル, expression: normal
俺は、使う人が息をしやすい品かどうかを見たいです。

speaker: ダリヤ, expression: joy
だから君に頼みたい。私が忘れかける当たり前を、君はまだ覚えている。

```

---

### dariya_climax (route_climax)

```yaml
id: dariya_climax
sourceFile: src/data/affectionEvents.js
routeMode: both
threshold: 30
kind: route_climax
title: 座らせてくれる場所
stillImageId: dariyaLimitNight01
```

**summary**:
```
完璧であることを自らに強いるダリヤに対し、ナーディルは弱さも受け入れる安らぎの場を供し、二人の関係は公務を超えたものへと昇華する。
```

**pages**:
```
speaker: ダリヤ, expression: sorrow
王宮では、優秀でいることに慣れすぎた。できない私を, 私自身が許せない。

speaker: ナーディル, expression: sorrow
できない日があっても、ダリヤさんが積み重ねてきたものは消えません。

speaker: ダリヤ, expression: cry
君は簡単に言うな。……いや、簡単に聞こえるほど自然に言うから困る。

speaker: ナーディル, expression: normal
ここでは、王宮錬金術師である前に、ダリヤさんとして座ってくれればいい。

speaker: ダリヤ, expression: joy
……なら、少しだけ座らせてもらおう。立ち上がる時は、君の茶を一杯もらってからだ。

```

---

## 7. Affection Events - long_history Route

### dariya_5

```yaml
id: dariya_5
sourceFile: src/data/affectionEvents.js
routeMode: long_history
threshold: 5
title: 安らぎの工房
stillImageId: dariyaAfterHours01
```

**summary**:
```
王宮での重圧を抱えるダリヤが、星瓶堂でだけは鎧を下ろし、一人の人として息をつく。
```

**pages**:
```
speaker: ダリヤ, expression: normal
ダリヤは扉を閉めるなり、昔のように小さく息を吐いた。
「君は相変わらず、追い出すのが下手だな」

expression: sorrow
学生の頃も、王宮に入った後も。
彼女は本当に疲れた夜だけ、この店の灯を思い出し訪れていた。

speaker: ダリヤ, expression: sorrow
「私は、強い先輩でいられない日がある」
ダリヤは苦笑し、視線を卓上の茶へ落とした。

speaker: ダリヤ, expression: joy
「それでも君は、昔から同じ顔で茶を出す」
その声は、責めるにはあまりにも優しかった。

```

---

### dariya_10

```yaml
id: dariya_10
sourceFile: src/data/affectionEvents.js
routeMode: long_history
threshold: 10
title: 共鳴する真理
```

**summary**:
```
完璧でなければならないという呪縛から解き放たれ、ダリヤはナーディルの前でだけ弱さを共有する。
```

**pages**:
```
speaker: ダリヤ, expression: sorrow
夜の検証室で、ダリヤはついに筆を置いた。
「昔なら、もう少し上手に隠せたはずなのだが」

expression: normal
ナーディルは答えを急かず、ただ隣に立った。
その沈黙が、昔から彼女には何よりありがたかった。

speaker: ダリヤ, expression: sorrow
「私は、特別でなくなるのが怖かった」
ダリヤの声は震えたが、逃げることはなかった。

speaker: ダリヤ, expression: joy
「だが君は、特別でない私にも茶を出すのだろう」
彼女は泣きそうに笑い、ようやく前を向いた。

```

---

### dariya_20

```yaml
id: dariya_20
sourceFile: src/data/affectionEvents.js
routeMode: long_history
threshold: 20
title: 当たり前の重み
```

**summary**:
```
王宮の案件をナーディルに相談するダリヤ。王宮が忘れがちな「当たり前」を大切にするナーディルの視点を高く評価する。
```

**pages**:
```
speaker: ダリヤ, expression: normal
学生の頃、君と組んだ検証はいつも少し予定を外れた。手順書通りには進まなかったな。

speaker: ナーディル, expression: fun
ダリヤさんが怖い顔をして、最後には少し笑ってくれるまでが一組でしたね。

speaker: ダリヤ, expression: fun
生意気な後輩だったよ。だが、君の発想に救われたことも一度や二度ではない。

speaker: ナーディル, expression: normal
今も同じです。俺は、使う人が息をしやすい品かどうかを見たい。

speaker: ダリヤ, expression: joy
だからこそ頼みたい。立場が変わっても、君だけはその当たり前を忘れないでいてくれ。

```

---

### dariya_climax

```yaml
id: dariya_climax
sourceFile: src/data/affectionEvents.js
routeMode: long_history
threshold: 30
kind: route_climax
title: 座らせてくれる場所
stillImageId: dariyaLimitNight01
```

**summary**:
```
完璧であることを自らに強いるダリヤに対し、ナーディルは弱さも受け入れる安らぎの場を供し、二人の関係は公務を超えたものへと昇華する。
```

**pages**:
```
speaker: ダリヤ, expression: sorrow
昔、一度だけ君に言ったな。特別でなくなった私は、何者でいればいいのだろうと。

speaker: ナーディル, expression: normal
覚えています。俺はその時、何も立派な答えを返せなかった。茶を出すくらいしかできなくて。

speaker: ダリヤ, expression: cry
それで十分だった。君は私を慰めず、責めず、ただ座らせてくれた。

speaker: ナーディル, expression: sorrow
今も同じです。完璧でいられない日も、ここではダリヤさんとして座ってくれればいい。

speaker: ダリヤ, expression: joy
……なら、あの時と同じ茶をもらおう。立ち上がるのは、それを飲んでからにする。

```

---

### dariya_long_collaboration

```yaml
id: dariya_long_collaboration
sourceFile: src/data/affectionEvents.js
routeMode: long_history
threshold: 10
kind: long_history_still
title: 共同研究の記憶
stillImageId: dariyaPalaceCollaboration01
```

**summary**:
```
学生時代、王宮の研究施設で一緒に実験した日。ナーディルの自由な発想が、ダリヤの堅実さを補った。
```

---

### dariya_long_rain_corridor

```yaml
id: dariya_long_rain_corridor
sourceFile: src/data/affectionEvents.js
routeMode: long_history
threshold: 20
kind: long_history_still
title: 回廊の雨音
stillImageId: dariyaRainCorridor01
```

**summary**:
```
王宮の長い回廊で雨宿りした日。ダリヤが初めて弱音を吐いた瞬間。ナーディルは何も聞かなかった。
```

---

### dariya_long_palace_break

```yaml
id: dariya_long_palace_break
sourceFile: src/data/affectionEvents.js
routeMode: long_history
threshold: 5
kind: long_history_background
title: 束の間の休息
```

**summary**:
```
王宮の公務の合間に、ダリヤが星瓶堂に立ち寄った。昔のように、一言も喋らず茶を飲む。
```

---

### dariya_long_oasis_view

```yaml
id: dariya_long_oasis_view
sourceFile: src/data/affectionEvents.js
routeMode: long_history
threshold: 15
kind: long_history_background
title: オアシスの約束
```

**summary**:
```
オアシスを眺めながら、ダリヤが昔の約束を思い出した。二人で来たかった場所だと告げる。
```

---

## Summary

- Greetings: 4
- DailyTalks: 28
- AffectionEvents: 9
- Total: 41 entries
