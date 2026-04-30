import React from 'react';
import { THEME } from './theme';
import GameHud from './GameHud';
import { HEROINES, getHeroineAsset } from '../data/heroines';
import { getRouteText } from '../game/eventSystem';

/**
 * HeroineSelectScreen Component
 * Encapsulates the HEROINE_SELECT screen logic and UI.
 */
const HeroineSelectScreen = ({
  previewHeroineId,
  onPreviewHeroineChange,
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

  // Replicating styles from App.jsx
  const containerStyle = {
    width: '100%',
    height: '100%',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
      
      <h1 style={{ ...titleStyle, marginBottom: '20px' }}>誰との縁を深める？</h1>
      
      {/* Tabs for Heroine selection */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '20px',
        width: '100%',
        maxWidth: '350px'
      }}>
        {HEROINES.map(h => {
          const isSelected = previewHeroineId === h.id;
          return (
            <div 
              data-testid={`heroine-tab-${h.id}`}
              key={h.id}
              onClick={() => {
                if (audioEngine) audioEngine.playSfx('uiTapBottle');
                if (onPreviewHeroineChange) onPreviewHeroineChange(h.id);
              }}
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
                src={getFullPath ? getFullPath(getHeroineAsset(h.id, 'face', 'normal')) : ''}
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

      {/* Heroine Detail Card (Fixed Height to prevent scrolling) */}
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
           {HeroineDisplay && <HeroineDisplay heroine={selectedHeroine} type="face" size="medium" expression="normal" />}
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
          marginBottom: '15px', 
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(0,0,0,0.05)',
          color: '#333',
          textAlign: 'left'
        }}>
          {getRouteText(selectedHeroine.description, { long_history: selectedHeroine.routeDescription }, routeMode)}
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
          {selectedHeroine.name}を頼む
        </button>
      </div>

      {/* Navigation Footer */}
      <div style={{ 
        marginTop: '20px',
        display: 'flex',
        gap: '20px',
        opacity: 0.8
      }}>
        {/* If back navigation was needed, it would go here */}
      </div>
    </div>
  );
};

export default HeroineSelectScreen;
