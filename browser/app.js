/**
 * ============================================================================
 * Made In Maghribal - Browser Game Controller (Modularized)
 * ============================================================================
 */

const { GameSession } = require('./core/gameSessionFlow.cjs');
const { QUIZ_REQUEST_TEMPLATES } = require('./data/quizRequestTemplates.cjs');
const { generateQuestion } = require('./core/quizRequestModel.cjs');
const { processQuestionResult } = require('./core/rhythmQuizCore.cjs');
const { updateGameScore } = require('./core/scoreModel.cjs');

// Modularized Screen Renderers
const { renderTitle, renderOpening } = require('./screens/titleScreen.js');
const { renderHeroineSelect } = require('./screens/heroineSelectScreen.js');
const { renderVnShell, updateVnContent } = require('./screens/vnScreen.js');
const { renderQuiz, updateQuizContent } = require('./screens/quizScreen.js');
const { renderTurnResult, renderEnding } = require('./screens/endingScreen.js');

// Modularized UI Components
const { updateHud, renderGlobalUi, renderModal } = require('./ui/hud.js');
const { showResultStamp } = require('./ui/resultStamp.js');

// Modularized Utilities
const { isDebugMode, applyDebugJumpFromUrl } = require('./utils/debugJump.js');
const { getHeroineDisplayName, getItemDisplayName, getItemIconPath, getTurnRank } = require('./utils/displayNames.js');
const { getCharacterStandingPath, getBackgroundPath } = require('./utils/assetPaths.js');

/** Constants */
const RESULT_TRANSITION_DELAY_MS = 2500;

const TEXT_SPEED_MS = {
  slow: 55,
  normal: 32,
  fast: 16,
  instant: 0
};

const SETTINGS_KEY = 'madeinmaghribal.settings';

class GameController {
  /**
   * --------------------------------------------------------------------------
   * 1. Initialization & Lifecycle
   * --------------------------------------------------------------------------
   */
  constructor() {
    this.session = new GameSession();
    this.container = document.getElementById('app');
    
    this.settings = this.loadSettings();
    this.uiState = {
      modal: null // 'options' | 'help' | null
    };

    this.typewriter = {
      fullText: '',
      visibleText: '',
      index: 0,
      timerId: null,
      isTyping: false,
      targetEl: null
    };

    this.quizState = this.createInitialQuizState();

    this.init();
    applyDebugJumpFromUrl(this);
    this.applySettingsFromUrl();
    this.update();
  }

  createInitialQuizState() {
    return {
      questionIndex: 0,
      totalQuestions: 10,
      currentQuestion: null,
      promptShownAt: 0,
      lastResult: null,
      turnStartScore: null,
      inputLocked: false,
      currentChoices: []
    };
  }

