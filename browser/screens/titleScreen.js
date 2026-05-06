/**
 * Title and Opening screens for MadeInMaghribal.
 */

const { renderVnShell } = require('./vnScreen.js');
const { getBackgroundPath } = require('../utils/assetPaths.js');

function renderTitle(controller, view) {
  const debugButton = controller.isDebugMode()
    ? '<button class="title-menu-btn" type="button" data-title-stub="デバッグ">デバッグ</button>'
    : '';
  const canContinue = controller.hasSaveData ? controller.hasSaveData() : false;
  const continueAttrs = canContinue
    ? 'data-action="title-continue"'
    : 'disabled aria-disabled="true"';

  view.innerHTML = `
    <div class="title-screen title-screen-with-art">
      <div class="title-content-panel">
        <h1 class="glow">Made in Maghribal</h1>
        <div class="title-primary-actions">
          <button class="title-start-btn" type="button" data-action="title-start">はじめから</button>
          <button class="title-start-btn title-continue-btn" type="button" ${continueAttrs}>つづきから</button>
        </div>
        <div class="title-menu-grid" aria-label="Title menu">
          <button class="title-menu-btn" type="button" data-title-panel="load">ロード</button>
          <button class="title-menu-btn" type="button" data-title-panel="event">イベント</button>
          <button class="title-menu-btn" type="button" data-title-panel="image">画像</button>
          <button class="title-menu-btn" type="button" data-title-panel="sound">音楽</button>
          <button class="title-menu-btn" type="button" data-title-panel="item">図鑑</button>
          <button class="title-menu-btn" type="button" data-action="open-options">設定</button>
          ${debugButton}
        </div>
        <p class="title-stub-message" data-title-stub-message></p>
      </div>
    </div>
  `;
}

function renderOpening(controller, view) {
  const text = `マグリバル砂漠の黄金の砂は、多くの物語を秘めています。

あなたはこのオアシスの街に到着しました。地域で最も有名な茶屋を営む準備はできていますか？`;

  renderVnShell(controller, view);
  const screen = view.querySelector('.vn-screen');
  if (screen) {
    screen.classList.add('opening-screen');
    screen.insertAdjacentHTML('afterbegin', '<h2 class="vn-scene-title">プロローグ</h2>');
  }

  const bgEl = view.querySelector('[data-vn-bg]');
  const speakerWrapEl = view.querySelector('[data-vn-speaker-wrap]');
  const textEl = view.querySelector('[data-vn-text]');

  if (bgEl) {
    bgEl.style.backgroundImage = `url(${getBackgroundPath('OASIS')})`;
  }
  if (speakerWrapEl) {
    speakerWrapEl.style.display = 'none';
  }
  if (textEl) {
    controller.startTypewriter(text, textEl);
  }
}

module.exports = {
  renderTitle,
  renderOpening
};
