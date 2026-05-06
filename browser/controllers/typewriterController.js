/**
 * Typewriter text controller.
 *
 * Keeps text reveal timers out of the main GameController while preserving the
 * same public operations: start, finish, clear, and isActive.
 */

function createTypewriterController(options = {}) {
  const getDelayMs = typeof options.getDelayMs === 'function' ? options.getDelayMs : () => 32;
  const isInstant = typeof options.isInstant === 'function' ? options.isInstant : () => false;

  const state = {
    fullText: '',
    visibleText: '',
    index: 0,
    timerId: null,
    isTyping: false,
    targetEl: null
  };

  function clear() {
    if (state.timerId) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }
    state.isTyping = false;
  }

  function finish() {
    clear();
    state.index = state.fullText.length;
    state.isTyping = false;
    if (state.targetEl) {
      state.targetEl.textContent = state.fullText;
    }
  }

  function tick() {
    const delay = getDelayMs();
    state.timerId = setTimeout(() => {
      state.index++;
      state.visibleText = state.fullText.substring(0, state.index);
      if (state.targetEl) {
        state.targetEl.textContent = state.visibleText;
      }

      if (state.index < state.fullText.length) {
        tick();
      } else {
        state.isTyping = false;
      }
    }, delay);
  }

  function start(text, el) {
    clear();
    state.fullText = text;
    state.targetEl = el;
    state.index = 0;
    state.isTyping = true;

    if (isInstant()) {
      finish();
      return;
    }

    tick();
  }

  function isActive() {
    return state.isTyping;
  }

  return {
    start,
    finish,
    clear,
    isActive
  };
}

module.exports = {
  createTypewriterController
};
