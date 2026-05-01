/**
 * Daily Talks for Made in Maghribal
 * 
 * Categories:
 * - work: Shop management, materials, alchemy (Initiated by context/Nader)
 * - personal: Relationship, gossip, date promises (Initiated by Heroine)
 * 
 * Flow:
 * Morning sequence should pick ONE 'work' talk and ONE 'personal' talk.
 */

export const DAILY_TALKS = [
  // --- Common (Nader Context / Work) ---
  {
    id: "common_father_camera_biz",
    scope: "common",
    category: "work",
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
    category: "work",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "営業前に棚を少し掃除した。古い天秤に積もった埃を払うと、昔の記憶も一緒に蘇るようだ。" },
      { speaker: "ナーディル", expression: "joy", text: "俺もいつか、この道具に恥ずかしくない店主になりたいな。" }
    ]
  },
  {
    id: "common_shop_name_origin",
    scope: "common",
    category: "work",
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
    category: "work",
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
    category: "work",
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

  // --- Common (Personal) ---
  {
    id: "common_market_snack",
    scope: "common",
    category: "personal",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "市場で焼き菓子を買ってきた。ここのデーツパイは、香草茶と相性がいいんだ。" },
      { speaker: "ナーディル", expression: "fun", text: "営業の合間に少しつまめば、目利きにも甘さが戻る……気がする。" }
    ]
  },
  {
    id: "common_fountain_rest",
    scope: "common",
    category: "personal",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "広場の噴水に、白い鳩が集まっていたよ。" },
      { speaker: "ナーディル", expression: "joy", text: "水音を聞いていると、砂漠の熱さも一瞬だけ忘れられる気がするな。" }
    ]
  },

  // --- Hakima (Work) ---
  {
    id: "hakima_morning_check",
    scope: "heroine",
    category: "work",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "最近の仕入れはどう？ 変なものを掴まされてないでしょうね。あんたは人が良すぎるから。" },
      { speaker: "ナーディル", expression: "normal", text: "ありがとう、ハキマ。君がそうやって釘を刺してくれるから、俺も気を引き締められるよ。" }
    ]
  },
  {
    id: "hakima_spice_fake",
    scope: "heroine",
    category: "work",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "最近、安物の樹脂に香りを足した偽物が出回ってるの。見た目だけなら悪くないけど。" },
      { speaker: "ハキマ", expression: "anger", text: "だから鼻と手触りで見るの。あんたも、値札だけで判断しないことね。" }
    ]
  },

  // --- Hakima (Personal) ---
  {
    id: "hakima_little_brother",
    scope: "heroine",
    category: "personal",
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
    id: "hakima_date_promise_01",
    scope: "heroine",
    category: "personal",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 2, // Higher priority for date promises
    pages: [
      { speaker: "ハキマ", expression: "blush", text: "今日の仕事が終わったら、市場の新しいカフェに行かない？ ……別にあんたと行きたいわけじゃないけど、一人じゃ入りにくい店なのよ。" },
      { speaker: "ナーディル", expression: "joy", text: "いいよ、ハキマ。楽しみにしてる。" }
    ]
  },

  // --- Mira (Work) ---
  {
    id: "mira_university_news",
    scope: "heroine",
    category: "work",
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
    id: "mira_preservation_bottle",
    scope: "heroine",
    category: "work",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "先輩、この保存瓶の封止、少しだけ改良できそうです。輸送中の香り抜けを抑えられます。" },
      { speaker: "ナーディル", expression: "joy", text: "それは助かるな。遠くの街まで、星瓶堂の香りをそのまま届けられる。" }
    ]
  },

  // --- Mira (Personal) ---
  {
    id: "mira_failed_formula",
    scope: "heroine",
    category: "personal",
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
    id: "mira_date_promise_01",
    scope: "heroine",
    category: "personal",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 2,
    pages: [
      { speaker: "ミラ", expression: "blush", text: "先輩、今夜お時間ありますか？ 噴水広場で星が綺麗に見えるそうなんです。……一緒に、見ませんか？" },
      { speaker: "ナーディル", expression: "joy", text: "もちろん。ミラの解説付きなら、星も一段と輝きそうだな。" }
    ]
  },

  // --- Dariya (Work) ---
  {
    id: "dariya_palace_protocol",
    scope: "heroine",
    category: "work",
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
    id: "dariya_royal_safety",
    scope: "heroine",
    category: "work",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の調合品は、効能より先に安全証明を求められる。美しいが、息の詰まる仕事だ。" },
      { speaker: "ナーディル", expression: "normal", text: "暮らしに届く品ほど、安心して使えることが大事ですからね。" },
      { speaker: "ダリヤ", expression: "joy", text: "そうだな。君は、王宮が時々忘れる当たり前を覚えている。" }
    ]
  },

  // --- Dariya (Personal) ---
  {
    id: "dariya_palace_tea",
    scope: "heroine",
    category: "personal",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の茶葉はどれも最高級だが……この店の、少しスパイスが混ざったような香りは悪くない。" },
      { speaker: "ナーディル", expression: "normal", text: "そう言ってもらえると嬉しいです。ここでは、少しでも息をつけるようにしておきます。" }
    ]
  },
  {
    id: "dariya_date_promise_01",
    scope: "heroine",
    category: "personal",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 2,
    pages: [
      { speaker: "ダリヤ", expression: "blush", text: "ナーディル、今夜王宮の特別な庭園が開放されるんだ。……もし良ければ、同行してくれないか？ 君の感想が聞きたい。" },
      { speaker: "ナーディル", expression: "joy", text: "喜んで、ダリヤさん。俺で良ければお供します。" }
    ]
  }
];
