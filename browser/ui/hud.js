/**
 * HUD / Stats display component for MadeInMaghribal.
 */

function updateHud(controller) {
  const hud = controller.container.querySelector('[data-hud]');
  if (!hud) return;
  
  const s = controller.session.scores;
  const sub = controller.session.subPhase;
  const label = (sub === 'QUIZ') ? '接客' : (sub === 'TURN_RESULT' ? '結果' : sub);
  const debug = controller.isDebugMode() ? ' <span class="debug-badge">DEBUG</span>' : '';

  hud.innerHTML = `<div class="hud-main">${controller.session.turn}日目 | ${label}${debug}</div>`;

  const scoreStrip = controller.container.querySelector('[data-score-strip]');
  if (scoreStrip) {
    scoreStrip.textContent = `売上: ${s.revenue} / 満足: ${s.satisfaction} / 評判: ${s.reputation}`;
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

  container.innerHTML = `
    <div class="ui-modal">
      <h2>設定</h2>
      <div class="option-row">
        <p style="margin-bottom: 10px; font-weight: 800;">テキスト速度</p>
        <div class="option-buttons">
          ${speeds.map(s => `
            <button class="option-button ${speed === s.id ? 'is-active' : ''}" 
                    data-action="set-text-speed" data-speed="${s.id}">${s.label}</button>
          `).join('')}
        </div>
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
