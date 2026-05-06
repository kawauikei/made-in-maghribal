/**
 * Result stamp (receipt style) component for MadeInMaghribal.
 */

function getSpeedMark(result) {
  if ((result.satisfactionBonus || 0) >= 2) return '◎';
  if ((result.satisfactionBonus || 0) >= 1) return '○';
  return '△';
}

function getTempoMark(result) {
  if (result.rating === 'PERFECT') return '◎';
  if (result.rating === 'GOOD') return '○';
  return '△';
}

function getCorrectLabel(result) {
  return result.isCorrect ? '正解' : '不正解';
}

function showResultStamp(controller, result) {
  const root = controller.container.querySelector('.quiz-order-card') || document.getElementById('game-viewport') || controller.container;
  if (!root) return;

  const el = document.createElement('div');
  el.className = `result-stamp ${result.isCorrect ? 'is-correct' : 'is-wrong'}`;
  el.innerHTML = `
    <div class="stamp-main">${getCorrectLabel(result)}</div>
    <div class="stamp-row"><span>スピード</span><strong>${getSpeedMark(result)}</strong></div>
    <div class="stamp-row"><span>テンポ</span><strong>${getTempoMark(result)}</strong></div>
  `;

  root.appendChild(el);
  setTimeout(() => {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }, 520);
}

module.exports = {
  showResultStamp,
  getSpeedMark,
  getTempoMark,
  getCorrectLabel
};
