/**
 * Central narrative text deck.
 *
 * This file is the active narrative source. The older text files in `src/data/`
 * are retained only as reference material while the team rewrites content.
 *
 * Supported page params:
 * - speakerId: 'nader' | heroineId | ''
 * - speaker: visible label
 * - expression: face/state token such as 'normal', 'joy', 'fun', 'sorrow',
 *   'anger', 'surprise', 'cry', 'student', 'social', 'maid'
 * - backgroundId: background asset key
 * - stillImageId: still asset key
 * - bgmId: BGM track key
 * - routeMode: 'normal' | 'long_history' | 'both'
 * - kind: section tag for narrative selection
 * - threshold / minAffection / scoreMin / scoreMax: branching hints
 */

const NADER = 'ナーディル';
const HEROINE_LABELS = {
  hakima: 'ハキマ',
  mira: 'ミラ',
  dariya: 'ダリヤ',
};

const p = (speakerId, speaker, text, expression = 'normal', extra = {}) => ({
  speakerId,
  speaker,
  text,
  expression,
  ...extra,
});

const talk = (id, meta, pages) => ({ id, ...meta, pages });

const recap = {
  hakima: {
    normal: talk(
      'hakima_recap_normal',
      { kind: 'recap', heroineId: 'hakima', routeMode: 'normal', title: '自己紹介の再確認' },
      [
        p('nader', NADER, 'ハキマ、今日もいつもの手順でいこう。', 'normal', { backgroundId: 'shopExteriorDay' }),
        p('hakima', HEROINE_LABELS.hakima, 'ええ。まずは現状整理、次に一手。いつも通りで十分よ。', 'joy'),
        p('nader', NADER, '君のその短さは、逆に信頼できる。', 'normal'),
      ]
    ),
    long_history: talk(
      'hakima_recap_long_history',
      { kind: 'recap', heroineId: 'hakima', routeMode: 'long_history', title: '長編側の自己紹介' },
      [
        p('nader', NADER, '長い付き合いのぶん、ハキマとは確認したいことが多い。', 'normal', { backgroundId: 'marketCentral' }),
        p('hakima', HEROINE_LABELS.hakima, '昔話より、今の店の流れを見せて。そこから始めましょう。', 'normal'),
        p('nader', NADER, 'その言い方、昔よりずっと自然だ。', 'fun'),
      ]
    ),
  },
  mira: {
    normal: talk(
      'mira_recap_normal',
      { kind: 'recap', heroineId: 'mira', routeMode: 'normal', title: '自己紹介の再確認' },
      [
        p('nader', NADER, 'ミラ、今日は落ち着いて話せそうだ。', 'normal', { backgroundId: 'shopExteriorNight' }),
        p('mira', HEROINE_LABELS.mira, 'うん。焦らなくていいなら、話もちゃんと届く。', 'joy'),
        p('nader', NADER, 'それが君の強さだと思う。', 'normal'),
      ]
    ),
    long_history: talk(
      'mira_recap_long_history',
      { kind: 'recap', heroineId: 'mira', routeMode: 'long_history', title: '長編側の自己紹介' },
      [
        p('nader', NADER, '長い話を知っているぶん、今日は少し丁寧に始めたい。', 'normal', { backgroundId: 'spotStarView' }),
        p('mira', HEROINE_LABELS.mira, 'それなら、最初の一言はちゃんと残るようにして。', 'fun'),
        p('nader', NADER, '任せてくれ。', 'joy'),
      ]
    ),
  },
  dariya: {
    normal: talk(
      'dariya_recap_normal',
      { kind: 'recap', heroineId: 'dariya', routeMode: 'normal', title: '自己紹介の再確認' },
      [
        p('nader', NADER, 'ダリヤ、今日は無理のない速度で進めよう。', 'normal', { backgroundId: 'shopInteriorService' }),
        p('dariya', HEROINE_LABELS.dariya, 'ええ。見た目より、手元の確かさを見せたいの。', 'joy'),
        p('nader', NADER, 'なら、最初から最後まで安心して見ていられる。', 'normal'),
      ]
    ),
    long_history: talk(
      'dariya_recap_long_history',
      { kind: 'recap', heroineId: 'dariya', routeMode: 'long_history', title: '長編側の自己紹介' },
      [
        p('nader', NADER, 'ダリヤとは、昔から会話の温度が安定している。', 'normal', { backgroundId: 'shopExteriorNight' }),
        p('dariya', HEROINE_LABELS.dariya, '安定しているのが、今は一番助かるでしょう？', 'sorrow'),
        p('nader', NADER, 'その通りだ。', 'fun'),
      ]
    ),
  },
};

