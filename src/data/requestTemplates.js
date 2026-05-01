export const REQUEST_TEMPLATES = [
  {
    id: "color",
    templates: [
      "夜の砂漠を照らす、{color}の導きが要る。",
      "祝祭を彩る、{color}の品を頼むよ。",
      "旅の夜を共にする、{color}の術理を頼む。",
      "工房の棚に映える、{color}のものが要る。"
    ]
  },
  {
    id: "genre",
    templates: [
      "旅支度の{genre}を一つ見立ててくれ。",
      "市場では得られない、上質な{genre}が要る。",
      "大学へ届ける、確かな{genre}を頼む。",
      "砂嵐の中でも保存の利く{genre}が要る。"
    ]
  },
  {
    id: "itemType",
    templates: [
      "手馴染みのいい{type}を一つ見立ててくれ。",
      "星瓶堂の{type}は質が良いと聞いてね。",
      "儀礼に使う{type}の予備が欲しくてね。",
      "この店で一番の{type}を見せてほしい。"
    ]
  },
  {
    id: "colorAndItemType",
    templates: [
      "王宮へ届ける、{color}の{type}が要る。",
      "旅の守りに、{color}の{type}を頼む。",
      "市場で見かけた{color}の{type}が忘れられなくて。",
      "何か{color}の{type}はないかな？"
    ]
  }
];

export const REQUEST_TEMPLATE_BY_ID = REQUEST_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});
