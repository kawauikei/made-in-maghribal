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
    src: "audio/bgm/hakima/hakima04_game_c.mp3",
    loop: true,
    title: "Saffron and Silk"
  },
  "HAKIMA-05": {
    id: "HAKIMA-05",
    src: "audio/bgm/hakima/hakima05_game_d.mp3",
    loop: true,
    title: "Golden Hour Market"
  },
  "HAKIMA-06": {
    id: "HAKIMA-06",
    src: "audio/bgm/hakima/hakima06_ending.mp3",
    loop: true,
    title: "Morning Beside You"
  },
  "HAKIMA-07": {
    id: "HAKIMA-07",
    src: "audio/bgm/hakima/hakima07_ending2.mp3",
    loop: true,
    title: "Sunset Promises"
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
    src: "audio/bgm/mira/mira04_game_c.mp3",
    loop: true,
    title: "Logic and Lace"
  },
  "MIRA-05": {
    id: "MIRA-05",
    src: "audio/bgm/mira/mira05_game_d.mp3",
    loop: true,
    title: "Starlight Solution"
  },
  "MIRA-06": {
    id: "MIRA-06",
    src: "audio/bgm/mira/mira06_ending.mp3",
    loop: true,
    title: "Finally Just Me"
  },
  "MIRA-07": {
    id: "MIRA-07",
    src: "audio/bgm/mira/mira07_ending2.mp3",
    loop: true,
    title: "The Tomorrow We Found"
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
    src: "audio/bgm/dariya/dariya04_game_c.mp3",
    loop: true,
    title: "Royal Reflection"
  },
  "DARIYA-05": {
    id: "DARIYA-05",
    src: "audio/bgm/dariya/dariya05_game_d.mp3",
    loop: true,
    title: "The Bureaucrat's Dream"
  },
  "DARIYA-06": {
    id: "DARIYA-06",
    src: "audio/bgm/dariya/dariya06_ending.mp3",
    loop: true,
    title: "Tea Under the Rising Sun"
  },
  "DARIYA-07": {
    id: "DARIYA-07",
    src: "audio/bgm/dariya/dariya07_ending2.mp3",
    loop: true,
    title: "Quiet Moonlight"
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
