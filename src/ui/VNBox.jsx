import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { audioEngine } from '../game/audioEngine';
import { THEME } from './theme';

/**
 * VNBox Component
 * Handles typewriter effect, page progression, and NEXT/FINISH indicators.
 * Supported Props:
 * - text: Single page text (fallback if pages not provided)
 * - pages: Array of page strings or objects { speaker, text }
 * - speaker: Default speaker name
 * - themeColor: Accent color for border and UI elements
 * - onComplete: Callback when the last page is finished
 * - onPageComplete: Callback when a page finishes typing
 * - speed: Typewriter delay (ms)
 * - skip: If true, renders text instantly
 */
const VNBox = forwardRef(({ text, pages, speaker, hint, themeColor, onComplete, onPageComplete, speed = 30, skip = false, getFaceIcon }, ref) => {
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : [text || ""];
  const [pageIndex, setPageIndex] = useState(0);
  
  const currentPage = pageList[pageIndex];
  const currentText = typeof currentPage === 'object' ? (currentPage?.text || "") : (currentPage || "");
  const currentSpeaker = typeof currentPage === 'object' && currentPage?.speaker !== undefined ? currentPage.speaker : speaker;
  const currentSpeakerId = typeof currentPage === 'object' ? currentPage.speakerId : null;
  const currentExpression = typeof currentPage === 'object' ? (currentPage.expression || 'normal') : 'normal';
  const currentHint = typeof currentPage === 'object' ? (currentPage.hint || hint) : hint;

  const [displayText, setDisplayText] = useState(skip ? currentText : "");
  const [isComplete, setIsComplete] = useState(skip);
  const [currentIndex, setCurrentIndex] = useState(0);
  const loggedPagesRef = useRef(new Set());

  const markPageComplete = () => {
    if (!currentText) return;
    const key = `${pageIndex}:${currentText}`;
    if (loggedPagesRef.current.has(key)) return;
    loggedPagesRef.current.add(key);
    onPageComplete?.({ speaker: currentSpeaker, speakerId: currentSpeakerId, text: currentText, pageIndex });
  };

  useEffect(() => {
    if (skip) {
      setDisplayText(currentText);
      setIsComplete(true);
      markPageComplete();
      return;
    }

    setDisplayText("");
    setIsComplete(false);
    setCurrentIndex(0);
  }, [currentText, skip]);

  useEffect(() => {
    if (isComplete || skip) return;

    if (currentIndex < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + currentText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      markPageComplete();
    }
  }, [currentIndex, currentText, isComplete, speed, skip]);

  const handleClick = (e) => {
    if (e) e.stopPropagation();
    if (!isComplete) {
      setDisplayText(currentText);
      setIsComplete(true);
      markPageComplete();
    } else if (pageIndex < pageList.length - 1) {
      setPageIndex(prev => prev + 1);
      setDisplayText("");
      setIsComplete(false);
      setCurrentIndex(0);
      audioEngine.playSfx('uiTapBottle');
    } else if (onComplete) {
      audioEngine.playSfx('uiTapBottle');
      onComplete();
    }
  };

  useImperativeHandle(ref, () => ({
    advance: () => handleClick()
  }));

  const facePath = currentSpeakerId && getFaceIcon ? getFaceIcon(currentSpeakerId, 'face', currentExpression) : null;

  return (
    <div 
      data-testid="vn-box"
      onClick={handleClick}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        height: '166px', // Slightly taller for stability
        background: 'rgba(18, 28, 42, 0.98)',
        padding: currentSpeaker ? '22px 24px 28px 24px' : '18px 24px 28px 24px',
        borderRadius: '12px', // Single card feel
        cursor: 'pointer',
        color: THEME.parchment,
        textAlign: 'left',
        position: 'relative',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        userSelect: 'none',
        lineHeight: '1.7',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible', // Allow speaker tag to hook onto corner
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      {/* Speaker Tag (Small Corner Hook) */}
      {currentSpeaker && (
        <div style={{ 
          position: 'absolute',
          left: '10px',
          top: '-8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 10px 2px 2px',
          height: '30px',
          boxSizing: 'border-box',
          borderRadius: '999px',
          background: '#0c1926', // Opaque to cleanly overlap corner
          border: `1px solid ${themeColor || THEME.brass}77`,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)'
        }}>
          {facePath && (
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `1px solid ${themeColor || THEME.brass}88`,
              background: 'rgba(0,0,0,0.4)',
              flexShrink: 0
            }}>
              <img 
                src={facePath} 
                alt={currentSpeaker} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  WebkitUserDrag: 'none',
                  userSelect: 'none'
                }}
                draggable={false}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          <div style={{ 
            fontSize: '0.82em', 
            color: themeColor || THEME.brass, 
            fontWeight: '700', 
            letterSpacing: '0.04em',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {currentSpeaker}
          </div>
        </div>
      )}

      <div style={{ 
        fontSize: currentSpeaker ? '1.05em' : '1.1em', 
        lineHeight: '1.6', 
        minHeight: '3.6em', // Adjusted for extra padding
        flex: 1,
        opacity: currentSpeaker ? 1 : 0.95,
        fontStyle: currentSpeaker ? 'normal' : 'italic'
      }}>
        {displayText}
        {!isComplete && <span style={{ animation: 'vn-blink 1s infinite', marginLeft: '4px', borderLeft: `2px solid ${THEME.brass}` }}>&nbsp;</span>}
      </div>

      {/* Footer Info Area */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '8px',
        minHeight: '24px'
      }}>
        {/* Hint (Bottom Left) */}
        <div style={{
          fontSize: '0.72em',
          color: THEME.oasisTeal,
          opacity: 0.8,
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0,0,0,0.2)',
          padding: currentHint ? '2px 10px' : '0',
          borderRadius: '4px',
          visibility: currentHint ? 'visible' : 'hidden',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 'calc(100% - 140px)'
        }}>
          {currentHint && (
            <>
              <span style={{ fontSize: '1.1em' }}>💡</span>
              {currentHint}
            </>
          )}
        </div>

        {/* Progression Indicator (Bottom Right) */}
        {isComplete && (
          <div style={{ 
            fontSize: '0.8em', 
            color: themeColor || THEME.brass,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'vn-bounce 1s infinite',
            background: 'rgba(0,0,0,0.4)',
            padding: '4px 12px',
            borderRadius: '999px',
            border: `1px solid ${themeColor || THEME.brass}44`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            <span style={{ fontSize: '0.9em' }}>{pageIndex < pageList.length - 1 ? 'NEXT' : 'FINISH'}</span>
            <span style={{ fontSize: '1.2em' }}>▼</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes vn-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes vn-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      `}</style>
    </div>
  );
});

export default VNBox;
