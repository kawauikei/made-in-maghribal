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

const RHYTHM_SILENCE_GRACE_THRESHOLD_MS = 2000;
const RHYTHM_SILENCE_GRACE_STEP_MS = 1500;
const RHYTHM_SILENCE_GRACE_MAX_MS = 3000;

function getActiveNoteTimes(noteMap) {
  const sourceNotes = noteMap && Array.isArray(noteMap.notes) ? noteMap.notes : [];
  if (!sourceNotes.length) return [];

  const range = getRhythmActiveRange(noteMap);
  const times = [];
  for (const note of sourceNotes) {
    const timeMs = Number(note.timeMs);
    if (!Number.isFinite(timeMs)) continue;
    if (range.durationMs && (timeMs < range.startMs || timeMs > range.endMs)) continue;
    times.push(Math.round(timeMs));
  }

  return [...new Set(times)].sort((a, b) => a - b);
}

function calculateSilenceGraceFromElapsedMs(noNoteElapsedMs) {
  const elapsed = Number(noNoteElapsedMs);
  if (!Number.isFinite(elapsed) || elapsed < RHYTHM_SILENCE_GRACE_THRESHOLD_MS) return 0;
  const steps = Math.floor(elapsed / RHYTHM_SILENCE_GRACE_THRESHOLD_MS);
  return Math.min(RHYTHM_SILENCE_GRACE_MAX_MS, steps * RHYTHM_SILENCE_GRACE_STEP_MS);
}

function getRhythmSilenceGraceDebug(noteMap, audioTimeMs) {
  const noteTimes = getActiveNoteTimes(noteMap);
  const empty = {
    speedGraceMs: 0,
    audioTimeMs: Number.isFinite(audioTimeMs) ? Math.round(audioTimeMs) : null,
    audioLoopMs: null,
    prevNoteMs: null,
    nextNoteMs: null,
    nearestNoteMs: null,
    gapElapsedMs: 0,
    gapToNearestMs: 0,
    graceBasisMs: 0,
    reason: 'no-note-map'
  };
  if (!noteTimes.length || !Number.isFinite(audioTimeMs)) return empty;

  const range = getRhythmActiveRange(noteMap);
  if (!range.durationMs) return { ...empty, reason: 'no-active-range' };

  const audioLoopMs = wrapLoopPositionMs(audioTimeMs, noteMap);
  if (!Number.isFinite(audioLoopMs)) return empty;

  let prevIndex = -1;
  let nextIndex = -1;
  for (let index = 0; index < noteTimes.length; index += 1) {
    const timeMs = noteTimes[index];
    if (timeMs <= audioLoopMs) prevIndex = index;
    if (timeMs > audioLoopMs) {
      nextIndex = index;
      break;
    }
  }

  const prevNoteMs = prevIndex >= 0 ? noteTimes[prevIndex] : range.startMs;
  const nextNoteMs = nextIndex >= 0 ? noteTimes[nextIndex] : noteTimes[0] + range.durationMs;
  const prevDistanceMs = Math.abs(audioLoopMs - prevNoteMs);
  const nextDistanceMs = Math.abs(nextNoteMs - audioLoopMs);
  const nearestIndex = prevDistanceMs <= nextDistanceMs ? prevIndex : nextIndex;
  const nearestNoteMs = nearestIndex >= 0 ? noteTimes[nearestIndex] : nextNoteMs;
  const noteBeforeNearestMs = nearestIndex > 0 ? noteTimes[nearestIndex - 1] : range.startMs;

  const elapsedFromPrevMs = Math.max(0, audioLoopMs - prevNoteMs);
  const nearestDistanceMs = Math.min(prevDistanceMs, nextDistanceMs);
  const gapToNearestMs = Math.max(0, nearestNoteMs - noteBeforeNearestMs);

  // 長い無音後の第一ノーツで押した場合、従来の「直前ノーツから現在まで」は0ms近くに戻る。
  // そのため、現在までの経過に加え、最寄りノーツの直前無音幅も速度猶予候補に入れる。
  // ただし遠い未来のノーツで早押し補正が暴れないよう、最寄りノーツ±250ms以内だけ採用する。
  const nearNoteGapMs = nearestDistanceMs <= 250 ? gapToNearestMs : 0;
  const graceBasisMs = Math.max(elapsedFromPrevMs, nearNoteGapMs);
  const speedGraceMs = calculateSilenceGraceFromElapsedMs(graceBasisMs);

  return {
    speedGraceMs,
    audioTimeMs: Math.round(audioTimeMs),
    audioLoopMs: Math.round(audioLoopMs),
    prevNoteMs: Math.round(prevNoteMs),
    nextNoteMs: Math.round(nextNoteMs),
    nearestNoteMs: Math.round(nearestNoteMs),
    gapElapsedMs: Math.round(elapsedFromPrevMs),
    gapToNearestMs: Math.round(gapToNearestMs),
    graceBasisMs: Math.round(graceBasisMs),
    reason: speedGraceMs > 0 ? 'silence-grace' : 'no-grace'
  };
}

function getRhythmSilenceGraceMs(noteMap, audioTimeMs) {
  return getRhythmSilenceGraceDebug(noteMap, audioTimeMs).speedGraceMs;
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
  findNearestRhythmNoteMs,
  getActiveNoteTimes,
  calculateSilenceGraceFromElapsedMs,
  getRhythmSilenceGraceMs,
  getRhythmSilenceGraceDebug
};