const openingScene = talk(
  'opening_nader_intro',
  { kind: 'opening', title: '固定のナーディル自己紹介' },
  [
    p('nader', NADER, '星瓶堂の店主、ナーディル。今日は店の流れを整える日だ。', 'normal', {
      backgroundId: 'shopExteriorDay',
      bgmId: 'MAIN-02',
    }),
    p('nader', NADER, 'まずは自分の足元を確認して、それから客と向き合う。', 'normal', {
      backgroundId: 'shopInteriorService',
    }),
  ]
);

const introTalks = [
  talk(
    'hakima_preopen_1_weather',
    {
      kind: 'pre_open_1',
      stage: 1,
      category: 'work',
      scope: 'heroine',
      heroineId: 'hakima',
      timing: 'intro',
      routeMode: 'both',
      title: 'いい天気の話題',
    },
    [
      p('nader', NADER, 'いい天気だ。今日は客足が読めそうだね。', 'normal', { backgroundId: 'marketCentral' }),
      p('hakima', HEROINE_LABELS.hakima, 'ええ、だからこそ店の表情も大事。明るく、でも軽すぎない。', 'joy'),
      p('nader', NADER, 'それなら店先の並べ方を少し変えておく。', 'normal'),
    ]
  ),
  talk(
    'hakima_preopen_2_stock',
    {
      kind: 'pre_open_2',
      stage: 2,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'hakima',
      timing: 'intro',
      routeMode: 'both',
      title: '在庫の確認',
    },
    [
      p('hakima', HEROINE_LABELS.hakima, '棚の並び、昨日より分かりやすくなった。こういうのは大事よ。', 'normal'),
      p('nader', NADER, '君にそう言われると、少しだけ自信が出る。', 'joy'),
    ]
  ),
  talk(
    'mira_preopen_1_weather',
    {
      kind: 'pre_open_1',
      stage: 1,
      category: 'work',
      scope: 'heroine',
      heroineId: 'mira',
      timing: 'intro',
      routeMode: 'both',
      title: '雲の様子',
    },
    [
      p('nader', NADER, '雲があるぶん、今日は見通しを立てやすいかもしれない。', 'normal', { backgroundId: 'shopExteriorNight' }),
      p('mira', HEROINE_LABELS.mira, 'なら、最初の一手は急がないで正解だね。', 'joy'),
      p('nader', NADER, 'それでいこう。', 'normal'),
    ]
  ),
  talk(
    'mira_preopen_2_tone',
    {
      kind: 'pre_open_2',
      stage: 2,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'mira',
      timing: 'intro',
      routeMode: 'both',
      title: '会話の温度',
    },
    [
      p('mira', HEROINE_LABELS.mira, '今日は、少し静かな話し方が合ってる気がする。', 'normal'),
      p('nader', NADER, '了解。落ち着いて進めよう。', 'joy'),
    ]
  ),
  talk(
    'dariya_preopen_1_weather',
    {
      kind: 'pre_open_1',
      stage: 1,
      category: 'work',
      scope: 'heroine',
      heroineId: 'dariya',
      timing: 'intro',
      routeMode: 'both',
      title: '風の話題',
    },
    [
      p('nader', NADER, '風向きは悪くない。今日は動きやすい日だ。', 'normal', { backgroundId: 'shopExteriorDay' }),
      p('dariya', HEROINE_LABELS.dariya, 'そうね。なら、最初の挨拶は短くていい。', 'fun'),
      p('nader', NADER, '必要なことだけ、きちんと伝える。', 'normal'),
    ]
  ),
  talk(
    'dariya_preopen_2_hand',
    {
      kind: 'pre_open_2',
      stage: 2,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'dariya',
      timing: 'intro',
      routeMode: 'both',
      title: '手つきの確認',
    },
    [
      p('dariya', HEROINE_LABELS.dariya, '手元は見ている。慌てないのが一番だもの。', 'joy'),
      p('nader', NADER, 'その確認があるだけで、店の空気が整う。', 'normal'),
    ]
  ),
];

