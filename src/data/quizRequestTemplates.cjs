/**
 * Quiz Request Templates for MadeInMaghribal project.
 */
const QUIZ_REQUEST_TEMPLATES = [
  {
    templateId: "QT_STD_GENRE_ARM",
    customerType: "STANDARD",
    conditions: [{ type: 'genre', value: 'ARM' }],
    text: "身を守れるものが欲しいんだが..."
  },
  {
    templateId: "QT_HAK_PRINCIPLE_LI",
    customerType: "HAKIMA",
    conditions: [{ type: 'principle', value: 'LI' }],
    text: "研究のために光の術理（LI）を持つアイテムが必要なの。"
  },
  {
    templateId: "QT_EXTRA_GENRE_FOD_PRIN_SA",
    customerType: "STANDARD",
    conditions: [{ type: 'genre', value: 'FOD' }, { type: 'principle', value: 'SA' }],
    text: "砂の術理（SA）が込められた食べ物（FOD）はあるかい？"
  }
];

module.exports = { QUIZ_REQUEST_TEMPLATES };
