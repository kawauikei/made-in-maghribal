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
    name: "ハキマ",
    role: "工房の先輩 / 幼馴染",
    description: "家族から工房を受け継いだあなたを、公私ともに支えてくれる頼れる先輩。",
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
    themeColor: "#ffcc00"
  },
  {
    id: "mira",
    name: "ミラ",
    role: "旅の商人",
    description: "珍しい素材を工房に持ち込んでくれる、快活な少女。",
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
    themeColor: "#00ccff"
  },
  {
    id: "dariya",
    name: "ダリヤ",
    role: "王宮の使者",
    description: "時折、王宮からの特別な依頼を携えてやってくる。",
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
    themeColor: "#cc00ff"
  }
];

export function getHeroineAsset(heroineId, type, expression = "normal") {
  const heroine = HEROINES.find(h => h.id === heroineId);
  if (!heroine) return null;
  
  // Expression fallback: specified -> normal -> default
  const variantPath = heroine.assets[type]?.[expression] 
    || heroine.assets[type]?.normal 
    || heroine.assets[type]?.default;
    
  if (!variantPath) return null;
  
  return variantPath;
}
