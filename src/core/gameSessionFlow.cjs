/**
 * Game Session Flow manager for MadeInMaghribal project.
 */
const { getInitialUnlockState } = require('./unlockState.cjs');
const { getSongForTurn } = require('./stageSchedule.cjs');

/**
 * Manages the top-level game state and transitions.
 */
class GameSession {
  constructor() {
    this.phase = 'TITLE';
    this.turn = 1;
    this.subPhase = 'BEFORE_OPEN';
    this.selectedHeroineId = null;
    this.routeMode = 'normal';
    this.scores = { revenue: 0, satisfaction: 0, reputation: 0 };
    this.affection = { HAKIMA: 0, MIRA: 0, DARIYA: 0 };
    this.unlockState = getInitialUnlockState();
  }

  /**
   * Advances the top-level phase.
   */
  nextPhase() {
    if (this.phase === 'TITLE') {
      this.phase = 'OPENING';
    } else if (this.phase === 'OPENING') {
      this.phase = 'HEROINE_SELECT';
    } else if (this.phase === 'HEROINE_SELECT') {
      this.phase = 'MAIN_GAME';
    } else if (this.phase === 'MAIN_GAME' && this.turn === 5 && this.subPhase === 'AFTER_CLOSE') {
      this.phase = 'ENDING';
    }
  }

  /**
   * Advances the turn sub-phase.
   */
  nextSubPhase() {
    if (this.subPhase === 'BEFORE_OPEN') {
      this.subPhase = 'QUIZ';
    } else if (this.subPhase === 'QUIZ') {
      this.subPhase = 'TURN_RESULT';
    } else if (this.subPhase === 'TURN_RESULT') {
      this.subPhase = 'AFTER_CLOSE';
    } else if (this.subPhase === 'AFTER_CLOSE') {
      if (this.turn < 5) {
        this.turn++;
        this.subPhase = 'BEFORE_OPEN';
      }
    }
  }

  /**
   * Sets the selected heroine and route.
   */
  selectHeroine(heroineId, routeMode = 'normal') {
    this.selectedHeroineId = heroineId;
    this.routeMode = routeMode;
  }

  /**
   * Returns the current song ID for the current state.
   */
  get currentSong() {
    return getSongForTurn(this.turn, this.selectedHeroineId, this.routeMode);
  }
}

module.exports = { GameSession };
