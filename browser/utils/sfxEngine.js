/**
 * Lightweight SFX engine for browser UI.
 *
 * Notes:
 * - Audio files are under public/audio/se.
 * - Each selected SE can have independent volume and trim settings.
 * - Playback is best-effort; browser autoplay restrictions are handled by
 *   unlocking on the first user gesture and by only playing from user actions.
 */

const SELECTED_SFX = {
  uiTapBottle: {
    path: 'audio/se/ui_tap_bottle_01_3.mp3',
    volume: 1.10,
    start: 0,
    end: null
  },
  uiConfirmChime: {
    path: 'audio/se/ui_confirm_chime_01_3.mp3',
    volume: 0.30,
    start: 0,
    end: null
  },
  quizChoicePick: {
    path: 'audio/se/quiz_choice_pick_01_3.mp3',
    volume: 0.36,
    start: 0,
    end: 1.0
  },
  quizCorrectStarChime: {
    path: 'audio/se/quiz_correct_star_chime_01.mp3',
    volume: 0.46,
    start: 0,
    end: null
  },
  quizWrongSandTap: {
    path: 'audio/se/quiz_wrong_sand_tap_01_3.mp3',
    volume: 0.42,
    start: 0,
    end: null
  },
  workshopDayEnd: {
    path: 'audio/se/workshop_day_end_01_2.mp3',
    volume: 0.40,
    start: 0,
    end: null
  }
};

class SfxEngine {
  constructor(config = SELECTED_SFX) {
    this.config = config;
    this.enabled = true;
    this.volume = 1;
    this.unlocked = false;
    this.active = new Set();
  }

  unlock() {
    this.unlocked = true;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  setVolume(value) {
    this.volume = clampVolume(value, 1);
  }

  play(id) {
    if (!this.enabled || !this.unlocked) return;
    const spec = this.config[id];
    if (!spec || !spec.path) return;

    try {
      const audio = new Audio(spec.path);
      audio.volume = clampVolume(spec.volume, 0.4) * this.volume;
      audio.preload = 'auto';

      const cleanup = () => {
        audio.pause();
        audio.src = '';
        this.active.delete(audio);
      };

      const startPlayback = () => {
        if (typeof spec.start === 'number' && spec.start > 0) {
          audio.currentTime = spec.start;
        }

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => cleanup());
        }
      };

      if (typeof spec.end === 'number') {
        audio.addEventListener('timeupdate', () => {
          if (audio.currentTime >= spec.end) cleanup();
        });
      }

      audio.addEventListener('ended', cleanup, { once: true });
      audio.addEventListener('error', cleanup, { once: true });
      this.active.add(audio);
      startPlayback();
    } catch (e) {
      // SFX must never break gameplay.
    }
  }
}

function clampVolume(value, fallback = 0.4) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function createSfxEngine() {
  return new SfxEngine();
}

module.exports = {
  SELECTED_SFX,
  SfxEngine,
  createSfxEngine
};
