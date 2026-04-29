import { SFX_CANDIDATES, SELECTED_SFX } from '../data/sfxCandidates';

const clampVolume = (value, fallback = 0.8) => {
  if (typeof value !== 'number' && typeof value !== 'string') return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
};

/**
 * Simple Audio Engine for Made in Maghribal
 * 
 * Manages background music using HTMLAudioElement.
 */

class SimpleAudioEngine {
  constructor() {
    this.audio = null;
    this.lastSfx = null;
    this.currentTrackId = null;
    this.isMuted = false;
    this.bgmVolume = 0.8;
    this.seVolume = 0.8;
    this.volume = this.bgmVolume;
    this.baseUrl = import.meta.env.BASE_URL || "/";
    if (typeof window !== 'undefined') {
      window.__madeInMaghribalAudioEngine = this;
    }
  }

  /**
   * Play a track by its manifest data
   * @param {Object} track - Track object from tracks.js
   */
  playTrack(track) {
    if (!track || !track.src) {
      this.stop();
      return;
    }

    if (this.currentTrackId === track.id) return;

    this.stop();

    const fullSrc = `${this.baseUrl}${track.src}`.replace(/([^:])\/\//g, '$1/');
    
    try {
      this.audio = new Audio(fullSrc);
      this.audio.loop = track.loop || false;
      this.audio.volume = this.bgmVolume;
      this.audio.muted = this.isMuted;
      
      this.audio.play().catch(err => {
        // Autoplay restriction or file not found
        console.warn(`Audio playback failed for ${track.id}:`, err.message);
        this.stop();
      });

      this.currentTrackId = track.id;
    } catch (err) {
      console.error(`Failed to create Audio object for ${track.id}:`, err);
    }
  }

  /**
   * Stop the current track and cleanup
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.currentTrackId = null;
  }

  /**
   * Toggle mute state
   * @param {boolean} muted 
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (this.audio) {
      this.audio.muted = muted;
    }
  }

  /**
   * Set BGM volume (0.0 to 1.0)
   * @param {number} value 
   */
  setBgmVolume(value) {
    this.bgmVolume = clampVolume(value);
    this.volume = this.bgmVolume;
    if (this.audio) {
      this.audio.volume = this.bgmVolume;
    }
  }

  /**
   * Set SE volume (0.0 to 1.0)
   * @param {number} value
   */
  setSeVolume(value) {
    this.seVolume = clampVolume(value);
  }

  /**
   * Backward-compatible alias for callers that expect a single global volume.
   * @param {number} value
   */
  setVolume(value) {
    this.setBgmVolume(value);
    this.setSeVolume(value);
  }

  /**
   * Check if currently playing
   */
  isPlaying() {
    return !!this.audio && !this.audio.paused;
  }

  /**
   * Play an SFX candidate (used in Sound Test)
   * @param {string} candidateId 
   */
  playSfxCandidate(candidateId) {
    if (this.isMuted) return;

    const candidate = SFX_CANDIDATES.find(c => c.id === candidateId);
    if (!candidate) {
      console.warn(`SFX candidate not found: ${candidateId}`);
      return;
    }

    const fullSrc = `${this.baseUrl}${candidate.src}`.replace(/([^:])\/\//g, '$1/');
    
    try {
      const sfx = new Audio(fullSrc);
      
      // Candidate specific volume scaled by global volume
      // SFX often need slightly higher weight to be audible over BGM
      const targetVol = (candidate.volume || 1.0) * this.seVolume * 1.5; 
      sfx.volume = Math.max(0, Math.min(1, targetVol));
      
      if (candidate.start) {
        sfx.currentTime = candidate.start;
      }

      // Handle end point
      if (candidate.end !== null && typeof candidate.end === 'number') {
        const checkEnd = () => {
          if (sfx.currentTime >= candidate.end) {
            sfx.pause();
            sfx.removeEventListener('timeupdate', checkEnd);
          }
        };
        sfx.addEventListener('timeupdate', checkEnd);
      }

      sfx.play().catch(err => {
        console.warn(`SFX playback failed for candidate ${candidateId}:`, err.message);
      });
      this.lastSfx = sfx;
    } catch (err) {
      console.error(`Failed to create SFX Audio object for candidate ${candidateId}:`, err);
    }
  }

  /**
   * Preload a track to warm up the cache
   * @param {Object} track - Track object from tracks.js
   */
  preloadTrack(track) {
    if (!track || !track.src) return;
    const fullSrc = `${this.baseUrl}${track.src}`.replace(/([^:])\/\//g, '$1/');
    try {
      const audio = new Audio(fullSrc);
      audio.preload = "auto";
    } catch (err) {
      console.warn(`Preload failed for ${track.id}:`, err);
    }
  }

  /**
   * Play a production-selected SFX by its functional key
   * @param {string} sfxKey - Key in SELECTED_SFX (e.g. "uiTapBottle")
   */
  playSfx(sfxKey) {
    if (this.isMuted) return;
    
    const candidateId = SELECTED_SFX[sfxKey];
    if (!candidateId) {
      console.warn(`No production SFX selected for key: ${sfxKey}`);
      return;
    }

    this.playSfxCandidate(candidateId);
  }
}

// Export as a singleton for easy access across the app
export const audioEngine = new SimpleAudioEngine();
