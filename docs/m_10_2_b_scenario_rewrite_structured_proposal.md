# M10-2B Scenario Rewrite 構造化データ案

## 1. 変換方針の短い説明
- **話者と表情の割り当て**: 各ページの内容から、セリフの主体となる話者（`speaker`）を判定しました。地の文のみの場合は `speaker: ""` としています。表情（`expression`）は草案の指定リストに沿って推移するように割り当てました。
- **改行の保持**: 元草案の読みやすさを維持するため、文中の改行はそのまま保持しています。
- **文字数の確認**: すべてのページが60〜80字前後に収まっているため、草案をそのまま採用し、分割は行っていません。
- **禁則・条件遵守**: 「ダリヤ」の名称統一や、禁則語（店番、働く、雇う、再建）が含まれていないことを確認しています。`dariya` および `nader` のIDも変更していません。

## 2. Affection Events 構造化案

```javascript
[
  // ----------------------------------------------------
  // HAKIMA
  // ----------------------------------------------------
  {
    id: "hakima_5",
    heroineId: "hakima",
    threshold: 5,
    title: "もう一度、隣に",
    speaker: "ハキマ",
    expression: "anger",
    presentation: {
      displayMode: "still_intro_then_standing",
      stillImageId: "hakimaMorningVisit01",
      backgroundId: "shopExteriorDay",
      bgmId: "HAKIMA-01",
      heroineExpressions: ["anger", "normal", "sorrow", "joy"],
      naderExpressions: ["normal", "fun", "surprise", "joy"]
    },
    notes: {
      stillCandidates: ["hakimaMorningVisit01", "hakimaMarketArgument01"],
      backgroundCandidates: ["shopExteriorDay", "shopInteriorService", "marketCentral"],
      bgmCandidates: ["HAKIMA-01", "HAKIMA-02"]
    },
    summary: {
      normal: "ハキマが香材商会から預かった薬草を持ち込み、星瓶堂の目利きを試す。",
      long_history: "昔から目利きを競っていた二人。ハキマは、ナーディルの見立てに昔と同じ癖を見つけ、悔しさと懐かしさを同時に覚える。"
    },
    pages: [
      { speaker: "ハキマ", expression: "anger", text: "ハキマは薬草の束を抱え、星瓶堂の扉を勢いよく開けた。\n「今日は、あんたの目利きを見せてもらうから」" },
      { speaker: "", expression: "normal", text: "卓上に並んだ香草は、どれも似た色をしている。\nだが香りの奥に、乾いた土と甘い樹脂の違いがあった。" },
      { speaker: "ハキマ", expression: "sorrow", text: "ナーディルが客の用途を尋ねると、ハキマの耳がぴくりと動いた。\n「……ふうん。品だけじゃなく、使う人まで見るんだ」" },
      { speaker: "ハキマ", expression: "joy", text: "彼女は悔しそうに目をそらし、それでも小さく笑った。\n「まあ、今日のところは合格。少しだけ、頼りにしてあげる」" }
    ],
    routePages: {
      long_history: [
        { speaker: "ハキマ", expression: "normal", text: "ハキマは薬草の束を置くなり、懐かしそうに鼻を鳴らした。\n「こういう勝負、昔はよくやったよね」" },
        { speaker: "ハキマ", expression: "sorrow", text: "ナーディルが品を選ぶ手つきは、あの頃よりずっと落ち着いていた。\nそれが少し誇らしくて、少しだけ悔しい。" },
        { speaker: "ハキマ", expression: "sorrow", text: "「先に行くなら、置いていかないでよ」\nハキマは小さくつぶやき、すぐに耳まで赤くした。" },
        { speaker: "ハキマ", expression: "joy", text: "「今のは忘れて。……でも、隣で見立てるくらいは、許してあげる」\nその声は、怒ったふりをするには優しすぎた。" }
      ]
    }
  },
  {
    id: "hakima_10",
    heroineId: "hakima",
    threshold: 10,
    title: "狐の耳は嘘をつかない",
    speaker: "ハキマ",
    expression: "anger",
    presentation: {
      displayMode: "standing",
      stillImageId: null,
      backgroundId: "marketCentral",
      bgmId: "HAKIMA-01",
      heroineExpressions: ["anger", "surprise", "sorrow", "joy"],
      naderExpressions: ["fun", "surprise", "joy"]
    },
    notes: {
      stillCandidates: ["hakimaRainShelter01", "hakimaFestivalNight01"],
      backgroundCandidates: ["marketCentral", "spotFestivalStreet", "shopExteriorNight"],
      bgmCandidates: ["HAKIMA-01", "HAKIMA-06", "HAKIMA-07"]
    },
    summary: {
      normal: "市場での小さなトラブルを二人で解決する。耳と尻尾が本音を隠しきれない。",
      long_history: "昔から隣に立ちたかったハキマが、ようやく「並ぶ」と言える。"
    },
    pages: [
      { speaker: "ハキマ", expression: "anger", text: "市場の香料瓶を前に、ハキマは腕を組んでうなった。\n「この配合、悪くないけど……客には少し強すぎるわね」" },
      { speaker: "ハキマ", expression: "surprise", text: "ナーディルが薄める案を出すと、彼女は驚いた顔をした。\n「同じこと、考えてた。……先に言わないでよ」" },
      { speaker: "ハキマ", expression: "sorrow", text: "「でも、そういうところは嫌いじゃない」\n言った直後、ハキマの耳が跳ね、尻尾がふわりと揺れた。" },
      { speaker: "ハキマ", expression: "joy", text: "彼女は慌てて背を向ける。\n「見てない！ あんたは何も見てない！ ……でも、また一緒に見立てるから」" }
    ],
    routePages: {
      long_history: [
        { speaker: "", expression: "sorrow", text: "祭りの灯が、市場の瓶を金色に照らしていた。\nハキマは昔のように、ナーディルの隣で香りを確かめる。" },
        { speaker: "ハキマ", expression: "sorrow", text: "「ずっと追いかけてた。あんたの背中ばかり見てた」\n彼女の耳は伏せられ、声だけがまっすぐだった。" },
        { speaker: "ハキマ", expression: "joy", text: "「でも、今は違う。私は隣に立つ」\nハキマは照れ隠しのように、ナーディルの腕を軽くつついた。" },
        { speaker: "ハキマ", expression: "joy", text: "「だから、勝手に先へ行かないで。……行くなら、私も連れていきなさいよ」\n尻尾は、隠しきれないほど嬉しそうに揺れていた。" }
      ]
    }
  },

  // ----------------------------------------------------
  // MIRA
  // ----------------------------------------------------
  {
    id: "mira_5",
    heroineId: "mira",
    threshold: 5,
    title: "普通の女の子として",
    speaker: "ミラ",
    expression: "student",
    presentation: {
      displayMode: "standing",
      stillImageId: null,
      backgroundId: "universityCourtyard",
      bgmId: "MIRA-01",
      heroineExpressions: ["student", "normal", "anger", "sorrow", "surprise", "joy"],
      naderExpressions: ["normal", "fun", "joy"]
    },
    notes: {
      stillCandidates: ["miraAfterSchool01"],
      backgroundCandidates: ["universityCourtyard", "shopInteriorService", "miraRoom"],
      bgmCandidates: ["MIRA-01", "MIRA-02"]
    },
    summary: {
      normal: "課題の素材選びで迷うミラ。ナーディルは迷っている理由を一緒に考える。",
      long_history: "昔からナーディルだけは、ミラの迷いに付き合ってくれた。"
    },
    pages: [
      { speaker: "ミラ", expression: "student", text: "放課後、ミラは課題用の素材帳を抱えて星瓶堂を訪れた。\n「先輩、今日は正解を選びに来たわけではないんです」" },
      { speaker: "ミラ", expression: "sorrow", text: "彼女は瓶を二つ並べ、困ったように眉を寄せる。\n「どちらも正しい。だから、どちらを選ぶべきか迷っています」" },
      { speaker: "", expression: "surprise", text: "ナーディルが「迷っていい」と言うと、ミラは目を丸くした。\n天才なら即答するべきだと、ずっと思っていたから。" },
      { speaker: "ミラ", expression: "joy", text: "「先輩は、少しずるいです」\n彼女は小さく笑う。\n「そんな言い方をされたら、私でいたくなります」" }
    ],
    routePages: {
      long_history: [
        { speaker: "ミラ", expression: "normal", text: "ミラは古い課題帳を開き、懐かしそうに指でなぞった。\n「この式、先輩に何度も直してもらいましたね」" },
        { speaker: "ミラ", expression: "sorrow", text: "「みんなは答えだけを褒めました。でも先輩は、迷った跡を見てくれた」\n彼女の声は、少しだけ震えていた。" },
        { speaker: "ミラ", expression: "surprise", text: "ナーディルが笑うと、ミラは胸の前で帳面を抱きしめる。\n「だから私は、またここに来たんです」" },
        { speaker: "ミラ", expression: "joy", text: "「天才ではなく、ただの私として。……先輩の隣で、もう一度考えたくて」\nその笑顔は、少し照れくさそうだった。" }
      ]
    }
  },
  {
    id: "mira_10",
    heroineId: "mira",
    threshold: 10,
    title: "商人の目利き",
    speaker: "ミラ",
    expression: "normal",
    presentation: {
      displayMode: "standing",
      stillImageId: null,
      backgroundId: "spotStarView",
      bgmId: "MIRA-01",
      heroineExpressions: ["normal", "fun", "sorrow", "surprise", "joy"],
      naderExpressions: ["normal", "surprise", "joy"]
    },
    notes: {
      stillCandidates: ["miraStarryRooftop01", "miraAssignmentConsult01"],
      backgroundCandidates: ["spotStarView", "shopInteriorWorkshop", "miraRoom"],
      bgmCandidates: ["MIRA-01", "MIRA-06", "MIRA-07"]
    },
    summary: {
      normal: "効率だけではない商品選びを見て、ミラは自分の夢として未来を考えたいと言う。",
      long_history: "自分の意志で、星瓶堂の未来を一緒に考えたいと伝える。"
    },
    pages: [
      { speaker: "ミラ", expression: "normal", text: "ミラは星瓶堂の帳面を開き、真剣な顔で数字を並べた。\n「この配合なら、もっと多くの人に届けられます」" },
      { speaker: "", expression: "sorrow", text: "けれどナーディルは、最後に客の手紙を読み返した。\n効率だけでは測れない願いが、そこには残っていた。" },
      { speaker: "ミラ", expression: "fun", text: "ミラは少し悔しそうに、そして嬉しそうに笑った。\n「商人の目だけでは、見落とすものがありますね」" },
      { speaker: "ミラ", expression: "joy", text: "「先輩の隣でなら、正解を出す前の私でいられます」\nその言葉は、星明かりよりも静かに輝いていた。" }
    ],
    routePages: {
      long_history: [
        { speaker: "ミラ", expression: "normal", text: "星空の下、ミラは帳面を閉じた。\n「昔から、先輩は私の答えより、考えている顔を見ていました」" },
        { speaker: "ミラ", expression: "fun", text: "「それが少し悔しくて、でも、とても嬉しかったんです」\n彼女は夜風に揺れる布を押さえ、小さく笑う。" },
        { speaker: "ミラ", expression: "joy", text: "「私は天才としてではなく、私の夢として、星瓶堂の未来を考えたい」\nその瞳は、もう迷っていなかった。" },
        { speaker: "ミラ", expression: "joy", text: "「先輩。これからも、私が答えを急ぎそうになったら止めてください」\nミラは照れながら、そっと隣に並んだ。" }
      ]
    }
  },

  // ----------------------------------------------------
  // DARIYA
  // ----------------------------------------------------
  {
    id: "dariya_5",
    heroineId: "dariya",
    threshold: 5,
    title: "安らぎの工房",
    speaker: "ダリヤ",
    expression: "normal",
    presentation: {
      displayMode: "still_intro_then_standing",
      stillImageId: "dariyaAfterHours01",
      backgroundId: "shopInteriorWorkshop",
      bgmId: "DARIYA-01",
      heroineExpressions: ["normal", "sorrow", "fun", "joy"],
      naderExpressions: ["normal", "sorrow", "joy"]
    },
    notes: {
      stillCandidates: ["dariyaAfterHours01"],
      backgroundCandidates: ["shopInteriorWorkshop", "shopInteriorService"],
      bgmCandidates: ["DARIYA-01", "DARIYA-02"]
    },
    summary: {
      normal: "王宮の検証品を持ち込んだダリヤ。星瓶堂の落ち着いた空気に少し気が緩む。",
      long_history: "昔から弱さを見せられる場所だった星瓶堂で、ダリヤは深い安心を覚える。"
    },
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "閉店後の星瓶堂に、ダリヤは細い瓶を抱えて現れた。\n「公務の確認だ。……半分は、口実かもしれないが」" },
      { speaker: "", expression: "sorrow", text: "王宮印の封蝋は冷たく、瓶の中身よりも重く見えた。\nナーディルは黙って椅子を引き、温かい茶を置く。" },
      { speaker: "ダリヤ", expression: "sorrow", text: "ダリヤは少しだけ目を伏せた。\n「君の店は困るな。立ち上がる理由を、忘れてしまいそうになる」" },
      { speaker: "", expression: "joy", text: "その笑みは疲れていたが、初めて肩の力が抜けていた。\n星瓶堂の夜は、どんな霊薬より静かに彼女を休ませた。" }
    ],
    routePages: {
      long_history: [
        { speaker: "ダリヤ", expression: "normal", text: "ダリヤは扉を閉めるなり、昔のように小さく息を吐いた。\n「君は相変わらず、追い出すのが下手だな」" },
        { speaker: "", expression: "sorrow", text: "学生の頃も、王宮に入った後も。\n彼女は本当に疲れた夜だけ、この店の灯を思い出していた。" },
        { speaker: "ダリヤ", expression: "sorrow", text: "「私は、強い先輩でいられない日がある」\nダリヤは苦笑し、視線を卓上の茶へ落とした。" },
        { speaker: "ダリヤ", expression: "joy", text: "「それでも君は、昔から同じ顔で茶を出す」\nその声は、責めるにはあまりにも優しかった。" }
      ]
    }
  },
  {
    id: "dariya_10",
    heroineId: "dariya",
    threshold: 10,
    title: "共鳴する真理",
    speaker: "ダリヤ",
    expression: "normal",
    presentation: {
      displayMode: "standing",
      stillImageId: null,
      backgroundId: "palaceLab",
      bgmId: "DARIYA-03",
      heroineExpressions: ["normal", "anger", "fun", "sorrow", "joy"],
      naderExpressions: ["normal", "anger", "sorrow", "joy"]
    },
    notes: {
      stillCandidates: ["dariyaPalaceCollaboration01", "dariyaLimitNight01"],
      backgroundCandidates: ["palaceLab", "palaceCorridor", "shopInteriorWorkshop"],
      bgmCandidates: ["DARIYA-03", "DARIYA-06", "DARIYA-07"]
    },
    summary: {
      normal: "完璧でなくても届くものがある。ダリヤは錬金術の温度を思い出す。",
      long_history: "限界に近づいたダリヤが、もう一度歩く力を得る。"
    },
    pages: [
      { speaker: "", expression: "normal", text: "王宮錬金局の検証室は、音まで整いすぎていた。\nダリヤは手順書を閉じ、静かに眉を寄せる。" },
      { speaker: "ダリヤ", expression: "anger", text: "「正しい。だが、冷たい」\n彼女の言葉に、ナーディルは完成品を使う人の暮らしを問い返した。" },
      { speaker: "ダリヤ", expression: "fun", text: "ダリヤは驚き、それから少し悔しそうに笑った。\n「君は、私が忘れかけていた場所から真理を見るのだな」" },
      { speaker: "ダリヤ", expression: "joy", text: "「完璧でなくても、届くものがある」\n彼女は小さくうなずく。\nその目には、王宮の灯とは違う光が戻っていた。" }
    ],
    routePages: {
      long_history: [
        { speaker: "ダリヤ", expression: "sorrow", text: "夜の検証室で、ダリヤはついに筆を置いた。\n「昔なら、もう少し上手に隠せたはずなのだが」" },
        { speaker: "", expression: "normal", text: "ナーディルは答えを急かず、ただ隣に立った。\nその沈黙が、昔から彼女には何よりありがたかった。" },
        { speaker: "ダリヤ", expression: "sorrow", text: "「私は、特別でなくなるのが怖かった」\nダリヤの声は震えたが、逃げることはなかった。" },
        { speaker: "ダリヤ", expression: "joy", text: "「だが君は、特別でない私にも茶を出すのだろう」\n彼女は泣きそうに笑い、ようやく前を向いた。" }
      ]
    }
  }
]
```

