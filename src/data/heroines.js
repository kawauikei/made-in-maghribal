/**
 * Heroine Data Definitions for Made in Maghribal
 */

export const HEROINES = [
  {
    id: "hakima",
    fullName: "ハキマアル＝ルハーン",
    name: "ハキマ",
    role: "品質鑑定見習い / 知己",
    age: 19,
    themeColor: "#ffcc00",
    themeTrackId: "HAKIMA-01",
    visualConfig: {
      facePosition: "center 20%",
      standingScale: 1.0
    },
    description: "アル＝ルハーン香材商会で素材を見分ける仕事に携わる少女。香りや色、手触りの違いを見抜く観察眼があり、星瓶堂でも頼れる協力者になる。",
    routeDescription: "かつてナーディルと共に学んだ、香材商会の若き主。今は離れた場所にいるが、ある品を探して星瓶堂の扉を叩くことになる。",
    personality: "ツンデレで負けず嫌い。怒っているようで実は相手を心配している世話焼きな性格。",
    relationship: "通常ルートでは、同業・商会関係の顔見知り程度。星瓶堂を支える流れの中で、協力者として距離を縮めていく。",
    routeRelationship: "過去から続く縁。かつて交わした約束を胸に、再び協力者として歩み寄る関係。",
    stats: {
      precision: 80,
      knowledge: 70,
      social: 90
    },
    routeTheme: "現在から育つ縁の象徴としての顔見知り関係",
    musicMood: "軽やかで少し照れくさい旋律",
    greeting: "来たわよ、ナーディル。今日も星瓶堂らしい目利き、見せてもらうから。",
    assets: { standing: {}, face: {} }
  },
  {
    id: "mira",
    fullName: "ミラサフワーン",
    name: "ミラ",
    role: "錬金大学の後輩 / 協力者",
    age: 16,
    themeColor: "#3d5afe",
    themeTrackId: "MIRA-01",
    visualConfig: {
      facePosition: "center 15%",
      standingScale: 0.95
    },
    description: "錬金大学で学ぶ少女。知識の吸収が早く、星瓶堂では新しい発想を持ち込んでくれる。",
    personality: "礼儀正しく賢い。子供扱いされるのを嫌い、一人前として見られたいと思っている。",
    relationship: "課題の相談や素材の購入、試作品の確認などを通じて距離を縮める協力者。",
    stats: {
      precision: 95,
      knowledge: 85,
      social: 60
    },
    routeTheme: "知識と好奇心がつなぐ協力関係",
    musicMood: "知性的で透明感のある旋律",
    greeting: "こんにちは、先輩。今日は課題の材料について、少し相談させてください。",
    assets: { standing: {}, face: {} }
  },
  {
    id: "dariya",
    fullName: "ダリヤザフラーン",
    name: "ダリヤ",
    role: "王宮錬金局のエリート / 協力者",
    age: 23,
    themeColor: "#f44336",
    themeTrackId: "DARIYA-01",
    visualConfig: {
      facePosition: "center 25%",
      standingScale: 1.05
    },
    description: "王宮錬金局の要職にある女性。強く見える一方で、内面には疲れも抱えている。",
    personality: "クールで皮肉屋だが、内面は重圧に疲れている。心を許した相手には弱さを見せることもある。",
    relationship: "公務の合間に星瓶堂へ顔を出す協力者。落ち着いた大人の距離感を持つ。",
    greeting: "邪魔するよ、ナーディル。王宮の検証品について、少し見立てを借りたい。",
    stats: {
      precision: 90,
      knowledge: 95,
      social: 75
    },
    routeTheme: "立場の強さと本音の揺れが交わる関係",
    musicMood: "静かな緊張感を帯びた旋律",
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
  const subDir = type === 'face' ? 'face_proc' : 'standing_proc';
  return `characters/${heroineId}/${subDir}/${expression}.png`;
}
