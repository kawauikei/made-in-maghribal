export const DEFAULT_BASE_SCORE = 100;

/**
 * Calculate the score for a single question.
 * @param {Object} params
 * @param {boolean} params.isCorrect - Whether the answer was correct.
 * @param {number} [params.baseScore=DEFAULT_BASE_SCORE] - Base score for correct answer.
 * @returns {number} The calculated score.
 */
export function calculateScore({ isCorrect, baseScore = DEFAULT_BASE_SCORE } = {}) {
  if (isCorrect) {
    return baseScore;
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
    return { title: "マグリバル一の目利き", message: "完璧な接客です。お客さんは満面の笑みで工房を後にしました。" };
  } else if (correctCount >= 4) {
    return { title: "腕利き店主", message: "かなり良い接客です。あと一歩で評判が大きく伸びそうです。" };
  } else if (correctCount >= 3) {
    return { title: "駆け出し店主", message: "まずまずの接客です。商品の特徴を少しずつ掴めてきました。" };
  } else if (correctCount >= 2) {
    return { title: "新米鑑定士", message: "まだ迷いがあるようです。お客さんの希望をよく見てみましょう。" };
  } else {
    return { title: "迷える見習い", message: "今日は少し噛み合いませんでした。品物の色・種類・雰囲気を覚えていきましょう。" };
  }
}
