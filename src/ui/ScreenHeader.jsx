import React from 'react';
import { TIME_PHASES } from '../game/timePhase';
import { THEME } from './theme';
import { audioEngine } from '../game/audioEngine';

const ScreenHeader = ({
  timePhase,
  title,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  routeMode,
  screen
}) => {
  const isHudVisible = !['ENDING', 'FINAL_RESULT', 'VISUAL_TEST', 'SOUND_TEST'].includes(screen);
  const isLongHistory = routeMode === 'long_history';

  const hudBtnStyle = {
    background: isLongHistory ? 'rgba(255, 220, 235, 0.96)' : 'rgba(255, 255, 255, 0.92)',
    border: `2px solid ${THEME.brass}`,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
    padding: 0,
    flexShrink: 0
  };

  const phase = timePhase && TIME_PHASES[timePhase.key?.toUpperCase()] ? TIME_PHASES[timePhase.key.toUpperCase()] : timePhase;
  const showBadge = phase && phase.key !== 'none';

  return (
    <div style={{
      position: 'absolute',
      top: '8px',
      left: '8px',
      right: '8px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      minHeight: '40px'
    }}>
      <div style={{ flexShrink: 0 }}>
        {showBadge && (
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
        )}
      </div>

      {title && (
        <h1 style={{
          color: '#e2d1b1',
          fontSize: '1.15em',
          margin: 0,
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          fontWeight: 'bold',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {title}
        </h1>
      )}

      {isHudVisible && (
        <div style={{ flexShrink: 0, display: 'flex', gap: '6px' }}>
          <button
            data-testid="backlog-hud-open"
            onClick={() => { audioEngine.playSfx('uiTapBottle'); onOpenLog(); }}
            style={hudBtnStyle}
            aria-label="ログ"
          >📖</button>
          <button
            data-testid="options-open"
            onClick={() => { audioEngine.playSfx('uiTapBottle'); onOpenOptions(); }}
            style={hudBtnStyle}
            aria-label="設定"
          >⚙️</button>
          <button
            data-testid="help-hud-open"
            onClick={() => { audioEngine.playSfx('uiTapBottle'); onOpenHelp(); }}
            style={hudBtnStyle}
            aria-label="ヘルプ"
          >？</button>
        </div>
      )}
    </div>
  );
};

export default ScreenHeader;