const afterResultTalks = [
  talk(
    'hakima_after_result_high',
    {
      kind: 'post_close_1',
      stage: 5,
      category: 'work',
      scope: 'heroine',
      heroineId: 'hakima',
      timing: 'after_result',
      routeMode: 'both',
      title: '高評価の一言',
      scoreMin: 50,
    },
    [
      p('hakima', HEROINE_LABELS.hakima, '今日はよくやったわ。見ていて安心できた。', 'joy'),
      p('nader', NADER, '君にそう言ってもらえるなら、十分だ。', 'joy'),
    ]
  ),
  talk(
    'hakima_after_result_low',
    {
      kind: 'post_close_1',
      stage: 5,
      category: 'work',
      scope: 'heroine',
      heroineId: 'hakima',
      timing: 'after_result',
      routeMode: 'both',
      title: '控えめな応援',
      scoreMax: 49,
    },
    [
      p('hakima', HEROINE_LABELS.hakima, '次はもっと伸ばせる。焦らずに見直しましょう。', 'normal'),
      p('nader', NADER, 'うん。次の手順を整える。', 'normal'),
    ]
  ),
  talk(
    'mira_after_result_high',
    {
      kind: 'post_close_1',
      stage: 5,
      category: 'work',
      scope: 'heroine',
      heroineId: 'mira',
      timing: 'after_result',
      routeMode: 'both',
      title: '高評価の一言',
      scoreMin: 50,
    },
    [
      p('mira', HEROINE_LABELS.mira, 'いい流れだった。あの判断は素直に褒めたい。', 'joy'),
      p('nader', NADER, 'ありがとう。積み上げた分が出た感じがする。', 'normal'),
    ]
  ),
  talk(
    'mira_after_result_low',
    {
      kind: 'post_close_1',
      stage: 5,
      category: 'work',
      scope: 'heroine',
      heroineId: 'mira',
      timing: 'after_result',
      routeMode: 'both',
      title: '控えめな応援',
      scoreMax: 49,
    },
    [
      p('mira', HEROINE_LABELS.mira, 'まだ伸びる。だから、次もちゃんと見ていこう。', 'normal'),
      p('nader', NADER, 'うん。慌てずに詰め直す。', 'normal'),
    ]
  ),
  talk(
    'dariya_after_result_high',
    {
      kind: 'post_close_1',
      stage: 5,
      category: 'work',
      scope: 'heroine',
      heroineId: 'dariya',
      timing: 'after_result',
      routeMode: 'both',
      title: '高評価の一言',
      scoreMin: 50,
    },
    [
      p('dariya', HEROINE_LABELS.dariya, 'その調子。今日はちゃんと狙えていたわ。', 'joy'),
      p('nader', NADER, '次もこの感覚を忘れない。', 'normal'),
    ]
  ),
  talk(
    'dariya_after_result_low',
    {
      kind: 'post_close_1',
      stage: 5,
      category: 'work',
      scope: 'heroine',
      heroineId: 'dariya',
      timing: 'after_result',
      routeMode: 'both',
      title: '控えめな応援',
      scoreMax: 49,
    },
    [
      p('dariya', HEROINE_LABELS.dariya, '悪くない。だけど、もう一段は上げられる。', 'normal'),
      p('nader', NADER, '次はそこを狙う。', 'joy'),
    ]
  ),
];

