/**
 * Heroine Data Definitions for Made in Maghribal
 */

export const HEROINES = [
  {
    id: "hakima",
    fullName: "ハキマ・アル＝ルハーン",
    name: "ハキマ",
    role: "鑑定士見習い / 幼馴染",
    age: 18,
    themeColor: "#ffcc00", // Gold/Yellow
    themeTrackId: "HAKIMA-01",
    visualConfig: {
      facePosition: "center 20%",
      standingScale: 1.0
    },
    description: "星瓶堂の隣にある骨董品店の娘で、ナディールとは幼少期からの腐れ縁。現在は正式な鑑定士を目指して修行中の身である。",
    personality: "快活で世話焼き。ナディールの錬金術の腕は認めているが、商売っ気のなさを危惧して、何かと理由をつけては店に顔を出してくる。",
    relationship: "ナディールにとっては、気兼ねなく専門知識を相談できる数少ない相手。彼女もまた、古い道具に宿る物語を解き明かすため、彼の技術を頼りにしている。",
    stats: {
      precision: 80,
      knowledge: 70,
      social: 90
    },
    routeTheme: "専門的な協力関係を通じた信頼の再構築",
    musicMood: "落ち着いた仕事仲間の雰囲気",
    assets: { standing: {}, face: {} } 
  },
  {
    id: "mira",
    fullName: "ミラ・サフワーン",
    name: "ミラ",
    role: "錬金大学の後輩 / 商家令嬢",
    age: 17,
    themeColor: "#3d5afe", // Royal Blue
    themeTrackId: "MIRA-01",
    visualConfig: {
      facePosition: "center 15%",
      standingScale: 0.95
    },
    description: "マグリバル錬金大学でナディールの一学年後輩だった才女。実家は中央市場でも指折りの大商人で、自身も経営学と錬金術を学んでいる。",
    personality: "理知的で少し勝気。効率と論理を重んじるが、ナディールの作る「機能美に優れた」作品に対しては、密かな尊敬を抱いている。",
    relationship: "卒業後、家業の新規事業として星瓶堂との提携を画策し、ビジネスパートナーとしての立ち位置を確立しようとしている。彼女の持ち込む素材や市場情報は極めて正確である。",
    stats: {
      precision: 95,
      knowledge: 85,
      social: 60
    },
    routeTheme: "ビジネスパートナーとしての対等な関係性",
    musicMood: "知性的で透明感のある旋律",
    assets: { standing: {}, face: {} }
  },
  {
    id: "dariya",
    fullName: "ダリア・ザフラーン",
    name: "ダリヤ",
    role: "王宮錬金局・技官 / 知己",
    age: 20,
    themeColor: "#f44336", // Crimson/Red
    themeTrackId: "DARIYA-01",
    visualConfig: {
      facePosition: "center 25%",
      standingScale: 1.05
    },
    description: "若くして王宮錬金局の技官を務めるエリート。公務の傍ら、在野の優れた技術者であるナディールのもとへ、難易度の高い依頼や調査協力を持ち込んでくる。",
    personality: "冷静沈着で公私の区別がはっきりしている。しかし、珍しい古物や高度な錬金術の話になると、年相応の好奇心を覗かせることもある。",
    relationship: "元々は公的な依頼主の一人だったが、ナディールの亡き祖父とも交流があり、現在は個人的な興味も含めて星瓶堂の再興を静かに見守っている。",
    stats: {
      precision: 75,
      knowledge: 95,
      social: 80
    },
    routeTheme: "公的な立場を超えた個人的な知己としての絆",
    musicMood: "気品と好奇心が混ざり合う調べ",
    assets: { standing: {}, face: {} }
  }
];

/**
 * Get heroine data by ID
 */
export function getHeroineById(id) {
  return HEROINES.find(h => h.id === id) || null;
}

/**
 * Get heroine asset path based on type and expression
 */
export function getHeroineAsset(heroineId, type, expression = "normal") {
  const dir = type === 'face' ? 'face_proc' : 'standing_proc';
  const ext = 'png';
  return `characters/${heroineId}/${dir}/${expression}.${ext}`;
}