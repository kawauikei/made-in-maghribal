/**
 * Browser Entry Point for MadeInMaghribal (Fixed & Dummy Playthrough with Themes)
 */
const { GameSession } = require('./core/gameSessionFlow.cjs');
const { getVnRenderModel } = require('./core/renderModel.cjs');
const { SCENARIO_SAMPLES } = require('./data/scenarioSamples.cjs');
const { QUIZ_REQUEST_TEMPLATES } = require('./data/quizRequestTemplates.cjs');
const { generateQuestion } = require('./core/quizRequestModel.cjs');
const { processQuestionResult } = require('./core/rhythmQuizCore.cjs');
const { updateGameScore } = require('./core/scoreModel.cjs');
const { calculateAffection } = require('./core/affectionModel.cjs');
const { evaluateEnding } = require('./core/endingBranch.cjs');
const { ITEM_MASTER } = require('./data/itemMaster.cjs');
const { getItemDisplayName: getQualityItemDisplayName } = require('./data/itemDisplayNames.cjs');

console.log('MadeInMaghribal App Initializing with Theme Support...');

const RESULT_TRANSITION_DELAY_MS = 250;

class GameController {
  constructor() {
    this.session = new GameSession();
    this.container = document.getElementById('app');
    
    // Integration State
    this.quizState = this.createInitialQuizState();

    this.init();
    this.applyDebugJumpFromUrl();
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

  getItemDisplayName(itemId, quality = 'base') {
    const name = getQualityItemDisplayName(itemId, quality);
    if (name && name !== itemId) return name;

    const item = ITEM_MASTER.find(i => i.itemId === itemId);
    return item ? item.name : itemId;
  }

  getHeroineDisplayName(id) {
    const names = {
      HAKIMA: 'ハキマ',
      MIRA: 'ミラ',
      DARIYA: 'ダリヤ'
    };
    return names[id] || id;
  }

  getItemIconPath(itemId) {
    return `images/items/${itemId}.png`;
  }

  getTurnRank(dR, dS, dRep) {
    const total = dR + dS + dRep;
    if (total >= 90) return '大成功';
    if (total >= 60) return '成功';
    if (total >= 30) return 'まずまず';
    return '要改善';
  }

  shuffleChoices(choices) {
    return [...choices].sort(() => Math.random() - 0.5);
  }

  getSpeedMark(result) {
    if ((result.satisfactionBonus || 0) >= 2) return '◎';
    if ((result.satisfactionBonus || 0) >= 1) return '○';
    return '△';
  }

  getTempoMark(result) {
    if (result.rating === 'PERFECT') return '◎';
    if (result.rating === 'GOOD') return '○';
    return '△';
  }

  getCorrectLabel(result) {
    return result.isCorrect ? '正解' : '不正解';
  }

  isDebugMode() {
    return new URLSearchParams(window.location.search).get('debug') === '1';
  }

  applyDebugJumpFromUrl() {
    if (!this.isDebugMode()) return;
    const params = new URLSearchParams(window.location.search);
    const jump = params.get('jump');
    if (!jump) return;
    this.applyDebugJump(jump);
  }

  applyDebugJump(jump) {
    const heroine = 'HAKIMA';
    console.log('Applying debug jump:', jump);

    if (jump === 'heroine_select') {
      this.session.phase = 'HEROINE_SELECT';
      return;
    }

    if (jump === 'quiz') {
      this.session.phase = 'MAIN_GAME';
      this.session.selectedHeroineId = heroine;
      this.session.routeMode = 'normal';
      this.session.turn = 1;
      this.session.subPhase = 'QUIZ';
      this.startQuiz();
      return;
    }

    if (jump === 'turn_result') {
      this.session.phase = 'MAIN_GAME';
      this.session.selectedHeroineId = heroine;
      this.session.routeMode = 'normal';
      this.session.turn = 1;
      this.session.subPhase = 'TURN_RESULT';
      this.session.scores = { revenue: 80, satisfaction: 14, reputation: 9 };
      this.quizState.turnStartScore = { revenue: 0, satisfaction: 0, reputation: 0 };
      this.quizState.lastResult = {
        isCorrect: true,
        rating: 'GOOD',
        satisfactionBonus: 2,
        reputationBonus: 1,
        diffMs: 88,
        responseTime: 1200
      };
      return;
    }

    if (jump === 'turn5_after_close') {
      this.session.phase = 'MAIN_GAME';
      this.session.selectedHeroineId = heroine;
      this.session.routeMode = 'normal';
      this.session.turn = 5;
      this.session.subPhase = 'AFTER_CLOSE';
      this.session.scores = { revenue: 420, satisfaction: 80, reputation: 70 };
      return;
    }

    if (jump === 'ending_good') {
      this.session.phase = 'ENDING';
      this.session.selectedHeroineId = heroine;
      this.session.routeMode = 'normal';
      this.session.turn = 5;
      this.session.subPhase = 'AFTER_CLOSE';
      this.session.scores = { revenue: 500, satisfaction: 100, reputation: 100 };
      return;
    }

    if (jump === 'ending_normal') {
      this.session.phase = 'ENDING';
      this.session.selectedHeroineId = heroine;
      this.session.routeMode = 'normal';
      this.session.turn = 5;
      this.session.subPhase = 'AFTER_CLOSE';
      this.session.scores = { revenue: 100, satisfaction: 10, reputation: 10 };
      return;
    }

    console.warn('Unknown debug jump:', jump);
  }

  init() {
    console.log('Controller Initialized');
    
    // Selection/Drag Guards
    document.addEventListener('selectstart', (e) => {
      if (e.target.closest('#game-viewport')) {
        e.preventDefault();
      }
    });

    document.addEventListener('dragstart', (e) => {
      if (e.target.closest('#game-viewport')) {
        e.preventDefault();
      }
    });

    // Global click to advance phase/text
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Safety: Input lock check
      if (this.quizState.inputLocked) return;

      // Handle Choice Selection
      if (target.closest('.choice-card')) {
        const card = target.closest('.choice-card');
        const id = card.getAttribute('data-item-id');
        e.stopPropagation();
        this.answerQuiz(id);
        return;
      }

      // Handle Heroine Selection
      if (target.classList.contains('heroine-card')) {
        const id = target.getAttribute('data-id');
        e.stopPropagation();
        this.selectHeroine(id);
        return;
      }

      // Handle Buttons
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        e.stopPropagation();
        // Specific button logic if needed
        if (target.classList.contains('btn-next')) {
          this.onGlobalAction();
        }
        return;
      }

      if (this.session.phase === 'HEROINE_SELECT') {
        return;
      }
      
      this.onGlobalAction();
    });
  }

  selectHeroine(id) {
    if (this.quizState.inputLocked) return;
    console.log('Selecting Heroine:', id);
    this.session.selectHeroine(id, 'normal');
    this.session.nextPhase(); // -> MAIN_GAME
    this.update();
  }

  onGlobalAction() {
    if (this.quizState.inputLocked) return;
    const phase = this.session.phase;
    const subPhase = this.session.subPhase;
    console.log('Global Action on Phase:', phase, 'SubPhase:', subPhase);
    
    if (phase === 'TITLE') {
      this.session.nextPhase(); // -> OPENING
    } else if (phase === 'OPENING') {
      this.session.nextPhase(); // -> HEROINE_SELECT
    } else if (phase === 'MAIN_GAME') {
      if (subPhase === 'QUIZ') {
        return;
      }

      // Check if we should transition to ENDING
      if (this.session.turn === 5 && subPhase === 'AFTER_CLOSE') {
        this.session.nextPhase(); // -> ENDING
        this.update();
        return;
      }

      // Advance sub-phase
      this.session.nextSubPhase();

      // Trigger side effects when entering a sub-phase
      if (this.session.subPhase === 'QUIZ') {
        this.startQuiz();
      }
    } else if (phase === 'ENDING') {
      // Restart game
      this.session = new GameSession();
      this.quizState = this.createInitialQuizState();
      this.update();
      return;
    }
    
    this.update();
  }

  startQuiz() {
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
    
    if (!question) {
      // Fallback
      this.quizState.currentQuestion = {
        promptText: "何かもっとリフレッシュできるものはあるかしら？",
        correctItemId: "ITEM_001",
        wrongItemId: "ITEM_002"
      };
    } else {
      this.quizState.currentQuestion = question;
    }

    const q = this.quizState.currentQuestion;
    const choices = [
      { id: q.correctItemId, name: this.getItemDisplayName(q.correctItemId) },
      { id: q.wrongItemId, name: this.getItemDisplayName(q.wrongItemId) }
    ];
    this.quizState.currentChoices = this.shuffleChoices(choices);
    
    this.quizState.promptShownAt = performance.now();
    this.quizState.inputLocked = false; // Unlock for next question
  }

  answerQuiz(itemId) {
    if (this.quizState.inputLocked) return;
    this.quizState.inputLocked = true; // Lock briefly

    const now = performance.now();
    const beatInterval = 600;
    const nearestBeatMs = Math.round(now / beatInterval) * beatInterval;

    const result = processQuestionResult({
      promptShownAt: this.quizState.promptShownAt,
      answeredAt: now,
      selectedItemId: itemId,
      correctItemId: this.quizState.currentQuestion.correctItemId,
      nearestBeatMs
    });

    this.session.scores = updateGameScore(this.session.scores, result);
    this.quizState.lastResult = result;
    this.quizState.questionIndex++;

    console.log('Result:', result, 'New Scores:', this.session.scores);

    // Show receipt-style result stamp briefly
    this.showResultStamp(result);

    if (this.quizState.questionIndex < this.quizState.totalQuestions) {
      // Next question
      setTimeout(() => {
        this.generateNextQuestion();
        this.updateQuizContent();
      }, 100); // Very short pause
    } else {
      // End quiz
      setTimeout(() => {
        this.session.nextSubPhase(); // -> TURN_RESULT
        this.quizState.inputLocked = false; // Final unlock
        this.update();
      }, RESULT_TRANSITION_DELAY_MS);
    }
  }

  showResultStamp(result) {
    const root = document.getElementById('game-viewport') || this.container;
    if (!root) return;

    const el = document.createElement('div');
    el.className = `result-stamp ${result.isCorrect ? 'is-correct' : 'is-wrong'}`;
    el.innerHTML = `
      <div class="stamp-main">${this.getCorrectLabel(result)}</div>
      <div class="stamp-row"><span>スピード</span><strong>${this.getSpeedMark(result)}</strong></div>
      <div class="stamp-row"><span>テンポ</span><strong>${this.getTempoMark(result)}</strong></div>
    `;

    root.appendChild(el);
    setTimeout(() => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 520);
  }

  update() {
    const phase = this.session.phase;
    const newClassName = `phase-${phase.toLowerCase()}`;
    if (this.container.className !== newClassName) {
      this.container.className = newClassName;
    }

    if (phase === 'MAIN_GAME') {
      this.renderMainGame(this.container);
      return;
    }

    this.container.innerHTML = '';
    const view = document.createElement('div');
    view.className = 'view-container';

    if (phase === 'TITLE') {
      this.renderTitle(view);
    } else if (phase === 'OPENING') {
      this.renderOpening(view);
    } else if (phase === 'HEROINE_SELECT') {
      this.renderHeroineSelect(view);
    } else if (phase === 'ENDING') {
      this.renderEnding(view);
    }

    this.container.appendChild(view);
  }

  updateHud() {
    const hud = this.container.querySelector('[data-hud]');
    if (!hud) return;
    const s = this.session.scores;
    const label = (this.session.subPhase === 'QUIZ') ? '接客' : (this.session.subPhase === 'TURN_RESULT' ? '結果' : this.session.subPhase);
    hud.innerHTML = `
      <div>${this.session.turn}日目 | ${label}${this.isDebugMode() ? ' <span class="debug-badge">DEBUG</span>' : ''}</div>
      <div>売上: ${s.revenue} | 満足: ${s.satisfaction}</div>
    `;
  }

  renderTitle(view) {
    view.innerHTML = `
      <div class="title-screen">
        <h1 class="glow">Made in Maghribal</h1>
        <p class="blink">クリックして開始</p>
      </div>
    `;
  }

  renderOpening(view) {
    view.innerHTML = `
      <div class="opening-screen title-screen">
        <div class="result-card" style="padding: 40px; max-width: 85%;">
          <h2 class="glow" style="color: var(--sand-2); margin-bottom: 20px;">プロローグ</h2>
          <div style="text-align: left; line-height: 1.8;">
            <p>マグリバル砂漠の黄金の砂は、多くの物語を秘めています。</p>
            <p>あなたはこのオアシスの街に到着しました。地域で最も有名な茶屋を営む準備はできていますか？</p>
          </div>
          <p class="blink" style="margin-top: 30px; color: var(--sand-2);">クリックして進む</p>
        </div>
      </div>
    `;
  }

  renderHeroineSelect(view) {
    view.innerHTML = `
      <div class="heroine-select title-screen">
        <h2 class="glow" style="margin-bottom: 30px; color: var(--star-1);">営業パートナーを選択</h2>
        <div class="heroine-list">
          <div class="heroine-card" data-id="HAKIMA">ハキマ（優雅な賢者）</div>
          <div class="heroine-card" data-id="MIRA">ミラ（元気な看板娘）</div>
          <div class="heroine-card" data-id="DARIYA">ダリヤ（神秘的な踊り子）</div>
        </div>
      </div>
    `;
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
      if (subPhase === 'BEFORE_OPEN' || subPhase === 'AFTER_CLOSE') {
        this.renderVnShell(view);
      } else if (subPhase === 'QUIZ') {
        this.renderQuiz(view);
      } else if (subPhase === 'TURN_RESULT') {
        this.renderTurnResult(view);
      }
    }

    if (subPhase === 'BEFORE_OPEN') {
      this.updateHud();
      this.updateVnContent({
        speakerName: this.getHeroineDisplayName(this.session.selectedHeroineId),
        text: `おはよう！ ${this.session.turn}日目の営業がもうすぐ始まるわ。準備はいいかしら？`
      });
    } else if (subPhase === 'AFTER_CLOSE') {
      this.updateHud();
      this.updateVnContent({
        speakerName: this.getHeroineDisplayName(this.session.selectedHeroineId),
        text: `ふぅ、今日もお疲れ様！ 良い営業ができたわね。明日に備えてゆっくり休みましょう。`
      });
    } else if (subPhase === 'QUIZ') {
      this.updateHud();
      this.updateQuizContent();
    }
  }

  renderVnShell(view) {
    view.innerHTML = `
      <div class="vn-screen" data-screen="vn">
        <div class="stats" data-hud></div>
        <div class="message-box">
          <div class="speaker-name" data-vn-speaker></div>
          <div class="message-text-wrap">
            <div class="message-text" data-vn-text></div>
          </div>
        </div>
      </div>
    `;
  }

  updateVnContent({ speakerName, text }) {
    const speakerEl = this.container.querySelector('[data-vn-speaker]');
    const textEl = this.container.querySelector('[data-vn-text]');
    if (speakerEl) speakerEl.textContent = speakerName || '';
    if (textEl) textEl.textContent = text || '';
  }

  renderBeforeOpen(view) {
    // Legacy: handled by renderMainGame shell
  }

  renderQuiz(view) {
    view.innerHTML = `
      <div class="quiz-screen" data-screen="quiz">
        <div class="stats" data-hud></div>
        
        <section class="quiz-order-card">
          <div class="quiz-order-label">お客さんの要望</div>
          <div class="quiz-order-text" data-quiz-prompt></div>
          <div class="quiz-progress" data-quiz-progress></div>
        </section>

        <section class="rhythm-lane-placeholder" aria-label="リズム判定エリア">
          <div class="rhythm-guide-line"></div>
          <div class="rhythm-guide-note"></div>
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
    this.updateQuizContent();
  }

  updateQuizContent() {
    const q = this.quizState.currentQuestion;
    const promptEl = this.container.querySelector('[data-quiz-prompt]');
    const progressEl = this.container.querySelector('[data-quiz-progress]');
    
    if (promptEl) promptEl.textContent = q.promptText;
    if (progressEl) progressEl.textContent = `${this.quizState.questionIndex + 1} / ${this.quizState.totalQuestions}`;

    const choices = this.quizState.currentChoices;
    choices.forEach((c, idx) => {
      const card = this.container.querySelector(`[data-choice-slot="${idx}"]`);
      if (card) {
        card.setAttribute('data-item-id', c.id);
        const nameEl = card.querySelector('.choice-name');
        const iconEl = card.querySelector('.item-icon');
        const wrapEl = card.querySelector('.item-icon-wrap');

        if (nameEl) nameEl.textContent = c.name;
        if (iconEl) {
          iconEl.style.display = '';
          iconEl.src = this.getItemIconPath(c.id);
          iconEl.onerror = () => {
            iconEl.style.display = 'none';
            if (wrapEl) wrapEl.classList.add('missing-icon');
          };
        }
        if (wrapEl) wrapEl.classList.remove('missing-icon');
      }
    });
  }

  renderTurnResult(view) {
    const s = this.session.scores;
    const start = this.quizState.turnStartScore;
    const dR = s.revenue - start.revenue;
    const dS = s.satisfaction - start.satisfaction;
    const dRep = s.reputation - start.reputation;
    const rank = this.getTurnRank(dR, dS, dRep);
    
    view.innerHTML = `
      <div class="result-screen" data-screen="turn-result">
        <div class="result-card">
          <h2>${this.session.turn}日目の営業結果</h2>
          <div style="font-size: 1.8rem; font-weight: 900; color: var(--sand-2); margin-bottom: 25px; letter-spacing: 2px;">
            評価: ${rank}
          </div>
          <div class="score-row"><span>売上</span> <span>+${dR} (計: ${s.revenue})</span></div>
          <div class="score-row"><span>満足度</span> <span>+${dS} (計: ${s.satisfaction})</span></div>
          <div class="score-row"><span>評判</span> <span>+${dRep} (計: ${s.reputation})</span></div>
          <button class="btn-primary btn-next">次のフェーズへ</button>
        </div>
      </div>
    `;
  }

  renderAfterClose(view) {
    // Legacy: handled by renderMainGame shell
  }

  renderEnding(view) {
    const history = { maxSatisfaction: 100, maxReputation: 100 }; // Dummy history
    const affection = calculateAffection(this.session.scores, history);
    const endingType = evaluateEnding(affection, this.session.routeMode === 'extra');
    const typeLabel = endingType === 'GOOD' ? 'GOOD ENDING' : 'NORMAL ENDING';

    view.innerHTML = `
      <div class="ending-screen">
        <div class="ending-card">
          <h1 style="color: var(--sand-2); margin-bottom: 10px; font-size: 1.2rem;">終幕</h1>
          <h2 class="glow" style="font-size: 2.2rem; color: var(--star-1); margin-bottom: 20px;">${typeLabel}</h2>
          <div style="margin: 25px 0; font-size: 1.1rem;">
            <p>パートナー: ${this.getHeroineDisplayName(this.session.selectedHeroineId)}</p>
            <p>好感度: ${Math.round(affection)}%</p>
          </div>
          <div class="score-row"><span>最終売上</span> <span>${this.session.scores.revenue}</span></div>
          <div class="score-row"><span>最終満足度</span> <span>${this.session.scores.satisfaction}</span></div>
          <div class="score-row"><span>最終評判</span> <span>${this.session.scores.reputation}</span></div>
          <button class="btn-primary btn-next">タイトルへ戻る</button>
        </div>
      </div>
    `;
  }

  renderHud() {
    // Legacy: shell only
    return `<div class="stats" data-hud></div>`;
  }
}

// Start the game
window.game = new GameController();