const dayEndTalks = [
  talk(
    'hakima_day_end_low_affection',
    {
      kind: 'post_close_2',
      stage: 6,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'hakima',
      timing: 'day_end',
      routeMode: 'both',
      title: '親密度ひかえめ',
      minAffection: 0,
      maxAffection: 19,
    },
    [
      p('hakima', HEROINE_LABELS.hakima, '今日はここまでで十分。続きはまた明日。', 'normal'),
      p('nader', NADER, 'うん、明日の流れを整えておく。', 'normal'),
    ]
  ),
  talk(
    'hakima_day_end_mid_affection',
    {
      kind: 'post_close_2',
      stage: 6,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'hakima',
      timing: 'day_end',
      routeMode: 'both',
      title: '親密度ふつう',
      minAffection: 20,
      maxAffection: 59,
    },
    [
      p('hakima', HEROINE_LABELS.hakima, '少しずつ分かってきた気がする。だから、明日も見せて。', 'joy'),
      p('nader', NADER, '任せてくれ。', 'joy'),
    ]
  ),
  talk(
    'hakima_day_end_high_affection',
    {
      kind: 'post_close_2',
      stage: 6,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'hakima',
      timing: 'day_end',
      routeMode: 'both',
      title: '親密度高め',
      minAffection: 60,
    },
    [
      p('hakima', HEROINE_LABELS.hakima, '明日もまた隣で見ている。そう思えるだけで十分よ。', 'joy'),
      p('nader', NADER, 'その一言は、かなり嬉しい。', 'normal'),
    ]
  ),
  talk(
    'mira_day_end_low_affection',
    {
      kind: 'post_close_2',
      stage: 6,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'mira',
      timing: 'day_end',
      routeMode: 'both',
      title: '親密度ひかえめ',
      minAffection: 0,
      maxAffection: 19,
    },
    [
      p('mira', HEROINE_LABELS.mira, '今日はここまで。まだ言葉は残せるから、急がなくていい。', 'normal'),
      p('nader', NADER, '了解。次の会話のために整えておく。', 'normal'),
    ]
  ),
  talk(
    'mira_day_end_mid_affection',
    {
      kind: 'post_close_2',
      stage: 6,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'mira',
      timing: 'day_end',
      routeMode: 'both',
      title: '親密度ふつう',
      minAffection: 20,
      maxAffection: 59,
    },
    [
      p('mira', HEROINE_LABELS.mira, '少しずつ近づいてる。焦らなくても、ちゃんと届くよ。', 'joy'),
      p('nader', NADER, 'その感覚を大事にしたい。', 'joy'),
    ]
  ),
  talk(
    'mira_day_end_high_affection',
    {
      kind: 'post_close_2',
      stage: 6,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'mira',
      timing: 'day_end',
      routeMode: 'both',
      title: '親密度高め',
      minAffection: 60,
    },
    [
      p('mira', HEROINE_LABELS.mira, '明日も、今みたいに自然に話せるといい。', 'joy'),
      p('nader', NADER, 'そうできるようにしておく。', 'normal'),
    ]
  ),
  talk(
    'dariya_day_end_low_affection',
    {
      kind: 'post_close_2',
      stage: 6,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'dariya',
      timing: 'day_end',
      routeMode: 'both',
      title: '親密度ひかえめ',
      minAffection: 0,
      maxAffection: 19,
    },
    [
      p('dariya', HEROINE_LABELS.dariya, '今日はここまで。次に会うときは、もう少し踏み込めるはず。', 'normal'),
      p('nader', NADER, 'なら、次回に向けて準備する。', 'normal'),
    ]
  ),
  talk(
    'dariya_day_end_mid_affection',
    {
      kind: 'post_close_2',
      stage: 6,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'dariya',
      timing: 'day_end',
      routeMode: 'both',
      title: '親密度ふつう',
      minAffection: 20,
      maxAffection: 59,
    },
    [
      p('dariya', HEROINE_LABELS.dariya, 'うまくいったところは覚えておく。次もそこから始めましょう。', 'joy'),
      p('nader', NADER, 'うん、そこは忘れない。', 'normal'),
    ]
  ),
  talk(
    'dariya_day_end_high_affection',
    {
      kind: 'post_close_2',
      stage: 6,
      category: 'personal',
      scope: 'heroine',
      heroineId: 'dariya',
      timing: 'day_end',
      routeMode: 'both',
      title: '親密度高め',
      minAffection: 60,
    },
    [
      p('dariya', HEROINE_LABELS.dariya, '明日も、今の距離感のままでいい。十分伝わっているから。', 'joy'),
      p('nader', NADER, 'そのままの感じで続けたい。', 'joy'),
    ]
  ),
];

const baseEnding = {
  good: [
    p('', '', '今日の積み重ねが、ちゃんと形になった。', 'joy', { backgroundId: 'shopExteriorNight' }),
    p('nader', NADER, '明日も、この調子で店を続けよう。', 'normal'),
  ],
  normal: [
    p('', '', '結果はまだ途中だが、前に進む足取りは見えている。', 'normal', { backgroundId: 'shopExteriorNight' }),
    p('nader', NADER, '次はもう少し、うまくやれる。', 'normal'),
  ],
};

