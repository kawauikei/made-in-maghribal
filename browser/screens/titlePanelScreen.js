/**
 * Title menu sub screens.
 * These are intentionally lightweight: title menu entries can become real
 * screens without changing GameSession phases.
 */

const { AUDIO_MANIFEST } = require('../data/audioManifest.cjs');
const { ITEM_MASTER } = require('../data/itemMaster.cjs');
const { ITEM_DISPLAY_NAMES } = require('../data/itemDisplayNames.cjs');
const { ITEM_TEXTS } = require('../data/itemTexts.cjs');
const { getCharacterIconPath } = require('../utils/assetPaths.js');
const { loadItemCollection } = require('../utils/itemCollection.js');
const { getHeroineDisplayName } = require('../utils/displayNames.js');

const PANEL_TITLES = {
  load: 'ロード',
  event: 'イベントギャラリー',
  image: '画像ギャラリー',
  sound: 'サウンドテスト',
  item: 'アイテム図鑑'
};

const GENRE_LABELS = {
  ADN: 'アクセサリー',
  ARM: '防具',
  CLT: '衣服',
  DAY: '日用品',
  FOD: '食品',
  MED: '薬品',
  RIT: '儀式具',
  TRD: '交易品',
  TRV: '旅道具',
  WRK: '道具'
};

const PRINCIPLE_LABELS = {
  AS: '星',
  EL: '霊薬',
  LI: '光',
  ME: '金属',
  SA: '砂'
};

const HEROINE_LABELS = {
  HAKIMA: 'ハキマ',
  MIRA: 'ミラ',
  DARIYA: 'ダリヤ'
};


const QUALITY_LABELS = {
  normal: '通常品質',
  success: '成功品質',
  great_success: '大成功品質'
};

const QUALITY_ORDER = ['normal', 'success', 'great_success'];

const SOUND_GROUP_ICONS = {
  system: { id: 'NADER', expression: 'normal', label: '共通' },
  extra: { id: 'NADER', expression: 'joy', label: '表情' },
  HAKIMA: { id: 'HAKIMA', expression: 'social', label: 'ハキマ' },
  MIRA: { id: 'MIRA', expression: 'social', label: 'ミラ' },
  DARIYA: { id: 'DARIYA', expression: 'social', label: 'ダリヤ' },
  se: { id: 'NADER', expression: 'fun', label: 'SE' }
};

const SE_GROUP_LABELS = {
  quiz: 'クイズSE',
  ui: 'UI SE',
  day_end: 'ターン転換SE'
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function formatItemQualityText(value) {
  const text = escapeHtml(value || '説明文未登録');
  return text.replace(/（効果/g, '<br>（効果');
}

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
  if (panel === 'sound') return renderSoundTest(controller);
  if (panel === 'load') return renderLoadPanel(controller);
  if (panel === 'event') return renderEventGallery(controller);
  if (panel === 'image') return renderImageGallery(controller);
  return renderPlaceholder(panel);
}

function getSubPhaseLabel(subPhase) {
  const labels = {
    BEFORE_OPEN: '開店前',
    QUIZ: '接客中',
    TURN_RESULT: '営業結果',
    AFTER_CLOSE: '閉店後'
  };
  return labels[subPhase] || '進行中';
}

