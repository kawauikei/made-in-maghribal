/**
 * Quiz / Rhythm screen for MadeInMaghribal.
 */

const { getCharacterIconPath } = require('../utils/assetPaths.js');
const { ITEM_DISPLAY_NAMES } = require('../data/itemDisplayNames.cjs');
const { AUDIO_MANIFEST } = require('../data/audioManifest.cjs');


const RHYTHM_VISUAL_BEAT_MS = 600;
const RHYTHM_VISUAL_TRAVEL_MS = 1800;
const RHYTHM_VISUAL_LOOKAHEAD_MS = 1800;
const RHYTHM_VISUAL_BEHIND_MS = 1800;
const RHYTHM_HIT_LEFT_PERCENT = 50;
const {
  loadRhythmNoteMaps,
  getRhythmMapForPath: getLoadedRhythmMapForPath,
  buildLoopedVisibleNotes
} = require('../utils/rhythmNoteMaps.js');
const RHYTHM_NOTE_MAPS = loadRhythmNoteMaps();

function getRhythmMapForController(controller) {
  const bgmState = controller?.getBgmState ? controller.getBgmState() : null;
  const path = bgmState?.currentPath || bgmState?.pendingPath || '';
  const noteMap = getLoadedRhythmMapForPath(RHYTHM_NOTE_MAPS, path);
  const audioTimeMs = Number(bgmState?.currentTimeMs);
  if (!noteMap || !Array.isArray(noteMap.notes) || !noteMap.notes.length || !Number.isFinite(audioTimeMs)) {
    return { noteMap: null, audioTimeMs: null, path };
  }
  return { noteMap, audioTimeMs, path };
}

function getRhythmVisualOrigin(controller, now) {
  if (!controller.quizState) return now;
  if (!controller.quizState.rhythmStartedAt) {
    controller.quizState.rhythmStartedAt = controller.quizState.promptShownAt || now;
  }
  controller.quizState.rhythmBeatIntervalMs = RHYTHM_VISUAL_BEAT_MS;
  return controller.quizState.rhythmStartedAt;
}

function noteLeftFromUntilHit(untilHit) {
  // untilHit === 0 is the center judgement point. Positive values are future
  // notes entering from the left; negative values are passed notes exiting right.
  return RHYTHM_HIT_LEFT_PERCENT - (untilHit / RHYTHM_VISUAL_TRAVEL_MS) * RHYTHM_HIT_LEFT_PERCENT;
}

function buildVisibleFallbackNotes(origin, now) {
  const notes = [];
  const firstBeat = Math.floor((now - origin - RHYTHM_VISUAL_BEHIND_MS) / RHYTHM_VISUAL_BEAT_MS);
  const lastBeat = Math.ceil((now - origin + RHYTHM_VISUAL_LOOKAHEAD_MS) / RHYTHM_VISUAL_BEAT_MS);

  for (let beat = firstBeat; beat <= lastBeat; beat += 1) {
    const targetTime = origin + beat * RHYTHM_VISUAL_BEAT_MS;
    const untilHit = targetTime - now;
    if (untilHit < -RHYTHM_VISUAL_BEHIND_MS || untilHit > RHYTHM_VISUAL_LOOKAHEAD_MS) continue;
    const left = Math.max(-8, Math.min(108, noteLeftFromUntilHit(untilHit)));
    notes.push({ beat, left, untilHit, strength: 0.65 });
  }

  return notes;
}

function buildVisibleAudioNotes(noteMap, audioTimeMs) {
  return buildLoopedVisibleNotes(noteMap, audioTimeMs, RHYTHM_VISUAL_BEHIND_MS, RHYTHM_VISUAL_LOOKAHEAD_MS)
    .map((note) => ({
      ...note,
      left: Math.max(-8, Math.min(108, noteLeftFromUntilHit(note.untilHit)))
    }));
}

function getNearestVisualNoteDiffMs(notes) {
  if (!notes.length) return Infinity;
  let best = notes[0].untilHit;
  for (const note of notes) {
    if (Math.abs(note.untilHit) < Math.abs(best)) best = note.untilHit;
  }
  return best;
}