  loadSettings() {
    const defaults = { textSpeed: 'normal' };
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return defaults;
      return { ...defaults, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Failed to load settings:', e);
      return defaults;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  applySettingsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const speed = params.get('textSpeed');
    if (TEXT_SPEED_MS[speed] !== undefined) {
      this.settings.textSpeed = speed;
    }
  }

  getTextSpeedLabel() {
    const labels = {
      slow: '遅い',
      normal: '標準',
      fast: '速い',
      instant: '瞬時'
    };
    return labels[this.settings.textSpeed] || '標準';
  }

  /**
   * --------------------------------------------------------------------------
   * 2. UI Actions & Modals
   * --------------------------------------------------------------------------
   */
  openModal(name) {
    this.uiState.modal = name;
    this.renderModal();
  }

  closeModal() {
    this.uiState.modal = null;
    this.renderModal();
  }

  setTextSpeed(speed) {
    if (TEXT_SPEED_MS[speed] === undefined) return;
    this.settings.textSpeed = speed;
    this.saveSettings();
    this.renderModal(); // Refresh modal state
  }

  toggleFullscreen() {
    const root = document.getElementById('game-viewport');
    if (!document.fullscreenElement) {
      if (root?.requestFullscreen) root.requestFullscreen();
      else if (root?.webkitRequestFullscreen) root.webkitRequestFullscreen();
      else if (root?.msRequestFullscreen) root.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  }

  /**
   * --------------------------------------------------------------------------
   * 3. Core Update Logic (Routing & Shell Management)
   * --------------------------------------------------------------------------
   */
  update() {
    const phase = this.session.phase;
    const newClassName = `phase-${phase.toLowerCase()}`;
    if (this.container.className !== newClassName) {
      this.container.className = newClassName;
    }

    if (phase === 'MAIN_GAME') {
      this.renderMainGame(this.container);
    } else {
      this.container.innerHTML = '';
      const view = document.createElement('div');
      view.className = 'view-container';

      if (phase === 'TITLE') {
        renderTitle(this, view);
      } else if (phase === 'OPENING') {
        renderOpening(this, view);
      } else if (phase === 'HEROINE_SELECT') {
        renderHeroineSelect(this, view);
      } else if (phase === 'ENDING') {
        renderEnding(this, view);
      }

      this.container.appendChild(view);
    }

    // Always ensure global UI and Modals are layered on top
    this.renderGlobalUi();
    this.renderModal();
  }

  renderMainGame(container) {
    let view = container.querySelector('.view-container');
    if (!view) {
      view = document.createElement('div');
      view.className = 'view-container';
      container.appendChild(view);
    }

    const subPhase = this.session.subPhase;
    const currentScreen = view.querySelector('[data-screen]');
    const targetScreen = (subPhase === 'QUIZ') ? 'quiz' : (subPhase === 'TURN_RESULT' ? 'turn-result' : 'vn');

    if (!currentScreen || currentScreen.getAttribute('data-screen') !== targetScreen) {
      this.clearTypewriter();
      if (subPhase === 'BEFORE_OPEN' || subPhase === 'AFTER_CLOSE') {
        renderVnShell(this, view);
      } else if (subPhase === 'QUIZ') {
        renderQuiz(this, view);
      } else if (subPhase === 'TURN_RESULT') {
        renderTurnResult(this, view);
      }
    }

    if (subPhase === 'BEFORE_OPEN') {
      this.updateHud();
      this.updateVnContent({
        speakerName: this.getHeroineDisplayName(this.session.selectedHeroineId),
        text: `おはよう！ ${this.session.turn}日目の営業がもうすぐ始まるわ。準備はいいかしら？`,
        charId: this.session.selectedHeroineId,
        bgId: 'TEA_ROOM'
      });
    } else if (subPhase === 'AFTER_CLOSE') {
      this.updateHud();
      this.updateVnContent({
        speakerName: this.getHeroineDisplayName(this.session.selectedHeroineId),
        text: `ふぅ、今日もお疲れ様！ 良い営業ができたわね。明日に備えてゆっくり休みましょう。`,
        charId: this.session.selectedHeroineId,
        bgId: 'TEA_ROOM'
      });
    } else if (subPhase === 'QUIZ') {
      this.updateHud();
      this.updateQuizContent();
    }
  }

  /**
   * --------------------------------------------------------------------------
   * 4. Typewriter Methods
   * --------------------------------------------------------------------------
   */
  startTypewriter(text, el) {
    this.clearTypewriter();
    this.typewriter.fullText = text;
    this.typewriter.targetEl = el;
    this.typewriter.index = 0;
    this.typewriter.isTyping = true;

    if (this.settings.textSpeed === 'instant') {
      this.finishTypewriter();
      return;
    }

    this.tickTypewriter();
  }

  tickTypewriter() {
    const delay = TEXT_SPEED_MS[this.settings.textSpeed] || 32;
    this.typewriter.timerId = setTimeout(() => {
      this.typewriter.index++;
      this.typewriter.visibleText = this.typewriter.fullText.substring(0, this.typewriter.index);
      if (this.typewriter.targetEl) {
        this.typewriter.targetEl.textContent = this.typewriter.visibleText;
      }

      if (this.typewriter.index < this.typewriter.fullText.length) {
        this.tickTypewriter();
      } else {
        this.typewriter.isTyping = false;
      }
    }, delay);
  }

  finishTypewriter() {
    this.clearTypewriter();
    this.typewriter.index = this.typewriter.fullText.length;
    this.typewriter.isTyping = false;
    if (this.typewriter.targetEl) {
      this.typewriter.targetEl.textContent = this.typewriter.fullText;
    }
  }

  clearTypewriter() {
    if (this.typewriter.timerId) {
      clearTimeout(this.typewriter.timerId);
      this.typewriter.timerId = null;
    }
    this.typewriter.isTyping = false;
  }

  isTypewriterActive() {
    return this.typewriter.isTyping;
  }

  /**
   * --------------------------------------------------------------------------
   * 5. Wrappers for Modularized Functions
   * --------------------------------------------------------------------------
   */
  updateHud() { updateHud(this); }
  renderGlobalUi() { renderGlobalUi(this); }
  renderModal() { renderModal(this); }
  updateVnContent(payload) { updateVnContent(this, payload); }
  updateQuizContent() { updateQuizContent(this); }
  showResultStamp(result) { showResultStamp(this, result); }

  isDebugMode() { return isDebugMode(); }
  getItemDisplayName(itemId, quality) { return getItemDisplayName(this, itemId, quality); }
  getHeroineDisplayName(id) { return getHeroineDisplayName(id); }
  getItemIconPath(itemId) { return getItemIconPath(itemId); }
  getTurnRank(dR, dS, dRep) { return getTurnRank(dR, dS, dRep); }
  getCharacterStandingPath(id, expression) { return getCharacterStandingPath(id, expression); }
  getBackgroundPath(sceneId) { return getBackgroundPath(sceneId); }

  /**
   * --------------------------------------------------------------------------
   * 6. Event Handlers & User Actions
   * --------------------------------------------------------------------------
   */
  init() {
    console.log('Controller Initialized');
    
    document.addEventListener('selectstart', (e) => {
      if (e.target.closest('#game-viewport')) e.preventDefault();
    });

    document.addEventListener('dragstart', (e) => {
      if (e.target.closest('#game-viewport')) e.preventDefault();
    });

    document.addEventListener('click', (e) => {
      const target = e.target;
      if (this.quizState.inputLocked) return;

      // Global UI Actions
      if (target.closest('[data-action="open-options"]')) {
        e.stopPropagation();
        this.openModal('options');
        return;
      }
      if (target.closest('[data-action="open-help"]')) {
        e.stopPropagation();
        this.openModal('help');
        return;
      }
      if (target.closest('[data-action="close-modal"]')) {
        e.stopPropagation();
        this.closeModal();
        return;
      }
      if (target.closest('[data-action="toggle-fullscreen"]')) {
        e.stopPropagation();
        this.toggleFullscreen();
        return;
      }
      const speedBtn = target.closest('[data-action="set-text-speed"]');
      if (speedBtn) {
        e.stopPropagation();
        this.setTextSpeed(speedBtn.getAttribute('data-speed'));
        return;
      }

      // Skip Actions
      if (target.closest('[data-action="skip-text"]')) {
        e.stopPropagation();
        this.onGlobalAction();
        return;
      }

      if (target.closest('.choice-card')) {
        const id = target.closest('.choice-card').getAttribute('data-item-id');
        e.stopPropagation();
        this.answerQuiz(id);
        return;
      }

      if (target.classList.contains('heroine-card')) {
        const id = target.getAttribute('data-id');
        e.stopPropagation();
        this.selectHeroine(id);
        return;
      }

      if (target.tagName === 'BUTTON' || target.closest('button')) {
        e.stopPropagation();
        if (target.classList.contains('btn-next')) {
          this.onGlobalAction();
        }
        return;
      }

      // Prevent modal backdrop from closing or interfering with text advancement
      if (this.uiState.modal) {
        if (!target.closest('.ui-modal')) {
          this.closeModal();
        }
        return;
      }

      if (this.session.phase === 'HEROINE_SELECT') return;
      
      this.onGlobalAction();
    });
  }

  selectHeroine(id) {
    if (this.quizState.inputLocked) return;
    this.clearTypewriter();
    console.log('Selecting Heroine:', id);
    this.session.selectHeroine(id, 'normal');
    this.session.nextPhase();
    this.update();
  }

  onGlobalAction() {
    if (this.quizState.inputLocked || this.uiState.modal) return;
    const { phase, subPhase } = this.session;

    // Handle Typewriter "Finish on Click"
    if ((phase === 'OPENING' || (phase === 'MAIN_GAME' && (subPhase === 'BEFORE_OPEN' || subPhase === 'AFTER_CLOSE'))) && this.isTypewriterActive()) {
      this.finishTypewriter();
      return;
    }

    console.log('Global Action on Phase:', phase, 'SubPhase:', subPhase);
    
    if (phase === 'TITLE') {
      this.session.nextPhase();
    } else if (phase === 'OPENING') {
      this.session.nextPhase();
    } else if (phase === 'MAIN_GAME') {
      if (subPhase === 'QUIZ') return;

      if (this.session.turn === 5 && subPhase === 'AFTER_CLOSE') {
        this.session.nextPhase();
        this.update();
        return;
      }

      this.session.nextSubPhase();
      if (this.session.subPhase === 'QUIZ') {
        this.startQuiz();
      }
    } else if (phase === 'ENDING') {
      this.session = new GameSession();
      this.quizState = this.createInitialQuizState();
      this.update();
      return;
    }
    
    this.update();
  }

  startQuiz() {
    this.clearTypewriter();
    console.log('Starting Quiz...');
    this.quizState.questionIndex = 0;
    this.quizState.lastResult = null;
    this.quizState.inputLocked = false;
    this.quizState.turnStartScore = { ...this.session.scores };
    this.generateNextQuestion();
  }

  generateNextQuestion() {
    const template = QUIZ_REQUEST_TEMPLATES[this.quizState.questionIndex % QUIZ_REQUEST_TEMPLATES.length];
    const question = generateQuestion(template);
    
    this.quizState.currentQuestion = question || {
      promptText: "何かもっとリフレッシュできるものはあるかしら？",
      correctItemId: "ITEM_001",
      wrongItemId: "ITEM_002"
    };

    const q = this.quizState.currentQuestion;
    const choices = [
      { id: q.correctItemId, name: this.getItemDisplayName(q.correctItemId) },
      { id: q.wrongItemId, name: this.getItemDisplayName(q.wrongItemId) }
    ];
    this.quizState.currentChoices = this.shuffleChoices(choices);
    
    this.quizState.promptShownAt = performance.now();
    this.quizState.inputLocked = false;
  }

  shuffleChoices(choices) {
    return [...choices].sort(() => Math.random() - 0.5);
  }

  answerQuiz(itemId) {
    if (this.quizState.inputLocked) return;
    this.quizState.inputLocked = true;

    const now = performance.now();
    const result = processQuestionResult({
      promptShownAt: this.quizState.promptShownAt,
      answeredAt: now,
      selectedItemId: itemId,
      correctItemId: this.quizState.currentQuestion.correctItemId,
      nearestBeatMs: Math.round(now / 600) * 600
    });

    this.session.scores = updateGameScore(this.session.scores, result);
    this.quizState.lastResult = result;
    this.quizState.questionIndex++;

    this.showResultStamp(result);

    if (this.quizState.questionIndex < this.quizState.totalQuestions) {
      setTimeout(() => {
        this.generateNextQuestion();
        this.updateQuizContent();
      }, 100);
    } else {
      setTimeout(() => {
        this.session.nextSubPhase();
        this.quizState.inputLocked = false;
        this.update();
      }, RESULT_TRANSITION_DELAY_MS);
    }
  }
}

// Start the game
window.game = new GameController();
