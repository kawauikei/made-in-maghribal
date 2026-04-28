/**
 * Heroine Data Definitions
 * 
 * Asset Placement Rules (public/characters/):
 * - Standing: [heroine_id]/standing/[variant].png
 * - Face: [heroine_id]/face/[variant].png
 */

export const HEROINES = [
  {
    id: "hakima",
    fullName: "ハキマ・アル＝ルハーン",
    name: "ハキマ",
    age: 19,
    role: "香料・薬草・染料の商会 品質鑑定見習い",
    relationship: "ナーディルの一つ下の幼馴染",
    personality: "負けず嫌いで家族思い。口は少し悪いが面倒見がいい。好きな相手ほど厳しく接する。",
    routeTheme: "置いていかれた幼馴染が、もう一度隣に立つ話",
    musicMood: "少し尖ったテンポ、跳ねるリズム、狐っぽい軽快さ、幼馴染の温かさと切なさ",
    themeTrackId: "HAKIMA-01",
    description: "狐耳と尻尾を持つ獣人少女。負けず嫌いだが面倒見がよく、公私ともにナーディルを支えてくれる。",
    assets: {
      standing: {
        default: "characters/hakima/standing/normal.png",
        normal: "characters/hakima/standing/normal.png",
        joy: "characters/hakima/standing/joy.png",
        anger: "characters/hakima/standing/anger.png",
        cry: "characters/hakima/standing/cry.png",
        fun: "characters/hakima/standing/fun.png",
        surprise: "characters/hakima/standing/surprise.png",
        sorrow: "characters/hakima/standing/sorrow.png"
      },
      face: {
        default: "characters/hakima/face/normal.png",
        normal: "characters/hakima/face/normal.png",
        joy: "characters/hakima/face/joy.png",
        anger: "characters/hakima/face/anger.png",
        cry: "characters/hakima/face/cry.png",
        fun: "characters/hakima/face/fun.png",
        surprise: "characters/hakima/face/surprise.png",
        sorrow: "characters/hakima/face/sorrow.png"
      }
    },
    visualConfig: {
      facePosition: "center 24%"
    },
    themeColor: "#ffcc00"
  },
  {
    id: "mira",
    fullName: "ミラ-サフワーン",
    name: "ミラ",
    age: 15,
    role: "錬金大学 学生 / サフワーン商会の令嬢",
    relationship: "ナーディルの大学時代の部活動の後輩",
    personality: "礼儀正しく賢いが、少しませている。素材工学と商用錬金術が得意。",
    routeTheme: "特別扱いされ続けた天才少女が、普通の恋を知る話",
    musicMood: "透明感と知性、細かく動く可愛いメロディ、ベル、ピチカート、軽い弦、木管",
    themeTrackId: "MIRA-01",
    description: "王国屈指の大商会の娘でありながら、普通の女の子として見てほしいと願う賢い少女。",
    assets: {
      standing: {
        default: "characters/mira/standing/normal.png",
        normal: "characters/mira/standing/normal.png",
        joy: "characters/mira/standing/joy.png",
        anger: "characters/mira/standing/anger.png",
        cry: "characters/mira/standing/cry.png",
        fun: "characters/mira/standing/fun.png",
        surprise: "characters/mira/standing/surprise.png",
        sorrow: "characters/mira/standing/sorrow.png"
      },
      face: {
        default: "characters/mira/face/normal.png",
        normal: "characters/mira/face/normal.png",
        joy: "characters/mira/face/joy.png",
        anger: "characters/mira/face/anger.png",
        cry: "characters/mira/face/cry.png",
        fun: "characters/mira/face/fun.png",
        surprise: "characters/mira/face/surprise.png",
        sorrow: "characters/mira/face/sorrow.png"
      }
    },
    visualConfig: {
      facePosition: "center 23%"
    },
    themeColor: "#00ccff"
  },
  {
    id: "dariya",
    fullName: "ダリア・ザフラーン",
    name: "ダリヤ",
    age: 23,
    role: "王宮錬金術師",
    relationship: "ナーディルの大学時代の先輩",
    personality: "鬼族の女性。クールで気品があり、少し皮肉屋。内面は仕事でかなり疲れている。",
    routeTheme: "一番でなくなった先輩が、それでも自分の価値を取り戻す話",
    musicMood: "美しく重い、低弦、ピアノ、控えめな女声コーラス、金属的な響き、最後に救い",
    themeTrackId: "DARIYA-01",
    description: "普段はクールなエリートだが、星瓶堂ではふと気を抜いた素顔を見せる鬼族の先輩。",
    assets: {
      standing: {
        default: "characters/dariya/standing/normal.png",
        normal: "characters/dariya/standing/normal.png",
        joy: "characters/dariya/standing/joy.png",
        anger: "characters/dariya/standing/anger.png",
        cry: "characters/dariya/standing/cry.png",
        fun: "characters/dariya/standing/fun.png",
        surprise: "characters/dariya/standing/surprise.png",
        sorrow: "characters/dariya/standing/sorrow.png"
      },
      face: {
        default: "characters/dariya/face/normal.png",
        normal: "characters/dariya/face/normal.png",
        joy: "characters/dariya/face/joy.png",
        anger: "characters/dariya/face/anger.png",
        cry: "characters/dariya/face/cry.png",
        fun: "characters/dariya/face/fun.png",
        surprise: "characters/dariya/face/surprise.png",
        sorrow: "characters/dariya/face/sorrow.png"
      }
    },
    visualConfig: {
      facePosition: "center 17%"
    },
    themeColor: "#cc00ff"
  }
];

export function getHeroineAsset(heroineId, type, expression = "normal") {
  const heroine = HEROINES.find(h => h.id === heroineId);
  if (!heroine) return null;
  
  // Prioritize face_proc for "face" type
  if (type === 'face') {
    // For nader (not in HEROINES list but we might call this), 
    // or if we want to be safe, we check if the char is known.
    return `characters/${heroineId}/face_proc/${expression}.png`;
  }
  
  // Expression fallback: specified -> normal -> default
  const variantPath = heroine.assets[type]?.[expression] 
    || heroine.assets[type]?.normal 
    || heroine.assets[type]?.default;
    
  if (!variantPath) return null;
  
  return variantPath;
}
