/**
 * Debug jump utilities for MadeInMaghribal.
 */

function isDebugMode() {
  return new URLSearchParams(window.location.search).get('debug') === '1';
}

function applyDebugJumpFromUrl(controller) {
  if (!isDebugMode()) return;
  const params = new URLSearchParams(window.location.search);
  const jump = params.get('jump');
  if (!jump) return;
  applyDebugJump(controller, jump);
}

function applyDebugJump(controller, jump) {
  const params = new URLSearchParams(window.location.search);
  const heroine = (params.get('heroine') || 'HAKIMA').toUpperCase();
  console.log('Applying debug jump:', jump);

  if (jump === 'title') {
    controller.session.phase = 'TITLE';
    return;
  }

  if (jump === 'opening') {
    controller.session.phase = 'OPENING';
    return;
  }

  if (jump === 'heroine_select') {
    controller.session.phase = 'HEROINE_SELECT';
    return;
  }

  if (jump === 'before_open') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = Number(params.get('turn') || 1);
    controller.session.subPhase = 'BEFORE_OPEN';
    controller.session.scores = { revenue: 0, satisfaction: 0, reputation: 0 };
    return;
  }

  if (jump === 'after_close') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = Number(params.get('turn') || 1);
    controller.session.subPhase = 'AFTER_CLOSE';
    controller.session.scores = { revenue: 80, satisfaction: 14, reputation: 9 };
    return;
  }

  if (jump === 'quiz') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = 1;
    controller.session.subPhase = 'QUIZ';
    controller.startQuiz();
    return;
  }

  if (jump === 'turn_result') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = Number(params.get('turn') || 1);
    controller.session.subPhase = 'TURN_RESULT';
    controller.session.scores = { revenue: 80, satisfaction: 14, reputation: 9 };
    controller.quizState.turnStartScore = { revenue: 0, satisfaction: 0, reputation: 0 };
    controller.quizState.lastResult = {
      isCorrect: true,
      rating: 'GOOD',
      satisfactionBonus: 2,
      reputationBonus: 1,
      diffMs: 88,
      responseTime: 1200
    };
    return;
  }


  if (jump === 'result_encourage' || jump === 'result_evaluate' || jump === 'result_surprise' || jump === 'result_low' || jump === 'result_mid' || jump === 'result_high') {
    const presets = {
      result_encourage: { revenue: 10, satisfaction: 4, reputation: 3 },
      result_evaluate: { revenue: 40, satisfaction: 14, reputation: 10 },
      result_surprise: { revenue: 80, satisfaction: 20, reputation: 16 },
      result_low: { revenue: 10, satisfaction: 4, reputation: 3 },
      result_mid: { revenue: 40, satisfaction: 14, reputation: 10 },
      result_high: { revenue: 80, satisfaction: 20, reputation: 16 }
    };
    const score = presets[jump];
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = Number(params.get('turn') || 1);
    controller.session.subPhase = 'TURN_RESULT';
    controller.session.scores = { ...score };
    controller.quizState.turnStartScore = { revenue: 0, satisfaction: 0, reputation: 0 };
    controller.quizState.lastResult = {
      isCorrect: jump !== 'result_encourage',
      rating: (jump === 'result_surprise' || jump === 'result_high') ? 'GREAT' : ((jump === 'result_evaluate' || jump === 'result_mid') ? 'GOOD' : 'MISS'),
      satisfactionBonus: score.satisfaction,
      reputationBonus: score.reputation,
      diffMs: 80,
      responseTime: 1200
    };
    return;
  }

  if (jump === 'turn5_after_close') {
    controller.session.phase = 'MAIN_GAME';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = 5;
    controller.session.subPhase = 'AFTER_CLOSE';
    controller.session.scores = { revenue: 420, satisfaction: 80, reputation: 70 };
    return;
  }

  if (jump === 'ending_good') {
    controller.session.phase = 'ENDING';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = 5;
    controller.session.subPhase = 'AFTER_CLOSE';
    controller.session.scores = { revenue: 500, satisfaction: 100, reputation: 100 };
    return;
  }

  if (jump === 'ending_normal') {
    controller.session.phase = 'ENDING';
    controller.session.selectedHeroineId = heroine;
    controller.session.routeMode = 'normal';
    controller.session.turn = 5;
    controller.session.subPhase = 'AFTER_CLOSE';
    controller.session.scores = { revenue: 100, satisfaction: 10, reputation: 10 };
    return;
  }

  console.warn('Unknown debug jump:', jump);
}

module.exports = {
  isDebugMode,
  applyDebugJumpFromUrl,
  applyDebugJump
};
