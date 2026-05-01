/**
 * Item Types and Genres mapping based on master data.
 */

export const GENRES = [
  { id: "ARM", name: "武具" },
  { id: "FOD", name: "食糧" },
  { id: "MED", name: "薬品" },
  { id: "ADN", name: "アクセサリー" },
  { id: "CLT", name: "衣服" },
  { id: "DAY", name: "日用" },
  { id: "WRK", name: "道具" },
  { id: "TRV", name: "旅具" },
  { id: "RIT", name: "儀式" },
  { id: "TRD", name: "貿易" },
];

export const GENRE_BY_ID = GENRES.reduce((acc, g) => {
  acc[g.id] = g;
  return acc;
}, {});

// Mapping of index to specific item names within a category
const ITEM_NAME_MAP = {
  ARM: ["短剣", "直剣", "小槍", "丸盾", "魔導杖"],
  FOD: ["旅パン", "干し果物", "香辛料瓶", "茶杯", "水筒"],
  MED: ["薬瓶", "霊薬瓶", "軟膏壺", "粉薬瓶", "丸薬箱"],
  ADN: ["指輪", "耳飾り", "首飾り", "腕輪", "留め具"],
  CLT: ["外套", "スカーフ", "旅靴", "革帯", "頭巾"],
  DAY: ["油灯", "方位磁針", "手帳", "寝袋", "小鍵"],
  WRK: ["乳鉢", "トング", "るつぼ", "計量匙", "フラスコ"],
  TRV: ["地図筒", "携帯水筒", "縄束", "旅袋", "小ランタン"],
  RIT: ["香炉", "護符飾り", "儀礼小刀", "小鈴", "香木箱"],
  TRD: ["硬貨袋", "商人秤", "封蝋印", "帳簿", "小宝箱"],
};

export const ITEM_TYPES = [];

GENRES.forEach(genre => {
  const names = ITEM_NAME_MAP[genre.id] || [];
  names.forEach((name, i) => {
    const index = (i + 1).toString().padStart(2, "0");
    ITEM_TYPES.push({
      id: `${genre.id}_${index}`,
      name: name,
      genre: genre.id
    });
  });
});

export const ITEM_TYPE_BY_ID = ITEM_TYPES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});
