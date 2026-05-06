/**
 * Quiz / Rhythm screen for MadeInMaghribal.
 */

const { getCharacterIconPath } = require('../utils/assetPaths.js');

function renderQuiz(controller, view) {
  view.innerHTML = `
    <div class="quiz-screen" data-screen="quiz">
      <div class="stats" data-hud></div>
      
      <section class="quiz-order-card">
        <div class="quiz-order-label">お客さんの要望</div>
        <div class="quiz-order-text" data-quiz-prompt></div>
        <div class="quiz-progress" data-quiz-progress></div>
        <div class="score-strip" data-score-strip></div>
      </section>

      <section class="rhythm-lane-placeholder" aria-label="リズム判定エリア">
        <div class="rhythm-party-face rhythm-party-face-left">
          <img src="${getCharacterIconPath('NADIR')}" alt="ナーディル" onerror="this.style.display='none'" />
        </div>
        <div class="rhythm-guide-line"></div>
        <div class="rhythm-guide-note"></div>
        <div class="rhythm-party-face rhythm-party-face-right">
          <img data-quiz-heroine-face src="${getCharacterIconPath(controller.session.selectedHeroineId || 'HAKIMA')}" alt="" onerror="this.style.display='none'" />
        </div>
        <div class="rhythm-guide-caption">リズム判定</div>
      </section>

      <section class="choice-list">
        <div class="choice-card" data-choice-slot="0">
          <div class="item-icon-wrap">
            <img class="item-icon" alt="" loading="eager" />
          </div>
          <div class="choice-name"></div>
          <div class="choice-label">おすすめ</div>
        </div>
        <div class="choice-card" data-choice-slot="1">
          <div class="item-icon-wrap">
            <img class="item-icon" alt="" loading="eager" />
          </div>
          <div class="choice-name"></div>
          <div class="choice-label">おすすめ</div>
        </div>
      </section>
    </div>
  `;
  updateQuizContent(controller);
}

function updateQuizContent(controller) {
  const q = controller.quizState.currentQuestion;
  const promptEl = controller.container.querySelector('[data-quiz-prompt]');
  const progressEl = controller.container.querySelector('[data-quiz-progress]');
  
  if (promptEl) promptEl.textContent = q.promptText;
  if (progressEl) progressEl.textContent = `${controller.quizState.questionIndex + 1} / ${controller.quizState.totalQuestions}`;

  const heroineFaceEl = controller.container.querySelector('[data-quiz-heroine-face]');
  if (heroineFaceEl && controller.session.selectedHeroineId) {
    heroineFaceEl.src = getCharacterIconPath(controller.session.selectedHeroineId);
  }

  const choices = controller.quizState.currentChoices;
  choices.forEach((c, idx) => {
    const card = controller.container.querySelector(`[data-choice-slot="${idx}"]`);
    if (card) {
      card.setAttribute('data-item-id', c.id);
      const nameEl = card.querySelector('.choice-name');
      const iconEl = card.querySelector('.item-icon');
      const wrapEl = card.querySelector('.item-icon-wrap');

      if (nameEl) nameEl.textContent = c.name;
      if (iconEl) {
        iconEl.style.display = '';
        iconEl.src = controller.getItemIconPath(c.id);
        iconEl.onerror = () => {
          iconEl.style.display = 'none';
          if (wrapEl) wrapEl.classList.add('missing-icon');
        };
      }
      if (wrapEl) wrapEl.classList.remove('missing-icon');
    }
  });

  // Ensure HUD (and thus the score strip) is updated with current session scores
  controller.updateHud();
}

module.exports = {
  renderQuiz,
  updateQuizContent
};
