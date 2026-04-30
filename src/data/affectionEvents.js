/**
 * Affection Event Definitions for Made in Maghribal
 *
 * Normal route text lives in `text`.
 * Route-specific IF text lives in `routePages.long_history`.
 */

export const AFFECTION_EVENTS = {
  hakima: [
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
    }
  ],
  mira: [
    {
      id: "mira_5",
      heroineId: "mira",
      threshold: 5,
      title: "普通の女の子として",
      stillImageId: "miraAfterSchool01",
      presentation: {
        backgroundId: "shopExteriorNight",
        bgmId: "MIRA-01",
        heroineExpressions: ["student", "sorrow", "joy"],
        naderExpressions: ["normal", "surprise"]
      },
      summary: "天才として常に正解を求められるミラが、星瓶堂でだけは「迷うこと」を許され、一人の少女に戻る。",
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
    }
  ],
  dariya: [
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