export const NARRATIVE_SCRIPT = {
  opening: openingScene,
  heroineSelectionRecaps: recap,
  dailyTalks: introTalks.concat(afterResultTalks, dayEndTalks),
  affectionEvents: {
    hakima: [
      {
        id: 'hakima_0',
        heroineId: 'hakima',
        threshold: 0,
        kind: 'flashback_intro',
        title: 'はじめての挨拶',
        presentation: { backgroundId: 'shopExteriorDay', bgmId: 'HAKIMA-01' },
        summary: 'ダミーの導入イベント。世界観清書前の置き場。',
        pages: [
          p('', '', 'ハキマが店に入ってきた日のことを、ナーディルはまだ覚えている。', 'normal', { backgroundId: 'marketCentral' }),
          p('hakima', HEROINE_LABELS.hakima, 'まずは挨拶。それから話を聞く。', 'joy'),
          p('nader', NADER, 'その一言で、店の空気が少し変わった。', 'normal'),
        ],
      },
      {
        id: 'hakima_5',
        heroineId: 'hakima',
        threshold: 5,
        title: '市場の見立て',
        presentation: { backgroundId: 'marketCentral', bgmId: 'HAKIMA-01' },
        summary: 'ダミーの通常イベント。',
        pages: [
          p('hakima', HEROINE_LABELS.hakima, '品を見る目は、少しずつ育つ。', 'normal'),
          p('nader', NADER, '君の言い方は、いつも要点だけ残る。', 'joy'),
        ],
      },
      {
        id: 'hakima_10',
        heroineId: 'hakima',
        threshold: 10,
        title: '棚の確認',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'HAKIMA-02' },
        summary: 'ダミーの通常イベント。',
        pages: [
          p('nader', NADER, '棚を整えると、話の順番も整う気がする。', 'normal'),
          p('hakima', HEROINE_LABELS.hakima, 'それはまあ、悪くない考え方ね。', 'joy'),
        ],
      },
      {
        id: 'hakima_20',
        heroineId: 'hakima',
        threshold: 20,
        title: '協力のかたち',
        presentation: { backgroundId: 'shopInteriorService', bgmId: 'HAKIMA-03' },
        summary: 'ダミーの通常イベント。',
        pages: [
          p('hakima', HEROINE_LABELS.hakima, '次は、手伝う側の目線も覚えておきなさい。', 'normal'),
          p('nader', NADER, '了解。覚えておく。', 'normal'),
        ],
      },
    ],
    mira: [
      {
        id: 'mira_0',
        heroineId: 'mira',
        threshold: 0,
        kind: 'flashback_intro',
        title: 'はじめての挨拶',
        presentation: { backgroundId: 'shopExteriorDay', bgmId: 'MIRA-01' },
        summary: 'ダミーの導入イベント。',
        pages: [
          p('', '', 'ミラは静かに店を見回してから、ゆっくり頷いた。', 'normal', { backgroundId: 'shopExteriorDay' }),
          p('mira', HEROINE_LABELS.mira, '焦らず、順番に話そう。', 'joy'),
          p('nader', NADER, 'その穏やかさが、最初から頼もしかった。', 'normal'),
        ],
      },
      {
        id: 'mira_5',
        heroineId: 'mira',
        threshold: 5,
        title: '昼下がりの確認',
        presentation: { backgroundId: 'spotFountain', bgmId: 'MIRA-01' },
        summary: 'ダミーの通常イベント。',
        pages: [
          p('mira', HEROINE_LABELS.mira, '落ち着いて見ると、違いが少し見える。', 'normal'),
          p('nader', NADER, 'それが分かるだけでも進歩だ。', 'joy'),
        ],
      },
      {
        id: 'mira_10',
        heroineId: 'mira',
        threshold: 10,
        title: '作業のリズム',
        presentation: { backgroundId: 'spotStarView', bgmId: 'MIRA-02' },
        summary: 'ダミーの通常イベント。',
        pages: [
          p('nader', NADER, '慣れた作業ほど、声のかけ方が大事になる。', 'normal'),
          p('mira', HEROINE_LABELS.mira, 'そう。だから、言葉は短くていい。', 'joy'),
        ],
      },
      {
        id: 'mira_20',
        heroineId: 'mira',
        threshold: 20,
        title: '視線の合わせ方',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'MIRA-03' },
        summary: 'ダミーの通常イベント。',
        pages: [
          p('mira', HEROINE_LABELS.mira, 'ちゃんと見てくれるなら、それでいい。', 'normal'),
          p('nader', NADER, '見るべきところは見ている。', 'normal'),
        ],
      },
    ],
    dariya: [
      {
        id: 'dariya_0',
        heroineId: 'dariya',
        threshold: 0,
        kind: 'flashback_intro',
        title: 'はじめての挨拶',
        presentation: { backgroundId: 'shopExteriorDay', bgmId: 'DARIYA-01' },
        summary: 'ダミーの導入イベント。',
        pages: [
          p('', '', 'ダリヤは最初から、言葉を選んで話していた。', 'normal', { backgroundId: 'shopExteriorDay' }),
          p('dariya', HEROINE_LABELS.dariya, '急がないで。まずは、状況を見よう。', 'joy'),
          p('nader', NADER, 'その落ち着きが、店を保っている。', 'normal'),
        ],
      },
      {
        id: 'dariya_5',
        heroineId: 'dariya',
        threshold: 5,
        title: '朝の支度',
        presentation: { backgroundId: 'shopInteriorService', bgmId: 'DARIYA-01' },
        summary: 'ダミーの通常イベント。',
        pages: [
          p('dariya', HEROINE_LABELS.dariya, '支度は早いほど楽になる。', 'normal'),
          p('nader', NADER, 'その通りだ。', 'normal'),
        ],
      },
      {
        id: 'dariya_10',
        heroineId: 'dariya',
        threshold: 10,
        title: '声の置き方',
        presentation: { backgroundId: 'spotPortView', bgmId: 'DARIYA-02' },
        summary: 'ダミーの通常イベント。',
        pages: [
          p('nader', NADER, '声は小さくても、届く内容は変わる。', 'normal'),
          p('dariya', HEROINE_LABELS.dariya, 'なら、届く形で話せばいい。', 'joy'),
        ],
      },
      {
        id: 'dariya_20',
        heroineId: 'dariya',
        threshold: 20,
        title: '並べ方の工夫',
        presentation: { backgroundId: 'spotRuins', bgmId: 'DARIYA-03' },
        summary: 'ダミーの通常イベント。',
        pages: [
          p('dariya', HEROINE_LABELS.dariya, '見せ方を変えるだけで、印象は変わる。', 'normal'),
          p('nader', NADER, 'それは店でも同じだ。', 'fun'),
        ],
      },
    ],
  },
  endings: {
    hakima: {
      good: {
        title: 'ハキマの良い結末',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'HAKIMA-04' },
        pages: [
          p('hakima', HEROINE_LABELS.hakima, '今日はちゃんと積み上がった。明日も続けられる。', 'joy'),
          p('nader', NADER, 'その一歩を、次も崩さないようにする。', 'normal'),
        ],
      },
      normal: {
        title: 'ハキマの通常結末',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'HAKIMA-02' },
        pages: baseEnding.normal,
      },
      bad: {
        title: 'ハキマの通常結末',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'HAKIMA-02' },
        pages: baseEnding.normal,
      },
    },
    mira: {
      good: {
        title: 'ミラの良い結末',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'MIRA-04' },
        pages: [
          p('mira', HEROINE_LABELS.mira, 'うまくいったね。今日はちゃんと届いた。', 'joy'),
          p('nader', NADER, 'その実感を、次に繋げたい。', 'normal'),
        ],
      },
      normal: {
        title: 'ミラの通常結末',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'MIRA-02' },
        pages: baseEnding.normal,
      },
      bad: {
        title: 'ミラの通常結末',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'MIRA-02' },
        pages: baseEnding.normal,
      },
    },
    dariya: {
      good: {
        title: 'ダリヤの良い結末',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'DARIYA-04' },
        pages: [
          p('dariya', HEROINE_LABELS.dariya, '今日は十分。だから、次はもう少し欲張ってみる。', 'joy'),
          p('nader', NADER, 'その欲張り方なら、きっと悪くない。', 'normal'),
        ],
      },
      normal: {
        title: 'ダリヤの通常結末',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'DARIYA-02' },
        pages: baseEnding.normal,
      },
      bad: {
        title: 'ダリヤの通常結末',
        presentation: { backgroundId: 'shopExteriorNight', bgmId: 'DARIYA-02' },
        pages: baseEnding.normal,
      },
    },
  },
  resultComments: {
    hakima: {
      perfect: ['完璧。', '見事ね。'],
      good: ['よくやった。', '安定していた。'],
      ok: ['悪くない。', '次は伸びる。'],
      bad: ['立て直せる。', '次で巻き返そう。'],
    },
    mira: {
      perfect: ['よくできた。', '流れが綺麗だった。'],
      good: ['十分いい。', '落ち着いていた。'],
      ok: ['まだいける。', '次はもう少し上だ。'],
      bad: ['ここからだ。', '焦らず整えよう。'],
    },
    dariya: {
      perfect: ['狙い通り。', 'かなり良い。'],
      good: ['悪くない。', '筋が通っている。'],
      ok: ['少し足りない。', '次は届く。'],
      bad: ['まだ始まり。', '次で合わせる。'],
    },
  },
};

