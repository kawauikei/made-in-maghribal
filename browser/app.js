/**
 * ============================================================================
 * Made In Maghribal - Browser Game Controller (Modularized)
 * ============================================================================
 */

const { GameSession, TOTAL_TURNS } = require('./core/gameSessionFlow.cjs');
const { generateQuestion } = require('./core/quizRequestModel.cjs');
const { processQuestionResult } = require('./core/rhythmQuizCore.cjs');
const { updateGameScore } = require('./core/scoreModel.cjs');
const { calculateAffection } = require('./core/affectionModel.cjs');
const { evaluateEnding } = require('./core/endingBranch.cjs');

// Modularized Screen Renderers
const { renderTitle, renderOpening } = require('./screens/titleScreen.js');
const { renderTitlePanel } = require('./screens/titlePanelScreen.js');
const { renderHeroineSelect } = require('./screens/heroineSelectScreen.js');
const { renderVnShell, updateVnContent } = require('./screens/vnScreen.js');
const { renderQuiz, updateQuizContent } = require('./screens/quizScreen.js');
const { renderTurnResult } = require('./screens/turnResultScreen.js');
const { renderEnding } = require('./screens/endingScreen.js');

// Modularized UI Components
const { updateHud, renderGlobalUi, renderModal } = require('./ui/hud.js');
const { showResultStamp } = require('./ui/resultStamp.js');

// Modularized Utilities
const { isDebugMode, applyDebugJumpFromUrl } = require('./utils/debugJump.js');
const { getHeroineDisplayName, getItemDisplayName, getItemIconPath, getTurnRank } = require('./utils/displayNames.js');
const { getCharacterStandingPath, getCharacterIconPath, getBackgroundPath } = require('./utils/assetPaths.js');
const { createSfxEngine } = require('./utils/sfxEngine.js');
const { createBgmEngine } = require('./utils/bgmEngine.js');
const {
  loadRhythmNoteMaps,
  getRhythmMapForPath: getLoadedRhythmMapForPath,
  findNearestRhythmNoteMs,
  getRhythmSilenceGraceMs,
  getRhythmSilenceGraceDebug
} = require('./utils/rhythmNoteMaps.js');
const { markImageSeen } = require('./utils/playerProgress.js');
const RHYTHM_NOTE_MAPS = loadRhythmNoteMaps();
const { createAssetPreloader } = require('./utils/preloadAssets.js');
const { registerSeenItems } = require('./utils/itemCollection.js');
const { hasRunSave, loadRunSave, getRunSaveSummary, clearRunSave, saveRun, applyRunSave } = require('./utils/saveData.js');
const { recordEndingProgress, getPlayerProgressSummary, recordQuizHistory } = require('./utils/playerProgress.js');
const { createTypewriterController } = require('./controllers/typewriterController.js');
const { createTurnTransitionController } = require('./controllers/turnTransitionController.js');
const { bindInputHandlers } = require('./controllers/inputController.js');
const { showLoading, hideLoading } = require('./ui/loadingOverlay.js');

/** Constants */
const RESULT_TRANSITION_DELAY_MS = 700;

const QUIZ_QUALITIES = ['normal', 'success', 'great_success'];

function normalizeQuizQuality(quality) {
  return QUIZ_QUALITIES.includes(quality) ? quality : 'normal';
}

function getQuizChoiceKey(itemId, quality) {
  return `${itemId}::${normalizeQuizQuality(quality)}`;
}

function getQuizQualityForIndex(index) {
  return QUIZ_QUALITIES[Math.max(0, index) % QUIZ_QUALITIES.length];
}

function getWrongQuizQuality(requiredQuality, index) {
  const offset = (index % 2) + 1;
  const baseIndex = QUIZ_QUALITIES.indexOf(normalizeQuizQuality(requiredQuality));
  return QUIZ_QUALITIES[(baseIndex + offset) % QUIZ_QUALITIES.length];
}

