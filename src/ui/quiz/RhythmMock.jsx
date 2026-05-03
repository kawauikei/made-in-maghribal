import React, { useEffect, useMemo, useState } from 'react';
import { THEME } from '../theme';

export const DEFAULT_NOTE_INTERVAL_MS = 750;
export const DEFAULT_JUDGMENT_WINDOW_MS = 140;
const DEFAULT_TRAVEL_DURATION_MS = 2000;
const DEFAULT_LANE_HEIGHT = 58;
export const DEFAULT_RHYTHM_PHASE_OFFSET_MS = DEFAULT_TRAVEL_DURATION_MS / 2;

export function getRhythmPhaseMs(now = Date.now(), noteIntervalMs = DEFAULT_NOTE_INTERVAL_MS) {
  const phase = now % noteIntervalMs;
  return phase < 0 ? phase + noteIntervalMs : phase;
}

export function getIsRhythmHitNow({
  now = Date.now(),
  noteIntervalMs = DEFAULT_NOTE_INTERVAL_MS,
  judgmentWindowMs = DEFAULT_JUDGMENT_WINDOW_MS,
  phaseOffsetMs = DEFAULT_RHYTHM_PHASE_OFFSET_MS,
} = {}) {
  const phase = getRhythmPhaseMs(now - phaseOffsetMs, noteIntervalMs);
  return phase <= judgmentWindowMs || phase >= noteIntervalMs - judgmentWindowMs;
}

export default function RhythmMock({
  heroineId,
  themeColor,
  noteIntervalMs = DEFAULT_NOTE_INTERVAL_MS,
  judgmentWindowMs = DEFAULT_JUDGMENT_WINDOW_MS,
  travelDurationMs = DEFAULT_TRAVEL_DURATION_MS,
  laneHeight = DEFAULT_LANE_HEIGHT,
}) {
  const naderFace = `./characters/nader/face_proc/normal.png`;
  const heroineFace = `./characters/${heroineId}/face_proc/normal.png`;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setNow(Date.now());
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isRhythmHit = getIsRhythmHitNow({ now, noteIntervalMs, judgmentWindowMs });
  const noteStartIndex = Math.floor((now - travelDurationMs) / noteIntervalMs) - 1;
  const noteEndIndex = Math.floor((now + 200) / noteIntervalMs) + 2;
  const notes = useMemo(() => {
    const items = [];
    for (let index = noteStartIndex; index <= noteEndIndex; index += 1) {
      const spawnTime = index * noteIntervalMs;
      const age = now - spawnTime;
      const progress = age / travelDurationMs;
      if (progress < -0.15 || progress > 1.15) continue;
      const left = -8 + (progress * 116);
      const distanceToTarget = Math.abs(left - 50);
      items.push({
        index,
        left,
        isTargeting: distanceToTarget <= 4,
        isVisible: progress >= 0 && progress <= 1,
      });
    }
    return items;
  }, [now, noteStartIndex, noteEndIndex, noteIntervalMs, travelDurationMs]);

  return (
    <div style={{
      width: '100%',
      minHeight: `${laneHeight}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      margin: '0',
      padding: '0 4px',
      pointerEvents: 'none',
      userSelect: 'none',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        width: '72%',
        height: '100%',
        background: `radial-gradient(ellipse at center, ${THEME.brass}12 0%, transparent 72%)`,
        zIndex: 0
      }} />

      <div style={{ 
        width: '38px', 
        height: '38px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: `2px solid ${THEME.brass}`, 
        background: 'rgba(35, 25, 18, 0.9)', 
        opacity: 0.8,
        boxShadow: '0 0 12px rgba(0,0,0,0.6)',
        flexShrink: 0,
        zIndex: 2,
        transition: 'transform 0.3s'
      }}>
        <img src={naderFace} alt="N" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{
        flex: 1,
        maxWidth: '460px',
        height: '32px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))',
        border: `1px solid ${THEME.brass}20`,
        borderRadius: '999px',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '2px',
          background: `linear-gradient(to right, transparent, ${THEME.brass} 14%, ${THEME.brass} 86%, transparent)`,
          top: '50%',
          transform: 'translateY(-50%)'
        }} />

        {[14, 28, 72, 86].map(pos => (
          <div key={pos} style={{ 
            position: 'absolute', 
            left: `${pos}%`, 
            width: '5px', 
            height: '5px', 
            transform: 'rotate(45deg)',
            background: THEME.brass, 
            boxShadow: `0 0 4px ${THEME.brass}88`,
            opacity: 0.25 
          }} />
        ))}

        <div style={{
          position: 'absolute',
          top: '4px',
          left: '50%',
          bottom: '4px',
          width: '3px',
          transform: 'translateX(-50%)',
          background: `linear-gradient(to bottom, transparent, ${THEME.starGold}, transparent)`,
          boxShadow: `0 0 10px ${THEME.starGold}`,
          opacity: isRhythmHit ? 0.95 : 0.72,
          zIndex: 2
        }} />

        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: `2px solid ${THEME.starGold}`,
          background: isRhythmHit ? 'rgba(255, 219, 128, 0.24)' : 'rgba(255, 255, 255, 0.14)',
          boxShadow: isRhythmHit
            ? `0 0 18px ${THEME.starGold}cc`
            : `0 0 10px ${THEME.starGold}66`,
          zIndex: 3
        }} />

        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: isRhythmHit
            ? `radial-gradient(circle, ${THEME.starGold}30 0%, transparent 68%)`
            : `radial-gradient(circle, ${THEME.starGold}18 0%, transparent 72%)`,
          zIndex: 1
        }} />

        {notes.map(note => (
          <div
            key={note.index}
            style={{
              position: 'absolute',
              left: `${note.left}%`,
              top: '50%',
              width: note.isTargeting ? '5px' : '4px',
              height: note.isTargeting ? '28px' : '22px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '999px',
              background: note.isTargeting
                ? `linear-gradient(180deg, ${THEME.starGold}, ${themeColor || THEME.brass})`
                : `linear-gradient(180deg, rgba(255,255,255,0.88), rgba(221, 194, 128, 0.72))`,
              boxShadow: note.isTargeting
                ? `0 0 10px ${THEME.starGold}88`
                : '0 0 5px rgba(255,255,255,0.16)',
              opacity: note.isVisible ? 0.96 : 0.52,
              zIndex: note.isTargeting ? 4 : 2
            }}
          />
        ))}
      </div>

      <div style={{ 
        width: '38px', 
        height: '38px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: `2px solid ${themeColor || THEME.brass}`, 
        background: 'rgba(35, 25, 18, 0.9)', 
        boxShadow: `0 0 12px ${(themeColor || THEME.brass)}88`,
        flexShrink: 0,
        zIndex: 2,
        transition: 'transform 0.3s'
      }}>
        <img src={heroineFace} alt="H" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );
}