export function getOpeningPages() {
  return NARRATIVE_SCRIPT.opening.pages;
}

export function getSelectionRecapPages(heroineId, routeMode) {
  const recapByHeroine = NARRATIVE_SCRIPT.heroineSelectionRecaps[heroineId];
  if (!recapByHeroine) return [];
  const recap = recapByHeroine[routeMode] || recapByHeroine.normal || recapByHeroine.long_history;
  return recap?.pages ? recap.pages : [];
}

export function getIntroGreetingPages({ heroineId, routeMode, seenTalkIds = [] }) {
  const pages = [];
  if (!seenTalkIds || seenTalkIds.length === 0) {
    pages.push(...getOpeningPages());
  }
  pages.push(...getSelectionRecapPages(heroineId, routeMode));
  return pages;
}

function pickTalk(talks, seenTalkIds = []) {
  const eligible = talks.filter(talk => !seenTalkIds.includes(talk.id));
  if (eligible.length > 0) return eligible[0];
  return talks.length > 0 ? talks[0] : null;
}

export function getIntroTalksForHeroine(heroineId, currentAffection, routeMode, seenTalkIds = []) {
  const stage1 = introTalks.filter(talk => talk.stage === 1 && talk.heroineId === heroineId && (talk.routeMode === 'both' || talk.routeMode === routeMode));
  const stage2 = introTalks.filter(talk => talk.stage === 2 && talk.heroineId === heroineId && (talk.routeMode === 'both' || talk.routeMode === routeMode));
  const stage1Talk = pickTalk(stage1, seenTalkIds);
  const stage2Talk = pickTalk(stage2, seenTalkIds);
  const result = [];
  if (stage1Talk) result.push(stage1Talk);
  if (stage2Talk) result.push(stage2Talk);
  return result;
}

