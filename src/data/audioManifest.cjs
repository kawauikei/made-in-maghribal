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
      { id: 'BGM_EXTRA_JOY_1', mood: 'joy', variant: 1, title: 'joy 1', path: 'audio/bgm/extra/joy1.mp3' },
      { id: 'BGM_EXTRA_JOY_2', mood: 'joy', variant: 2, title: 'joy 2', path: 'audio/bgm/extra/joy2.mp3' },
      { id: 'BGM_EXTRA_FUN_1', mood: 'fun', variant: 1, title: 'fun 1', path: 'audio/bgm/extra/fun1.mp3' },
      { id: 'BGM_EXTRA_FUN_2', mood: 'fun', variant: 2, title: 'fun 2', path: 'audio/bgm/extra/fun2.mp3' },
      { id: 'BGM_EXTRA_SORROW_1', mood: 'sorrow', variant: 1, title: 'sorrow 1', path: 'audio/bgm/extra/sorrow1.mp3' },
      { id: 'BGM_EXTRA_SORROW_2', mood: 'sorrow', variant: 2, title: 'sorrow 2', path: 'audio/bgm/extra/sorrow2.mp3' },
      { id: 'BGM_EXTRA_ANGER_1', mood: 'anger', variant: 1, title: 'anger 1', path: 'audio/bgm/extra/anger1.mp3' },
      { id: 'BGM_EXTRA_ANGER_2', mood: 'anger', variant: 2, title: 'anger 2', path: 'audio/bgm/extra/anger2.mp3' },
      { id: 'BGM_EXTRA_SURPRISE_1', mood: 'surprise', variant: 1, title: 'surprise 1', path: 'audio/bgm/extra/surprise1.mp3' },
      { id: 'BGM_EXTRA_SURPRISE_2', mood: 'surprise', variant: 2, title: 'surprise 2', path: 'audio/bgm/extra/surprise2.mp3' }
    ]
  },
  se: {
    quiz: [
      { id: 'SE_QUIZ_CHOICE_PICK', key: 'quizChoicePick', path: 'audio/se/quiz_choice_pick_01_3.mp3', volume: 0.36, start: 0, end: 1.0 },
      { id: 'SE_QUIZ_CORRECT', key: 'quizCorrectStarChime', path: 'audio/se/quiz_correct_star_chime_01.mp3', volume: 0.46, start: 0, end: null },
      { id: 'SE_QUIZ_WRONG', key: 'quizWrongSandTap', path: 'audio/se/quiz_wrong_sand_tap_01_3.mp3', volume: 0.42, start: 0, end: null }
    ],
    ui: [
      { id: 'SE_UI_TAP', key: 'uiTapBottle', path: 'audio/se/ui_tap_bottle_01_3.mp3', volume: 0.50, start: 0, end: null },
      { id: 'SE_UI_DECIDE', key: 'uiConfirmChime', path: 'audio/se/ui_confirm_chime_01_3.mp3', volume: 0.42, start: 0, end: null }
    ],
    day_end: [
      { id: 'SE_DAY_END_REST', key: 'workshopDayEnd', path: 'audio/se/workshop_day_end_01_2.mp3', volume: 0.40, start: 0, end: null }
    ]
  }
};

module.exports = { AUDIO_MANIFEST };
