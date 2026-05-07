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
const { GALLERY_MANIFEST } = require('../data/galleryManifest.js');
let EVENT_MASTER;
try {
  EVENT_MASTER = require('../data/generated/eventManifest.cjs').EVENT_MANIFEST;
} catch (e) {
  // Fallback to legacy master if generated manifest is not available
  try {
    EVENT_MASTER = require('../data/eventMaster.cjs').EVENT_MASTER;
  } catch (e2) {
    EVENT_MASTER = [];
  }
}
const { loadPlayerProgress } = require('../utils/playerProgress.js');

const PANEL_TITLES = {
  event: 'イベント集',
  image: '画像集',
  sound: '音楽集',
  item: 'アイテム図鑑',
  freeplay: 'フリープレイ'
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

// Global scroll state for title panels
const panelState = {
  lastImageCategory: null
};


const QUALITY_LABELS = {
  normal: 'NORMAL',
  success: 'SUCCESS',
  great_success: 'GREAT SUCCESS'
};

const QUALITY_ORDER = ['normal', 'success', 'great_success'];

const SOUND_GROUP_ICONS = {
  system: { id: 'NADER', expression: 'normal', label: '共通' },
  extra: { id: 'NADER', expression: 'joy', label: '汎用' },
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

const { renderTitleShell } = require('./titleScreen.js');

function renderTitlePanel(controller, view) {
  const panel = controller.uiState?.titlePanel || 'item';
  const title = PANEL_TITLES[panel] || 'メニュー';

  const contentEl = renderTitleShell(controller, view);
  const shell = view.querySelector('.title-screen-with-art');
  if (shell) shell.classList.add('title-panel-screen');

  // 1. Capture current scroll position before re-rendering
  let savedScroll = 0;
  let isHorizontal = false;
  let targetSelector = '';

  if (panel === 'item') {
    targetSelector = '.item-gallery-grid';
  } else if (panel === 'image') {
    targetSelector = '.image-gallery-thumbnails-wrapper';
    isHorizontal = true;
  }

  if (targetSelector) {
    const el = view.querySelector(targetSelector);
    if (el) {
      savedScroll = isHorizontal ? el.scrollLeft : el.scrollTop;
    }
  }

  // If the category changed in the image gallery, we should reset the scroll
  const currentImageCategory = controller.uiState?.galleryCategory || '背景';
  if (panel === 'image' && panelState.lastImageCategory !== currentImageCategory) {
    savedScroll = 0;
    panelState.lastImageCategory = currentImageCategory;
  }

  contentEl.innerHTML = `
    <div class="title-panel-card">
      <div class="title-panel-header">
        <button class="title-panel-back" type="button" data-action="title-panel-back">戻る</button>
        <h2>${title}</h2>
      </div>
      <div class="title-panel-body">
        ${renderPanelBody(controller, panel)}
      </div>
    </div>
  `;

  // 2. Restore scroll position after DOM update
  if (targetSelector && savedScroll > 0) {
    requestAnimationFrame(() => {
      const el = view.querySelector(targetSelector);
      if (el) {
        if (isHorizontal) el.scrollLeft = savedScroll;
        else el.scrollTop = savedScroll;
      }
    });
  }
}

function renderPanelBody(controller, panel) {
  if (panel === 'item') return renderItemGallery(controller);
  if (panel === 'sound') return renderSoundTest(controller);
  if (panel === 'event') return renderEventGallery(controller);
  if (panel === 'image') return renderImageGallery(controller);
  if (panel === 'freeplay') return renderFreePlay(controller);
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
      <div class="item-detail-quality-label">${QUALITY_LABELS[quality]}</div>
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
  
  const events = Array.isArray(EVENT_MASTER) ? EVENT_MASTER : [];
  const cards = events.map((ev) => {
    // 解放条件: always または ヒロインの通常ルートクリア
    const isUnlocked = ev.unlock?.type === 'always' || (progress?.endings?.[ev.heroineId]?.normal?.normalCleared);
    const isSeen = progress?.eventSeen?.[ev.id];
    
    const displayTitle = isUnlocked ? (ev.title || '？？？？') : (ev.gallery?.hiddenTitle || '？？？？');
    const displaySummary = isUnlocked ? (ev.summary || '') : (ev.gallery?.hiddenSummary || '物語を読み進めると解放');
    const conditionText = isUnlocked ? (HEROINE_LABELS[ev.heroineId] || '共通') : '未解放';

    return `
      <div class="locked-gallery-card${isUnlocked ? ' is-unlocked' : ''}${isSeen ? ' is-seen' : ''}"
           ${isUnlocked ? `data-action="start-event" data-event-id="${ev.id}"` : ''}>
        <div class="locked-gallery-mark">${ev.heroineId === 'COMMON' ? '✦' : '✧'}</div>
        <div class="locked-gallery-content">
          <h3>${escapeHtml(displayTitle)}</h3>
          <p>${escapeHtml(displaySummary)}</p>
          <small>${escapeHtml(conditionText)}</small>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="locked-gallery-panel">
      <div class="title-panel-summary">物語の記録</div>
      <div class="locked-gallery-grid">${cards}</div>
      <p class="title-panel-note">一度見たイベントをこちらで振り返ることができます。</p>
    </div>
  `;
}

function renderImageGallery(controller) {
  const { imageSeen } = loadPlayerProgress();
  const categories = ['背景', 'スチル', 'ヒロイン立ち絵'];
  const activeCategory = controller.uiState.galleryCategory || '背景';
  const activeIndex = controller.uiState.galleryIndex || 0;

  const categoryItems = GALLERY_MANIFEST.filter((item) => item.category === activeCategory);
  const activeItem = categoryItems[activeIndex];

  const tabs = categories.map((cat) => `
    <button class="image-gallery-tab-btn${activeCategory === cat ? ' is-active' : ''}" 
            type="button" data-action="gallery-tab" data-gallery-category="${cat}">
      ${cat}
    </button>
  `).join('');

  const thumbnails = categoryItems.map((item, index) => {
    // Backgrounds are always unlocked for now, others need to be seen
    const isUnlocked = item.category === '背景' || !!imageSeen[item.id];
    const isActive = index === activeIndex;
    
    return `
      <div class="image-gallery-thumb${isActive ? ' is-active' : ''}${!isUnlocked ? ' is-locked' : ''}" 
           ${isUnlocked ? `data-action="gallery-select" data-gallery-index="${index}"` : ''}>
        ${isUnlocked ? `<img src="${item.path}" alt="${escapeHtml(item.title)}" />` : '<span>？</span>'}
      </div>
    `;
  }).join('') || '<div class="image-gallery-thumb-empty">登録されている画像がありません</div>';

  const viewerContent = activeItem && (activeItem.category === '背景' || !!imageSeen[activeItem.id])
    ? `
      <img src="${activeItem.path}" class="image-gallery-viewer-main" alt="${escapeHtml(activeItem.title)}" />
      <div class="image-gallery-info">
        <h3>${escapeHtml(activeItem.title)}</h3>
      </div>
    `
    : `
      <div class="image-gallery-viewer-placeholder">
        <span>🖼️</span>
        <p>未解放の画像です</p>
      </div>
    `;

  return `
    <div class="image-gallery-container">
      <nav class="image-gallery-tabs">
        ${tabs}
      </nav>
      
      <div class="image-gallery-viewer">
        ${viewerContent}
      </div>
      
      <div class="image-gallery-thumbnails-wrapper">
        <div class="image-gallery-thumbnails">
          ${thumbnails}
        </div>
      </div>
    </div>
  `;
}

function renderFreePlay(controller) {
  const bgmGroups = buildBgmGroups();
  const options = bgmGroups.flatMap(g => g.tracks).map(track => {
    const label = formatTrackButtonLabel(track.kind, track.title || track.label || track.id);
    return `<option value="${track.path}">${escapeHtml(label)}</option>`;
  }).join('');

  return `
    <div class="title-panel-empty">
      <div class="load-save-card">
        <h3>フリー接客設定</h3>
        <div class="load-save-meta">
          <div class="load-save-row">
            <span>BGM</span>
            <select id="freeplay-bgm" style="width: 200px; padding: 4px; border-radius: 4px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.2);">
              ${options}
            </select>
          </div>
          <div class="load-save-row">
            <span>問題数</span>
            <select id="freeplay-count" style="width: 200px; padding: 4px; border-radius: 4px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.2);">
              <option value="5">5問</option>
              <option value="10" selected>10問</option>
              <option value="20">20問</option>
            </select>
          </div>
        </div>
        <div class="load-save-actions">
          <button class="title-start-btn" type="button" data-action="start-freeplay">接客開始</button>
        </div>
        <p class="title-panel-note">好きなBGMで接客の練習ができます。</p>
      </div>
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

function formatTrackButtonLabel(kind, title) {
  const safeKind = String(kind || '').trim();
  const safeTitle = String(title || '').trim();
  if (safeKind && safeTitle) return `${safeKind}「${safeTitle}」`;
  return safeTitle || safeKind || '未設定';
}

function getBgmDisplayTitle(path) {
  const groups = buildBgmGroups();
  for (const group of groups) {
    const found = group.tracks.find((track) => track.path === path);
    if (found) return found.title || found.label || found.id || path;
  }
  return path ? path.split('/').pop() : '';
}

function renderBgmTrackButton(track) {
  const label = formatTrackButtonLabel(track.kind, track.title || track.label || track.id);
  return `
    <button class="sound-test-row sound-test-row-bgm" type="button" data-sound-bgm-path="${track.path}" data-sound-id="${track.id}" data-sound-title="${escapeHtml(track.title || track.label || track.id || track.path)}">
      <span class="sound-track-label">${escapeHtml(label)}</span>
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
  const systemKinds = ['オープニング', 'ゲームテーマ', 'クイズ'];
  const system = (AUDIO_MANIFEST?.bgm?.system || []).map((track, index) => ({
    ...track,
    kind: systemKinds[index] || '共通',
    label: track.title || track.id
  }));
  groups.push({ key: 'system', label: '共通', tracks: system });

  const heroineKinds = ['クイズA', 'クイズB', 'クイズC', 'クイズD'];
  const endingKinds = { normal: '通常エンド', good: 'グッドエンドA', secret: 'グッドエンドB' };
  for (const heroineId of ['HAKIMA', 'MIRA', 'DARIYA']) {
    const group = AUDIO_MANIFEST?.bgm?.heroines?.[heroineId] || {};
    const heroineTracks = [];
    if (group.theme) heroineTracks.push({ ...group.theme, kind: 'テーマ', label: group.theme.title || 'テーマ' });
    (group.game || []).forEach((track, index) => heroineTracks.push({ ...track, kind: heroineKinds[index] || `クイズ${index + 1}`, label: track.title || heroineKinds[index] || `クイズ${index + 1}` }));
    for (const key of ['normal', 'good', 'secret']) {
      const track = group.ending?.[key];
      if (track?.path) heroineTracks.push({ ...track, kind: endingKinds[key] || 'エンディング', label: track.title || track.id || 'エンディング' });
    }
    groups.push({ key: heroineId, label: HEROINE_LABELS[heroineId], tracks: heroineTracks });
  }

  const extra = (AUDIO_MANIFEST?.bgm?.extra || []).map((track) => ({
    ...track,
    kind: `${track.mood || '汎用'}${track.variant ? track.variant : ''}`,
    label: track.title || `${track.mood || track.id}${track.variant ? ` ${track.variant}` : ''}`
  }));
  groups.push({ key: 'extra', label: '汎用', tracks: extra });
  return groups;
}

function renderSfxTrackButton(track) {
  return `
    <button class="sound-test-row sound-test-row-sfx" type="button" data-sound-sfx-path="${track.path}" data-sound-sfx-key="${track.key}">
      <span class="sound-track-label">${escapeHtml(track.title || track.key || track.id)}</span>
    </button>
  `;
}

function buildSfxGroups() {
  const tracks = (AUDIO_MANIFEST?.se?.all || [])
    .filter((track) => track.path)
    .map((track) => ({
      ...track,
      title: track.title || track.path.split('/').pop() || track.id || track.key
    }));
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

  const currentTitle = currentPath ? getBgmDisplayTitle(currentPath) : '';

  return `
    <div class="sound-test-panel">
      <div class="sound-test-toolbar">
        <p data-sound-test-message>${currentTitle ? escapeHtml(currentTitle) : 'BGMを選ぶとフェード付きで試聴します。'}</p>
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
