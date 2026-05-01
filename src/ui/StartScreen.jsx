import React from 'react';
import { THEME } from './theme';
import { SHOP } from '../data/world';
import { audioEngine } from '../game/audioEngine';
import GameHud, { 
  ROUTE_MODE_META, 
  getRouteModeMeta, 
  renderRouteModeBadge 
} from './GameHud';

/**
 * StartScreen Component
 * Encapsulates the Title/Start screen of Made in Maghribal.
 */
const StartScreen = ({
  screen,
  routeMode,
  setRouteMode,
  hasSave,
  onContinue,
  onNewGame,
  onOpenMemories,
  onOpenOptions,
  onOpenSoundTest,
  onOpenVisualTest,
  onClearSaveData,
  onOpenLog,
  onOpenHelp,
  renderThemeStyles,
  debugModeEnabled,
  onToggleDebug
}) => {
  const [logoTaps, setLogoTaps] = React.useState(0);
  const logoTapTimer = React.useRef(null);

  const handleLogoTap = () => {
    setLogoTaps(prev => {
      const next = prev + 1;
      if (next >= 5) {
        onToggleDebug();
        audioEngine.playSfx('uiConfirmChime');
        return 0;
      }
      return next;
    });

    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => setLogoTaps(0), 1000);
  };
  // Replicating styles from App.jsx to minimize prop passing
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

  return (
    <div data-testid="start-screen" style={containerStyle}>
      {renderThemeStyles && renderThemeStyles()}
      <GameHud 
        screen={screen} 
        routeMode={routeMode} 
        onOpenLog={onOpenLog} 
        onOpenOptions={onOpenOptions} 
        onOpenHelp={onOpenHelp} 
      />
      
      <div style={{ textAlign: 'center', marginBottom: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img 
          src={`${import.meta.env.BASE_URL}images/ui/title.png`.replace(/([^:])\/\//g, '$1/')} 
          alt={SHOP.name}
          onClick={handleLogoTap}
          style={{ 
            width: '100%', 
            maxWidth: '280px', 
            height: 'auto', 
            cursor: 'pointer', 
            userSelect: 'none',
            filter: `drop-shadow(0 4px 12px ${THEME.nightBlue}aa)`
          }} 
          draggable={false}
        />
        {debugModeEnabled && (
          <div style={{ fontSize: '10px', color: THEME.starGold, marginTop: '5px', fontFamily: 'monospace' }}>
            [ DEBUG MODE ACTIVE ]
          </div>
        )}
      </div>

      <div style={{ ...cardStyle, background: 'transparent', border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', padding: '0' }}>
        <div style={{ width: '100%', maxWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
          <div style={{ fontSize: '0.76em', color: THEME.sand, opacity: 0.85, textAlign: 'center' }}>縁のかたち</div>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            {Object.entries(ROUTE_MODE_META).map(([mode, meta]) => {
              const isSelected = routeMode === mode;
              return (
                <button
                  key={mode}
                  data-testid={`route-mode-${mode}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    audioEngine.playSfx('uiTapBottle');
                    setRouteMode(mode);
                  }}
                  style={{
                    ...buttonStyle,
                    flex: 1,
                    margin: 0,
                    padding: '10px 8px',
                    fontSize: '0.74em',
                    lineHeight: 1.2,
                    background: isSelected ? THEME.starGold : '#2c3e50',
                    color: isSelected ? THEME.textDark : THEME.sand,
                    border: `1px solid ${isSelected ? THEME.starGold : THEME.brassDark}`,
                    boxShadow: isSelected ? '0 0 0 2px rgba(255, 204, 0, 0.2)' : 'none'
                  }}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
          <div data-testid="route-mode-description" style={{ fontSize: '0.7em', color: THEME.parchment, opacity: 0.7, textAlign: 'center', marginTop: '2px', fontStyle: 'italic' }}>
            {getRouteModeMeta(routeMode).description}
          </div>
          <div data-testid="route-mode-current" style={{ display: 'flex', justifyContent: 'center' }}>
            {renderRouteModeBadge(routeMode)}
          </div>
          <button 
            data-testid="start-new" 
            onClick={onNewGame} 
            style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, width: '100%', maxWidth: '260px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '1.2em' }}>☆</span> 星瓶堂を開く
          </button>
        </div>

        {hasSave && (
          <button 
            data-testid="start-continue"
            onClick={onContinue} 
            style={{ ...buttonStyle, background: THEME.starGold, width: '100%', maxWidth: '260px', margin: 0 }}
          >
            つづきから
          </button>
        )}
        
        <button data-testid="memories-open" onClick={onOpenMemories} style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '100%', maxWidth: '260px', margin: 0 }}>
          思い出の記録
        </button>

        <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '260px' }}>
          <button 
            data-testid="start-options"
            onClick={onOpenOptions}
            style={{ ...buttonStyle, background: THEME.brass, color: THEME.textDark, fontSize: '0.85em', flex: 1, margin: 0 }}
          >
            設定
          </button>
          <button 
            data-testid="sound-test-open"
            onClick={onOpenSoundTest} 
            style={{ ...buttonStyle, background: '#333', color: '#fff', fontSize: '0.85em', flex: 1, margin: 0 }}
          >
            音設定
          </button>
          <button 
            data-testid="visual-test-open"
            onClick={onOpenVisualTest} 
            style={{ ...buttonStyle, background: '#333', color: '#fff', fontSize: '0.85em', flex: 1, margin: 0 }}
          >
            映像確認
          </button>
        </div>

        {hasSave && (
          <button 
            onClick={onClearSaveData} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#844', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontSize: '0.75em',
              marginTop: '10px',
              opacity: 0.6
            }}
          >
            記録を全て削除する
          </button>
        )}
      </div>
    </div>
  );
};

export default StartScreen;
