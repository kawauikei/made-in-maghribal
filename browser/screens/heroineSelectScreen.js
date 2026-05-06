/**
 * Heroine Selection screen for MadeInMaghribal.
 */

const { getCharacterIconPath, getCharacterVisualImagePath } = require('../utils/assetPaths.js');
const { applyCharacterVisualProfile, applyCharacterTheme, getCharacterVisualProfile } = require('../utils/characterVisualProfiles.js');

const HEROINES = [
  {
    id: 'HAKIMA',
    name: 'ハキマ',
    title: '香りと術理に明るい錬金術師',
    desc: '厳しそうに見えて、毎朝店先に顔を出してくれる相談相手。'
  },
  {
    id: 'MIRA',
    name: 'ミラ',
    title: '街の流れに明るい案内役',
    desc: '人の流れと噂に強く、店の空気を明るくしてくれる協力者。'
  },
  {
    id: 'DARIYA',
    name: 'ダリヤ',
    title: '星と品物の物語を読む女性',
    desc: '静かな眼差しで、品物に宿る気配や物語を見抜いてくれる。'
  }
];

const ROUTE_LABELS = {
  normal: '通常モード',
  long_history: '幼馴染モード'
};


const ROUTE_ICON_EXPRESSIONS = {
  normal: 'joy',
  long_history: 'maid'
};

function getVisualImagePath(id, mode, expression = 'normal') {
  const profile = getCharacterVisualProfile(id, mode);
  return getCharacterVisualImagePath(id, expression, profile.image);
}

function isRouteUnlocked(progress, heroineId, routeMode) {
  if (routeMode === 'normal') return true;
  return Boolean(progress?.heroineModeUnlocks?.[heroineId]?.[routeMode]);
}

function getRouteStatusText(progress, heroineId, routeMode) {
  if (routeMode === 'normal') return '最初から選択可能';
  const unlocked = isRouteUnlocked(progress, heroineId, routeMode);
  const ending = progress?.endings?.[heroineId]?.normal || {};
  if (unlocked) return 'GOOD到達で解放済み';
  if (ending.normalCleared) return '通常GOODで解放';
  return '通常ルートクリア後に解放';
}

function renderRouteButtons(progress, heroineId, selectedRoute = 'normal') {
  return ['normal', 'long_history'].map((routeMode) => {
    const unlocked = isRouteUnlocked(progress, heroineId, routeMode);
    const isSelected = selectedRoute === routeMode && unlocked;
    const iconExpression = ROUTE_ICON_EXPRESSIONS[routeMode] || 'normal';
    return `
      <button
        class="route-mode-btn${isSelected ? ' is-selected' : ''}${unlocked ? '' : ' is-locked'}"
        type="button"
        data-route-mode="${routeMode}"
        ${unlocked ? '' : 'disabled'}
      >
        ${unlocked ? `<img class="route-mode-icon" src="${getCharacterIconPath(heroineId, iconExpression)}" alt="" onerror="this.style.display='none'" />` : ''}
        <span class="route-mode-copy">
          <strong>${ROUTE_LABELS[routeMode]}</strong>
          <span>${getRouteStatusText(progress, heroineId, routeMode)}</span>
        </span>
      </button>
    `;
  }).join('');
}

function renderHeroineSelect(controller, view) {
  const initial = HEROINES[0];
  const progress = controller.getPlayerProgressSummary ? controller.getPlayerProgressSummary() : null;

  view.innerHTML = `
    <div class="heroine-select title-screen heroine-select-rich">
      <h2 class="glow heroine-select-title">運命の相手は？</h2>

      <div class="heroine-preview-card" aria-live="polite">
        <div class="heroine-preview-standing">
          <img data-heroine-preview-img src="${getVisualImagePath(initial.id, 'heroineSelect')}" alt="${initial.name}" onerror="this.style.display='none'" />
        </div>
        <div class="heroine-preview-copy">
          <h3 data-heroine-preview-name>${initial.name}</h3>
          <p class="heroine-preview-title" data-heroine-preview-title>${initial.title}</p>
          <p data-heroine-preview-desc>${initial.desc}</p>
        </div>
      </div>

      <div class="heroine-icon-row" aria-label="営業パートナー候補">
        ${HEROINES.map((h) => `
          <button class="heroine-icon-btn${h.id === initial.id ? ' is-selected' : ''}" data-preview-heroine="${h.id}" type="button" aria-label="${h.name}を表示">
            <img src="${getCharacterIconPath(h.id, 'normal')}" alt="" onerror="this.style.display='none'" />
            <span>${h.name}</span>
          </button>
        `).join('')}
      </div>

      <div class="route-mode-row" data-route-mode-row aria-label="ルート選択">
        ${renderRouteButtons(progress, initial.id)}
      </div>

      <button class="heroine-card heroine-confirm-btn" data-id="${initial.id}" data-route-mode-selected="normal" type="button">このヒロインで始める</button>
    </div>
  `;

  const root = view.querySelector('.heroine-select-rich');
  if (root) applyCharacterTheme(root, initial.id);

  const previewImg = view.querySelector('[data-heroine-preview-img]');
  if (previewImg) applyCharacterVisualProfile(previewImg, initial.id, 'heroineSelect');
  view.querySelectorAll('.heroine-icon-btn').forEach((button) => {
    const id = button.getAttribute('data-preview-heroine');
    applyCharacterTheme(button, id);
    const img = button.querySelector('img');
    if (img) applyCharacterVisualProfile(img, id, 'selectIcon');
  });

  const previewName = view.querySelector('[data-heroine-preview-name]');
  const previewTitle = view.querySelector('[data-heroine-preview-title]');
  const previewDesc = view.querySelector('[data-heroine-preview-desc]');
  const confirmBtn = view.querySelector('.heroine-confirm-btn');
  const routeModeRow = view.querySelector('[data-route-mode-row]');
  const iconButtons = Array.from(view.querySelectorAll('[data-preview-heroine]'));

  function bindRouteButtons(heroineId) {
    if (!routeModeRow || !confirmBtn) return;
    routeModeRow.innerHTML = renderRouteButtons(progress, heroineId, 'normal');
    confirmBtn.setAttribute('data-route-mode-selected', 'normal');
    Array.from(routeModeRow.querySelectorAll('[data-route-mode]')).forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (button.disabled) return;
        if (controller.playSfx) controller.playSfx('uiTapBottle');
        routeModeRow.querySelectorAll('[data-route-mode]').forEach((b) => b.classList.toggle('is-selected', b === button));
        confirmBtn.setAttribute('data-route-mode-selected', button.getAttribute('data-route-mode') || 'normal');
      });
    });
  }

  iconButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (controller.playSfx) controller.playSfx('uiTapBottle');

      const heroine = HEROINES.find((h) => h.id === button.getAttribute('data-preview-heroine')) || initial;
      iconButtons.forEach((b) => b.classList.toggle('is-selected', b === button));

      if (root) applyCharacterTheme(root, heroine.id);
      if (previewImg) {
        previewImg.style.display = '';
        previewImg.src = getVisualImagePath(heroine.id, 'heroineSelect');
        previewImg.alt = heroine.name;
        applyCharacterVisualProfile(previewImg, heroine.id, 'heroineSelect');
      }
      if (previewName) previewName.textContent = heroine.name;
      if (previewTitle) previewTitle.textContent = heroine.title;
      if (previewDesc) previewDesc.textContent = heroine.desc;
      if (confirmBtn) confirmBtn.setAttribute('data-id', heroine.id);
      bindRouteButtons(heroine.id);
    });
  });

  bindRouteButtons(initial.id);
}

module.exports = {
  renderHeroineSelect
};
