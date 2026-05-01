import React from 'react';

const { useState, useEffect, useRef } = React;
import { createQuizSession, answerQuestion } from './game/quizEngine';
import { getRankInfo } from './game/scoring';
import { getWorkshopResult, createInitialWorkshopState, applyWorkshopResult } from './game/management';
import { HEROINES, getHeroineAsset } from './data/heroines';
import { getResultExpression, getDayEndExpression } from './game/presentation';
import { WORLD, SHOP, PROTAGONIST } from './data/world';
import { TRACKS, getTrackById } from './data/tracks';
import { audioEngine } from './game/audioEngine';
import { SFX_CANDIDATES, SELECTED_SFX } from './data/sfxCandidates';
import { createInitialAffection, addAffection, calculateQuizAffectionGain } from './game/affection';
import { loadSaveData, saveGameData, hasSaveData, clearSaveData } from './game/saveData';
import { checkNewEventUnlock, getEventPages, getRouteText } from './game/eventSystem';
import { AFFECTION_EVENTS } from './data/affectionEvents';
import { BACKGROUND_IMAGES, STILL_IMAGES } from './data/imageAssets';
import { ENDINGS } from './data/endings';
import { SFX } from './data/sfx';
import itemsData from './data/generated/items.json';



const getBacklogRouteModeLabel = (routeMode) => {
  return routeMode === 'long_history' ? '過去から続く縁' : '現在から育つ縁';
};

const TEXT_SPEED_META = {
  slow: { label: '遅い', delay: 45 },
  normal: { label: '標準', delay: 30 },
  fast: { label: '速い', delay: 18 },
  instant: { label: '瞬時', delay: 0 }
};

const getTextSpeedMeta = (textSpeed) => TEXT_SPEED_META[textSpeed] || TEXT_SPEED_META.normal;
const DEFAULT_AUDIO_VOLUME = 0.8;

const NADER = PROTAGONIST;


const CustomerSilhouette = ({ customer }) => {
  if (!customer) return null;
  return (
    <div className="customer-silhouette" style={{ 
      borderColor: customer.color || 'rgba(218, 180, 96, 0.45)'
    }} />
  );
};


const RhythmMock = ({ heroineId, themeColor }) => {
  const naderFace = `./characters/nader/face_proc/normal.png`;
  const heroineFace = `./characters/${heroineId}/face_proc/normal.png`;

  return (
    <div style={{
      width: '100%',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '15px',
      margin: '10px 0',
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      {/* Left: Nader */}
      <div style={{ 
        width: '42px', 
        height: '42px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: `1px solid ${THEME.brass}`, 
        background: 'rgba(35, 25, 18, 0.8)', 
        opacity: 0.7,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        flexShrink: 0
      }}>
        <img src={naderFace} alt="N" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Center: Beat Lane */}
      <div style={{
        flex: 1,
        maxWidth: '400px',
        height: '2px',
        background: `linear-gradient(to right, transparent, ${THEME.brass} 20%, ${THEME.brass} 80%, transparent)`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Decorative markers */}
        <div style={{ position: 'absolute', left: '20%', width: '6px', height: '6px', borderRadius: '50%', background: THEME.brass, opacity: 0.4 }} />
        <div style={{ position: 'absolute', left: '40%', width: '6px', height: '6px', borderRadius: '50%', background: THEME.brass, opacity: 0.4 }} />
        
        {/* Center Indicator */}
        <div style={{ 
          width: '16px', 
          height: '16px', 
          borderRadius: '50%', 
          border: `2px solid ${THEME.brass}`, 
          background: 'rgba(255,255,255,0.1)',
          boxShadow: `0 0 8px ${THEME.brass}88`
        }} />

        <div style={{ position: 'absolute', right: '40%', width: '6px', height: '6px', borderRadius: '50%', background: THEME.brass, opacity: 0.4 }} />
        <div style={{ position: 'absolute', right: '20%', width: '6px', height: '6px', borderRadius: '50%', background: THEME.brass, opacity: 0.4 }} />
      </div>

      {/* Right: Heroine */}
      <div style={{ 
        width: '42px', 
        height: '42px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: `1px solid ${themeColor || THEME.brass}`, 
        background: 'rgba(35, 25, 18, 0.8)', 
        opacity: 0.7,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        flexShrink: 0
      }}>
        <img src={heroineFace} alt="H" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );
};



// --- Inlined: theme ---
const THEME = {
  sand: '#e2d1b1',
  parchment: '#f4e9d5',
  brass: '#c5a059',
  brassDark: '#8e6d2e',
  nightBlue: '#1a2a3a',
  oasisTeal: '#2a5a5a',
  textDark: '#2a2a2a',
  starGold: '#ffcc00'
};


// --- Inlined: modalStyles ---

const hudModalBackdrop = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const hudModalCard = {
  background: THEME.parchment,
  borderRadius: '16px',
  width: '90%',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  border: `1px solid ${THEME.brass}`
};

const hudCloseX = (onClose) => (
  <button
    data-testid="modal-x-close"
    onClick={onClose}
    style={{
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: 'none',
      background: 'rgba(0,0,0,0.1)',
      color: THEME.nightBlue,
      fontSize: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10
    }}
    aria-label="Close"
  >
    ×
  </button>
);


// --- Inlined: HelpModal ---

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



// --- Inlined: LogModal ---

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



// --- Inlined: OptionsModal ---

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



// --- Inlined: GameHud ---

const ROUTE_MODE_META = {
  normal: {
    label: '現在の縁',
    description: 'はじめて出会う、現在から育つ縁'
  },
  long_history: {
    label: '過去の縁',
    description: '通常ルートとは別の関係性で始まる、過去から続く縁'
  }
};

const getRouteModeMeta = (routeMode) => ROUTE_MODE_META[routeMode] || ROUTE_MODE_META.normal;

const renderRouteModeBadge = (routeMode, compact = false) => {
  const meta = getRouteModeMeta(routeMode);
  return (
    <div
      data-testid="route-mode-badge"
      data-route-mode={routeMode}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '5px 8px' : '6px 10px',
        borderRadius: '999px',
        border: `1px solid \${THEME.brass}`,
        background: 'rgba(255,255,255,0.9)',
        color: THEME.nightBlue,
        fontSize: compact ? '0.7em' : '0.78em',
        fontWeight: 'bold',
        lineHeight: 1,
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        maxWidth: '100%',
        whiteSpace: 'nowrap'
      }}
    >
      {meta.label}
    </div>
  );
};

const GameHud = ({ 
  screen, 
  routeMode, 
  onOpenLog, 
  onOpenOptions, 
  onOpenHelp 
}) => {
  const isHudVisible = !['ENDING', 'FINAL_RESULT', 'VISUAL_TEST', 'SOUND_TEST'].includes(screen);
  if (!isHudVisible) return null;

  const hudBtnStyle = {
    background: 'rgba(255,255,255,0.92)',
    border: `2px solid \${THEME.brass}`,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
    padding: 0,
    flexShrink: 0
  };

  return (
    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      {renderRouteModeBadge(routeMode, true)}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          data-testid="backlog-hud-open"
          onClick={() => { audioEngine.playSfx('uiTapBottle'); onOpenLog(); }}
          style={hudBtnStyle}
          aria-label="ログ"
        >📖</button>
        <button
          data-testid="options-open"
          onClick={() => { audioEngine.playSfx('uiTapBottle'); onOpenOptions(); }}
          style={hudBtnStyle}
          aria-label="設定"
        >⚙️</button>
        <button
          data-testid="help-hud-open"
          onClick={() => { audioEngine.playSfx('uiTapBottle'); onOpenHelp(); }}
          style={hudBtnStyle}
          aria-label="ヘルプ"
        >？</button>
      </div>
    </div>
  );
};



// --- Inlined: vnClickHelpers ---
/**
 * Visual Novel (VN) interaction helpers for Made in Maghribal.
 * This module provides logic for handling click-to-advance and other VN-related UI interactions.
 */

/**
 * Determines if the current click event should be ignored for VN progression.
 * Returns true if a modal is open or if the click target is an interactive element.
 * 
 * @param {Object} e - React or DOM MouseEvent
 * @param {Object} modalStates - Visibility of blocking UI elements { showOptions, showLog, showHelp, showSoundTest }
 * @returns {boolean}
 */
const shouldIgnoreVnAdvanceClick = (e, { showOptions, showLog, showHelp, showSoundTest }) => {
  if (showOptions || showLog || showHelp || showSoundTest) return true;
  
  // Ignore clicks on buttons, links, inputs, or elements marked with data-no-vn-advance
  const target = e.target;
  if (target.closest('button, a, input, select, textarea, [data-no-vn-advance]')) {
    return true;
  }
  
  return false;
};

/**
 * Safely triggers the advance method on a VNBox ref if it exists.
 * 
 * @param {Object} vnRef - React ref object for VNBox
 */
const safeAdvanceVnBox = (vnRef) => {
  if (vnRef && vnRef.current && typeof vnRef.current.advance === 'function') {
    vnRef.current.advance();
  }
};

/**
 * Checks if the current screen ID supports click-to-advance interaction.
 * 
 * @param {string} screen - Screen name (e.g., 'PROLOGUE', 'INTRO')
 * @returns {boolean}
 */
const isVnAdvanceScreen = (screen) => {
  return ['PROLOGUE', 'INTRO', 'RESULT', 'EVENT', 'ENDING'].includes(screen);
};

/**
 * Utility to determine if VN text should skip typewriter animation.
 * 
 * @param {boolean} isInstantTextSpeed - Global setting for instant text
 * @param {boolean} isSeen - Whether the content has been seen before (optional)
 * @returns {boolean}
 */
const shouldSkipTypewriter = (isInstantTextSpeed, isSeen = false) => {
  return isInstantTextSpeed || isSeen;
};


// --- Inlined: VisualTestScreen ---

/**
 * VisualTestScreen Component
 * Decoupled from App.jsx to handle Asset Testing (BG/STILL)
 */
