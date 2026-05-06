/**
 * VN / ADV Screen for MadeInMaghribal.
 */

const { getCharacterVisualImagePath, getBackgroundPath } = require('../utils/assetPaths.js');
const { applyCharacterVisualProfile, getCharacterVisualProfile } = require('../utils/characterVisualProfiles.js');


function getVisualImagePath(id, mode, expression = 'normal') {
  const profile = getCharacterVisualProfile(id, mode);
  return getCharacterVisualImagePath(id, expression, profile.image);
}

function renderVnShell(controller, view) {
  view.innerHTML = `
    <div class="vn-screen" data-screen="vn">
      <div class="vn-bg" data-vn-bg></div>
      <div class="vn-character-layer" data-vn-char-layer>
        <img class="standing-char" data-vn-char src="" style="display: none;" alt="" />
      </div>
      
      <div class="stats" data-hud></div>
      <div class="score-strip" data-score-strip></div>
      
      <div class="message-box">
        <div class="speaker-name" data-vn-speaker-wrap>
          <img class="speaker-icon" data-vn-speaker-icon src="" style="display: none;" alt="" />
          <span data-vn-speaker></span>
        </div>
        <button class="message-skip-btn" data-action="skip-text">スキップ</button>
        <div class="message-text-wrap">
          <div class="message-text" data-vn-text></div>
        </div>
      </div>
    </div>
  `;
}

function updateVnContent(controller, { speakerName, text, charId, speakerId, bgId, expression, speakerExpression }) {
  const bgEl = controller.container.querySelector('[data-vn-bg]');
  const charEl = controller.container.querySelector('[data-vn-char]');
  const speakerWrapEl = controller.container.querySelector('[data-vn-speaker-wrap]');
  const speakerEl = controller.container.querySelector('[data-vn-speaker]');
  const speakerIconEl = controller.container.querySelector('[data-vn-speaker-icon]');
  const textEl = controller.container.querySelector('[data-vn-text]');

  if (bgEl && bgId) {
    const bgPath = getBackgroundPath(bgId);
    bgEl.style.backgroundImage = `url(${bgPath})`;
  }

  if (charEl) {
    if (charId) {
      charEl.src = getVisualImagePath(charId, 'standing', expression || 'normal');
      charEl.style.display = 'block';
      applyCharacterVisualProfile(charEl, charId, 'standing');
      charEl.onerror = () => { charEl.style.display = 'none'; };
    } else {
      charEl.removeAttribute('src');
      charEl.style.display = 'none';
    }
  }

  const iconId = speakerId || charId;
  const hasSpeaker = Boolean(speakerName || iconId);

  if (speakerWrapEl) {
    speakerWrapEl.style.display = hasSpeaker ? 'inline-flex' : 'none';
  }

  if (speakerIconEl) {
    if (iconId) {
      speakerIconEl.src = getVisualImagePath(iconId, 'speakerIcon', speakerExpression || expression || 'normal');
      speakerIconEl.style.display = 'block';
      applyCharacterVisualProfile(speakerIconEl, iconId, 'speakerIcon');
      speakerIconEl.onerror = () => { speakerIconEl.style.display = 'none'; };
    } else {
      speakerIconEl.removeAttribute('src');
      speakerIconEl.style.display = 'none';
    }
  }

  if (speakerEl) speakerEl.textContent = speakerName || '';
  
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