const TEXT_SPEED_MS = {
  slow: 55,
  normal: 32,
  fast: 16,
  instant: 0
};

const SETTINGS_KEY = 'madeinmaghribal.settings';

function getRhythmMapForPath(pathValue) {
  return getLoadedRhythmMapForPath(RHYTHM_NOTE_MAPS, pathValue);
}


class GameController {
  /**
   * --------------------------------------------------------------------------
   * 1. Initialization & Lifecycle
   * --------------------------------------------------------------------------
   */
  constructor() {
    this.session = new GameSession();
    this.container = document.getElementById('app');
    this.sfx = createSfxEngine();
    this.bgm = createBgmEngine();
    this.assetPreloader = createAssetPreloader();
    this.assetPreloader.preloadOpeningAssets();
    
    this.settings = this.loadSettings();
    this.applyAudioSettings();
    this.uiState = {
      modal: null, // 'options' | 'help' | null
      titlePanel: null, // title menu sub screen key
      itemDetailModal: null,
      turnTransitionActive: false,
      convoLog: []
    };

    this.totalTurns = TOTAL_TURNS;
    this.turnTransition = createTurnTransitionController(this);

    this.typewriter = createTypewriterController({
      getDelayMs: () => TEXT_SPEED_MS[this.settings.textSpeed] || 32,
      isInstant: () => this.settings.textSpeed === 'instant'
    });

    this.quizState = this.createInitialQuizState();
    this.endingProgressRecorded = false;
  }

  async boot() {
    this.init();
    applyDebugJumpFromUrl(this);
    this.applySettingsFromUrl();

    // Initial boot loading
    await showLoading(this.container, '起動しています...');
    await Promise.all([
      this.assetPreloader.preloadOpeningAssets(),
      new Promise(r => setTimeout(r, 1000)) // Initial weight
    ]);
    await hideLoading(this.container);

    this.update();
  }

  createInitialQuizState() {
    return {
      questionIndex: 0,
      totalQuestions: 10,
      currentQuestion: null,
      promptShownAt: 0,
      turnItemLog: [],
      lastResult: null,
      turnStartScore: null,
      inputLocked: false,
      currentChoices: []
    };
  }

  loadSettings() {
    const defaults = {
      textSpeed: 'normal',
      bgmEnabled: true,
      bgmVolume: 0.22,
      sfxEnabled: true,
      sfxVolume: 1
    };
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
    this.applyAudioSettings();
  }

