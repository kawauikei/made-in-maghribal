/**
 * Sync Gallery Assets
 *
 * Scans actual image files and generates:
 * - browser/data/galleryManifest.js       game/runtime catalog
 * - docs/generated/event_asset_catalog.md authoring catalog for event scripts
 *
 * This tool is intentionally a catalog builder only. Runtime preload policy stays
 * in browser/utils/preloadAssets.js:
 * - A: opening/common assets
 * - B: selected heroine + selected heroine event assets
 * There is no event-before-play preload stage.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const bgDir = path.join(publicDir, 'images/background');
const stillDir = path.join(publicDir, 'images/still');
const charsDir = path.join(publicDir, 'characters');
const outputFile = path.join(projectRoot, 'browser/data/galleryManifest.js');
const catalogFile = path.join(projectRoot, 'docs/generated/event_asset_catalog.md');

const IMAGE_EXT_RE = /\.(png|jpg|jpeg|webp)$/i;
const HEROINE_NAMES = {
  hakima: 'HAKIMA',
  mira: 'MIRA',
  dariya: 'DARIYA',
  nader: 'NADER',
  nadir: 'NADER'
};
const CATEGORY_LABELS = {
  background: '背景',
  still: 'スチル',
  character: 'ヒロイン立ち絵',
  face: '顔アイコン'
};

function toPosix(value) {
  return String(value).replace(/\\/g, '/');
}

function formatTitle(id) {
  return String(id || '').replace(/_/g, ' ');
}

function inferHeroineIdFromText(value) {
  const lower = String(value || '').toLowerCase();
  for (const [key, heroineId] of Object.entries(HEROINE_NAMES)) {
    if (lower.includes(key)) return heroineId;
  }
  return null;
}

function imageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => IMAGE_EXT_RE.test(file))
    .sort((a, b) => a.localeCompare(b));
}

function scanFlatDir(dir, sourceType, relativeBase) {
  return imageFiles(dir).map((file) => {
    const id = path.parse(file).name;
    const heroineId = sourceType === 'still' ? inferHeroineIdFromText(id) : null;
    return {
      id,
      path: toPosix(`images/${relativeBase}/${file}`),
      title: formatTitle(id),
      category: CATEGORY_LABELS[sourceType],
      sourceType,
      imageKind: sourceType,
      heroineId,
      expression: null
    };
  });
}

function normalizeCharacterDirToHeroineId(dirName) {
  return HEROINE_NAMES[String(dirName || '').toLowerCase()] || String(dirName || '').toUpperCase();
}

function scanCharacterImages() {
  if (!fs.existsSync(charsDir)) return [];
  const items = [];
  const charDirs = fs.readdirSync(charsDir)
    .filter((name) => fs.statSync(path.join(charsDir, name)).isDirectory())
    .sort((a, b) => a.localeCompare(b));

  for (const charDir of charDirs) {
    const heroineId = normalizeCharacterDirToHeroineId(charDir);
    for (const kind of ['standing', 'face']) {
      const sourceDir = kind === 'face' ? 'face_proc' : 'standing_proc';
      const dir = path.join(charsDir, charDir, sourceDir);
      if (!fs.existsSync(dir)) continue;
      for (const file of imageFiles(dir)) {
        const expression = path.parse(file).name.toLowerCase();
        const id = `${charDir.toLowerCase()}_${expression}_${kind}`;
        items.push({
          id,
          path: toPosix(`characters/${charDir}/${sourceDir}/${file}`),
          title: `${heroineId} (${expression}${kind === 'face' ? ' face' : ''})`,
          category: kind === 'face' ? CATEGORY_LABELS.face : CATEGORY_LABELS.character,
          sourceType: 'character',
          imageKind: kind,
          heroineId,
          expression
        });
      }
    }
  }
  return items;
}

function assertUniqueIds(items) {
  const seen = new Map();
  const duplicates = [];
  for (const item of items) {
    if (seen.has(item.id)) duplicates.push({ id: item.id, a: seen.get(item.id), b: item.path });
    seen.set(item.id, item.path);
  }
  if (duplicates.length) {
    const details = duplicates.map((d) => `- ${d.id}: ${d.a} / ${d.b}`).join('\n');
    throw new Error(`Duplicate gallery asset id(s):\n${details}`);
  }
}

function buildCatalogMarkdown(items) {
  const byCategory = new Map();
  for (const item of items) {
    const key = item.category || item.sourceType || 'その他';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(item);
  }

  const lines = [
    '# イベントで使える画像ID',
    '',
    'このファイルは `tools/sync-gallery.cjs` で生成します。',
    'イベントデータには画像パスではなく、ここにある `id` を指定してください。',
    '',
    '```js',
    '{ type: "bg", id: "bg_shop_interior_service", transition: "fade" }',
    '{ type: "still", id: "still_hakima_morning_visit_01", transition: "fade" }',
    '{ type: "enter", characterId: "CH_HAKIMA", expression: "joy", position: "right" }',
    '```',
    ''
  ];

  for (const [category, entries] of [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`## ${category}`, '');
    for (const item of entries.sort((a, b) => a.id.localeCompare(b.id))) {
      const meta = [
        item.heroineId ? `heroine=${item.heroineId}` : null,
        item.expression ? `expression=${item.expression}` : null,
        item.imageKind ? `kind=${item.imageKind}` : null
      ].filter(Boolean).join(' / ');
      lines.push(`- \`${item.id}\` : ${item.title}${meta ? ` (${meta})` : ''}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function generate() {
  console.log('Scanning images for gallery...');

  const sourceDirs = [bgDir, stillDir, charsDir];
  const hasAnySourceDir = sourceDirs.some((dir) => fs.existsSync(dir));
  if (!hasAnySourceDir) {
    console.warn('No public image source directories found. Existing gallery manifest was not overwritten.');
    return;
  }

  const galleryItems = [
    ...scanFlatDir(bgDir, 'background', 'background'),
    ...scanFlatDir(stillDir, 'still', 'still'),
    ...scanCharacterImages()
  ];

  assertUniqueIds(galleryItems);

  const content = `/**\n * Generated Gallery Manifest\n * Do not edit manually. Use tools/sync-gallery.cjs\n */\nconst GALLERY_MANIFEST = ${JSON.stringify(galleryItems, null, 2)};\n\nif (typeof module !== 'undefined') {\n    module.exports = { GALLERY_MANIFEST };\n}\n`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, content);
  fs.mkdirSync(path.dirname(catalogFile), { recursive: true });
  fs.writeFileSync(catalogFile, buildCatalogMarkdown(galleryItems));
  console.log(`Gallery manifest generated with ${galleryItems.length} items at ${outputFile}`);
  console.log(`Event asset catalog generated at ${catalogFile}`);
}

if (require.main === module) {
  try {
    generate();
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

module.exports = {
  generate,
  scanFlatDir,
  scanCharacterImages,
  buildCatalogMarkdown,
  inferHeroineIdFromText
};
