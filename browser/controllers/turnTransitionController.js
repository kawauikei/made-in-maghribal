/**
 * Turn transition overlay controller.
 *
 * Owns transition timers and overlay lifecycle. It intentionally receives the
 * GameController instance so this extraction stays behavior-preserving.
 */

function createTurnTransitionController(controller) {
  const state = {
    timerId: null,
    tickTimerIds: [],
    callback: null,
    finishing: false,
    fadeOutMs: null
  };

  function play(callback, mode = 'next') {
    if (controller.uiState.turnTransitionActive) return;

    controller.uiState.turnTransitionActive = true;
    state.callback = callback;
    state.tickTimerIds = [];
    state.finishing = false;

    const viewport = document.getElementById('game-viewport') || controller.container;
    const oldOverlay = viewport.querySelector('.turn-transition-overlay');
    if (oldOverlay) oldOverlay.remove();

    const nextTurn = Math.min(controller.totalTurns, controller.session.turn + 1);
    const isEnding = mode === 'ending';
    const title = isEnding ? '終幕へ' : `第${nextTurn}ターンへ`;
    const subtitle = isEnding ? '星が静かに幕を下ろす' : '夜が巡り、朝の光が店先を照らす';

    const overlay = document.createElement('div');
    overlay.className = `turn-transition-overlay ${isEnding ? 'is-ending' : 'is-next-turn'}`;
    overlay.setAttribute('data-action', 'skip-turn-transition');
    overlay.innerHTML = `
      <div class="turn-transition-darkness" aria-hidden="true"></div>
      <div class="turn-transition-clock-wrap" aria-hidden="true">
        <img class="turn-transition-clock" src="images/ui/turn_clock.png" alt="" draggable="false">
        <div class="turn-transition-clock-glow"></div>
        <div class="turn-transition-clock-shadow"></div>
      </div>
      <div class="turn-transition-copy">
        <p class="turn-transition-label">${title}</p>
        <p class="turn-transition-subtitle">${subtitle}</p>
        <p class="turn-transition-skip">クリックでスキップ</p>
      </div>
    `;
    viewport.appendChild(overlay);

    const fadeInMs = 1000;
    const introHoldMs = 500;
    const stepMs = 1000;
    const restMs = 200;
    const stepCount = 5;
    const postHoldMs = 500;
    const fadeOutMs = 1000;
    const rotateStartMs = fadeInMs + introHoldMs;
    const rotationRunMs = (stepMs * stepCount) + (restMs * (stepCount - 1));
    const exitStartMs = rotateStartMs + rotationRunMs + postHoldMs;

    Array.from({ length: stepCount }, (_, index) => rotateStartMs + (index * (stepMs + restMs))).forEach((delay) => {
      const timerId = window.setTimeout(() => {
        if (controller.uiState.turnTransitionActive && !state.finishing) controller.playSfx('turnClockTick');
      }, delay);
      state.tickTimerIds.push(timerId);
    });

    state.timerId = window.setTimeout(() => {
      finish(false);
    }, exitStartMs);

    state.fadeOutMs = fadeOutMs;
  }

  function finish(skip = false) {
    if (!controller.uiState.turnTransitionActive || state.finishing) return;
    state.finishing = true;

    if (state.timerId) {
      window.clearTimeout(state.timerId);
      state.timerId = null;
    }

    if (Array.isArray(state.tickTimerIds)) {
      state.tickTimerIds.forEach((timerId) => window.clearTimeout(timerId));
      state.tickTimerIds = [];
    }

    const overlay = document.querySelector('.turn-transition-overlay');
    const fadeMs = skip ? 500 : (state.fadeOutMs || 1000);

    const complete = () => {
      const callback = state.callback;
      state.callback = null;
      state.finishing = false;
      state.fadeOutMs = null;
      controller.uiState.turnTransitionActive = false;

      if (overlay) overlay.remove();
      if (typeof callback === 'function') callback();
    };

    if (!overlay) {
      complete();
      return;
    }

    overlay.classList.add('is-exiting');
    if (skip) overlay.classList.add('is-skipping');

    state.timerId = window.setTimeout(complete, fadeMs);
  }

  return {
    play,
    finish
  };
}

module.exports = {
  createTurnTransitionController
};
