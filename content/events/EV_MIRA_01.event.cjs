module.exports = {
  id: "EV_MIRA_01",
  title: "放課後の研究",
  heroineId: "MIRA",
  summary: "ミラが熱心に古文書を読み耽っている。",
  unlock: { type: "always" },
  gallery: {
    category: "heroine",
    thumbnail: "still_mira_after_school_01",
    hiddenTitle: "？？？？",
    hiddenSummary: "ミラと仲良くなると解放"
  },
  script: [
    { type: "bg", id: "bg_palace_lab", transition: "fade" },
    { type: "bgm", id: "BGM_THEME_MIRA", fadeMs: 800 },
    { type: "enter", characterId: "CH_MIRA", expression: "normal", position: "center" },
    { type: "line", speakerId: "CH_MIRA", expression: "fun", text: "見てください！この記述、新発見かもしれません！" },
    { type: "still", id: "still_mira_after_school_01" },
    { type: "line", speakerId: "CH_NADIR", text: "根を詰めすぎるなよ、ミラ。" },
    { type: "end", markSeen: true }
  ]
};
