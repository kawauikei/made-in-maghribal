import fs from 'fs';
import path from 'path';
import { DAILY_TALKS } from '../src/data/dailyTalks.js';

const INPUT_PATH = path.join('.temp', 'narrative_edit_pack.md');
const TARGET_PATH = path.join('src', 'data', 'dailyTalks.js');
const BACKUP_PATH = path.join('.temp', 'dailyTalks.js.bak');

/**
 * Basic Markdown Parser for the Edit Pack
 */
function parseEditPack(content) {
  const talks = [];
  const blocks = content.split(/## dailyTalk:\s+/);
  
  // Skip the header block
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const talk = { pages: [] };
    
    // Extract metadata
    const idMatch = block.match(/^id:\s+(\S+)/m);
    const scopeMatch = block.match(/^scope:\s+(\S+)/m);
    const heroineIdMatch = block.match(/^heroineId:\s+(\S+)/m);
    const timingMatch = block.match(/^timing:\s+(\S+)/m);
    const routeModeMatch = block.match(/^routeMode:\s+(\S+)/m);
    const minAffectionMatch = block.match(/^minAffection:\s+(\d+)/m);

    if (!idMatch) continue;

    talk.id = idMatch[1];
    talk.scope = scopeMatch ? scopeMatch[1] : '';
    talk.heroineId = heroineIdMatch && heroineIdMatch[1] !== 'null' ? heroineIdMatch[1] : null;
    talk.timing = timingMatch ? timingMatch[1] : '';
    talk.routeMode = routeModeMatch ? routeModeMatch[1] : '';
    talk.minAffection = minAffectionMatch ? parseInt(minAffectionMatch[1], 10) : 0;

    // Extract pages
    const pageBlocks = block.split(/#### page\s+\d+/);
    for (let j = 1; j < pageBlocks.length; j++) {
      const pBlock = pageBlocks[j];
      const speakerMatch = pBlock.match(/^speaker:\s*(.*)/m);
      const expressionMatch = pBlock.match(/^expression:\s*(.*)/m);
      const textMatch = pBlock.match(/^text:\s*(.*)/m);

      if (textMatch) {
        talk.pages.push({
          speaker: speakerMatch ? speakerMatch[1].trim() : '',
          expression: expressionMatch ? expressionMatch[1].trim() : 'normal',
          text: textMatch[1].trim()
        });
      }
    }
    talks.push(talk);
  }
  return talks;
}

function validateTalks(editedTalks, originalTalks) {
  const originalMap = new Map(originalTalks.map(t => [t.id, t]));
  const errors = [];
  const warnings = [];

  editedTalks.forEach(edited => {
    const original = originalMap.get(edited.id);
    if (!original) {
      errors.push(`[Error] ID not found in original data: ${edited.id} (New IDs are forbidden in MVP)`);
      return;
    }

    // Metadata Integrity Checks
    if (edited.scope !== original.scope) errors.push(`[Error] ${edited.id}: scope mismatch ('${edited.scope}' vs '${original.scope}')`);
    if (edited.heroineId !== original.heroineId) errors.push(`[Error] ${edited.id}: heroineId mismatch ('${edited.heroineId}' vs '${original.heroineId}')`);
    if (edited.timing !== original.timing) errors.push(`[Error] ${edited.id}: timing mismatch ('${edited.timing}' vs '${original.timing}')`);
    if (edited.routeMode !== original.routeMode) errors.push(`[Error] ${edited.id}: routeMode mismatch ('${edited.routeMode}' vs '${original.routeMode}')`);
    if (edited.minAffection !== original.minAffection) errors.push(`[Error] ${edited.id}: minAffection mismatch ('${edited.minAffection}' vs '${original.minAffection}')`);

    // Content Validation
    if (edited.pages.length === 0) errors.push(`[Error] ${edited.id}: No pages found.`);
    edited.pages.forEach((p, idx) => {
      if (!p.text) errors.push(`[Error] ${edited.id} (Page ${idx+1}): Text is empty.`);
      if (p.speaker && !['ハキマ', 'ミラ', 'ダリヤ', 'ナーディル', '客', 'ナレーション'].includes(p.speaker)) {
          warnings.push(`[Warning] ${edited.id}: Unknown speaker '${p.speaker}'`);
      }
    });
  });

  // Check for missing IDs
  originalTalks.forEach(orig => {
    if (!editedTalks.find(t => t.id === orig.id)) {
      errors.push(`[Error] Missing ID in edit pack: ${orig.id}`);
    }
  });

  return { errors, warnings };
}

function generateJsFile(talks) {
  let js = `/**\n * DailyTalk Definitions for Made in Maghribal\n * (Auto-imported from Narrative Edit Pack)\n */\n\n`;
  js += `export const DAILY_TALKS = [\n`;
  
  talks.forEach((talk, tIdx) => {
    js += `  {\n`;
    js += `    id: "${talk.id}",\n`;
    js += `    scope: "${talk.scope}",\n`;
    js += `    heroineId: ${talk.heroineId ? `"${talk.heroineId}"` : 'null'},\n`;
    js += `    timing: "${talk.timing}",\n`;
    js += `    routeMode: "${talk.routeMode}",\n`;
    js += `    minAffection: ${talk.minAffection},\n`;
    js += `    priority: 1,\n`; // Maintain default priority
    js += `    pages: [\n`;
    talk.pages.forEach((page, pIdx) => {
      js += `      { speaker: "${page.speaker}", expression: "${page.expression}", text: "${page.text.replace(/"/g, '\\"')}" }${pIdx < talk.pages.length - 1 ? ',' : ''}\n`;
    });
    js += `    ]\n`;
    js += `  }${tIdx < talks.length - 1 ? ',' : ''}\n`;
  });
  
  js += `];\n`;
  return js;
}

async function run() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Input file not found: ${INPUT_PATH}`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(INPUT_PATH, 'utf8');
    const editedTalks = parseEditPack(content);
    
    console.log(`Parsing completed. Found ${editedTalks.length} entries.`);

    const { errors, warnings } = validateTalks(editedTalks, DAILY_TALKS);
    
    if (warnings.length > 0) {
      warnings.forEach(w => console.warn(w));
    }

    if (errors.length > 0) {
      console.error('Validation failed with the following errors:');
      errors.forEach(e => console.error(e));
      process.exit(1);
    }

    // Backup
    fs.copyFileSync(TARGET_PATH, BACKUP_PATH);
    console.log(`Backup created at ${BACKUP_PATH}`);

    // Generate and write
    const newJsContent = generateJsFile(editedTalks);
    fs.writeFileSync(TARGET_PATH, newJsContent, 'utf8');
    
    console.log(`Successfully imported and updated ${TARGET_PATH}`);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

run();
