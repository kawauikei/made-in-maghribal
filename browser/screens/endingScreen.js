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
        <div style="font-size: 1.8rem; font-weight: 900; color: var(--sand-2); margin-bottom: 25px; letter-spacing: 2px;">
          評価: ${rank}
        </div>
        <div class="score-row"><span>売上</span> <span>+${dR} (計: ${s.revenue})</span></div>
        <div class="score-row"><span>満足度</span> <span>+${dS} (計: ${s.satisfaction})</span></div>
        <div class="score-row"><span>評判</span> <span>+${dRep} (計: ${s.reputation})</span></div>
        <button class="btn-primary btn-next">次のフェーズへ</button>
      </div>
    </div>
  `;
}

function renderEnding(controller, view) {
  const history = { maxSatisfaction: 100, maxReputation: 100 }; // Dummy history
  const affection = calculateAffection(controller.session.scores, history);
  const endingType = evaluateEnding(affection, controller.session.routeMode === 'extra');
  const typeLabel = endingType === 'GOOD' ? 'GOOD ENDING' : 'NORMAL ENDING';

  view.innerHTML = `
    <div class="ending-screen">
      <div class="ending-card">
        <h1 style="color: var(--sand-2); margin-bottom: 10px; font-size: 1.2rem;">終幕</h1>
        <h2 class="glow" style="font-size: 2.2rem; color: var(--star-1); margin-bottom: 20px;">${typeLabel}</h2>
        <div style="margin: 25px 0; font-size: 1.1rem;">
          <p>パートナー: ${controller.getHeroineDisplayName(controller.session.selectedHeroineId)}</p>
          <p>好感度: ${Math.round(affection)}%</p>
        </div>
        <div class="score-row"><span>最終売上</span> <span>${controller.session.scores.revenue}</span></div>
        <div class="score-row"><span>最終満足度</span> <span>${controller.session.scores.satisfaction}</span></div>
        <div class="score-row"><span>最終評判</span> <span>${controller.session.scores.reputation}</span></div>
        <button class="btn-primary btn-next">タイトルへ戻る</button>
      </div>
    </div>
  `;
}

module.exports = {
  renderTurnResult,
  renderEnding
};
