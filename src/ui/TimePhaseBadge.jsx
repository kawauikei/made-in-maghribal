import React from 'react';
import { TIME_PHASES } from '../game/timePhase';
import { THEME } from './theme';

/**
 * TimePhaseBadge Component
 * Displays the current time phase (morning/opening/closing/night) in the top-left corner.
 */
const TimePhaseBadge = ({ timePhase }) => {
  if (!timePhase || timePhase.key === 'none') {
    return null;
  }

  const phase = TIME_PHASES[timePhase.key.toUpperCase()] || timePhase;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: `rgba(12, 25, 38, 0.85)`,
        border: `1px solid ${phase.color}77`,
        borderRadius: '999px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        maxWidth: '120px',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      {phase.icon && (
        <span style={{ fontSize: '1.1em', lineHeight: 1 }}>{phase.icon}</span>
      )}
      <span
        style={{
          fontSize: '0.75em',
          fontWeight: 'bold',
          color: phase.color,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap'
        }}
      >
        {phase.label}
      </span>
    </div>
  );
};

export default TimePhaseBadge;
