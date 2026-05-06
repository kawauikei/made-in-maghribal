/**
 * Event Master Data
 * One file to rule them all (for the scenario writer).
 */
const EVENT_MASTER = [
  {
    id: 'EV_OP_01',
    heroineId: 'COMMON',
    title: '砂漠の再会',
    summary: 'オアシスの街に到着し、懐かしい再会を果たすプロローグ。',
    condition: '初期解放'
  },
  {
    id: 'EV_HAKIMA_01',
    heroineId: 'HAKIMA',
    title: '秘密の茶会',
    summary: 'ハキマとの距離が縮まる、放課後の特別なひととき。',
    condition: 'ハキマ 満足度 50以上でクリア'
  },
  {
    id: 'EV_MIRA_01',
    heroineId: 'MIRA',
    title: 'バザールの喧騒',
    summary: 'ミラと一緒に市場を巡り、彼女の意外な一面を知る。',
    condition: 'ミラ 満足度 50以上でクリア'
  },
  {
    id: 'EV_DARIYA_01',
    heroineId: 'DARIYA',
    title: '星降る夜の願い',
    summary: 'ダリヤと星空を眺めながら、彼女の夢について語り合う。',
    condition: 'ダリヤ 満足度 50以上でクリア'
  }
];

if (typeof module !== 'undefined') {
  module.exports = { EVENT_MASTER };
}