## 3. Endings 構造化案

```javascript
[
  // ----------------------------------------------------
  // HAKIMA ENDINGS
  // ----------------------------------------------------
  {
    id: "hakima_good",
    heroineId: "hakima",
    rank: "good",
    title: "あたたかな香りは、隣から",
    conditionText: "Affection 80以上 かつ Reputation 40以上",
    presentation: {
      backgroundId: "spotFestivalStreet",
      stillImageId: "hakimaFestivalNight01",
      bgmId: "HAKIMA-06",
      expression: "joy"
    },
    summary: "星瓶堂とルハーン香材商会の協力が評判を呼ぶ。ハキマはこれからもナーディルの隣で香りを選ぶと言う。",
    pages: [
      { speaker: "", expression: "joy", text: "星瓶堂の棚に、ルハーン商会の香り袋が並ぶようになった。\n客はその香りを、若店主と狐の鑑定士の品だと噂した。" },
      { speaker: "ハキマ", expression: "joy", text: "ハキマは照れたように胸を張る。\n「当然でしょ。私が見立てた香りなんだから」" },
      { speaker: "ハキマ", expression: "joy", text: "それから彼女は、少しだけ声を落とした。\n「でも、あんたと選んだから……悪くない品になったわ」" },
      { speaker: "", expression: "joy", text: "星瓶堂の灯の下、ふたりの影が並ぶ。\n競い合う声も、笑い声も、これからの商いに溶けていった。" }
    ]
  },
  {
    id: "hakima_normal",
    heroineId: "hakima",
    rank: "normal",
    title: "また香りを選ぶ日",
    conditionText: "Affection 40以上79以下、または Affection 80以上かつReputation 40未満",
    presentation: {
      backgroundId: "marketCentral",
      stillImageId: null,
      bgmId: "HAKIMA-01",
      expression: "joy"
    },
    summary: "恋としてはまだ始まりかけだが、ハキマは星瓶堂に顔を出し続ける。互いに認め合う関係が残る。",
    pages: [
      { speaker: "", expression: "normal", text: "営業を重ねるうち、ハキマの目は少しだけ柔らかくなった。\nそれでも口ぶりは、相変わらず手厳しい。" },
      { speaker: "ハキマ", expression: "joy", text: "「次はもっと難しい香材を持ってくるから。逃げないでよね」\nその約束が、妙に嬉しく響いた。" }
    ]
  },
  {
    id: "hakima_bad",
    heroineId: "hakima",
    rank: "bad",
    title: "言えなかった香り",
    conditionText: "Affection 40未満",
    presentation: {
      backgroundId: "shopExteriorDay",
      stillImageId: null,
      bgmId: "HAKIMA-02",
      expression: "sorrow"
    },
    summary: "距離は縮まりきらないが、互いの目利きは認め合う。再会の余地を残す。",
    pages: [
      { speaker: "", expression: "sorrow", text: "ハキマは最後まで、素直な言葉を選べなかった。\nそれでも棚の一角には、彼女が選んだ香材が残っている。" },
      { speaker: "", expression: "sorrow", text: "扉が閉まる前、白い尻尾が一度だけ揺れた。\nまた来る、とは言わない。でも来ないとも言わなかった。" }
    ]
  },

  // ----------------------------------------------------
  // MIRA ENDINGS
  // ----------------------------------------------------
  {
    id: "mira_good",
    heroineId: "mira",
    rank: "good",
    title: "正解の前に、君がいる",
    conditionText: "Affection 80以上 かつ Reputation 40以上",
    presentation: {
      backgroundId: "spotStarView",
      stillImageId: "miraStarryRooftop01",
      bgmId: "MIRA-06",
      expression: "joy"
    },
    summary: "ミラは星瓶堂の商品企画に助言を続けるが、それは義務でも課題でもない。自分の夢としてナーディルの隣に立つ。",
    pages: [
      { speaker: "ミラ", expression: "joy", text: "ミラの提案で、星瓶堂の商品は少しずつ遠くの街へ届き始めた。\nそれでも彼女は、数字だけで喜ぶことはなかった。" },
      { speaker: "ミラ", expression: "joy", text: "「先輩、この品を受け取った人の顔まで想像しましょう」\nそう言う彼女は、もう正解だけを追っていない。" },
      { speaker: "ミラ", expression: "joy", text: "「天才だから、ではありません。私が、ここで考えたいんです」\nミラは少し頬を染め、まっすぐに笑った。" },
      { speaker: "", expression: "joy", text: "星瓶堂の灯と、夜空の星。\nふたりで選ぶ未来は、どんな答えよりも温かかった。" }
    ]
  },
  {
    id: "mira_normal",
    heroineId: "mira",
    rank: "normal",
    title: "学びの途中で",
    conditionText: "Affection 40以上79以下、または Affection 80以上かつReputation 40未満",
    presentation: {
      backgroundId: "universityCourtyard",
      stillImageId: null,
      bgmId: "MIRA-01",
      expression: "joy"
    },
    summary: "まだ恋と呼ぶには控えめだが、ミラは星瓶堂を安心できる相談先として選び続ける。",
    pages: [
      { speaker: "ミラ", expression: "normal", text: "ミラは新しい課題を抱え、また星瓶堂を訪れた。\n「先輩、今度は少し難しい相談です」" },
      { speaker: "", expression: "joy", text: "その声には、以前より少しだけ柔らかさがあった。\n答えより先に、話したい相手がいる。それだけで十分だった。" }
    ]
  },
  {
    id: "mira_bad",
    heroineId: "mira",
    rank: "bad",
    title: "少し遠回り",
    conditionText: "Affection 40未満",
    presentation: {
      backgroundId: "shopInteriorService",
      stillImageId: null,
      bgmId: "MIRA-02",
      expression: "sorrow"
    },
    summary: "ミラはまだ天才としての顔を崩せない。それでも、星瓶堂で迷った時間は彼女に残る。",
    pages: [
      { speaker: "", expression: "sorrow", text: "ミラは最後まで、完璧な答えを探そうとしていた。\nナーディルの前でさえ、少し肩の力が抜けなかった。" },
      { speaker: "ミラ", expression: "sorrow", text: "けれど帰り際、彼女は小さく振り返る。\n「また、相談に来てもいいですか」\nその問いだけは、彼女自身の声だった。" }
    ]
  },

  // ----------------------------------------------------
  // DARIYA ENDINGS
  // ----------------------------------------------------
  {
    id: "dariya_good",
    heroineId: "dariya",
    rank: "good",
    title: "静かな灯のそばで",
    conditionText: "Affection 80以上 かつ Reputation 40以上",
    presentation: {
      backgroundId: "shopInteriorWorkshop",
      stillImageId: "dariyaRainCorridor01", // Or dariyaAfterHours01
      bgmId: "DARIYA-06",
      expression: "joy"
    },
    summary: "ダリヤは王宮の重圧から逃げるのではなく、星瓶堂で息を整えながら向き合う道を選ぶ。",
    pages: [
      { speaker: "", expression: "joy", text: "ダリヤは王宮を去らなかった。\nただし、もう一人で重さを抱え込むことはやめた。" },
      { speaker: "ダリヤ", expression: "fun", text: "検証品の相談という名目で、彼女は時折星瓶堂を訪れる。\n茶を飲み、少し皮肉を言い、少しだけ笑う。" },
      { speaker: "ダリヤ", expression: "joy", text: "「私はまだ完璧ではない」\nダリヤは静かに言った。\n「だが、それを君に見られるのは、もう怖くない」" },
      { speaker: "", expression: "joy", text: "夜の工房に、柔らかな灯がともる。\nその明かりは、王宮へ戻る彼女の背中を静かに支えていた。" }
    ]
  },
  {
    id: "dariya_normal",
    heroineId: "dariya",
    rank: "normal",
    title: "気配を残して",
    conditionText: "Affection 40以上79以下、または Affection 80以上かつReputation 40未満",
    presentation: {
      backgroundId: "shopInteriorService",
      stillImageId: null,
      bgmId: "DARIYA-01",
      expression: "normal"
    },
    summary: "ダリヤはまだ弱さを言葉にしきれないが、星瓶堂を安らげる場所として認め始める。",
    pages: [
      { speaker: "", expression: "normal", text: "ダリヤは以前より少しだけ長く、星瓶堂に留まるようになった。\nそれでも本音は、まだ言葉になりきらない。" },
      { speaker: "ダリヤ", expression: "normal", text: "帰り際、彼女は振り返らずに告げる。\n「また確認したい品があれば来る」\nその声は、どこか穏やかだった。" }
    ]
  },
  {
    id: "dariya_bad",
    heroineId: "dariya",
    rank: "bad",
    title: "まだほどけない心",
    conditionText: "Affection 40未満",
    presentation: {
      backgroundId: "palaceCorridor",
      stillImageId: null,
      bgmId: "DARIYA-02",
      expression: "sorrow"
    },
    summary: "距離は縮まりきらず、ダリヤは王宮の顔を崩せない。それでも星瓶堂の灯は記憶に残る。",
    pages: [
      { speaker: "", expression: "sorrow", text: "ダリヤは最後まで、疲れた顔を隠そうとした。\n王宮錬金術師としての姿は、美しく、少し遠かった。" },
      { speaker: "", expression: "sorrow", text: "けれど夜の店先で、彼女は一度だけ足を止める。\n星瓶堂の灯を見つめる横顔に、言えなかった弱音が残っていた。" }
    ]
  }
]
```

## 4. 実装時に注意すべき点
- **`presentation` の取り扱い**: 草案に記載されていたスチルやBGMの「候補」は、本構造化データにおいて1つの主候補を `presentation` 内に設定し、残りを `notes` に退避させました。実装時には本採用されたIDで決め打ちするか、さらに調整を加えてください。
- **IFルート（long_history）のフォールバック**: 指示通り、`10`イベントなどにおいて `long_history` が実装未対応のままとなる場合は、`normal` 本文へフォールバックさせるロジックを `App.jsx` 内に維持・確認する必要があります。
- **文字量と改行の調整**: 本文は原則草案そのままですが、ゲームエンジンのレンダリング仕様によっては自動改行・手動改行の微調整が実装段階で必要となる可能性があります。

## 5. 要確認点
- **Normal/Bad Ending の演出**: Normal/Bad Ending における `backgroundId` や `bgmId` は、草案に明記がなかったため、それぞれのイベントの雰囲気や使用候補から適当と思われるものをデフォルトとして設定しました。問題があれば修正をお願いいたします。
- **話者の空指定**: ナレーションや地の文について、`speaker: ""` を設定しています。実装側のコンポーネントが空文字列で正しく（名前枠を非表示にするなど）処理できるか、事前に確認してください。
