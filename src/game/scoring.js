export const DEFAULT_BASE_SCORE = 100;

/**
 * Calculate the score for a single question.
 * @param {Object} params
 * @param {boolean} params.isCorrect - Whether the answer was correct.
 * @param {number} [params.baseScore=DEFAULT_BASE_SCORE] - Base score for correct answer.
 * @returns {number} The calculated score.
 */
export function calculateScore({ isCorrect, baseScore = DEFAULT_BASE_SCORE, rhythmBonus = 0 } = {}) {
  if (isCorrect) {
    return baseScore + Math.max(0, rhythmBonus);
  }
  return 0;
}

/**
 * Get rank information based on the number of correct answers.
 * @param {number} correctCount - Number of correct answers.
 * @returns {Object} Rank info containing title and message.
 */
export function getRankInfo(correctCount) {
  if (correctCount >= 5) {
    return { title: "星瓶堂の若店主", message: "客の求める品を見極める目が、もうしっかり育っています。星瓶堂の接客は、これからもっと磨けます。" };
  } else if (correctCount >= 4) {
    return { title: "若き錬金店主", message: "なかなか鋭いです。あと一歩で、さらに星瓶堂らしい判断ができそうです。" };
  } else if (correctCount >= 3) {
    return { title: "かけだし店主", message: "まずまずです。品選びの勘は、少しずつ形になっています。" };
  } else if (correctCount >= 2) {
    return { title: "星瓶堂の一歩目", message: "手応えはあります。星瓶堂の仕事に、だんだん慣れてきました。" };
  } else {
    return { title: "見習い錬金店主", message: "ここからです。星瓶堂の仕事は、ひとつずつ覚えていけば大丈夫です。" };
  }
}
