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
const VNBox = forwardRef(({ text, pages, speaker, hint, themeColor, onComplete, onPageChange, onPageComplete, speed = 30, skip = false, getFaceIcon }, ref) => {
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : [text || ""];
  const [pageIndex, setPageIndex] = useState(0);
  
  useEffect(() => {
    onPageChange?.(pageIndex);
  }, [pageIndex]);
  
  const currentPage = pageList[pageIndex];
  const currentText = typeof currentPage === 'object' ? (currentPage?.text || "") : (currentPage || "");
  const currentSpeaker = typeof currentPage === 'object' && currentPage?.speaker !== undefined ? currentPage.speaker : speaker;
  const currentSpeakerId = typeof currentPage === 'object' ? currentPage.speakerId : null;
  const currentExpression = typeof currentPage === 'object' ? (currentPage.expression || 'normal') : 'normal';
  const currentHint = typeof currentPage === 'object' ? (currentPage.hint || hint) : hint;

  const [displayText, setDisplayText] = useState(skip ? currentText : "");
  const [isComplete, setIsComplete] = useState(skip);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoverSkip, setHoverSkip] = useState(false);
  const [isSkippingBlock, setIsSkippingBlock] = useState(false);
  const loggedPagesRef = useRef(new Set());

  const markPageComplete = (index = pageIndex, text = currentText) => {
    if (!text) return;
    const key = `${index}:${text}`;
    if (loggedPagesRef.current.has(key)) return;
    loggedPagesRef.current.add(key);
    onPageComplete?.({ speaker: currentSpeaker, speakerId: currentSpeakerId, text, pageIndex: index });
  };

  useEffect(() => {
    if (skip || isSkippingBlock) {
      setDisplayText(currentText);
      setIsComplete(true);
      markPageComplete();
      if (isSkippingBlock) setIsSkippingBlock(false);
      return;
    }

    setDisplayText("");
    setIsComplete(false);
    setCurrentIndex(0);
  }, [currentText, skip, isSkippingBlock]);

  useEffect(() => {
    if (isComplete || skip || isSkippingBlock) return;

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
  }, [currentIndex, currentText, isComplete, speed, skip, isSkippingBlock]);

  const handleClick = (e) => {
    // Prevent event bubbling if we're not at the absolute end
    const isLastPage = pageIndex >= pageList.length - 1;
    const isTyping = !isComplete;
    
    if (isTyping || !isLastPage) {
      if (e && e.stopPropagation) e.stopPropagation();
    }

    if (isTyping) {
      // Typewriter Click-to-Complete (Single Page)
      setDisplayText(currentText);
      setIsComplete(true);
      markPageComplete();
    } else if (!isLastPage) {
      // Advance to next page
      setPageIndex(prev => prev + 1);
      setDisplayText("");
      setIsComplete(false);
      setCurrentIndex(0);
      audioEngine.playSfx('uiTapBottle');
    } else if (onComplete) {
      // Finished all pages
      onComplete();
    }
  };

  const handleSkipBlock = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    const lastIndex = pageList.length - 1;
    
    // If already at the last page
    if (pageIndex === lastIndex) {
      if (isComplete) {
        // Case A: Last page already finished -> Close/Proceed
        onComplete?.();
      } else {
        // Case B: Typing on last page -> Show full text immediately
        setDisplayText(currentText);
        setIsComplete(true);
        markPageComplete();
        audioEngine.playSfx('uiTapBottle');
      }
      return;
    }

    // Case C: Before last page -> Jump to last page and make it instant
    setIsSkippingBlock(true);
    setPageIndex(lastIndex);
    audioEngine.playSfx('uiTapBottle');
  };

  useImperativeHandle(ref, () => ({
    advance: () => handleClick(),
    skip: () => handleSkipBlock()
  }));

  const facePath = currentSpeakerId && getFaceIcon ? getFaceIcon(currentSpeakerId, 'face', currentExpression) : null;

  return (
    <div 
      data-testid="vn-box"
      className="vn-box"
      onClick={handleClick}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        height: '166px',
        background: 'rgba(18, 28, 42, 0.98)',
        padding: currentSpeaker ? '22px 24px 28px 24px' : '18px 24px 28px 24px',
        borderRadius: '12px 12px 0 0',
        cursor: 'pointer',
        color: THEME.parchment,
        textAlign: 'left',
        position: 'relative',
        boxShadow: '0 -4px 15px rgba(0,0,0,0.3)',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        userSelect: 'none',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        lineHeight: '1.7',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottom: 'none'
      }}
    >
      {/* M-VN-SKIP-1: Floating Skip Button (Header Position) */}
      <div 
        onClick={handleSkipBlock}
        onMouseEnter={() => setHoverSkip(true)}
        onMouseLeave={() => setHoverSkip(false)}
        style={{
          position: 'absolute',
          top: '-38px', // Floating above the box, consistent with nameplate
          right: '24px',
          padding: '6px 20px',
          borderRadius: '999px',
          background: hoverSkip ? THEME.brass : 'rgba(12, 25, 38, 0.9)',
          border: `1px solid ${hoverSkip ? THEME.brass : THEME.brass + '77'}`,
          color: hoverSkip ? '#0c1926' : THEME.brass,
          fontSize: '0.82em',
          fontWeight: '900',
          cursor: 'pointer',
          zIndex: 20,
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          letterSpacing: '0.15em',
          backdropFilter: 'blur(8px)',
          textTransform: 'uppercase',
          userSelect: 'none'
        }}
      >
        SKIP
      </div>

      {/* Speaker Tag (Floating Top-Left) */}
      {currentSpeaker && (
        <div style={{ 
          position: 'absolute',
          left: '12px',
          top: '-65px', // Lifted higher to avoid VNBox overlap
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          {facePath && (
            <div style={{
              width: '60px', // 2/3 of previous 90px
              height: '60px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: `2px solid ${themeColor || THEME.brass}`,
              background: 'rgba(12, 25, 38, 0.95)',
              flexShrink: 0,
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              transform: 'rotate(-2deg)', // Slight tilt for flair
              position: 'relative'
            }}>
              <img 
                src={facePath} 
                alt={currentSpeaker} 
                style={{ 
                  width: '110%', // Slight zoom for better focus
                  height: '110%', 
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  WebkitUserDrag: 'none',
                  userSelect: 'none',
                  position: 'absolute',
                  top: '-5%',
                  left: '-5%'
                }}
                draggable={false}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {/* Inner bezel */}
              <div style={{
                position: 'absolute',
                inset: 0,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                pointerEvents: 'none'
              }} />
            </div>
          )}
          
          <div style={{ 
            padding: '4px 16px',
            borderRadius: '999px',
            background: '#0c1926',
            border: `1px solid ${themeColor || THEME.brass}77`,
            fontSize: '0.9em', 
            color: themeColor || THEME.brass, 
            fontWeight: '800', 
            letterSpacing: '0.06em',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            marginBottom: '8px',
            backdropFilter: 'blur(8px)'
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

      {/* Footer Info Area (Anchored) */}
      {/* Hint (Bottom Left) */}
      <div style={{
        position: 'absolute',
        bottom: '14px',
        left: '24px',
        fontSize: '0.72em',
        color: THEME.oasisTeal,
        opacity: 0.8,
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(0,0,0,0.3)',
        padding: currentHint ? '3px 12px' : '0',
        borderRadius: '999px',
        visibility: currentHint ? 'visible' : 'hidden',
        whiteSpace: 'nowrap',
        zIndex: 5,
        border: `1px solid ${THEME.oasisTeal}33`,
        backdropFilter: 'blur(2px)',
        pointerEvents: 'none'
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
          position: 'absolute',
          bottom: '14px',
          right: '24px',
          fontSize: '0.8em', 
          color: themeColor || THEME.brass,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          animation: 'vn-bounce 1s infinite',
          background: 'rgba(0,0,0,0.5)',
          padding: '4px 16px',
          borderRadius: '999px',
          border: `1px solid ${themeColor || THEME.brass}66`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          zIndex: 5,
          backdropFilter: 'blur(2px)'
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
