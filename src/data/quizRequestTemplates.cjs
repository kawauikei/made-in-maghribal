/**
 * Quiz request generation data for MadeInMaghribal.
 *
 * The quiz prompt is generated from:
 * customer profile -> difficulty -> condition pattern -> aliases -> speech style.
 * Do not expose raw taxonomy IDs such as SA / FOD in prompt text.
 */

const CUSTOMER_PROFILES = [
  {
    id: 'young_male_traveler',
    age: 'young',
    gender: 'male',
    social: 'traveler',
    iconTone: 'sky',
    speechStyle: 'young_male',
    label: '若い旅人風の男'
  },
  {
    id: 'young_female_apprentice',
    age: 'young',
    gender: 'female',
    social: 'apprentice',
    iconTone: 'mint',
    speechStyle: 'young_female',
    label: '若い見習い風の女性'
  },
  {
    id: 'adult_male_merchant',
    age: 'adult',
    gender: 'male',
    social: 'merchant',
    iconTone: 'amber',
    speechStyle: 'merchant_male',
    label: '商人風の男'
  },
  {
    id: 'adult_female_householder',
    age: 'adult',
    gender: 'female',
    social: 'householder',
    iconTone: 'rose',
    speechStyle: 'adult_female',
    label: '身なりのよい女性'
  },
  {
    id: 'adult_male_guard',
    age: 'adult',
    gender: 'male',
    social: 'guard',
    iconTone: 'steel',
    speechStyle: 'guard_male',
    label: '衛兵風の男'
  },
  {
    id: 'adult_female_noble',
    age: 'adult',
    gender: 'female',
    social: 'noble',
    iconTone: 'violet',
    speechStyle: 'noble_female',
    label: '貴族風の女性'
  },
  {
    id: 'old_male_scholar',
    age: 'old',
    gender: 'male',
    social: 'scholar',
    iconTone: 'indigo',
    speechStyle: 'old_male',
    label: '老いた学者風の男'
  },
  {
    id: 'old_female_fortune_teller',
    age: 'old',
    gender: 'female',
    social: 'mystic',
    iconTone: 'plum',
    speechStyle: 'old_female_mystic',
    label: '老いた占い師風の女性'
  }
];

const DIFFICULTY_WEIGHTS = {
  normal: {
    early: { easy: 72, normal: 24, hard: 4 },
    middle: { easy: 48, normal: 40, hard: 12 },
    late: { easy: 28, normal: 48, hard: 24 }
  },
  long_history: {
    early: { easy: 58, normal: 34, hard: 8 },
    middle: { easy: 34, normal: 48, hard: 18 },
    late: { easy: 18, normal: 48, hard: 34 }
  }
};

const CONDITION_PATTERN_WEIGHTS = {
  easy: [
    { id: 'itemType', weight: 50, conditions: ['itemType'] },
    { id: 'genre', weight: 50, conditions: ['genre'] }
  ],
  normal: [
    { id: 'quality_itemType', weight: 25, conditions: ['quality', 'itemType'] },
    { id: 'quality_genre', weight: 25, conditions: ['quality', 'genre'] },
    { id: 'principle_itemType', weight: 25, conditions: ['principle', 'itemType'] },
    { id: 'principle_genre', weight: 25, conditions: ['principle', 'genre'] }
  ],
  hard: [
    { id: 'quality_principle_itemType', weight: 50, conditions: ['quality', 'principle', 'itemType'] },
    { id: 'quality_principle_genre', weight: 50, conditions: ['quality', 'principle', 'genre'] }
  ]
};

const QUALITY_ALIASES = {
  normal: ['手頃な', '普段使いの', '扱いやすい', '肩肘張らない'],
  success: ['高品質な', '上等な', '目利き向けの', '丁寧に仕上げた'],
  great_success: ['傑作の', 'とびきり上等な', '特別な', '見事な']
};

