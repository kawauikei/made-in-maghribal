/**
 * Audio Manifest for MadeInMaghribal project.
 * Verified against actual filesystem paths in public/audio/.
 */
const AUDIO_MANIFEST = {
  bgm: {
    system: [
      { id: 'main01_title', title: 'Title Theme', path: 'audio/bgm/main/main01_title.mp3' },
      { id: 'main02_shop', title: 'Daily Alchemy Shop', path: 'audio/bgm/main/main02_shop.mp3' },
      { id: 'main03_puzzle', title: 'Mixing Rhythms', path: 'audio/bgm/main/main03_puzzle.mp3' }
    ],
    heroines: {
      HAKIMA: {
        theme: { id: 'BGM_THEME_HAKIMA', path: 'audio/bgm/hakima/hakima01_theme.mp3' },
        game: [
          { id: 'BGM_GAME_HAKIMA_1', path: 'audio/bgm/hakima/hakima02_game_a.mp3' },
          { id: 'BGM_GAME_HAKIMA_2', path: 'audio/bgm/hakima/hakima03_game_b.mp3' },
          { id: 'BGM_GAME_HAKIMA_3', path: 'audio/bgm/hakima/hakima04_game_c.mp3' },
          { id: 'BGM_GAME_HAKIMA_4', path: 'audio/bgm/hakima/hakima05_game_d.mp3' }
        ],
        ending: { 
          normal: { id: 'BGM_ED_HAKIMA_NORMAL', path: 'audio/bgm/hakima/hakima06_ending.mp3' },
          good: { id: 'BGM_ED_HAKIMA_GOOD', path: 'audio/bgm/hakima/hakima07_ending2.mp3' }
        }
      },
      MIRA: {
        theme: { id: 'BGM_THEME_MIRA', path: 'audio/bgm/mira/mira01_theme.mp3' },
        game: [
          { id: 'BGM_GAME_MIRA_1', path: 'audio/bgm/mira/mira02_game_a.mp3' },
          { id: 'BGM_GAME_MIRA_2', path: 'audio/bgm/mira/mira03_game_b.mp3' },
          { id: 'BGM_GAME_MIRA_3', path: 'audio/bgm/mira/mira04_game_c.mp3' },
          { id: 'BGM_GAME_MIRA_4', path: 'audio/bgm/mira/mira05_game_d.mp3' }
        ],
        ending: { 
          normal: { id: 'BGM_ED_MIRA_NORMAL', path: 'audio/bgm/mira/mira06_ending.mp3' },
          good: { id: 'BGM_ED_MIRA_GOOD', path: 'audio/bgm/mira/mira07_ending2.mp3' }
        }
      },
      DARIYA: {
        theme: { id: 'BGM_THEME_DARIYA', path: 'audio/bgm/dariya/dariya01_theme.mp3' },
        game: [
          { id: 'BGM_GAME_DARIYA_1', path: 'audio/bgm/dariya/dariya02_game_a.mp3' },
          { id: 'BGM_GAME_DARIYA_2', path: 'audio/bgm/dariya/dariya03_game_b.mp3' },
          { id: 'BGM_GAME_DARIYA_3', path: 'audio/bgm/dariya/dariya04_game_c.mp3' },
          { id: 'BGM_GAME_DARIYA_4', path: 'audio/bgm/dariya/dariya05_game_d.mp3' }
        ],
        ending: { 
          normal: { id: 'BGM_ED_DARIYA_NORMAL', path: 'audio/bgm/dariya/dariya06_ending.mp3' },
          good: { id: 'BGM_ED_DARIYA_GOOD', path: 'audio/bgm/dariya/dariya07_ending2.mp3' }
        }
      }
    },
    extra: [
      { id: 'BGM_EXTRA_JOY', mood: 'joy', path: 'audio/bgm/extra/joy1.mp3' },
      { id: 'BGM_EXTRA_FUN', mood: 'fun', path: 'audio/bgm/extra/fun1.mp3' },
      { id: 'BGM_EXTRA_SORROW', mood: 'sorrow', path: 'audio/bgm/extra/sorrow1.mp3' },
      { id: 'BGM_EXTRA_ANGER', mood: 'anger', path: 'audio/bgm/extra/anger1.mp3' },
      { id: 'BGM_EXTRA_SURPRISE', mood: 'surprise', path: 'audio/bgm/extra/surprise1.mp3' }
    ]
  },
  se: {
    quiz: [
      { id: 'SE_QUIZ_CORRECT', path: 'audio/se/quiz_correct_star_chime_01.mp3' },
      { id: 'SE_QUIZ_WRONG', path: 'audio/se/quiz_wrong_sand_tap_01.mp3' },
      { id: 'SE_QUIZ_TICK', path: 'audio/se/quiz_choice_pick_01.mp3' }
    ],
    ui: [
      { id: 'SE_UI_DECIDE', path: 'audio/se/ui_confirm_chime_01.mp3' },
      { id: 'SE_UI_TAP', path: 'audio/se/ui_tap_bottle_01.mp3' }
    ],
    day_end: [
      { id: 'SE_DAY_END_REST', path: 'audio/se/workshop_day_end_01.mp3' }
    ]
  }
};

module.exports = { AUDIO_MANIFEST };
