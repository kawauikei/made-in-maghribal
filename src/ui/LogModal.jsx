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

function LogModal({ isOpen, onClose, vnBacklog, scrollRef }) {
  if (!isOpen) return null;

  const handleClose = () => {
    audioEngine.playSfx('uiTapBottle');
    onClose();
  };

  return (
    <div data-testid="backlog-modal" style={hudModalBackdrop}>
      <div style={{ ...hudModalCard, maxWidth: '360px', padding: '16px 14px 14px' }}>
        {hudCloseX(handleClose)}
        <h2 style={{ margin: '0 0 10px 0', color: THEME.nightBlue, textAlign: 'center', fontSize: '1.1em', paddingRight: '30px' }}>ログ</h2>
        <div ref={scrollRef} data-testid="backlog-scroll" className="log-content"
          style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #e0d8cc', borderBottom: '1px solid #e0d8cc', padding: '4px 0' }}
        >
          {vnBacklog.length === 0 ? (
            <div style={{ color: '#777', fontSize: '0.88em', textAlign: 'center', padding: '20px 0' }}>まだログはありません</div>
          ) : vnBacklog.slice().reverse().map((entry, idx) => {
            const isNarration = !entry.speaker;
            const displayText = typeof entry.text === 'string' ? entry.text : (entry.text?.text || '');
            if (!displayText) return null;
            return (
              <div
                data-testid="backlog-entry"
                data-route-mode={entry.routeMode || 'normal'}
                key={`${entry.sequence}-${idx}`}
                style={{ padding: '7px 10px', borderBottom: '1px solid #ede8df', textAlign: 'left' }}
              >
                {!isNarration && (
                  <span style={{ fontSize: '0.78em', fontWeight: 'bold', color: THEME.brassDark, display: 'block', marginBottom: '3px' }}>
                    {entry.speaker}
                  </span>
                )}
                <span style={{ fontSize: '0.85em', color: '#333', lineHeight: '1.55', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {displayText}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '10px' }}>
          <button data-testid="backlog-close"
            style={{ ...logButtonStyle, marginTop: 0, background: '#555', color: 'white', width: '100%', fontSize: '0.88em' }}
            onClick={handleClose}
          >閉じる</button>
        </div>
      </div>
    </div>
  );
}

export default LogModal;