function updateRhythmVisualFrame(controller) {
  if (!controller || !controller.container || controller.session?.subPhase !== 'QUIZ') return;
  const root = controller.container.querySelector('.rhythm-lane-placeholder');
  const layer = controller.container.querySelector('[data-rhythm-notes-layer]');
  if (!root || !layer) return;

  const now = performance.now();
  const origin = getRhythmVisualOrigin(controller, now);
  const rhythmMapState = getRhythmMapForController(controller);
  const notes = rhythmMapState.noteMap
    ? buildVisibleAudioNotes(rhythmMapState.noteMap, rhythmMapState.audioTimeMs)
    : buildVisibleFallbackNotes(origin, now);

  let pulse;
  if (rhythmMapState.noteMap) {
    const nearestDiff = Math.abs(getNearestVisualNoteDiffMs(notes));
    pulse = Math.max(0, 1 - nearestDiff / 180);
  } else {
    const beatInterval = controller.quizState?.rhythmBeatIntervalMs || RHYTHM_VISUAL_BEAT_MS;
    const beatPhase = ((now - origin) % beatInterval + beatInterval) % beatInterval;
    pulse = 1 - Math.min(1, beatPhase / 190);
    root.style.setProperty('--rhythm-phase', (beatPhase / beatInterval).toFixed(3));
  }

  root.style.setProperty('--rhythm-pulse', pulse.toFixed(3));

  layer.innerHTML = notes.map((note) => {
    const isNear = Math.abs(note.untilHit) <= 100 ? ' is-near' : '';
    const strength = Math.max(0.2, Math.min(1, note.strength || 0.65));
    return `<i class="rhythm-note-bar${isNear}" data-beat="${note.beat}" style="--note-left:${note.left.toFixed(2)}%; --note-strength:${strength.toFixed(2)};"></i>`;
  }).join('');

  controller.quizState.rhythmVisualFrameId = requestAnimationFrame(() => updateRhythmVisualFrame(controller));
}

function startRhythmVisual(controller) {
  if (!controller || !controller.quizState) return;
  const now = performance.now();
  getRhythmVisualOrigin(controller, now);
  if (controller.quizState.rhythmVisualFrameId) {
    cancelAnimationFrame(controller.quizState.rhythmVisualFrameId);
    controller.quizState.rhythmVisualFrameId = null;
  }
  updateRhythmVisualFrame(controller);
}

const QUALITY_LABELS = {
  normal: '通常',
  success: '高品質',
  great_success: '傑作'
};

function normalizeQuality(quality) {
  if (quality === 'great_success' || quality === 'success' || quality === 'normal') return quality;
  return 'normal';
}

function getQualityLabel(quality) {
  return QUALITY_LABELS[normalizeQuality(quality)];
}

function getChoiceMeta(choice = {}) {
  return ITEM_DISPLAY_NAMES[choice.id] || {};
}


function collectBgmTracks() {
  const tracks = [];
  const pushTrack = (track, categoryPath) => {
    if (!track || !track.path) return;
    tracks.push({
      path: track.path,
      title: track.title || track.id || track.path,
      categoryPath
    });
  };

  (AUDIO_MANIFEST?.bgm?.system || []).forEach((track, index) => {
    pushTrack(track, `bgm.system.${index}`);
  });

  const heroines = AUDIO_MANIFEST?.bgm?.heroines || {};
  Object.entries(heroines).forEach(([heroineId, group]) => {
    pushTrack(group?.theme, `bgm.heroines.${heroineId}.theme`);
    (group?.game || []).forEach((track, index) => {
      pushTrack(track, `bgm.heroines.${heroineId}.game.${index + 1}`);
    });
    Object.entries(group?.ending || {}).forEach(([endingKey, track]) => {
      pushTrack(track, `bgm.heroines.${heroineId}.ending.${endingKey}`);
    });
  });

  (AUDIO_MANIFEST?.bgm?.extra || []).forEach((track, index) => {
    const mood = track?.mood || 'extra';
    pushTrack(track, `bgm.extra.${mood}.${index + 1}`);
  });

  return tracks;
}

const BGM_TRACKS = collectBgmTracks();

