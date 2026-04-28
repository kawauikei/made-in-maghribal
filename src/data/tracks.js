/**
 * Audio Track Manifest for Made in Maghribal
 * 
 * Defines all BGM and SE tracks used in the game.
 */

export const TRACKS = {
  // --- Common BGM ---
  titleTheme: {
    id: "titleTheme",
    usage: "title_theme",
    src: "audio/bgm/common/title_theme.mp3",
    loop: true,
    title: "星瓶堂の幕開け"
  },
  workshopTheme: {
    id: "workshopTheme",
    usage: "workshop_day",
    src: "audio/bgm/common/workshop_theme.mp3",
    loop: true,
    title: "工房の日常"
  },
  quizBasic01: {
    id: "quizBasic01",
    usage: "quiz_basic",
    src: "audio/bgm/common/quiz_basic_01.mp3",
    loop: true,
    title: "目利きの時間"
  },

  // --- Heroine Themes (Placeholders) ---
  hakimaTheme: {
    id: "hakimaTheme",
    usage: "heroine_theme",
    src: "audio/bgm/hakima/hakima_theme.mp3",
    loop: true,
    title: "ハキマのテーマ"
  },
  miraTheme: {
    id: "miraTheme",
    usage: "heroine_theme",
    src: "audio/bgm/mira/mira_theme.mp3",
    loop: true,
    title: "ミラのテーマ"
  },
  dariyaTheme: {
    id: "dariyaTheme",
    usage: "heroine_theme",
    src: "audio/bgm/dariya/dariya_theme.mp3",
    loop: true,
    title: "ダリヤのテーマ"
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
