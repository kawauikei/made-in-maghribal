/**
 * Affection Event Definitions for Made in Maghribal
 */

export const AFFECTION_EVENTS = {
  hakima: [
    {
      id: "hakima_5",
      heroineId: "hakima",
      threshold: 5,
      title: "もう一度、隣に",
      speaker: "ハキマ",
      expression: "joy",
      text: "ナーディル、今日の接客……少しだけ昔を思い出したよ。あんたが一人前になろうと頑張ってるのは、見てればわかるから。"
    }
  ],
  mira: [
    {
      id: "mira_5",
      heroineId: "mira",
      threshold: 5,
      title: "普通の女の子として",
      speaker: "ミラ",
      expression: "fun",
      text: "先輩との時間は、商会の令嬢でも学生でもない、ただの私でいられる気がします。ふふ、不思議なものですね。"
    }
  ],
  dariya: [
    {
      id: "dariya_5",
      heroineId: "dariya",
      threshold: 5,
      title: "安らぎの工房",
      speaker: "ダリヤ",
      expression: "joy",
      text: "……ふぅ。王宮の喧騒を忘れて、ここで君の話を聞いていると、肩の荷が下りる気分だよ。感謝している、ナーディル。"
    }
  ]
};

/**
 * Returns all events for a given heroine
 * @param {string} heroineId 
 * @returns {Array}
 */
export function getEventsByHeroine(heroineId) {
  return AFFECTION_EVENTS[heroineId] || [];
}
