const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '../..');
const manifestPath = path.join(projectRoot, 'src/data/generated/eventManifest.cjs');
const scriptsPath = path.join(projectRoot, 'src/data/generated/eventScripts.cjs');

test('C013_EVENT_AUTHORING_PIPELINE: sync-events.cjs generates correct data', (t) => {
  // Run the sync script
  try {
    execSync('node tools/sync-events.cjs', { cwd: projectRoot, stdio: 'pipe' });
  } catch (err) {
    assert.fail(`sync-events.cjs failed: ${err.stderr.toString()}`);
  }

  // Check files existence
  assert.ok(fs.existsSync(manifestPath), 'eventManifest.cjs should exist');
  assert.ok(fs.existsSync(scriptsPath), 'eventScripts.cjs should exist');

  // Load generated data
  const { EVENT_MANIFEST } = require(manifestPath);
  const { EVENT_SCRIPTS } = require(scriptsPath);

  assert.ok(Array.isArray(EVENT_MANIFEST), 'EVENT_MANIFEST should be an array');
  assert.ok(EVENT_MANIFEST.length >= 4, 'Should have at least 4 sample events');

  // Check for specific events
  const opEvent = EVENT_MANIFEST.find(e => e.id === 'EV_OP_01');
  assert.ok(opEvent, 'EV_OP_01 should be in manifest');
  assert.strictEqual(opEvent.heroineId, 'COMMON');

  const hakimaEvent = EVENT_MANIFEST.find(e => e.id === 'EV_HAKIMA_01');
  assert.ok(hakimaEvent, 'EV_HAKIMA_01 should be in manifest');
  assert.strictEqual(hakimaEvent.heroineId, 'HAKIMA');

  // Check scripts
  assert.ok(EVENT_SCRIPTS['EV_OP_01'], 'Script for EV_OP_01 should exist');
  assert.ok(Array.isArray(EVENT_SCRIPTS['EV_OP_01']), 'Script should be an array');
  
  const opScript = EVENT_SCRIPTS['EV_OP_01'];
  assert.ok(opScript.some(s => s.type === 'end'), 'EV_OP_01 should have end command');
});

test('C013_EVENT_AUTHORING_PIPELINE: sync-events.cjs validation rejects invalid data', (t) => {
  const invalidEventPath = path.join(projectRoot, 'content/events/INVALID_TEST.event.cjs');
  
  // Create an invalid event
  fs.writeFileSync(invalidEventPath, `
    module.exports = {
      id: "INVALID_TEST",
      title: "Invalid",
      heroineId: "HAKIMA",
      summary: "This has no end",
      unlock: { type: "always" },
      gallery: { category: "event", thumbnail: "bg_market_central" },
      script: [ { type: "bg", id: "bg_market_central" } ] // Missing end
    };
  `);

  try {
    assert.throws(() => {
      execSync('node tools/sync-events.cjs', { cwd: projectRoot, stdio: 'pipe' });
    }, /Missing "end" command/);
  } finally {
    if (fs.existsSync(invalidEventPath)) fs.unlinkSync(invalidEventPath);
  }
});
