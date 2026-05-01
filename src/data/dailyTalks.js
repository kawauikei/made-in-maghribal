/**
 * DailyTalk Definitions for Made in Maghribal
 * 
 * Short conversations or monologues to increase scenario density
 * during Intro, Result, or Day End phases.
 */

export const DAILY_TALKS = [
  // --- Common Topics ---
  {
    id: "common_father_camera_biz",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "父さんの錬金カメラ事業は順調みたいだ。世界中から珍しい景色が届くよ。" },
      { speaker: "ナーディル", expression: "joy", text: "でも俺は、この場所で誰かの日常を支える星瓶堂の仕事が好きだ。" }
    ]
  },
  {
    id: "common_shop_dust",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "開店前に棚を少し掃除した。古い天秤に積もった埃を払うと、昔の記憶も一緒に蘇るようだ。" },
      { speaker: "ナーディル", expression: "joy", text: "俺もいつか、この道具に恥ずかしくない店主になりたいな。" }
    ]
  },
  {
    id: "common_shop_name_origin",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "星瓶堂って名前、父さんが若い頃につけたんだ。星を閉じ込めた瓶みたいな店にしたいって。" },
      { speaker: "ナーディル", expression: "joy", text: "少し大げさだけど、子どもの頃の俺には本当にそう見えてたよ。" }
    ]
  },
  {
    id: "common_blue_ceramics",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "この青い陶器は、王都の職人が焼いたものだよ。薬瓶にも茶器にも使える。" },
      { speaker: "ナーディル", expression: "joy", text: "砂の色が多い街だからかな。棚に青があるだけで、少し涼しく見えるんだ。" }
    ]
  },
  {
    id: "common_old_scale",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "この天秤、父さんが店を継ぐ前から使っているらしい。" },
      { speaker: "ナーディル", expression: "sorrow", text: "針の揺れを見るたびに、店って人より長く覚えているんだなと思うよ。" }
    ]
  },
  {
    id: "common_trade_district",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "星瓶堂の周りは交易街区だから、朝からいろんな匂いが混ざる。" },
      { speaker: "ナーディル", expression: "fun", text: "香料、焼き菓子、革袋、たまに怪しい薬草。鼻だけで道案内できそうだ。" }
    ]
  },
  {
    id: "common_camera_letter",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "父さんからまた写真が届いた。今度は海港都市ミナートの朝焼けだって。" },
      { speaker: "ナーディル", expression: "joy", text: "遠い景色を瓶の中みたいに残せるんだから、錬金カメラって不思議だよな。" }
    ]
  },
  {
    id: "common_shop_old_bottle",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "棚の奥から、古い保存瓶が出てきた。祖父の代から使っている型らしい。" },
      { speaker: "ナーディル", expression: "joy", text: "派手な品じゃないけど、こういう瓶が暮らしを支えてきたんだと思うと悪くない。" }
    ]
  },
  {
    id: "common_market_weather",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "交易街区は、風向きで匂いが変わる。今日は香料市と焼き菓子の屋台が近いな。" },
      { speaker: "ナーディル", expression: "fun", text: "腹が減る香りの隣で薬草を売るのは、なかなか難しい商いだよ。" }
    ]
  },
  {
    id: "common_camera_shadow",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "sorrow", text: "父さんの錬金カメラを目当てに来る客は、今でも少なくない。" },
      { speaker: "ナーディル", expression: "joy", text: "でも今日は、星瓶堂の若店主を頼って来たと言われた。……少し、胸を張っていいかな。" }
    ]
  },
  {
    id: "common_shop_after_rain",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "雨上がりの店先は、石畳と薬草の匂いが少しだけ濃くなる。" },
      { speaker: "ナーディル", expression: "joy", text: "こういう日は、香り袋よりも温かい茶の調合がよく出るんだ。" }
    ]
  },

  // --- Heroine Specific: Hakima ---
  {
    id: "hakima_morning_check",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "今日の仕入れはどう？ 変なものを掴まされてないでしょうね。あんたは人が良すぎるから。" },
      { speaker: "ナーディル", expression: "normal", text: "ありがとう、ハキマ。君がそうやって釘を刺してくれるから、俺も気を引き締められるよ。" }
    ]
  },
  {
    id: "hakima_spice_fake",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "最近、安物の樹脂に香りを足した偽物が出回ってるの。見た目だけなら悪くないけど。" },
      { speaker: "ハキマ", expression: "angry", text: "だから鼻と手触りで見るの。あんたも、値札だけで判断しないことね。" }
    ]
  },
  {
    id: "hakima_little_brother",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "fun", text: "弟がね、星瓶堂の光る瓶を欲しがってるの。まったく、子どもって派手なものが好きよね。" },
      { speaker: "ハキマ", expression: "normal", text: "……まあ、安全な小瓶なら一つくらい選んであげてもいいけど。" }
    ]
  },
  {
    id: "hakima_scent_memory",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "香りって不思議よね。少し嗅いだだけで、昔の市場や家の台所まで思い出す。" },
      { speaker: "ハキマ", expression: "sorrow", text: "だから雑に扱う人を見ると、腹が立つの。香材には、暮らしが染みてるんだから。" }
    ]
  },
  {
    id: "hakima_quality_argument",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "angry", text: "この香材、見た目は上等だけど乾かし方が雑ね。贈答品には向かないわ。" },
      { speaker: "ナーディル", expression: "joy", text: "助かるよ。君の鼻があると、棚の品まで背筋が伸びる気がする。" },
      { speaker: "ハキマ", expression: "surprised", text: "なっ……変な褒め方しないで。鑑定士として当然のことを言っただけよ。" }
    ]
  },
  {
    id: "hakima_sibling_gift",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "fun", text: "弟が、星瓶堂の小さな発光瓶を気に入ってるの。危なくない品、選べる？" },
      { speaker: "ナーディル", expression: "normal", text: "子ども用なら、光量を落として瓶も厚めにしよう。転がしても割れにくい方がいい。" },
      { speaker: "ハキマ", expression: "joy", text: "……そういうところは細かいのね。まあ、少しだけ見直したわ。" }
    ]
  },
  {
    id: "hakima_next_to_you",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "今日は難しい依頼が来そうな匂いがする。……何よ、勘じゃなくて経験よ。" },
      { speaker: "ナーディル", expression: "fun", text: "なら、隣で見ていてくれると心強いな。" },
      { speaker: "ハキマ", expression: "joy", text: "仕方ないわね。あんた一人に任せると、少しだけ心配だから。" }
    ]
  },
  {
    id: "hakima_long_old_market",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "昔、二人で市場の香材を当てる勝負をしたの、覚えてる？ あんた、妙に強かったのよね。" },
      { speaker: "ナーディル", expression: "fun", text: "負けた時だけ、君は今よりずっと静かだった気がする。" },
      { speaker: "ハキマ", expression: "angry", text: "余計なことまで覚えてなくていいの。……でも、隣で競うのは嫌いじゃなかったわ。" }
    ]
  },
  {
    id: "hakima_long_do_not_go_ahead",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "sorrow", text: "あんたは昔から、気づくと少し先にいるのよね。目利きも、調合も、店主の顔も。" },
      { speaker: "ナーディル", expression: "sorrow", text: "置いていったつもりはなかった。でも、そう見えていたならごめん。" },
      { speaker: "ハキマ", expression: "joy", text: "謝るより、隣を空けておきなさいよ。今度は私が、そこに立つんだから。" }
    ]
  },

  // --- Heroine Specific: Mira ---
  {
    id: "mira_university_news",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "先輩、聞いてください。大学で新しい抽出法が発見されたんです。まだ実験段階ですが……。" },
      { speaker: "ナーディル", expression: "joy", text: "それは興味深いね。いつか星瓶堂の品作りにも活かせるかもしれない。" }
    ]
  },
  {
    id: "mira_failed_formula",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "昨日の課題、計算は合っていたのに、実験では沈殿が出ました。" },
      { speaker: "ミラ", expression: "sorrow", text: "理論上は正しい、だけでは足りないんですね。……少し悔しいです。" }
    ]
  },
  {
    id: "mira_price_quality",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "高品質な素材を使えば、良い品は作れます。でも、それだけでは商売になりません。" },
      { speaker: "ミラ", expression: "joy", text: "必要な人に届く価格にする。そこまで考えて、初めて商品なんです。" }
    ]
  },
  {
    id: "mira_ordinary_choice",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "fun", text: "実は私、難しい器具より、色のきれいな小瓶を選ぶ方が迷うんです。" },
      { speaker: "ミラ", expression: "surprised", text: "……意外ですか？ こういう迷い方くらい、私にもあります。" }
    ]
  },
  {
    id: "mira_material_doubt",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "先輩、この二つの素材、どちらも理論上は正解なんです。だから困っています。" },
      { speaker: "ナーディル", expression: "normal", text: "なら、今日は正解じゃなくて、誰に届けたい品かを考えてみよう。" },
      { speaker: "ミラ", expression: "surprised", text: "……そういう考え方、先輩らしいです。少し、悔しいくらいに。" }
    ]
  },
  {
    id: "mira_trade_sample",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "商会から試作品を預かってきました。性能は良いのですが、少し高価すぎます。" },
      { speaker: "ナーディル", expression: "normal", text: "良い品でも、必要な人に届かなければ意味が薄いからね。" },
      { speaker: "ミラ", expression: "joy", text: "はい。先輩なら、そう言ってくださると思っていました。" }
    ]
  },
  {
    id: "mira_not_only_genius",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "fun", text: "今日は課題でも商会の用事でもありません。……先輩と少し話したかっただけです。" },
      { speaker: "ナーディル", expression: "surprised", text: "それなら、茶を淹れようか。相談じゃなくても、君の席はあるよ。" },
      { speaker: "ミラ", expression: "joy", text: "ありがとうございます。そう言われると、天才でいるより嬉しいです。" }
    ]
  },
  {
    id: "mira_long_old_formula",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "昔、私の計算式に先輩が赤を入れてくれたこと、まだ覚えています。" },
      { speaker: "ナーディル", expression: "fun", text: "褒めるところより、直すところを探してくれって言われたからね。" },
      { speaker: "ミラ", expression: "joy", text: "はい。先輩だけは、私を天才ではなく後輩として見てくれました。" }
    ]
  },
  {
    id: "mira_long_same_seat",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "sorrow", text: "昔は、先輩の隣の席だけが少し静かでした。誰も私を急かさない席でした。" },
      { speaker: "ナーディル", expression: "normal", text: "今も急がなくていい。答えが出るまで、ここで一緒に考えよう。" },
      { speaker: "ミラ", expression: "joy", text: "……はい。やっぱり私は、この席が一番落ち着きます。" }
    ]
  },

  // --- Heroine Specific: Dariya ---
  {
    id: "dariya_palace_tea",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の茶葉はどれも最高級だが……この店の、少しスパイスが混ざったような香りの方が落ち着く。" },
      { speaker: "ナーディル", expression: "normal", text: "そう言ってもらえると嬉しいです。ここでは、少しでも息をつけるようにしておきます。" }
    ]
  },
  {
    id: "dariya_palace_protocol",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の検証書類は、瓶の中身より重いことがある。" },
      { speaker: "ダリヤ", expression: "fun", text: "中身を一滴調べるために、紙を十枚書く。優雅な仕事だろう？" }
    ]
  },
  {
    id: "dariya_resting_place",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "ここは、王宮ほど静かではないのに落ち着くな。瓶の音も、人の声もある。" },
      { speaker: "ダリヤ", expression: "joy", text: "完璧に整っていないから、かえって息がしやすいのかもしれない。" }
    ]
  },
  {
    id: "dariya_oni_aesthetic",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "鬼族の里では、私は少し細すぎると言われる。王都では逆のことを言われるがね。" },
      { speaker: "ダリヤ", expression: "fun", text: "美しさの基準など、場所が変わればすぐ変わる。実に頼りない真理だ。" }
    ]
  },
  {
    id: "dariya_verification_sample",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮から検証用の小瓶を預かってきた。正式な依頼ではない、少し厄介な確認だ。" },
      { speaker: "ナーディル", expression: "normal", text: "厄介な確認を持ち込まれるくらいには、信用されたと思っておきます。" },
      { speaker: "ダリヤ", expression: "fun", text: "前向きだな。そういう若さは、王宮の空気に少し分けてやりたいよ。" }
    ]
  },
  {
    id: "dariya_imperfect_shelf",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "この棚は、瓶の高さが微妙に揃っていないな。王宮なら直される。" },
      { speaker: "ナーディル", expression: "fun", text: "すみません。気を抜くと、よく使う瓶だけ前に出てくるんです。" },
      { speaker: "ダリヤ", expression: "joy", text: "謝ることはない。使われている棚の方が、飾られた棚より私は好きだ。" }
    ]
  },
  {
    id: "dariya_not_perfect",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "sorrow", text: "今日は少し、王宮錬金術師らしくない顔をしているかもしれない。" },
      { speaker: "ナーディル", expression: "sorrow", text: "ここでは、肩書きより先にダリヤさんが座ってくれれば十分です。" },
      { speaker: "ダリヤ", expression: "joy", text: "……君は時々、こちらが困るほど自然に逃げ道を作るな。" }
    ]
  },
  {
    id: "dariya_long_old_chair",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "fun", text: "この椅子、昔より座り心地がよくなっていないか。ますます立ち上がれなくなる。" },
      { speaker: "ナーディル", expression: "fun", text: "昔から長居していたのは、椅子のせいだけじゃないでしょう。" },
      { speaker: "ダリヤ", expression: "sorrow", text: "……そうだな。君の店は昔から、私が少し黙っていられる場所だった。" }
    ]
  },
  {
    id: "dariya_long_seen_weakness",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 10,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "cry", text: "君は昔から、私が平気な顔をしている時ほど、何も聞かずに茶を出す。" },
      { speaker: "ナーディル", expression: "normal", text: "聞かれたくない日もあるでしょう。でも、一人で戻らなくていい日はあっていい。" },
      { speaker: "ダリヤ", expression: "joy", text: "……本当に、困った後輩だ。おかげで私は、また少し立て直せてしまう。" }
    ]
  }
];

/**
 * Returns all daily talks.
 * @returns {Array}
 */
export function getAllDailyTalks() {
  return DAILY_TALKS;
}
