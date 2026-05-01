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
const VNBox = forwardRef(({ text, pages, speaker, themeColor, onComplete, onPageComplete, speed = 30, skip = false, getFaceIcon }, ref) => {
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : [text || ""];
  const [pageIndex, setPageIndex] = useState(0);
  
  const currentPage = pageList[pageIndex];
  const currentText = typeof currentPage === 'object' ? (currentPage?.text || "") : (currentPage || "");
  const currentSpeaker = typeof currentPage === 'object' && currentPage?.speaker !== undefined ? currentPage.speaker : speaker;
  const currentSpeakerId = typeof currentPage === 'object' ? currentPage.speakerId : null;
  const currentExpression = typeof currentPage === 'object' ? (currentPage.expression || 'normal') : 'normal';

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
        height: '160px',
        background: 'rgba(20, 30, 45, 0.97)',
        borderLeft: `4px solid ${themeColor || THEME.brass}`,
        padding: currentSpeaker ? '16px 24px' : '24px 24px',
        borderRadius: '0 12px 12px 0',
        cursor: 'pointer',
        color: THEME.parchment,
        textAlign: 'left',
        position: 'relative',
        boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        userSelect: 'none',
        lineHeight: '1.7',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      {currentSpeaker && (
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px',
        }}>
          {facePath && (
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `1.5px solid ${themeColor || THEME.brass}`,
              background: 'rgba(0,0,0,0.3)',
              flexShrink: 0
            }}>
              <img 
                src={facePath} 
                alt={currentSpeaker} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          <div style={{ 
            fontSize: '0.9em', 
            color: themeColor || THEME.brass, 
            fontWeight: 'bold', 
            letterSpacing: '0.08em',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {currentSpeaker}
          </div>
        </div>
      )}
      <div style={{ 
        fontSize: currentSpeaker ? '1.05em' : '1.1em', 
        lineHeight: '1.6', 
        minHeight: '4.2em', 
        flex: 1,
        opacity: currentSpeaker ? 1 : 0.9,
        fontStyle: currentSpeaker ? 'normal' : 'italic'
      }}>
        {displayText}
        {!isComplete && <span style={{ animation: 'vn-blink 1s infinite', marginLeft: '4px', borderLeft: `2px solid ${THEME.brass}` }}>&nbsp;</span>}
      </div>
      {isComplete && (
        <div style={{ 
          position: 'absolute', 
          bottom: '12px', 
          right: '20px', 
          fontSize: '0.8em', 
          color: themeColor || THEME.brass,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          animation: 'vn-bounce 1s infinite',
          background: 'rgba(0,0,0,0.3)',
          padding: '4px 10px',
          borderRadius: '999px',
          border: `1px solid ${themeColor || THEME.brass}44`
        }}>
          <span style={{ fontSize: '0.9em' }}>{pageIndex < pageList.length - 1 ? 'NEXT' : 'FINISH'}</span>
          <span style={{ fontSize: '1.2em' }}>▼</span>
        </div>
      )}
      <style>{`
        @keyframes vn-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes vn-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      `}</style>
    </div>
  );
});

export default VNBox;
