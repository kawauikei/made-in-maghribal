/**
 * Audio Manifest for MadeInMaghribal project.
 * Verified against actual filesystem paths in public/audio/.
 */
const AUDIO_MANIFEST = {
  bgm: {
    system: [
      { id: 'main01_title', title: 'Beneath the Indigo Dunes', path: 'audio/bgm/main/main01_title.mp3' },
      { id: 'main02_shop', title: 'Bottled Starlight', path: 'audio/bgm/main/main02_shop.mp3' },
      { id: 'main03_puzzle', title: 'Saffron and Copper Kettle', path: 'audio/bgm/main/main03_puzzle.mp3' }
    ],
    heroines: {
      HAKIMA: {
        theme: { id: 'BGM_THEME_HAKIMA', title: 'Two Cups of Cardamom', path: 'audio/bgm/hakima/hakima01_theme.mp3' },
        game: [
          { id: 'BGM_GAME_HAKIMA_1', title: 'Copper and Cumin', path: 'audio/bgm/hakima/hakima02_game_a.mp3' },
          { id: 'BGM_GAME_HAKIMA_2', title: 'Copper and Sand', path: 'audio/bgm/hakima/hakima03_game_b.mp3' },
          { id: 'BGM_GAME_HAKIMA_3', title: 'Saffron Hour', path: 'audio/bgm/hakima/hakima04_game_c.mp3' },
          { id: 'BGM_GAME_HAKIMA_4', title: "The Alchemist's Pace", path: 'audio/bgm/hakima/hakima05_game_d.mp3' }
        ],
        ending: {
          normal: { id: 'BGM_ED_HAKIMA_NORMAL', title: '傾いたその耳は', path: 'audio/bgm/hakima/hakima06_ending.mp3' },
          good: { id: 'BGM_ED_HAKIMA_GOOD', title: '夕暮れの調合', path: 'audio/bgm/hakima/hakima07_ending2.mp3' },
          secret: { id: 'BGM_ED_HAKIMA_SECRET', title: '秘密のレシピ', path: 'audio/bgm/hakima/hakima08_ending3.mp3' }
        }
      },
      MIRA: {
        theme: { id: 'BGM_THEME_MIRA', title: "The Alchemist's Table", path: 'audio/bgm/mira/mira01_theme.mp3' },
        game: [
          { id: 'BGM_GAME_MIRA_1', title: 'The Alchemist’s Arithmetic', path: 'audio/bgm/mira/mira02_game_a.mp3' },
          { id: 'BGM_GAME_MIRA_2', title: 'Three Years of Amber', path: 'audio/bgm/mira/mira03_game_b.mp3' },
          { id: 'BGM_GAME_MIRA_3', title: "The Alchemist's Clockwork", path: 'audio/bgm/mira/mira04_game_c.mp3' },
          { id: 'BGM_GAME_MIRA_4', title: 'The Glass Bazaar', path: 'audio/bgm/mira/mira05_game_d.mp3' }
        ],
        ending: {
          normal: { id: 'BGM_ED_MIRA_NORMAL', title: 'Finally Just Me', path: 'audio/bgm/mira/mira06_ending.mp3' },
          good: { id: 'BGM_ED_MIRA_GOOD', title: '硝子のキセキ', path: 'audio/bgm/mira/mira07_ending2.mp3' },
          secret: { id: 'BGM_ED_MIRA_SECRET', title: '普通の女の子で、いい？', path: 'audio/bgm/mira/mira08_ending3.mp3' }
        }
      },
      DARIYA: {
        theme: { id: 'BGM_THEME_DARIYA', title: 'Midnight at the Stone Window', path: 'audio/bgm/dariya/dariya01_theme.mp3' },
        game: [
          { id: 'BGM_GAME_DARIYA_1', title: "The Alchemist's Ledger", path: 'audio/bgm/dariya/dariya02_game_a.mp3' },
          { id: 'BGM_GAME_DARIYA_2', title: 'Clockwork Gambit', path: 'audio/bgm/dariya/dariya03_game_b.mp3' },
          { id: 'BGM_GAME_DARIYA_3', title: 'Copper and Glass Noon', path: 'audio/bgm/dariya/dariya04_game_c.mp3' },
          { id: 'BGM_GAME_DARIYA_4', title: "The Crown's Calculation", path: 'audio/bgm/dariya/dariya05_game_d.mp3' }
        ],
        ending: {
          normal: { id: 'BGM_ED_DARIYA_NORMAL', title: 'Tea Under the Rising Sun', path: 'audio/bgm/dariya/dariya06_ending.mp3' },
          good: { id: 'BGM_ED_DARIYA_GOOD', title: '完璧じゃない夜明け', path: 'audio/bgm/dariya/dariya07_ending2.mp3' },
          secret: { id: 'BGM_ED_DARIYA_SECRET', title: 'ありのままの痛み', path: 'audio/bgm/dariya/dariya08_ending3.mp3' }
        }
      }
    },
    extra: [
      { id: 'BGM_EXTRA_ANGER_1', mood: 'anger', variant: 1, title: 'Behind the Iron Lock', path: 'audio/bgm/extra/anger1.mp3' },
      { id: 'BGM_EXTRA_ANGER_2', mood: 'anger', variant: 2, title: 'Iron Teeth Closing', path: 'audio/bgm/extra/anger2.mp3' },
      { id: 'BGM_EXTRA_FUN_1', mood: 'fun', variant: 1, title: 'Raising The Iron Mug', path: 'audio/bgm/extra/fun1.mp3' },
      { id: 'BGM_EXTRA_FUN_2', mood: 'fun', variant: 2, title: "The Cursor's Game", path: 'audio/bgm/extra/fun2.mp3' },
      { id: 'BGM_EXTRA_JOY_1', mood: 'joy', variant: 1, title: 'Morning in the High Meadow', path: 'audio/bgm/extra/joy1.mp3' },
      { id: 'BGM_EXTRA_JOY_2', mood: 'joy', variant: 2, title: 'Sunlight on the Path', path: 'audio/bgm/extra/joy2.mp3' },
      { id: 'BGM_EXTRA_SORROW_1', mood: 'sorrow', variant: 1, title: 'Hammered Seams', path: 'audio/bgm/extra/sorrow1.mp3' },
      { id: 'BGM_EXTRA_SORROW_2', mood: 'sorrow', variant: 2, title: 'The Long Unraveling', path: 'audio/bgm/extra/sorrow2.mp3' },
      { id: 'BGM_EXTRA_SURPRISE_1', mood: 'surprise', variant: 1, title: 'The Iron Threshold', path: 'audio/bgm/extra/surprise1.mp3' },
      { id: 'BGM_EXTRA_SURPRISE_2', mood: 'surprise', variant: 2, title: 'The Morning Key', path: 'audio/bgm/extra/surprise2.mp3' }
    ]
  },
  se: {
    all: [
      'clock_ticking_1.mp3',
      'clock_ticking_2.mp3',
      'clock_ticking_3.mp3',
      'clock_ticking_4.mp3',
      'quiz_choice_pick_01.mp3',
      'quiz_choice_pick_01_2.mp3',
      'quiz_choice_pick_01_3.mp3',
      'quiz_choice_pick_01_4.mp3',
      'quiz_correct_star_chime_01.mp3',
      'quiz_correct_star_chime_01_2.mp3',
      'quiz_correct_star_chime_01_3.mp3',
      'quiz_correct_star_chime_01_4.mp3',
      'quiz_wrong_sand_tap_01.mp3',
      'quiz_wrong_sand_tap_01_2.mp3',
      'quiz_wrong_sand_tap_01_3.mp3',
      'quiz_wrong_sand_tap_01_4.mp3',
      'ui_confirm_chime_01.mp3',
      'ui_confirm_chime_01_2.mp3',
      'ui_confirm_chime_01_3.mp3',
      'ui_confirm_chime_01_4.mp3',
      'ui_tap_bottle_01.mp3',
      'ui_tap_bottle_01_2.mp3',
      'ui_tap_bottle_01_3.mp3',
      'ui_tap_bottle_01_4.mp3',
      'workshop_day_end_01.mp3',
      'workshop_day_end_01_2.mp3',
      'workshop_day_end_01_3.mp3',
      'workshop_day_end_01_4.mp3'
    ].map((filename) => ({
      id: filename.replace(/\.mp3$/, ''),
      key: filename.replace(/\.mp3$/, ''),
      title: filename,
      path: `audio/se/${filename}`,
      volume: 0.42,
      start: 0,
      end: null
    })),
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
