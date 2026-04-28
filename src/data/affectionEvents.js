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
      text: "ナーディル、今日の接客……少しだけ昔を思い出したよ。あんたが一人前になろうと頑張ってるのは、見てればわかるから。",
      stillImageId: "hakimaMorningVisit01"
    },
    {
      id: "hakima_10",
      heroineId: "hakima",
      threshold: 10,
      title: "狐の耳は嘘をつかない",
      speaker: "ハキマ",
      expression: "fun",
      text: "……あ、あんまり耳をジロジロ見ないでよ。ほら、仕事に戻った戻った！（ピコピコと耳が嬉しそうに動いている）"
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
      text: "先輩との時間は、商会の令嬢でも学生でもない、ただの私でいられる気がします。ふふ、不思議なものですね。",
      stillImageId: "miraAfterSchool01"
    },
    {
      id: "mira_10",
      heroineId: "mira",
      threshold: 10,
      title: "商人の目利き",
      speaker: "ミラ",
      expression: "joy",
      text: "先輩、今の品選びは実に見事でした。商人の娘として、尊敬してしまいます。……私も、もっと頑張らなくては。"
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
      text: "……ふぅ。王宮の喧騒を忘れて、ここで君の話を聞いていると、肩の荷が下りる気分だよ。感謝している、ナーディル。",
      stillImageId: "dariyaAfterHours01"
    },
    {
      id: "dariya_10",
      heroineId: "dariya",
      threshold: 10,
      title: "共鳴する真理",
      speaker: "ダリヤ",
      expression: "fun",
      text: "君の調合理論は、時に王立研究所の教授たちよりも核心を突いているね。……面白い。君という人間をもっと知りたくなったよ。"
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
