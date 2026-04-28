/**
 * Heroine Data Definitions for Made in Maghribal
 */

export const HEROINES = [
  {
    id: "hakima",
    fullName: "ハキマ・アル＝ルハーン",
    name: "ハキマ",
    role: "品質鑑定見習い / 知己",
    age: 19,
    themeColor: "#ffcc00", // Gold/Yellow
    themeTrackId: "HAKIMA-01",
    visualConfig: {
      facePosition: "center 20%",
      standingScale: 1.0
    },
    description: "親戚が営む香料・薬草・染料の商会『アル＝ルハーン香材商会』で品質鑑定見習いを務める少女。素材の真贋を見抜く確かな目を持っている。",
    personality: "ツンデレで負けず嫌い。怒っているようで実は相手を心配している世話焼きな性格。好きな相手ほど厳しく接してしまう傾向がある。",
    relationship: "通常ルートでは、同業・商会関係の顔見知り程度。星瓶堂を盛り立てていく過程で、商会の鑑定担当として関わることになる。若店主としてのナーディルの手腕を試すような態度を取る。",
    stats: {
      precision: 80,
      knowledge: 70,
      social: 90
    },
    routeTheme: "同業者としての対等な信頼関係の構築",
    musicMood: "快活で少し強気な旋律",
    greeting: "おはよう、ナーディル。今日もお店、開けましょうか。あたしも準備、手伝うから。あんたの目利き、しっかり見せてもらうよ。",
    assets: { standing: {}, face: {} } 
  },
  {
    id: "mira",
    fullName: "ミラ・サフワーン",
    name: "ミラ",
    role: "錬金大学の後輩 / 商家令嬢",
    age: 16,
    themeColor: "#3d5afe", // Royal Blue
    themeTrackId: "MIRA-01",
    visualConfig: {
      facePosition: "center 15%",
      standingScale: 0.95
    },
    description: "大商会『アル・アサド商会』の令嬢で、錬金大学の現役学生。今年卒業見込みで、大学史上初の3年飛び級を果たすと目されている天才少女。",
    personality: "礼儀正しく賢い。子供扱いされるのを嫌い、一人前の商人・錬金術師として振る舞おうとするが、ナーディルの前では年相応の甘えが出ることも。",
    relationship: "大学時代の先輩後輩。課題の相談や素材の購入、商会の試作品モニターなどの接点を通じて距離を縮めていく。周囲の『天才』という評価ではなく、一人の女の子として見られたいと願っている。",
    stats: {
      precision: 95,
      knowledge: 85,
      social: 60
    },
    routeTheme: "天才少女が普通の恋を知る物語",
    musicMood: "知性的で透明感のある旋律",
    greeting: "おはようございます、先輩。今日も素晴らしい目利きを期待しています。私も隣で、鑑定の極意を学ばせてくださいね。",
    assets: { standing: {}, face: {} }
  },
  {
    id: "dariya",
    fullName: "ダリア・ザフラーン",
    name: "ダリヤ",
    role: "王宮錬金術師 / 知己",
    age: 23,
    themeColor: "#f44336", // Crimson/Red
    themeTrackId: "DARIYA-01",
    visualConfig: {
      facePosition: "center 25%",
      standingScale: 1.05
    },
    description: "王宮錬金局の調合・検証部門に所属するエリート。鬼族（単角）の女性で、王都では気品ある美女として知られるが、鬼族の美意識からは少し外れているという自覚がある。",
    personality: "クールで皮肉屋だが、内面は王宮の重圧に疲れている。普段は『強いお姉さん』を装っているが、心を許した相手には弱さを見せたり甘えたりすることもある。",
    relationship: "大学時代の優秀な先輩。現在は公務の傍ら、星瓶堂に王宮向けの鑑定依頼や試作の検証を持ち込んでくる。完璧であることを求められる日々の中で、星瓶堂を唯一の安らぎの場と感じるようになる。",
    greeting: "おはよう、ナーディル。今日の朝の空気は、真理を見通すのに最適だと思わないか？ さあ、始めよう。君の鑑定、興味深く見守らせてもらうよ。",
    stats: {
      precision: 90,
      knowledge: 95,
      social: 75
    },
    routeTheme: "完璧でない自分を受け止める安らぎの恋",
    musicMood: "気品があり、どこか憂いを含んだ旋律",
    assets: { standing: {}, face: {} }
  }
];

export function getHeroineById(id) {
  return HEROINES.find(h => h.id === id);
}

/**
 * Returns the path to a heroine asset.
 * @param {string} heroineId 
 * @param {string} type - 'standing' or 'face'
 * @param {string} expression - 'normal', 'joy', 'fun', 'sorrow', 'cry', etc.
 * @returns {string}
 */
export function getHeroineAsset(heroineId, type, expression = 'normal') {
  // Asset names are formatted as: [id]_[type]_[expression].png
  // Example: hakima_face_normal.png
  return `characters/${heroineId}/${heroineId}_${type}_${expression}.png`;
}