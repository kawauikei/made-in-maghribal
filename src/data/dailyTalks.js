/**
 * Daily Talks (Gossips) Data
 * 
 * Each talk has a 'category' field:
 * - 'work': Shop environment, ingredients, customer service, crafting.
 * - 'personal': Family, memories, personal feelings, date promises.
 */
export const DAILY_TALKS = [
  // --- Common (Nader's Monologues) ---
  {
    id: "common_fountain_rest",
    scope: "common",
    category: "work", // Shop surroundings
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
  {
    id: "common_morning_mist",
    scope: "common",
    category: "work",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "今朝は珍しく霧が出ていた。マグリバルでは珍しい光景だ。" },
      { speaker: "ナーディル", expression: "surprise", text: "瓶のガラスが曇って、まるで別の店に迷い込んだみたいだったよ。" }
    ]
  },
  {
    id: "common_mother_postcard",
    scope: "common",
    category: "personal",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "母さんから絵葉書が届いた。父さんの写真より、旅先の菓子の話の方が長い。" },
      { speaker: "ナーディル", expression: "fun", text: "あの二人らしいよ。世界を見に行っても、結局は茶と甘い物の話になる。" }
    ]
  },
  {
    id: "common_sister_camera_shop",
    scope: "common",
    category: "personal",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "姉さんのカメラ会社は、また支店を増やすらしい。手紙の文字まで忙しそうだった。" },
      { speaker: "ナーディル", expression: "joy", text: "すごいと思う。でも俺は、この棚の前で客と話す時間も悪くないと思ってる。" }
    ]
  },
  {
    id: "common_customer_gift",
    scope: "common",
    category: "work",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "今日は贈答用の相談が来るらしい。香り袋か、青い小瓶か、相手の暮らしで変わるな。" },
      { speaker: "ナーディル", expression: "joy", text: "品を選ぶのは、物を当てることじゃない。誰かの時間に、きちんと届く形を探すことなんだ。" }
    ]
  },

  // --- Hakima ---
  {
    id: "hakima_forest_resin",
    scope: "heroine",
    category: "work",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "ラウダの森から樹脂が届いたの。香りは良いけど、湿気を吸うとすぐ機嫌を損ねるわ。" },
      { speaker: "ハキマ", expression: "fun", text: "誰かさんみたい？ ……違うわよ。私はもっと扱いやすいでしょ。" }
    ]
  },
  {
    id: "hakima_customer_habit",
    scope: "heroine",
    category: "work",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "香材を選ぶ時は、客の手元を見るの。袋の持ち方で、普段使いか贈り物か分かるから。" },
      { speaker: "ナーディル", expression: "joy", text: "君の目利きは、香りだけじゃないんだな。俺も見習わないと。" },
      { speaker: "ハキマ", expression: "surprise", text: "素直に褒めないで。……調子が狂うでしょ。" }
    ]
  },
  {
    id: "hakima_long_family_table",
    scope: "heroine",
    category: "personal",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "昔、うちの食卓であんたが香辛料を間違えたの、まだ母さんが笑い話にしてるわ。" },
      { speaker: "ナーディル", expression: "surprise", text: "あれ、まだ覚えられてるのか……。俺としては忘れてほしい記憶なんだけど。" },
      { speaker: "ハキマ", expression: "joy", text: "無理ね。ああいう失敗まで含めて、昔からの付き合いなんだから。" }
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
    priority: 2,
    pages: [
      { speaker: "ハキマ", expression: "fun", text: "ねえ、今夜少し時間ある？ ……新しい香料の試作に付き合ってほしいの。あんたの意見、参考になるし。" },
      { speaker: "ナーディル", expression: "joy", text: "ああ、もちろん。ハキマの新作なら喜んで協力するよ。" }
    ]
  },

  // --- Mira ---
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
  {
    id: "mira_small_failure",
    scope: "heroine",
    category: "work",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "sorrow", text: "昨日、香草茶の配合を間違えました。理論上は綺麗だったのに、味が……とても個性的で。" },
      { speaker: "ナーディル", expression: "fun", text: "個性的で済むなら、まだ商品名でごまかせるかもしれない。" },
      { speaker: "ミラ", expression: "joy", text: "ふふ。先輩、失敗の扱い方が少し優しいです。" }
    ]
  },
  {
    id: "mira_long_after_class",
    scope: "heroine",
    category: "personal",
    heroineId: "mira",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "student", text: "放課後、先輩の机に課題を持っていく時間が、私は少し好きでした。" },
      { speaker: "ナーディル", expression: "fun", text: "少し？ ずいぶん難しい課題を持ってきていた気がするけど。" },
      { speaker: "ミラ", expression: "joy", text: "先輩なら、難しい顔をしながら最後まで付き合ってくれると知っていましたから。" }
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
      { speaker: "ミラ", expression: "joy", text: "先輩、今夜もし空いていたら……一緒に街の市場を見に行きませんか？ 珍しいスパイスが入荷したって聞いたんです。" },
      { speaker: "ナーディル", expression: "joy", text: "市場か、いいね。ミラと一緒なら、面白い発見がありそうだ。" }
    ]
  },

  // --- Dariya ---
  {
    id: "dariya_palace_window",
    scope: "heroine",
    category: "personal",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の窓は美しいよ。磨かれすぎて、外の光まで少し緊張して見える。" },
      { speaker: "ダリヤ", expression: "fun", text: "ここは少し埃っぽいが、そのぶん光がやわらかい. 悪くない違いだ。" }
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
  {
    id: "dariya_long_first_weakness",
    scope: "heroine",
    category: "personal",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "long_history",
    minAffection: 5,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "sorrow", text: "昔、君に一度だけ失敗した実験を見られたな。あれは、今でも少し悔しい。" },
      { speaker: "ナーディル", expression: "normal", text: "俺は、失敗よりも、その後で何度も検証し直していた姿を覚えています。" },
      { speaker: "ダリヤ", expression: "joy", text: "……そういう覚え方をするから、君の前では格好をつけにくいんだ。" }
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
