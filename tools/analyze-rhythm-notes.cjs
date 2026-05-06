#!/usr/bin/env node
/**
 * Analyze every BGM MP3 and export rhythm note maps.
 *
 * Default operation:
 *   npm run analyze:rhythm
 *
 * This recursively scans public/audio/bgm for mp3 files at execution time. Re-run it whenever
 * BGM files are added or replaced.
 *
 * Outputs:
 *   src/data/generated/rhythmNoteMaps.cjs
 *   public/audio/bgm/rhythmNoteMaps.json
 *
 * Requirements:
 *   ffmpeg must be available in PATH, or set FFMPEG_PATH to ffmpeg.exe.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const DEFAULT_BGM_DIR = path.join(PROJECT_ROOT, 'public', 'audio', 'bgm');
const DEFAULT_CJS_OUT = path.join(PROJECT_ROOT, 'src', 'data', 'generated', 'rhythmNoteMaps.cjs');
const DEFAULT_JSON_OUT = path.join(PROJECT_ROOT, 'public', 'audio', 'bgm', 'rhythmNoteMaps.json');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i += 1; }
  }
  return args;
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSlash(value) {
  return String(value || '').replace(/\\/g, '/');
}

function toProjectRelative(filePath) {
  return normalizeSlash(path.relative(PROJECT_ROOT, filePath));
}

function toAudioRuntimePath(filePath) {
  const rel = toProjectRelative(filePath);
  return rel.replace(/^public\//, '');
}

function listMp3Files(targetPath) {
  const full = path.isAbsolute(targetPath) ? targetPath : path.join(PROJECT_ROOT, targetPath || '');
  if (!fs.existsSync(full)) return [];
  const stat = fs.statSync(full);
  if (stat.isFile()) return full.toLowerCase().endsWith('.mp3') ? [full] : [];
  const out = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.toLowerCase().endsWith('.mp3')) out.push(p);
    }
  };
  walk(full);
  return out.sort((a, b) => a.localeCompare(b));
}

function fileExists(filePath) {
  try { return Boolean(filePath) && fs.existsSync(filePath) && fs.statSync(filePath).isFile(); }
  catch (_error) { return false; }
}

function candidateFfmpegPaths() {
  const candidates = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  candidates.push('ffmpeg');

  const pathDirs = String(process.env.Path || process.env.PATH || '')
    .split(path.delimiter)
    .filter(Boolean);
  for (const dir of pathDirs) candidates.push(path.join(dir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'));

  if (process.platform === 'win32') {
    const roots = [process.env.LOCALAPPDATA, process.env.ProgramFiles, process.env['ProgramFiles(x86)'], 'C:/ffmpeg'];
    for (const root of roots.filter(Boolean)) {
      candidates.push(path.join(root, 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-8.1.1-full_build', 'bin', 'ffmpeg.exe'));
      candidates.push(path.join(root, 'ffmpeg', 'bin', 'ffmpeg.exe'));
      candidates.push(path.join(root, 'Gyan', 'ffmpeg', 'bin', 'ffmpeg.exe'));
    }
  }

  return [...new Set(candidates.map((value) => normalizeSlash(value)))];
}

function resolveFfmpegCommand() {
  const candidates = candidateFfmpegPaths();
  for (const candidate of candidates) {
    if (candidate === 'ffmpeg') return candidate;
    if (fileExists(candidate)) return candidate;
  }
  return 'ffmpeg';
}

function explainFfmpegMissing(errorMessage) {
  return [
    `ffmpeg failed: ${errorMessage}`,
    '',
    'ffmpeg.exe がこの PowerShell / npm 実行環境の PATH から見えていません。',
    '別の端末では ffmpeg -version が通る場合、プロジェクト側の端末を開き直すか、以下を一度実行してください:',
    '  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")',
    '',
    'または ffmpeg.exe の絶対パスを指定できます:',
    '  $env:FFMPEG_PATH="C:\\path\\to\\ffmpeg.exe"',
    '  npm run analyze:rhythm'
  ].join('\n');
}

function runFfmpegToPcm(filePath, sampleRate) {
  const ffmpegCommand = resolveFfmpegCommand();
  const result = spawnSync(ffmpegCommand, [
    '-v', 'error',
    '-i', filePath,
    '-ac', '1',
    '-ar', String(sampleRate),
    '-f', 'f32le',
    'pipe:1'
  ], { encoding: null, maxBuffer: 1024 * 1024 * 256 });

  if (result.error) throw new Error(explainFfmpegMissing(result.error.message));
  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.toString('utf8') : '';
    throw new Error(`ffmpeg exited with ${result.status}: ${stderr}`);
  }
  return result.stdout;
}

function pcmBufferToFloat32(buffer) {
  const count = Math.floor(buffer.length / 4);
  const samples = new Float32Array(count);
  for (let i = 0; i < count; i += 1) samples[i] = buffer.readFloatLE(i * 4);
  return samples;
}

function buildEnergyFrames(samples, sampleRate, frameMs) {
  const frameSize = Math.max(1, Math.round(sampleRate * frameMs / 1000));
  const frames = [];
  for (let start = 0; start < samples.length; start += frameSize) {
    let sum = 0;
    const end = Math.min(samples.length, start + frameSize);
    for (let i = start; i < end; i += 1) {
      const v = samples[i];
      sum += v * v;
    }
    frames.push({ timeMs: Math.round(start / sampleRate * 1000), energy: Math.sqrt(sum / Math.max(1, end - start)) });
  }
  return frames;
}

function percentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
}

function normalizeStrength(value, floor, ceiling) {
  if (ceiling <= floor) return 0.5;
  return Math.max(0.12, Math.min(1, (value - floor) / (ceiling - floor)));
}

function detectActiveAudioRange(frames, durationMs, options) {
  if (options.noPlaybackTrim || !frames.length) {
    return { startMs: 0, endMs: durationMs, leadingMs: 0, trailingMs: 0, threshold: 0, enabled: false };
  }

  const energies = frames.map((frame) => frame.energy);
  const dynamicFloor = percentile(energies, 0.1);
  const dynamicCeiling = percentile(energies, 0.95);
  const dynamicThreshold = dynamicFloor + (dynamicCeiling - dynamicFloor) * options.silenceRatio;
  const threshold = Math.max(options.silenceThreshold, dynamicThreshold);

  let first = -1;
  let last = -1;
  for (let i = 0; i < frames.length; i += 1) {
    if (frames[i].energy >= threshold) {
      if (first < 0) first = i;
      last = i;
    }
  }

  if (first < 0 || last < 0) {
    return { startMs: 0, endMs: durationMs, leadingMs: 0, trailingMs: 0, threshold, enabled: false };
  }

  const startMs = Math.max(0, frames[first].timeMs - options.trimPaddingMs);
  const endMs = Math.min(durationMs, frames[last].timeMs + options.frameMs + options.trimPaddingMs);
  if (endMs - startMs < options.minActiveMs) {
    return { startMs: 0, endMs: durationMs, leadingMs: 0, trailingMs: 0, threshold, enabled: false };
  }

  const leadingMs = Math.round(startMs);
  const trailingMs = Math.max(0, Math.round(durationMs - endMs));
  const meaningfulTrim = leadingMs >= options.minTrimMs || trailingMs >= options.minTrimMs;

  return {
    startMs: meaningfulTrim ? leadingMs : 0,
    endMs: meaningfulTrim ? Math.round(endMs) : durationMs,
    leadingMs: meaningfulTrim ? leadingMs : 0,
    trailingMs: meaningfulTrim ? trailingMs : 0,
    threshold: Number(threshold.toFixed(6)),
    enabled: meaningfulTrim
  };
}

function makeOnsetNotes(frames, durationMs, thresholdRatio, minGapMs, activeRange = null) {
  const activeStartMs = activeRange ? activeRange.startMs : 0;
  const activeEndMs = activeRange ? activeRange.endMs : durationMs;
  const rises = [];
  for (let i = 1; i < frames.length; i += 1) rises.push(Math.max(0, frames[i].energy - frames[i - 1].energy));
  const threshold = percentile(rises, thresholdRatio);
  const ceiling = Math.max(threshold * 1.8, percentile(rises, 0.985));
  const notes = [];
  let lastTime = -Infinity;
  for (let i = 2; i < frames.length - 2; i += 1) {
    if (frames[i].timeMs < activeStartMs || frames[i].timeMs > activeEndMs) continue;
    const rise = frames[i].energy - frames[i - 1].energy;
    const isLocalPeak = frames[i].energy >= frames[i - 1].energy && frames[i].energy >= frames[i + 1].energy;
    if (rise < threshold || !isLocalPeak || frames[i].timeMs - lastTime < minGapMs) continue;
    lastTime = frames[i].timeMs;
    notes.push({
      timeMs: frames[i].timeMs,
      lane: 'center',
      strength: Number(normalizeStrength(rise, threshold, ceiling).toFixed(3))
    });
  }
  return notes.filter((note) => note.timeMs >= activeStartMs && note.timeMs <= activeEndMs);
}

function estimateBeatIntervalMs(notes) {
  const gaps = [];
  for (let i = 1; i < notes.length; i += 1) {
    const gap = notes[i].timeMs - notes[i - 1].timeMs;
    if (gap >= 180 && gap <= 1400) gaps.push(gap);
  }
  if (!gaps.length) return 600;
  return Math.round(percentile(gaps, 0.5));
}

function analyzeFile(filePath, options) {
  const sampleRate = options.sampleRate;
  const frameMs = options.frameMs;
  const pcm = runFfmpegToPcm(filePath, sampleRate);
  const samples = pcmBufferToFloat32(pcm);
  const durationMs = Math.round(samples.length / sampleRate * 1000);
  const frames = buildEnergyFrames(samples, sampleRate, frameMs);
  const activeRange = detectActiveAudioRange(frames, durationMs, options);
  const notes = makeOnsetNotes(frames, durationMs, options.thresholdRatio, options.minGapMs, activeRange);
  const runtimePath = toAudioRuntimePath(filePath);
  return {
    id: path.basename(filePath).replace(/\.[^.]+$/, ''),
    path: runtimePath,
    source: toProjectRelative(filePath),
    analyzer: 'onset-energy-v2',
    durationMs,
    beatIntervalMs: estimateBeatIntervalMs(notes),
    playbackTrim: {
      enabled: activeRange.enabled,
      startMs: activeRange.startMs,
      endMs: activeRange.endMs,
      leadingMs: activeRange.leadingMs,
      trailingMs: activeRange.trailingMs,
      threshold: activeRange.threshold
    },
    noteCount: notes.length,
    notes
  };
}

function writeOutputs(maps, cjsOut, jsonOut) {
  fs.mkdirSync(path.dirname(cjsOut), { recursive: true });
  fs.mkdirSync(path.dirname(jsonOut), { recursive: true });
  const header = `/**\n * Generated by tools/analyze-rhythm-notes.cjs.\n * Do not edit by hand. Re-run: npm run analyze:rhythm\n */\n`;
  fs.writeFileSync(cjsOut, `${header}const RHYTHM_NOTE_MAPS = ${JSON.stringify(maps, null, 2)};\n\nmodule.exports = { RHYTHM_NOTE_MAPS };\n`);
  fs.writeFileSync(jsonOut, `${JSON.stringify(maps, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = args._[0] || DEFAULT_BGM_DIR;
  const files = listMp3Files(target);
  if (!files.length) {
    console.error(`No mp3 files found under: ${target}`);
    process.exit(1);
  }

  const options = {
    sampleRate: toNumber(args['sample-rate'], 22050),
    frameMs: toNumber(args['frame-ms'], 25),
    minGapMs: toNumber(args['min-gap-ms'], 260),
    thresholdRatio: Math.max(0.5, Math.min(0.995, toNumber(args.threshold, 0.86))),
    noPlaybackTrim: Boolean(args['no-playback-trim']),
    silenceThreshold: toNumber(args['silence-threshold'], 0.003),
    silenceRatio: Math.max(0.005, Math.min(0.25, toNumber(args['silence-ratio'], 0.025))),
    trimPaddingMs: toNumber(args['trim-padding-ms'], 120),
    minTrimMs: toNumber(args['min-trim-ms'], 180),
    minActiveMs: toNumber(args['min-active-ms'], 5000)
  };
  const cjsOut = args.out ? path.resolve(PROJECT_ROOT, args.out) : DEFAULT_CJS_OUT;
  const jsonOut = args['public-json'] ? path.resolve(PROJECT_ROOT, args['public-json']) : DEFAULT_JSON_OUT;

  const maps = {};
  const generatedAt = new Date().toISOString();
  console.log(`Scanning ${files.length} mp3 file(s) under ${normalizeSlash(path.resolve(target))}`);
  for (const file of files) {
    const analyzed = analyzeFile(file, options);
    analyzed.generatedAt = generatedAt;
    maps[analyzed.path] = analyzed;
    const trim = analyzed.playbackTrim && analyzed.playbackTrim.enabled
      ? `, trim ${analyzed.playbackTrim.leadingMs}ms/${analyzed.playbackTrim.trailingMs}ms`
      : '';
    console.log(`- ${analyzed.path}: ${analyzed.noteCount} notes, beat~${analyzed.beatIntervalMs}ms${trim}`);
  }
  writeOutputs(maps, cjsOut, jsonOut);
  console.log(`Wrote ${toProjectRelative(cjsOut)}`);
  console.log(`Wrote ${toProjectRelative(jsonOut)}`);
}

try { main(); }
catch (error) {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
}
