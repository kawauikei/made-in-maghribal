/**
 * Audio Track Manifest for Made in Maghribal
 * 
 * Defines all BGM and SE tracks used in the game.
 */

export const TRACKS = {
  // --- Main BGM ---
  "MAIN-01": {
    id: "MAIN-01",
    src: "audio/bgm/main/main01_title.mp3",
    loop: true,
    title: "Alchemy Shop in the Desert"
  },
  "MAIN-02": {
    id: "MAIN-02",
    src: "audio/bgm/main/main02_shop.mp3",
    loop: true,
    title: "Spice Market Breeze"
  },
  "MAIN-03": {
    id: "MAIN-03",
    src: "audio/bgm/main/main03_puzzle.mp3",
    loop: true,
    title: "Measure The Mortar"
  },

  // --- Hakima ---
  "HAKIMA-01": {
    id: "HAKIMA-01",
    src: "audio/bgm/hakima/hakima01_theme.mp3",
    loop: true,
    title: "Two Cups of Cardamom"
  },
  "HAKIMA-02": {
    id: "HAKIMA-02",
    src: "audio/bgm/hakima/hakima02_game_a.mp3",
    loop: true,
    title: "Copper and Cumin"
  },
  "HAKIMA-03": {
    id: "HAKIMA-03",
    src: "audio/bgm/hakima/hakima03_game_b.mp3",
    loop: true,
    title: "Copper and Sand"
  },
  "HAKIMA-04": {
    id: "HAKIMA-04",
    src: "audio/bgm/hakima/hakima04_ending.mp3",
    loop: true,
    title: "Morning Beside You"
  },

  // --- Mira ---
  "MIRA-01": {
    id: "MIRA-01",
    src: "audio/bgm/mira/mira01_theme.mp3",
    loop: true,
    title: "The Glass Bottle Genius"
  },
  "MIRA-02": {
    id: "MIRA-02",
    src: "audio/bgm/mira/mira02_game_a.mp3",
    loop: true,
    title: "The Alchemist's Arithmetic"
  },
  "MIRA-03": {
    id: "MIRA-03",
    src: "audio/bgm/mira/mira03_game_b.mp3",
    loop: true,
    title: "Proof of the Prodigy"
  },
  "MIRA-04": {
    id: "MIRA-04",
    src: "audio/bgm/mira/mira04_ending.mp3",
    loop: true,
    title: "Finally Just Me"
  },

  // --- Dariya ---
  "DARIYA-01": {
    id: "DARIYA-01",
    src: "audio/bgm/dariya/dariya01_theme.mp3",
    loop: true,
    title: "Tea and Copper Stills"
  },
  "DARIYA-02": {
    id: "DARIYA-02",
    src: "audio/bgm/dariya/dariya02_game_a.mp3",
    loop: true,
    title: "The Alchemist's Ledger"
  },
  "DARIYA-03": {
    id: "DARIYA-03",
    src: "audio/bgm/dariya/dariya03_game_b.mp3",
    loop: true,
    title: "Clockwork Gambit"
  },
  "DARIYA-04": {
    id: "DARIYA-04",
    src: "audio/bgm/dariya/dariya04_ending.mp3",
    loop: true,
    title: "Tea Under the Rising Sun"
  }
};

/**
 * Get track data by its unique ID
 */
export function getTrackById(id) {
  return TRACKS[id] || null;
}

/**
 * Get the theme track for a specific heroine
 */
export function getHeroineThemeTrack(heroine) {
  if (!heroine || !heroine.themeTrackId) return null;
  return getTrackById(heroine.themeTrackId);
}
