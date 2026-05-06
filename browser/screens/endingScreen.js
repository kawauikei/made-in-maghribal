/**
 * Result and Ending screens for MadeInMaghribal.
 */
const { calculateAffection } = require('../core/affectionModel.cjs');
const { evaluateEnding } = require('../core/endingBranch.cjs');

function renderTurnResult(controller, view) {
  const s = controller.session.scores;
  const start = controller.quizState.turnStartScore;
  const dR = s.revenue - start.revenue;
  const dS = s.satisfaction - start.satisfaction;
  const dRep = s.reputation - start.reputation;
  const rank = controller.getTurnRank(dR, dS, dRep);
  
  view.innerHTML = `
    <div class="result-screen" data-screen="turn-result">
      <div class="result-card">
        <h2>${controller.session.turn}日目の営業結果</h2>
        <div class="result-rank">評価: ${rank}</div>
        <div class="score-row"><span>売上</span> <span>+${dR} (計: ${s.revenue})</span></div>
        <div class="score-row"><span>満足度</span> <span>+${dS} (計: ${s.satisfaction})</span></div>
        <div class="score-row"><span>評判</span> <span>+${dRep} (計: ${s.reputation})</span></div>
        <button class="btn-primary btn-next">次のフェーズへ</button>
      </div>
    </div>
  `;
}

function formatAverage(value, count) {
  if (!count) return '0';
  const avg = value / count;
  return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}

function renderEnding(controller, view) {
  const scores = controller.session.scores;
  const turnCount = 5;
  const affection = calculateAffection(scores);
  const endingType = evaluateEnding(affection, controller.session.routeMode === 'extra');
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
        <div class="ending-score-heading">5回の営業総決算</div>
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
  renderTurnResult,
  renderEnding
};
