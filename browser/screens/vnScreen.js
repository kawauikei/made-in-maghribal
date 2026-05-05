/**
 * VN / ADV Screen for MadeInMaghribal.
 */

const { getCharacterStandingPath, getBackgroundPath } = require('../utils/assetPaths.js');

function renderVnShell(controller, view) {
  view.innerHTML = `
    <div class="vn-screen" data-screen="vn">
      <div class="vn-bg" data-vn-bg></div>
      <div class="vn-character-layer" data-vn-char-layer>
        <img class="standing-char" data-vn-char src="" style="display: none;" />
      </div>
      
      <div class="stats" data-hud></div>
      <div class="score-strip" data-score-strip></div>
      
      <div class="message-box">
        <div class="speaker-name" data-vn-speaker></div>
        <button class="message-skip-btn" data-action="skip-text">スキップ</button>
        <div class="message-text-wrap">
          <div class="message-text" data-vn-text></div>
        </div>
      </div>
    </div>
  `;
}

function updateVnContent(controller, { speakerName, text, charId, bgId, expression }) {
  const bgEl = controller.container.querySelector('[data-vn-bg]');
  const charEl = controller.container.querySelector('[data-vn-char]');
  const speakerEl = controller.container.querySelector('[data-vn-speaker]');
  const textEl = controller.container.querySelector('[data-vn-text]');

  // Update Background
  if (bgEl && bgId) {
    const bgPath = getBackgroundPath(bgId);
    bgEl.style.backgroundImage = `url(${bgPath})`;
  }

  // Update Character Standing
  if (charEl) {
    if (charId) {
      charEl.src = getCharacterStandingPath(charId, expression || 'normal');
      charEl.style.display = 'block';
      charEl.onerror = () => { charEl.style.display = 'none'; };
    } else {
      charEl.style.display = 'none';
    }
  }

  // Update Speaker
  if (speakerEl) speakerEl.textContent = speakerName || '';
  
  // Update Typewriter Text
  if (textEl && text) {
    if (controller.typewriter.fullText !== text) {
      controller.startTypewriter(text, textEl);
    }
  }
}

module.exports = {
  renderVnShell,
  updateVnContent
};
