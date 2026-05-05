/**
 * Browser Entry Point for MadeInMaghribal (Fixed)
 */
const { GameSession } = require('./core/gameSessionFlow.cjs');
const { getVnRenderModel } = require('./core/renderModel.cjs');
const { SCENARIO_SAMPLES } = require('./data/scenarioSamples.cjs');

console.log('MadeInMaghribal App Initializing...');

class GameController {
  constructor() {
    this.session = new GameSession();
    this.container = document.getElementById('app');
    this.init();
  }

  init() {
    console.log('Controller Initialized');
    this.update();
    
    // Global click to advance phase/text
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Handle Heroine Selection clicks specifically
      if (target.classList.contains('heroine-card')) {
        const id = target.getAttribute('data-id');
        this.selectHeroine(id);
        return;
      }

      // Don't advance if clicking other buttons (if any)
      if (target.tagName === 'BUTTON') return;
      
      this.onGlobalAction();
    });
  }

  selectHeroine(id) {
    console.log('Selecting Heroine:', id);
    this.session.selectHeroine(id, 'normal');
    this.session.nextPhase(); // -> MAIN_GAME
    this.update();
  }

  onGlobalAction() {
    const phase = this.session.phase;
    console.log('Global Action on Phase:', phase);
    
    if (phase === 'TITLE') {
      this.session.nextPhase(); // -> OPENING
    } else if (phase === 'OPENING') {
      this.session.nextPhase(); // -> HEROINE_SELECT
    } else if (phase === 'MAIN_GAME') {
      // For now, just advance sub-phase
      this.session.nextSubPhase();
    }
    
    this.update();
  }

  update() {
    const phase = this.session.phase;
    this.container.className = `phase-${phase.toLowerCase()}`;
    this.container.innerHTML = '';

    const view = document.createElement('div');
    view.className = 'view-container';

    if (phase === 'TITLE') {
      view.innerHTML = `
        <div class="title-screen">
          <h1 class="glow">Made in Maghribal</h1>
          <p class="blink">Click to Start Adventure</p>
        </div>
      `;
    } else if (phase === 'OPENING') {
      view.innerHTML = `
        <div class="opening-screen">
          <h2 class="glow">Prologue</h2>
          <p>The desert wind whispers secrets...</p>
          <p class="blink">Click to continue</p>
        </div>
      `;
    } else if (phase === 'HEROINE_SELECT') {
      view.innerHTML = `
        <div class="heroine-select">
          <h2 class="glow">Select Your Heroine</h2>
          <div class="heroine-list">
            <div class="heroine-card" data-id="HAKIMA">HAKIMA</div>
            <div class="heroine-card" data-id="MIRA">MIRA</div>
            <div class="heroine-card" data-id="DARIYA">DARIYA</div>
          </div>
        </div>
      `;
    } else if (phase === 'MAIN_GAME') {
      // Fix: Use correct key SCENARIO_SAMPLES.SC_OP_OPENING
      const sampleStep = SCENARIO_SAMPLES.SC_OP_OPENING[0];
      const model = getVnRenderModel(this.session, sampleStep);
      
      view.innerHTML = `
        <div class="vn-screen">
          <div class="stats">
            Turn: ${this.session.turn} | 
            Heroine: ${this.session.selectedHeroineId} | 
            Gold: ${this.session.scores.revenue}
          </div>
          <div class="scene-overlay"></div>
          <div class="message-box">
            <div class="speaker-name">${model.speaker ? model.speaker.name : '???'}</div>
            <div class="message-text">${model.text}</div>
          </div>
        </div>
      `;
    } else {
      view.innerHTML = `<h2>Phase: ${phase}</h2><p>Coming Soon...</p>`;
    }

    this.container.appendChild(view);
  }
}

// Start the game
window.game = new GameController();
