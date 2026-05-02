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
        arrival: "こんにちは。店先の瓶、今日はずいぶん綺麗に光っているわね",
        response: "いらっしゃい、ハキマ。ちょうど光に透かして、色の出方を見ていたところだよ"
      },
      mira: {
        arrival: "こんにちは、先輩。今日は光が強くて、素材の色がはっきりと見えますね",
        response: "ああ、ミラ。鑑定には絶好の条件だよ。今日はいい品が選べそうだ"
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
        arrival: "あら、少し顔が赤いわね。砂の熱に負けていたら、目利きも鈍るわよ",
        response: "面目ない。水を足して、香草の冷茶でも用意しておきます"
      },
      mira: {
        arrival: "先輩、顔色が……。無理は禁物ですよ。水分補給を忘れないでくださいね",
        response: "ありがとう、ミラ。君も気をつけて。奥に冷やした水があるから、後で飲んでくれ"
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
        arrival: "いらっしゃい。今日は珍しく静かね。星瓶堂の棚まで、少し落ち着いて見えるわ",
        response: "ええ。こういう日は、香りも音もいつもよりよく分かる気がします"
      },
      mira: {
        arrival: "おはようございます、先輩。今日は街が静かで、集中して勉強できそうです",
        response: "ああ。こういう静かな日は、素材の微かな変化も見逃さずに済むよ"
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
        arrival: "熱心に素材を眺めているわね。曇り空でも、何か見えるものがあるの？",
        response: "ええ。強い光がない日ほど、石や瓶の地色が素直に見えるんです"
      },
      mira: {
        arrival: "先輩、曇りの日は色のコントラストが抑えられて、内部の構造が観察しやすいですね",
        response: "その通り。ミラはよく勉強しているね。今日は深い鑑定ができそうだ"
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
