module.exports = {
  id: "EV_OP_01",
  title: "砂丘の向こう側",
  heroineId: "COMMON",
  summary: "物語の始まり。マグレブの空は今日も青い。",
  unlock: { type: "always" },
  gallery: {
    category: "event",
    thumbnail: "bg_market_central",
    hiddenTitle: "？？？？",
    hiddenSummary: "物語を開始すると解放"
  },
  script: [
    { type: "bg", id: "bg_market_central", transition: "fade" },
    { type: "bgm", id: "main01_title", fadeMs: 1000 },
    { type: "narration", text: "かつて、この砂丘の向こうには無限の緑があったという。" },
    { type: "narration", text: "今では語り草に過ぎないが、それでも人々は空を見上げる。" },
    { type: "end", markSeen: true }
  ]
};
