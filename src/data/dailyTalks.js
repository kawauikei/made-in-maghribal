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
  }
];

/**
 * Returns all daily talks.
 * @returns {Array}
 */
export function getAllDailyTalks() {
  return DAILY_TALKS;
}
