module.exports = {
  id: "EV_DARIYA_01",
  title: "夜の帳と計算",
  heroineId: "DARIYA",
  summary: "ダリヤが夜遅くまで帳簿をつけている。",
  unlock: { type: "always" },
  gallery: {
    category: "heroine",
    thumbnail: "still_dariya_after_hours_01",
    hiddenTitle: "？？？？",
    hiddenSummary: "ダリヤと仲良くなると解放"
  },
  script: [
    { type: "bg", id: "bg_shop_exterior_night", transition: "fade" },
    { type: "bgm", id: "BGM_THEME_DARIYA", fadeMs: 800 },
    { type: "enter", characterId: "CH_DARIYA", expression: "normal", position: "left" },
    { type: "line", speakerId: "CH_DARIYA", expression: "social", text: "あら、まだ起きていたの？仕事の邪魔はしないで頂戴。" },
    { type: "still", id: "still_dariya_after_hours_01" },
    { type: "line", speakerId: "CH_NADIR", text: "無理は禁物だぞ、お嬢様。" },
    { type: "end", markSeen: true }
  ]
};