  applyAudioSettings() {
    if (this.bgm) {
      this.bgm.setEnabled?.(this.settings.bgmEnabled !== false);
      this.bgm.setVolume?.(this.settings.bgmVolume);
    }
    if (this.sfx) {
      this.sfx.setEnabled?.(this.settings.sfxEnabled !== false);
      this.sfx.setVolume?.(this.settings.sfxVolume);
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

  setAudioEnabled(kind, enabled) {
    if (kind !== 'bgm' && kind !== 'sfx') return;
    this.settings[`${kind}Enabled`] = Boolean(enabled);
    this.saveSettings();
    this.renderModal();
    if (kind === 'bgm' && this.settings.bgmEnabled) this.syncBgm();
  }

  adjustAudioVolume(kind, delta) {
    if (kind !== 'bgm' && kind !== 'sfx') return;
    const key = `${kind}Volume`;
    const current = Number(this.settings[key]);
    const next = Math.max(0, Math.min(1, (Number.isFinite(current) ? current : 0.5) + delta));
    this.settings[key] = Math.round(next * 100) / 100;
    if (next > 0) this.settings[`${kind}Enabled`] = true;
    this.saveSettings();
    this.renderModal();
  }


  openTitlePanel(panelName) {
    this.uiState.titlePanel = panelName;
    this.uiState.itemDetailModal = null;
    this.playSfx('uiTapBottle');
    this.update();
  }

  closeTitlePanel() {
    this.uiState.titlePanel = null;
    this.uiState.itemDetailModal = null;
    this.playSfx('uiTapBottle');
    this.update();
  }

  markImageSeen(imageId) {
    markImageSeen(imageId);
  }

  updateGalleryCategory(category) {
    this.uiState.galleryCategory = category;
    this.uiState.galleryIndex = 0;
    this.update();
  }

  updateGalleryIndex(index) {
    this.uiState.galleryIndex = index;
    this.update();
  }

  toggleFullscreen() {
    const root = document.documentElement;
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
      let view = this.container.querySelector('.view-container');
      if (!view) {
        this.container.innerHTML = '';
        view = document.createElement('div');
        view.className = 'view-container';
        this.container.appendChild(view);
      }

      if (phase === 'TITLE') {
        if (this.uiState.titlePanel) renderTitlePanel(this, view);
        else renderTitle(this, view);
      } else if (phase === 'OPENING') {
        renderOpening(this, view);
      } else if (phase === 'HEROINE_SELECT') {
        this.preloadHeroineSelectAssets('HAKIMA');
        renderHeroineSelect(this, view);
      } else if (phase === 'ENDING') {
        this.recordEndingProgressIfNeeded();
        renderEnding(this, view);
      }
    }

    // Always ensure global UI and Modals are layered on top
    this.renderGlobalUi();
    this.renderModal();
    this.syncBgm();
    this.saveCurrentRunIfNeeded();
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
        text: `おはよう！ 第${this.session.turn}ターンの営業がもうすぐ始まるわ。準備はいいかしら？`,
        charId: this.session.selectedHeroineId,
        speakerId: this.session.selectedHeroineId,
        bgId: 'TEA_ROOM'
      });
    } else if (subPhase === 'AFTER_CLOSE') {
      this.updateHud();
      this.updateVnContent({
        speakerName: this.getHeroineDisplayName(this.session.selectedHeroineId),
        text: `ふぅ、第${this.session.turn}ターンの営業もお疲れ様！ 良い営業ができたわね。次のターンに備えてゆっくり休みましょう。`,
        charId: this.session.selectedHeroineId,
        speakerId: this.session.selectedHeroineId,
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
    this.typewriter.start(text, el);
  }

  finishTypewriter() {
    this.typewriter.finish();
  }

  clearTypewriter() {
    this.typewriter.clear();
  }

  isTypewriterActive() {
    return this.typewriter.isActive();
  }

  /**
   * --------------------------------------------------------------------------
   * 5. Wrappers for Modularized Functions
   * --------------------------------------------------------------------------
   */
  updateHud() { updateHud(this); }
  renderGlobalUi() { renderGlobalUi(this); }
  renderModal() { renderModal(this); }
  updateVnContent(payload) {
    if (payload && payload.text && payload.speakerName) {
      this.uiState.convoLog.push({
        speaker: payload.speakerName,
        text: payload.text,
        charId: payload.charId || payload.speakerId
      });
      if (this.uiState.convoLog.length > 50) {
        this.uiState.convoLog.shift();
      }
    }
    updateVnContent(this, payload);
  }
  updateQuizContent() { updateQuizContent(this); }
  showResultStamp(result) { showResultStamp(this, result); }

  isDebugMode() { return isDebugMode(); }
  getItemDisplayName(itemId, quality) { return getItemDisplayName(this, itemId, quality); }
  getHeroineDisplayName(id) { return getHeroineDisplayName(id); }
  getItemIconPath(itemId) { return getItemIconPath(itemId); }
  getTurnRank(dR, dS, dRep) { return getTurnRank(dR, dS, dRep); }
  getCharacterStandingPath(id, expression) { return getCharacterStandingPath(id, expression); }
  getCharacterIconPath(id, expression) { return getCharacterIconPath(id, expression); }
  getBackgroundPath(sceneId) { return getBackgroundPath(sceneId); }
  playSfx(id) { if (this.sfx) this.sfx.play(id); }
  syncBgm() {
    if (!this.bgm) return;
    if (this.session.phase === 'TITLE') return;
    this.bgm.playForSession(this.session);
  }
  getBgmState() { return this.bgm?.getState ? this.bgm.getState() : null; }
  hasSaveData() { return hasRunSave(); }
  getSaveSummary() { return getRunSaveSummary(); }
  getPlayerProgressSummary() { return getPlayerProgressSummary(); }
  clearRunSaveData() { clearRunSave(); }
  saveCurrentRunIfNeeded() { saveRun(this); }
  recordEndingProgressIfNeeded() {
    if (this.endingProgressRecorded || this.session.phase !== 'ENDING') return;
    const affection = calculateAffection(this.session.scores || {});
    const endingType = evaluateEnding(affection, this.session.routeMode === 'long_history');
    recordEndingProgress(this.session, endingType, affection);
    this.endingProgressRecorded = true;
  }
  async continueFromSave() {
    const saveData = loadRunSave();
    if (!saveData) return false;
    this.clearTypewriter();

    // Heavy preload for the saved heroine
    if (saveData.session?.selectedHeroineId) {
      await showLoading(this.container, '以前の記録を読み込んでいます...');
      await Promise.all([
        this.preloadHeroineSelectAssets(saveData.session.selectedHeroineId),
        new Promise(r => setTimeout(r, 800)) // Minimum weight
      ]);
      await hideLoading(this.container);
    }

    const applied = applyRunSave(this, saveData);
    if (applied) {
      this.uiState.titlePanel = null;
      this.endingProgressRecorded = false;
      if (this.session.phase === 'MAIN_GAME' && this.session.subPhase === 'QUIZ' && this.quizState.currentQuestion) {
        this.quizState.promptShownAt = performance.now();
      }
      this.playSfx('uiConfirmChime');
      this.update();
    }
    return applied;
  }
  preloadHeroineSelectAssets(heroineId) { return this.assetPreloader?.preloadHeroineSelectAssets(heroineId); }
  
  async startFreePlay({ bgmPath, questionCount }) {
    this.clearTypewriter();
    this.playSfx('uiConfirmChime');

    // Preload HAKIMA (Default for free play) assets if needed
    await showLoading(this.container, '接客の準備をしています...');
    await Promise.all([
        this.preloadHeroineSelectAssets('HAKIMA'),
        new Promise(r => setTimeout(r, 800)) // Minimum weight
    ]);
    await hideLoading(this.container);
    
    // Setup free play session
    this.session.phase = 'MAIN_GAME';
    this.session.subPhase = 'QUIZ';
    this.session.selectedHeroineId = 'HAKIMA'; 
    this.session.turn = 1; 
    
    this.quizState = this.createInitialQuizState();
    this.quizState.totalQuestions = questionCount || 10;
    
    // Force specific BGM if provided
    if (bgmPath && this.bgm) {
        this.bgm.play({ path: bgmPath, id: 'freeplay' });
    }
    
    this.uiState.titlePanel = null;
    this.startQuiz();
    this.update();
  }

  preloadResultExpressions(heroineId, expression) { return this.assetPreloader?.preloadResultExpressions(heroineId, expression); }
  getPreloadStats() { return this.assetPreloader?.getStats ? this.assetPreloader.getStats() : null; }

  playTurnTransition(callback, mode = 'next') {
    this.turnTransition.play(callback, mode);
  }

  finishTurnTransition(skip = false) {
    this.turnTransition.finish(skip);
  }


  updateSoundTestStatus(path) {
    let activeTitle = '';
    this.container.querySelectorAll('[data-sound-bgm-path]').forEach((button) => {
      const active = Boolean(path) && button.getAttribute('data-sound-bgm-path') === path;
      button.classList.toggle('is-active', active);
      if (active) {
        activeTitle = button.getAttribute('data-sound-title') || button.textContent.trim();
      }
    });

    const messageEl = this.container.querySelector('[data-sound-test-message]');
    if (messageEl) {
      messageEl.textContent = path ? (activeTitle || path.split('/').pop() || path) : 'BGMを停止しました。';
    }
  }

  /**
   * --------------------------------------------------------------------------
   * 6. Event Handlers & User Actions
   * --------------------------------------------------------------------------
   */
  init() {
    this.scheduleViewportScaleUpdate();
    window.addEventListener('resize', () => this.scheduleViewportScaleUpdate());
    window.addEventListener('orientationchange', () => this.scheduleViewportScaleUpdate());
    document.addEventListener('fullscreenchange', () => this.scheduleViewportScaleUpdate());
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.scheduleViewportScaleUpdate());
      window.visualViewport.addEventListener('scroll', () => this.scheduleViewportScaleUpdate());
    }
    console.log('Controller Initialized');
    bindInputHandlers(this);
  }

  async selectHeroine(id, routeMode = 'normal') {
    if (this.quizState.inputLocked) return;
    this.clearTypewriter();
    this.playSfx('uiConfirmChime');
    console.log('Selecting Heroine:', id);
    this.endingProgressRecorded = false;

    // Heavy preload
    await showLoading(this.container, '旅の準備をしています...');
    await Promise.all([
        this.preloadHeroineSelectAssets(id),
        new Promise(r => setTimeout(r, 800)) // Minimum weight
    ]);
    await hideLoading(this.container);

    this.session.selectHeroine(id, routeMode);
    this.session.nextPhase();
    this.update();
  }

  async onGlobalAction() {
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

      if (subPhase === 'AFTER_CLOSE') {
        const isFinalTurn = this.session.turn >= TOTAL_TURNS;
        this.playTurnTransition(() => {
          if (isFinalTurn) {
            this.session.nextPhase();
          } else {
            this.session.nextSubPhase();
          }
          this.update();
        }, isFinalTurn ? 'ending' : 'next');
        return;
      }

      this.session.nextSubPhase();
      if (this.session.subPhase === 'QUIZ') {
        this.startQuiz();
      }
    } else if (phase === 'ENDING') {
      clearRunSave();
      this.session = new GameSession();
      this.quizState = this.createInitialQuizState();
      this.endingProgressRecorded = false;
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
    this.quizState.rhythmStartedAt = null;
    this.quizState.rhythmVisualFrameId = null;
    this.quizState.turnStartScore = { ...this.session.scores };
    this.quizState.turnItemLog = [];
    this.generateNextQuestion();
  }

  generateNextQuestion() {
    const question = generateQuestion(null, {
      questionIndex: this.quizState.questionIndex,
      totalQuestions: this.quizState.totalQuestions,
      turn: this.session.turn,
      routeMode: this.session.routeMode || 'normal',
      heroineId: this.session.selectedHeroineId || 'HAKIMA'
    });
    
    this.quizState.currentQuestion = question || {
      promptText: "何かもっとリフレッシュできるものを見せてもらえる？",
      correctItemId: "IT_MED_EL_01",
      wrongItemId: "IT_FOD_SA_01",
      correctQuality: getQuizQualityForIndex(this.quizState.questionIndex),
      customerIconTone: 'amber',
      customerType: 'fallback'
    };

    const q = this.quizState.currentQuestion;
    q.correctQuality = normalizeQuizQuality(q.correctQuality || q.requiredQuality || getQuizQualityForIndex(this.quizState.questionIndex));
    q.wrongQuality = getWrongQuizQuality(q.correctQuality, this.quizState.questionIndex);
    q.correctChoiceKey = getQuizChoiceKey(q.correctItemId, q.correctQuality);

    const choices = [
      {
        id: q.correctItemId,
        quality: q.correctQuality,
        choiceKey: q.correctChoiceKey,
        name: this.getItemDisplayName(q.correctItemId, q.correctQuality)
      },
      {
        id: q.wrongItemId,
        quality: q.wrongQuality,
        choiceKey: getQuizChoiceKey(q.wrongItemId, q.wrongQuality),
        name: this.getItemDisplayName(q.wrongItemId, q.wrongQuality)
      }
    ];
    this.quizState.currentChoices = this.shuffleChoices(choices);
    
    this.quizState.promptShownAt = performance.now();
    this.quizState.inputLocked = false;
  }

  shuffleChoices(choices) {
    return [...choices].sort(() => Math.random() - 0.5);
  }


  recordQuizItemLog(selectedItemId, result) {
    const q = this.quizState.currentQuestion;
    const questionIndex = this.quizState.questionIndex;
    const choices = this.quizState.currentChoices.map((choice) => ({
      itemId: choice.id,
      displayName: choice.name || this.getItemDisplayName(choice.id, choice.quality),
      iconPath: this.getItemIconPath(choice.id),
      quality: normalizeQuizQuality(choice.quality),
      selected: choice.id === selectedItemId,
      correct: q && getQuizChoiceKey(choice.id, choice.quality) === (q.correctChoiceKey || getQuizChoiceKey(q.correctItemId, q.correctQuality))
    }));

    const collectionUpdates = registerSeenItems(
      choices.map((choice) => choice.itemId),
      { turn: this.session.turn, questionIndex }
    );
    const newItemIds = new Set(collectionUpdates.filter((entry) => entry.isNew).map((entry) => entry.itemId));

    this.quizState.turnItemLog.push({
      turn: this.session.turn,
      questionIndex,
      promptText: q ? q.promptText : '',
      selectedItemId,
      correctItemId: q ? q.correctItemId : '',
      result,
      choices: choices.map((choice) => ({
        ...choice,
        isNew: newItemIds.has(choice.itemId)
      }))
    });
  }

  getCurrentRhythmMapState() {
    const bgmState = this.getBgmState ? this.getBgmState() : null;
    const noteMap = getRhythmMapForPath(bgmState?.currentPath || bgmState?.pendingPath || '');
    const audioTimeMs = Number(bgmState?.currentTimeMs);
    return { bgmState, noteMap, audioTimeMs };
  }

  getNearestVisualBeatMs(now) {
    const { noteMap, audioTimeMs } = this.getCurrentRhythmMapState();
    const nearestNoteMs = findNearestRhythmNoteMs(noteMap, audioTimeMs);
    if (nearestNoteMs !== null) {
      return now + (nearestNoteMs - audioTimeMs);
    }

    const beatIntervalMs = this.quizState.rhythmBeatIntervalMs || 600;
    const rhythmStartedAt = this.quizState.rhythmStartedAt || this.quizState.promptShownAt || now;
    const elapsed = now - rhythmStartedAt;
    return rhythmStartedAt + Math.round(elapsed / beatIntervalMs) * beatIntervalMs;
  }

  getRhythmSpeedGraceMs() {
    const { noteMap, audioTimeMs } = this.getCurrentRhythmMapState();
    return getRhythmSilenceGraceMs(noteMap, audioTimeMs);
  }

  getRhythmSpeedGraceDebug() {
    const { bgmState, noteMap, audioTimeMs } = this.getCurrentRhythmMapState();
    return {
      ...getRhythmSilenceGraceDebug(noteMap, audioTimeMs),
      bgmPath: bgmState?.currentPath || bgmState?.pendingPath || '',
      questionIndex: this.quizState.questionIndex + 1,
      turn: this.session.turn
    };
  }

  answerQuiz(itemId, quality = 'normal') {
    if (this.quizState.inputLocked) return;
    this.quizState.inputLocked = true;
    this.playSfx('quizChoicePick');

    const now = performance.now();
    const q = this.quizState.currentQuestion;
    const selectedQuality = normalizeQuizQuality(quality);
    const selectedChoiceKey = getQuizChoiceKey(itemId, selectedQuality);
    const correctChoiceKey = q.correctChoiceKey || getQuizChoiceKey(q.correctItemId, q.correctQuality);
    const speedGraceDebug = this.getRhythmSpeedGraceDebug();
    const nearestBeatMs = this.getNearestVisualBeatMs(now);
    const result = processQuestionResult({
      promptShownAt: this.quizState.promptShownAt,
      answeredAt: now,
      selectedItemId: itemId,
      correctItemId: q.correctItemId,
      selectedChoiceKey,
      correctChoiceKey,
      nearestBeatMs,
      speedGraceMs: speedGraceDebug.speedGraceMs
    });

    if (typeof console !== 'undefined' && console.log) {
      console.log('[rhythm-speed-grace]', {
        ...speedGraceDebug,
        responseTime: Math.round(result.responseTime),
        effectiveResponseTime: Math.round(result.effectiveResponseTime),
        speedBonus: result.satisfactionBonus,
        rhythmRating: result.rating,
        rhythmDiffMs: result.diffMs,
        nearestBeatOffsetMs: Math.round(nearestBeatMs - now)
      });
    }

    this.recordQuizItemLog(itemId, result);

    const finalScore = updateGameScore(this.session, result);

    // Record quiz history
    recordQuizHistory({
      turn: this.session.turn,
      heroineId: this.session.selectedHeroineId,
      prompt: q.promptText || '',
      correctItemId: q.correctItemId || '',
      selectedItemId: itemId,
      result: finalScore.isPerfect ? 'perfect' : (finalScore.isSuccess ? 'good' : 'miss')
    });

    this.updateQuizContent();
    this.quizState.lastResult = result;
    this.quizState.questionIndex++;

    this.showResultStamp(result);
    this.playSfx(result.isCorrect ? 'quizCorrectStarChime' : 'quizWrongSandTap');

    if (this.quizState.questionIndex < this.quizState.totalQuestions) {
      setTimeout(() => {
        this.generateNextQuestion();
        this.updateQuizContent();
        this.quizState.inputLocked = false;
      }, RESULT_TRANSITION_DELAY_MS);
    } else {
      setTimeout(() => {
        this.session.nextSubPhase();
        this.playSfx('workshopDayEnd');
        this.quizState.inputLocked = false;
        this.update();
      }, RESULT_TRANSITION_DELAY_MS);
    }
  }

  scheduleViewportScaleUpdate() {
    if (this.viewportScaleFrame) window.cancelAnimationFrame(this.viewportScaleFrame);
    this.viewportScaleFrame = window.requestAnimationFrame(() => {
      this.viewportScaleFrame = null;
      this.updateViewportScale();
      window.setTimeout(() => this.updateViewportScale(), 80);
      window.setTimeout(() => this.updateViewportScale(), 240);
    });
  }

  getAvailableViewportRect() {
    const visualViewport = window.visualViewport;
    const width = Math.max(1, visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 720);
    const height = Math.max(1, visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 1280);
    return {
      width,
      height,
      offsetLeft: visualViewport?.offsetLeft || 0,
      offsetTop: visualViewport?.offsetTop || 0
    };
  }

  updateViewportScale() {
    const baseWidth = 720;
    const baseHeight = 1280;
    const { width, height, offsetLeft, offsetTop } = this.getAvailableViewportRect();
    const scale = Math.min(width / baseWidth, height / baseHeight);
    const viewport = document.getElementById('game-viewport');
    if (viewport) {
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;
      const left = offsetLeft + Math.max(0, (width - scaledWidth) / 2);
      const top = offsetTop + Math.max(0, (height - scaledHeight) / 2);
      viewport.style.position = 'fixed';
      viewport.style.left = `${left}px`;
      viewport.style.top = `${top}px`;
      viewport.style.transformOrigin = 'top left';
      viewport.style.transform = `scale(${scale})`;
    }
    document.documentElement.style.setProperty('--viewport-scale', String(scale));
    document.documentElement.style.setProperty('--app-available-width', `${width}px`);
    document.documentElement.style.setProperty('--app-available-height', `${height}px`);
  }
}

// Start the game
window.game = new GameController();
window.game.boot();