function getCurrentBgmInfo(controller) {
  const bgmState = controller?.getBgmState ? controller.getBgmState() : null;
  const currentPath = bgmState?.currentPath || bgmState?.pendingPath || '';
  const track = BGM_TRACKS.find((entry) => entry.path === currentPath);
  if (!currentPath) {
    return { categoryPath: 'bgm.none', title: '未再生' };
  }
  return {
    categoryPath: track?.categoryPath || 'bgm.unknown',
    title: track?.title || currentPath
  };
}

function updateQuizTrackInfo(controller) {
  const trackEl = controller.container.querySelector('[data-quiz-track-info]');
  if (!trackEl) return;
  const bgmInfo = getCurrentBgmInfo(controller);
  trackEl.innerHTML = `
    <span class="quiz-track-category">♪ ${bgmInfo.categoryPath}</span>
    <strong class="quiz-track-title">${bgmInfo.title}</strong>
  `;
}

function getCustomerAppearanceLabel(q) {
  return q?.customerProfile?.label || q?.customerTypeLabel || '旅の客';
}

function getScoreExpression(controller) {
  const scores = controller?.session?.scores || {};
  const total = (scores.revenue || 0) + (scores.satisfaction || 0) + (scores.reputation || 0);
  if (total >= 90) return 'joy';
  if (total >= 25) return 'fun';
  return 'normal';
}

function renderQuiz(controller, view) {
  const expression = getScoreExpression(controller);
  view.innerHTML = `
    <div class="quiz-screen" data-screen="quiz">
      <div class="stats" data-hud></div>
      
      <section class="quiz-order-card">
        <div class="quiz-order-head">
          <span class="quiz-person-icon" aria-hidden="true"><span></span></span>
          <span class="quiz-order-label" data-quiz-customer-label>旅の客</span>
        </div>
        <div class="quiz-order-body">
          <div class="quiz-order-text" data-quiz-prompt></div>
          <div class="quiz-request-chip" data-quiz-quality-request></div>
        </div>
      </section>

      <section class="rhythm-lane-placeholder" aria-label="リズム判定エリア">
        <div class="rhythm-party-face rhythm-party-face-left">
          <img data-quiz-nadir-face src="${getCharacterIconPath('NADIR', expression)}" alt="ナーディル" onerror="this.style.display='none'" />
        </div>
        <div class="rhythm-water-shine" aria-hidden="true"></div>
        <div class="rhythm-notes-layer" data-rhythm-notes-layer aria-hidden="true"></div>
        <div class="rhythm-judge-center" aria-hidden="true">
          <div class="rhythm-beat-ring" data-rhythm-beat-ring></div>
          <div class="rhythm-beat-core" data-rhythm-beat-core></div>
        </div>
        <div class="rhythm-party-face rhythm-party-face-right">
          <img data-quiz-heroine-face src="${getCharacterIconPath(controller.session.selectedHeroineId || 'HAKIMA', expression)}" alt="" onerror="this.style.display='none'" />
        </div>
      </section>

      <section class="choice-list">
        <div class="choice-card" data-choice-slot="0">
          <div class="item-icon-wrap">
            <img class="item-icon" alt="" loading="eager" />
          </div>
          <div class="choice-name"></div>
          <div class="choice-meta" aria-label="品物情報">
            <span data-choice-principle></span>
            <span data-choice-type></span>
            <span data-choice-genre></span>
            <strong data-choice-quality></strong>
          </div>
        </div>
        <div class="choice-card" data-choice-slot="1">
          <div class="item-icon-wrap">
            <img class="item-icon" alt="" loading="eager" />
          </div>
          <div class="choice-name"></div>
          <div class="choice-meta" aria-label="品物情報">
            <span data-choice-principle></span>
            <span data-choice-type></span>
            <span data-choice-genre></span>
            <strong data-choice-quality></strong>
          </div>
        </div>
      </section>

      <section class="quiz-status-panel" aria-label="接客状況">
        <div class="quiz-progress" data-quiz-progress></div>
        <div class="score-strip" data-score-strip></div>
        <div class="quiz-track-info" data-quiz-track-info></div>
      </section>
    </div>
  `;
  updateQuizContent(controller);
}

function updateFaceExpressions(controller) {
  const expression = getScoreExpression(controller);
  const nadirFaceEl = controller.container.querySelector('[data-quiz-nadir-face]');
  if (nadirFaceEl) nadirFaceEl.src = getCharacterIconPath('NADIR', expression);

  const heroineFaceEl = controller.container.querySelector('[data-quiz-heroine-face]');
  if (heroineFaceEl && controller.session.selectedHeroineId) {
    heroineFaceEl.src = getCharacterIconPath(controller.session.selectedHeroineId, expression);
  }
}

