/**
 * Simple Audio Engine for Made in Maghribal
 * 
 * Manages background music using HTMLAudioElement.
 */

class SimpleAudioEngine {
  constructor() {
    this.audio = null;
    this.currentTrackId = null;
    this.isMuted = false;
    this.volume = 0.5;
    this.baseUrl = import.meta.env.BASE_URL || "/";
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
      this.audio.volume = this.volume;
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
   * Set global volume (0.0 to 1.0)
   * @param {number} value 
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  /**
   * Check if currently playing
   */
  isPlaying() {
    return !!this.audio && !this.audio.paused;
  }
}

// Export as a singleton for easy access across the app
export const audioEngine = new SimpleAudioEngine();
