function normalizeAudioPath(pathValue) {
  return String(pathValue || '').replace(/\\/g, '/').replace(/^public\//, '').replace(/^\.\//, '');
}

function loadRhythmNoteMaps() {
  try {
    const generated = require('../data/generated/rhythmNoteMaps.cjs');
    return generated && generated.RHYTHM_NOTE_MAPS ? generated.RHYTHM_NOTE_MAPS : {};
  } catch (error) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[rhythm] rhythmNoteMaps.cjs not found. Using fixed fallback notes. Run npm run analyze:rhythm after adding/replacing BGM.');
    }
    return {};
  }
}

function getRhythmMapForPath(maps, pathValue) {
  const normalized = normalizeAudioPath(pathValue);
  return maps && normalized ? maps[normalized] || null : null;
}

function getRhythmActiveRange(noteMap) {
  const durationMs = Number(noteMap?.durationMs);
  const trim = noteMap?.playbackTrim;
  const startMs = Number(trim?.startMs);
  const endMs = Number(trim?.endMs);

  if (trim?.enabled && Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs + 500) {
    return { startMs: Math.max(0, Math.round(startMs)), endMs: Math.round(endMs), durationMs: Math.round(endMs - startMs) };
  }

  const fallbackEnd = Number.isFinite(durationMs) && durationMs > 500 ? Math.round(durationMs) : 0;
  return { startMs: 0, endMs: fallbackEnd, durationMs: fallbackEnd };
}

function wrapLoopPositionMs(audioTimeMs, noteMap) {
  if (!Number.isFinite(audioTimeMs)) return null;
  const range = getRhythmActiveRange(noteMap);
  if (!range.durationMs) return audioTimeMs;
  const raw = audioTimeMs - range.startMs;
  const wrapped = ((raw % range.durationMs) + range.durationMs) % range.durationMs;
  return range.startMs + wrapped;
}

function getLoopDiffMs(noteTimeMs, audioTimeMs, noteMap) {
  if (!Number.isFinite(noteTimeMs) || !Number.isFinite(audioTimeMs)) return null;
  const range = getRhythmActiveRange(noteMap);
  if (!range.durationMs) return noteTimeMs - audioTimeMs;

  const audioLoopMs = wrapLoopPositionMs(audioTimeMs, noteMap);
  const noteRel = ((noteTimeMs - range.startMs) % range.durationMs + range.durationMs) % range.durationMs;
  const audioRel = ((audioLoopMs - range.startMs) % range.durationMs + range.durationMs) % range.durationMs;
  let diff = noteRel - audioRel;
  if (diff > range.durationMs / 2) diff -= range.durationMs;
  if (diff < -range.durationMs / 2) diff += range.durationMs;
  return diff;
}

function buildLoopedVisibleNotes(noteMap, audioTimeMs, behindMs, lookaheadMs) {
  const sourceNotes = noteMap && Array.isArray(noteMap.notes) ? noteMap.notes : [];
  if (!sourceNotes.length || !Number.isFinite(audioTimeMs)) return [];

  const range = getRhythmActiveRange(noteMap);
  const notes = [];
  for (let index = 0; index < sourceNotes.length; index += 1) {
    const note = sourceNotes[index];
    const timeMs = Number(note.timeMs);
    if (!Number.isFinite(timeMs)) continue;
    if (range.durationMs && (timeMs < range.startMs || timeMs > range.endMs)) continue;

    const diff = getLoopDiffMs(timeMs, audioTimeMs, noteMap);
    if (diff === null) continue;

    const candidates = [diff];
    if (range.durationMs) {
      candidates.push(diff - range.durationMs, diff + range.durationMs);
    }

    for (const untilHit of candidates) {
      if (untilHit < -behindMs || untilHit > lookaheadMs) continue;
      notes.push({
        beat: index,
        untilHit,
        strength: note.strength || 0.65,
        timeMs
      });
    }
  }

  return notes.sort((a, b) => a.untilHit - b.untilHit);
}

function findNearestRhythmNoteDiffMs(noteMap, audioTimeMs) {
  const notes = noteMap && Array.isArray(noteMap.notes) ? noteMap.notes : [];
  if (!notes.length || !Number.isFinite(audioTimeMs)) return null;
  let bestDiff = null;
  for (const note of notes) {
    const diff = getLoopDiffMs(Number(note.timeMs), audioTimeMs, noteMap);
    if (diff === null) continue;
    if (bestDiff === null || Math.abs(diff) < Math.abs(bestDiff)) bestDiff = diff;
  }
  return bestDiff;
}

function findNearestRhythmNoteMs(noteMap, audioTimeMs) {
  const diff = findNearestRhythmNoteDiffMs(noteMap, audioTimeMs);
  return diff === null ? null : audioTimeMs + diff;
}

module.exports = {
  normalizeAudioPath,
  loadRhythmNoteMaps,
  getRhythmMapForPath,
  getRhythmActiveRange,
  wrapLoopPositionMs,
  getLoopDiffMs,
  buildLoopedVisibleNotes,
  findNearestRhythmNoteDiffMs,
  findNearestRhythmNoteMs
};
