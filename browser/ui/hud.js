/**
 * HUD / Stats display component for MadeInMaghribal.
 */
const { getItemSpriteStyle } = require('../utils/itemSprite.js');

function formatScoreMetric(label, value, key, previousScores) {
  const prev = previousScores ? Number(previousScores[key]) : Number(value);
  const current = Number(value) || 0;
  const delta = current - (Number.isFinite(prev) ? prev : current);
  const badge = delta > 0 ? `<span class="score-delta">+${delta}</span>` : '';
  return `<span class="score-metric" data-score-key="${key}"><span class="score-label">${label}</span><strong>${current}</strong>${badge}</span>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function safeToken(value, fallback = 'unknown') {
  const token = String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
  return token || fallback;
}

function formatLogDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hour}:${minute}`;
}

function updateHud(controller) {
  const hud = controller.container.querySelector('[data-hud]');
  if (!hud) return;
  
  const s = controller.session.scores;
  const sub = controller.session.subPhase;
  const labels = {
    BEFORE_OPEN: '開店前',
    QUIZ: '接客',
    TURN_RESULT: '営業結果',
    AFTER_CLOSE: '閉店後'
  };
  const label = labels[sub] || sub || '';
  const debug = controller.isDebugMode() ? ' <span class="debug-badge">DEBUG</span>' : '';

  hud.innerHTML = `<div class="hud-main">第${controller.session.turn}ターン | ${label}${debug}</div>`;

  const scoreStrip = controller.container.querySelector('[data-score-strip]');
  if (scoreStrip) {
    const previousScores = controller.uiState?.previousScoresForHud || null;
    scoreStrip.innerHTML = [
      formatScoreMetric('売上', s.revenue, 'revenue', previousScores),
      formatScoreMetric('満足', s.satisfaction, 'satisfaction', previousScores),
      formatScoreMetric('評判', s.reputation, 'reputation', previousScores)
    ].join('');
  }

  if (controller.uiState) {
    controller.uiState.previousScoresForHud = {
      revenue: s.revenue,
      satisfaction: s.satisfaction,
      reputation: s.reputation
    };
  }
}

function renderGlobalUi(controller) {
  let globalUi = controller.container.querySelector('.global-ui');
  if (!globalUi) {
    globalUi = document.createElement('div');
    globalUi.className = 'global-ui';
    controller.container.appendChild(globalUi);
  }

  globalUi.innerHTML = `
    <button class="global-ui-btn" data-action="open-log" title="ログ">📜</button>
    <button class="global-ui-btn" data-action="open-options" title="設定">⚙</button>
    <button class="global-ui-btn" data-action="open-help" title="ヘルプ">？</button>
    <button class="global-ui-btn" data-action="toggle-fullscreen" title="全画面">⛶</button>
  `;
}