function renderLoadPanel(controller) {
  const summary = controller.getSaveSummary ? controller.getSaveSummary() : null;
  if (!summary) {
    return `
      <div class="title-panel-empty title-load-panel">
        <p>再開できるセーブはありません。</p>
        <p class="title-panel-note">営業中に自動保存されたデータがここに表示されます。</p>
      </div>
    `;
  }

  const heroineName = getHeroineDisplayName(summary.selectedHeroineId);
  const score = summary.scores || {};
  const questionProgress = `${Math.min(summary.questionIndex + 1, summary.totalQuestions)} / ${summary.totalQuestions}`;
  const quizNote = summary.subPhase === 'QUIZ'
    ? `<div class="load-save-row"><span>クイズ</span><strong>${questionProgress}</strong></div>`
    : '';

  return `
    <div class="title-load-panel">
      <div class="load-save-card">
        <div class="load-save-kicker">Autosave</div>
        <h3>${heroineName} / ${summary.turn}ターン目</h3>
        <div class="load-save-meta">
          <div class="load-save-row"><span>保存</span><strong>${summary.savedAtLabel}</strong></div>
          <div class="load-save-row"><span>状態</span><strong>${getSubPhaseLabel(summary.subPhase)}</strong></div>
          ${quizNote}
          <div class="load-save-row"><span>満足度</span><strong>${score.satisfaction || 0}</strong></div>
          <div class="load-save-row"><span>評判</span><strong>${score.reputation || 0}</strong></div>
        </div>
        <div class="load-save-actions">
          <button class="title-start-btn title-panel-continue" type="button" data-action="title-continue">このセーブから再開</button>
          <button class="title-menu-btn title-panel-clear-save" type="button" data-action="title-clear-save">セーブを消す</button>
        </div>
        <p class="title-panel-note">現在は自動保存1枠です。複数スロットと長期記録は後続で統合します。</p>
      </div>
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

function getItemMeta(itemId) {
  return ITEM_DISPLAY_NAMES[itemId] || {};
}

function buildItemStats(seenIds) {
  const byGenre = {};
  const byPrinciple = {};
  ITEM_MASTER.forEach((item) => {
    if (!seenIds.has(item.itemId)) return;
    byGenre[item.genre] = (byGenre[item.genre] || 0) + 1;
    byPrinciple[item.principle] = (byPrinciple[item.principle] || 0) + 1;
  });
  return { byGenre, byPrinciple };
}

function renderStatChips(record, labels, unit = '件') {
  return Object.entries(labels).map(([key, label]) => {
    const count = record[key] || 0;
    return `<span class="gallery-stat-chip${count ? ' is-unlocked' : ''}">${label}<strong>${count}${unit}</strong></span>`;
  }).join('');
}

function getItemGalleryModel(controller, item) {
  const meta = getItemMeta(item.itemId);
  const name = controller.getItemDisplayName ? controller.getItemDisplayName(item.itemId) : (meta.base || item.name);
  return {
    item,
    meta,
    name,
    icon: controller.getItemIconPath ? controller.getItemIconPath(item.itemId) : `images/items/${item.itemId}.png`,
    genreName: meta.genreName || GENRE_LABELS[item.genre] || item.genre,
    principleName: meta.principleName || PRINCIPLE_LABELS[item.principle] || item.principle,
    typeName: meta.itemTypeName || `${item.genre}-${item.rank}`
  };
}

function renderItemDetailModal(controller, seenItems) {
  const modal = controller.uiState?.itemDetailModal;
  if (!modal || !seenItems.length) return '';
  const index = Math.max(0, Math.min(Number(modal.index) || 0, seenItems.length - 1));
  const model = getItemGalleryModel(controller, seenItems[index]);
  const texts = ITEM_TEXTS[model.item.itemId] || {};
  const qualityCards = QUALITY_ORDER.map((quality) => `
    <section class="item-detail-quality item-detail-quality-${quality}">
      <p>${formatItemQualityText(texts[quality])}</p>
    </section>
  `).join('');

  const prevIndex = (index - 1 + seenItems.length) % seenItems.length;
  const nextIndex = (index + 1) % seenItems.length;
  return `
    <div class="item-detail-backdrop" data-action="item-detail-close">
      <article class="item-detail-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(model.name)} 詳細">
        <button class="item-detail-close" type="button" data-action="item-detail-close">×</button>
        <div class="item-detail-head">
          <div class="item-detail-icon-frame"><img src="${model.icon}" alt="${escapeHtml(model.name)}" onerror="this.style.display='none'" /></div>
          <div>
            <p class="item-detail-kicker">${index + 1} / ${seenItems.length}</p>
            <h3>${escapeHtml(model.name)}</h3>
            <p>${escapeHtml(model.genreName)} / ${escapeHtml(model.principleName)} / ${escapeHtml(model.typeName)}</p>
          </div>
        </div>
        <div class="item-detail-quality-grid">${qualityCards}</div>
        <div class="item-detail-nav">
          <button class="title-menu-btn" type="button" data-item-detail-index="${prevIndex}">前</button>
          <button class="title-menu-btn" type="button" data-item-detail-index="${nextIndex}">次</button>
        </div>
      </article>
    </div>
  `;
}

function renderItemGallery(controller) {
  const collection = loadItemCollection();
  const seenIds = new Set(Object.keys(collection).filter((itemId) => collection[itemId]?.seen));
  const total = ITEM_MASTER.length;
  const seenCount = seenIds.size;
  const stats = buildItemStats(seenIds);
  const percent = total ? Math.floor((seenCount / total) * 100) : 0;
  const seenItems = ITEM_MASTER.filter((item) => seenIds.has(item.itemId));
  const seenIndexById = new Map(seenItems.map((item, index) => [item.itemId, index]));

  const items = ITEM_MASTER.map((item) => {
    const seen = seenIds.has(item.itemId);
    const model = getItemGalleryModel(controller, item);
    const title = seen ? `${model.name} / ${model.genreName} / ${model.principleName}` : '未登録';
    const detailIndex = seenIndexById.get(item.itemId);
    const tag = seen ? 'button' : 'div';
    const detailAttr = seen ? ` type="button" data-item-detail-index="${detailIndex}"` : '';

    return `
      <${tag} class="gallery-item-tile${seen ? ' is-seen' : ' is-locked'}" title="${escapeHtml(title)}"${detailAttr}>
        <div class="gallery-item-icon-frame">
          <div class="gallery-item-icon">
            ${seen ? `<img src="${model.icon}" alt="${escapeHtml(model.name)}" onerror="this.style.display='none'" />` : '<span>？</span>'}
          </div>
        </div>
        <div class="gallery-item-info">
          <strong>${seen ? escapeHtml(model.name) : '未登録'}</strong>
          <small>${seen ? `${escapeHtml(model.genreName)} / ${escapeHtml(model.principleName)} / ${escapeHtml(model.typeName)}` : '接客候補に出ると登録'}</small>
        </div>
      </${tag}>
    `;
  }).join('');

  return `
    <div class="item-gallery-panel">
      <div class="title-panel-summary gallery-summary-card">
        <div>
          <span>登録済み</span>
          <strong>${seenCount} / ${total}</strong>
        </div>
        <div class="gallery-progress" aria-label="図鑑登録率 ${percent}%">
          <span style="width:${percent}%"></span>
        </div>
      </div>
      <div class="gallery-stat-block">
        <p>分類</p>
        <div class="gallery-stat-list">${renderStatChips(stats.byGenre, GENRE_LABELS)}</div>
      </div>
      <div class="gallery-stat-block gallery-stat-block-compact">
        <p>術理</p>
        <div class="gallery-stat-list">${renderStatChips(stats.byPrinciple, PRINCIPLE_LABELS)}</div>
      </div>
      <div class="item-gallery-grid">${items}</div>
      ${renderItemDetailModal(controller, seenItems)}
    </div>
  `;
}

function renderEventGallery(controller) {
  const progress = controller.getPlayerProgressSummary ? controller.getPlayerProgressSummary() : null;
  const cards = Object.entries(HEROINE_LABELS).map(([heroineId, name]) => {
    const normal = progress?.endings?.[heroineId]?.normal || {};
    const longHistory = progress?.endings?.[heroineId]?.long_history || {};
    const unlocked = progress?.heroineModeUnlocks?.[heroineId]?.long_history;
    const best = progress?.bestRecords?.[heroineId]?.normal || {};
    return `
      <div class="locked-gallery-card${normal.normalCleared || longHistory.normalCleared ? ' is-unlocked' : ''}">
        <div class="locked-gallery-mark">✦</div>
        <h3>${name}</h3>
        <p>通常: ${normal.goodCleared ? 'GOOD済み' : (normal.normalCleared ? 'CLEAR済み' : '未クリア')}</p>
        <p>IF: ${unlocked ? '解放済み' : '未解放'} / ${longHistory.goodCleared ? 'GOOD済み' : (longHistory.normalCleared ? 'CLEAR済み' : '未クリア')}</p>
        <small>最高 満足度${best.satisfaction || 0} / 評判${best.reputation || 0}</small>
      </div>
    `;
  }).join('');

  return `
    <div class="locked-gallery-panel">
      <div class="title-panel-summary">エンディング記録とモード解放状態を保存中</div>
      <div class="locked-gallery-grid">${cards}</div>
      <p class="title-panel-note">イベント単位の閲覧フラグは後続接続です。現在はヒロイン別のクリア記録を先に表示します。</p>
    </div>
  `;
}

function renderImageGallery(controller) {
  const progress = controller.getPlayerProgressSummary ? controller.getPlayerProgressSummary() : null;
  const imageSeenCount = progress?.imageSeenCount || 0;
  const cards = [
    ['背景', 'タイトル・店内・オアシスなどの解放済み背景'],
    ['スチル', 'エンディングやイベント用の一枚絵'],
    ['キャラ', 'standing/face_proc 参照の確認用一覧']
  ].map(([title, note]) => `
    <div class="locked-gallery-card">
      <div class="locked-gallery-mark">◇</div>
      <h3>${title}</h3>
      <p>${note}</p>
      <small>Coming Later</small>
    </div>
  `).join('');

  return `
    <div class="locked-gallery-panel">
      <div class="title-panel-summary">画像ギャラリーの入口を固定済み / 解放 ${imageSeenCount}件</div>
      <div class="locked-gallery-grid">${cards}</div>
      <p class="title-panel-note">bustup_proc は使わず、既存の standing_proc / face_proc 方針に合わせて後続接続します。</p>
    </div>
  `;
}

function makeSoundHeading(key, fallbackLabel) {
  const info = SOUND_GROUP_ICONS[key] || SOUND_GROUP_ICONS.se;
  return `
    <div class="sound-group-heading">
      <img src="${getCharacterIconPath(info.id, info.expression)}" alt="" onerror="this.style.display='none'" />
      <span>${escapeHtml(info.label || fallbackLabel || key)}</span>
    </div>
  `;
}

function renderBgmTrackButton(track) {
  return `
    <button class="sound-test-row" type="button" data-sound-bgm-path="${track.path}" data-sound-id="${track.id}">
      <span>${escapeHtml(track.label)}</span>
      <small>BGM</small>
    </button>
  `;
}

function renderSoundGroup(key, label, tracks, renderTrack) {
  if (!tracks.length) return '';
  return `
    <section class="sound-test-group">
      ${makeSoundHeading(key, label)}
      <div class="sound-test-list">${tracks.map(renderTrack).join('')}</div>
    </section>
  `;
}

function buildBgmGroups() {
  const groups = [];
  const system = (AUDIO_MANIFEST?.bgm?.system || []).map((track) => ({
    ...track,
    label: track.title || track.id
  }));
  groups.push({ key: 'system', label: '共通', tracks: system });

  for (const heroineId of ['HAKIMA', 'MIRA', 'DARIYA']) {
    const group = AUDIO_MANIFEST?.bgm?.heroines?.[heroineId] || {};
    const heroineTracks = [];
    if (group.theme) heroineTracks.push({ ...group.theme, label: 'テーマ' });
    (group.game || []).forEach((track, index) => heroineTracks.push({ ...track, label: `ゲーム曲 ${index + 1}` }));
    if (group.ending?.normal) heroineTracks.push({ ...group.ending.normal, label: '通常エンディング' });
    if (group.ending?.good) heroineTracks.push({ ...group.ending.good, label: 'グッドエンディング' });
    groups.push({ key: heroineId, label: HEROINE_LABELS[heroineId], tracks: heroineTracks });
  }

  const extra = (AUDIO_MANIFEST?.bgm?.extra || []).map((track) => ({
    ...track,
    label: track.title || `${track.mood || track.id}${track.variant ? ` ${track.variant}` : ''}`
  }));
  groups.push({ key: 'extra', label: '表情', tracks: extra });
  return groups;
}

function renderSfxTrackButton(track) {
  return `
    <button class="sound-test-row" type="button" data-sound-sfx-key="${track.key}">
      <span>${escapeHtml(track.title || track.key)}</span>
      <small>${escapeHtml(track.key)}</small>
    </button>
  `;
}

function buildSfxGroups() {
  const groups = AUDIO_MANIFEST?.se || {};
  const tracks = Object.entries(groups).flatMap(([groupName, groupTracks]) => (
    (groupTracks || [])
      .filter((track) => track.key)
      .map((track) => ({
        ...track,
        title: `${SE_GROUP_LABELS[groupName] || groupName} / ${track.id || track.key}`
      }))
  ));
  return [{ key: 'se', label: 'SE', tracks }];
}

function renderSoundTest(controller) {
  const bgmState = controller.getBgmState ? controller.getBgmState() : null;
  const currentPath = bgmState?.currentPath || bgmState?.pendingPath || '';
  const bgmGroups = buildBgmGroups()
    .map((group) => renderSoundGroup(group.key, group.label, group.tracks, renderBgmTrackButton))
    .join('');
  const sfxGroups = buildSfxGroups()
    .map((group) => renderSoundGroup(group.key, group.label, group.tracks, renderSfxTrackButton))
    .join('');

  return `
    <div class="sound-test-panel">
      <div class="sound-test-toolbar">
        <p data-sound-test-message>${currentPath ? `BGM: ${escapeHtml(currentPath)}` : 'BGMを選ぶとフェード付きで試聴します。'}</p>
        <button class="title-menu-btn" type="button" data-action="sound-stop-bgm">BGM停止</button>
      </div>
      <div class="sound-test-scroll">
        <h3>BGM</h3>
        ${bgmGroups}
        <h3>SE</h3>
        ${sfxGroups}
      </div>
    </div>
  `;
}

module.exports = {
  renderTitlePanel
};
