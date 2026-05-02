import React from 'react';
import { THEME } from './theme';
import { audioEngine } from '../game/audioEngine';
import { hudModalBackdrop, hudModalCard, hudCloseX } from './modalStyles';

const logButtonStyle = {
  padding: '12px 20px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: 'inherit',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
};

function LogModal({ isOpen, onClose, vnBacklog, scrollRef, getFaceIcon }) {
  if (!isOpen) return null;

  const handleClose = () => {
    audioEngine.playSfx('uiTapBottle');
    onClose();
  };

  return (
    <div data-testid="backlog-modal" style={hudModalBackdrop}>
      <div style={{ ...hudModalCard, maxWidth: '380px', padding: '16px 14px 14px', height: '85vh', display: 'flex', flexDirection: 'column' }}>
        {hudCloseX(handleClose)}
        <h2 style={{ margin: '0 0 15px 0', color: THEME.nightBlue, textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold' }}>会話ログ</h2>
        
        <div ref={scrollRef} data-testid="backlog-scroll" className="log-content"
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            borderTop: `2px solid ${THEME.brass}44`, 
            borderBottom: `2px solid ${THEME.brass}44`, 
            padding: '10px 4px',
            background: 'rgba(255,255,255,0.3)'
          }}
        >
          {vnBacklog.length === 0 ? (
            <div style={{ color: '#777', fontSize: '0.9em', textAlign: 'center', padding: '40px 0' }}>まだログはありません</div>
          ) : vnBacklog.slice().reverse().map((entry, idx) => {
            const isNarration = !entry.speaker || entry.speaker === 'ナーディル' && !entry.speakerId;
            const speakerId = entry.speakerId || (entry.speaker === 'ナーディル' ? 'nader' : null);
            const facePath = speakerId && getFaceIcon ? getFaceIcon(speakerId, 'face', entry.expression || 'normal') : null;
            const displayText = typeof entry.text === 'string' ? entry.text : (entry.text?.text || '');
            
            if (!displayText) return null;

            return (
              <div
                data-testid="backlog-entry"
                key={`${entry.sequence}-${idx}`}
                style={{ 
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 8px', 
                  borderBottom: `1px solid ${THEME.brass}22`, 
                  textAlign: 'left',
                  alignItems: 'flex-start'
                }}
              >
                {/* Icon Column */}
                <div style={{ flexShrink: 0, width: '48px', height: '48px' }}>
                  {facePath ? (
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', 
                      border: `1px solid ${THEME.brass}88`, background: '#0c1926' 
                    }}>
                      <img src={facePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'auto', backfaceVisibility: 'hidden', filter: 'blur(0.12px) contrast(0.99)' }} />
                    </div>
                  ) : (
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '8px', 
                      background: isNarration ? 'transparent' : `${THEME.brass}22`,
                      border: isNarration ? 'none' : `1px solid ${THEME.brass}44`
                    }} />
                  )}
                </div>

                {/* Text Column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {!isNarration && (
                    <div style={{ 
                      fontSize: '0.75em', 
                      fontWeight: '900', 
                      color: THEME.brassDark, 
                      marginBottom: '4px',
                      letterSpacing: '0.05em'
                    }}>
                      {entry.speaker}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '0.88em', 
                    color: isNarration ? '#666' : '#222', 
                    lineHeight: '1.6', 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    fontStyle: isNarration ? 'italic' : 'normal'
                  }}>
                    {displayText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '12px' }}>
          <button data-testid="backlog-close"
            style={{ 
              ...logButtonStyle, 
              background: THEME.nightBlue, 
              color: 'white', 
              width: '100%', 
              fontSize: '0.9em',
              border: `1px solid ${THEME.brass}`
            }}
            onClick={handleClose}
          >閉じる</button>
        </div>
      </div>
    </div>
  );
}

export default LogModal;