const QUALITY_LEADS = {
  normal: ['普段使いの品を探しています', '手頃な品を探しています', '扱いやすい品が欲しいです'],
  success: ['上等な品を探しています', '目利きに耐える品が必要です', '丁寧に仕上げた品を探しています'],
  great_success: ['王宮に納める品です', '儀式にも使える品を探しています', 'とびきり見事な品が必要です']
};

const SOCIAL_TARGET_GENRES = {
  noble: ['ADN', 'CLT', 'RIT', 'FOD'],
  guard: ['ARM', 'TRV', 'DAY', 'MED', 'FOD'],
  merchant: ['TRD', 'FOD', 'DAY', 'ADN', 'WRK'],
  mystic: ['RIT', 'ADN', 'MED']
};

const SOCIAL_QUALITY_ALIASES = {
  noble: {
    normal: ['控えめで品のよい', '目立ちすぎない', '上品な普段使いの']
  },
  guard: {
    normal: ['扱いやすい', '丈夫な', '任務に持ち出しやすい'],
    success: ['信頼できる', '上等な', 'よく仕上げた']
  },
  merchant: {
    normal: ['仕入れやすい', '手頃な', '客に勧めやすい'],
    success: ['目利き向けの', '上等な', '評判を取れる']
  },
  mystic: {
    normal: ['穏やかな', '扱いやすい', '日々の占に使える'],
    success: ['気配の澄んだ', '上等な', '目利き向けの']
  }
};

const SOCIAL_QUALITY_LEADS = {
  noble: {
    normal: ['控えめで品のよいものを探しています', '目立ちすぎない品を探しています'],
    great_success: ['王宮に納める品です', '晴れの席にふさわしい品を探しています']
  },
  guard: {
    normal: ['任務に持ち出しやすい品が必要です', '扱いやすい品を探しています'],
    success: ['信頼できる品が必要です'],
    great_success: ['重要な任務に耐える品が必要です']
  },
  merchant: {
    normal: ['仕入れやすい品を探しています', '客に勧めやすい品が欲しいです'],
    success: ['目利きに耐える品を仕入れたいです'],
    great_success: ['大口の客に出せる品を探しています']
  },
  mystic: {
    normal: ['日々の占に使える品を探しています'],
    success: ['気配の澄んだ品を探しています'],
    great_success: ['大切な占に使う品が必要です']
  }
};

const REQUEST_GENRE_NAMES = {
  ADN: ['装飾品', '身飾り'],
  ARM: ['武器', '護身具'],
  CLT: ['衣服', '身につけるもの'],
  DAY: ['日用品', '暮らしの品', '普段使いの品'],
  FOD: ['食べ物', '保存食', '携行食'],
  MED: ['薬品', '薬'],
  RIT: ['儀礼用品', '祭具', '祈りの品'],
  TRD: ['商売道具', '交易品', '帳場道具'],
  TRV: ['旅具', '旅支度の品'],
  WRK: ['工房道具', '調合道具']
};

const REQUEST_SCENES = {
  ADN: ['贈り物にしたいんだ', '晴れの席に持っていきたい', '人前に出る用がある'],
  ARM: ['道中が少し物騒でな', '護衛の支度を整えている', '身を守る備えをしておきたい'],
  CLT: ['外出の支度を整えている', '人に会う予定がある', '砂風の強い日に着ていくものを探している'],
  DAY: ['家の用事で使いたい', '毎日の暮らしで役立つものを探している', '店先で長く使えるものが欲しい'],
  FOD: ['砂漠越えに持たせたい', '長旅の荷に入れたい', '腹を空かせた連れがいる'],
  MED: ['具合の悪い者に持たせたい', '旅先で使える備えが欲しい', '工房で使う薬の支度をしている'],
  RIT: ['祈りの場に持っていきたい', '祭壇に供える品を探している', '小さな儀礼に使うものがいる'],
  TRD: ['帳場で使えるものを探している', '取引先に見せても恥ずかしくないものが欲しい', '商いの支度をしている'],
  TRV: ['旅支度を整えている', '隊商に加わる予定がある', '砂道で使えるものを探している'],
  WRK: ['工房の手元に置きたい', '調合の支度をしている', '細かな作業に使えるものが欲しい']
};

