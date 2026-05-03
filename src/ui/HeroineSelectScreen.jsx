import React from 'react';
import { THEME } from './theme';
import GameHud, { getRouteModeMeta } from './GameHud';
import { HEROINES, getHeroineAsset } from '../data/heroines';
import { getRouteText } from '../game/eventSystem';

const HeroineSelectScreen = ({
  previewHeroineId,
  onPreviewHeroineChange,
  onToggleRouteMode,
  canToggleRouteMode,
  onSelectHeroine,
  affection,
  routeMode,
  screen,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  renderThemeStyles,
  HeroineDisplay,
  getFullPath,
  audioEngine
}) => {
  const selectedHeroine = HEROINES.find(h => h.id === previewHeroineId) || HEROINES[0];
  const routeMeta = getRouteModeMeta(routeMode);
  const isLongHistoryUnlocked = Boolean(canToggleRouteMode);

  const containerStyle = {
    width: '100%',
    height: '100%',
    padding: '24px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box'
  };

  const titleStyle = {
    fontFamily: "'Playfair Display', serif",
    color: THEME.starGold,
    textShadow: `0 2px 10px ${THEME.nightBlue}`,
    letterSpacing: '0.05em'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    border: `1px solid ${THEME.brass}`,
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    margin: '10px 0',
    fontFamily: 'inherit'
  };

  const narrativeBoxStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '15px',
    border: `1px solid ${THEME.brass}`,
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    color: THEME.textDark
  };

  const handleHeroineIconClick = (heroineId) => {
    if (audioEngine) audioEngine.playSfx('uiHeroineTab');
    if (heroineId === previewHeroineId) {
      if (isLongHistoryUnlocked && onToggleRouteMode) {
        onToggleRouteMode(heroineId);
      }
      return;
    }
    if (onPreviewHeroineChange) onPreviewHeroineChange(heroineId);
  };

  const previewExpressionFor = (heroineId) => (
    heroineId === previewHeroineId && routeMode === 'long_history' ? 'maid' : 'normal'
  );

  return (
    <div data-testid="heroine-select-screen" style={containerStyle}>
      {renderThemeStyles && renderThemeStyles()}
      <GameHud
        screen={screen}
        routeMode={routeMode}
        onOpenLog={onOpenLog}
        onOpenOptions={onOpenOptions}
        onOpenHelp={onOpenHelp}
      />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ ...titleStyle, margin: '0 0 18px 0', textAlign: 'center' }}>ヒロインを選ぶ</h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '18px', width: '100%', maxWidth: '350px', flexWrap: 'wrap' }}>
          {HEROINES.map(h => {
            const isSelected = previewHeroineId === h.id;
            const previewExpression = previewExpressionFor(h.id);
            return (
              <div
                data-testid={`heroine-tab-${h.id}`}
                key={h.id}
                className="heroine-card"
                onClick={() => handleHeroineIconClick(h.id)}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: `3px solid ${isSelected ? h.themeColor : 'rgba(226,209,177,0.65)'}`,
                  background: '#111',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.12)' : 'scale(1.0)',
                  boxShadow: isSelected ? `0 0 0 5px ${h.themeColor}33, -10px 0 18px ${h.themeColor}66` : '0 2px 8px rgba(0,0,0,0.35)',
                  overflow: 'hidden',
                  zIndex: isSelected ? 2 : 1,
                  boxSizing: 'border-box',
                  position: 'relative'
                }}
              >
                <img
                  src={getFullPath ? getFullPath(getHeroineAsset(h.id, 'face', previewExpression)) : ''}
                  alt={h.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: h.visualConfig?.facePosition || 'center 20%',
                    display: 'block',
                    borderRadius: '50%',
                    clipPath: 'circle(50% at 50% 50%)'
                  }}
                  draggable={false}
                />
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '7px',
                    left: '-3px',
                    width: '18px',
                    height: '50px',
                    borderLeft: `3px solid ${THEME.starGold}`,
                    borderRadius: '50%',
                    filter: `drop-shadow(0 0 5px ${h.themeColor})`,
                    pointerEvents: 'none'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          ...cardStyle,
          maxWidth: '350px',
          height: '420px',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          background: THEME.parchment,
          border: `2px solid ${selectedHeroine.themeColor}`,
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: selectedHeroine.themeColor }} />

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
            {HeroineDisplay && <HeroineDisplay heroine={selectedHeroine} type="face" size="medium" expression={routeMode === 'long_history' ? 'maid' : 'normal'} />}
            <div style={{ textAlign: 'left', flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.3em', color: THEME.textDark }}>{selectedHeroine.name}</h3>
              <div style={{ fontSize: '0.85em', color: selectedHeroine.themeColor, fontWeight: 'bold' }}>{selectedHeroine.role}</div>
              <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                親密度: <span style={{ fontWeight: 'bold', color: THEME.textDark }}>{affection ? affection[selectedHeroine.id] : 0}</span>
              </div>
            </div>
          </div>

          <div style={{
            ...narrativeBoxStyle,
            flex: 1,
            padding: '12px',
            fontSize: '0.9em',
            marginBottom: '10px',
            overflowY: 'auto',
            background: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(0,0,0,0.05)',
            color: '#333',
            textAlign: 'left'
          }}>
            {getRouteText(selectedHeroine.description, { long_history: selectedHeroine.routeDescription }, routeMode)}
          </div>

          <div style={{
            fontSize: '0.75em',
            color: THEME.textDark,
            marginBottom: '10px',
            lineHeight: 1.5,
            background: 'rgba(255,255,255,0.55)',
            borderRadius: '8px',
            padding: '8px 10px',
            border: `1px solid ${THEME.brass}`
          }}>
            <div style={{ fontWeight: 'bold', color: selectedHeroine.themeColor }}>
              ルート: {routeMeta.label}
            </div>
            <div style={{ marginTop: '4px' }}>
              {isLongHistoryUnlocked
                ? '同じヒロインをもう一度押すと、解放済みルートへ切り替わります。'
                : '解放されたら、同じヒロインをもう一度押してルートを切り替えられます。'}
            </div>
          </div>

          <button
            data-testid="heroine-start"
            onClick={() => onSelectHeroine && onSelectHeroine(selectedHeroine.id)}
            style={{
              ...buttonStyle,
              width: '100%',
              margin: 0,
              background: selectedHeroine.themeColor,
              color: '#fff',
              border: `2px solid ${selectedHeroine.themeColor}`,
              boxShadow: '0 4px 0 rgba(0,0,0,0.2)'
            }}
          >
            {selectedHeroine.name}で始める
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroineSelectScreen;
