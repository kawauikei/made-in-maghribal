const fs = require('fs');
const path = require('path');

// Paths
const CONTENT_DIR = path.join(__dirname, '../content/events');
const GALLERY_MANIFEST_PATH = path.join(__dirname, '../browser/data/galleryManifest.js');
const AUDIO_MANIFEST_PATH = path.join(__dirname, '../src/data/audioManifest.cjs');
const OUTPUT_DIR = path.join(__dirname, '../src/data/generated');
const MANIFEST_OUTPUT = path.join(OUTPUT_DIR, 'eventManifest.cjs');
const SCRIPTS_OUTPUT = path.join(OUTPUT_DIR, 'eventScripts.cjs');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load Gallery Manifest (Browser file, need to parse)
function loadGalleryManifest() {
  const content = fs.readFileSync(GALLERY_MANIFEST_PATH, 'utf8');
  // Simple extraction: find the array part
  const jsonMatch = content.match(/const GALLERY_MANIFEST = (\[[\s\S]*?\]);/);
  if (!jsonMatch) throw new Error('Could not parse galleryManifest.js');
  return JSON.parse(jsonMatch[1]);
}

// Load Audio Manifest (Node file)
const { AUDIO_MANIFEST } = require(AUDIO_MANIFEST_PATH);

// Pre-collect IDs for fast validation
const galleryIds = new Set(loadGalleryManifest().map(i => i.id));
const bgmIds = new Set();
const seIds = new Set();

// Collect BGM IDs from nested structure
if (AUDIO_MANIFEST.bgm.system) {
  AUDIO_MANIFEST.bgm.system.forEach(b => bgmIds.add(b.id));
}
if (AUDIO_MANIFEST.bgm.heroines) {
  Object.values(AUDIO_MANIFEST.bgm.heroines).forEach(heroine => {
    if (heroine.theme) bgmIds.add(heroine.theme.id);
    if (heroine.game) heroine.game.forEach(b => bgmIds.add(b.id));
    if (heroine.ending) {
      Object.values(heroine.ending).forEach(b => bgmIds.add(b.id));
    }
  });
}
if (AUDIO_MANIFEST.bgm.extra) {
  AUDIO_MANIFEST.bgm.extra.forEach(b => bgmIds.add(b.id));
}

// Collect SE IDs
if (AUDIO_MANIFEST.se) {
  Object.values(AUDIO_MANIFEST.se).forEach(category => {
    category.forEach(s => seIds.add(s.id));
  });
}

const eventFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.event.cjs'));
const eventManifest = [];
const eventScripts = {};
const eventIds = new Set();

let hasError = false;

function logError(eventId, message) {
  console.error(`[Error] Event ${eventId}: ${message}`);
  hasError = true;
}

eventFiles.forEach(file => {
  const filePath = path.join(CONTENT_DIR, file);
  const event = require(filePath);

  // Validation
  if (!event.id) return logError(file, 'Missing id');
  if (eventIds.has(event.id)) return logError(event.id, 'Duplicate event id');
  eventIds.add(event.id);

  if (!event.title) logError(event.id, 'Missing title');
  if (!event.heroineId) logError(event.id, 'Missing heroineId');
  if (!event.summary) logError(event.id, 'Missing summary');
  if (!event.unlock) logError(event.id, 'Missing unlock');
  if (!event.gallery) logError(event.id, 'Missing gallery');
  if (event.gallery && !galleryIds.has(event.gallery.thumbnail)) {
    logError(event.id, `Gallery thumbnail ID not found: ${event.gallery.thumbnail}`);
  }

  if (!Array.isArray(event.script)) {
    logError(event.id, 'Script must be an array');
  } else {
    let hasEnd = false;
    const labels = new Set();

    event.script.forEach((step, index) => {
      if (step.type === 'end') hasEnd = true;
      if (step.type === 'label') {
        if (labels.has(step.id)) logError(event.id, `Duplicate label: ${step.id}`);
        labels.add(step.id);
      }
    });

    if (!hasEnd) logError(event.id, 'Missing "end" command in script');

    // Command specific validation
    const allowedTypes = [
      'bg', 'still', 'bgm', 'sfx', 'enter', 'exit', 'line', 'narration', 'wait', 'choice', 'label', 'jump', 'flag', 'end'
    ];

    event.script.forEach((step, index) => {
      if (!allowedTypes.includes(step.type)) {
        logError(event.id, `Unknown command type at step ${index}: ${step.type}`);
      }

      if (step.type === 'bg' || step.type === 'still') {
        if (!galleryIds.has(step.id)) logError(event.id, `Step ${index}: Image ID not found: ${step.id}`);
      }
      if (step.type === 'bgm') {
        if (!bgmIds.has(step.id)) logError(event.id, `Step ${index}: BGM ID not found: ${step.id}`);
      }
      if (step.type === 'sfx') {
        if (!seIds.has(step.id)) logError(event.id, `Step ${index}: SE ID not found: ${step.id}`);
      }
      if (step.type === 'line' || step.type === 'narration') {
        if (!step.text) logError(event.id, `Step ${index}: Missing text`);
      }
      if (step.type === 'jump') {
        // We'll check jump labels after collecting all labels in a second pass or just check existence in pre-collected labels
      }
      if (step.type === 'choice') {
        if (!Array.isArray(step.choices)) logError(event.id, `Step ${index}: choices must be an array`);
        else {
          step.choices.forEach((c, i) => {
            if (!c.text) logError(event.id, `Step ${index} choice ${i}: missing text`);
          });
        }
      }
    });

    // Jump/Choice label check
    event.script.forEach((step, index) => {
      if (step.type === 'jump' && !labels.has(step.id)) {
        logError(event.id, `Step ${index}: Jump target not found: ${step.id}`);
      }
      if (step.type === 'choice' && step.choices) {
        step.choices.forEach((c, i) => {
          if (c.jump && !labels.has(c.jump)) {
            logError(event.id, `Step ${index} choice ${i}: Jump target not found: ${c.jump}`);
          }
        });
      }
    });
  }

  // Add to outputs
  eventManifest.push({
    id: event.id,
    title: event.title,
    heroineId: event.heroineId,
    summary: event.summary,
    unlock: event.unlock,
    gallery: event.gallery,
    scriptStepCount: event.script ? event.script.length : 0
  });

  eventScripts[event.id] = event.script;
});

if (hasError) {
  console.error('\nEvent synchronization failed with errors.');
  process.exit(1);
}

// Write outputs
const manifestContent = `/**
 * Generated Event Manifest
 * Do not edit manually. Use tools/sync-events.cjs
 */
const EVENT_MANIFEST = ${JSON.stringify(eventManifest, null, 2)};

if (typeof module !== 'undefined') {
  module.exports = { EVENT_MANIFEST };
}
`;

const scriptsContent = `/**
 * Generated Event Scripts
 * Do not edit manually. Use tools/sync-events.cjs
 */
const EVENT_SCRIPTS = ${JSON.stringify(eventScripts, null, 2)};

if (typeof module !== 'undefined') {
  module.exports = { EVENT_SCRIPTS };
}
`;

fs.writeFileSync(MANIFEST_OUTPUT, manifestContent);
fs.writeFileSync(SCRIPTS_OUTPUT, scriptsContent);

console.log(`Successfully synchronized ${eventFiles.length} events.`);
console.log(`Manifest: ${MANIFEST_OUTPUT}`);
console.log(`Scripts: ${SCRIPTS_OUTPUT}`);