function renderLogModal(controller, container) {
  const tab = controller.uiState.logTab || 'convo';
  const convoLog = controller.uiState.convoLog || [];
  const progress = controller.getPlayerProgressSummary();
  const quizHistory = progress.quizHistory || [];

  const renderConvoTab = () => {
    if (convoLog.length === 0) return '<p class="log-empty">記録はありません</p>';
    return convoLog.slice().reverse().map(log => `
      <div class="log-item">
        <span class="log-speaker">${escapeHtml(log.speaker)}</span>
        <span class="log-text">${escapeHtml(log.text)}</span>
      </div>
    `).join('');
  };

  const renderQuizTab = () => {
    if (quizHistory.length === 0) return '<p class="log-empty">過去問の記録はありません</p>';
    
    const page = controller.uiState.logQuizPage || 0;
    const pageSize = 100;
    const start = page * pageSize;
    const paged = quizHistory.slice(start, start + pageSize);
    const hasNext = quizHistory.length > start + pageSize;
    const hasPrev = start > 0;
    const resultCounts = quizHistory.reduce((acc, item) => {
      const key = item?.result === 'perfect' || item?.result === 'good' ? item.result : 'miss';
      acc[key] += 1;
      return acc;
    }, { perfect: 0, good: 0, miss: 0 });
    const summary = `
      <div class="log-quiz-summary">
        <div>
          <strong>${quizHistory.length}</strong>
          <span>問の履歴</span>
        </div>
        <div class="log-quiz-summary-counts">
          <span class="result-perfect">秀 ${resultCounts.perfect}</span>
          <span class="result-good">良 ${resultCounts.good}</span>
          <span class="result-miss">不可 ${resultCounts.miss}</span>
        </div>
      </div>
    `;

    const pager = `
      <div class="log-pager">
        <button class="log-pager-btn" ${hasPrev ? '' : 'disabled'} data-action="set-log-quiz-page" data-page="${page - 1}">前</button>
        <span class="log-pager-info">${start + 1} - ${Math.min(start + pageSize, quizHistory.length)} / ${quizHistory.length}</span>
        <button class="log-pager-btn" ${hasNext ? '' : 'disabled'} data-action="set-log-quiz-page" data-page="${page + 1}">次</button>
      </div>
    `;

    const items = paged.map(q => {
      const resultLabel = q.result === 'perfect' ? '秀' : (q.result === 'good' ? '良' : '不可');
      const resultText = q.result === 'perfect' ? '完全成功' : (q.result === 'good' ? '成功' : '失敗');
      const recordedAt = formatLogDate(q.recordedAt);
      const questionLabel = Number.isInteger(q.questionIndex) ? `Q${q.questionIndex + 1}` : '';
      
      const renderChoice = (choice, sideLabel) => {
        if (!choice) return '';
        const name = controller.getItemDisplayName(choice.itemId);
        const quality = choice.quality || 'normal';
        const qualityToken = safeToken(quality, 'normal');
        const isSelected = choice.itemId === q.selectedItemId && quality === q.selectedQuality;
        
        const indicators = [];
        if (choice.isCorrect) indicators.push('<span class="log-indicator-correct" title="正解">正解</span>');
        if (isSelected) indicators.push('<span class="log-indicator-selected" title="あなたの回答">回答</span>');

        const spriteStyle = Object.entries(getItemSpriteStyle(choice.itemId))
          .map(([k, v]) => `${k}:${v}`).join(';');

        const getQualityLabel = (q) => {
          if (q === 'great_success') return '傑作';
          if (q === 'success') return '高品質';
          return '普通';
        };

        return `
          <div class="log-quiz-col">
            <span class="log-quiz-col-label">${sideLabel}</span>
            <div class="log-quiz-item-box ${choice.isCorrect ? 'is-correct-choice' : ''} ${isSelected ? 'is-selected-choice' : ''}">
              <div class="log-quiz-icon-frame">
                <div class="item-sprite" style="${spriteStyle}"></div>
              </div>
              <div class="log-quiz-item-info">
                <span class="log-quiz-item-name">${escapeHtml(name)}</span>
                <small class="log-quiz-quality quality-${qualityToken}">${escapeHtml(getQualityLabel(quality))}</small>
                <div class="log-quiz-indicators">${indicators.join('')}</div>
              </div>
            </div>
          </div>
        `;
      };

      return `
        <div class="log-quiz-item result-${safeToken(q.result, 'miss')}">
          <div class="log-quiz-head">
            <div class="log-quiz-meta">
              <span>第${escapeHtml(q.turn)}ターン</span>
              ${questionLabel ? `<span>${escapeHtml(questionLabel)}</span>` : ''}
              <span>${escapeHtml(q.heroineId)}</span>
              ${recordedAt ? `<time>${escapeHtml(recordedAt)}</time>` : ''}
            </div>
            <div class="log-quiz-result-text">${resultText}</div>
          </div>
          <div class="log-quiz-prompt">${escapeHtml(q.prompt)}</div>
          <div class="log-quiz-comparison">
            ${renderChoice(q.leftChoice, '左の選択肢')}
            ${renderChoice(q.rightChoice, '右の選択肢')}
            <div class="log-quiz-result-badge">${resultLabel}</div>
          </div>
        </div>
      `;
    }).join('');

    return summary + items + (quizHistory.length > pageSize ? pager : '');
  };

  container.innerHTML = `
    <div class="ui-modal log-modal">
      <div class="log-tabs">
        <button class="log-tab-btn ${tab === 'convo' ? 'is-active' : ''}" data-action="set-log-tab" data-tab="convo">会話ログ</button>
        <button class="log-tab-btn ${tab === 'quiz' ? 'is-active' : ''}" data-action="set-log-tab" data-tab="quiz">過去問履歴</button>
      </div>
      <div class="log-body scrollable">
        ${tab === 'convo' ? renderConvoTab() : renderQuizTab()}
      </div>
      <button class="modal-close-btn" data-action="close-modal">閉じる</button>
    </div>
  `;
}

