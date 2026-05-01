import React from 'react';
import GameHud from './GameHud';
import { THEME } from './theme';

/**
 * MemoriesScreen Component
 * Extracted from App.jsx to handle the 'MEMORIES' screen.
 */
const MemoriesScreen = ({
  screen,
  routeMode,
  seenEventIds,
  heroines,
  affectionEvents,
  onBackToTitle,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  onRecallEvent,
  renderThemeStyles,
  renderUtilityHeader,
  unlockAll = false
}) => {
  const allEvents = Object.values(affectionEvents).flat();
  const seenEvents = unlockAll ? allEvents : allEvents.filter(e => seenEventIds.includes(e.id));

  // Isolated styles to avoid conflicts in main.canvas.jsx top-level
  const memoriesContainerStyle = {
    width: '100%',
    height: '100%',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box'
  };

  const memoriesTitleStyle = {
    color: '#e2d1b1',
    fontSize: '1.4em',
    margin: '0 0 12px 0',
    textAlign: 'center',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    fontWeight: 'bold'
  };

  const memoriesCardStyle = {
    width: 'calc(100% - 16px)',
    maxWidth: '800px',
    padding: '12px',
    border: `1px solid ${THEME.brass}`,
    borderRadius: '8px',
    background: THEME.parchment,
    color: THEME.textDark,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    position: 'relative',
    boxSizing: 'border-box',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    margin: '0 8px 8px',
    overflow: 'hidden'
  };

  return (
    <div data-testid="memories-screen" style={memoriesContainerStyle}>
      {renderThemeStyles && renderThemeStyles()}
      <GameHud 
        screen={screen} 
        routeMode={routeMode} 
        onOpenLog={onOpenLog} 
        onOpenOptions={onOpenOptions} 
        onOpenHelp={onOpenHelp} 
      />
      {renderUtilityHeader && renderUtilityHeader('Memories', onBackToTitle, null, 'memories')}
      <h1 style={{ ...memoriesTitleStyle, display: 'none' }}>思い出の記録</h1>
      
      {unlockAll && (
        <div style={{ 
          background: THEME.starGold, 
          color: '#000', 
          padding: '4px 10px', 
          fontSize: '0.7em', 
          fontWeight: 'bold', 
          borderRadius: '4px',
          marginBottom: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          DEBUG: UNLOCK ALL MODE ACTIVE
        </div>
      )}
      <div style={memoriesCardStyle}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '2px' }}>
          {seenEvents.length === 0 ? (
            <div style={{ padding: '60px 20px', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
              <p>まだ見返したい記憶はありません。</p>
              <p style={{ fontSize: '0.9em', marginTop: '10px' }}>営業を進めると、ここに記憶が積み上がっていきます。</p>
            </div>
          ) : (
            <div style={{ textAlign: 'left' }}>
              {heroines.map(heroine => {
                const heroineSeenEvents = seenEvents.filter(e => e.heroineId === heroine.id);
                if (heroineSeenEvents.length === 0) return null;

                return (
                  <div key={heroine.id} style={{ marginBottom: '30px' }}>
                    <div style={{ 
                      color: heroine.themeColor, 
                      fontWeight: 'bold', 
                      borderBottom: `2px solid ${heroine.themeColor}`, 
                      paddingBottom: '5px', 
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '1.1em'
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: heroine.themeColor }} />
                      {heroine.name}との思い出
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                      {heroineSeenEvents.map(event => (
                        <div 
                          key={event.id}
                          className="memory-item"
                          onClick={() => onRecallEvent && onRecallEvent(event)}
                          style={{
                            background: 'rgba(0,0,0,0.03)',
                            padding: '12px 15px',
                            borderRadius: '0 4px 4px 0',
                            border: '1px solid rgba(0,0,0,0.05)',
                            borderLeft: `4px solid ${heroine.themeColor}`,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ fontWeight: 'bold' }}>{event.title}</span>
                          <span style={{ fontSize: '0.8em', color: THEME.brassDark }}>詳細を見る</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoriesScreen;
