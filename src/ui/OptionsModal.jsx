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

function OptionsModal({
  isOpen,
  onClose,
  onReturnTitle,
  isAudioEnabled,
  setIsAudioEnabled,
  seVolume,
  setSeVolume,
  bgmVolume,
  setBgmVolume,
  textSpeed,
  setTextSpeed,
  instantUnreadText,
  setInstantUnreadText,
  defaultAudioVolume,
  textSpeedMeta
}) {
  if (!isOpen) return null;

  const closeOptions = () => {
    audioEngine.playSfx('uiTapBottle');
    onClose();
  };

  return (
    <div data-testid="options-modal" style={hudModalBackdrop}>
      <div style={{ ...hudModalCard, maxWidth: '340px', padding: '20px 18px' }}>
        {hudCloseX(closeOptions)}
        <h2 style={{ margin: '0 0 14px 0', color: THEME.nightBlue, textAlign: 'center', fontSize: '1.3em', paddingRight: '30px' }}>設定</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9em', fontWeight: 'bold', color: THEME.textDark }}>BGM</span>
            <button
              data-testid="audio-enabled-toggle"
              aria-pressed={isAudioEnabled}
              onClick={() => { audioEngine.playSfx('uiTapBottle'); setIsAudioEnabled(!isAudioEnabled); }}
              style={{
                background: isAudioEnabled ? THEME.starGold : '#aaa',
                color: isAudioEnabled ? THEME.textDark : '#fff',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '0.82em',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {isAudioEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9em', fontWeight: 'bold', color: THEME.textDark }}>SE</span>
            <button
              data-testid="se-enabled-toggle"
              aria-pressed={seVolume > 0}
              onClick={() => { audioEngine.playSfx('uiTapBottle'); setSeVolume(prev => prev > 0 ? 0 : defaultAudioVolume); }}
              style={{
                background: seVolume > 0 ? THEME.starGold : '#aaa',
                color: seVolume > 0 ? THEME.textDark : '#fff',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '0.82em',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {seVolume > 0 ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: '0.85em', color: THEME.textDark, fontWeight: 'bold', marginBottom: '6px' }}>BGM音量</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                data-testid="bgm-volume-slider"
                aria-label="BGM音量"
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(bgmVolume * 100)}
                onChange={(e) => setBgmVolume(Number(e.target.value) / 100)}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span style={{ width: '44px', textAlign: 'right', fontSize: '0.82em', color: THEME.textDark, fontWeight: 'bold' }}>
                {Math.round(bgmVolume * 100)}%
              </span>
            </div>
          </div>

          <div style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: '0.85em', color: THEME.textDark, fontWeight: 'bold', marginBottom: '6px' }}>SE音量</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                data-testid="se-volume-slider"
                aria-label="SE音量"
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(seVolume * 100)}
                onChange={(e) => setSeVolume(Number(e.target.value) / 100)}
                style={{ flex: 1, minWidth: 0 }}
              />
              <span style={{ width: '44px', textAlign: 'right', fontSize: '0.82em', color: THEME.textDark, fontWeight: 'bold' }}>
                {Math.round(seVolume * 100)}%
              </span>
            </div>
          </div>

          <div style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: '0.85em', color: THEME.textDark, fontWeight: 'bold', marginBottom: '6px' }}>テキスト速度</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px' }}>
              {Object.entries(textSpeedMeta).map(([mode, meta]) => {
                const isSelected = textSpeed === mode;
                return (
                  <button
                    key={mode}
                    data-testid={`text-speed-${mode}`}
                    aria-pressed={isSelected}
                    onClick={() => { audioEngine.playSfx('uiTapBottle'); setTextSpeed(mode); }}
                    style={{
                      ...buttonStyle,
                      margin: 0,
                      padding: '8px 6px',
                      fontSize: '0.74em',
                      lineHeight: 1.2,
                      background: isSelected ? THEME.starGold : '#eef1f4',
                      color: isSelected ? THEME.textDark : '#445',
                      border: `1px solid ${isSelected ? THEME.starGold : '#ccd6dd'}`,
                      boxShadow: isSelected ? '0 0 0 2px rgba(255,204,0,0.16)' : 'none'
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <div>
              <div style={{ fontSize: '0.85em', color: THEME.textDark, fontWeight: 'bold' }}>既読表示</div>
              <div style={{ fontSize: '0.72em', color: '#777', marginTop: '2px' }}>未読テキストをすぐ表示</div>
            </div>
            <button
              data-testid="instant-unread-toggle"
              aria-pressed={instantUnreadText}
              onClick={() => { audioEngine.playSfx('uiTapBottle'); setInstantUnreadText(prev => !prev); }}
              style={{
                background: instantUnreadText ? THEME.starGold : '#999',
                color: instantUnreadText ? THEME.textDark : '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '0.82em',
                fontWeight: 'bold',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {instantUnreadText ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            style={{ ...buttonStyle, marginTop: 0, background: '#ff5555', color: 'white', width: '100%', fontSize: '0.9em' }}
            onClick={() => {
              audioEngine.playSfx('uiTapBottle');
              if (window.confirm('タイトルに戻りますか？')) {
                onReturnTitle?.();
              }
            }}
          >
            タイトルへ戻る
          </button>
          <button
            data-testid="options-close"
            style={{ ...buttonStyle, marginTop: 0, background: '#555', color: 'white', width: '100%', fontSize: '0.9em' }}
            onClick={closeOptions}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

export default OptionsModal;
