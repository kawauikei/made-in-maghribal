/**
 * Title and Opening screens for MadeInMaghribal.
 */

const { getBackgroundPath } = require('../utils/assetPaths.js');

function renderTitle(controller, view) {
  view.innerHTML = `
    <div class="title-screen title-screen-with-art">
      <h1 class="glow">Made in Maghribal</h1>
      <p class="blink">クリックして開始</p>
    </div>
  `;
}

function renderOpening(controller, view) {
  const text = `マグリバル砂漠の黄金の砂は、多くの物語を秘めています。\n\nあなたはこのオアシスの街に到着しました。地域で最も有名な茶屋を営む準備はできていますか？`;
  const bgPath = getBackgroundPath('OASIS');

  view.innerHTML = `
    <div class="opening-screen title-screen" style="background-image: url(${bgPath}); background-size: cover; background-position: center;">
      <div class="text-controls">
        <button class="text-control-btn" data-action="skip-text">スキップ</button>
        <button class="text-control-btn" data-action="cycle-text-speed">速度: <span data-text-speed-label>${controller.getTextSpeedLabel()}</span></button>
      </div>

      <div class="result-card" style="padding: 40px; max-width: 85%; position: relative;">
        <h2 class="glow" style="color: var(--sand-2); margin-bottom: 20px;">プロローグ</h2>
        <button class="message-skip-btn" data-action="skip-text">スキップ</button>
        <div style="text-align: left; line-height: 1.8; min-height: 120px; white-space: pre-wrap;" data-vn-text></div>
        <p class="blink" style="margin-top: 30px; color: var(--sand-2);">クリックして進む</p>
      </div>
    </div>
  `;

  const textEl = view.querySelector('[data-vn-text]');
  if (textEl) {
    controller.startTypewriter(text, textEl);
  }
}

module.exports = {
  renderTitle,
  renderOpening
};
