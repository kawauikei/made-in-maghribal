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
        default: "characters/hakima/standing/default.png"
      },
      face: {
        default: "characters/hakima/face/default.png"
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
        default: "characters/mira/standing/default.png"
      },
      face: {
        default: "characters/mira/face/default.png"
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
        default: "characters/dariya/standing/default.png"
      },
      face: {
        default: "characters/dariya/face/default.png"
      }
    },
    themeColor: "#cc00ff"
  }
];

export function getHeroineAsset(heroineId, type, variant = "default") {
  const heroine = HEROINES.find(h => h.id === heroineId);
  if (!heroine) return null;
  
  const variantPath = heroine.assets[type]?.[variant] || heroine.assets[type]?.default;
  if (!variantPath) return null;
  
  return variantPath;
}
