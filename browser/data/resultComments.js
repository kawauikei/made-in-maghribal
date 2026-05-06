/**
 * Heroine-specific result lines and expression stages.
 *
 * Result stage is intentionally 3-step only:
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
    encourage: '棚の流れはまだ揺れているわ。焦らず、注文の意味をひとつずつ掴み直しましょう。\n今回は守りを固める営業ね。次は品の理由まで見えてくるはずよ。',
    evaluate: '悪くないわ。棚の流れも、だいぶ読めてきたみたいね。\nこの手応えを次の接客に繋げれば、もっと安定した営業になるわ。',
    surprise: '完璧ね。ここまで綺麗に噛み合うなら、次も任せられるわ。\n品の選び方にも迷いがなかった。今の感覚、忘れないで。'
  },
  MIRA: {
    encourage: '大丈夫、店の空気はまだ暗くなってないよ。次でぱっと取り返そう。\nお客さんの目線をもう少し追えば、きっと流れが見えてくるから。',
    evaluate: 'いい感じ！店の空気も明るくなってきたね。\nこの調子で品物の並びを覚えていけば、次はもっと声をかけやすくなるよ。',
    surprise: 'すごいすごい！今の流れなら、次のお客さんも呼び込めるよ。\n棚も接客もぴったり噛み合ってた。これは噂になるかもね！'
  },
  DARIYA: {
    encourage: '少し星が曇ったみたい。けれど、品の声はまだ消えていないわ。\n次は急がず、気配の強いものから順に見ていきましょう。',
    evaluate: '静かだけれど、良い手応え。次の品も見えてきたわ。\nこの流れなら、星の巡りを読み違えることは少なくなるでしょう。',
    surprise: '星の巡りも味方しているわ。この流れは逃さないで。\n品物の気配とお客の願いが重なっていた。とても美しい営業だったわ。'
  }
};

const RESULT_GENRE_COMMENTS = {
  HAKIMA: {
    encourage: '{genre}が目立っていたわ。けれど、棚全体の意味はまだ少し散っている。\n焦らなくていい。次は注文の芯を見て、品を絞り込みましょう。',
    evaluate: '{genre}の流れが見えてきたわ。次の棚にも繋げられそうね。\n評価としては十分。あとは迷いを減らせば、もっと綺麗にまとまるわ。',
    surprise: '{genre}が綺麗に噛み合ったわ。この感覚、覚えておいて。\nここまで読めるなら、次の営業でも十分に勝負できるわね。'
  },
  MIRA: {
    encourage: '{genre}が多かったね。まだ流れを掴みきれてないけど、大丈夫。\n次はお客さんの声と品物の雰囲気を、もう少し近づけてみよう。',
    evaluate: '{genre}がよく動いたね！店の流れも掴めてきたよ。\nこの調子なら、次の接客ではもっと自然におすすめできそう。',
    surprise: '{genre}がばっちり当たったね！この調子なら噂も広がるよ。\n品物もお客さんも明るく見えてた。今の営業、かなり良かった！'
  },
  DARIYA: {
    encourage: '{genre}が多く巡ったわ。けれど、星はまだ揺れている。\n次は品の気配を急がず聞いて。そうすれば道は見えてくるわ。',
    evaluate: '{genre}の気配が強かったわ。次の品選びにも響きそうね。\n悪くない流れよ。静かに積み重ねれば、もっと深く読めるはず。',
    surprise: '{genre}が星の巡りに重なったわ。とても良い流れよ。\nここまで品物が応えてくれるなら、次の営業にも期待できるわ。'
  }
};

function normalizeHeroineId(id) {
  if (!id) return 'HAKIMA';
  return String(id).replace(/^CH_/i, '').toUpperCase();
}

function formatGenreComment(template, dominantGenre) {
  if (!template || !dominantGenre?.label) return '';
  return template.replace('{genre}', dominantGenre.label);
}

function getResultComment(heroineId, rank, dominantGenre = null) {
  const normalized = normalizeHeroineId(heroineId);
  const stage = getResultStage(rank);
  const genreTemplate = RESULT_GENRE_COMMENTS[normalized]?.[stage] || RESULT_GENRE_COMMENTS.HAKIMA[stage];
  const genreComment = dominantGenre ? formatGenreComment(genreTemplate, dominantGenre) : '';
  if (genreComment) return genreComment;
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
  RESULT_GENRE_COMMENTS,
  getResultStage,
  getResultComment,
  getResultExpression
};