const VisualTestScreen = ({
  visualTestMode,
  setVisualTestMode,
  bgTestIndex,
  setBgTestIndex,
  stillTestIndex,
  setStillTestIndex,
  handleBackToTitle,
  getFullPath,
  getFileName,
  renderThemeStyles
}) => {
  const bgList = Object.values(BACKGROUND_IMAGES);
  const stillList = Object.values(STILL_IMAGES);
  
  const bg = bgList[bgTestIndex % bgList.length];
  const still = stillList[stillTestIndex % stillList.length];

  // Static styles replicated from App.jsx to minimize prop passing
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

  const utilityBackButtonStyle = {
    padding: '8px 16px',
    background: '#333',
    color: THEME.sand,
    border: `1px solid ${THEME.brass}`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: 'bold',
    margin: '10px 0',
    alignSelf: 'flex-start'
  };

  return (
    <div data-testid="visual-test-screen" style={{ ...containerStyle, padding: '0 0 20px 0' }}>
      {renderThemeStyles && renderThemeStyles()}
      
      {/* Fixed Header */}
      <div style={{ width: '100%', padding: '10px 16px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 100 }}>
        <button data-testid="visual-test-back" onClick={handleBackToTitle} style={{ ...utilityBackButtonStyle, margin: 0, fontSize: '0.8em', padding: '6px 12px' }}>TITLE</button>
        <div style={{ flex: 1, color: THEME.sand, fontWeight: 'bold', fontSize: '0.9em' }}>映像確認 Asset Test</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button data-testid="visual-test-tab-bg" onClick={() => setVisualTestMode('background')} style={{ ...utilityBackButtonStyle, margin: 0, background: visualTestMode === 'background' ? THEME.brass : '#333', color: visualTestMode === 'background' ? THEME.textDark : '#aaa', fontSize: '0.75em', padding: '4px 8px' }}>BG</button>
          <button data-testid="visual-test-tab-still" onClick={() => setVisualTestMode('still')} style={{ ...utilityBackButtonStyle, margin: 0, background: visualTestMode === 'still' ? THEME.brass : '#333', color: visualTestMode === 'still' ? THEME.textDark : '#aaa', fontSize: '0.75em', padding: '4px 8px' }}>STILL</button>
        </div>
      </div>

      <div style={{ flex: 1, width: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
        {visualTestMode === 'background' ? (
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <div style={{ marginBottom: '15px', textAlign: 'left', minHeight: '46px' }} className="selectable-text">
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: THEME.brass, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bg.label}</div>
              <div style={{ fontSize: '0.75em', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }} title={bg.src}>ID: {bg.id} | Path: {getFileName(bg.src)}</div>
            </div>

            {/* Main Preview */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${THEME.brass}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <img 
                key={bg.id}
                src={getFullPath(bg.src)} 
                alt={bg.label} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                draggable={false}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span style="color:#f44">Background Load Failed</span>';
                }}
              />
            </div>

            {/* Thumbnail Selector */}
            <div style={{ width: '100%', maxWidth: '800px', height: '180px', overflowX: 'auto', overflowY: 'hidden', padding: '8px 0', scrollbarWidth: 'thin' }}>
              <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(2, 80px)', gridAutoColumns: '140px', gap: '10px', alignContent: 'start', width: 'max-content' }}>
                {bgList.map((item, idx) => (
                  <div
                    data-testid="visual-test-thumbnail"
                    key={item.id}
                    onClick={() => setBgTestIndex(idx)}
                    style={{
                      width: '140px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: `2px solid ${idx === bgTestIndex % bgList.length ? THEME.brass : '#333'}`,
                      cursor: 'pointer',
                      boxShadow: idx === bgTestIndex % bgList.length ? `0 0 0 2px ${THEME.brass}44, 0 0 18px ${THEME.brass}55` : 'none'
                    }}
                  >
                    <img src={getFullPath(item.src)} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <div style={{ marginBottom: '15px', textAlign: 'left', minHeight: '46px' }} className="selectable-text">
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: THEME.brass, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{still.label}</div>
              <div style={{ fontSize: '0.75em', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }} title={`${still.id} | ${still.src} | focus ${still.focusX}, ${still.focusY}`}>ID: {still.id} | Path: {getFileName(still.src)} | Focus: {still.focusX}, {still.focusY}</div>
            </div>

            {/* Main Preview */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${THEME.brass}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <img 
                key={still.id}
                src={getFullPath(still.src)} 
                alt={still.label} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                draggable={false}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span style="color:#f44">Still Load Failed</span>';
                }}
              />
            </div>

            {/* Thumbnail Selector */}
            <div style={{ width: '100%', maxWidth: '800px', height: '180px', overflowX: 'auto', overflowY: 'hidden', padding: '8px 0', scrollbarWidth: 'thin' }}>
              <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(2, 80px)', gridAutoColumns: '140px', gap: '10px', alignContent: 'start', width: 'max-content' }}>
                {stillList.map((item, idx) => (
                  <div
                    data-testid="visual-test-thumbnail"
                    key={item.id}
                    onClick={() => setStillTestIndex(idx)}
                    style={{
                      width: '140px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: `2px solid ${idx === stillTestIndex % stillList.length ? THEME.brass : '#333'}`,
                      cursor: 'pointer',
                      boxShadow: idx === stillTestIndex % stillList.length ? `0 0 0 2px ${THEME.brass}44, 0 0 18px ${THEME.brass}55` : 'none'
                    }}
                  >
                    <img src={getFullPath(item.src)} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



// --- Inlined: MemoriesScreen ---

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
  renderUtilityHeader
}) => {
  const allEvents = Object.values(affectionEvents).flat();
  const seenEvents = allEvents.filter(e => seenEventIds.includes(e.id));

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



// --- Inlined: StartScreen ---

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
  renderThemeStyles
}) => {
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
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ ...titleStyle, fontSize: '2.2em', margin: '0 0 5px 0' }}>{SHOP.name}</h1>
        <div style={{ color: THEME.sand, fontSize: '0.9em', letterSpacing: '0.1em', opacity: 0.8 }}>
          — {SHOP.localName} —
        </div>
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



// --- Inlined: HeroineSelectScreen ---

/**
 * HeroineSelectScreen Component
 * Encapsulates the HEROINE_SELECT screen logic and UI.
 */
const HeroineSelectScreen = ({
  previewHeroineId,
  onPreviewHeroineChange,
  onSelectHeroine,
  affection,
  routeMode,
  screen,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  renderThemeStyles,
  HeroineDisplay,
  getFullPath,
  audioEngine
}) => {
  const selectedHeroine = HEROINES.find(h => h.id === previewHeroineId) || HEROINES[0];

  // Replicating styles from App.jsx
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

  const narrativeBoxStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '15px',
    border: `1px solid ${THEME.brass}`,
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    color: THEME.textDark
  };

  return (
    <div data-testid="heroine-select-screen" style={containerStyle}>
      {renderThemeStyles && renderThemeStyles()}
      <GameHud 
        screen={screen} 
        routeMode={routeMode} 
        onOpenLog={onOpenLog} 
        onOpenOptions={onOpenOptions} 
        onOpenHelp={onOpenHelp} 
      />
      
      <h1 style={{ ...titleStyle, marginBottom: '20px' }}>誰との縁を深める？</h1>
      
      {/* Tabs for Heroine selection */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '20px',
        width: '100%',
        maxWidth: '350px'
      }}>
        {HEROINES.map(h => {
          const isSelected = previewHeroineId === h.id;
          return (
            <div 
              data-testid={`heroine-tab-${h.id}`}
              key={h.id}
              className="heroine-card"
              onClick={() => {
                if (audioEngine) audioEngine.playSfx('uiHeroineTab');
                if (onPreviewHeroineChange) onPreviewHeroineChange(h.id);
              }}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                border: `3px solid ${isSelected ? h.themeColor : 'rgba(226,209,177,0.65)'}`,
                background: '#111',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: isSelected ? 'scale(1.12)' : 'scale(1.0)',
                boxShadow: isSelected ? `0 0 0 5px ${h.themeColor}33, -10px 0 18px ${h.themeColor}66` : '0 2px 8px rgba(0,0,0,0.35)',
                overflow: 'hidden',
                zIndex: isSelected ? 2 : 1,
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              <img
                src={getFullPath ? getFullPath(getHeroineAsset(h.id, 'face', 'normal')) : ''}
                alt={h.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: h.visualConfig?.facePosition || 'center 20%',
                  display: 'block',
                  borderRadius: '50%',
                  clipPath: 'circle(50% at 50% 50%)'
                }}
                draggable={false}
              />
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '7px',
                  left: '-3px',
                  width: '18px',
                  height: '50px',
                  borderLeft: `3px solid ${THEME.starGold}`,
                  borderRadius: '50%',
                  filter: `drop-shadow(0 0 5px ${h.themeColor})`,
                  pointerEvents: 'none'
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Heroine Detail Card (Fixed Height to prevent scrolling) */}
      <div style={{ 
        ...cardStyle, 
        maxWidth: '350px', 
        height: '420px',
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px',
        background: THEME.parchment,
        border: `2px solid ${selectedHeroine.themeColor}`,
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: selectedHeroine.themeColor }} />
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
           {HeroineDisplay && <HeroineDisplay heroine={selectedHeroine} type="face" size="medium" expression="normal" />}
           <div style={{ textAlign: 'left', flex: 1 }}>
             <h3 style={{ margin: 0, fontSize: '1.3em', color: THEME.textDark }}>{selectedHeroine.name}</h3>
             <div style={{ fontSize: '0.85em', color: selectedHeroine.themeColor, fontWeight: 'bold' }}>{selectedHeroine.role}</div>
             <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
               親密度: <span style={{ fontWeight: 'bold', color: THEME.textDark }}>{affection ? affection[selectedHeroine.id] : 0}</span>
             </div>
           </div>
        </div>

        <div style={{ 
          ...narrativeBoxStyle, 
          flex: 1, 
          padding: '12px', 
          fontSize: '0.9em', 
          marginBottom: '15px', 
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(0,0,0,0.05)',
          color: '#333',
          textAlign: 'left'
        }}>
          {getRouteText(selectedHeroine.description, { long_history: selectedHeroine.routeDescription }, routeMode)}
        </div>

        <button 
          data-testid="heroine-start"
          onClick={() => onSelectHeroine && onSelectHeroine(selectedHeroine.id)}
          style={{ 
            ...buttonStyle, 
            width: '100%', 
            margin: 0, 
            background: selectedHeroine.themeColor, 
            color: '#fff', 
            border: `2px solid ${selectedHeroine.themeColor}`,
            boxShadow: '0 4px 0 rgba(0,0,0,0.2)'
          }}
        >
          {selectedHeroine.name}を頼む
        </button>
      </div>

      {/* Navigation Footer */}
      <div style={{ 
        marginTop: '20px',
        display: 'flex',
        gap: '20px',
        opacity: 0.8
      }}>
        {/* If back navigation was needed, it would go here */}
      </div>
    </div>
  );
};



// --- Inlined: PrologueScreen ---

const prologuePages = [
  { text: "砂漠の街マグリバル。路地の一角に、小さな鍛金術店「星瓶堂」がある。" },
  { text: "若店主ナーディルは、客の依頼に合う品を選びながら、今日も星瓶堂の営業を始める。" },
  { text: "砂漠の風は時に厳しいが、星々はいつも職人の手元を優しく照らしている。ここでは古くから鍛金術が物語を紡いできた。" },
  { text: "これからの10回の営業。商いを重ねる中で、協力者たちとの縁も少しずつ育っていく。" },
  { text: "あなたの手から生み出される品々が、誰かの未来を少しだけ輝かせることを願って。" },
  { speakerId: 'nader', speaker: 'ナーディル', text: "さあ、今日も星瓶堂を開けよう。いい縁に出会えるといいな。" }
];

const PrologueScreen = ({
  screen,
  routeMode,
  textSpeedMeta,
  isInstantTextSpeed,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  onVnAreaClick,
  onPageComplete,
  onAdvanceToHeroineSelect,
  renderThemeStyles,
  renderBackground,
  HeroineDisplay,
  audioEngine,
  vnRef,
  getFaceIcon,
  containerStyle,
  titleStyle,
  cardStyle,
  buttonStyle
}) => {
  const [isPrologueComplete, setIsPrologueComplete] = useState(false);

  return (
    <div 
      data-testid="prologue-screen" 
      style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}
      onClick={onVnAreaClick}
    >
      {renderThemeStyles()}
      {renderBackground('PROLOGUE')}
      
      {/* Nadir Standing */}
      <div style={{ 
        position: 'absolute', bottom: '15%', right: '0%', zIndex: 2, 
        pointerEvents: 'none', opacity: 1,
        height: '66%',
        display: 'flex', alignItems: 'flex-end',
        filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.3))'
      }}>
        <HeroineDisplay 
          heroine={NADER} 
          type="standing" 
          size="large" 
          expression="normal" 
          noBorder={true}
          style={{ height: '100%', width: 'auto', boxShadow: 'none' }}
        />
      </div>

      <div style={{ zIndex: 5, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={onOpenLog} 
          onOpenOptions={onOpenOptions} 
          onOpenHelp={onOpenHelp} 
        />
        
        {/* Top: Title */}
        <div style={{ flex: '0 0 auto', padding: '10px 0 5px 0', textAlign: 'center' }}>
          <h1 style={{ ...titleStyle, margin: 0, fontSize: '1.6em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            星瓶堂の始まり
          </h1>
        </div>

        {/* Middle: Spacer */}
        <div style={{ flex: '1 1 auto' }} />
      </div>

      {/* Action Button: Absolutely positioned above the VNBox dock */}
      {isPrologueComplete && (
        <div style={{ 
          position: 'absolute', 
          bottom: '185px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 7,
          width: '94%',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            data-testid="prologue-next"
            onClick={onAdvanceToHeroineSelect}
            className="vn-button-reveal"
            style={{ 
              ...buttonStyle, 
              width: '100%', 
              maxWidth: '340px', 
              margin: 0, 
              height: '48px',
              fontSize: '1.1em',
              background: `linear-gradient(135deg, ${THEME.brass} 0%, #b38b4d 100%)`,
              boxShadow: `0 6px 20px ${THEME.brass}44`,
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            星瓶堂へ進む
          </button>
        </div>
      )}

      {/* Bottom Dock: VN Box (Stick to screen root bottom) */}
      <div style={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 6,
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
      }}>
        {/* Main VN Box Container */}
        <div style={{ 
          width: '100%', 
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          <VNBox
            ref={vnRef}
            pages={prologuePages}
            themeColor={THEME.brass}
            speed={textSpeedMeta.delay}
            skip={shouldSkipTypewriter(isInstantTextSpeed)}
            getFaceIcon={getFaceIcon}
            onPageComplete={onPageComplete}
            onComplete={() => {
              setIsPrologueComplete(true);
            }}
          />
        </div>
      </div>
    </div>
  );
};



// --- Inlined: IntroScreen ---

const IntroScreen = ({
  activeHeroine,
  screen,
  routeMode,
  textSpeedMeta,
  isInstantTextSpeed,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  onVnAreaClick,
  onPageComplete,
  onBeginService,
  renderThemeStyles,
  renderBackground,
  HeroineDisplay,
  audioEngine,
  vnRef,
  getFaceIcon,
  containerStyle,
  titleStyle,
  cardStyle,
  buttonStyle,
  narrativeBoxStyle
}) => {
  const introPages = [
    { 
      speakerId: 'nader', 
      speaker: 'ナーディル', 
      text: `${activeHeroine.name}さん、いらっしゃい。今日はどのような品をお探しですか？` 
    },
    { 
      speakerId: activeHeroine.id, 
      speaker: activeHeroine.name, 
      text: activeHeroine.greeting || "ええ、相談に乗ってくれるかしら。" 
    }
  ];
  return (
    <div 
      data-testid="intro-screen" 
      style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}
      onClick={onVnAreaClick}
    >
      {renderThemeStyles()}
      {renderBackground(screen)}
      
      {/* Heroine Standing */}
      <div style={{ 
        position: 'absolute', bottom: '15%', right: '0%', zIndex: 2, 
        pointerEvents: 'none', opacity: 1,
        height: '68%',
        display: 'flex', alignItems: 'flex-end',
        filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.3))'
      }}>
        <HeroineDisplay 
          heroine={activeHeroine} 
          type="standing" 
          size="large" 
          expression="normal" 
          noBorder={true}
          style={{ height: '100%', width: 'auto', boxShadow: 'none' }}
        />
      </div>

      <div style={{ zIndex: 5, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={onOpenLog} 
          onOpenOptions={onOpenOptions} 
          onOpenHelp={onOpenHelp} 
        />
        
        {/* Top: Title */}
        <div style={{ flex: '0 0 auto', padding: '10px 0 5px 0', textAlign: 'center' }}>
          <h1 style={{ ...titleStyle, margin: 0, fontSize: '1.4em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {activeHeroine.name}との語らい
          </h1>
        </div>

        {/* Middle: Spacer */}
        <div style={{ flex: '1 1 auto' }} />
      </div>

      {/* Action Button: Absolutely positioned above the VNBox dock */}
      <div style={{ 
        position: 'absolute', 
        bottom: '185px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 7,
        width: '94%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button 
          data-testid="intro-start" 
          onClick={onBeginService} 
          className="vn-button-reveal"
          style={{ 
            ...buttonStyle, 
            width: '100%', 
            maxWidth: '340px', 
            margin: 0, 
            height: '48px',
            fontSize: '1.1em',
            background: `linear-gradient(135deg, ${THEME.brass} 0%, #b38b4d 100%)`,
            boxShadow: `0 6px 20px ${THEME.brass}44`,
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          営業を始める
        </button>
      </div>

      {/* Bottom Dock: VN Box (Stick to screen root bottom) */}
      <div style={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 6,
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
      }}>
        {/* Main VN Box Container */}
        <div style={{ 
          width: '100%', 
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          <VNBox
            ref={vnRef}
            pages={introPages}
            hint="客の好みに合わせて素材を選ぼう"
            themeColor={THEME.brass}
            speed={textSpeedMeta.delay}
            skip={shouldSkipTypewriter(isInstantTextSpeed)}
            getFaceIcon={getFaceIcon}
            onPageComplete={onPageComplete}
            onComplete={onBeginService}
          />
        </div>
      </div>
    </div>
  );
};



// --- Inlined: ResultScreen ---

/**
 * ResultScreen Component
 * Extracts the RESULT screen logic and UI from App.jsx.
 */
const ResultScreen = ({
  session,
  getRankInfo,
  getWorkshopResult,
  containerStyle,
  handleVnAreaClick,
  renderThemeStyles,
  renderBackground,
  screen,
  routeMode,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  titleStyle,
  cardStyle,
  vnRef,
  textSpeedMeta,
  shouldSkipTypewriter,
  isInstantTextSpeed,
  appendVnBacklog,
  handleEndDay,
  activeHeroine,
  HeroineDisplay,
  getResultExpression,
  lastAffectionGain,
  buttonStyle,
  handleNextDay
}) => {
  if (!session) return null;

  const correctCount = session.answers.filter(a => a.isCorrect).length;
  const rank = getRankInfo(correctCount);
  const mgmt = getWorkshopResult(correctCount);

  const resultNarrations = {
    5: "大成功。今回の営業は、星瓶堂の流れがよく見えていた。",
    4: "よくやった。客の話を聞き取り、品を選ぶ手つきも安定している。",
    3: "まずまずだ。迷いはあるが、次の一手が見えている。",
    2: "もう少し。客の意図をつかめれば、品選びはもっと楽になる。",
    1: "惜しい。焦らず相手の話を聞くところから整えていこう。",
    0: "今回はうまくいかなかった。だが、次の営業で取り戻せる。",
  };

  return (
    <div 
      data-testid="result-screen" 
      style={{ ...containerStyle, position: 'relative' }}
      onClick={handleVnAreaClick}
    >
      {renderThemeStyles && renderThemeStyles()}
      {renderBackground && renderBackground(screen)}
      <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={onOpenLog} 
          onOpenOptions={onOpenOptions} 
          onOpenHelp={onOpenHelp} 
        />
        <h1 style={{ ...titleStyle, color: THEME.nightBlue, marginBottom: '20px' }}>今回の営業記録</h1>
        <div style={{ ...cardStyle, borderRadius: '8px', border: `3px double ${THEME.brass}`, background: 'rgba(244, 233, 213, 0.98)', padding: '25px', marginTop: '10px' }}>
          <div style={{ marginBottom: '25px' }}>
            <VNBox 
              ref={vnRef}
              text={resultNarrations[correctCount]}
              themeColor={THEME.brass}
              speed={textSpeedMeta.delay}
              skip={shouldSkipTypewriter(isInstantTextSpeed)}
              onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'RESULT' })}
              onComplete={handleEndDay}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
            {HeroineDisplay && (
              <HeroineDisplay 
                heroine={activeHeroine} 
                type="face" 
                size="small" 
                expression={getResultExpression(correctCount)}
              />
            )}
            <div style={{ fontSize: '1.1em', color: activeHeroine.themeColor, fontWeight: 'bold' }}>
              {activeHeroine.name}との縁+{lastAffectionGain}
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '10px', 
            margin: '20px 0',
            background: 'rgba(0,0,0,0.05)',
            padding: '15px',
            borderRadius: '4px',
            border: `1px solid ${THEME.brassDark}`
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '4px' }}>評判</div>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: mgmt.reputation >= 0 ? THEME.oasisTeal : '#844' }}>
                {mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '4px' }}>売上</div>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: THEME.brassDark }}>
                {mgmt.sales}G
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '4px' }}>満足度</div>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: mgmt.satisfaction >= 0 ? THEME.oasisTeal : '#844' }}>
                {mgmt.satisfaction >= 0 ? `+${mgmt.satisfaction}` : mgmt.satisfaction}
              </div>
            </div>
          </div>

          <h2 style={{ margin: '10px 0', fontSize: '1.2em' }}>最終スコア: {session.score} 点</h2>
          <p style={{ fontSize: '1em', marginBottom: '20px', color: '#666' }}>
            依頼 {session.questions.length} 件中 {correctCount} 件達成
          </p>
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '4px', marginBottom: '30px', fontStyle: 'italic', color: '#444', fontSize: '0.9em' }}>
            {rank.message}
          </div>
          <button data-testid="day-end-next" onClick={handleNextDay} className="vn-button-reveal" style={{ ...buttonStyle, width: '100%', maxWidth: '280px' }}>次の営業へ</button>
        </div>
      </div>
    </div>
  );
};



// --- Inlined: VNBox ---

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
      className="vn-box"
      onClick={handleClick}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        height: '166px', // Slightly taller for stability
        background: 'rgba(18, 28, 42, 0.98)',
        padding: currentSpeaker ? '22px 24px 28px 24px' : '18px 24px 28px 24px',
        borderRadius: '12px 12px 0 0', // Docked feel: top corners only
        cursor: 'pointer',
        color: THEME.parchment,
        textAlign: 'left',
        position: 'relative',
        boxShadow: '0 -4px 15px rgba(0,0,0,0.3)', // Subtle top shadow only
        fontFamily: "'Outfit', 'Inter', sans-serif",
        userSelect: 'none',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        lineHeight: '1.7',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible', // Allow speaker tag to hook onto corner
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottom: 'none' // Tightly docked to bottom
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



// --- Inlined: SoundTest ---


function SoundTest({ onClose, isAudioEnabled, onToggleAudio }) {
  const [currentPlayingId, setCurrentPlayingId] = useState(audioEngine.currentTrackId);
  const groups = [...new Set(SFX_CANDIDATES.map(c => c.group))];
  const currentTrack = currentPlayingId ? Object.values(TRACKS).find(t => t.id === currentPlayingId) : null;

  const handlePlayTrack = (track) => {
    audioEngine.playTrack(track);
    setCurrentPlayingId(track.id);
  };

  const handleStop = () => {
    audioEngine.stop();
    setCurrentPlayingId(null);
  };

  return (
    <div data-testid="sound-test-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', flexDirection: 'column', padding: '8px' }}>
      <div style={{ maxWidth: '600px', width: '100%', height: '100%', margin: '0 auto', background: '#1a1a1a', borderRadius: '12px', border: `1px solid ${THEME.brassDark}`, color: '#eee', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        {/* Fixed Header */}
        <div style={{ padding: '12px 16px', background: 'rgba(26, 42, 58, 0.98)', borderBottom: `1px solid ${THEME.brassDark}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, color: THEME.starGold, fontSize: '1.1rem', fontWeight: 'bold' }}>Sound Test</h2>
            <button data-testid="sound-test-close" onClick={onClose} style={{ padding: '6px 12px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>閉じる</button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>Now Playing</div>
              <div style={{ fontSize: '0.85rem', color: currentTrack ? THEME.starGold : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                {currentTrack ? `${currentTrack.title} (${currentTrack.id})` : 'None'}
              </div>
            </div>
            <button 
              onClick={handleStop}
              style={{ padding: '8px 16px', background: currentPlayingId ? '#e53935' : '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', transition: 'background 0.2s' }}
            >
              STOP
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px' }}>
          {!isAudioEnabled && (
            <div style={{ background: '#422', padding: '12px', marginBottom: '20px', borderRadius: '8px', color: '#f88', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #622' }}>
              <span>音声がOFFのため、再生されません。</span>
              <button onClick={onToggleAudio} style={{ padding: '6px 12px', background: THEME.starGold, color: THEME.textDark, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>音をONにする</button>
            </div>
          )}

        {/* BGM Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em', fontWeight: 'bold' }}>BGM (Music)</h3>
          
          {[...new Set(Object.values(TRACKS).map(t => t.category || "その他"))].map(category => (
            <div key={category} style={{ marginBottom: '16px' }}>
              <div style={{ color: '#777', fontSize: '0.7rem', marginBottom: '8px', borderLeft: `2px solid ${THEME.brassDark}`, paddingLeft: '8px', fontWeight: 'bold' }}>{category}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {Object.values(TRACKS).filter(t => (t.category || "その他") === category).map(track => {
                  const isPlaying = currentPlayingId === track.id;
                  return (
                    <button 
                      key={track.id} 
                      onClick={() => handlePlayTrack(track)}
                      disabled={!isAudioEnabled}
                      style={{ 
                        background: isPlaying ? 'rgba(255, 204, 0, 0.15)' : '#2a2a2a', 
                        padding: '10px 8px', 
                        borderRadius: '6px', 
                        border: `1px solid ${isPlaying ? THEME.starGold : '#3a3a3a'}`,
                        textAlign: 'left',
                        cursor: isAudioEnabled ? 'pointer' : 'default',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '0.7rem', color: isPlaying ? THEME.starGold : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                      <div style={{ fontSize: '0.6rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.id}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em', fontWeight: 'bold' }}>SFX (Sound Effects)</h3>

        {groups.map(group => (
          <div key={group} style={{ marginBottom: '20px' }}>
            <div style={{ color: '#777', fontSize: '0.7rem', marginBottom: '8px', borderLeft: `2px solid ${THEME.brassDark}`, paddingLeft: '8px', fontWeight: 'bold' }}>{group}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {SFX_CANDIDATES.filter(c => c.group === group).map(c => (
                <button
                  key={c.id}
                  onClick={() => audioEngine.playSfxCandidate(c.id)}
                  disabled={!isAudioEnabled}
                  style={{ 
                    background: '#2a2a2a', 
                    padding: '8px 4px', 
                    borderRadius: '6px', 
                    border: '1px solid #3a3a3a',
                    cursor: isAudioEnabled ? 'pointer' : 'default',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.id}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}



function App() {
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState('START');
  const [activeHeroineId, setActiveHeroineId] = useState('hakima');
  const [routeMode, setRouteMode] = useState('normal');
  const [previewHeroineId, setPreviewHeroineId] = useState('hakima');
  const [workshopState, setWorkshopState] = useState(createInitialWorkshopState());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [showSoundTest, setShowSoundTest] = useState(false);
  const [hasSave, setHasSave] = useState(() => {
    const data = loadSaveData();
    return !!(data && data.screen !== 'START');
  });
  const [bgTestIndex, setBgTestIndex] = useState(0);
  const [stillTestIndex, setStillTestIndex] = useState(0);
  const [visualTestMode, setVisualTestMode] = useState('background');
  const [vnBacklog, setVnBacklog] = useState([]);
  const [textSpeed, setTextSpeed] = useState('normal');
  const [instantUnreadText, setInstantUnreadText] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(DEFAULT_AUDIO_VOLUME);
  const [seVolume, setSeVolume] = useState(DEFAULT_AUDIO_VOLUME);
  const backlogScrollRef = useRef(null);
  // M10-UI-2: 3 independent modal states (Options / Log / Help)
  const [showOptions, setShowOptions] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Affection / Intimacy State
  const [affection, setAffection] = useState(() => 
    createInitialAffection(HEROINES.map(h => h.id))
  );
  const [lastAffectionGain, setLastAffectionGain] = useState(0);

  // Quiz Interaction Feedback (M9-3)
  const [quizFeedback, setQuizFeedback] = useState(null); // { itemId, isCorrect }

  // Event State
  const [seenEventIds, setSeenEventIds] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isRecallMode, setIsRecallMode] = useState(false);

  // --- Asset Loading State (M8-28) ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isHeroineLoading, setIsHeroineLoading] = useState(false);

  const outerWrapperRef = useRef(null);
  const vnRef = useRef(null);

  // --- Scale-to-Fit Implementation (M8-23) ---
  const BASE_WIDTH = 390;
  const BASE_HEIGHT = 780;
  const MAX_LOGICAL_WIDTH = 560;
  const MIN_SCALE = 0.1; // (M-UI-MOBILE-VIEWPORT-1: Scale-to-Fit Fix)
  const MAX_SCALE = 1.25;

  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 780
  });
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      const viewport = window.visualViewport;
      const doc = document.documentElement;
      const newWidth = Math.floor(Math.min(viewport?.width || window.innerWidth, doc?.clientWidth || window.innerWidth));
      const newHeight = Math.floor(Math.min(viewport?.height || window.innerHeight, doc?.clientHeight || window.innerHeight));
      
      setViewportSize(prev => {
        // Only update if change is significant (> 1px) to avoid micro-drift
        if (Math.abs(prev.width - newWidth) <= 1 && Math.abs(prev.height - newHeight) <= 1) return prev;
        return { width: newWidth, height: newHeight };
      });
    };
    handleResize();
    const resizeEvents = ['resize', 'orientationchange'];
    resizeEvents.forEach(e => window.addEventListener(e, handleResize));
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    return () => {
      resizeEvents.forEach(e => window.removeEventListener(e, handleResize));
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    // Monitor the parent element, but be careful of loops if parent is root
    const target = outerWrapperRef.current?.parentElement || document.body;
    const isRoot = target === document.body || target === document.documentElement || target.id === 'root';
    
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      
      const newWidth = Math.floor(rect.width);
      const newHeight = Math.floor(rect.height);
      
      setHostSize(prev => {
        // Ignore micro-changes that might be caused by scrollbars or rounding in root containers
        if (isRoot && Math.abs(prev.width - newWidth) <= 2 && Math.abs(prev.height - newHeight) <= 2) return prev;
        if (prev.width === newWidth && prev.height === newHeight) return prev;
        return { width: newWidth, height: newHeight };
      });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (showLog && backlogScrollRef.current) {
      backlogScrollRef.current.scrollTop = backlogScrollRef.current.scrollHeight;
    }
  }, [showLog, vnBacklog]);

  const measuredSize = {
    width: hostSize.width || viewportSize.width,
    height: hostSize.height || viewportSize.height
  };

  const rawScale = Math.min(
    measuredSize.width / BASE_WIDTH,
    measuredSize.height / BASE_HEIGHT
  );
  const scale = Math.min(Math.max(rawScale, MIN_SCALE), MAX_SCALE);
  const logicalWidth = Math.min(
    MAX_LOGICAL_WIDTH,
    Math.max(BASE_WIDTH, Math.floor(measuredSize.width / scale))
  );
  const isClipped = false; // Core Game UI No-Scroll Rule (M-UI-MOBILE-VIEWPORT-1: Scale-to-Fit Fix)

  const handleVnAreaClick = (e) => {
    if (shouldIgnoreVnAdvanceClick(e, { showOptions, showLog, showHelp, showSoundTest })) return;
    safeAdvanceVnBox(vnRef);
  };

  const outerWrapperStyle = {
    width: '100%',
    height: '100dvh', // Use viewport height for the host container
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', // Center the scaled canvas
    overflow: 'hidden',
    position: 'relative'
  };

  const canvasContainerStyle = {
    width: `${logicalWidth * scale}px`,
    height: `${BASE_HEIGHT * scale}px`,
    position: 'relative',
    flexShrink: 0
  };

  const canvasStyle = {
    width: `${logicalWidth}px`,
    height: `${BASE_HEIGHT}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    background: '#1a2a3a',
    color: '#eee'
  };

  // Initial Load
  useEffect(() => {
    const data = loadSaveData();
    if (data) {
      setHasSave(data.screen !== 'START');
      setRouteMode(data.routeMode || 'normal');
      setTextSpeed(data.textSpeed || 'normal');
      setInstantUnreadText(data.instantUnreadText === true);
      setBgmVolume(Number.isFinite(data.bgmVolume) ? data.bgmVolume : DEFAULT_AUDIO_VOLUME);
      setSeVolume(Number.isFinite(data.seVolume) ? data.seVolume : DEFAULT_AUDIO_VOLUME);
      setIsAudioEnabled(Boolean(data.isAudioEnabled));
      // We don't restore everything automatically on mount, 
      // but we do need the seenEventIds for the session logic
      setSeenEventIds(data.seenEventIds || []);
    }
  }, []);

  // Auto-Save
  useEffect(() => {
    if (screen !== 'START') {
      saveGameData({
        screen: screen === 'EVENT' ? 'RESULT' : screen, // Fallback EVENT to RESULT for safety
        activeHeroineId,
        routeMode,
        workshopState,
        affection,
        textSpeed,
        instantUnreadText,
        bgmVolume,
        seVolume,
        isAudioEnabled,
        seenEventIds,
        activeEvent,
        vnBacklog
      });
      setHasSave(true);
    } else {
      // On START screen: save settings into existing save file if it exists,
      // or create a default save with these settings if it doesn't.
      const currentData = loadSaveData();
      
      // Determine if we should save: 
      // 1. If a save already exists
      // 2. Or if any setting is non-default (meaning the user changed something)
      const isDefaultSettings = 
        routeMode === 'normal' && 
        textSpeed === 'normal' && 
        instantUnreadText === false && 
        Math.abs(bgmVolume - DEFAULT_AUDIO_VOLUME) < 0.01 && 
        Math.abs(seVolume - DEFAULT_AUDIO_VOLUME) < 0.01 && 
        isAudioEnabled === false;

      if (currentData || !isDefaultSettings) {
        saveGameData({
          ...(currentData || {}),
          routeMode,
          textSpeed,
          instantUnreadText,
          bgmVolume,
          seVolume,
          isAudioEnabled
        });
      }

      // hasSave should only be true if it's a real game progress save
      if (currentData && currentData.screen !== 'START') {
        setHasSave(true);
      } else {
        setHasSave(false);
      }
    }
  }, [screen, activeHeroineId, routeMode, workshopState, affection, textSpeed, instantUnreadText, bgmVolume, seVolume, isAudioEnabled, seenEventIds, activeEvent, vnBacklog]);

  useEffect(() => {
    audioEngine.setBgmVolume(bgmVolume);
  }, [bgmVolume]);

  useEffect(() => {
    audioEngine.setSeVolume(seVolume);
  }, [seVolume]);

  // Sync mute state
  useEffect(() => {
    audioEngine.setMuted(!isAudioEnabled);
  }, [isAudioEnabled]);

  // Handle BGM per screen
  useEffect(() => {
    let trackId = null;
    const day = workshopState.day || 1;
    const hPrefix = (activeHeroineId || 'hakima').toUpperCase();

    if (screen === 'START' || screen === 'HEROINE_SELECT' || screen === 'MEMORIES') {
      trackId = 'MAIN-01';
    } else if (screen === 'QUIZ') {
      if (day <= 2) {
        trackId = 'MAIN-03';
      } else if (day <= 4) {
        trackId = `${hPrefix}-02`;
      } else if (day <= 6) {
        trackId = `${hPrefix}-03`;
      } else if (day <= 8) {
        trackId = `${hPrefix}-04`;
      } else {
        trackId = `${hPrefix}-05`;
      }
    } else if (screen === 'INTRO' || screen === 'RESULT' || screen === 'DAY_END') {
      trackId = 'MAIN-02';
    } else if (screen === 'EVENT') {
      trackId = `${hPrefix}-01`;
    } else if (screen === 'ENDING') {
      const finalAffection = affection[activeHeroineId];
      const finalReputation = workshopState.reputation;
      if (finalAffection >= 80 && finalReputation >= 40) {
        trackId = `${hPrefix}-07`; // Good Ending
      } else {
        trackId = `${hPrefix}-06`; // Normal/Bad Ending
      }
    }

    if (isAudioEnabled && trackId && TRACKS[trackId]) {
      audioEngine.playTrack(TRACKS[trackId]);
    } else {
      audioEngine.stop();
    }
  }, [screen, workshopState.day, activeHeroineId, affection, workshopState.reputation, isAudioEnabled]);


  const activeHeroine = HEROINES.find(h => h.id === activeHeroineId) || HEROINES[0];
  const textSpeedMeta = getTextSpeedMeta(textSpeed);
  const isInstantTextSpeed = textSpeed === 'instant' || instantUnreadText;

  // Go to Heroine Select (New Game)
  const handleStartGame = () => {
    audioEngine.playSfx('uiGameStart');
    clearSaveData();
    setHasSave(false);
    
    // Reset states to default
    setActiveHeroineId('hakima');
    setPreviewHeroineId('hakima');
    setWorkshopState(createInitialWorkshopState());
    setAffection(createInitialAffection(HEROINES.map(h => h.id)));
    setSeenEventIds([]);
    setActiveEvent(null);
    setVnBacklog([]);
    setSession(null);
    
    setScreen('PROLOGUE');
  };

  // Continue from Save
  const handleContinue = () => {
    const data = loadSaveData();
    if (data) {
      audioEngine.playSfx('uiConfirmChime');
      setScreen(data.screen);
      setActiveHeroineId(data.activeHeroineId);
      setRouteMode(data.routeMode || 'normal');
      setTextSpeed(data.textSpeed || 'normal');
      setInstantUnreadText(data.instantUnreadText === true);
      setBgmVolume(Number.isFinite(data.bgmVolume) ? data.bgmVolume : DEFAULT_AUDIO_VOLUME);
      setSeVolume(Number.isFinite(data.seVolume) ? data.seVolume : DEFAULT_AUDIO_VOLUME);
      setWorkshopState(data.workshopState);
      setAffection(data.affection);
      setSeenEventIds(data.seenEventIds || []);
      setActiveEvent(data.activeEvent || null);
      setVnBacklog(data.vnBacklog || []);
      setIsAudioEnabled(data.isAudioEnabled);
    }
  };

  const handleResetSave = () => {
    if (window.confirm("セーブデータを削除しますか？")) {
      clearSaveData();
      setHasSave(false);
      setSeenEventIds([]);
      setActiveEvent(null);
    }
  };

  const handleCloseEvent = () => {
    audioEngine.playSfx('uiTapBottle');
    
    if (isRecallMode) {
      setActiveEvent(null);
      setIsRecallMode(false);
      setScreen('MEMORIES');
    } else {
      setSeenEventIds(prev => [...prev, activeEvent.id]);
      setActiveEvent(null);
      audioEngine.playSfx('workshopDayEnd');
      setScreen('DAY_END');
    }
  };

  // Select Heroine and start Intro
  useEffect(() => {
    const asset = (type, src) => ({ type, src: `${import.meta.env.BASE_URL}${src}`.replace(/([^:])\/\//g, '$1/') });
    const expressions = ['normal', 'joy', 'fun', 'sorrow', 'anger', 'surprise', 'cry', 'student', 'social', 'maid'];
    const essentialAssets = [
      ...Object.values(TRACKS).map(track => asset('audio', track.src)),
      ...Object.values(SFX).map(sfx => asset('audio', sfx.src)),
      ...Object.values(BACKGROUND_IMAGES).map(bg => asset('image', bg.src)),
      ...Object.values(STILL_IMAGES).map(still => asset('image', still.src)),
      asset('image', 'characters/common/standing_proc/running_group.png'),
      ...itemsData.items.map(item => asset('image', item.image)),
      ...HEROINES.flatMap(heroine => expressions.flatMap(expression => [
        asset('image', `characters/${heroine.id}/face_proc/${expression}.png`),
        asset('image', `characters/${heroine.id}/standing_proc/${expression}.png`)
      ]))
    ].filter((entry, index, list) => list.findIndex(item => item.src === entry.src) === index);

    const loadAll = async () => {
      await preloadAssets(essentialAssets, setLoadingProgress);
      setIsInitialLoading(false);
    };

    loadAll();
  }, []);

  const preloadAssets = async (assetList, onProgress) => {
    let loadedCount = 0;
    const totalCount = assetList.length;
    if (totalCount === 0) return;

    const loadPromises = assetList.map(async (asset) => {
      try {
        if (asset.type === 'image') {
          await new Promise((resolve) => {
            const img = new Image();
            img.src = asset.src;
            img.onload = resolve;
            img.onerror = resolve;
          });
        } else if (asset.type === 'audio') {
          const audio = new Audio(asset.src);
          audio.preload = "auto";
        }
        loadedCount++;
        if (onProgress) onProgress(Math.floor((loadedCount / totalCount) * 100));
      } catch (err) {
        console.warn("Preload failed:", asset.src);
      }
    });

    await Promise.all(loadPromises);
  };

  const handleSelectHeroine = async (heroineId) => {
    audioEngine.playSfx('uiHeroineSelect');
    setIsHeroineLoading(true);
    setLoadingProgress(0);
    
    const heroine = HEROINES.find(h => h.id === heroineId);
    const themeTrack = getTrackById(heroine.themeTrackId);
    
    const heroineAssets = [
      { type: 'audio', src: `${import.meta.env.BASE_URL}${themeTrack.src}`.replace(/([^:])\/\//g, '$1/') },
      { type: 'image', src: `${import.meta.env.BASE_URL}characters/${heroineId}/standing_proc/normal.png`.replace(/([^:])\/\//g, '$1/') },
      { type: 'image', src: `${import.meta.env.BASE_URL}characters/${heroineId}/face_proc/normal.png`.replace(/([^:])\/\//g, '$1/') }
    ];

    await preloadAssets(heroineAssets, setLoadingProgress);
    
    setActiveHeroineId(heroineId);
    setWorkshopState(prev => ({ ...prev, activeHeroineId: heroineId }));
    
    // Auto-save when starting a new session with a heroine
    saveGameData({
      routeMode,
      workshopState: { ...workshopState, activeHeroineId: heroineId },
      affection,
      textSpeed,
      instantUnreadText,
      bgmVolume,
      seVolume,
      seenEventIds,
      vnBacklog
    });
    
    setTimeout(() => {
      setIsHeroineLoading(false);
      setScreen('INTRO');
    }, 500); // Small buffer for smoothness
  };

  // Go to INTRO (Next Day) or FINAL_RESULT
  const handleNextDay = () => {
    audioEngine.playSfx('uiTapBottle');
    if (workshopState.day >= 10) {
      setScreen('FINAL_RESULT');
    } else {
      setWorkshopState(prev => ({ ...prev, day: prev.day + 1 }));
      setScreen('INTRO');
    }
  };

  const handleSeeEnding = () => {
    audioEngine.playSfx('uiConfirmChime');
    setScreen('ENDING');
  };

  const handleFinishGame = () => {
    audioEngine.playSfx('uiTapBottle');
    // Clear save on game completion
    clearSaveData();
    setHasSave(false);
    setScreen('START');
  };

  // Generate quiz and start service
  const handleBeginService = () => {
    audioEngine.playSfx('uiTapBottle');
    setSession(createQuizSession({ questionCount: 5 }));
    setScreen('QUIZ');
  };

  // End of service, go to Day End (or Event)
  const handleEndDay = () => {
    if (activeEvent) {
      setScreen('EVENT');
    } else {
      audioEngine.playSfx('workshopDayEnd');
      setScreen('DAY_END');
    }
  };

  // Back to Title
  const handleBackToTitle = () => {
    audioEngine.playSfx('uiTapBottle');
    // Keep internal states for Continue logic
    setScreen('START');
    setHasSave(hasSaveData());
    setShowOptions(false);
    setShowLog(false);
    setShowHelp(false);
  };

  const handleRecallEventFromMemories = (event) => {
    audioEngine.playSfx('uiConfirmChime');
    setActiveEvent(event);
    setIsRecallMode(true);
    setActiveHeroineId(event.heroineId);
    setScreen('EVENT');
  };

  const appendVnBacklog = ({ speaker, text, screen: sourceScreen }) => {
    if (!text) return;

    setVnBacklog(prev => {
      const last = prev[prev.length - 1];
      if (last?.screen === sourceScreen && last?.speaker === speaker && last?.text === text) {
        return prev;
      }

      return [
        ...prev,
        {
          speaker: speaker || '',
          text,
          screen: sourceScreen || screen,
          heroineId: activeHeroineId,
          routeMode,
          sequence: prev.length + 1
        }
      ];
    });
  };

  // Handle answer selection (Improved in M9-3)
  const handleSelect = (itemId) => {
    if (!session || session.isFinished || quizFeedback) return;
    
    // 1. Play choice sound immediately (Removed as redundant)
    // audioEngine.playSfx('quizChoicePick');
    
    const updatedSession = answerQuestion(session, itemId);
    const lastAnswer = updatedSession.answers[updatedSession.answers.length - 1];
    const isCorrect = lastAnswer.isCorrect;

    // 2. Trigger visual feedback
    setQuizFeedback({ itemId, isCorrect });

    // 3. Delay result sound slightly to avoid harsh overlap
    setTimeout(() => {
      if (isCorrect) {
        audioEngine.playSfx('quizCorrectStarChime');
      } else {
        audioEngine.playSfx('quizWrongSandTap');
      }

      // 4. Wait for animation to finish before proceeding
      setTimeout(() => {
        setQuizFeedback(null);
        setSession(updatedSession);

        // If quiz just finished, accumulate results
        if (updatedSession.isFinished) {
          const correctCount = updatedSession.answers.filter(a => a.isCorrect).length;
          
          // Calculate and apply affection gain
          const gain = calculateQuizAffectionGain(correctCount, updatedSession.questions.length);
          const nextAffection = addAffection(affection, activeHeroineId, gain);
          setAffection(nextAffection);
          setLastAffectionGain(gain);

          // Check for Event Unlock
          const unlockedEvent = checkNewEventUnlock(activeHeroineId, nextAffection[activeHeroineId], seenEventIds);
          if (unlockedEvent) {
            setActiveEvent(unlockedEvent);
          }
          const result = getWorkshopResult(correctCount);
          setWorkshopState(prev => applyWorkshopResult(prev, result));
          setScreen('RESULT');
        }
      }, 650); // Feedback display duration
    }, 150); // Gap between tap and result sound
  };

  // --- RENDER HELPERS ---

  const getFullPath = (src) => `${import.meta.env.BASE_URL}${src}`.replace(/([^:])\/\//g, '$1/');
  const getFileName = (path) => path?.split('/').pop() || '';

  const renderBackground = (screenOrId) => {
    const SCREEN_BACKGROUNDS = {
      INTRO: 'shopExteriorDay',
      RESULT: 'shopInteriorWorkshop',
      DAY_END: 'shopExteriorNight',
      PROLOGUE: 'shopExteriorNight'
    };
    const bgId = SCREEN_BACKGROUNDS[screenOrId] || screenOrId;
    if (!bgId) return null;
    const bg = BACKGROUND_IMAGES[bgId];
    if (!bg) return null;

    return (
      <>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${getFullPath(bg.src)})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          zIndex: 0, pointerEvents: 'none',
          userSelect: 'none', WebkitUserSelect: 'none'
        }} draggable={false} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(26, 42, 58, 0.5)',
          zIndex: 1, pointerEvents: 'none',
          userSelect: 'none', WebkitUserSelect: 'none'
        }} />
      </>
    );
  };

  const renderThemeStyles = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Outfit:wght@400;500;700&display=swap');
      
      .game-root {
        font-family: 'Outfit', 'Inter', sans-serif;
        color: ${THEME.parchment};
        background-color: ${THEME.midnight};
        overflow: hidden;
        width: 100%;
        height: 100%;
        position: relative;
        /* Selection Prevention */
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        /* Image Drag Prevention */
        -webkit-user-drag: none;
      }

      /* Global interactive element tuning */
      button, [role="button"], .interactive-card, .item-card, .heroine-card, .vn-box, .quiz-option-0, .quiz-option-1 {
        touch-action: manipulation;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      img {
        -webkit-user-drag: none;
        user-drag: none;
        pointer-events: none;
        user-select: none;
      }

      button:active, .item-card:active { transform: scale(0.96); transition: transform 0.1s; }
      button:focus-visible { outline: 3px solid ${THEME.starGold}; outline-offset: 2px; }
      .heroine-card { transition: transform 0.2s; border: 2px solid ${THEME.brassDark}; }
      .heroine-card:active { transform: scale(0.98); background: ${THEME.sand} !important; }
      .memory-item { border-left: 4px solid ${THEME.brassDark}; background: rgba(0,0,0,0.1); transition: background 0.2s; }
      .memory-item:active { background: rgba(197, 160, 89, 0.2); }
      
      @keyframes screenIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .screen-enter {
        animation: screenIn 0.4s ease-out forwards;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        alignItems: center;
      }

      /* Scrollable areas exception */
      .scrollable-content, .log-content, .help-content, .selectable-text {
        user-select: text;
        -webkit-user-select: text;
        touch-action: pan-y;
      }

      /* Quiz Animations (M9-3) */
      @keyframes staggerIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .quiz-option-0 { animation: staggerIn 0.4s ease-out both; animation-delay: 0.1s; }
      .quiz-option-1 { animation: staggerIn 0.4s ease-out both; animation-delay: 0.25s; }

      /* Story/VN Button Reveal (M-UI-TRANSITION-POLISH) */
      @keyframes vn-button-reveal {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .vn-button-reveal {
        animation: vn-button-reveal 0.25s ease-out forwards;
      }

      /* Customer Silhouette Icon (M-QUIZ-SILHOUETTE-ICON) */
      .customer-silhouette {
        position: relative;
        display: inline-block;
        width: 1.8em;
        height: 1.8em;
        border-radius: 999px;
        background: rgba(35, 25, 18, 0.9);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid rgba(218, 180, 96, 0.45);
        flex: 0 0 auto;
        vertical-align: middle;
        margin-right: 12px;
      }

      .customer-silhouette::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 25%;
        width: 0.52em;
        height: 0.52em;
        transform: translateX(-50%);
        border-radius: 999px;
        background: #f4e9d5;
      }

      .customer-silhouette::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: 20%;
        width: 1.0em;
        height: 0.55em;
        transform: translateX(-50%);
        border-radius: 999px 999px 0.25em 0.25em;
        background: #f4e9d5;
      }

      @keyframes goldFlash {
        0% { box-shadow: 0 0 0 0 rgba(255, 204, 0, 0); border-color: ${THEME.brass}; }
        50% { box-shadow: 0 0 30px 10px rgba(255, 204, 0, 0.8); border-color: #ffcc00; background: #fffdf0; }
        100% { box-shadow: 0 0 15px 5px rgba(255, 204, 0, 0.4); border-color: #ffcc00; background: #fffdf0; }
      }
      .feedback-correct { 
        animation: goldFlash 0.5s ease-out forwards; 
        z-index: 10;
        transform: scale(1.05) !important;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-6px); }
        40%, 80% { transform: translateX(6px); }
      }
      .feedback-wrong { 
        animation: shake 0.4s ease-in-out; 
        border-color: #f44 !important; 
        background: #fff5f5 !important;
        opacity: 0.8;
      }
    `}</style>
  );







  const utilityHeaderStyle = {
    width: '100%',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '6px 8px',
    marginBottom: '8px',
    background: 'rgba(26, 42, 58, 0.96)',
    borderBottom: `1px solid ${THEME.brass}`,
    boxSizing: 'border-box',
    flexShrink: 0,
    zIndex: 20
  };

  const utilityBackButtonStyle = {
    ...buttonStyle,
    margin: 0,
    padding: '7px 10px',
    minWidth: '72px',
    fontSize: '0.82em',
    background: THEME.nightBlue,
    color: THEME.sand,
    border: `1px solid ${THEME.brass}`,
    boxShadow: 'none'
  };

  const renderUtilityHeader = (title, action = handleBackToTitle, right = null, testId = null) => (
    <div style={utilityHeaderStyle}>
      <button data-testid={testId ? `${testId}-back` : undefined} onClick={action} style={utilityBackButtonStyle}>戻る</button>
      <div style={{
        color: THEME.sand,
        fontWeight: 'bold',
        fontSize: '0.95em',
        textAlign: 'center',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
      }}>
        {title}
      </div>
      <div style={{ minWidth: '72px', display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );

  const getFaceIcon = (id, type, expression) => {
    const assetPath = getHeroineAsset(id, type, expression);
    return assetPath ? `${import.meta.env.BASE_URL}${assetPath}`.replace(/([^:])\/\//g, '$1/') : null;
  };

  let mainContent = null;

  if (screen === 'START') {
    mainContent = (
      <StartScreen
        screen={screen}
        routeMode={routeMode}
        setRouteMode={setRouteMode}
        hasSave={hasSave}
        onContinue={handleContinue}
        onNewGame={handleStartGame}
        onOpenMemories={() => setScreen('MEMORIES')}
        onOpenOptions={() => setShowOptions(true)}
        onOpenSoundTest={() => setShowSoundTest(true)}
        onOpenVisualTest={() => setScreen('VISUAL_TEST')}
        onClearSaveData={handleResetSave}
        onOpenLog={() => setShowLog(true)}
        onOpenHelp={() => setShowHelp(true)}
        renderThemeStyles={renderThemeStyles}
      />
    );
  } else if (screen === 'PROLOGUE') {
    mainContent = (
      <PrologueScreen
        screen={screen}
        routeMode={routeMode}
        textSpeedMeta={textSpeedMeta}
        isInstantTextSpeed={isInstantTextSpeed}
        onOpenLog={() => setShowLog(true)}
        onOpenOptions={() => setShowOptions(true)}
        onOpenHelp={() => setShowHelp(true)}
        onVnAreaClick={handleVnAreaClick}
        onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'PROLOGUE' })}
        onAdvanceToHeroineSelect={() => {
          audioEngine.playSfx('uiClickForward');
          setScreen('HEROINE_SELECT');
        }}
        renderThemeStyles={renderThemeStyles}
        renderBackground={renderBackground}
        HeroineDisplay={HeroineDisplay}
        audioEngine={audioEngine}
        vnRef={vnRef}
        getFaceIcon={getFaceIcon}
        containerStyle={containerStyle}
        titleStyle={titleStyle}
        cardStyle={cardStyle}
        buttonStyle={buttonStyle}
      />
    );
  } else if (screen === 'INTRO') {
    mainContent = (
      <IntroScreen
        activeHeroine={activeHeroine}
        screen={screen}
        routeMode={routeMode}
        textSpeedMeta={textSpeedMeta}
        isInstantTextSpeed={isInstantTextSpeed}
        onOpenLog={() => setShowLog(true)}
        onOpenOptions={() => setShowOptions(true)}
        onOpenHelp={() => setShowHelp(true)}
        onVnAreaClick={handleVnAreaClick}
        onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'INTRO' })}
        onBeginService={handleBeginService}
        renderThemeStyles={renderThemeStyles}
        renderBackground={renderBackground}
        HeroineDisplay={HeroineDisplay}
        audioEngine={audioEngine}
        vnRef={vnRef}
        getFaceIcon={getFaceIcon}
        containerStyle={containerStyle}
        titleStyle={titleStyle}
        cardStyle={cardStyle}
        buttonStyle={buttonStyle}
        narrativeBoxStyle={narrativeBoxStyle}
      />
    );
  } else if (screen === 'RESULT' && session) {
    mainContent = (
      <ResultScreen
        session={session}
        getRankInfo={getRankInfo}
        getWorkshopResult={getWorkshopResult}
        containerStyle={containerStyle}
        handleVnAreaClick={handleVnAreaClick}
        renderThemeStyles={renderThemeStyles}
        renderBackground={renderBackground}
        screen={screen}
        routeMode={routeMode}
        onOpenLog={() => setShowLog(true)}
        onOpenOptions={() => setShowOptions(true)}
        onOpenHelp={() => setShowHelp(true)}
        titleStyle={titleStyle}
        cardStyle={cardStyle}
        vnRef={vnRef}
        textSpeedMeta={textSpeedMeta}
        shouldSkipTypewriter={shouldSkipTypewriter}
        isInstantTextSpeed={isInstantTextSpeed}
        appendVnBacklog={appendVnBacklog}
        handleEndDay={handleEndDay}
        activeHeroine={activeHeroine}
        HeroineDisplay={HeroineDisplay}
        getResultExpression={getResultExpression}
        lastAffectionGain={lastAffectionGain}
        buttonStyle={buttonStyle}
        handleNextDay={handleNextDay}
      />
    );
  } else if (screen === 'DAY_END') {
    const correctCount = session ? session.answers.filter(a => a.isCorrect).length : 0;
    const mgmt = getWorkshopResult(correctCount);

    mainContent = (
      <div 
        style={{ ...containerStyle, position: 'relative' }}
        onClick={handleVnAreaClick}
      >
        {renderThemeStyles()}
        {renderBackground(screen)}
        <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '300px', background: 'rgba(255,255,255,0.95)', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1em', color: '#666', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>今回の営業記録</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px' }}>
               <div>売上: <span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{mgmt.sales}G</span></div>
               <div>評判: <span style={{ color: mgmt.reputation >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}</span></div>
            </div>
            
            <div style={{ textAlign: 'left', fontSize: '0.85em', color: '#444', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
              <strong>現在の工房の状態(第{workshopState.day}回 営業終了)</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                 <div>総売上: <span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{workshopState.sales}G</span></div>
                 <div>総評判: <span style={{ color: workshopState.reputation >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{workshopState.reputation >= 0 ? `+${workshopState.reputation}` : workshopState.reputation}</span></div>
                 <div>満足度: <span style={{ color: workshopState.satisfaction >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{workshopState.satisfaction >= 0 ? `+${workshopState.satisfaction}` : workshopState.satisfaction}</span></div>
                 <div>親密度: <span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{affection[activeHeroine.id]} / 100</span></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <button onClick={handleNextDay} className="vn-button-reveal" style={{ ...buttonStyle, width: '100%', maxWidth: '280px', margin: 0 }}>次の営業へ</button>
            <button onClick={handleBackToTitle} className="vn-button-reveal" style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '100%', maxWidth: '280px', margin: 0 }}>タイトルへ戻る</button>
          </div>
        </div>
      </div>
    );
  } else if (screen === 'EVENT' && activeEvent) {

    const still = activeEvent.stillImageId ? STILL_IMAGES[activeEvent.stillImageId] : null;

    mainContent = (
      <div style={containerStyle} onClick={handleVnAreaClick}>
        {renderThemeStyles()}
        <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={() => setShowLog(true)} 
          onOpenOptions={() => setShowOptions(true)} 
          onOpenHelp={() => setShowHelp(true)} 
        />
          <h1 style={titleStyle}>愛着の記録: {activeEvent.title}</h1>
          <div style={{ ...cardStyle, background: THEME.nightBlue, color: THEME.parchment }}>
          {still && (
            <div style={{ 
              width: '100%', 
              aspectRatio: '16 / 9',
              background: '#000', 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: `1px solid ${THEME.brass}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
              position: 'relative'
            }}>
              <img 
                src={getFullPath(still.src)} 
                alt={still.label}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: isRecallMode ? 'contain' : 'cover',
                  objectPosition: `${(still.focusX ?? 0.5) * 100}% ${(still.focusY ?? 0.5) * 100}%`
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span style="color:#f44">Still Load Failed</span>';
                }}
              />
            </div>
          )}
          
            {!still && (
              <div style={{ marginBottom: '20px' }}>
                <HeroineDisplay 
                  heroine={activeHeroine} 
                  type="standing" 
                  size="large" 
                  expression={activeEvent.expression} 
                />
              </div>
            )}
            <VNBox 
              ref={vnRef}
              speaker={activeEvent.speaker}
              pages={getEventPages(activeEvent, routeMode)}
              themeColor={activeHeroine.themeColor}
              speed={textSpeedMeta.delay}
              skip={shouldSkipTypewriter(isInstantTextSpeed, seenEventIds.includes(activeEvent.id))}
              onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'EVENT' })}
              onComplete={handleCloseEvent}
            />
            <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '300px', marginTop: '20px' }}>
              <button 
                onClick={handleCloseEvent} 
                className="vn-button-reveal"
                style={{ ...buttonStyle, flex: 1, margin: 0, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}` }}
              >
                次へ
              </button>
              {seenEventIds.includes(activeEvent.id) && (
                <button 
                  onClick={handleCloseEvent}
                  className="vn-button-reveal"
                  style={{ ...buttonStyle, flex: 1, margin: 0, background: '#444', color: '#ccc', fontSize: '0.8em' }}
                >
                  SKIP
                </button>
              )}
            </div>
        </div>
      </div>
    );
  } else if (screen === 'VISUAL_TEST') {
    mainContent = (
      <VisualTestScreen
        visualTestMode={visualTestMode}
        setVisualTestMode={setVisualTestMode}
        bgTestIndex={bgTestIndex}
        setBgTestIndex={setBgTestIndex}
        stillTestIndex={stillTestIndex}
        setStillTestIndex={setStillTestIndex}
        handleBackToTitle={handleBackToTitle}
        getFullPath={getFullPath}
        getFileName={getFileName}
        renderThemeStyles={renderThemeStyles}
      />
    );
  } else if (screen === 'MEMORIES') {
    mainContent = (
      <MemoriesScreen
        screen={screen}
        routeMode={routeMode}
        seenEventIds={seenEventIds}
        heroines={HEROINES}
        affectionEvents={AFFECTION_EVENTS}
        onBackToTitle={handleBackToTitle}
        onOpenLog={() => setShowLog(true)}
        onOpenOptions={() => setShowOptions(true)}
        onOpenHelp={() => setShowHelp(true)}
        onRecallEvent={handleRecallEventFromMemories}
        renderThemeStyles={renderThemeStyles}
        renderUtilityHeader={renderUtilityHeader}
      />
    );
  } else if (screen === 'HEROINE_SELECT') {
    mainContent = (
      <HeroineSelectScreen
        previewHeroineId={previewHeroineId}
        onPreviewHeroineChange={setPreviewHeroineId}
        onSelectHeroine={handleSelectHeroine}
        affection={affection}
        routeMode={routeMode}
        screen={screen}
        onOpenLog={() => setShowLog(true)}
        onOpenOptions={() => setShowOptions(true)}
        onOpenHelp={() => setShowHelp(true)}
        renderThemeStyles={renderThemeStyles}
        HeroineDisplay={HeroineDisplay}
        getFullPath={getFullPath}
        audioEngine={audioEngine}
      />
    );

  } else if (screen === 'FINAL_RESULT') {
    const finalAffection = affection[activeHeroineId];
    const finalSales = workshopState.sales;
    const finalReputation = workshopState.reputation;
    
    mainContent = (
      <div 
        data-testid="final-result-screen"
        style={{ ...containerStyle, position: 'relative' }}
        onClick={handleVnAreaClick}
      >
        {renderThemeStyles()}
        <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={() => setShowLog(true)} 
          onOpenOptions={() => setShowOptions(true)} 
          onOpenHelp={() => setShowHelp(true)} 
        />
        <h1 style={titleStyle}>10回の営業総決算</h1>
        <div style={{ ...cardStyle, border: `3px double ${THEME.brass}`, padding: '25px' }}>
          <div style={{ marginBottom: '25px' }}>
            <HeroineDisplay heroine={activeHeroine} type="face" size="medium" />
            <div style={{ marginTop: '10px', fontSize: '1.2em', fontWeight: 'bold', color: THEME.brassDark }}>
              {activeHeroine.name} との歩み
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '30px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
               <span>総売上合計</span>
               <span style={{ fontWeight: 'bold' }}>{finalSales} G</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
               <span>最終的な評判</span>
               <span style={{ fontWeight: 'bold', color: finalReputation >= 0 ? THEME.oasisTeal : '#844' }}>
                 {finalReputation >= 0 ? `+${finalReputation}` : finalReputation}
               </span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
               <span>{activeHeroine.name} との縁</span>
               <span style={{ fontWeight: 'bold', color: THEME.brassDark }}>{finalAffection} / 100</span>
             </div>
          </div>

          <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.95em', marginBottom: '30px', lineHeight: '1.6' }}>10回の営業を締めくくり、次の一歩へ進みます。</p>

          <button onClick={handleSeeEnding} className="vn-button-reveal" style={{ ...buttonStyle, width: '100%', maxWidth: '280px' }}>結末を見届ける</button>
        </div>
      </div>
    );
  } else if (screen === 'ENDING') {
    const finalAffection = affection[activeHeroineId];
    const finalReputation = workshopState.reputation;
    
    let endingType = "normal";
    if (finalAffection >= 80 && finalReputation >= 40) {
      endingType = "good";
    } else if (finalAffection < 40) {
      endingType = "bad";
    }

    const endingData = ENDINGS[activeHeroineId][endingType];
    
    const endingBackgroundId =
      endingData?.presentation?.backgroundId ||
      endingData?.bgId ||
      'shopInteriorService';

    const endingBackground =
      BACKGROUND_IMAGES[endingBackgroundId] ||
      BACKGROUND_IMAGES.shopInteriorService;

    const endingBackgroundSrc = getFullPath(
      (endingBackground || BACKGROUND_IMAGES.shopInteriorService).src
    );

    mainContent = (
      <div 
        style={{ ...containerStyle, position: 'relative' }}
        onClick={handleVnAreaClick}
      >
        {renderThemeStyles()}
        {/* Special Ending Background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${endingBackgroundSrc})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1
        }} />

        <div style={{ zIndex: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ ...titleStyle, marginTop: '20px' }}>{endingData.title}</h1>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', marginBottom: '20px', width: '100%' }}>
            <HeroineDisplay 
              heroine={activeHeroine} 
              type="standing" 
              size="large" 
              expression={endingData.expression || "normal"} 
            />
          </div>

          <div style={{ width: '100%', padding: '0' }}>
            <VNBox 
              ref={vnRef}
              speaker={activeHeroine.name}
              pages={endingData.pages}
              themeColor={activeHeroine.themeColor}
              speed={textSpeedMeta.delay}
              skip={shouldSkipTypewriter(isInstantTextSpeed)}
              onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'ENDING' })}
              onComplete={handleFinishGame}
            />
          </div>

          <button onClick={handleFinishGame} className="vn-button-reveal" style={{ ...buttonStyle, marginBottom: '20px', width: '100%', maxWidth: '240px' }}>タイトルへ戻る</button>
        </div>
      </div>
    );
  } else if (screen === 'QUIZ' && session) {
    const currentQuestion = session.questions[session.currentIndex];
    mainContent = (
      <div data-testid="quiz-screen" style={containerStyle}>
        {renderThemeStyles()}
        
        {/* Counter Background (M-RHYTHM-UI-0B follow-up) */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '38%',
          backgroundImage: `url(${getFullPath(BACKGROUND_IMAGES.shopInteriorService.src)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 80%',
          zIndex: 1,
          borderTop: `4px solid ${THEME.brassDark}`,
          boxShadow: '0 -10px 20px rgba(0,0,0,0.3)',
          opacity: 0.8
        }} />

        <GameHud
          screen={screen}
          routeMode={routeMode}
          onOpenLog={() => setShowLog(true)}
          onOpenOptions={() => setShowOptions(true)}
          onOpenHelp={() => setShowHelp(true)}
        />
        <header style={{ 
          ...headerStyle, 
          background: THEME.nightBlue, 
          color: THEME.sand, 
          borderBottom: `2px solid ${THEME.brass}`,
          padding: '12px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          justifyContent: 'flex-start',
          gap: '20px',
          zIndex: 10 // Above everything
        }}>
          <span style={{ fontSize: '0.9em' }}>依頼件数 {session.currentIndex + 1} / {session.questions.length}</span>
          <span style={{ fontWeight: 'bold', color: THEME.brass }}>報酬見込: {session.score} G</span>
        </header>

        <div style={{ 
          ...cardStyle, 
          maxWidth: '800px', 
          marginTop: '10px', 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-start',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          backdropFilter: 'none',
          padding: '0 20px 40px 20px', // Tighter padding, enough bottom space
          zIndex: 5 // Above counter, below header
        }}>
          <div style={{ ...customerStyle, marginBottom: '20px', justifyContent: 'flex-start' }}>
            <div style={{ 
              ...bubbleStyle, 
              width: '85%', // Fix width to ensure consistent starting position
              background: '#fff', 
              color: '#333', // Static dark text for readability on white bubble
              border: `2px solid ${currentQuestion.request.customer?.color || THEME.brassDark}`,
              borderRadius: '15px 15px 15px 0',
              padding: '18px 24px', // Slightly tighter padding
              fontSize: '1.05em', // Slightly smaller for better fit
              lineHeight: '1.5',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              textAlign: 'left'
            }}>
              <CustomerSilhouette customer={currentQuestion.request.customer} />
              <span>{currentQuestion.request.text}</span>
            </div>
          </div>
          
          <RhythmMock heroineId={activeHeroineId} themeColor={activeHeroine?.themeColor} />

          <div className="choice-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px', 
            width: '100%',
            marginTop: '35px', // Tighten gap from beat lane
            padding: '10px 0' 
          }}>
            {currentQuestion.choices.map((item, index) => {
              const isSelected = quizFeedback?.itemId === item.id;
              const feedbackClass = isSelected ? (quizFeedback.isCorrect ? 'feedback-correct' : 'feedback-wrong') : '';
              const staggerClass = `quiz-option-${index}`;
              
              // M-QUIZ-PROMPT-TUNING-1: Genre Mapping (Choice side)
              let displayChoiceName = item.name;
              if (currentQuestion.request.type === 'genre') {
                const category = item.id.split('_')[1]; // e.g. DAY from IT_DAY_SA_01
                if (category === 'DAY') displayChoiceName = `一般雑貨の${displayChoiceName}`;
                if (category === 'TRD') displayChoiceName = `貿易品の${displayChoiceName}`;
                if (category === 'RIT') displayChoiceName = `厳かな${displayChoiceName}`;
                if (category === 'ADN') displayChoiceName = `アクセサリーの${displayChoiceName}`;
              }

              return (
                <div 
                  data-testid="quiz-choice"
                  key={item.id} 
                  onClick={() => handleSelect(item.id)}
                  className={`item-card ${staggerClass} ${feedbackClass}`}
                  style={{
                    ...itemCardStyle,
                    pointerEvents: quizFeedback ? 'none' : 'auto'
                  }}
                >
                  <img 
                    src={`${import.meta.env.BASE_URL}${item.image}`.replace(/([^:])\/\//g, '$1/')} 
                    alt={item.name} 
                    style={{ ...imageStyle, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                    draggable={false}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='10'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div style={{ ...itemNameStyle, color: THEME.textDark, borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '10px', fontSize: '0.9em' }}>
                    {displayChoiceName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const renderLoadingOverlay = (message = "Loading...") => (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      color: THEME.sand,
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ fontSize: '1.2em', marginBottom: '20px', letterSpacing: '0.1em' }}>{message}</div>
      <div style={{ 
        width: '200px', 
        height: '4px', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: `${loadingProgress}%`, 
          height: '100%', 
          background: THEME.starGold, 
          transition: 'width 0.3s' 
        }} />
      </div>
      <div style={{ marginTop: '10px', fontSize: '0.8em', opacity: 0.7 }}>{loadingProgress}%</div>
    </div>
  );

  return (
    <div ref={outerWrapperRef} className="game-root" style={outerWrapperStyle}>
      {renderThemeStyles()}
      <div style={canvasContainerStyle}>
        <div style={canvasStyle}>
          {isInitialLoading && renderLoadingOverlay("星瓶堂を開店中...")}
          {isHeroineLoading && renderLoadingOverlay(`${HEROINES.find(h => h.id === previewHeroineId)?.name}を待っています...`)}
          
          <OptionsModal
            isOpen={showOptions}
            onClose={() => setShowOptions(false)}
            onReturnTitle={() => { setShowOptions(false); setScreen('START'); }}
            isAudioEnabled={isAudioEnabled}
            setIsAudioEnabled={setIsAudioEnabled}
            seVolume={seVolume}
            setSeVolume={setSeVolume}
            bgmVolume={bgmVolume}
            setBgmVolume={setBgmVolume}
            textSpeed={textSpeed}
            setTextSpeed={setTextSpeed}
            instantUnreadText={instantUnreadText}
            setInstantUnreadText={setInstantUnreadText}
            buttonStyle={buttonStyle}
            defaultAudioVolume={DEFAULT_AUDIO_VOLUME}
            textSpeedMeta={TEXT_SPEED_META}
          />
          <LogModal isOpen={showLog} onClose={() => setShowLog(false)} vnBacklog={vnBacklog} scrollRef={backlogScrollRef} />
          <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
          {showSoundTest && <SoundTest onClose={() => setShowSoundTest(false)} isAudioEnabled={isAudioEnabled} onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)} />}
          {!isInitialLoading && (
            <div key={screen} className="screen-enter">
              {mainContent || (
                <div style={containerStyle}>
                  <p>Loading...</p>
                  <button onClick={handleBackToTitle} style={buttonStyle}>タイトルへ戻る</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function HeroineDisplay({ heroine, type, size = "large", expression = "normal", noBorder = false, style = {} }) {
  const [imgError, setImgError] = useState(false);
  const assetPath = getHeroineAsset(heroine.id, type, expression);
  const fullPath = assetPath ? `${import.meta.env.BASE_URL}${assetPath}`.replace(/([^:])\/\//g, '$1/') : null;
  const isStanding = type === 'standing';
  
  const displaySize = size === 'large' 
    ? (isStanding ? 320 : 120) 
    : (size === 'medium' ? (isStanding ? 180 : 80) : (isStanding ? 120 : 60));

  const containerStyle = {
    width: isStanding ? `${displaySize * 0.75}px` : `${displaySize}px`,
    height: `${displaySize}px`,
    borderRadius: isStanding ? '16px' : '50%',
    overflow: 'hidden',
    backgroundColor: noBorder ? 'transparent' : ((heroine.themeColor || '#444') + '33'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: noBorder ? 'none' : `2px solid ${heroine.themeColor || '#ffcc00'}`,
    boxShadow: noBorder ? 'none' : (isStanding ? '0 12px 30px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.3)'),
    flexShrink: 0,
    position: 'relative',
    ...style
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: isStanding ? 'top center' : (heroine.visualConfig?.facePosition || 'center 20%'),
    display: imgError ? 'none' : 'block',
    userSelect: 'none',
    WebkitUserDrag: 'none'
  };

  if (!fullPath || imgError) {
    return (
      <div style={containerStyle}>
        <span style={{ 
          fontSize: `${displaySize * 0.4}px`, 
          fontWeight: 'bold', 
          color: heroine.themeColor || '#111' 
        }}>
          {heroine.name ? heroine.name[0] : '?'}
        </span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <img 
        src={fullPath} 
        alt={heroine.name} 
        style={imgStyle}
        draggable={false}
        onError={() => setImgError(true)}
      />
    </div>
  );
}



// Minimal Styles

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
  color: '#e2d1b1',
  fontSize: '1.4em',
  margin: '0 0 12px 0',
  textAlign: 'center',
  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
  fontWeight: 'bold'
};

const headerStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '10px',
  fontSize: '0.9em',
  color: '#e2d1b1'
};

const cardStyle = {
  width: '100%',
  padding: '12px',
  border: `1px solid ${THEME.brass}`,
  borderRadius: '8px',
  background: THEME.parchment,
  color: THEME.textDark,
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  position: 'relative',
  boxSizing: 'border-box'
};

const narrativeBoxStyle = {
  background: 'rgba(0, 0, 0, 0.75)',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '30px',
  textAlign: 'left',
  lineHeight: '1.8',
  fontSize: '1em',
  color: '#f4e9d5',
  border: `1px solid ${THEME.brass}`,
  borderLeft: `5px solid ${THEME.brass}`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(4px)'
};

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '1.1em',
  background: THEME.brass,
  color: '#1a1a1a',
  border: `2px solid ${THEME.brassDark}`,
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '20px',
  boxShadow: '0 4px 0 #8e6d2e',
  outline: 'none',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent'
};

const customerStyle = {
  marginBottom: '15px',
  display: 'flex',
  justifyContent: 'center'
};

const bubbleStyle = {
  background: '#fff',
  color: '#222',
  padding: '12px 18px',
  borderRadius: '15px',
  position: 'relative',
  fontSize: '0.95em',
  fontWeight: 'bold',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #ddd'
};

const choiceContainerStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px'
};

const itemCardStyle = {
  background: '#fff',
  padding: '15px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'transform 0.2s, background 0.2s',
  border: `1px solid ${THEME.brassDark}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const imageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '4px',
  marginBottom: '10px',
  background: '#eee'
};

const itemNameStyle = {
  fontSize: '0.9em',
  color: '#444',
  fontWeight: 'bold'
};


const apiKey = ""; // Gemini Canvas direct paste version

export default function CanvasApp() {
  return <App apiKey={apiKey} />;
}
