/**
 * Audio Manifest for MadeInMaghribal project.
 */
const AUDIO_MANIFEST = {
  bgm: {
    system: [
      { id: 'main01_title', title: 'Title Theme' },
      { id: 'main02_shop', title: 'Daily Alchemy Shop' },
      { id: 'main03_puzzle', title: 'Mixing Rhythms' }
    ],
    heroines: {
      HAKIMA: {
        theme: 'BGM_THEME_HAKIMA',
        game: ['BGM_GAME_HAKIMA_1', 'BGM_GAME_HAKIMA_2', 'BGM_GAME_HAKIMA_3', 'BGM_GAME_HAKIMA_4'],
        ending: { normal: 'BGM_ED_HAKIMA_NORMAL', good: 'BGM_ED_HAKIMA_GOOD' },
        free_play: true
      },
      MIRA: {
        theme: 'BGM_THEME_MIRA',
        game: ['BGM_GAME_MIRA_1', 'BGM_GAME_MIRA_2', 'BGM_GAME_MIRA_3', 'BGM_GAME_MIRA_4'],
        ending: { normal: 'BGM_ED_MIRA_NORMAL', good: 'BGM_ED_MIRA_GOOD' },
        free_play: true
      },
      DARIYA: {
        theme: 'BGM_THEME_DARIYA',
        game: ['BGM_GAME_DARIYA_1', 'BGM_GAME_DARIYA_2', 'BGM_GAME_DARIYA_3', 'BGM_GAME_DARIYA_4'],
        ending: { normal: 'BGM_ED_DARIYA_NORMAL', good: 'BGM_ED_DARIYA_GOOD' },
        free_play: true
      }
    },
    extra: [
      { id: 'BGM_EXTRA_ROMANCE', mood: 'romantic' },
      { id: 'BGM_EXTRA_TENSE', mood: 'tense' }
    ]
  },
  se: {
    quiz: ['SE_QUIZ_CORRECT', 'SE_QUIZ_WRONG', 'SE_QUIZ_TICK'],
    ui: ['SE_UI_DECIDE', 'SE_UI_CANCEL', 'SE_UI_MOVE'],
    day_end: ['SE_DAY_END_REST']
  }
};

module.exports = { AUDIO_MANIFEST };
