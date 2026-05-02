/**
 * Affection Event Definitions for Made in Maghribal
 *
 * Normal route text lives in `text`.
 * Route-specific IF text lives in `routePages.long_history`.
 */

export const AFFECTION_EVENTS = {
  hakima: [
    {
      id: "hakima_0",
      heroineId: "hakima",
      threshold: 0,
      kind: "flashback_intro", // route intro / flashback
      title: "牙と天秤の出会い",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "HAKIMA-01"
      },
      summary: "開店前、ハキマとの出会いを思い出す。市場での香材を巡る小競り合いが、すべての始まりだった。",
      pages: [
        { 
          speaker: "ナーディル", 
          expression: "normal", 
          text: "今日はハキマが来る日か。……あいつと初めて会ったのも、市場に熱い風が吹いていた日だったな。",
          backgroundId: "shopExteriorDay"
        },
        { 
          speaker: "ハキマ", 
          expression: "anger", 
          text: "「ちょっと、そこのあんた！ その樹脂、乾かし方が甘いわ。そんなの棚に並べるつもり？」\n市場の喧騒と香辛料の匂い。活気ある屋台の並ぶ通りで、見知らぬ狐獣人の女性にいきなり怒鳴られたんだ。",
          backgroundId: "marketCentral"
        },
        { 
          speaker: "ナーディル", 
          expression: "surprise", 
          text: "「え……？ ああ、確かに少し湿っているな。助かるよ」\n俺が素直に礼を言うと、彼女は拍子抜けしたような顔をしていた。",
          backgroundId: "marketCentral"
        },
        { 
          speaker: "ハキマ", 
          expression: "normal", 
          text: "「……ふん、素直なだけが取り柄ね。星瓶堂の跡取りなら、もっと鼻を鍛えなさいよ」\n厳しい声だった。でも、不思議と嫌な感じはしなかった。",
          backgroundId: "marketCentral"
        },
        { 
          speaker: "ナーディル", 
          expression: "joy", 
          text: "あの頃から、ハキマはずっと鋭かった。今じゃ欠かせない協力者の一人だ。……よし、準備しよう。",
          backgroundId: "shopExteriorDay"
        }
      ]
    },
    {
      id: "hakima_5",
      heroineId: "hakima",
      threshold: 5,
      title: "もう一度、隣に",
      stillImageId: "hakimaMorningVisit01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-01",
        heroineExpressions: ["anger", "normal", "sorrow", "joy"],
        naderExpressions: ["normal", "sorrow"]
      },
      summary: "優等生だったナーディルを一方的に気にしていたハキマは、若店主としての彼の見立てを試しながら、その成長を認め始める。",
      pages: [
        { speaker: "", expression: "normal", text: "ハキマは薬草の束を抱え、星瓶堂の扉を勢いよく開けた。" },
        { speaker: "ハキマ", expression: "anger", text: "今日は、あんたの目利きを見せてもらうから" },
        { speaker: "ナーディル", expression: "normal", text: "卓上に並んだ香草は、どれも似た色をしている。\nけれど用途を尋ねると、乾いた土と甘い樹脂の違いが少しずつ見えてきた。" },
        { speaker: "", expression: "sorrow", text: "「……ふうん。品だけじゃなく、使う人まで見るんだ」\nハキマの耳が、ほんの少しだけ揺れる。" },
        { speaker: "ナーディル", expression: "joy", text: "優等生だった頃の癖かな。答えだけじゃなくて、理由まで知りたくなるんだ" },
        { speaker: "", expression: "joy", text: "彼女は悔しそうに目をそらし、それでも小さく笑った。" },
        { speaker: "ハキマ", expression: "joy", text: "まあ、今日のところは合格。少しだけ、頼りにしてあげる" }
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
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-01",
        heroineExpressions: ["anger", "surprise", "sorrow", "joy"],
        naderExpressions: ["normal", "surprise", "joy"]
      },
      summary: "素直になれないハキマは、ナーディルと同じ目線で品を選べたことに喜びを覚える。優等生だった彼を気にしていた過去が、少しだけにじむ。",
      pages: [
        { speaker: "", expression: "normal", text: "閉店後の店先に、まだ昼の熱を含んだ風が残っていた。市場の香料瓶を前に、ハキマは腕を組んでうなった。" },
        { speaker: "ハキマ", expression: "anger", text: "この配合、悪くないけど……客には少し強すぎるわね" },
        { speaker: "ナーディル", expression: "normal", text: "薄めるなら、砂蜜よりも乾いた柑橘皮かな。香りが丸くなると思う" },
        { speaker: "", expression: "normal", text: "俺が言うと、ハキマは目を丸くした。" },
        { speaker: "ハキマ", expression: "surprise", text: "同じこと、考えてた。……先に言わないでよ" },
        { speaker: "", expression: "normal", text: "その声は不満そうなのに、耳だけは嬉しそうに立っている。" },
        { speaker: "ハキマ", expression: "sorrow", text: "昔からそう。あんた、涼しい顔で正解に近づくから、見てるこっちが焦るのよ" },
        { speaker: "", expression: "normal", text: "彼女は慌てて背を向ける。" },
        { speaker: "ハキマ", expression: "joy", text: "見てない！ あんたは何も見てない！ ……でも、また一緒に見立てるから" }
      ],
      routePages: {
        long_history: [
          { speaker: "", expression: "normal", text: "市場の棚を前に、ふたりは同時に同じ香料瓶を指差した。" },
          { speaker: "", expression: "normal", text: "ハキマは目を丸くし、やがて呆れたように笑う。" },
          { speaker: "ハキマ", expression: "normal", text: "……昔は、あんたの方がいつも外してたのに" },
          { speaker: "", expression: "normal", text: "少しだけ寂しそうに、でも誇らしげに彼女は言う。" },
          { speaker: "ナーディル", expression: "fun", text: "君に負けたくなくて、ずっと覚えていたからな。香りの強さも、瓶の癖も" },
          { speaker: "ハキマ", expression: "joy", text: "やっと追いついてきたってことね。なら、これからは対等だ" },
          { speaker: "", expression: "normal", text: "狐の耳が、嬉しさを隠しきれずにぴんと立っていた。" },
          { speaker: "ハキマ", expression: "joy", text: "言っとくけど、まだまだ負けないからね" },
          { speaker: "", expression: "normal", text: "その顔は、市場のどの灯りよりも眩しかった。" }
        ]
      }
    },
    {
      id: "hakima_20",
      heroineId: "hakima",
      threshold: 20,
      title: "重なる目利き",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "HAKIMA-01"
      },
      summary: "ルハーン商会からの大口相談を巡り、ハキマはナーディルの目利きを認め、素直になれないながらも信頼を口にする。",
      pages: [
        { speaker: "", expression: "normal", text: "朝の光が店先の布幕を照らしていた。" },
        { "speaker": "ハキマ", "expression": "normal", "text": "ルハーン商会から、大口の香材相談が来たの。星瓶堂の目利きも借りたいって。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "君の商会から正式に？ それは責任重大だな。" },
        { "speaker": "ハキマ", "expression": "anger", "text": "勘違いしないで。あんたが少しは信用できるって、私が報告しただけよ。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "それなら、なおさら嬉しいよ。ハキマが見てくれた星瓶堂の信用だ。" },
        { "speaker": "ハキマ", "expression": "surprise", "text": "……そういう言い方、ずるい。怒る準備をしてたのに、調子が狂うじゃない。" },
        { "speaker": "ハキマ", "expression": "joy", "text": "でも、まあ。あんたが昔から真面目に品を見てたのは知ってる。……だから推薦したのよ。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ハキマ", expression: "normal", text: "ルハーン商会から、大口の香材相談が来たの。……昔のあんたなら、聞いただけで逃げてたでしょうね。" },
          { speaker: "ナーディル", expression: "fun", text: "否定しきれないな。昔は、君に香材の束を渡されるだけで身構えてた。" },
          { speaker: "ハキマ", expression: "anger", text: "それでも最後まで付き合ったじゃない。悔しいけど、あんたの目利きは昔から当てにしてたのよ。" },
          { speaker: "ナーディル", expression: "joy", text: "なら今回は、昔より胸を張って隣に立てるように頑張るよ。" },
          { speaker: "ハキマ", expression: "sorrow", text: "……そういう言い方、ずるい。こっちは何年も前から、その隣を空けてたみたいじゃない。" },
          { speaker: "ハキマ", expression: "joy", text: "でも、いいわ。今度こそ、私もちゃんと並ぶ。香材も、店も、あんたのことも見逃さないから。" }
        ]
      }
    },
    {
      id: "hakima_climax",
      heroineId: "hakima",
      threshold: 30,
      kind: "route_climax",
      title: "隣に並ぶ覚悟",
      stillImageId: "hakimaFestivalNight01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-01"
      },
      summary: "成長するナーディルに焦りを感じるハキマに対し、ナーディルは共に歩む決意を伝え、二人は対等なパートナーとしての絆を深める。",
      pages: [
        { "speaker": "ハキマ", "expression": "sorrow", "text": "あんたが星瓶堂の店主らしくなるほど、少しだけ遠くに見える時があるの。" },
        { "speaker": "ナーディル", "expression": "sorrow", "text": "遠くへ行きたいわけじゃない。俺は、この店で誰かと向き合える店主になりたいんだ。" },
        { "speaker": "ハキマ", "expression": "anger", "text": "だったら、隣を空けておきなさいよ。勝手に一人で格好つけないで。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "分かった。難しい香材も、厄介な客も、君と一緒に見立てたい。" },
        { "speaker": "ハキマ", "expression": "sorrow", "text": "優等生だったあんたを見て、勝手に焦って、勝手に悔しがってた。……そういうの、もう終わりにしたいの。" },
        { "speaker": "ハキマ", "expression": "joy", "text": "これからは、ちゃんと隣で言うわ。間違ってる時は怒るし、良かった時は……少しだけ褒めてあげる。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ハキマ", expression: "sorrow", text: "子どもの頃、どっちが先に自分の店を持つかって勝負したの、覚えてる？" },
          { speaker: "ナーディル", expression: "normal", text: "覚えてる。君は、負けた方が勝った方の棚を一緒に並べるって言ってた。" },
          { speaker: "ハキマ", expression: "anger", text: "違うわよ。あれは負けた時の約束じゃない。……隣にいるための口実だったの。" },
          { speaker: "ナーディル", expression: "surprise", text: "ハキマ……。俺は、君が隣にいるのを当たり前みたいに思いすぎていたのかもしれない。" },
          { speaker: "ハキマ", expression: "sorrow", text: "当たり前だったのよ、私には。あんたが星瓶堂を継ぐなら、その隣で香りを見たいって、ずっと思ってた。" },
          { speaker: "ナーディル", expression: "joy", text: "今度は、ちゃんと言うよ。星瓶堂の隣に、君がいてほしい。" },
          { speaker: "ハキマ", expression: "joy", text: "今さら気づいたなら、遅れた分だけちゃんと空けておきなさい。そこは、私の場所なんだから。" }
        ]
      }
    },
    {
      id: "hakima_long_market_dawn",
      heroineId: "hakima",
      routeMode: "long_history",
      threshold: 10,
      kind: "long_history_still",
      title: "市場の朝駆け",
      stillImageId: "hakimaMarketArgument01",
      presentation: {
        backgroundId: "marketCentral",
        bgmId: "HAKIMA-01"
      },
      summary: "昔、市場開き前に二人で香材を買い付けた朝。値切り合いの末、店主に笑われた思い出。",
      pages: [
        { speaker: "ハキマ", expression: "anger", text: "……昔、市場開き前に一緒に香材を買い付けた朝、覚えてる？" },
        { speaker: "ナーディル", expression: "fun", text: "覚えてる。君の値切り方があまりに真剣で、店主まで笑っていた。" },
        { speaker: "ハキマ", expression: "surprise", text: "あんたも横で妙な理屈を足すからでしょ。あの時、どっちが店主なんだか分からなかったわ。" },
        { speaker: "ハキマ", expression: "joy", text: "でも、あんたの隣で香りを選ぶのは……昔から、悪くなかったのよ。" }
      ]
    },
    {
      id: "hakima_long_rain_memory",
      heroineId: "hakima",
      routeMode: "long_history",
      threshold: 20,
      kind: "long_history_still",
      title: "雨宿りの午後",
      stillImageId: "hakimaRainShelter01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-01"
      },
      summary: "突然の雨に濡れながら、軒下で乾くのを待った午後。濡れた狐の耳を拭いてやったらいじられた。",
      pages: [
        { speaker: "ハキマ", expression: "sorrow", text: "……あの雨の日は、本当に困った。香材は濡れるし、耳は重くなるし、散々だったわ。" },
        { speaker: "ナーディル", expression: "normal", text: "君の耳がびしょ濡れで、ずいぶん寒そうだった。だから布を貸したんだ。" },
        { speaker: "ハキマ", expression: "surprise", text: "貸しただけじゃないでしょ。あんた、何も言わずに耳まで拭いたじゃない。" },
        { speaker: "ハキマ", expression: "joy", text: "……その、嬉しかったのよ。昔から。言わないけど。今のも忘れなさい。" }
      ]
    },
    {
      id: "hakima_long_merchant_report",
      heroineId: "hakima",
      routeMode: "long_history",
      threshold: 5,
      kind: "long_history_background",
      title: "商会の近況",
      presentation: {
        backgroundId: "shopInteriorService",
        bgmId: "HAKIMA-01"
      },
      summary: "ルハーン商会の新しい仕入れ先について報告に来たハキマ。昔と同じように、細かい指摘をしてくる。",
      pages: [
        { speaker: "ハキマ", expression: "normal", text: "ルハーン商会の新しい仕入れ先、確認してきたわ。癖は強いけど、星瓶堂の棚に合いそうなのもあった。" },
        { speaker: "ナーディル", expression: "fun", text: "君らしく、細かいところまで見てきたんだな。昔から仕入れ先の癖を見抜くのは得意だった。" },
        { speaker: "ハキマ", expression: "anger", text: "当たり前よ。……でも、あんたが喜びそうなのを選んだのは、余計な一言だったかしら。" },
        { speaker: "ナーディル", expression: "joy", text: "いや、嬉しいよ。昔から、君の選ぶ香材は俺の店に不思議と馴染むんだ。" }
      ]
    },
    {
      id: "hakima_long_festival_prep",
      heroineId: "hakima",
      routeMode: "long_history",
      threshold: 15,
      kind: "long_history_background",
      title: "祭りの香り",
      presentation: {
        backgroundId: "spotFestivalStreet",
        bgmId: "HAKIMA-01"
      },
      summary: "街の祭りが近づき、ハキマが屋台の香材を買いに来た。昔も一緒に祭りに行ったっけ、と懐かしむ。",
      pages: [
        { speaker: "ハキマ", expression: "joy", text: "祭りが近いわね。屋台用の香材、今年もルハーン商会に相談が来てるの。" },
        { speaker: "ナーディル", expression: "normal", text: "昔も一緒に祭りの屋台を回ったな。君は香りだけで、どこの菓子か当てていた。" },
        { speaker: "ハキマ", expression: "fun", text: "あんたはすぐ外してたわね。……でも、外しても楽しそうだったから、少し悔しかった。" },
        { speaker: "ハキマ", expression: "sorrow", text: "覚えてるなら、今年も付き合いなさいよ。別に、一緒じゃなきゃ嫌ってわけじゃ……ないけど。" }
      ]
    }
  ],
  mira: [
    {
      id: "mira_0",
      heroineId: "mira",
      threshold: 0,
      kind: "flashback_intro", // route intro / flashback
      title: "天才とノートの余白",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "MIRA-01"
      },
      summary: "開店前、ミラとの出会いを思い出す。大学の廊下で、彼女がナーディルのノートの余白に興味を持ったことがきっかけだった。",
      pages: [
        { 
          speaker: "ナーディル", 
          expression: "normal", 
          text: "ミラか。……あの子、最初はずいぶんと俺のノートを熱心に覗き込んでいたっけ。",
          backgroundId: "shopExteriorDay"
        },
        { 
          speaker: "ミラ", 
          expression: "normal", 
          text: "「先輩、その計算式の横にある走り書き……星瓶堂の現場で使う調整式ですか？」\n噴水の水音が響く大学の広場。学年一の天才と名高いミラに呼び止められた時は、少し身構えた。",
          backgroundId: "spotFountain"
        },
        { 
          speaker: "ナーディル", 
          expression: "surprise", 
          text: "「え、ああ……。父が昔言っていたことを、自分なりにまとめてみただけだよ」\n俺がそう言うと、彼女の瞳は見たこともないほど輝いたんだ。",
          backgroundId: "spotFountain"
        },
        { 
          speaker: "ミラ", 
          expression: "joy", 
          text: "「素晴らしいです。教科書にはない、実践的な知恵が詰まっています。もっと詳しく教えていただけませんか？」\nそれが、彼女との「先輩・後輩」の関係の始まりだった。",
          backgroundId: "spotFountain"
        },
        { 
          speaker: "ナーディル", 
          expression: "joy", 
          text: "今では商会や大学の話を、真っ先に持ってきてくれる。……俺も、頼れる先輩でいられるよう頑張ろう。",
          backgroundId: "shopExteriorDay"
        }
      ]
    },
    {
      id: "mira_5",
      heroineId: "mira",
      threshold: 5,
      title: "普通の女の子として",
      stillImageId: "miraAfterSchool01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01",
        heroineExpressions: ["normal", "sorrow", "joy"],
        naderExpressions: ["normal", "surprise"]
      },
      summary: "天才として常に正解を求められるミラが、星瓶堂でだけは「迷うこと」を許され、一人の少女に戻る。",
      pages: [
        { speaker: "ミラ", expression: "normal", text: "放課後、ミラは課題用の素材帳を抱えて星瓶堂を訪れた。\n「先輩、今日は正解を選びに来たわけではないんです」" },
        { speaker: "ミラ", expression: "sorrow", text: "彼女は瓶を二つ並べ、困ったように眉を寄せる。\n「どちらも正しい。だから、どちらを選ぶべきか迷っています」" },
        { speaker: "ナーディル", expression: "normal", text: "「迷っていいと思う。正解より先に、誰へ届けたい品なのかを考えてみよう」\nそう言うと、ミラは目を丸くした。" },
        { speaker: "ミラ", expression: "surprise", text: "「天才なら即答すべきだと、ずっと思っていました」\n彼女の声は小さいのに、どこかほっとしていた。" },
        { speaker: "ミラ", expression: "joy", text: "「先輩は、少しずるいです。そんな言い方をされたら、私でいたくなります」\n彼女は小さく笑った。" }
      ],
      routePages: {
        long_history: [
          { speaker: "", expression: "normal", text: "ミラは古い課題帳を開き、懐かしそうに指でなぞった。" },
          { speaker: "ミラ", expression: "normal", text: "この式、先輩に何度も直してもらいましたね" },
          { speaker: "ミラ", expression: "sorrow", text: "みんなは答えだけを褒めました。でも先輩は、迷った跡を見てくれた" },
          { speaker: "", expression: "normal", text: "彼女の声は、少しだけ震えていた。" },
          { speaker: "ナーディル", expression: "normal", text: "俺は、君の迷い方が好きだったんだと思う。答えに向かって、ちゃんと考えていたから" },
          { speaker: "", expression: "normal", text: "ミラは胸の前で帳面を抱きしめる。" },
          { speaker: "ミラ", expression: "surprise", text: "そんなことを、昔から思ってくれていたんですか" },
          { speaker: "ミラ", expression: "joy", text: "天才ではなく、ただの私として。……先輩の隣で、もう一度考えたいです" },
          { speaker: "", expression: "normal", text: "その笑顔は、少し照れくさそうだった。" }
        ]
      }
    },
    {
      id: "mira_10",
      heroineId: "mira",
      threshold: 10,
      title: "商人の目利き",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01",
        heroineExpressions: ["normal", "fun", "joy"],
        naderExpressions: ["normal", "surprise", "joy"]
      },
      summary: "商会としての効率と、店としての優しさ。ミラは星瓶堂で、数字では測れない答えを見つける。",
      pages: [
        { speaker: "", expression: "normal", text: "ミラは星瓶堂の帳面を開き、真剣な顔で数字を並べた。" },
        { speaker: "ミラ", expression: "normal", text: "この配合なら、もっと多くの人に届けられます" },
        { speaker: "ナーディル", expression: "sorrow", text: "けれど俺は、最後に客の手紙を読み返した。" },
        { speaker: "", expression: "normal", text: "効率だけでは測れない願いが、そこには残っていた。" },
        { speaker: "", expression: "normal", text: "ミラは少し悔しそうに、そして嬉しそうに笑った。" },
        { speaker: "ミラ", expression: "fun", text: "商人の目だけでは、見落とすものがありますね" },
        { speaker: "ナーディル", expression: "normal", text: "俺も、数字を見ないといけない。でも、手紙に残った迷いも無視したくないんだ" },
        { speaker: "ミラ", expression: "joy", text: "先輩の隣でなら、正解を出す前の私でいられます" },
        { speaker: "", expression: "normal", text: "その言葉は、星明かりよりも静かに輝いていた。" }
      ],
      routePages: {
        long_history: [
          { speaker: "", expression: "normal", text: "星空の下、ミラは帳面を閉じた。" },
          { speaker: "ミラ", expression: "normal", text: "昔から、先輩は私の答えより、考えている顔を見ていました" },
          { speaker: "ミラ", expression: "fun", text: "それが少し悔しくて、でも、とても嬉しかったんです" },
          { speaker: "", expression: "normal", text: "彼女は夜風に揺れる布を押さえ、小さく笑う。" },
          { speaker: "ナーディル", expression: "normal", text: "君が答えを出す前の時間は、静かで綺麗だった。急かすのがもったいなかったんだ" },
          { speaker: "ミラ", expression: "joy", text: "私は天才としてではなく、私の夢として、星瓶堂の未来を考えたい" },
          { speaker: "", expression: "normal", text: "その瞳は、もう迷っていなかった。" },
          { speaker: "ミラ", expression: "joy", text: "先輩。これからも、私が答えを急ぎそうになったら止めてください" },
          { speaker: "", expression: "normal", text: "ミラは照れながら、そっと隣に並んだ。" }
        ]
      }
    },
    {
      id: "mira_20",
      heroineId: "mira",
      threshold: 20,
      title: "暮らしの錬金術",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "MIRA-01"
      },
      summary: "ミラは大学の発表題材に星瓶堂を選び、ナーディルの「使う人の顔が見える品」という姿勢に自身の理想を重ねる。",
      pages: [
        { speaker: "", expression: "normal", text: "昼下がりの店先で、ミラは課題帳を抱えて立った。" },
        { "speaker": "ミラ", "expression": "normal", "text": "先輩、星瓶堂の商品を学外発表の題材にしてもいいでしょうか。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "うちの商品を？ もっと派手な研究の方が、評価されるんじゃないか。" },
        { "speaker": "ミラ", "expression": "sorrow", "text": "派手さだけなら、そうかもしれません。でも私は、暮らしに届く錬金術を発表したいんです。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "それなら、星瓶堂はぴったりだ。使う人の顔が見える品ばかりだから。" },
        { "speaker": "ミラ", "expression": "joy", "text": "はい。先輩がそう見ているから、私もこの店で学びたいと思えたんです。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "俺は大したことはしてないよ。ただ、客の話を聞いているだけだ。" },
        { "speaker": "ミラ", "expression": "fun", "text": "その「ただ」が難しいんです。だから私は、先輩の隣で学びたいんです。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ミラ", expression: "normal", text: "先輩、覚えていますか。昔、星瓶堂の棚を題材にして、二人で小さな研究帳を作ったこと。" },
          { speaker: "ナーディル", expression: "fun", text: "覚えてるよ。君は瓶の配置まで数式にしようとして、俺は途中で目を回した。" },
          { speaker: "ミラ", expression: "joy", text: "でも先輩は、最後に言ってくれました。使う人が迷わない棚なら、それも立派な錬金術だって。" },
          { speaker: "ナーディル", expression: "normal", text: "そんなことを言ったのか。今聞くと、ずいぶん星瓶堂らしい答えだな。" },
          { speaker: "ミラ", expression: "sorrow", text: "私にとっては、研究の原点です。天才の発表ではなく、誰かの暮らしに届く錬金術を選びたいんです。" },
          { speaker: "ミラ", expression: "joy", text: "そして、その原点にはいつも先輩がいます。だから私は、ここへ戻ってきたんです。" }
        ]
      }
    },
    {
      id: "mira_climax",
      heroineId: "mira",
      threshold: 30,
      kind: "route_climax",
      title: "正解の前の私",
      stillImageId: "miraStarryRooftop01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01"
      },
      summary: "天才ゆえの失敗への恐怖を吐露するミラに対し、ナーディルはその過程すべてを肯定し、彼女が「ただの自分」でいられる場所であることを示す。",
      pages: [
        { "speaker": "ミラ", "expression": "sorrow", "text": "天才だと言われるほど、間違えるのが怖くなります。期待を裏切るのが怖いんです。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "ミラが迷って、試して、失敗して、それでも考えるところを俺は見てきた。" },
        { "speaker": "ミラ", "expression": "surprise", "text": "答えだけではなく、そこまで見てくれるんですね。" },
        { "speaker": "ナーディル", "expression": "sorrow", "text": "俺は、君の全部を分かっているなんて言えない。でも、答えを出す前の君を見ていたいとは思う。" },
        { "speaker": "ミラ", "expression": "joy", "text": "……先輩は、やっぱり少しずるいです。そんな言い方をされたら、もっと好きになってしまいます。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "ミラ……。" },
        { "speaker": "ミラ", "expression": "joy", "text": "先輩の前では、正解の前の私でいてもいいんですね。なら私は、ここにいたいです。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ミラ", expression: "sorrow", text: "昔、一度だけ実験に失敗して、もう飛び級なんて無理だと思った日がありました。" },
          { speaker: "ナーディル", expression: "normal", text: "覚えてる。君は泣きそうな顔で、失敗した計算紙を全部抱えてきた。" },
          { speaker: "ミラ", expression: "cry", text: "先輩は、答えを直すより先に、紙を捨てなかったことを褒めてくれました。" },
          { speaker: "ナーディル", expression: "joy", text: "迷って、書き直して、それでも考える君を知っていたからだよ。天才だからじゃない。" },
          { speaker: "ミラ", expression: "joy", text: "……昔から、先輩の前では正解の前の私でいられました。今も、その場所に帰ってきたいんです。" },
          { speaker: "ナーディル", expression: "sorrow", text: "俺でいいのか、と少し思う。でも、君がそう言ってくれるなら、ここを空けておくよ。" },
          { speaker: "ミラ", expression: "joy", text: "先輩がいいんです。昔から、ずっと。……だから、もう少しだけ隣にいさせてください。" }
        ]
      }
    },
    {
      id: "mira_long_assignment_night",
      heroineId: "mira",
      routeMode: "long_history",
      threshold: 10,
      kind: "long_history_still",
      title: "課題の夜更け",
      stillImageId: "miraAssignmentConsult01",
      presentation: {
        backgroundId: "spotFountain",
        bgmId: "MIRA-01"
      },
      summary: "大学の課題で行き詰まったミラが、ナーディルのノートを借りて夜更けまで考えた記憶。朝には二人で解決していた。",
      pages: [
        { speaker: "ミラ", expression: "sorrow", text: "先輩、この課題……どうしても解けなくて。答えに近いはずなのに、最後の一歩が見えません。" },
        { speaker: "ナーディル", expression: "normal", text: "俺のノートでよければ、使ってくれ。あまり綺麗な字じゃないけど、現場の迷いは残っていると思う。" },
        { speaker: "ミラ", expression: "joy", text: "……朝には解けていましたね。先輩と一緒に考えられて、本当に嬉しかったです。" },
        { speaker: "ナーディル", expression: "fun", text: "俺は半分くらい、君の計算の速さについていけてなかったけどな。" },
        { speaker: "ミラ", expression: "fun", text: "それでも、隣にいてくれました。私には、それが一番心強かったんです。" }
      ]
    },
    {
      id: "mira_long_sick_visit",
      heroineId: "mira",
      routeMode: "long_history",
      threshold: 20,
      kind: "long_history_still",
      title: "見舞いの温もり",
      stillImageId: "miraVisitSick01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01"
      },
      summary: "ナーディルが風邪で寝込んだ日、ミラが処方箋と不器用な粥を持って訪ねてきた。味はともかく、その温かさは忘れられない。",
      pages: [
        { speaker: "ミラ", expression: "normal", text: "……風邪、大丈夫ですか。処方箋と、温かいものを持ってきました。" },
        { speaker: "ナーディル", expression: "surprise", text: "ミラが来てくれるなんて。助かるよ。……この粥は、君が？" },
        { speaker: "ミラ", expression: "sorrow", text: "はい。理論上は栄養の配分も完璧だったのですが、味が少し……個性的になりました。" },
        { speaker: "ナーディル", expression: "fun", text: "熱は下がりそうだ。別の意味で目が覚める味だけど。" },
        { speaker: "ミラ", expression: "joy", text: "ふふ。笑えるなら大丈夫ですね。先輩が元気になってくれるなら、また作ります。" }
      ]
    },
    {
      id: "mira_long_university_rumor",
      heroineId: "mira",
      routeMode: "long_history",
      threshold: 5,
      kind: "long_history_background",
      title: "天才の噂",
      presentation: {
        backgroundId: "spotFountain",
        bgmId: "MIRA-01"
      },
      summary: "大学で「ナーディル先輩の後輩」と噂されているとミラが言う。昔から二人は目立っていたから、と笑う。",
      pages: [
        { speaker: "ミラ", expression: "normal", text: "大学で、少し変な噂を聞きました。「ナーディル先輩の後輩」だそうです。" },
        { speaker: "ナーディル", expression: "surprise", text: "俺の名前が先に来るのか。ミラの方がずっと目立っていると思うけど。" },
        { speaker: "ミラ", expression: "fun", text: "ふふ。私も少し驚きました。でも、嫌ではありません。" },
        { speaker: "ミラ", expression: "joy", text: "先輩の隣で考えてきた時間まで、ちゃんと覚えてもらえている気がしますから。" }
      ]
    },
    {
      id: "mira_long_stargazing",
      heroineId: "mira",
      routeMode: "long_history",
      threshold: 15,
      kind: "long_history_background",
      title: "星の計算",
      presentation: {
        backgroundId: "spotStarView",
        bgmId: "MIRA-01"
      },
      summary: "星見台で星の運行を計算するミラ。ナーディルは星瓶堂の瓶に閉じ込めた星の話をした。",
      pages: [
        { speaker: "ミラ", expression: "normal", text: "星の運行計算、終わりました。式は合っています。でも、今日は少しだけ眺めていたいです。" },
        { speaker: "ナーディル", expression: "normal", text: "俺は、星を計算するより、瓶に閉じ込める方を選んだな。星瓶堂らしいだろう。" },
        { speaker: "ミラ", expression: "joy", text: "はい。先輩らしいです。遠くの星を、誰かの手元に置こうとするところが。" },
        { speaker: "ミラ", expression: "fun", text: "その瓶の星、私にも見せてください。昔みたいに、隣で。" }
      ]
    }
  ],
  dariya: [
    {
      id: "dariya_0",
      heroineId: "dariya",
      threshold: 0,
      kind: "flashback_intro", // route intro / flashback
      title: "王宮の鑑定依頼",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "DARIYA-01"
      },
      summary: "開店前、ダリヤとの出会いを思い出す。王宮錬金局からの鑑定依頼が、彼女との始まりだった。",
      pages: [
        { 
          speaker: "ナーディル", 
          expression: "normal", 
          text: "ダリヤさんは……最初は本当に王宮の用事で、この店に来たんだよな。",
          backgroundId: "shopExteriorDay"
        },
        { 
          speaker: "ダリヤ", 
          expression: "normal", 
          text: "「王宮錬金局のダリヤです。星瓶堂の技術を、少し確認させてもらえますか」\n整然と並んだ器具と、薬草の乾いた匂い。王宮錬金局の検証室で会った時の彼女は、落ち着いて見えた。でも、どこか疲れてもいた。",
          backgroundId: "palaceLab"
        },
        { 
          speaker: "ナーディル", 
          expression: "sorrow", 
          text: "「厳しいですね。でも、俺の作る品に嘘はありません」\n俺が試作瓶を差し出すと、彼女は少しだけ眉を下げて受け取った。",
          backgroundId: "palaceLab"
        },
        { 
          speaker: "ダリヤ", 
          expression: "sorrow", 
          text: "「……不合格、かな。理論は古い。でも、使う人の体温まで考えてある」\nその声は冷たくなくて、むしろ少し困っているようだった。",
          backgroundId: "palaceLab"
        },
        { 
          speaker: "ナーディル", 
          expression: "joy", 
          text: "それから何度か、彼女は星瓶堂に顔を出すようになった。完璧に見える人ほど、休む場所が必要なのかもしれない。",
          backgroundId: "shopExteriorDay"
        }
      ]
    },
    {
      id: "dariya_5",
      heroineId: "dariya",
      threshold: 5,
      title: "安らぎの工房",
      stillImageId: "dariyaAfterHours01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-01",
        heroineExpressions: ["normal", "sorrow", "joy"],
        naderExpressions: ["normal", "sorrow"]
      },
      summary: "王宮での重圧を抱えるダリヤが、星瓶堂でだけは少し息をつく。彼女はまだ頼りなく、倒れそうな疲れを隠しきれない。",
      pages: [
        { speaker: "", expression: "normal", text: "閉店後の星瓶堂に、ダリヤは細い瓶を抱えて現れた。" },
        { speaker: "ダリヤ", expression: "normal", text: "確認してほしいものがあって……少しだけ、いいかな" },
        { speaker: "", expression: "sorrow", text: "王宮印の封蝋は冷たく、瓶の中身よりも重く見えた。" },
        { speaker: "", expression: "normal", text: "ナーディルは黙って椅子を引き、温かい茶を置く。" },
        { speaker: "", expression: "normal", text: "ダリヤは茶に手を伸ばしかけて、小さく息を吐いた。" },
        { speaker: "ダリヤ", expression: "sorrow", text: "ごめんね。今日は少し、立っているのがつらくて" },
        { speaker: "ナーディル", expression: "sorrow", text: "謝らなくていいです。まず座ってください。話は、それからで大丈夫です" },
        { speaker: "", expression: "normal", text: "その笑みは弱々しかったが、少しだけ安心していた。" },
        { speaker: "", expression: "normal", text: "星瓶堂の夜は、どんな薬より静かに彼女を休ませた。" }
      ],
      routePages: {
        long_history: [
          { speaker: "", expression: "normal", text: "ダリヤは扉を閉めるなり、小さく息を吐いた。" },
          { speaker: "ダリヤ", expression: "normal", text: "ナーディル、今日はもうだめ。少し座らせて" },
          { speaker: "", expression: "sorrow", text: "学生の頃も、王宮に入った後も。" },
          { speaker: "", expression: "normal", text: "彼女は本当に疲れた時だけ、この店の灯を思い出していた。" },
          { speaker: "ナーディル", expression: "sorrow", text: "大丈夫ですか、ダリヤさん。すぐ茶を淹れます" },
          { speaker: "ダリヤ", expression: "joy", text: "そこは昔みたいに、お姉ちゃん、座ってて……でいいの" },
          { speaker: "", expression: "normal", text: "彼女は弱々しく笑いながら、いつもの席に腰を下ろした。" },
          { speaker: "ナーディル", expression: "joy", text: "分かりました。お姉ちゃん、座ってて。今日は俺が茶を淹れます" },
          { speaker: "", expression: "normal", text: "その言葉に、ダリヤはようやく安心したように目を閉じた。" }
        ]
      }
    },
    {
      id: "dariya_10",
      heroineId: "dariya",
      threshold: 10,
      title: "共鳴する真理",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-01",
        heroineExpressions: ["normal", "sorrow", "joy"],
        naderExpressions: ["normal", "surprise", "joy"]
      },
      summary: "完璧でいようとして疲れきったダリヤが、ナーディルの前でだけ弱さを少し見せる。",
      pages: [
        { speaker: "", expression: "normal", text: "夜風が店先の布幕をゆっくり揺らしていた。ダリヤはふと、過去の検証室を思い出した。" },
        { speaker: "", expression: "normal", text: "王宮錬金局の検証室は、音まで整いすぎていた。" },
        { speaker: "", expression: "normal", text: "ダリヤは手順書を閉じ、少しだけ目を押さえる。" },
        { speaker: "ダリヤ", expression: "sorrow", text: "完璧な配合なのに、どうしてこんなに冷たく感じるんだろう" },
        { speaker: "", expression: "normal", text: "彼女の声は、いつもの落ち着きよりずっと小さかった。" },
        { speaker: "ナーディル", expression: "normal", text: "使う人の顔が見えないから、かもしれません。星瓶堂では、そこを見失いたくないんです" },
        { speaker: "ダリヤ", expression: "sorrow", text: "君は簡単に言うね。……でも、そういう簡単なことが、今の私には難しい" },
        { speaker: "ダリヤ", expression: "joy", text: "少しだけ、また君の店に行ってもいいかな。あそこなら、ちゃんと息ができる気がするの" }
      ],
      routePages: {
        long_history: [
          { speaker: "", expression: "normal", text: "夜の検証室で、ダリヤはついに筆を置いた。" },
          { speaker: "ダリヤ", expression: "sorrow", text: "昔なら、もう少し上手に隠せたと思うんだけど" },
          { speaker: "", expression: "normal", text: "ナーディルは答えを急かさず、ただ隣に立った。" },
          { speaker: "", expression: "normal", text: "その沈黙が、昔から彼女には何よりありがたかった。" },
          { speaker: "ダリヤ", expression: "sorrow", text: "今日は、強い先輩のふりができない。ナーディル、少しだけ甘えていい？" },
          { speaker: "ナーディル", expression: "normal", text: "もちろんです。ここでは無理しなくていいです" },
          { speaker: "ダリヤ", expression: "joy", text: "また敬語。……お姉ちゃんって呼んでくれたら、もっと元気になるのに" },
          { speaker: "", expression: "normal", text: "彼女は困ったように笑いながら、少しだけ肩を寄せた。" }
        ]
      }
    },
    {
      id: "dariya_20",
      heroineId: "dariya",
      threshold: 20,
      title: "当たり前の重み",
      presentation: {
        backgroundId: "shopExteriorDay",
        bgmId: "DARIYA-01"
      },
      summary: "王宮の案件をナーディルに相談するダリヤ。王宮が忘れがちな「当たり前」を、彼女は弱々しくも大切にしようとする。",
      pages: [
        { speaker: "", expression: "normal", text: "午後の光が棚の瓶を淡く照らしていた。" },
        { "speaker": "ダリヤ", "expression": "normal", "text": "王宮の検証案件を、星瓶堂にも相談したいの。君の目は、研究所と少し違うから。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "王宮の案件を俺に？光栄ですけど、少し緊張します。" },
        { "speaker": "ダリヤ", "expression": "sorrow", "text": "私も緊張しているよ。正直、ひとりで抱えるには少し重くて……君に見てもらいたかった。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "俺は、使う人が息をしやすい品かどうかを見たいです。それでよければ、一緒に考えます。" },
        { "speaker": "ダリヤ", "expression": "joy", "text": "うん。だから君に頼みたいの。私が忘れそうになる当たり前を、君はまだ覚えていてくれるから。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "normal", text: "学生の頃、君と組んだ検証はいつも少し予定を外れたね。手順書通りには進まなかった。" },
          { speaker: "ナーディル", expression: "fun", text: "ダリヤさんが怖い顔をして、最後には少し笑ってくれるまでが一組でしたね。" },
          { speaker: "ダリヤ", expression: "fun", text: "もう。そういうことは覚えているんだから。……でも、君の発想に助けられたのは本当だよ。" },
          { speaker: "ダリヤ", expression: "sorrow", text: "だから今回も、ひとりで抱えたくなかった。ナーディル、一緒に考えてほしいの。" },
          { speaker: "ナーディル", expression: "normal", text: "もちろんです。俺でよければ、隣で見ます。" },
          { speaker: "ダリヤ", expression: "joy", text: "ありがとう。……でも次は、お姉ちゃんのために頑張る、くらい言ってくれてもいいんだよ。" }
        ]
      }
    },
    {
      id: "dariya_climax",
      heroineId: "dariya",
      threshold: 30,
      kind: "route_climax",
      title: "座らせてくれる場所",
      stillImageId: "dariyaLimitNight01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-01"
      },
      summary: "完璧でいようとして限界に近いダリヤに対し、ナーディルは弱さを許す場所を差し出す。",
      pages: [
        { "speaker": "ダリヤ", "expression": "sorrow", "text": "王宮では、優秀でいることに慣れすぎたの。できない私を、私自身が許せなくて。" },
        { "speaker": "ナーディル", "expression": "sorrow", "text": "できない日があっても、ダリヤさんが積み重ねてきたものは消えません。" },
        { "speaker": "ダリヤ", "expression": "cry", "text": "そう言ってもらえると、困るね。……ちゃんと立っていようと思っていたのに、力が抜けてしまう。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "ここでは、王宮錬金術師である前に、ダリヤさんとして座ってくれればいいです。" },
        { "speaker": "ダリヤ", "expression": "sorrow", "text": "私、少し頼りないよ。思っているより弱いし、すぐ疲れるし、格好よくもない。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "それでも、ここに来てくれるダリヤさんを俺は大事にしたいです。" },
        { "speaker": "ダリヤ", "expression": "joy", "text": "……なら、少しだけ座らせて。立ち上がる時は、君の茶を一杯もらってからにするね。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "sorrow", text: "昔、一度だけ君に言ったね。特別でなくなった私は、何者でいればいいんだろうって。" },
          { speaker: "ナーディル", expression: "normal", text: "覚えています。俺はその時、立派な答えを返せなかった。茶を出すくらいしかできなくて。" },
          { speaker: "ダリヤ", expression: "cry", text: "それで十分だったよ。君は私を急かさず、責めず、ただ座らせてくれた。" },
          { speaker: "ナーディル", expression: "sorrow", text: "今も同じです。完璧でいられない日も、ここではダリヤさんとして座ってくれればいい。" },
          { speaker: "ダリヤ", expression: "sorrow", text: "……今日は、ダリヤさんじゃなくていい。昔みたいに、お姉ちゃんって呼んで。" },
          { speaker: "ナーディル", expression: "surprise", text: "お姉ちゃん……。" },
          { speaker: "ダリヤ", expression: "joy", text: "うん。ありがとう。そう呼ばれると、少しだけ立ち直れるの。情けないけど、私はそういう人なんだよ。" },
          { speaker: "ナーディル", expression: "joy", text: "情けなくないです。お姉ちゃんが座っていられる場所なら、星瓶堂にちゃんと空けておきます。" },
          { speaker: "ダリヤ", expression: "joy", text: "……なら、あの時と同じ茶をもらおうかな。立ち上がるのは、それを飲んでからにする。" }
        ]
      }
    },
    {
      id: "dariya_long_collaboration",
      heroineId: "dariya",
      routeMode: "long_history",
      threshold: 10,
      kind: "long_history_still",
      title: "共同研究の記憶",
      stillImageId: "dariyaPalaceCollaboration01",
      presentation: {
        backgroundId: "palaceLab",
        bgmId: "DARIYA-01"
      },
      summary: "学生時代、王宮の研究施設で一緒に実験した日。ナーディルの自由な発想が、ダリヤの堅実さを補った。",
      pages: [
        { speaker: "ダリヤ", expression: "normal", text: "……懐かしいな。学生時代、王宮で一緒に実験した日。" },
        { speaker: "ナーディル", expression: "fun", text: "ダリヤさんの堅実さと、俺の自由な発想。悪くない組み合わせでした。" },
        { speaker: "ダリヤ", expression: "joy", text: "ふん。今もその組み合わせは、生きているだろう？" }
      ]
    },
    {
      id: "dariya_long_rain_corridor",
      heroineId: "dariya",
      routeMode: "long_history",
      threshold: 20,
      kind: "long_history_still",
      title: "回廊の雨音",
      stillImageId: "dariyaRainCorridor01",
      presentation: {
        backgroundId: "palaceCorridor",
        bgmId: "DARIYA-01"
      },
      summary: "王宮の長い回廊で雨宿りした日。ダリヤが初めて弱音を吐いた瞬間。ナーディルは何も聞かなかった。",
      pages: [
        { speaker: "ダリヤ", expression: "sorrow", text: "……王宮の回廊は、雨音がよく響く。" },
        { speaker: "ナーディル", expression: "normal", text: "今日は何も聞きません。ただ、一緒に雨宿りしましょう。" },
        { speaker: "ダリヤ", expression: "joy", text: "……ふん。それが一番、ありがたいな。" }
      ]
    },
    {
      id: "dariya_long_palace_break",
      heroineId: "dariya",
      routeMode: "long_history",
      threshold: 5,
      kind: "long_history_background",
      title: "束の間の休息",
      presentation: {
        backgroundId: "palaceCorridor",
        bgmId: "DARIYA-01"
      },
      summary: "王宮の公務の合間に、ダリヤが星瓶堂に立ち寄った。昔のように、一言も喋らず茶を飲む。",
      pages: [
        { speaker: "ダリヤ", expression: "normal", text: "公務の合間だ。少し、休ませてくれ。" },
        { speaker: "ナーディル", expression: "fun", text: "昔のように、黙って茶を飲みましょうか。" },
        { speaker: "ダリヤ", expression: "joy", text: "……ふん。君はそういうところが、本当に変わらないな。" }
      ]
    },
    {
      id: "dariya_long_oasis_view",
      heroineId: "dariya",
      routeMode: "long_history",
      threshold: 15,
      kind: "long_history_background",
      title: "オアシスの約束",
      presentation: {
        backgroundId: "spotOasisView",
        bgmId: "DARIYA-01"
      },
      summary: "オアシスを眺めながら、ダリヤが昔の約束を思い出した。二人で来たかった場所だと告げる。",
      pages: [
        { speaker: "ダリヤ", expression: "sorrow", text: "……オアシスか。昔、二人で来たかった場所だ。" },
        { speaker: "ナーディル", expression: "normal", text: "ようやく来られましたな。" },
        { speaker: "ダリヤ", expression: "joy", text: "……ふん。また来よう。公務を抜けてでも。" }
      ]
    }
  ]
};

/**
 * Returns all events for a given heroine
 * @param {string} heroineId 
 * @returns {Array}
 */
export function getEventsByHeroine(heroineId) {
  return AFFECTION_EVENTS[heroineId] || [];
}