function renderModal(controller) {
  const modalName = controller.uiState.modal;
  let backdrop = controller.container.querySelector('.ui-modal-backdrop');

  if (!modalName) {
    if (backdrop) backdrop.remove();
    return;
  }

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'ui-modal-backdrop';
    controller.container.appendChild(backdrop);
  }

  if (modalName === 'options') {
    renderOptionsModal(controller, backdrop);
  } else if (modalName === 'help') {
    renderHelpModal(controller, backdrop);
  } else if (modalName === 'log') {
    renderLogModal(controller, backdrop);
  }
}

function renderOptionsModal(controller, container) {
  const speed = controller.settings.textSpeed;
  const speeds = [
    { id: 'slow', label: '遅い' },
    { id: 'normal', label: '標準' },
    { id: 'fast', label: '速い' },
    { id: 'instant', label: '瞬時' }
  ];
  const bgmOn = controller.settings.bgmEnabled !== false;
  const sfxOn = controller.settings.sfxEnabled !== false;
  const bgmVol = Math.round(Number(controller.settings.bgmVolume ?? 0.22) * 100);
  const sfxVol = Math.round(Number(controller.settings.sfxVolume ?? 1) * 100);

  const renderAudioRow = (kind, label, enabled, volume) => `
    <div class="audio-option-row">
      <div>
        <strong>${label}</strong>
        <span>${enabled ? 'ON' : 'OFF'} / ${volume}%</span>
      </div>
      <div class="audio-option-controls">
        <button class="option-button ${enabled ? 'is-active' : ''}" data-action="set-audio-enabled" data-audio-kind="${kind}" data-enabled="true">ON</button>
        <button class="option-button ${!enabled ? 'is-active' : ''}" data-action="set-audio-enabled" data-audio-kind="${kind}" data-enabled="false">OFF</button>
        <button class="option-button" data-action="adjust-audio-volume" data-audio-kind="${kind}" data-delta="-0.1">−</button>
        <button class="option-button" data-action="adjust-audio-volume" data-audio-kind="${kind}" data-delta="0.1">＋</button>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="ui-modal options-modal">
      <h2>設定画面</h2>
      <div class="option-row">
        <p style="margin-bottom: 10px; font-weight: 800;">テキスト速度</p>
        <div class="option-buttons">
          ${speeds.map(s => `
            <button class="option-button ${speed === s.id ? 'is-active' : ''}" 
                    data-action="set-text-speed" data-speed="${s.id}">${s.label}</button>
          `).join('')}
        </div>
      </div>
      <div class="option-row">
        <p style="margin-bottom: 10px; font-weight: 800;">音量</p>
        ${renderAudioRow('bgm', 'BGM', bgmOn, bgmVol)}
        ${renderAudioRow('sfx', 'SE', sfxOn, sfxVol)}
      </div>
      <div class="option-row option-danger-row">
        <p style="margin-bottom: 8px; font-weight: 900;">セーブデータ</p>
        <p class="option-help-text">イベント既読・アイテム収集・ヒロイン別満足度/評判・現在の自動保存を削除します。ヒロイン別記録は通常/幼馴染モード別に保存されています。</p>
        <button class="option-button option-danger-button" data-action="clear-all-save-data">セーブデータ削除</button>
      </div>
      <button class="modal-close-btn" data-action="close-modal">閉じる</button>
    </div>
  `;
}

function renderHelpModal(controller, container) {
  container.innerHTML = `
    <div class="ui-modal">
      <h2>ヘルプ</h2>
      <div style="line-height: 1.8; font-size: 0.95rem;">
        <p>・クイズではお客さんの要望に合う品を選びます。</p>
        <p>・リズムよく答えると評判が上がります。</p>
        <p>・早く答えると満足度が上がります。</p>
      </div>
      <button class="modal-close-btn" data-action="close-modal">閉じる</button>
    </div>
  `;
}

module.exports = {
  updateHud,
  renderGlobalUi,
  renderModal
};
