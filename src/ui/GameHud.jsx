import React from 'react';
import { THEME } from './theme';
import { audioEngine } from '../game/audioEngine';

export const ROUTE_MODE_META = {
  normal: {
    label: '現在の縁',
    description: 'はじめて出会う、現在から育つ縁'
  },
  long_history: {
    label: '過去の縁',
    description: '通常ルートとは別の関係性で始まる、過去から続く縁'
  }
};

export const getRouteModeMeta = (routeMode) => ROUTE_MODE_META[routeMode] || ROUTE_MODE_META.normal;

export const renderRouteModeBadge = (routeMode, compact = false) => {
  const meta = getRouteModeMeta(routeMode);
  return (
    <div
      data-testid="route-mode-badge"
      data-route-mode={routeMode}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '5px 8px' : '6px 10px',
        borderRadius: '999px',
        border: `1px solid \${THEME.brass}`,
        background: 'rgba(255,255,255,0.9)',
        color: THEME.nightBlue,
        fontSize: compact ? '0.7em' : '0.78em',
        fontWeight: 'bold',
        lineHeight: 1,
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        maxWidth: '100%',
        whiteSpace: 'nowrap'
      }}
    >
      {meta.label}
    </div>
  );
};

export const GameHud = ({ 
  screen, 
  routeMode, 
  onOpenLog, 
  onOpenOptions, 
  onOpenHelp 
}) => {
  const isHudVisible = !['ENDING', 'FINAL_RESULT', 'VISUAL_TEST', 'SOUND_TEST'].includes(screen);
  if (!isHudVisible) return null;

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

  return (
    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
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
    </div>
  );
};

export default GameHud;
