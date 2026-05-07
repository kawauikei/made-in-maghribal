/**
 * Turn result screen for MadeInMaghribal.
 */
const { getCharacterVisualImagePath } = require('../utils/assetPaths.js');
const { applyCharacterVisualProfile, applyCharacterTheme } = require('../utils/characterVisualProfiles.js');
const { getResultComment, getResultExpression } = require('../data/resultComments.js');
const { getTurnResultRenderModel } = require('../core/renderModel.cjs');
const { getItemSpriteStyle } = require('../utils/itemSprite.js');

const SCORE_MAX_PER_TURN = {
  revenue: 100,
  satisfaction: 20,
  reputation: 20
};

const GENRE_LABELS = {
  ARM: '守りの品',
  FOD: '食べ物',
  MED: '薬と癒しの品',
  ADN: '装飾品',
  CLT: '衣装',
  DAY: '日用品',
  WRK: '仕事道具',
  TRV: '旅の品',
  RIT: '儀礼品',
  TRD: '交易品'
};



const DEBUG_RESULT_ITEM_IDS = [
  'IT_ARM_AS_01', 'IT_FOD_SA_02', 'IT_MED_EL_03', 'IT_ADN_LI_04', 'IT_CLT_ME_05',
  'IT_DAY_AS_06', 'IT_WRK_SA_07', 'IT_TRV_EL_08', 'IT_RIT_LI_09', 'IT_TRD_ME_10',
  'IT_ARM_SA_11', 'IT_FOD_EL_12', 'IT_MED_LI_13', 'IT_ADN_ME_14', 'IT_CLT_AS_15',
  'IT_DAY_SA_16', 'IT_WRK_EL_17', 'IT_TRV_LI_18', 'IT_RIT_ME_19', 'IT_TRD_AS_20'
];

function getNadirResultLine(rank) {
  if (rank === '大成功') return 'よし！';
  if (rank === '成功') return '手応えあり';
  return '頑張ろう';
}

function buildDebugResultItems(controller) {
  return DEBUG_RESULT_ITEM_IDS.map((itemId, index) => ({
    itemId,
    displayName: controller.getItemDisplayName ? controller.getItemDisplayName(itemId) : itemId,
    iconPath: controller.getItemIconPath ? controller.getItemIconPath(itemId) : `images/items/${itemId}.webp`,
    selected: index % 2 === 0,
    correct: index % 3 === 0,
    isNew: index % 4 === 0,
    questionIndex: Math.floor(index / 2)
  }));
}

function getCumulativeMax(metric, turn) {
  const rawMax = SCORE_MAX_PER_TURN[metric] * Math.max(1, turn);
  if (metric === 'revenue') return Math.min(500, rawMax);
  return Math.min(100, rawMax);
}

function clampPct(value, maxValue) {
  return Math.max(0, Math.min(100, Math.round((value / Math.max(1, maxValue)) * 100)));
}

function getItemGenre(itemId = '') {
  const match = String(itemId).match(/^IT_([A-Z]{3})_/);
  return match ? match[1] : '';
}

function getDominantGenre(turnItems = []) {
  const counts = {};
  turnItems.forEach((item) => {
    const genre = getItemGenre(item.itemId);
    if (!genre) return;
    counts[genre] = (counts[genre] || 0) + 1;
  });

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  return { code: top[0], label: GENRE_LABELS[top[0]] || top[0], count: top[1] };
}

function flattenTurnItemLog(turnItemLog = []) {
  return turnItemLog.flatMap((entry) => (
    (entry.choices || []).map((choice) => ({
      ...choice,
      questionIndex: entry.questionIndex
    }))
  ));
}

