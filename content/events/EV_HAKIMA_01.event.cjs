module.exports = {
  id: "EV_HAKIMA_01",
  title: "朝の訪問者",
  heroineId: "HAKIMA",
  summary: "開店前、ハキマが店に顔を出す。",
  unlock: { type: "always" },
  gallery: {
    category: "heroine",
    thumbnail: "still_hakima_morning_visit_01",
    hiddenTitle: "？？？？",
    hiddenSummary: "ハキマと仲良くなると解放"
  },
  script: [
    { type: "bg", id: "bg_shop_interior_service", transition: "fade" },
    { type: "bgm", id: "BGM_THEME_HAKIMA", fadeMs: 800 },
    { type: "enter", characterId: "CH_HAKIMA", expression: "normal", position: "right" },
    { type: "line", speakerId: "CH_HAKIMA", expression: "joy", text: "おはよう。今日もぼんやりしてないでしょうね。" },
    { type: "still", id: "still_hakima_morning_visit_01" },
    { type: "line", speakerId: "CH_NADIR", text: "朝から手厳しいな。助かるけど。" },
    { type: "end", markSeen: true }
  ]
};
