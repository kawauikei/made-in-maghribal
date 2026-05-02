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
        padding: '3px 8px',
        background: `rgba(12, 25, 38, 0.9)`,
        border: `1px solid ${phase.color}99`,
        borderRadius: '999px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        maxWidth: '100px',
        pointerEvents: 'none',
        userSelect: 'none',
        fontSize: '0.7em'
      }}
    >
      {phase.icon && (
        <span style={{ fontSize: '1em', lineHeight: 1 }}>{phase.icon}</span>
      )}
      <span
        style={{
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