function renderResultItemList(items) {
  const visibleItems = items.slice(0, 20);
  if (!visibleItems.length) {
    return `
      <section class="result-item-log" data-reveal-step="items" aria-label="今回登場した品物">
        <div class="result-item-log-title">今回の品物</div>
        <div class="result-item-log-empty">接客で登場した品物をここに記録します。</div>
      </section>
    `;
  }

  const selectedCount = visibleItems.filter((item) => item.selected).length;
  const rows = visibleItems.map((item) => `
    <div class="result-item-chip${item.selected ? ' is-selected' : ' is-unselected'}${item.isNew ? ' is-new' : ''}" title="${item.displayName}${item.selected ? ' / 選択' : ' / 候補'}">
      ${item.isNew ? '<span class="result-item-new">NEW</span>' : ''}
      <div class="item-sprite result-item-icon" style="${Object.entries(getItemSpriteStyle(item.itemId)).map(([k, v]) => `${k}:${v}`).join(';')}"></div>
    </div>
  `).join('');

  return `
    <section class="result-item-log" data-reveal-step="items" aria-label="今回登場した品物">
      <div class="result-item-log-title">今回の品物</div>
      <div class="result-item-log-note">光る枠＝選んだ品 / ${selectedCount}個</div>
      <div class="result-item-log-grid">
        ${rows}
      </div>
    </section>
  `;
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
        <div class="result-score-bar-track result-score-bar-track-turn">
          <div class="result-score-bar-fill result-score-bar-fill-turn" style="width:${turnPct}%"></div>
        </div>
        <div class="result-score-bar-track result-score-bar-track-total">
          <div class="result-score-bar-fill result-score-bar-fill-total" style="width:${cumulativePct}%"></div>
        </div>
      </div>
      <div class="result-score-bar-value">
        <span class="result-score-now">今回 +${turnValue}</span>
        <span class="result-score-total">累計 ${cumulativeValue}</span>
      </div>
    </div>
  `;
}

function setupResultReveal(controller, view, speechText) {
  const stage = view.querySelector('[data-result-reveal-root]');
  if (!stage) return;

  const speechTextEl = stage.querySelector('[data-result-speech-text]');
  const heroineEl = stage.querySelector('[data-result-heroine]');
  const auraEl = stage.querySelector('[data-result-expression-aura]');
  const nadirEl = stage.querySelector('[data-result-nadir-icon]');
  const revealSteps = ['report', 'rank', 'graph', 'speech', 'items'];
  const timers = [];
  let typingTimer = null;
  let expressionTimer = null;
  let expressionApplied = false;
  let done = false;

  const playStepSfx = () => {
    // Result reveal used to play workshopDayEnd on every step, but it was too busy.
    // Keep the hook as a no-op so reveal timing remains unchanged.
  };

  const applyResultExpression = (withAura = true) => {
    if (expressionApplied) return;
    expressionApplied = true;

    if (heroineEl?.dataset.resultExpressionSrc) {
      if (withAura) {
        auraEl?.classList.remove('is-active');
        // Restart aura animation reliably for the actual expression change only.
        void auraEl?.offsetWidth;
        auraEl?.classList.add('is-active');
        heroineEl.classList.add('is-expression-changing');

        if (expressionTimer) clearTimeout(expressionTimer);
        expressionTimer = setTimeout(() => {
          if (!heroineEl.isConnected) return;
          heroineEl.src = heroineEl.dataset.resultExpressionSrc;
          heroineEl.classList.remove('is-expression-changing');
          heroineEl.classList.add('is-expression-shifted');
        }, 90);
      } else {
        heroineEl.src = heroineEl.dataset.resultExpressionSrc;
        heroineEl.classList.remove('is-expression-changing');
        heroineEl.classList.add('is-expression-shifted');
      }
    }

    if (nadirEl?.dataset.resultExpressionSrc) {
      nadirEl.src = nadirEl.dataset.resultExpressionSrc;
      nadirEl.classList.add('is-expression-shifted');
    }
  };

  const reveal = (step, play = true) => {
    stage.querySelectorAll(`[data-reveal-step="${step}"]`).forEach((el) => {
      el.classList.add('is-visible');
    });
    if (step === 'rank') {
      applyResultExpression(true);
    }
    if (play) playStepSfx();
  };

  const finishSpeech = () => {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
    if (speechTextEl) speechTextEl.textContent = speechText;
  };

  const typeSpeech = () => {
    reveal('speech');
    if (!speechTextEl) return;
    speechTextEl.textContent = '';
    let index = 0;
    typingTimer = setInterval(() => {
      index += 1;
      speechTextEl.textContent = speechText.slice(0, index);
      if (index >= speechText.length) {
        clearInterval(typingTimer);
        typingTimer = null;
      }
    }, 28);
  };

  const finishAll = () => {
    if (done) return;
    done = true;
    timers.forEach((timer) => clearTimeout(timer));
    if (expressionTimer) {
      clearTimeout(expressionTimer);
      expressionTimer = null;
    }
    applyResultExpression(false);
    finishSpeech();
    revealSteps.forEach((step) => reveal(step, false));
  };

  const schedule = (fn, delay) => {
    const timer = setTimeout(() => {
      if (!stage.isConnected || done) return;
      fn();
    }, delay);
    timers.push(timer);
  };

  schedule(() => reveal('report'), 120);
  schedule(() => reveal('rank'), 520);
  schedule(() => reveal('graph'), 920);
  schedule(typeSpeech, 1320);
  schedule(() => reveal('items'), 2400);

  stage.addEventListener('click', (event) => {
    if (event.target.closest('.result-next-button')) return;
    event.preventDefault();
    event.stopPropagation();
    finishAll();
  });
}

function renderTurnResult(controller, view) {
  const s = controller.session.scores;
  const start = controller.quizState.turnStartScore;
  const resultModel = getTurnResultRenderModel({
    turn: controller.session.turn,
    scores: s,
    startScores: start
  });
  const dR = resultModel.stats.delta.revenue;
  const dS = resultModel.stats.delta.satisfaction;
  const dRep = resultModel.stats.delta.reputation;
  const rank = controller.getTurnRank(dR, dS, dRep);
  const heroineId = controller.session.selectedHeroineId || 'HAKIMA';
  const currentTurn = resultModel.turn;
  const reportLabel = `第${currentTurn}期営業報告`;
  const rawTurnItems = flattenTurnItemLog(controller.quizState.turnItemLog);
  const turnItems = rawTurnItems.length ? rawTurnItems : buildDebugResultItems(controller);
  const dominantGenre = getDominantGenre(turnItems);
  const speechText = getResultComment(heroineId, rank, dominantGenre);
  const resultExpression = getResultExpression(rank);
  const normalStandingSrc = getCharacterVisualImagePath(heroineId, 'normal', 'standing');
  const resultStandingSrc = getCharacterVisualImagePath(heroineId, resultExpression, 'standing');
  const nadirNormalSrc = getCharacterVisualImagePath('NADIR', 'normal', 'face');
  const nadirResultSrc = getCharacterVisualImagePath('NADIR', resultExpression, 'face');
  const nadirLine = getNadirResultLine(rank);
  controller.preloadResultExpressions?.(heroineId, resultExpression);
  
  view.innerHTML = `
    <div class="result-screen" data-screen="turn-result">
      <div class="result-stage" data-result-theme-root data-result-reveal-root>
        <div class="result-heroine-wrap">
          <img class="result-heroine-standing" data-result-heroine src="${normalStandingSrc}" data-result-expression-src="${resultStandingSrc}" alt="" />
          <div class="result-heroine-expression-aura" data-result-expression-aura aria-hidden="true"></div>
        </div>

        <div class="result-report-stamp" data-reveal-step="report" aria-label="${reportLabel}">${reportLabel}</div>
        <div class="result-nadir-aside" data-reveal-step="rank" aria-label="ナーディルの一言">
          <div class="result-nadir-face">
            <img data-result-nadir-icon src="${nadirNormalSrc}" data-result-expression-src="${nadirResultSrc}" alt="" />
          </div>
          <div class="result-nadir-bubble">${nadirLine}</div>
        </div>
        <div class="result-rank-burst result-rank-${rank}" data-reveal-step="rank" aria-label="評価 ${rank}">評価：${rank}</div>

        <section class="result-card result-rich-card" data-reveal-step="graph" aria-label="営業成果グラフ">
          <div class="result-score-legend">
            <span class="legend-dot legend-turn"></span>今回 / 1ターン満点
            <span class="legend-dot legend-total"></span>累計 / 満点
          </div>

          <div class="result-score-graph">
            ${renderScoreBar('売上', 'revenue', dR, s.revenue, currentTurn)}
            ${renderScoreBar('満足度', 'satisfaction', dS, s.satisfaction, currentTurn)}
            ${renderScoreBar('評判', 'reputation', dRep, s.reputation, currentTurn)}
          </div>
        </section>

        <div class="result-speech result-speech-lower" data-reveal-step="speech">
          <span data-result-speech-text></span>
        </div>

        ${renderResultItemList(turnItems)}

        <button class="btn-primary btn-next result-next-button">次へ</button>
      </div>
    </div>
  `;

  const root = view.querySelector('[data-result-theme-root]');
  const heroineEl = view.querySelector('[data-result-heroine]');
  applyCharacterTheme(root, heroineId);
  applyCharacterVisualProfile(heroineEl, heroineId, 'result');
  setupResultReveal(controller, view, speechText);
}


module.exports = {
  renderTurnResult
};