export function getAfterResultTalk(heroineId, score, routeMode, seenTalkIds = []) {
  const talks = afterResultTalks.filter(talk => talk.heroineId === heroineId && (talk.routeMode === 'both' || talk.routeMode === routeMode));
  const eligible = talks.filter(talk => {
    if (typeof score !== 'number') return true;
    if (typeof talk.scoreMin === 'number' && score < talk.scoreMin) return false;
    if (typeof talk.scoreMax === 'number' && score > talk.scoreMax) return false;
    return true;
  });
  return pickTalk(eligible, seenTalkIds);
}

export function getDayEndTalk(heroineId, currentAffection, routeMode, seenTalkIds = []) {
  const talks = dayEndTalks.filter(talk => talk.heroineId === heroineId && (talk.routeMode === 'both' || talk.routeMode === routeMode));
  const eligible = talks.filter(talk => {
    if (typeof currentAffection !== 'number') return true;
    if (typeof talk.minAffection === 'number' && currentAffection < talk.minAffection) return false;
    if (typeof talk.maxAffection === 'number' && currentAffection > talk.maxAffection) return false;
    return true;
  });
  return pickTalk(eligible, seenTalkIds);
}

export function getEndingData(heroineId, endingType) {
  return NARRATIVE_SCRIPT.endings[heroineId]?.[endingType] || null;
}

export function getResultComment(heroineId, correctCount, totalQuestions = 5) {
  const comments = NARRATIVE_SCRIPT.resultComments[heroineId];
  if (!comments) return '';

  const ratio = correctCount / totalQuestions;
  let tier;
  if (ratio >= 1.0) tier = 'perfect';
  else if (ratio >= 0.6) tier = 'good';
  else if (ratio >= 0.4) tier = 'ok';
  else tier = 'bad';

  const pool = comments[tier] || [];
  return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : '';
}

export function getResultTier(correctCount, totalQuestions = 5) {
  const ratio = correctCount / totalQuestions;
  if (ratio >= 1.0) return 'perfect';
  if (ratio >= 0.6) return 'good';
  if (ratio >= 0.4) return 'ok';
  return 'bad';
}
