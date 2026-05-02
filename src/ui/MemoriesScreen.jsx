import React, { useRef, useState } from 'react';
import GameHud from './GameHud';
import { THEME } from './theme';
import { STILL_IMAGES, BACKGROUND_IMAGES, getStillById, getBackgroundById } from '../data/imageAssets';
import { getHeroineAsset } from '../data/heroines';

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
  unlockAll = false,
  memoriesScrollPosition = 0, // M-MEMORIES-UX-POLISH-1-FIX-1: Scroll position from App.jsx
  onMemoriesScrollSave = null // M-MEMORIES-UX-POLISH-1-FIX-1: Callback to save scroll position
}) => {
  const allEvents = Object.values(affectionEvents).flat();
  const seenEvents = unlockAll ? allEvents : allEvents.filter(e => seenEventIds.includes(e.id));

  // Scroll position restoration (M-MEMORIES-UX-POLISH-1-FIX-1)
  const scrollContainerRef = useRef(null);

  const handleRecallEvent = (event) => {
    // Save scroll position before navigating
    if (scrollContainerRef.current && onMemoriesScrollSave) {
      onMemoriesScrollSave(scrollContainerRef.current.scrollTop);
    }
    onRecallEvent && onRecallEvent(event);
  };

  // Restore scroll position when component mounts
  React.useEffect(() => {
    if (scrollContainerRef.current && memoriesScrollPosition > 0) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = memoriesScrollPosition;
        }
      });
    }
  }, [memoriesScrollPosition]);

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

  const heroineIconStyle = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `2px solid ${THEME.brass}`,
    background: THEME.sand,
    imageRendering: 'auto',
    backfaceVisibility: 'hidden'
  };

  const thumbnailStyle = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: `1px solid ${THEME.brass}`,
    flexShrink: 0,
    imageRendering: 'auto',
    backfaceVisibility: 'hidden'
  };

  const memoryItemStyle = (heroineThemeColor) => ({
    background: 'rgba(0,0,0,0.03)',
    padding: '8px',
    borderRadius: '0 4px 4px 0',
    border: '1px solid rgba(0,0,0,0.05)',
    borderLeft: `4px solid ${heroineThemeColor}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '76px',
    transition: 'background 0.15s ease'
  });

  const memoryTitleStyle = {
    fontWeight: 'bold',
    fontSize: '0.9em',
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1
  };

  const getEventThumbnail = (event) => {
    // Try still image first
    if (event.stillImageId) {
      const still = getStillById(event.stillImageId);
      if (still) {
        return { src: still.src, alt: still.label || event.title, type: 'still' };
      }
    }
    
    // Try background from presentation
    if (event.presentation?.backgroundId) {
      const bg = getBackgroundById(event.presentation.backgroundId);
      if (bg) {
        return { src: bg.src, alt: bg.label || event.title, type: 'background' };
      }
    }
    
    // Fallback: use heroine icon
    if (event.heroineId) {
      const heroine = heroines.find(h => h.id === event.heroineId);
      if (heroine) {
        return { src: null, alt: heroine.name, type: 'fallback', color: heroine.themeColor };
      }
    }
    
    // Ultimate fallback
    return { src: null, alt: 'Memory', type: 'fallback', color: THEME.brass };
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
        <div 
          ref={scrollContainerRef}
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '2px' }}
        >
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
                      <img 
                        src={getHeroineAsset(heroine.id, 'face', 'normal')}
                        alt={heroine.name}
                        style={heroineIconStyle}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline-block';
                        }}
                      />
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: heroine.themeColor,
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.7em',
                        fontWeight: 'bold'
                      }}>
                        {heroine.name.charAt(0)}
                      </div>
                      {heroine.name}との思い出
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {heroineSeenEvents.map(event => {
                        const thumb = getEventThumbnail(event);
                        return (
                          <div 
                            key={event.id}
                            className="memory-item"
                            onClick={() => handleRecallEvent(event)}
                            style={memoryItemStyle(heroine.themeColor)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                            }}
                          >
                            {thumb.type === 'fallback' ? (
                              <div style={{ 
                                ...thumbnailStyle, 
                                background: thumb.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '1.2em',
                                fontWeight: 'bold'
                              }}>
                                ?
                              </div>
                            ) : (
                              <img 
                                src={thumb.src} 
                                alt={thumb.alt}
                                style={thumbnailStyle}
                                loading="lazy"
                              />
                            )}
                            <span style={memoryTitleStyle}>{event.title}</span>
                          </div>
                        );
                      })}
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
