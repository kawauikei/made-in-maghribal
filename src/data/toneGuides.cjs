/**
 * Master data for Tone Guides in MadeInMaghribal project.
 */
const TONE_GUIDES = [
  {
    toneGuideId: "TG_NADIR",
    description: "若き錬金術師。丁寧だが芯が強い。",
    rules: {
      normal: "標準的な丁寧語（です・ます）を使用。",
      extra: "より自信に満ちた口調。"
    }
  },
  {
    toneGuideId: "TG_HAKIMA",
    description: "知的なヒロイン。論理的で冷静。",
    rules: {
      normal: "論理的、やや硬めの言葉遣い。",
      extra: "ナーディルに対して感情を少し見せる。"
    }
  },
  {
    toneGuideId: "TG_MIRA",
    description: "元気なヒロイン。明るく活発。",
    rules: {
      normal: "快活で明るい。親しみやすい口調。",
      extra: "ロマンチックな表現が増える。"
    }
  },
  {
    toneGuideId: "TG_DARIYA",
    description: "神秘的なヒロイン。静かで深みがある。",
    rules: {
      normal: "短文、詩的な表現。ミステリアス。",
      extra: "自分の秘密や想いをより素直に話す。"
    }
  },
  {
    toneGuideId: "TG_CUSTOMER_STANDARD",
    description: "標準的な客。",
    rules: {
      normal: "簡潔で直接的な要望。"
    }
  }
];

module.exports = { TONE_GUIDES };
