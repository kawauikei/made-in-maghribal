/**
 * Heroine-specific result lines and expression stages.
 *
 * The result stage is intentionally 3-step only:
 * - encourage: low result / gentle recovery line / sorrow expression
 * - evaluate: normal-good result / practical evaluation / fun expression
 * - surprise: excellent result / delighted or impressed line / joy expression
 */
const RESULT_STAGES = {
  encourage: { expression: 'sorrow' },
  evaluate: { expression: 'fun' },
  surprise: { expression: 'joy' }
};

function getResultStage(rank) {
  if (rank === '大成功') return 'surprise';
  if (rank === '成功') return 'evaluate';
  return 'encourage';
}

const RESULT_COMMENTS = {
  HAKIMA: {
    encourage: '焦らなくていいわ。次の手応えを、ここから整えましょう。',
    evaluate: '悪くないわ。棚の流れも、だいぶ読めてきたみたいね。',
    surprise: '完璧ね。ここまで綺麗に噛み合うなら、次も任せられるわ。'
  },
  MIRA: {
    encourage: '大丈夫。流れは悪くないよ、次でぱっと取り返そう。',
    evaluate: 'いい感じ！店の空気も明るくなってきたね。',
    surprise: 'すごいすごい！今の流れなら、次のお客さんも呼び込めるよ。'
  },
  DARIYA: {
    encourage: '少し星が曇ったみたい。次は品の声をよく聞きましょう。',
    evaluate: '静かだけれど、良い手応え。次の品も見えてきたわ。',
    surprise: '星の巡りも味方しているわ。この流れは逃さないで。'
  }
};

function normalizeHeroineId(id) {
  if (!id) return 'HAKIMA';
  return String(id).replace(/^CH_/i, '').toUpperCase();
}

function getResultComment(heroineId, rank) {
  const normalized = normalizeHeroineId(heroineId);
  const stage = getResultStage(rank);
  return (
    RESULT_COMMENTS[normalized]?.[stage] ||
    RESULT_COMMENTS.HAKIMA[stage] ||
    '次の営業に向けて、静かに帳簿を整えよう。'
  );
}

function getResultExpression(rank) {
  const stage = getResultStage(rank);
  return RESULT_STAGES[stage]?.expression || 'fun';
}

module.exports = {
  RESULT_STAGES,
  RESULT_COMMENTS,
  getResultStage,
  getResultComment,
  getResultExpression
};
