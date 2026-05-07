/**
 * Lightweight screen transition state.
 *
 * Rendering is still synchronous; this controller only annotates the freshly
 * rendered screen so CSS can provide a consistent entrance feel.
 */

function createScreenTransitionController() {
  let lastKey = '';

  function getScreenKey(session) {
    if (!session) return 'unknown';
    if (session.phase === 'MAIN_GAME') return `${session.phase}:${session.subPhase || ''}`;
    return session.phase || 'unknown';
  }

  function getTransitionKind(previousKey, nextKey) {
    if (!previousKey) return 'boot';
    if (previousKey === nextKey) return '';
    if (nextKey === 'OPENING') return 'lantern';
    if (nextKey === 'HEROINE_SELECT') return 'sand';
    if (nextKey === 'MAIN_GAME:BEFORE_OPEN') return 'curtain';
    if (nextKey === 'MAIN_GAME:QUIZ') return 'counter';
    if (nextKey === 'MAIN_GAME:TURN_RESULT') return 'ledger';
    if (nextKey === 'ENDING') return 'lantern';
    return 'soft';
  }

  function beforeRender(session) {
    const nextKey = getScreenKey(session);
    const previousKey = lastKey;
    const changed = previousKey !== nextKey;
    if (changed) lastKey = nextKey;
    return {
      changed,
      from: previousKey,
      key: nextKey,
      kind: getTransitionKind(previousKey, nextKey)
    };
  }

  function apply(container, transition) {
    if (!container || !transition?.changed || !transition.kind) return;
    const screen = container.querySelector('[data-screen]');
    if (!screen) return;

    screen.setAttribute('data-transition-kind', transition.kind);
    screen.setAttribute('data-transition-from', transition.from || 'none');
    screen.classList.remove('screen-enter');
    void screen.offsetWidth;
    screen.classList.add('screen-enter');
  }

  return {
    beforeRender,
    apply
  };
}

module.exports = {
  createScreenTransitionController
};