const PRINCIPLE_REQUEST_HINTS = {
  AS: ['夜道で頼りになる', '星明かりに縁がある', '方角を見失わずに済みそうな'],
  EL: ['薬草の香りがする', '癒やしに使えそうな', '清らかな気配のある'],
  LI: ['体を持ち直せそうな', '活力を感じる', '病み上がりにも渡しやすい'],
  ME: ['細工の確かな', '金具や仕立てが頼もしい', '長く使っても崩れにくい'],
  SA: ['砂風に強そうな', '乾いた土地で扱いやすい', '砂漠の旅に向いた']
};

const QUALITY_REQUEST_HINTS = {
  normal: ['手頃で扱いやすい', '普段使いしやすい', '肩肘張らずに使える'],
  success: ['上等な', '目利きに見せても恥ずかしくない', '丁寧に仕上げた'],
  great_success: ['とびきり見事な', '晴れの席に出せる', '王宮に納めても恥ずかしくない']
};

const DECOY_DIFFICULTY_WEIGHTS = {
  normal: {
    early: { loose: 58, same_family: 34, near_match: 8 },
    middle: { loose: 28, same_family: 52, near_match: 20 },
    late: { loose: 14, same_family: 46, near_match: 40 }
  },
  long_history: {
    early: { loose: 42, same_family: 44, near_match: 14 },
    middle: { loose: 18, same_family: 50, near_match: 32 },
    late: { loose: 8, same_family: 40, near_match: 52 }
  }
};

const PRINCIPLE_PHRASE_SUFFIX = 'の術理を帯びた';

// Item type / genre / principle names must come from ITEM_DISPLAY_NAMES.
// Do not add hand-written aliases here unless they are audited against itemTypeName / genreName.
// A guessed alias can make prompts ask for one item while the choices contain another.

const SPEECH_PATTERNS = {
  young_male: [
    '{request}、あるか？',
    '{request}を頼むよ。',
    '{request}を見せてくれ。'
  ],
  young_female: [
    '{request}をお願いします。',
    '{request}を見せてもらえますか？',
    '{request}があると助かります。'
  ],
  merchant_male: [
    '{request}を仕入れたい。',
    '{request}を見せてくれ。',
    '{request}をいくつか見せてほしい。'
  ],
  adult_female: [
    '{request}をお願い。',
    '{request}を選んでもらえる？',
    '{request}を見せてくれる？'
  ],
  guard_male: [
    '{request}を頼む。',
    '{request}を見せてもらおう。',
    '{request}が必要だ。急ぎで頼む。'
  ],
  noble_female: [
    '{request}をお願いできますか。',
    '{request}を用意していただけますか。',
    '{request}を選んでいただける？'
  ],
  old_male: [
    '{request}を見せてもらえるかのう。',
    '{request}が要るんじゃ。',
    '{request}があれば助かるんじゃが。'
  ],
  old_female_mystic: [
    '{request}をおくれ。',
    '{request}を選んでおくれ。',
    '{request}を見せておくれ。'
  ]
};

const QUIZ_REQUEST_TEMPLATES = [
  {
    templateId: 'GENERATED_REQUEST',
    customerType: 'GENERATED',
    conditions: [],
    text: '自然文生成リクエスト'
  }
];

module.exports = {
  QUIZ_REQUEST_TEMPLATES,
  CUSTOMER_PROFILES,
  DIFFICULTY_WEIGHTS,
  CONDITION_PATTERN_WEIGHTS,
  QUALITY_ALIASES,
  QUALITY_LEADS,
  SOCIAL_TARGET_GENRES,
  SOCIAL_QUALITY_ALIASES,
  SOCIAL_QUALITY_LEADS,
  REQUEST_GENRE_NAMES,
  REQUEST_SCENES,
  PRINCIPLE_REQUEST_HINTS,
  QUALITY_REQUEST_HINTS,
  DECOY_DIFFICULTY_WEIGHTS,
  PRINCIPLE_PHRASE_SUFFIX,
  SPEECH_PATTERNS
};
