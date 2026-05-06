/**
 * Title menu sub screens.
 * These are intentionally lightweight: title menu entries can become real
 * screens without changing GameSession phases.
 */

const { AUDIO_MANIFEST } = require('../data/audioManifest.cjs');
const { ITEM_MASTER } = require('../data/itemMaster.cjs');
const { loadItemCollection } = require('../utils/itemCollection.js');

const PANEL_TITLES = {
  load: 'ロード',
  event: 'イベントギャラリー',
  image: '画像ギャラリー',
  sound: 'サウンドテスト',
  item: 'アイテム図鑑'
};

function renderTitlePanel(controller, view) {
  const panel = controller.uiState?.titlePanel || 'item';
  const title = PANEL_TITLES[panel] || 'メニュー';

  view.innerHTML = `
    <div class="title-screen title-screen-with-art title-panel-screen">
      <div class="title-panel-card">
        <div class="title-panel-header">
          <button class="title-panel-back" type="button" data-action="title-panel-back">戻る</button>
          <h2>${title}</h2>
        </div>
        <div class="title-panel-body">
          ${renderPanelBody(controller, panel)}
        </div>
      </div>
    </div>
  `;
}

function renderPanelBody(controller, panel) {
  if (panel === 'item') return renderItemGallery(controller);
  if (panel === 'sound') return renderSoundTest();
  if (panel === 'load') return renderLoadPanel(controller);
  return renderPlaceholder(panel);
}

function renderLoadPanel(controller) {
  const canContinue = controller.hasSaveData ? controller.hasSaveData() : false;
  return `
    <div class="title-panel-empty">
      <p>現在の簡易ロードはタイトルの「つづきから」を使用します。</p>
      <button class="title-start-btn title-panel-continue" type="button" ${canContinue ? 'data-action="title-continue"' : 'disabled aria-disabled="true"'}>つづきから</button>
      <p class="title-panel-note">後続で複数スロット/回想/図鑑状態を統合します。</p>
    </div>
  `;
}

function renderPlaceholder(panel) {
  const notes = {
    event: '閲覧済みイベントの回想をここに並べる予定です。',
    image: '解放済みスチルや背景をここに並べる予定です。'
  };
  return `
    <div class="title-panel-empty">
      <p>${notes[panel] || '後続実装です。'}</p>
      <p class="title-panel-note">この入口だけ先に固定しています。</p>
    </div>
  `;
}

function renderItemGallery(controller) {
  const collection = loadItemCollection();
  const seenIds = new Set(Object.keys(collection).filter((itemId) => collection[itemId]?.seen));
  const total = ITEM_MASTER.length;
  const seenCount = seenIds.size;
  const items = ITEM_MASTER.map((item) => {
    const seen = seenIds.has(item.itemId);
    const name = controller.getItemDisplayName ? controller.getItemDisplayName(item.itemId) : item.name;
    const icon = controller.getItemIconPath ? controller.getItemIconPath(item.itemId) : `images/items/${item.itemId}.png`;
    return `
      <div class="gallery-item-tile${seen ? ' is-seen' : ' is-locked'}" title="${seen ? name : '未登録'}">
        ${seen ? `<img src="${icon}" alt="${name}" onerror="this.style.display='none'" />` : '<span>？</span>'}
      </div>
    `;
  }).join('');

  return `
    <div class="item-gallery-panel">
      <div class="title-panel-summary">登録済み ${seenCount} / ${total}</div>
      <div class="item-gallery-grid">${items}</div>
    </div>
  `;
}

function flattenBgmTracks() {
  const tracks = [];
  (AUDIO_MANIFEST?.bgm?.system || []).forEach((track) => tracks.push({ ...track, label: track.title || track.id }));
  for (const [heroineId, group] of Object.entries(AUDIO_MANIFEST?.bgm?.heroines || {})) {
    if (group.theme) tracks.push({ ...group.theme, label: `${heroineId} theme` });
    (group.game || []).forEach((track, index) => tracks.push({ ...track, label: `${heroineId} game ${index + 1}` }));
    if (group.ending?.normal) tracks.push({ ...group.ending.normal, label: `${heroineId} ending normal` });
    if (group.ending?.good) tracks.push({ ...group.ending.good, label: `${heroineId} ending good` });
  }
  (AUDIO_MANIFEST?.bgm?.extra || []).forEach((track) => tracks.push({ ...track, label: `extra ${track.mood || track.id}` }));
  return tracks;
}

function flattenSfxTracks() {
  const groups = AUDIO_MANIFEST?.se || {};
  return Object.values(groups).flat().filter((track) => track.key);
}

function renderSoundTest() {
  const bgmButtons = flattenBgmTracks().map((track) => `
    <button class="sound-test-row" type="button" data-sound-bgm-path="${track.path}" data-sound-id="${track.id}">
      <span>${track.label || track.id}</span>
      <small>BGM</small>
    </button>
  `).join('');
  const sfxButtons = flattenSfxTracks().map((track) => `
    <button class="sound-test-row" type="button" data-sound-sfx-key="${track.key}">
      <span>${track.key}</span>
      <small>SE</small>
    </button>
  `).join('');

  return `
    <div class="sound-test-panel">
      <div class="sound-test-actions">
        <button class="title-menu-btn" type="button" data-action="sound-stop-bgm">BGM停止</button>
      </div>
      <h3>BGM</h3>
      <div class="sound-test-list">${bgmButtons}</div>
      <h3>SE</h3>
      <div class="sound-test-list sound-test-list-sfx">${sfxButtons}</div>
    </div>
  `;
}

module.exports = {
  renderTitlePanel
};
