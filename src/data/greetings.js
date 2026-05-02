/**
 * Greeting Variations for Made in Maghribal
 * 
 * Structure:
 * - monologue: Nader's inner thoughts (Theme A)
 * - heroineReactions: Heroine-specific arrival and initial response
 */

export const GREETING_VARIATIONS = [
  {
    id: "greet_sunny",
    theme: "sunny_day",
    monologue: "（今日もいい天気だ。この日差しなら、ガラス瓶の輝きも一段と増すだろうな……）",
    heroineReactions: {
      hakima: {
        arrival: "来たわよ、ナーディル。店先の瓶、今日はずいぶん光ってるじゃない。……磨き方だけは合格ね。",
        response: "いらっしゃい、ハキマ。ちょうど朝の光に透かして、色の出方を見てたんだ。"
      },
      mira: {
        arrival: "こんにちは、先輩。今日は光が強くて、瓶の色がとても綺麗に見えますね。",
        response: "いらっしゃい、ミラ。君にそう言われると、棚の瓶まで少し得意そうに見えるな。"
      },
      dariya: {
        arrival: "邪魔するよ、ナーディル。……ふむ、今日の店先は一段と眩しいな",
        response: "いらっしゃい、ダリヤさん。光が強い日は、石の地色がよく見えるんです"
      }
    }
  },
  {
    id: "greet_hot",
    theme: "hot_day",
    monologue: "（……暑い。砂漠の朝は早いというが、今日は一段と厳しいな。冷えた水が恋しい……）",
    heroineReactions: {
      hakima: {
        arrival: "少し顔が赤いわよ。砂の熱に負けてたら、香りの違いも見落とすんだから。",
        response: "面目ない。香草の冷茶を用意しておくよ。君も市場帰りなら、少し涼んでいって。"
      },
      mira: {
        arrival: "先輩、顔色が少し赤いです。砂の熱は油断できませんよ。水分を取ってくださいね。",
        response: "ありがとう、ミラ。君も無理しないで。奥に冷やした香草水があるから、少し休んでいって。"
      },
      dariya: {
        arrival: "ナーディル、少し熱に中られたか？ 王宮の冷房装置を貸してやりたいくらいだ",
        response: "はは……お気遣いありがとうございます。冷茶を飲んで、シャキッとしますよ"
      }
    }
  },
  {
    id: "greet_calm",
    theme: "calm_day",
    monologue: "（今日は風が穏やかだな。街の喧騒もどこか遠くに感じる。……さて、営業の準備だ）",
    heroineReactions: {
      hakima: {
        arrival: "今日は風が静かね。こういう日は、乾いた香材の癖がよく出るわ。棚、見せてもらうわよ。",
        response: "もちろん。静かな日ほど、瓶の鳴りも香りの立ち方もよく分かるからね。"
      },
      mira: {
        arrival: "こんにちは、先輩。今日は街が静かで、素材の小さな変化まで見つけられそうです。",
        response: "そうだね。こういう日は、瓶の曇りや香りの立ち方までよく分かる。君の観察にも向いてそうだ。"
      },
      dariya: {
        arrival: "邪魔するよ。今日は風がないな。王宮の騒がしさが嘘のようだ",
        response: "いらっしゃい。静かな朝は、鑑定の目も研ぎ澄まされる気がします"
      }
    }
  },
  {
    id: "greet_cloudy",
    theme: "cloudy_day",
    monologue: "（曇りか……。だが、こういう日の方が影が消えて、宝石の地色がよく見えるんだよな）",
    heroineReactions: {
      hakima: {
        arrival: "曇りの日に素材を眺めてるなんて、珍しいわね。何か見えるものでもあるの？",
        response: "強い光がない分、石や瓶の地色が素直に見えるんだ。君の香材鑑定にも近いかもな。"
      },
      mira: {
        arrival: "先輩、曇りの日は色が落ち着いて、素材の地肌が見やすいですね。少し好きです。",
        response: "分かるよ。晴れた日ほど派手じゃないけど、こういう光の方が見えるものもあるんだ。"
      },
      dariya: {
        arrival: "ふむ、曇り空か。ナーディル、君ならこの光をどう活かす？",
        response: "地色を見るのに最適です。今日は普段見落としがちな微細な傷も見抜けますよ"
      }
    }
  }
];

export function getGreetingById(id) {
  return GREETING_VARIATIONS.find(g => g.id === id) || GREETING_VARIATIONS[0];
}

export function getRandomGreeting(excludeIds = []) {
  const eligible = GREETING_VARIATIONS.filter(g => !excludeIds.includes(g.id));
  const pool = eligible.length > 0 ? eligible : GREETING_VARIATIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
