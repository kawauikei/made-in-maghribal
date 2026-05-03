export const QUIZ_FULL_SCORE = 200;
export const DEFAULT_BASE_SCORE = QUIZ_FULL_SCORE;
export const QUIZ_SCORE_TO_G = 1;

export function calculateScore({ isCorrect, rhythmGood = false, fast = false } = {}) {
  const isFastOrRhythmGood = rhythmGood || fast;

  if (isCorrect) {
    if (rhythmGood && fast) return 20;
    if (isFastOrRhythmGood) return 15;
    return 10;
  }

  if (isFastOrRhythmGood) {
    return 5;
  }

  return 0;
}

export function getQuizStampInfo(score) {
  if (score >= 20) return { label: '大成功', tone: 'gold' };
  if (score >= 15) return { label: '上出来', tone: 'brass' };
  if (score >= 10) return { label: '正解', tone: 'teal' };
  if (score >= 5) return { label: '惜しい', tone: 'amber' };
  return { label: '不正解', tone: 'rose' };
}

export function getRankInfo(correctCount, totalQuestions = 10) {
  const perfectThreshold = Math.max(1, totalQuestions);
  const greatThreshold = Math.max(1, Math.ceil(totalQuestions * 0.8));
  const goodThreshold = Math.max(1, Math.ceil(totalQuestions * 0.6));
  const okayThreshold = Math.max(1, Math.ceil(totalQuestions * 0.4));

  if (correctCount >= perfectThreshold) {
    return { title: '星瓶堂の若店主', message: '客の求める品を見極める目が、もうしっかり育っています。' };
  } else if (correctCount >= greatThreshold) {
    return { title: '若き錬金店主', message: 'なかなか鋭いです。あと一歩で、さらに星瓶堂らしい判断ができそうです。' };
  } else if (correctCount >= goodThreshold) {
    return { title: 'かけだし店主', message: 'まずまずです。品選びの勘は、少しずつ形になっています。' };
  } else if (correctCount >= okayThreshold) {
    return { title: '星瓶堂の一歩目', message: '手応えはあります。星瓶堂の仕事に、だんだん慣れてきました。' };
  } else {
    return { title: '見習い錬金店主', message: 'ここからです。星瓶堂の仕事は、ひとつずつ覚えていけば大丈夫です。' };
  }
}
