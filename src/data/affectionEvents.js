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
          text: "今日はハキマが来る日か。……あいつと初めて会ったのも、こんな風に風が強い日だったな。",
          backgroundId: "shopExteriorDay"
        },
        { 
          speaker: "ハキマ", 
          expression: "anger", 
          text: "「ちょっと、そこのあんた！ その樹脂、乾かし方が甘いわ。そんなの売るつもり？」\n市場の隅で、見知らぬキツネ族の少女にいきなり怒鳴られたんだ。",
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
          text: "「……ふん、素直なだけが取り柄ね。星瓶堂の跡取りなら、もっと鼻を鍛えなさいよ」\nそれが、俺と彼女の「ライバル」としての始まりだった。",
          backgroundId: "marketCentral"
        },
        { 
          speaker: "ナーディル", 
          expression: "joy", 
          text: "今じゃ、欠かせない協力者の一人だ。……よし、開店の準備をしよう。",
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
      summary: "昔のライバル関係を思い出しながら、ハキマはナーディルを試しつつも、その成長を認める。",
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
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-01",
        heroineExpressions: ["anger", "surprise", "sorrow", "joy"],
        naderExpressions: ["normal", "surprise", "joy"]
      },
      summary: "素直になれないハキマだが、ナーディルと同じ目線で品を選べたことに、深い喜びを感じている。",
      pages: [
        { speaker: "ハキマ", expression: "anger", text: "市場の香料瓶を前に、ハキマは腕を組んでうなった。\n「この配合、悪くないけど……客には少し強すぎるわね」" },
        { speaker: "ハキマ", expression: "surprise", text: "ナーディルが薄める案を出すと、彼女は驚いた顔をした。\n「同じこと、考えてた。……先に言わないでよ」" },
        { speaker: "ハキマ", expression: "sorrow", text: "「でも、そういうところは嫌いじゃない」\n言った直後、ハキマの耳が跳ね、尻尾がふわりと揺れた。" },
        { speaker: "ハキマ", expression: "joy", text: "彼女は慌てて背を向ける。\n「見てない！ あんたは何も見てない！ ……でも、また一緒に見立てるから」" }
      ],
      routePages: {
        long_history: [
          { speaker: "ハキマ", expression: "surprise", text: "市場の棚を前に、ふたりは同時に同じ香料瓶を指差した。\nハキマは目を丸くし、やがて呆れたように笑う。" },
          { speaker: "ハキマ", expression: "normal", text: "「……昔は、あんたの方がいつも外してたのに」\n少しだけ寂しそうに、でも誇らしげに彼女は言う。" },
          { speaker: "ハキマ", expression: "joy", text: "「やっと追いついてきたってことね。なら、これからは対等だ」\n狐の耳が、嬉しさを隠しきれずにぴんと立っていた。" },
          { speaker: "ハキマ", expression: "joy", text: "「言っとくけど、まだまだ負けないからね」\nその顔は、市場のどの灯りよりも眩しかった。" }
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
        { "speaker": "ハキマ", "expression": "normal", "text": "ルハーン商会から、大口の香材相談が来たの。星瓶堂の目利きも借りたいって。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "君の商会から正式に？ それは責任重大だな。" },
        { "speaker": "ハキマ", "expression": "anger", "text": "勘違いしないで。あんたが少しは信用できるって、私が報告しただけよ。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "それなら、なおさら嬉しいよ。ハキマが見てくれた星瓶堂の信用だ。" },
        { "speaker": "ハキマ", "expression": "surprise", "text": "……そういう言い方、ずるい。怒る準備をしてたのに、調子が狂うじゃない。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ハキマ", expression: "normal", text: "ルハーン商会から、大口の香材相談が来たの。……昔のあんたなら、聞いただけで逃げてたでしょうね。" },
          { speaker: "ナーディル", expression: "fun", text: "否定しきれないな。昔は、君に香材の束を渡されるだけで身構えてた。" },
          { speaker: "ハキマ", expression: "anger", text: "それでも最後まで付き合ったじゃない。悔しいけど、あんたの目利きは昔から当てにしてたのよ。" },
          { speaker: "ナーディル", expression: "joy", text: "なら今回は、昔より胸を張って隣に立てるように頑張るよ。" },
          { speaker: "ハキマ", expression: "surprise", text: "……そういう言い方、ずるい。こっちは何年も前から、その隣を空けてたみたいじゃない。" }
        ]
      }
    },
    {
      id: "hakima_climax",
      heroineId: "hakima",
      threshold: 30,
      kind: "route_climax",
      title: "隣に並ぶ覚悟",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "HAKIMA-01"
      },
      summary: "成長するナーディルに焦りを感じるハキマに対し、ナーディルは共に歩む決意を伝え、二人は対等なパートナーとしての絆を深める。",
      pages: [
        { "speaker": "ハキマ", "expression": "sorrow", "text": "あんたが星瓶堂の店主らしくなるほど、少しだけ遠く見える時があるの。" },
        { "speaker": "ナーディル", "expression": "sorrow", "text": "遠くへ行きたいわけじゃない。俺は、この店で誰かと向き合える店主になりたいんだ。" },
        { "speaker": "ハキマ", "expression": "anger", "text": "だったら、隣を空けておきなさいよ。勝手に一人で格好つけないで。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "分かった。難しい香材も、厄介な客も、君と一緒に見立てたい。" },
        { "speaker": "ハキマ", "expression": "joy", "text": "……最初からそう言えばいいのよ。まったく、手のかかる若店主なんだから。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ハキマ", expression: "sorrow", text: "子どもの頃、どっちが先に自分の店を持つかって勝負したの、覚えてる？" },
          { speaker: "ナーディル", expression: "normal", text: "覚えてる。君は、負けた方が勝った方の棚を一緒に並べるって言ってた。" },
          { speaker: "ハキマ", expression: "anger", text: "違うわよ。あれは負けた時の約束じゃない。……隣にいるための口実だったの。" },
          { speaker: "ナーディル", expression: "surprise", text: "ハキマ……。俺は、君が隣にいるのを当たり前みたいに思いすぎていたのかもしれない。" },
          { speaker: "ハキマ", expression: "joy", text: "今さら気づいたなら、遅れた分だけちゃんと空けておきなさい。星瓶堂の隣、私が立つんだから。" }
        ]
      }
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
      summary: "開店前、ミラとの出会いを思い出す。大学の廊下で、彼女が俺のノートの余白に興味を持ったことがきっかけだった。",
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
          text: "「先輩、その計算式の横にある走り書き……父の、ナーディル・シニアの理論の応用ですか？」\n大学の廊下で、学年一の天才と名高いミラに呼び止められた時は心臓が止まるかと思った。",
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
          text: "今では商会の相談役として、一番の助言者になってくれている。……よし、今日も頑張ろう。",
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
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01",
        heroineExpressions: ["normal", "fun", "joy"],
        naderExpressions: ["normal", "surprise", "joy"]
      },
      summary: "商会としての効率と、店としての優しさ。ミラは星瓶堂で、数字では測れない答えを見つける。",
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
        { "speaker": "ミラ", "expression": "normal", "text": "先輩、星瓶堂の商品を学外発表の題材にしてもいいでしょうか。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "うちの商品を？ もっと派手な研究の方が、評価されるんじゃないか。" },
        { "speaker": "ミラ", "expression": "sorrow", "text": "派手さだけなら、そうかもしれません。でも私は、暮らしに届く錬金術を発表したいんです。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "それなら、星瓶堂はぴったりだ。使う人の顔が見える品ばかりだから。" },
        { "speaker": "ミラ", "expression": "joy", "text": "はい. 先輩がそう見ているから、私もこの店で学びたいと思えたんです。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ミラ", expression: "normal", text: "先輩、覚えていますか。昔、星瓶堂の棚を題材にして、二人で小さな研究帳を作ったこと。" },
          { speaker: "ナーディル", expression: "fun", text: "覚えてるよ。君は瓶の配置まで数式にしようとして、俺は途中で目を回した。" },
          { speaker: "ミラ", expression: "joy", text: "でも先輩は、最後に言ってくれました。使う人が迷わない棚なら、それも立派な錬金術だって。" },
          { speaker: "ナーディル", expression: "normal", text: "そんなことを言ったのか。今聞くと、ずいぶん星瓶堂らしい答えだな。" },
          { speaker: "ミラ", expression: "sorrow", text: "私にとっては、研究の原点です。天才の発表ではなく、誰かの暮らしに届く錬金術を選びたいんです。" }
        ]
      }
    },
    {
      id: "mira_climax",
      heroineId: "mira",
      threshold: 30,
      kind: "route_climax",
      title: "正解の前の私",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01"
      },
      summary: "天才ゆえの失敗への恐怖を吐露するミラに対し、ナーディルはその過程すべてを肯定し、彼女が「ただの自分」でいられる場所であることを示す。",
      pages: [
        { "speaker": "ミラ", "expression": "sorrow", "text": "天才だと言われるほど、間違えるのが怖くなります。期待を裏切るのが怖いんです。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "ミラが迷って、試して、失敗して、それでも考えるところを俺は見てきた。" },
        { "speaker": "ミラ", "expression": "surprise", "text": "答えだけではなく、そこまで見てくれるんですね。" },
        { "speaker": "ナーディル", "expression": "joy", "text": "もちろん。俺が信じているのは、天才の看板じゃなくて、目の前のミラだから。" },
        { "speaker": "ミラ", "expression": "joy", "text": "……先輩の前では、正解の前の私でいてもいいんですね。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ミラ", expression: "sorrow", text: "昔、一度だけ実験に失敗して、もう飛び級なんて無理だと思った日がありました。" },
          { speaker: "ナーディル", expression: "normal", text: "覚えてる。君は泣きそうな顔で、失敗した計算紙を全部抱えてきた。" },
          { speaker: "ミラ", expression: "cry", text: "先輩は、答えを直すより先に、紙を捨てなかったことを褒めてくれました。" },
          { speaker: "ナーディル", expression: "joy", text: "迷って、書き直して、それでも考える君を知っていたからだよ。天才だからじゃない。" },
          { speaker: "ミラ", expression: "joy", text: "……昔から、先輩の前では正解の前の私でいられました。今も、その場所に帰ってきたいんです。" }
        ]
      }
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
      summary: "開店前、ダリヤさんとの出会いを思い出す。王宮錬金局からの正式な鑑定依頼が、彼女との始まりだった。",
      pages: [
        { 
          speaker: "ナーディル", 
          expression: "normal", 
          text: "ダリヤさんは……最初は本当に『公務』として、この店に来たんだよな。",
          backgroundId: "shopExteriorDay"
        },
        { 
          speaker: "ダリヤ", 
          expression: "normal", 
          text: "「王宮錬金局のダリヤ・アル＝アズラクです。星瓶堂の技術、王室の基準に照らして確認させていただきます」\n検証室で会った時の彼女は、氷のように冷たく、完璧な公務員だった。",
          backgroundId: "palaceLab"
        },
        { 
          speaker: "ナーディル", 
          expression: "sorrow", 
          text: "「厳しいですね。でも、俺の作る品に嘘はありません」\n俺が差し出した試作瓶を、彼女は無言で、しかし誰よりも真剣な眼差しで解析し始めた。",
          backgroundId: "palaceLab"
        },
        { 
          speaker: "ダリヤ", 
          expression: "joy", 
          text: "「……不合格。理論が古すぎるわ。でも、使い手の体温まで計算されている。嫌いな設計じゃない」\n最後に微かに見せたその笑みが、今の「友人」としての関係の種だったんだと思う。",
          backgroundId: "palaceLab"
        },
        { 
          speaker: "ナーディル", 
          expression: "joy", 
          text: "今では良き関係者として、王宮との橋渡しまでしてくれている。……さあ、背筋を伸ばして始めよう。",
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
      summary: "王宮での重圧を抱えるダリヤが、星瓶堂でだけは鎧を下ろし、一人の人として息をつく。",
      pages: [
        { speaker: "ダリヤ", expression: "normal", text: "閉店後の星瓶堂に、ダリヤは細い瓶を抱えて現れた。\n「公務の確認だ。……半分は、口実かもしれないが」" },
        { speaker: "", expression: "sorrow", text: "王宮印の封蝋は冷たく、瓶の中身よりも重く見えた。\nナーディルは黙って椅子を引き、温かい茶を置く。" },
        { speaker: "ダリヤ", expression: "sorrow", text: "ダリヤは少しだけ目を伏せた。\n「君の店は困るな。立ち上がる理由を、忘れてしまいそうになる」" },
        { speaker: "", expression: "joy", text: "その笑みは疲れていたが、初めて肩の力が抜けていた。\n星瓶堂の夜は、どんな霊薬より静かに彼女を休ませた。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "normal", text: "ダリヤは扉を閉めるなり、昔のように小さく息を吐いた。\n「君は相変わらず、追い出すのが下手だな」" },
          { speaker: "", expression: "sorrow", text: "学生の頃も、王宮に入った後も。\n彼女は本当に疲れた夜だけ、この店の灯を思い出し訪れていた。" },
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
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-01",
        heroineExpressions: ["normal", "sorrow", "joy"],
        naderExpressions: ["normal", "surprise", "joy"]
      },
      summary: "完璧でなければならないという呪縛から解き放たれ、ダリヤはナーディルの前でだけ弱さを共有する。",
      pages: [
        { speaker: "", expression: "normal", text: "王宮錬金局の検証室は、音まで整いすぎていた。\nダリヤは手順書を閉じ、静かに眉を寄せる。" },
        { speaker: "ダリヤ", expression: "sorrow", text: "「完璧な配合だ。……だが、君の作ったものより冷たい」\n彼女は、星瓶堂から持ち帰った香りをそっと嗅いだ。" },
        { speaker: "ダリヤ", expression: "joy", text: "「君の理論は、いつも少しだけ隙がある。だから人が入る余地があるんだ」\nそれは、王立錬金術師の評価ではなく、一人の友人としての言葉だった。" },
        { speaker: "ダリヤ", expression: "joy", text: "「……また明日、君の店に行こう。少しだけ、あの隙間が恋しい」\n彼女の横顔は、昼間よりずっと穏やかだった。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "sorrow", text: "夜の検証室で、ダリヤはついに筆を置いた。\n「昔なら、もう少し上手に隠せたはずなのだが」" },
          { speaker: "", expression: "normal", text: "ナーディルは答えを急かず、ただ隣に立った。\nその沈黙が、昔から彼女には何よりありがたかった。" },
          { speaker: "ダリヤ", expression: "sorrow", text: "「私は、特別でなくなるのが怖かった」\nダリヤの声は震えたが、逃げることはなかった。" },
          { speaker: "ダリヤ", expression: "joy", text: "「だが君は、特別でない私にも茶を出すのだろう」\n彼女は泣きそうに笑い、ようやく前を向いた。" }
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
      summary: "王宮の案件をナーディルに相談するダリヤ。王宮が忘れがちな「当たり前」を大切にするナーディルの視点を高く評価する。",
      pages: [
        { "speaker": "ダリヤ", "expression": "normal", "text": "王宮の検証案件を、星瓶堂にも相談したい。君の目は、研究所と少し違う。" },
        { "speaker": "ナーディル", "expression": "surprise", "text": "王宮の案件を俺に？ 光栄ですけど、少し緊張しますね。" },
        { "speaker": "ダリヤ", "expression": "fun", "text": "緊張くらいでちょうどいい。王宮には、緊張しすぎて息を忘れる者も多いからね。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "俺は、使う人が息をしやすい品かどうかを見たいです。" },
        { "speaker": "ダリヤ", "expression": "joy", "text": "だから君に頼みたい。私が忘れかける当たり前を、君はまだ覚えている。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "normal", text: "学生の頃、君と組んだ検証はいつも少し予定を外れた。手順書通りには進まなかったな。" },
          { speaker: "ナーディル", expression: "fun", text: "ダリヤさんが怖い顔をして、最後には少し笑ってくれるまでが一組でしたね。" },
          { speaker: "ダリヤ", expression: "fun", text: "生意気な後輩だったよ。だが、君の発想に救われたことも一度や二度ではない。" },
          { speaker: "ナーディル", expression: "normal", text: "今も同じです。俺は、使う人が息をしやすい品かどうかを見たい。" },
          { speaker: "ダリヤ", expression: "joy", text: "だからこそ頼みたい。立場が変わっても、君だけはその当たり前を忘れないでいてくれ。" }
        ]
      }
    },
    {
      id: "dariya_climax",
      heroineId: "dariya",
      threshold: 30,
      kind: "route_climax",
      title: "座らせてくれる場所",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "DARIYA-01"
      },
      summary: "完璧であることを自らに強いるダリヤに対し、ナーディルは弱さも受け入れる安らぎの場を供し、二人の関係は公務を超えたものへと昇華する。",
      pages: [
        { "speaker": "ダリヤ", "expression": "sorrow", "text": "王宮では、優秀でいることに慣れすぎた。できない私を, 私自身が許せない。" },
        { "speaker": "ナーディル", "expression": "sorrow", "text": "できない日があっても、ダリヤさんが積み重ねてきたものは消えません。" },
        { "speaker": "ダリヤ", "expression": "cry", "text": "君は簡単に言うな。……いや、簡単に聞こえるほど自然に言うから困る。" },
        { "speaker": "ナーディル", "expression": "normal", "text": "ここでは、王宮錬金術師である前に、ダリヤさんとして座ってくれればいい。" },
        { "speaker": "ダリヤ", "expression": "joy", "text": "……なら、少しだけ座らせてもらおう。立ち上がる時は、君の茶を一杯もらってからだ。" }
      ],
      routePages: {
        long_history: [
          { speaker: "ダリヤ", expression: "sorrow", text: "昔、一度だけ君に言ったな。特別でなくなった私は、何者でいればいいのだろうと。" },
          { speaker: "ナーディル", expression: "normal", text: "覚えています. 俺はその時、何も立派な答えを返せなかった。茶を出すくらいしかできなくて。" },
          { speaker: "ダリヤ", expression: "cry", text: "それで十分だった。君は私を慰めず、責めず、ただ座らせてくれた。" },
          { speaker: "ナーディル", expression: "sorrow", text: "今も同じです。完璧でいられない日も、ここではダリヤさんとして座ってくれればいい。" },
          { speaker: "ダリヤ", expression: "joy", text: "……なら、あの時と同じ茶をもらおう。立ち上がるのは、それを飲んでからにする。" }
        ]
      }
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
