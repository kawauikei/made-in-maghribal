/**
 * HUD / Stats display component for MadeInMaghribal.
 */

function formatScoreMetric(label, value, key, previousScores) {
  const prev = previousScores ? Number(previousScores[key]) : Number(value);
  const current = Number(value) || 0;
  const delta = current - (Number.isFinite(prev) ? prev : current);
  const badge = delta > 0 ? `<span class="score-delta">+${delta}</span>` : '';
  return `<span class="score-metric" data-score-key="${key}"><span class="score-label">${label}</span><strong>${current}</strong>${badge}</span>`;
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
    <button class="global-ui-btn" data-action="open-options" title="設定">⚙</button>
    <button class="global-ui-btn" data-action="open-help" title="ヘルプ">？</button>
    <button class="global-ui-btn" data-action="toggle-fullscreen" title="全画面">⛶</button>
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
