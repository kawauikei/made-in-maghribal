export const REQUEST_TEMPLATES = [
  {
    id: "color",
    templates: [
      "{color}のものが欲しいな。",
      "{color}のアイテムを探しているんだ。",
      "{color}の品を頼むよ。",
      "何か{color}のものはないかな？"
    ]
  },
  {
    id: "genre",
    templates: [
      "{genre}が必要なんだ。",
      "{genre}の在庫はあるかい？",
      "{genre}を一つ見せてくれ。",
      "良い{genre}を探している。"
    ]
  },
  {
    id: "itemType",
    templates: [
      "{type}を買いに来たよ。",
      "{type}を探しているんだが。",
      "手頃な{type}を頼む。",
      "この店に{type}は置いてるかい？"
    ]
  },
  {
    id: "colorAndItemType",
    templates: [
      "{color}の{type}が欲しいな。",
      "{color}の{type}を探しているんだ。",
      "{color}の{type}を頼むよ。",
      "何か{color}の{type}はないかな？"
    ]
  }
];

export const REQUEST_TEMPLATE_BY_ID = REQUEST_TEMPLATES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});
