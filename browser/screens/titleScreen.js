/**
 * Title and Opening screens for MadeInMaghribal.
 */

const { renderVnShell } = require('./vnScreen.js');
const { getBackgroundPath } = require('../utils/assetPaths.js');
const { getTitleRenderModel } = require('../core/renderModel.cjs');

function renderTitleShell(controller, view) {
  let shell = view.querySelector('.title-screen-with-art');
  if (!shell) {
    view.innerHTML = `
      <div class="title-screen title-screen-with-art">
        <svg class="title-water-filter-defs" aria-hidden="true" focusable="false">
          <filter id="titleWaterRippleFilter" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.052" numOctaves="2" seed="7" result="waveNoise">
              <animate attributeName="baseFrequency" dur="14s" calcMode="spline" keyTimes="0;0.33;0.66;1" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1" values="0.012 0.052;0.016 0.047;0.010 0.058;0.012 0.052" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="waveNoise" scale="8" xChannelSelector="R" yChannelSelector="G">
              <animate attributeName="scale" dur="10s" calcMode="spline" keyTimes="0;0.35;0.70;1" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1" values="8;12;6;8" repeatCount="indefinite" />
            </feDisplacementMap>
          </filter>
        </svg>
        <div class="title-clock-crop" aria-hidden="true">
          <img class="title-clock-image" src="images/ui/clock.webp" alt="" />
        </div>
        <div class="title-shell-content" style="display: contents;"></div>
      </div>
    `;
    shell = view.querySelector('.title-screen-with-art');
  }
  return shell.querySelector('.title-shell-content');
}

function renderTitle(controller, view) {
  const contentEl = renderTitleShell(controller, view);
  const shell = view.querySelector('.title-screen-with-art');
  if (shell) shell.classList.remove('title-panel-screen');

  const saveSummary = controller.getSaveSummary ? controller.getSaveSummary() : null;
  const titleModel = getTitleRenderModel({ saveSummary });
  const continueAttrs = titleModel.canContinue
    ? 'data-action="title-continue"'
    : 'disabled aria-disabled="true"';

  contentEl.innerHTML = `
    <h1 class="title-logo-anchor" aria-label="${titleModel.title}">
      <span class="title-logo-water">
        <img class="title-logo-image" src="images/ui/logo.webp" alt="${titleModel.title}" />
      </span>
    </h1>
    <div class="title-content-panel">
      <div class="title-primary-actions">
        <button class="title-start-btn" type="button" data-action="title-start">はじめから</button>
        <button class="title-start-btn title-continue-btn" type="button" ${continueAttrs}>つづきから</button>
      </div>
      <div class="title-menu-grid" aria-label="Title menu">
        <button class="title-menu-btn" type="button" data-title-panel="event">イベント集</button>
        <button class="title-menu-btn" type="button" data-title-panel="image">画像集</button>
        <button class="title-menu-btn" type="button" data-title-panel="sound">音楽集</button>
        <button class="title-menu-btn" type="button" data-title-panel="item">アイテム図鑑</button>
        <button class="title-menu-btn" type="button" data-action="open-options">設定画面</button>
        <button class="title-menu-btn" type="button" data-title-panel="freeplay">フリープレイ</button>
      </div>
      <p class="title-stub-message" data-title-stub-message></p>
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
  renderTitleShell,
  renderTitle,
  renderOpening
};
