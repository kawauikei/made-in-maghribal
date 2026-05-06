/**
 * Rhythm Quiz Core logic for MadeInMaghribal project.
 */
const { calculateJudgement } = require('./rhythmTiming.cjs');

const SPEED_GRACE_MAX_MS = 3000;

function normalizeSpeedGraceMs(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.min(SPEED_GRACE_MAX_MS, Math.round(numeric));
}

/**
 * Processes a single question result and returns performance metrics.
 * @param {object} state - Includes promptShownAt, answeredAt, selectedItemId, correctItemId, nearestBeatMs, speedGraceMs
 * @returns {object}
 */
function processQuestionResult(state) {
  const { promptShownAt, answeredAt, selectedItemId, correctItemId, selectedChoiceKey, correctChoiceKey, nearestBeatMs } = state;
  const speedGraceMs = normalizeSpeedGraceMs(state.speedGraceMs);
  
  // Acceptance: リズムが悪くても正解なら売上は入る（isCorrectを返す）
  const isCorrect = (selectedChoiceKey && correctChoiceKey)
    ? selectedChoiceKey === correctChoiceKey
    : selectedItemId === correctItemId;
  
  // Acceptance: 判定は PERFECT, GOOD, MISS, NONE を返せる
  const timing = calculateJudgement(answeredAt, nearestBeatMs);
  
  // Acceptance: 回答速度は4秒未満 +2, 6秒未満 +1, 6秒以上 +0 の満足度ボーナスに変換
  const responseTime = answeredAt - promptShownAt;
  const effectiveResponseTime = Math.max(0, responseTime - speedGraceMs);
  let speedBonus = 0;
  if (effectiveResponseTime < 4000) {
    speedBonus = 2;
  } else if (effectiveResponseTime < 6000) {
    speedBonus = 1;
  }

  return {
    isCorrect,
    rating: timing.rating,
    reputationBonus: timing.bonus, // 評判ボーナス
    satisfactionBonus: speedBonus, // 満足度ボーナス
    diffMs: timing.diffMs,         // ±ms差分（デバッグ用）
    responseTime,
    effectiveResponseTime,
    speedGraceMs
  };
}

module.exports = { processQuestionResult, normalizeSpeedGraceMs, SPEED_GRACE_MAX_MS };
