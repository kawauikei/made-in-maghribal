/**
 * Result and Ending screens for MadeInMaghribal.
 */
const { calculateAffection } = require('../core/affectionModel.cjs');
const { evaluateEnding } = require('../core/endingBranch.cjs');
const { getCharacterVisualImagePath } = require('../utils/assetPaths.js');
const { applyCharacterVisualProfile, applyCharacterTheme } = require('../utils/characterVisualProfiles.js');
const { getResultComment, getResultExpression } = require('../data/resultComments.js');

const SCORE_MAX_PER_TURN = {
  revenue: 100,
  satisfaction: 20,
  reputation: 20
};

function getCumulativeMax(metric, turn) {
  const rawMax = SCORE_MAX_PER_TURN[metric] * Math.max(1, turn);
  if (metric === 'revenue') return Math.min(500, rawMax);
  return Math.min(100, rawMax);
}
function clampPct(value, maxValue) {
  return Math.max(0, Math.min(100, Math.round((value / Math.max(1, maxValue)) * 100)));
}

function renderScoreBar(label, metric, turnValue, cumulativeValue, currentTurn) {
  const turnMax = SCORE_MAX_PER_TURN[metric];
  const cumulativeMax = getCumulativeMax(metric, currentTurn);
  const turnPct = clampPct(turnValue, turnMax);
  const cumulativePct = clampPct(cumulativeValue, cumulativeMax);

  return `
    <div class="result-score-bar-row">
      <div class="result-score-bar-label">${label}</div>
      <div class="result-score-bar-stack" aria-label="${label} score graph">
        <div class="result-score-bar-track result-score-bar-track-total">
          <div class="result-score-bar-fill result-score-bar-fill-total" style="width:${cumulativePct}%"></div>
        </div>
        <div class="result-score-bar-track result-score-bar-track-turn">
          <div class="result-score-bar-fill result-score-bar-fill-turn" style="width:${turnPct}%"></div>
        </div>
      </div>
      <div class="result-score-bar-value">
        <span class="result-score-now">今回 +${turnValue}</span>
        <span class="result-score-total">累計 ${cumulativeValue}</span>
      </div>
    </div>
  `;
}


function renderTurnResult(controller, view) {
  const s = controller.session.scores;
  const start = controller.quizState.turnStartScore;
  const dR = s.revenue - start.revenue;
  const dS = s.satisfaction - start.satisfaction;
  const dRep = s.reputation - start.reputation;
  const rank = controller.getTurnRank(dR, dS, dRep);
  const heroineId = controller.session.selectedHeroineId || 'HAKIMA';
  const currentTurn = controller.session.turn;
  const reportLabel = `第${currentTurn}期営業報告`;
  
  view.innerHTML = `
    <div class="result-screen" data-screen="turn-result">
      <div class="result-stage" data-result-theme-root>
        <div class="result-heroine-wrap">
          <img class="result-heroine-standing" data-result-heroine src="${getCharacterVisualImagePath(heroineId, getResultExpression(rank), 'standing')}" alt="" />
        </div>

        <div class="result-report-stamp" aria-label="${reportLabel}">${reportLabel}</div>

        <section class="result-card result-rich-card">
          <div class="result-kicker">第${currentTurn}ターン 営業結果</div>
          <div class="result-rank result-rank-${rank}">評価: ${rank}</div>

          <div class="result-score-legend">
            <span class="legend-dot legend-total"></span>累計 / 満点
            <span class="legend-dot legend-turn"></span>今回 / 1ターン満点
          </div>

          <div class="result-score-graph">
            ${renderScoreBar('売上', 'revenue', dR, s.revenue, currentTurn)}
            ${renderScoreBar('満足度', 'satisfaction', dS, s.satisfaction, currentTurn)}
            ${renderScoreBar('評判', 'reputation', dRep, s.reputation, currentTurn)}
          </div>
        </section>

        <div class="result-speech result-speech-lower">${getResultComment(heroineId, rank)}</div>

        <button class="btn-primary btn-next result-next-button">次へ</button>
      </div>
    </div>
  `;

  const root = view.querySelector('[data-result-theme-root]');
  const heroineEl = view.querySelector('[data-result-heroine]');
  applyCharacterTheme(root, heroineId);
  applyCharacterVisualProfile(heroineEl, heroineId, 'result');
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
        <div class="ending-score-heading">5ターンの営業総決算</div>
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
