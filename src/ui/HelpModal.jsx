import React from 'react';
import { THEME } from './theme';
import { audioEngine } from '../game/audioEngine';
import { hudModalBackdrop, hudModalCard, hudCloseX } from './modalStyles';

const buttonStyle = {
  padding: '12px 20px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: 'inherit',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
};

function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleClose = () => {
    audioEngine.playSfx('uiTapBottle');
    onClose();
  };

  return (
    <div data-testid="help-modal" style={hudModalBackdrop}>
      <div style={{ ...hudModalCard, maxWidth: '340px', padding: '18px 16px 14px' }}>
        {hudCloseX(handleClose)}
        <h2 style={{ margin: '0 0 10px 0', color: THEME.nightBlue, textAlign: 'center', fontSize: '1.1em', paddingRight: '30px' }}>遊び方</h2>
        <div data-testid="help-scroll" className="help-content"
          style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '10px 4px', display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.9em' }}>・お客さんの依頼を読み、合う商品を選びます。</p>
          <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.9em' }}>・正解すると工房評価と親密度が上がります。</p>
          <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.9em' }}>・10回の営業を終えると、結果とエンディングに進みます（エンディングは条件により変化します）。</p>
          <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.9em' }}>・親密度が上がるとイベントが発生します。</p>
          <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.9em' }}>・右上のログボタン（📖）から最近の会話を確認できます。</p>
          <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.9em' }}>・右上の設定ボタン（⚙️）からテキスト速度や音量を変更できます。</p>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button data-testid="help-close"
            style={{ ...buttonStyle, marginTop: 0, background: '#555', color: 'white', width: '100%', fontSize: '0.88em' }}
            onClick={handleClose}
          >閉じる</button>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
