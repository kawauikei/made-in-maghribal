/**
 * Heroine-specific RESULT screen comments.
 * Each heroine has 4 tiers: perfect, good, ok, bad.
 */

export const RESULT_COMMENTS = {
  hakima: {
    perfect: [
      "大成功ね。星瓶堂の目利き、なかなかやるじゃない。",
      "ふん、悪くないわ。手つきも安定してきたじゃない。"
    ],
    good: [
      "悪くないわね。客の話も、ちゃんと聞けていたわ。",
      "まずまずよ。品を選ぶ感覚が、少しづつ戻ってきたわね。"
    ],
    ok: [
      "もう少しね。焦らず相手の話を聞くところからよ。",
      "惜しいわ。客の意図をつかめば、もっと楽になるわ。"
    ],
    bad: [
      "品を見る前に、客の顔を見なさい。",
      "今回はダメだったわ。でも、次で取り戻せばいい。"
    ]
  },
  mira: {
    perfect: [
      "見事です、先輩。判断の再現性も高くなっています。",
      "素晴らしいです。素材と依頼の対応が完璧でした。"
    ],
    good: [
      "良い結果です。素材と依頼の対応が整理できていますね。",
      "順調です、先輩。判断の根拠が少しずつ見えてきました。"
    ],
    ok: [
      "あと少しです。判断材料を一つずつ確認しましょう。",
      "大丈夫です、先輩。条件を分解すれば道は見えます。"
    ],
    bad: [
      "焦らなくて大丈夫です。まず依頼条件を分解しましょう。",
      "まだ早いだけです。素材の特徴から整理していきましょう。"
    ]
  },
  dariya: {
    perfect: [
      "見事だ。今日の君の判断には、迷いが少なかった。",
      "悪くない。精度も速度も、申し分ない。"
    ],
    good: [
      "悪くない。客の意図を拾う手つきが安定している。",
      "まずまずだ。判断の根拠が少しずつ固まってきたな。"
    ],
    ok: [
      "もう一歩だな。判断の根拠を静かに積み上げるといい。",
      "焦るな。条件を一つずつ確かめれば、道は開ける。"
    ],
    bad: [
      "焦りが見えたな。まずは条件を一つずつ確かめよう。",
      "今回は厳しかったな。だが、検証は次に活かせる。"
    ]
  }
};

const TIER_KEYS = ['perfect', 'good', 'ok', 'bad'];

/**
 * Returns a result comment for the given heroine and performance.
 * @param {string} heroineId - 'hakima' | 'mira' | 'dariya'
 * @param {number} correctCount - correct answers (0-5)
 * @param {number} totalQuestions - total questions (usually 5)
 * @returns {string}
 */
export function getResultComment(heroineId, correctCount, totalQuestions = 5) {
  const comments = RESULT_COMMENTS[heroineId];
  if (!comments) return '';

  const ratio = correctCount / totalQuestions;
  let tier;
  if (ratio >= 1.0) tier = 'perfect';
  else if (ratio >= 0.6) tier = 'good';
  else if (ratio >= 0.4) tier = 'ok';
  else tier = 'bad';

  const pool = comments[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns the tier key for the given performance.
 */
export function getResultTier(correctCount, totalQuestions = 5) {
  const ratio = correctCount / totalQuestions;
  if (ratio >= 1.0) return 'perfect';
  if (ratio >= 0.6) return 'good';
  if (ratio >= 0.4) return 'ok';
  return 'bad';
}

/**
 * Validates the comment data structure.
 */
export function validateResultComments() {
  const errors = [];
  const forbiddenWords = ['店番', '働く', '雇う', '再建', '一緒に営業'];

  for (const [heroineId, tiers] of Object.entries(RESULT_COMMENTS)) {
    for (const tier of TIER_KEYS) {
      const pool = tiers[tier];
      if (!pool || pool.length === 0) {
        errors.push(`${heroineId}.${tier}: empty or missing`);
        continue;
      }
      for (let i = 0; i < pool.length; i++) {
        const comment = pool[i];
        if (!comment || comment.trim() === '') {
          errors.push(`${heroineId}.${tier}[${i}]: empty string`);
        }
        if (comment.length > 80) {
          errors.push(`${heroineId}.${tier}[${i}]: too long (${comment.length} chars)`);
        }
        for (const word of forbiddenWords) {
          if (comment.includes(word)) {
            errors.push(`${heroineId}.${tier}[${i}]: contains forbidden word "${word}"`);
          }
        }
      }
    }
  }
  return errors;
}
