/**
 * DailyTalk Definitions for Made in Maghribal
 * 
 * Short conversations or monologues to increase scenario density
 * during Intro, Result, or Day End phases.
 */

export const DAILY_TALKS = [
  // --- Common Topics ---
  {
    id: "common_father_camera_biz",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "父さんの錬金カメラ事業は順調みたいだ。世界中から珍しい景色が届くよ。" },
      { speaker: "ナーディル", expression: "joy", text: "でも僕は、この場所で誰かの日常を支える星瓶堂の仕事が好きだ。" }
    ]
  },
  {
    id: "common_shop_dust",
    scope: "common",
    heroineId: null,
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ナーディル", expression: "normal", text: "開店前に棚を少し掃除した。古い天秤に積もった埃を払うと、昔の記憶も一緒に蘇るようだ。" }
    ]
  },

  // --- Heroine Specific ---
  {
    id: "hakima_morning_check",
    scope: "heroine",
    heroineId: "hakima",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ハキマ", expression: "normal", text: "今日の仕入れはどう？ 変なものを掴まされてないでしょうね。あんたは人が良すぎるから。" },
      { speaker: "ナーディル", expression: "normal", text: "ありがとう、ハキマ。君がそうやって釘を刺してくれるから、僕も気を引き締められるよ。" }
    ]
  },
  {
    id: "mira_university_news",
    scope: "heroine",
    heroineId: "mira",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ミラ", expression: "normal", text: "先輩、聞いてください。大学で新しい抽出法が発見されたんです。まだ実験段階ですが……。" },
      { speaker: "ナーディル", expression: "joy", text: "それは興味深いね。いつか星瓶堂の品作りにも活かせるかもしれない。" }
    ]
  },
  {
    id: "dariya_palace_tea",
    scope: "heroine",
    heroineId: "dariya",
    timing: "intro",
    routeMode: "both",
    minAffection: 0,
    priority: 1,
    pages: [
      { speaker: "ダリヤ", expression: "normal", text: "王宮の茶葉はどれも最高級だが……この店の、少しスパイスが混ざったような香りの方が落ち着く。" },
      { speaker: "ナーディル", expression: "normal", text: "そう言ってもらえると嬉しいです。ダリヤさんには、ここでは鎧を下ろしてほしいですから。" }
    ]
  }
];

/**
 * Returns all daily talks.
 * @returns {Array}
 */
export function getAllDailyTalks() {
  return DAILY_TALKS;
}
