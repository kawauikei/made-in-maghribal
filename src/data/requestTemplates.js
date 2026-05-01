export const REQUEST_TEMPLATES = [
  {
    id: "color",
    templates: [
      "夜の砂漠を歩くには、足元を照らす{color}の導きが必要でね。",
      "祝祭に相応しい、{color}に輝く品を探しているんだ。",
      "旅の夜を共にする、{color}の術理を宿した品を頼むよ。",
      "工房の棚に映える、{color}のものが欲しくてね。"
    ]
  },
  {
    id: "genre",
    templates: [
      "旅支度の{genre}が心許なくてね。信頼できる品を一つ頼む。",
      "市場ではなかなか見つからなくて。良い{genre}はあるかい？",
      "大学へ届ける{genre}を探している。確かな品を見立ててくれ。",
      "長旅になる。砂嵐の中でも保存の利く{genre}を選んでほしい。"
    ]
  },
  {
    id: "itemType",
    templates: [
      "手馴染みのいい{type}を一つ見立ててくれ。",
      "星瓶堂の{type}は質が良いと聞いてね。一つ頼むよ。",
      "儀礼に使う{type}の予備が欲しくてね。良い品はあるかい？",
      "この店で一番の{type}を見せてほしいんだが。"
    ]
  },
  {
    id: "colorAndItemType",
    templates: [
      "王宮へ届ける{color}の{type}を探している。用途を間違えないでくれ。",
      "旅の守りに、{color}の{type}が欲しいな。",
      "砂漠の市場で見かけた{color}の{type}が忘れられなくてね。",
      "何か{color}の{type}はないかな？ 特別な一品を探しているんだ。"
    ]
  }
];

export const REQUEST_TEMPLATE_BY_ID = REQUEST_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});
