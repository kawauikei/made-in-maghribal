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
    monologue: "（いい天気だな。これだけ光があると、棚の瓶もいつもより少し得意そうに見える）",
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
        arrival: "こんにちは、ナーディル。……今日は日差しが強いね。少しだけ、店先で休んでもいいかな。",
        response: "いらっしゃい、ダリヤさん。奥に冷たい茶を用意しています。無理せず座ってください。"
      }
    }
  },
  {
    id: "greet_hot",
    theme: "hot_day",
    monologue: "（……暑い。今日は冷えた香草水を多めに用意しておこう。俺が先に飲み切らないようにしないとな）",
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
        arrival: "ナーディル……少し暑さに負けたかもしれない。王宮からここまで来るだけで、もうふらふらだよ。",
        response: "大丈夫ですか、ダリヤさん。すぐ冷茶を出します。今日は少し休んでから話しましょう。"
      }
    }
  },
  {
    id: "greet_calm",
    theme: "calm_day",
    monologue: "（今日は風が静かだ。瓶の鳴る音までよく聞こえる。こういう日は、棚を整えるだけで少し楽しい）",
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
        arrival: "こんにちは。今日は風が静かだね。こういう日は、王宮の音まで遠く感じて少し助かるよ。",
        response: "いらっしゃい、ダリヤさん。静かな日は、星瓶堂の瓶の音も柔らかく聞こえます。"
      }
    }
  },
  {
    id: "greet_cloudy",
    theme: "cloudy_day",
    monologue: "（曇りの日は地味だけど、石や瓶の色は見やすい。派手じゃない分、仕事はしやすいかもな）",
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
        arrival: "曇り空だね。強い光がないだけで、少し楽に歩ける気がするよ。",
        response: "今日は無理をしない方がよさそうですね。素材を見る前に、まず座ってください。"
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
