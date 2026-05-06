/**
 * Ending screen for MadeInMaghribal.
 */
const { calculateAffection } = require('../core/affectionModel.cjs');
const { evaluateEnding } = require('../core/endingBranch.cjs');
const { TOTAL_TURNS } = require('../core/gameSessionFlow.cjs');

function formatAverage(value, count) {
  if (!count) return '0';
  const avg = value / count;
  return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}

function renderEnding(controller, view) {
  const scores = controller.session.scores;
  const turnCount = TOTAL_TURNS;
  const affection = calculateAffection(scores);
  const endingType = evaluateEnding(affection, controller.session.routeMode === 'long_history');
  const typeLabel = endingType === 'GOOD' ? 'GOOD ENDING' : 'NORMAL ENDING';
  const partnerName = controller.getHeroineDisplayName(controller.session.selectedHeroineId);

  view.innerHTML = `
    <div class="ending-screen">
      <div class="ending-card">
        <h1 class="ending-kicker">終幕</h1>
        <h2 class="glow ending-title">${typeLabel}</h2>
        <div class="ending-summary">
          <p>パートナー: ${partnerName}</p>
          <p>好感度: ${Math.round(affection)}%</p>
        </div>
        <div class="ending-score-heading">${turnCount}ターンの営業総決算</div>
        <div class="score-row"><span>売上通算</span> <span>${scores.revenue}</span></div>
        <div class="score-row"><span>満足度通算</span> <span>${scores.satisfaction}</span></div>
        <div class="score-row"><span>評判通算</span> <span>${scores.reputation}</span></div>
        <div class="ending-score-heading ending-score-heading-sub">1営業あたり</div>
        <div class="score-row score-row-muted"><span>平均売上</span> <span>${formatAverage(scores.revenue, turnCount)}</span></div>
        <div class="score-row score-row-muted"><span>平均満足度</span> <span>${formatAverage(scores.satisfaction, turnCount)}</span></div>
        <div class="score-row score-row-muted"><span>平均評判</span> <span>${formatAverage(scores.reputation, turnCount)}</span></div>
        <button class="btn-primary btn-next">タイトルへ戻る</button>
      </div>
    </div>
  `;
}

module.exports = {
  renderEnding
};