function updateQuizContent(controller) {
  const q = controller.quizState.currentQuestion;
  const screenEl = controller.container.querySelector('.quiz-screen');
  const promptEl = controller.container.querySelector('[data-quiz-prompt]');
  const qualityRequestEl = controller.container.querySelector('[data-quiz-quality-request]');
  const progressEl = controller.container.querySelector('[data-quiz-progress]');
  const customerLabelEl = controller.container.querySelector('[data-quiz-customer-label]');
  if (screenEl) {
    screenEl.setAttribute('data-input-locked', controller.quizState.inputLocked ? 'true' : 'false');
    screenEl.setAttribute('data-question-index', String(controller.quizState.questionIndex || 0));
    screenEl.setAttribute('data-total-questions', String(controller.quizState.totalQuestions || 0));
  }
  
  if (!q) {
    if (promptEl) promptEl.textContent = '接客の準備中です。';
    if (customerLabelEl) customerLabelEl.textContent = '旅の客';
    if (qualityRequestEl) qualityRequestEl.textContent = '';
    if (progressEl) progressEl.textContent = `0 / ${controller.quizState.totalQuestions}`;
    updateFaceExpressions(controller);
    controller.updateHud();
    updateQuizTrackInfo(controller);
    return;
  }

  if (promptEl) promptEl.textContent = q.promptText;
  if (customerLabelEl) customerLabelEl.textContent = getCustomerAppearanceLabel(q);
  const personIconEl = controller.container.querySelector('.quiz-person-icon');
  if (personIconEl) {
    personIconEl.setAttribute('data-customer-tone', q.customerIconTone || q.customerProfile?.iconTone || 'amber');
    personIconEl.setAttribute('title', q.customerProfile?.label || '客');
  }
  if (qualityRequestEl) {
    qualityRequestEl.textContent = '';
  }
  if (progressEl) progressEl.textContent = `${controller.quizState.questionIndex + 1} / ${controller.quizState.totalQuestions}`;

  updateFaceExpressions(controller);

  const choices = controller.quizState.currentChoices;
  choices.forEach((c, idx) => {
    const card = controller.container.querySelector(`[data-choice-slot="${idx}"]`);
    if (card) {
      const quality = normalizeQuality(c.quality);
      const meta = getChoiceMeta(c);
      card.setAttribute('data-item-id', c.id);
      card.setAttribute('data-item-quality', quality);
      card.setAttribute('data-quality', quality);
      const nameEl = card.querySelector('.choice-name');
      const iconEl = card.querySelector('.item-icon');
      const wrapEl = card.querySelector('.item-icon-wrap');
      const principleEl = card.querySelector('[data-choice-principle]');
      const typeEl = card.querySelector('[data-choice-type]');
      const genreEl = card.querySelector('[data-choice-genre]');
      const qualityEl = card.querySelector('[data-choice-quality]');

      if (nameEl) nameEl.textContent = c.name;
      if (principleEl) principleEl.textContent = `術理：${meta.principleName || meta.principle || '不明'}`;
      if (typeEl) typeEl.textContent = `品目：${meta.itemTypeName || meta.itemType || '不明'}`;
      if (genreEl) genreEl.textContent = `分類：${meta.genreName || meta.genre || '不明'}`;
      if (qualityEl) qualityEl.textContent = `品質：${getQualityLabel(quality)}`;
      if (iconEl) {
        iconEl.style.display = '';
        iconEl.src = controller.getItemIconPath(c.id);
        iconEl.onerror = () => {
          iconEl.style.display = 'none';
          if (wrapEl) wrapEl.classList.add('missing-icon');
        };
      }
      if (wrapEl) {
        wrapEl.classList.remove('missing-icon');
        wrapEl.setAttribute('data-quality', quality);
      }
    }
  });

  // Ensure HUD (and thus the detached score strip) is updated with current session scores.
  controller.updateHud();
  updateQuizTrackInfo(controller);
  startRhythmVisual(controller);
}

module.exports = {
  renderQuiz,
  updateQuizContent
};
