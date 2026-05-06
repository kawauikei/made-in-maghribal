/**
 * Lightweight BGM engine for MadeInMaghribal.
 *
 * Browser policy:
 * - BGM is selected before user input, but playback starts only after unlock().
 * - If the requested track is already playing, it is kept running.
 * - BGM is exclusive: rapid clicks/phase changes must never leave old tracks playing.
 * - Volume is intentionally modest; tune here later if needed.
 */

const { AUDIO_MANIFEST } = require('../data/audioManifest.cjs');
const { calculateAffection } = require('../core/affectionModel.cjs');
const { evaluateEnding } = require('../core/endingBranch.cjs');

const DEFAULT_BGM_VOLUME = 0.22;
const BGM_FADE_OUT_MS = 260;
const BGM_FADE_IN_MS = 420;
const BGM_FADE_STEP_MS = 40;

function findSystemTrack(id) {
  return (AUDIO_MANIFEST?.bgm?.system || []).find((track) => track.id === id) || null;
}

function getHeroineBgm(heroineId) {
  const id = heroineId || 'HAKIMA';
  return AUDIO_MANIFEST?.bgm?.heroines?.[id] || AUDIO_MANIFEST?.bgm?.heroines?.HAKIMA || null;
}

function getGameTrack(heroineId, turn = 1) {
  if (turn <= 1) return findSystemTrack('main03_puzzle');
  const heroine = getHeroineBgm(heroineId);
  const gameTracks = heroine?.game || [];
  if (!gameTracks.length) return findSystemTrack('main03_puzzle');
  const index = Math.max(0, (turn - 2) % gameTracks.length);
  return gameTracks[index];
}

function getEndingTrack(session) {
  const heroine = getHeroineBgm(session?.selectedHeroineId);
  const affection = calculateAffection(session?.scores || {});
  const endingType = evaluateEnding(affection, session?.routeMode === 'extra');
  return endingType === 'GOOD' ? heroine?.ending?.good : heroine?.ending?.normal;
}

function getTrackForSession(session) {
  if (!session) return findSystemTrack('main01_title');
  const phase = session.phase;
  const subPhase = session.subPhase;

  if (phase === 'TITLE' || phase === 'OPENING' || phase === 'HEROINE_SELECT') {
    return findSystemTrack('main01_title');
  }

  if (phase === 'ENDING') {
    return getEndingTrack(session) || findSystemTrack('main02_shop');
  }

  if (phase === 'MAIN_GAME') {
    if (subPhase === 'QUIZ') {
      return getGameTrack(session.selectedHeroineId, session.turn);
    }
    return findSystemTrack('main02_shop');
  }

  return findSystemTrack('main01_title');
}

function createBgmEngine(options = {}) {
  const baseVolume = options.volume ?? DEFAULT_BGM_VOLUME;
  let unlocked = false;
  let currentAudio = null;
  let currentPath = '';
  let pendingTrack = null;
  let requestSerial = 0;
  let pendingStartTimer = null;
  const managedAudios = new Set();
  const fadeTimers = new Map();

  function clearFadeTimer(audio) {
    const timerId = fadeTimers.get(audio);
    if (timerId) window.clearInterval(timerId);
    fadeTimers.delete(audio);
  }

  function clearPendingStart() {
    if (pendingStartTimer) {
      window.clearTimeout(pendingStartTimer);
      pendingStartTimer = null;
    }
  }

  function stopAudio(audio) {
    if (!audio) return;
    clearFadeTimer(audio);
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();
    } catch (error) {
      console.warn('Failed to stop BGM audio:', error);
    }
    managedAudios.delete(audio);
  }

  function fadeOutAndStop(audio, durationMs = BGM_FADE_OUT_MS) {
    if (!audio) return;
    clearFadeTimer(audio);

    if (audio.paused || durationMs <= 0) {
      stopAudio(audio);
      return;
    }

    const startVolume = Number.isFinite(audio.volume) ? audio.volume : baseVolume;
    const startedAt = Date.now();
    const timerId = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
      audio.volume = Math.max(0, startVolume * (1 - progress));
      if (progress >= 1) stopAudio(audio);
    }, BGM_FADE_STEP_MS);
    fadeTimers.set(audio, timerId);
  }

  function fadeIn(audio, token, durationMs = BGM_FADE_IN_MS) {
    if (!audio || durationMs <= 0) {
      if (audio) audio.volume = baseVolume;
      return;
    }

    clearFadeTimer(audio);
    audio.volume = 0;
    const startedAt = Date.now();
    const timerId = window.setInterval(() => {
      if (token !== requestSerial || currentAudio !== audio) {
        stopAudio(audio);
        return;
      }
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
      audio.volume = Math.min(baseVolume, baseVolume * progress);
      if (progress >= 1) {
        clearFadeTimer(audio);
        audio.volume = baseVolume;
      }
    }, BGM_FADE_STEP_MS);
    fadeTimers.set(audio, timerId);
  }

  function stopAllExcept(audioToKeep = null, fade = false) {
    Array.from(managedAudios).forEach((audio) => {
      if (audio === audioToKeep) return;
      if (fade) fadeOutAndStop(audio);
      else stopAudio(audio);
    });
  }

  function createAndPlayAudio(track, token) {
    if (token !== requestSerial || !track?.path) return;

    const audio = new Audio(track.path);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;

    currentAudio = audio;
    currentPath = track.path;
    managedAudios.add(audio);

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          if (token !== requestSerial || currentAudio !== audio) {
            stopAudio(audio);
            return;
          }
          fadeIn(audio, token);
        })
        .catch((error) => {
          console.warn('BGM playback deferred:', error);
          if (token === requestSerial) {
            pendingTrack = track;
            if (currentAudio === audio) {
              currentAudio = null;
              currentPath = '';
            }
          }
          stopAudio(audio);
        });
    } else {
      fadeIn(audio, token);
    }
  }

  function startTrack(track) {
    if (!track?.path) return;

    const nextPath = track.path;
    pendingTrack = track;

    if (currentPath === nextPath && currentAudio && !currentAudio.paused) return;

    requestSerial += 1;
    const token = requestSerial;
    clearPendingStart();

    const hadActiveAudio = Array.from(managedAudios).some((audio) => audio && !audio.paused);

    // BGM remains exclusive. Old tracks fade out first, then the newest request
    // starts. Rapid requests invalidate older timers via requestSerial.
    stopAllExcept(null, true);
    currentAudio = null;
    currentPath = nextPath;

    const delay = hadActiveAudio ? BGM_FADE_OUT_MS : 0;
    pendingStartTimer = window.setTimeout(() => {
      pendingStartTimer = null;
      createAndPlayAudio(track, token);
    }, delay);
  }

  function play(track) {
    if (!track?.path) return;
    pendingTrack = track;
    if (!unlocked) return;
    startTrack(track);
  }

  function playForSession(session) {
    play(getTrackForSession(session));
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (pendingTrack) startTrack(pendingTrack);
  }

  function stop() {
    requestSerial += 1;
    clearPendingStart();
    stopAllExcept(null);
    currentAudio = null;
    currentPath = '';
    pendingTrack = null;
  }

  function getState() {
    return {
      unlocked,
      currentPath,
      pendingPath: pendingTrack?.path || '',
      managedAudioCount: managedAudios.size,
      volume: baseVolume,
      fadeOutMs: BGM_FADE_OUT_MS,
      fadeInMs: BGM_FADE_IN_MS
    };
  }

  return {
    unlock,
    play,
    playForSession,
    stop,
    getState
  };
}

module.exports = {
  createBgmEngine,
  getTrackForSession
};
