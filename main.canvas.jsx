import React from 'react';
import { getIsRhythmHitNow, DEFAULT_RHYTHM_BONUS_GOLD } from './ui/quiz/RhythmMock';

const { useState, useEffect, useRef } = React;
import { createQuizSession, answerQuestion } from './game/quizEngine';
import { getRankInfo } from './game/scoring';
import { resolveQuizCompletion, createPerfectQuizPayload } from './game/quizFlow';
import { getWorkshopResult, createInitialWorkshopState, applyWorkshopResult } from './game/management';
import { HEROINES, NADER, getHeroineAsset } from './data/heroines';
import { getResultExpression, getDayEndExpression } from './game/presentation';
import { WORLD, SHOP, PROTAGONIST } from './data/world';
import { TRACKS, getTrackById } from './data/tracks';
import { audioEngine } from './game/audioEngine';
import { SFX_CANDIDATES, SELECTED_SFX } from './data/sfxCandidates';
import { createInitialAffection, addAffection, calculateQuizAffectionGain } from './game/affection';
import { loadSaveData, saveGameData } from './game/saveData';
import { buildGameSavePayload, buildSettingsOnlySavePayload, resolveAutoSavePayload } from './game/savePayload';
import { resolveAutoSavePolicy, isDefaultSettings as checkIsDefaultSettings } from './game/autoSavePolicy';
import { useGameSaveStatus } from './hooks/useGameSaveStatus';
import { loadDebugModeEnabled, saveDebugModeEnabled, loadAutoSkipQuizEnabled, saveAutoSkipQuizEnabled, loadDebugUnlockAllEnabled } from './game/debugAssistStorage';
import { checkNewEventUnlock, getEventPages, getRouteText, getNextDailyTalk, resolveHeroineSelectionEvent, resolveEventCloseActions } from './game/eventSystem';
import { prepareIntroSequence, prepareResultTalkSequence, prepareDayEndTalkSequence } from './game/introFlow';
import { AFFECTION_EVENTS } from './data/affectionEvents';
import { BACKGROUND_IMAGES, STILL_IMAGES } from './data/imageAssets';
import { ENDINGS } from './data/endings';
import { SFX } from './data/sfx';
import itemsData from './data/generated/items.json';
import { COLOR_BY_ID } from './data/principles';
import { GENRE_BY_ID, ITEM_TYPE_BY_ID } from './data/itemTypes';
import { resolveTimePhase, TIME_PHASES } from './game/timePhase';



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

const CustomerSilhouette = ({ customer }) => {
  if (!customer) return null;
  return (
    <div className="customer-silhouette" style={{ 
      borderColor: customer.color || 'rgba(218, 180, 96, 0.45)'
    }} />
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

  const isLongHistory = routeMode === 'long_history';
  const hudBtnStyle = {
    background: isLongHistory ? 'rgba(255, 220, 235, 0.96)' : 'rgba(255, 255, 255, 0.92)',
    border: `2px solid ${THEME.brass}`,
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
  return ['PROLOGUE', 'INTRO', 'EVENT', 'ENDING'].includes(screen);
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
            <div style={{ width: '100%', maxWidth: '330px', maxHeight: '440px', aspectRatio: '3/4', background: '#000', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${THEME.brass}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
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
            <div style={{ width: '100%', maxWidth: '800px', height: '140px', overflowX: 'auto', overflowY: 'hidden', padding: '8px 0', scrollbarWidth: 'thin' }}>
              <div style={{ display: 'flex', gap: '10px', width: 'max-content' }}>
                {bgList.map((item, idx) => (
                  <div
                    data-testid="visual-test-thumbnail"
                    key={item.id}
                    onClick={() => setBgTestIndex(idx)}
                    style={{
                      width: '84px',
                      height: '112px',
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
            <div style={{ width: '100%', maxWidth: '330px', maxHeight: '440px', aspectRatio: '3/4', background: '#000', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${THEME.brass}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
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
            <div style={{ width: '100%', maxWidth: '800px', height: '140px', overflowX: 'auto', overflowY: 'hidden', padding: '8px 0', scrollbarWidth: 'thin' }}>
              <div style={{ display: 'flex', gap: '10px', width: 'max-content' }}>
                {stillList.map((item, idx) => (
                  <div
                    data-testid="visual-test-thumbnail"
                    key={item.id}
                    onClick={() => setStillTestIndex(idx)}
                    style={{
                      width: '84px',
                      height: '112px',
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
    backfaceVisibility: 'hidden',
    filter: 'blur(0.12px) contrast(0.99)'
  };

  const thumbnailStyle = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: `1px solid ${THEME.brass}`,
    flexShrink: 0,
    imageRendering: 'auto',
    backfaceVisibility: 'hidden',
    filter: 'blur(0.12px) contrast(0.99)'
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
  renderThemeStyles,
  debugModeEnabled,
  onToggleDebug
}) => {
  const [logoTaps, setLogoTaps] = React.useState(0);
  const logoTapTimer = React.useRef(null);

  const handleLogoTap = () => {
    setLogoTaps(prev => {
      const next = prev + 1;
      if (next >= 5) {
        onToggleDebug();
        audioEngine.playSfx('uiConfirmChime');
        return 0;
      }
      return next;
    });

    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => setLogoTaps(0), 1000);
  };
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
    boxSizing: 'border-box',
    backgroundImage: `linear-gradient(rgba(26, 42, 58, 0.4), rgba(26, 42, 58, 0.4)), url(${import.meta.env.BASE_URL}images/ui/title.png)`.replace(/([^:])\/\//g, '$1/'),
    backgroundSize: 'cover',
    backgroundPosition: 'center'
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
      
      <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <h1 
          onClick={handleLogoTap}
          style={{ ...titleStyle, fontSize: '2.2em', margin: '0 0 5px 0', cursor: 'pointer', userSelect: 'none' }}
        >
          {SHOP.name}
          {debugModeEnabled && (
            <span style={{ fontSize: '10px', color: THEME.starGold, verticalAlign: 'middle', marginLeft: '5px' }}>[DEBUG]</span>
          )}
        </h1>
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
  const handleAreaClick = (e) => {
    onVnAreaClick(e);
  };

  return (
    <div 
      data-testid="prologue-screen" 
      style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}
      onClick={handleAreaClick}
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
            onComplete={onAdvanceToHeroineSelect}
          />
        </div>
      </div>
    </div>
  );
};



// --- Inlined: IntroScreen ---

const IntroScreen = ({
  activeHeroine,
  activeDailyTalk,
  activeGreeting,
  day = 1,
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
  cardStyle,
  buttonStyle,
  narrativeBoxStyle
}) => {
  const [heroineOpacity, setHeroineOpacity] = React.useState(0);
  const [heroineExpression, setHeroineExpression] = React.useState('normal');
  const [nadirOpacity, setNadirOpacity] = React.useState(0);
  const visibleRef = React.useRef(false);

  const TRANSITION_CONFIG = {
    arrival: { delay: 0, sfx: 'quizWrongSandTap', volumeScale: 0.5 },
    departure: { delay: 500, sfx: 'quizWrongSandTap', volumeScale: 0.5 }
  };

  const triggerTransition = (type, action) => {
    const config = TRANSITION_CONFIG[type];
    if (!config) {
      action();
      return;
    }

    setTimeout(() => {
      action();
      if (config.sfx && config.volumeScale !== undefined) {
        audioEngine.playSfx(config.sfx, config.volumeScale);
      } else if (config.sfx) {
        audioEngine.playSfx(config.sfx);
      }
    }, config.delay);
  };

  // Build the unified narrative flow
  const buildPages = () => {
    const pages = [];
    const hId = activeHeroine.id;
    const greet = activeGreeting || { monologue: "...", heroineReactions: { [hId]: { arrival: "...", response: "..." } } };
    const reactions = greet.heroineReactions[hId] || { arrival: "こんにちは", response: "いらっしゃい" };

    // 1. Monologue (Nader)
    pages.push({
      speakerId: 'nader',
      speaker: 'ナーディル',
      text: typeof greet.monologue === 'function' ? greet.monologue(activeHeroine) : greet.monologue
    });

    // 2. Arrival (Heroine)
    pages.push({
      speakerId: hId,
      speaker: activeHeroine.name,
      text: typeof reactions.arrival === 'function' ? reactions.arrival(activeHeroine) : reactions.arrival
    });

    // 3. Initial Response (Nader)
    pages.push({
      speakerId: 'nader',
      speaker: 'ナーディル',
      text: typeof reactions.response === 'function' ? reactions.response(activeHeroine) : reactions.response
    });

    // 4. Daily Talks (Merged work + personal topics)
    if (activeDailyTalk && activeDailyTalk.pages) {
      activeDailyTalk.pages.forEach(page => {
        // Ensure speakerId is mapped correctly
        let inferredId = page.speakerId;
        if (!inferredId) {
          if (page.speaker === 'ナーディル') inferredId = 'nader';
          else if (page.speaker === activeHeroine.name) inferredId = hId;
        }
        pages.push({ ...page, speakerId: inferredId });
      });
    }

    // 5. Farewell (Heroine)
    pages.push({
      speakerId: hId,
      speaker: activeHeroine.name,
      text: "「それじゃ、また営業が終わった頃に。今日の商い、期待しているわね」"
    });

    // 6. Start Business (Nader)
    pages.push({
      speakerId: 'nader',
      speaker: 'ナーディル',
      text: "ああ、ありがとう。……よし、星瓶堂を開けよう。"
    });

    return pages;
  };

  const combinedPages = buildPages();

  React.useEffect(() => {
    if (combinedPages[0]?.speakerId === 'nader') {
      setNadirOpacity(1);
    }
  }, []);

  const handlePageChange = (index) => {
    const page = combinedPages[index];
    const isHeroinePage = page?.speakerId === activeHeroine.id;
    const isNadirPage = page?.speakerId === 'nader';
    
    if (isNadirPage) {
      if (!visibleRef.current) {
        setNadirOpacity(1);
        setHeroineOpacity(0);
      }
    } else if (isHeroinePage) {
      setNadirOpacity(0);
    }

    if (isHeroinePage && page?.expression) {
      setHeroineExpression(page.expression);
    }

    if (isHeroinePage && !visibleRef.current) {
      triggerTransition('arrival', () => {
        setHeroineOpacity(1);
        visibleRef.current = true;
      });
    }
  };

  const handleInternalPageComplete = (data) => {
    onPageComplete(data);
    const isFarewellPage = data.pageIndex === combinedPages.length - 2;
    if (isFarewellPage && visibleRef.current) {
       triggerTransition('departure', () => {
         setHeroineOpacity(0);
         visibleRef.current = false;
       });
    }
  };

  return (
    <div 
      data-testid="intro-screen" 
      style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}
      onClick={onVnAreaClick}
    >
      {renderThemeStyles()}
      {renderBackground(screen)}
      
      <div style={{ 
        position: 'absolute', 
        bottom: '8%', 
        left: 0,
        width: '100%',
        zIndex: 2, 
        pointerEvents: 'none', 
        height: '77%',
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'center',
        filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.3))'
      }}>
        <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <HeroineDisplay 
            heroine={NADER} 
            type="standing" 
            size="large" 
            expression="normal" 
            noBorder={true}
            style={{ 
              height: '100%', width: 'auto', boxShadow: 'none',
              position: 'absolute',
              opacity: nadirOpacity, 
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
          <HeroineDisplay 
            heroine={activeHeroine} 
            type="standing" 
            size="large" 
            expression={heroineExpression} 
            noBorder={true}
            style={{ 
              height: '100%', width: 'auto', boxShadow: 'none',
              position: 'absolute',
              opacity: heroineOpacity,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        </div>
      </div>

      <div style={{ zIndex: 5, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader
        timePhase={TIME_PHASES.PRE_OPEN}
        title={`${activeHeroine.name}との語らい`}
        onOpenLog={onOpenLog}
        onOpenOptions={onOpenOptions}
        onOpenHelp={onOpenHelp}
        routeMode={routeMode}
        screen={screen}
      />
      <div style={{ flex: '1 1 auto' }} />
      </div>

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
        <div style={{ 
          width: '100%', 
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          <VNBox
            ref={vnRef}
            pages={combinedPages}
            hint="客の好みに合わせて素材を選ぼう"
            themeColor={THEME.brass}
            speed={textSpeedMeta.delay}
            skip={shouldSkipTypewriter(isInstantTextSpeed)}
            getFaceIcon={getFaceIcon}
            onPageChange={handlePageChange}
            onPageComplete={handleInternalPageComplete}
            onComplete={() => onBeginService(activeDailyTalk?.id || null)}
          />
        </div>
      </div>
    </div>
  );
};



// --- Inlined: ResultScreen ---

/**
 * ResultScreen Component
 * All main elements in one centered container.
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
  const totalQuestions = session.questions.length;
  const comment = getResultComment(activeHeroine.id, correctCount, totalQuestions);

  return (
    <div
      data-testid="result-screen"
      style={{ ...containerStyle, position: 'relative' }}
    >
      {renderThemeStyles && renderThemeStyles()}
      {renderBackground && renderBackground(screen)}

      {/* Content layer */}
      <div style={{
        zIndex: 10,
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 8px'
      }}>
        <GameHud
          screen={screen}
          routeMode={routeMode}
          onOpenLog={onOpenLog}
          onOpenOptions={onOpenOptions}
          onOpenHelp={onOpenHelp}
        />

        {/* Title */}
        <h1 style={{
          ...titleStyle,
          margin: '40px 0 0 4px',
          color: THEME.parchment,
          fontSize: '1.15em',
          textAlign: 'left',
          zIndex: 10
        }}>
          今回の営業記録
        </h1>

        {/* Center pack: all main elements */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          minWidth: 0
        }}>
          {/* Heroine Standing + Speech Bubble */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '4px',
            justifyContent: 'center',
            minHeight: '250px',
            overflow: 'visible'
          }}>
            {HeroineDisplay && (
              <HeroineDisplay
                heroine={activeHeroine}
                type="standing"
                size="large"
                expression={getResultExpression(correctCount)}
                noBorder={true}
                objectPosition="center center"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                  maxHeight: 'none',
                  overflow: 'visible',
                  transform: 'translateX(12px) scale(0.88)',
                  transformOrigin: 'center bottom'
                }}
              />
            )}

            {/* Speech Bubble */}
            <div style={{
              marginTop: '0',
              background: 'rgba(244, 233, 213, 0.92)',
              border: `1.5px solid ${THEME.brass}`,
              borderRadius: '12px',
              padding: '12px 10px',
              position: 'relative',
              width: '84px',
              minHeight: '168px',
              maxHeight: '190px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Bubble tail (pointing left toward heroine) */}
              <div style={{
                position: 'absolute',
                left: '-8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '0',
                height: '0',
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: `8px solid ${THEME.brass}`
              }} />
              <div style={{
                position: 'absolute',
                left: '-5px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '0',
                height: '0',
                borderTop: '7px solid transparent',
                borderBottom: '7px solid transparent',
                borderRight: '7px solid rgba(244, 233, 213, 0.92)'
              }} />
              <div style={{
                fontSize: '0.86em',
                color: THEME.textDark,
                lineHeight: '1.9',
                fontStyle: 'normal',
                fontWeight: 600,
                letterSpacing: '0.04em',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                maxHeight: '178px',
                overflow: 'hidden',
                fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", serif'
              }}>
                {comment}
              </div>
            </div>
          </div>

          {/* Score Panel */}
          <div style={{
            ...cardStyle,
            borderRadius: '10px',
            border: `2px solid ${THEME.brass}`,
            background: 'rgba(244, 233, 213, 0.98)',
            padding: '12px 16px',
            marginTop: '-12px',
            width: '94%',
            maxWidth: '340px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.4em',
              fontWeight: '900',
              color: THEME.brassDark,
              lineHeight: 1.2
            }}>
              {session.score} 点
            </div>
            <div style={{
              fontSize: '0.75em',
              color: '#666',
              marginBottom: '6px'
            }}>
              依頼 {session.questions.length} 件中 {correctCount} 件達成
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              background: 'rgba(0,0,0,0.04)',
              padding: '6px 4px',
              borderRadius: '6px',
              marginBottom: '6px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65em', color: '#888' }}>評判</div>
                <div style={{
                  fontSize: '0.95em',
                  fontWeight: 'bold',
                  color: mgmt.reputation >= 0 ? THEME.oasisTeal : '#844'
                }}>
                  {mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65em', color: '#888' }}>売上</div>
                <div style={{
                  fontSize: '0.95em',
                  fontWeight: 'bold',
                  color: THEME.brassDark
                }}>
                  {mgmt.sales}G
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65em', color: '#888' }}>満足度</div>
                <div style={{
                  fontSize: '0.95em',
                  fontWeight: 'bold',
                  color: mgmt.satisfaction >= 0 ? THEME.oasisTeal : '#844'
                }}>
                  {mgmt.satisfaction >= 0 ? `+${mgmt.satisfaction}` : mgmt.satisfaction}
                </div>
              </div>
            </div>

            <div style={{
              fontSize: '0.85em',
              fontWeight: 'bold',
              color: activeHeroine.themeColor,
              padding: '3px 10px',
              background: `${activeHeroine.themeColor}15`,
              borderRadius: '999px',
              display: 'inline-block'
            }}>
              {activeHeroine.name}との縁 +{lastAffectionGain}
            </div>
          </div>

          {/* Next Day Button */}
          <button
            data-testid="day-end-next"
            onClick={handleEndDay}
            className="vn-button-reveal"
            style={{
              ...buttonStyle,
              width: '80%',
              maxWidth: '240px'
            }}
          >
            次の営業へ
          </button>
        </div>
      </div>
    </div>
  );
};



// --- Inlined: QuizScreen ---

function QuizScreen({
  quizState,
  quizActions,
  quizHelpers,
  quizStyles,
}) {
  const {
    session,
    activeHeroineId,
    activeHeroine,
    quizFeedback,
    routeMode,
    screen,
  } = quizState;

  const {
    onOpenLog,
    onOpenOptions,
    onOpenHelp,
    onSelectChoice,
  } = quizActions;

  const {
    renderThemeStyles,
    getFullPath,
  } = quizHelpers;

  const {
    containerStyle,
    headerStyle,
    cardStyle,
    customerStyle,
    bubbleStyle,
    itemCardStyle,
    imageStyle,
    itemNameStyle,
  } = quizStyles;

  if (!session) return null;
  const currentQuestion = session.questions[session.currentIndex];

  return (
    <div data-testid="quiz-screen" style={containerStyle}>
      {renderThemeStyles()}

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${getFullPath(BACKGROUND_IMAGES.shopInteriorService.src)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 1,
        opacity: 0.8
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.2)',
        zIndex: 2
      }} />

      <QuizHeader
        screen={screen}
        routeMode={routeMode}
        onOpenLog={onOpenLog}
        onOpenOptions={onOpenOptions}
        onOpenHelp={onOpenHelp}
        headerStyle={headerStyle}
        session={session}
      />

      <div style={{
        ...cardStyle,
        maxWidth: '800px',
        marginTop: '5px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        backdropFilter: 'none',
        padding: '0 20px 20px 20px',
        zIndex: 5
      }}>
        <QuizRequestCard
          currentQuestion={currentQuestion}
          customerStyle={customerStyle}
          bubbleStyle={bubbleStyle}
        />

        <div className="quiz-rhythm-lane" style={{
          width: 'calc(100% + 40px)',
          margin: '8px -20px 6px',
          background: 'rgba(26, 42, 58, 0.6)',
          borderTop: `1px solid ${THEME.brass}44`,
          borderBottom: `1px solid ${THEME.brass}44`,
          padding: '4px 0',
          position: 'relative'
        }}>
          <RhythmMock
            heroineId={activeHeroineId}
            themeColor={activeHeroine?.themeColor}
            noteIntervalMs={500}
            judgmentWindowMs={140}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '0.76em',
              fontWeight: '700',
              color: THEME.starGold,
              textShadow: `0 0 8px ${THEME.starGold}66`,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              opacity: quizFeedback?.rhythmBonus > 0 ? 1 : 0,
              transition: 'opacity 160ms ease'
            }}
          >
            リズム好機 +{quizFeedback?.rhythmBonus || 0}G
          </div>
        </div>

        <QuizChoiceList
          choices={currentQuestion.choices}
          quizFeedback={quizFeedback}
          onSelectChoice={onSelectChoice}
          itemCardStyle={itemCardStyle}
          imageStyle={imageStyle}
          itemNameStyle={itemNameStyle}
          requestType={currentQuestion.request.type}
        />
      </div>
    </div>
  );
}


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
const VNBox = forwardRef(({ text, pages, speaker, hint, themeColor, onComplete, onPageChange, onPageComplete, speed = 30, skip = false, hideSkip = false, hideNext = false, getFaceIcon }, ref) => {
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
  const [isFadingOut, setIsFadingOut] = useState(false);
  const loggedPagesRef = useRef(new Set());

  const markPageComplete = (index = pageIndex, text = currentText) => {
    if (!text) return;
    const key = `${index}:${text}`;
    if (loggedPagesRef.current.has(key)) return;
    loggedPagesRef.current.add(key);
    onPageComplete?.({ 
      speaker: currentSpeaker, 
      speakerId: currentSpeakerId, 
      expression: currentExpression,
      text, 
      pageIndex: index 
    });
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
    if (isFadingOut) return; // Prevent clicks during skip fade

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
    if (isFadingOut) return;

    // Log all remaining pages in this block before skipping to ensure history integrity
    pageList.slice(pageIndex).forEach((page, offset) => {
      const idx = pageIndex + offset;
      const text = typeof page === 'object' ? (page?.text || "") : (page || "");
      const speakerLabel = typeof page === 'object' && page?.speaker !== undefined ? page.speaker : speaker;
      const speakerId = typeof page === 'object' ? page?.speakerId : null;
      const expr = typeof page === 'object' ? (page?.expression || 'normal') : 'normal';

      const key = `${idx}:${text}`;
      if (!text || loggedPagesRef.current.has(key)) return;
      loggedPagesRef.current.add(key);

      onPageComplete?.({ 
        speaker: speakerLabel || "", 
        speakerId: speakerId || null, 
        expression: expr || 'normal',
        text, 
        pageIndex: idx 
      });
    });

    // Instant Skip with Black Fade
    setIsFadingOut(true);
    audioEngine.playSfx('uiTapBottle');
    
    // Immediate completion after short fade
    setTimeout(() => {
      onComplete?.();
    }, 300);
  };

  useImperativeHandle(ref, () => ({
    advance: () => handleClick(),
    skip: () => handleSkipBlock()
  }));

  const facePath = currentSpeakerId && getFaceIcon ? getFaceIcon(currentSpeakerId, 'face', currentExpression) : null;

  // B-2: Face Icon transition logic
  const [displayFace, setDisplayFace] = useState(facePath);
  const [prevFace, setPrevFace] = useState(null);
  const [isFaceLoaded, setIsFaceLoaded] = useState(false);

  useEffect(() => {
    if (facePath !== displayFace) {
      setPrevFace(displayFace);
      setDisplayFace(facePath);
      setIsFaceLoaded(false); // Reset load state
      const timer = setTimeout(() => setPrevFace(null), 200);
      return () => clearTimeout(timer);
    }
  }, [facePath]);

  const headerButtonStyle = {
    padding: '6px 20px',
    borderRadius: '999px',
    background: 'rgba(12, 25, 38, 0.95)',
    border: `1px solid ${themeColor || THEME.brass}77`,
    color: themeColor || THEME.brass,
    fontSize: '0.85em',
    fontWeight: '900',
    letterSpacing: '0.1em',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'uppercase',
    userSelect: 'none'
  };

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
        padding: currentSpeaker ? '42px 24px 28px 24px' : '24px 24px 28px 24px', // Increased top padding to avoid overlap
        borderRadius: '12px 12px 0 0',
        cursor: 'pointer',
        color: THEME.parchment,
        textAlign: 'left',
        position: 'relative',
        bottom: '12px',
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
      {/* VNBox Header Row (Ensures perfect symmetry between Nameplate and SKIP) */}
      <div style={{
        position: 'absolute',
        top: '-45px', // Fixed header position
        left: 0,
        width: '100%',
        height: '60px', // Matches Face Icon height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        zIndex: 20
      }}>
        {/* Left Side: Speaker Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          pointerEvents: 'none'
        }}>
          {currentSpeaker && displayFace && (
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: `2px solid ${themeColor || THEME.brass}`,
              background: 'rgba(12, 25, 38, 0.95)',
              flexShrink: 0,
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              position: 'relative',
              pointerEvents: 'auto'
            }}>
              {/* Prev Face (Fade Out) */}
              {prevFace && (
                <img 
                  src={prevFace} 
                  alt="prev face" 
                  style={{ 
                    width: '110%', 
                    height: '110%', 
                    objectFit: 'cover',
                    objectPosition: 'center 20%',
                    position: 'absolute',
                    top: '-5%',
                    left: '-5%',
                    zIndex: 1,
                    animation: 'vn-fade-out 0.2s forwards',
                    imageRendering: 'auto',
                    backfaceVisibility: 'hidden',
                    filter: 'blur(0.12px) contrast(0.99)'
                  }}
                />
              )}
              {/* Current Face (Fade In) */}
              <img 
                key={displayFace} 
                src={displayFace} 
                alt={currentSpeaker} 
                onLoad={() => setIsFaceLoaded(true)}
                style={{ 
                  width: '110%', 
                  height: '110%', 
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  WebkitUserDrag: 'none',
                  userSelect: 'none',
                  position: 'absolute',
                  top: '-5%',
                  left: '-5%',
                  zIndex: 2,
                  opacity: isFaceLoaded ? 1 : 0,
                  animation: isFaceLoaded ? 'vn-fade-in 0.2s ease' : 'none',
                  imageRendering: 'auto',
                  backfaceVisibility: 'hidden',
                  filter: 'blur(0.12px) contrast(0.99)'
                }}
                draggable={false}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                pointerEvents: 'none',
                zIndex: 3
              }} />
            </div>
          )}
          
          {currentSpeaker && (
            <div 
              key={currentSpeaker}
              style={{ 
                ...headerButtonStyle,
                pointerEvents: 'auto',
                animation: 'vn-fade-in 0.2s ease'
              }}
            >
              {currentSpeaker}
            </div>
          )}
        </div>

        {/* Right Side: Operations */}
        {!hideSkip && (
          <div 
            onClick={handleSkipBlock}
            onMouseEnter={() => setHoverSkip(true)}
            onMouseLeave={() => setHoverSkip(false)}
            style={{
              ...headerButtonStyle,
              background: hoverSkip ? (themeColor || THEME.brass) : 'rgba(12, 25, 38, 0.95)',
              color: hoverSkip ? '#0c1926' : (themeColor || THEME.brass),
              border: `1px solid ${hoverSkip ? (themeColor || THEME.brass) : (themeColor || THEME.brass) + '77'}`,
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          >
            SKIP
          </div>
        )}
      </div>

      {/* Instant Skip Fade Overlay */}
      {isFadingOut && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'black',
          zIndex: 9999,
          animation: 'vn-fade-in 0.3s forwards',
          pointerEvents: 'all'
        }} />
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
      {isComplete && !hideNext && (
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
        @keyframes vn-fade-in { from { opacity: 0; } to { opacity: 1; } }
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



// --- Inlined: DebugPanel ---

/**
 * DebugPanel: Story Assist & Development Tools
 * 
 * Features:
 * - Route Mode toggle
 * - Affection/Intimacy setter
 * - Event jumping (Normal / Long History verification)
 * - Auto Skip Quiz (Story Assist)
 * - Save/Status management
 */
function DebugPanel({ 
  routeMode, 
  setRouteMode, 
  affection, 
  setAffection, 
  seenEventIds, 
  setSeenEventIds,
  onTriggerEvent,
  autoSkipQuiz,
  setAutoSkipQuiz,
  onClose 
}) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <div 
        onClick={() => setExpanded(true)}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: THEME.starGold,
          padding: '4px 8px',
          borderRadius: '4px',
          border: `1px solid ${THEME.starGold}`,
          fontSize: '10px',
          cursor: 'pointer',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}
      >
        DEBUG / ASSIST
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.95)',
      color: '#fff',
      padding: '16px',
      zIndex: 9999,
      overflowY: 'auto',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: `1px solid ${THEME.brass}`, 
        paddingBottom: '8px',
        flexShrink: 0
      }}>
        <h2 style={{ color: THEME.starGold, margin: 0, fontSize: '0.9em', letterSpacing: '0.05em' }}>DEBUG / ASSIST</h2>
        <button 
          onClick={() => setExpanded(false)} 
          style={{ 
            background: THEME.brass, 
            color: THEME.textDark,
            border: 'none', 
            padding: '4px 8px', 
            borderRadius: '3px', 
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 'bold',
            flexShrink: 0
          }}
        >
          MINIMIZE
        </button>
      </div>

      {/* Global Mode */}
      <section>
        <div style={{ color: THEME.brass, marginBottom: '5px' }}>[ GLOBAL MODE ]</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setRouteMode('normal')}
            style={{ 
              flex: 1, 
              padding: '8px', 
              background: routeMode === 'normal' ? THEME.brass : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            NORMAL
          </button>
          <button 
            onClick={() => setRouteMode('long_history')}
            style={{ 
              flex: 1, 
              padding: '8px', 
              background: routeMode === 'long_history' ? THEME.starGold : '#333',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            LONG HISTORY
          </button>
        </div>
      </section>

      {/* Story Assist */}
      <section>
        <div style={{ color: THEME.brass, marginBottom: '5px' }}>[ STORY ASSIST ]</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px' }}>
          <input 
            type="checkbox" 
            checked={autoSkipQuiz} 
            onChange={(e) => setAutoSkipQuiz(e.target.checked)}
          />
          <span>Auto Complete Quiz (Story Focus)</span>
        </label>
      </section>

      {/* Heroine Management */}
      <section>
        <div style={{ color: THEME.brass, marginBottom: '5px' }}>[ HEROINE & EVENTS ]</div>
        {HEROINES.map(h => (
          <div key={h.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #444', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{h.name}</div>
            
            {/* Affection Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span>Aff: {affection[h.id]}</span>
              <input 
                type="range" min="0" max="100" 
                value={affection[h.id]} 
                onChange={(e) => setAffection(prev => ({ ...prev, [h.id]: parseInt(e.target.value) }))}
                style={{ flex: 1 }}
              />
            </div>

            {/* Event Jumps */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {['_20', '_climax'].map(suffix => {
                const eventId = `${h.id}${suffix}`;
                const ev = (AFFECTION_EVENTS[h.id] || []).find(e => e.id === eventId);
                if (!ev) return null;
                return (
                  <button 
                    key={eventId}
                    onClick={() => onTriggerEvent(ev)}
                    style={{ 
                      fontSize: '10px', 
                      padding: '4px 8px', 
                      background: '#444', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '2px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Jump {suffix}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Flags */}
      <section>
        <div style={{ color: THEME.brass, marginBottom: '5px' }}>[ FLAGS ]</div>
        <div style={{ fontSize: '10px', background: '#222', padding: '5px', maxHeight: '100px', overflowY: 'auto', marginBottom: '5px' }}>
          Seen: {seenEventIds.join(', ') || '(none)'}
        </div>
        <button 
          onClick={() => setSeenEventIds([])}
          style={{ width: '100%', padding: '5px', background: '#622', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          RESET SEEN FLAGS
        </button>
      </section>

      <button 
        onClick={() => setExpanded(false)}
        style={{ marginTop: 'auto', padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        BACK TO GAME
      </button>
    </div>
  );
}


// --- Inlined: ScreenHeader ---

/**
 * ScreenHeader Component
 * Common header layout for all screens.
 * Left: TimePhaseBadge, Center: Title, Right: GameHud buttons
 */
const ScreenHeader = ({
  timePhase,
  title,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  routeMode,
  screen
}) => {
  const isHudVisible = !['ENDING', 'FINAL_RESULT', 'VISUAL_TEST', 'SOUND_TEST'].includes(screen);
  const isLongHistory = routeMode === 'long_history';
  
  const hudBtnStyle = {
    background: isLongHistory ? 'rgba(255, 220, 235, 0.96)' : 'rgba(255, 255, 255, 0.92)',
    border: `2px solid ${THEME.brass}`,
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

  const phase = timePhase && TIME_PHASES[timePhase.key?.toUpperCase()] ? TIME_PHASES[timePhase.key.toUpperCase()] : timePhase;
  const showBadge = phase && phase.key !== 'none';

  return (
    <div style={{
      position: 'absolute',
      top: '8px',
      left: '8px',
      right: '8px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      minHeight: '40px'
    }}>
      {/* Left: TimePhaseBadge */}
      <div style={{ flexShrink: 0 }}>
        {showBadge && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              background: `rgba(12, 25, 38, 0.9)`,
              border: `1px solid ${phase.color}99`,
              borderRadius: '999px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              maxWidth: '100px',
              pointerEvents: 'none',
              userSelect: 'none',
              fontSize: '0.7em'
            }}
          >
            {phase.icon && (
              <span style={{ fontSize: '1em', lineHeight: 1 }}>{phase.icon}</span>
            )}
            <span
              style={{
                fontWeight: 'bold',
                color: phase.color,
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}
            >
              {phase.label}
            </span>
          </div>
        )}
      </div>

      {/* Center: Title */}
      {title && (
        <h1 style={{
          color: '#e2d1b1',
          fontSize: '1.15em',
          margin: 0,
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          fontWeight: 'bold',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {title}
        </h1>
      )}

      {/* Right: GameHud buttons */}
      {isHudVisible && (
        <div style={{ flexShrink: 0, display: 'flex', gap: '6px' }}>
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
      )}
    </div>
  );
};



// --- Inlined: TimePhaseBadge ---

/**
 * TimePhaseBadge Component
 * Displays the current time phase (morning/opening/closing/night) in the top-left corner.
 */
const TimePhaseBadge = ({ timePhase }) => {
  if (!timePhase || timePhase.key === 'none') {
    return null;
  }

  const phase = TIME_PHASES[timePhase.key.toUpperCase()] || timePhase;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px',
        background: `rgba(12, 25, 38, 0.9)`,
        border: `1px solid ${phase.color}99`,
        borderRadius: '999px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        maxWidth: '100px',
        pointerEvents: 'none',
        userSelect: 'none',
        fontSize: '0.7em'
      }}
    >
      {phase.icon && (
        <span style={{ fontSize: '1em', lineHeight: 1 }}>{phase.icon}</span>
      )}
      <span
        style={{
          fontWeight: 'bold',
          color: phase.color,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap'
        }}
      >
        {phase.label}
      </span>
    </div>
  );
};



function App() {
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState('START');
  const [activeHeroineId, setActiveHeroineId] = useState('hakima');
  const [routeMode, setRouteMode] = useState('normal');
  const [previewHeroineId, setPreviewHeroineId] = useState('hakima');
  const [workshopState, setWorkshopState] = useState(createInitialWorkshopState());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isAudioGated, setIsAudioGated] = useState(true);
  const [showSoundTest, setShowSoundTest] = useState(false);
  const { hasSave, setHasSave, refreshHasSave, clearSaveAndRefresh } = useGameSaveStatus();
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
  
  // DEBUG Mode (M-GALLERY-TEST-UNLOCK-ALL)
  const [isUnlockAllDebug] = useState(() => loadDebugUnlockAllEnabled());

  // Persistent Debug/Assist Mode (M-DEBUG-PANEL-PERSISTENCE)
  const [debugModeEnabled, setDebugModeEnabled] = useState(() => loadDebugModeEnabled());

  const [autoSkipQuiz, setAutoSkipQuiz] = useState(() => loadAutoSkipQuizEnabled());

  // Sync debug states to localStorage
  useEffect(() => {
    saveDebugModeEnabled(debugModeEnabled);
  }, [debugModeEnabled]);

  useEffect(() => {
    saveAutoSkipQuizEnabled(autoSkipQuiz);
  }, [autoSkipQuiz]);

  // Auto Skip Quiz Logic (M-DEBUG-AUTO-SKIP-QUIZ)
  useEffect(() => {
    if (screen === 'QUIZ' && autoSkipQuiz && session && !debugAutoSkipAppliedRef.current) {
      debugAutoSkipAppliedRef.current = true;
      // Force perfect score and proceed to result using shared logic
      const timer = setTimeout(() => {
        const totalCount = session.questions.length;
        const result = createPerfectQuizPayload(
          totalCount,
          activeHeroineId,
          affection[activeHeroineId] || 0,
          seenEventIds,
          routeMode
        );
        applyQuizResultState(result);
      }, 500);
      return () => clearTimeout(timer);
    }
    if (screen !== 'QUIZ') {
      debugAutoSkipAppliedRef.current = false;
    }
  }, [screen, autoSkipQuiz, session]);
  
  // Affection / Intimacy State
  const [affection, setAffection] = useState(() => 
    createInitialAffection(HEROINES.map(h => h.id))
  );
  const [lastAffectionGain, setLastAffectionGain] = useState(0);

  // Quiz Interaction Feedback (M9-3)
  const [quizFeedback, setQuizFeedback] = useState(null); // { itemId, isCorrect }

  // Event State
  const [seenEventIds, setSeenEventIds] = useState([]);
  const [seenTalkIds, setSeenTalkIds] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeDailyTalk, setActiveDailyTalk] = useState(null);
  const [eventHeroineExpression, setEventHeroineExpression] = useState('normal');
  const [eventSpeakerId, setEventSpeakerId] = useState(null);
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [eventBackgroundOverride, setEventBackgroundOverride] = useState(null);
  const [activeGreeting, setActiveGreeting] = useState(null);
  const [dailyTalkNextScreen, setDailyTalkNextScreen] = useState(null); // M-SCENARIO-DAILYTALK-RUNTIME-1: Track next screen after DailyTalk
  const [dailyTalkCurrentPage, setDailyTalkCurrentPage] = useState(0); // Track current page index for expression sync
  const [currentTimePhase, setCurrentTimePhase] = useState(TIME_PHASES.NONE); // M-TIME-PHASE-UI-1: Current time phase
  const [bgTransitionPhase, setBgTransitionPhase] = useState("idle"); // M-EVENT-PRESENTATION-FIX-2: "idle" | "covering" | "covered" | "revealing"
  const [eventCurrentPageIndex, setEventCurrentPageIndex] = useState(0); // M-EVENT-PRESENTATION-FIX-1: Track current page for heroine visibility

  // --- Asset Loading State (M8-28) ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isHeroineLoading, setIsHeroineLoading] = useState(false);

  const outerWrapperRef = useRef(null);
  const vnRef = useRef(null);
  const debugAutoSkipAppliedRef = useRef(false);
  const memoriesScrollPositionRef = useRef(0); // M-MEMORIES-UX-POLISH-1-FIX-1: Store scroll position for MEMORIES screen
  const prevEventBackgroundRef = useRef(null); // M-EVENT-PRESENTATION-FIX-1: Track previous background for fallback

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
      setSeenTalkIds(data.seenTalkIds || []);
    }
  }, []);

  // M-UI-AUDIO-START-GATE: Ensure gate is open if we start on a non-START screen
  useEffect(() => {
    if (screen !== 'START') {
      setIsAudioGated(false);
    }
  }, [screen]);

  // Reset expression when activeEvent changes
  useEffect(() => {
    if (activeEvent) {
      setEventHeroineExpression(activeEvent.expression || 'normal');
    }
  }, [activeEvent]);

  // Auto-Save
  useEffect(() => {
    const policy = resolveAutoSavePolicy({
      screen,
      isDefaultSettings: checkIsDefaultSettings({
        routeMode,
        textSpeed,
        instantUnreadText,
        bgmVolume,
        seVolume,
        isAudioEnabled,
        defaultAudioVolume: DEFAULT_AUDIO_VOLUME,
      }),
      hasExistingSave: Boolean(loadSaveData()),
    });

    const currentData = loadSaveData();
    const payload = resolveAutoSavePayload({
      policy,
      existingSave: currentData,
      fullSaveState: {
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
        seenTalkIds,
        activeEvent,
        vnBacklog
      },
      settingsState: {
        routeMode,
        textSpeed,
        instantUnreadText,
        bgmVolume,
        seVolume,
        isAudioEnabled
      }
    });

    if (payload !== null) {
      saveGameData(payload);
      setHasSave(true);
    } else {
      // hasSave should only be true if it's a real game progress save
      if (currentData && currentData.screen !== 'START') {
        setHasSave(true);
      } else {
        setHasSave(false);
      }
    }
  }, [screen, activeHeroineId, routeMode, workshopState, affection, textSpeed, instantUnreadText, bgmVolume, seVolume, isAudioEnabled, seenEventIds, seenTalkIds, activeEvent, vnBacklog]);

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

  // M-TIME-PHASE-UI-1: Update time phase based on screen and context
  useEffect(() => {
    const phase = resolveTimePhase(screen, activeDailyTalk, isRecallMode);
    setCurrentTimePhase(phase);
  }, [screen, activeDailyTalk, isRecallMode]);

  // Handle BGM per screen
  useEffect(() => {
    let trackId = null;
    const day = workshopState.day || 1;
    const hPrefix = (activeHeroineId || 'hakima').toUpperCase();

    if (screen === 'START' || screen === 'HEROINE_SELECT' || screen === 'MEMORIES' || screen === 'PROLOGUE') {
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

    // M-UI-AUDIO-START-GATE: Gate BGM playback on START screen until user takes a start action
    const isGatedOnStart = screen === 'START' && isAudioGated;
    
    if (isAudioEnabled && !isGatedOnStart && trackId && TRACKS[trackId]) {
      audioEngine.playTrack(TRACKS[trackId]);
    } else {
      audioEngine.stop();
    }
  }, [screen, workshopState.day, activeHeroineId, affection, workshopState.reputation, isAudioEnabled, isAudioGated]);


  const activeHeroine = HEROINES.find(h => h.id === activeHeroineId) || HEROINES[0];
  
  /**
   * Determine main character for display based on screen context.
   * For DAILY_TALK: uses speaker of current page (Nadir or heroine).
   * For other screens: always uses activeHeroine.
   */
  const getMainCharacter = () => {
    if (screen === 'DAILY_TALK' && activeDailyTalk) {
      const currentPage = activeDailyTalk.pages?.[dailyTalkCurrentPage];
      // Infer speakerId same way as VNBox pages mapping
      let speakerId = currentPage?.speakerId;
      if (!speakerId && currentPage?.speaker) {
        if (currentPage.speaker === 'ナーディル') speakerId = 'nader';
        else if (currentPage.speaker === activeHeroine.name) speakerId = activeHeroine.id;
      }
      if (speakerId === 'nader') {
        return NADER;
      }
    }
    return activeHeroine;
  };
  
  const mainCharacter = getMainCharacter();
  const textSpeedMeta = getTextSpeedMeta(textSpeed);
  const isInstantTextSpeed = textSpeed === 'instant' || instantUnreadText;

  // Go to Heroine Select (New Game)
  const handleStartGame = () => {
    setIsAudioGated(false);
    audioEngine.playSfx('uiGameStart');
    clearSaveAndRefresh();
    
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
    setIsAudioGated(false);
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
      clearSaveAndRefresh();
      setSeenEventIds([]);
      setActiveEvent(null);
    }
  };

  const handleCloseEvent = () => {
    audioEngine.playSfx('uiTapBottle');

    const {
      shouldMarkSeen,
      nextScreen,
      shouldClearBackgroundOverride,
      shouldPlayDayEndSfx,
    } = resolveEventCloseActions({ event: activeEvent, isRecallMode });

    if (shouldMarkSeen && activeEvent) {
      setSeenEventIds(prev => [...prev, activeEvent.id]);
    }

    setActiveEvent(null);
    setEventCurrentPageIndex(0); // M-EVENT-PRESENTATION-FIX-1: Reset page index

    if (shouldClearBackgroundOverride) {
      setEventBackgroundOverride(null);
      prevEventBackgroundRef.current = null; // M-EVENT-PRESENTATION-FIX-1: Reset background tracking
    }

    switch (nextScreen) {
      case 'MEMORIES':
        setIsRecallMode(false);
        setScreen('MEMORIES');
        // M-MEMORIES-UX-POLISH-1-FIX-1: Scroll position will be restored by MemoriesScreen via ref
        break;
      case 'INTRO':
        setScreen('INTRO');
        break;
      case 'DAY_END':
      default:
        if (shouldPlayDayEndSfx) {
          audioEngine.playSfx('workshopDayEnd');
        }
        setScreen('DAY_END');
        break;
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
    
    const { greeting, mergedTalk, newSeenTalkIds } = prepareIntroSequence({
      heroineId,
      currentAffection: affection[heroineId] || 0,
      seenTalkIds,
      routeMode,
    });
    setActiveGreeting(greeting);
    setActiveDailyTalk(mergedTalk);
    if (newSeenTalkIds.length > 0) {
      setSeenTalkIds(prev => [...prev, ...newSeenTalkIds]);
    }

    // Auto-save when starting a new session with a heroine
    saveGameData(buildGameSavePayload({
      routeMode,
      workshopState: { ...workshopState, activeHeroineId: heroineId },
      affection,
      textSpeed,
      instantUnreadText,
      bgmVolume,
      seVolume,
      seenEventIds,
      seenTalkIds,
      vnBacklog,
      isAudioEnabled,
      activeHeroineId,
      activeEvent: null,
      screen: 'HEROINE_SELECT'
    }));
    
    // Check for flashback_intro
    const flashbackEvent = resolveHeroineSelectionEvent({ heroineId, seenEventIds });
    
    setTimeout(() => {
      setIsHeroineLoading(false);
      if (flashbackEvent) {
        setEventBackgroundOverride(null);
        prevEventBackgroundRef.current = null;
        setEventCurrentPageIndex(0);
        setActiveEvent(flashbackEvent);
        setScreen('EVENT');
      } else {
        setScreen('INTRO');
      }
    }, 500); // Small buffer for smoothness
  };

  const handleNextDay = () => {
    audioEngine.playSfx('uiTapBottle');
    if (workshopState.day >= 10) {
      setScreen('FINAL_RESULT');
    } else {
      const nextDay = workshopState.day + 1;
      setWorkshopState(prev => ({ ...prev, day: nextDay }));

      // M-SCENARIO-DAILYTALK-RUNTIME-1: Check for day_end DailyTalk before intro
      const { talk: dayEndTalk, newSeenTalkIds: newDayEndTalkIds } = prepareDayEndTalkSequence({
        heroineId: activeHeroineId,
        currentAffection: affection[activeHeroineId] || 0,
        seenTalkIds,
        routeMode,
      });

      if (dayEndTalk) {
        // Show day_end DailyTalk first, then go to INTRO
        setActiveDailyTalk(dayEndTalk);
        setDailyTalkNextScreen('INTRO');
        if (newDayEndTalkIds.length > 0) {
          setSeenTalkIds(prev => [...prev, ...newDayEndTalkIds]);
        }
        setScreen('DAILY_TALK');
      } else {
        // No day_end talk, go directly to intro with intro talk
        const { greeting, mergedTalk, newSeenTalkIds } = prepareIntroSequence({
          heroineId: activeHeroineId,
          currentAffection: affection[activeHeroineId] || 0,
          seenTalkIds,
          routeMode,
        });
        setActiveGreeting(greeting);
        setActiveDailyTalk(mergedTalk);
        if (newSeenTalkIds.length > 0) {
          setSeenTalkIds(prev => [...prev, ...newSeenTalkIds]);
        }
        setScreen('INTRO');
      }
    }
  };

  const handleSeeEnding = () => {
    audioEngine.playSfx('uiConfirmChime');
    setScreen('ENDING');
  };

  const handleFinishGame = () => {
    audioEngine.playSfx('uiTapBottle');
    // Clear save on game completion
    clearSaveAndRefresh();
    setScreen('START');
  };

  // Generate quiz and start service
  const handleBeginService = (talkId = null) => {
    audioEngine.playSfx('uiTapBottle');
    
    // Mark DailyTalk as read if applicable
    if (talkId) {
      setSeenTalkIds(prev => {
        if (prev.includes(talkId)) return prev;
        const next = [...prev, talkId];
        // Persistent save for seenTalkIds
        saveGameData({
          ...loadSaveData(),
          seenTalkIds: next
        });
        return next;
      });
    }
    setActiveDailyTalk(null);

    setSession(createQuizSession({ questionCount: 5 }));
    setScreen('QUIZ');
  };

  const handleCloseDailyTalk = () => {
    audioEngine.playSfx('uiTapBottle');
    const nextScreen = dailyTalkNextScreen || 'DAY_END';
    setDailyTalkNextScreen(null);
    setActiveDailyTalk(null);
    setScreen(nextScreen);
  };

  // End of service, go to Day End (or Event)
  // M-SCENARIO-DAILYTALK-RUNTIME-1: Check for after_result DailyTalk first
  const handleEndDay = () => {
    if (activeEvent) {
      setScreen('EVENT');
    } else {
      // Check for after_result DailyTalk before going to DAY_END
      const { talk: resultTalk, newSeenTalkIds: newResultTalkIds } = prepareResultTalkSequence({
        heroineId: activeHeroineId,
        currentAffection: affection[activeHeroineId] || 0,
        seenTalkIds,
        routeMode,
      });

      if (resultTalk) {
        // Show after_result DailyTalk first, then go to DAY_END
        setActiveDailyTalk(resultTalk);
        setDailyTalkNextScreen('DAY_END');
        if (newResultTalkIds.length > 0) {
          setSeenTalkIds(prev => [...prev, ...newResultTalkIds]);
        }
        setScreen('DAILY_TALK');
      } else {
        // No after_result talk, go directly to DAY_END
        audioEngine.playSfx('workshopDayEnd');
        setScreen('DAY_END');
      }
    }
  };

  // Back to Title
  const handleBackToTitle = () => {
    audioEngine.playSfx('uiTapBottle');
    setScreen('START');
    refreshHasSave();
    setEventBackgroundOverride(null); // Ensure background is reset
    setShowOptions(false);
    setShowLog(false);
    setShowHelp(false);
  };

  const handleRecallEventFromMemories = (event) => {
    audioEngine.playSfx('uiConfirmChime');
    setEventBackgroundOverride(null); // Clear any stale override
    prevEventBackgroundRef.current = null; // Reset background tracking
    setEventCurrentPageIndex(0); // Reset page index
    setActiveEvent(event);
    setIsRecallMode(true);
    setActiveHeroineId(event.heroineId);
    setScreen('EVENT');
  };

  const appendVnBacklog = ({ speaker, speakerId, expression, text, screen: sourceScreen }) => {
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
          speakerId: speakerId || null,
          expression: expression || 'normal',
          text,
          screen: sourceScreen || screen,
          heroineId: activeHeroineId,
          routeMode,
          sequence: prev.length + 1
        }
      ];
    });
  };

  // Encapsulated Quiz Completion Logic (M-APP-REFACTOR-Q1)
  const finishQuizWithResult = (correctCount) => {
    const totalCount = session?.questions?.length || 5;
    const result = resolveQuizCompletion({
      correctCount,
      totalCount,
      activeHeroineId,
      currentAffection: affection[activeHeroineId] || 0,
      seenEventIds,
      routeMode
    });

    applyQuizResultState(result);
  };

  // Helper to apply the calculated quiz results to React state
  const applyQuizResultState = (result) => {
    // 1. Update Affection
    const nextAffection = addAffection(affection, activeHeroineId, result.affectionGain);
    setAffection(nextAffection);
    setLastAffectionGain(result.affectionGain);

    // 2. Update Workshop State
    setWorkshopState(prev => applyWorkshopResult(prev, result.workshopResult));

    // 3. Handle Potential Event Unlock
    if (result.unlockedEvent) {
      setActiveEvent(result.unlockedEvent);
    }

    // 4. Transition to Result Screen
    setScreen('RESULT');
  };

  // Handle answer selection (Improved in M9-3)
  const handleSelect = (itemId) => {
    if (!session || session.isFinished || quizFeedback) return;

    const currentRhythmHit = getIsRhythmHitNow();
    const updatedSession = answerQuestion(session, itemId, {
      rhythmBonus: currentRhythmHit ? DEFAULT_RHYTHM_BONUS_GOLD : 0
    });
    const lastAnswer = updatedSession.answers[updatedSession.answers.length - 1];
    const isCorrect = lastAnswer.isCorrect;
    const rhythmBonus = isCorrect && currentRhythmHit ? DEFAULT_RHYTHM_BONUS_GOLD : 0;

    // Trigger visual feedback
    setQuizFeedback({ itemId, isCorrect, rhythmBonus });

    // Delay result sound slightly
    setTimeout(() => {
      if (isCorrect) {
        audioEngine.playSfx('quizCorrectStarChime');
      } else {
        audioEngine.playSfx('quizWrongSandTap');
      }

      // Wait for animation to finish
      setTimeout(() => {
        setQuizFeedback(null);
        setSession(updatedSession);

        if (updatedSession.isFinished) {
          const correctCount = updatedSession.answers.filter(a => a.isCorrect).length;
          finishQuizWithResult(correctCount);
        }
      }, 650);
    }, 150);
  };

  // --- RENDER HELPERS ---

  const getFullPath = (src) => `${import.meta.env.BASE_URL}${src}`.replace(/([^:])\/\//g, '$1/');
  const getFileName = (path) => path?.split('/').pop() || '';

  const renderBackground = (screenOrId) => {
    const SCREEN_BACKGROUNDS = {
      INTRO: 'shopInteriorService',
      RESULT: 'shopInteriorService',
      DAY_END: 'shopExteriorNight',
      PROLOGUE: 'shopExteriorNight'
    };
    const bgId = eventBackgroundOverride || SCREEN_BACKGROUNDS[screenOrId] || screenOrId;
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

      /* Quiz Animations (M9-3 / M-UI-TRANSITION-POLISH) */
      @keyframes staggerIn {
        from { opacity: 0; transform: translateY(15px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .quiz-question-bubble { animation: staggerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .quiz-rhythm-lane { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.2s; }
      .quiz-option-0 { animation: staggerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.4s; }
      .quiz-option-1 { animation: staggerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.55s; }

      .item-card {
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s, background 0.2s;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      .item-card:hover {
        box-shadow: 0 8px 25px rgba(197, 160, 89, 0.25);
      }

      /* Story/VN Button Reveal (M-UI-TRANSITION-POLISH) */
      @keyframes vn-button-reveal {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .vn-button-reveal {
        animation: vn-button-reveal 0.25s ease-out forwards;
      }

      /* VN Global Fade Animations (B-2) */
      @keyframes vn-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes vn-fade-out { from { opacity: 1; } to { opacity: 0; } }

      /* Beat Lane Pulse & Halo (M-RHYTHM-UI-1-POLISH) */
      @keyframes beat-lane-pulse {
        0%, 100% { transform: scale(1); filter: brightness(1); box-shadow: 0 0 8px ${THEME.brass}88; }
        50% { transform: scale(1.15); filter: brightness(1.4); box-shadow: 0 0 20px ${THEME.brass}; }
      }
      @keyframes beat-halo-expand {
        0% { transform: scale(0.8); opacity: 0.9; }
        100% { transform: scale(2.8); opacity: 0; }
      }
      .beat-pulse {
        animation: beat-lane-pulse 2s infinite ease-in-out;
      }
      .beat-halo {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 1px solid ${THEME.brass};
        box-shadow: 0 0 10px ${THEME.brass};
        animation: beat-halo-expand 2s infinite ease-out;
        pointer-events: none;
        z-index: -1;
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
        debugModeEnabled={debugModeEnabled}
        onToggleDebug={() => setDebugModeEnabled(!debugModeEnabled)}
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
        onPageComplete={(data) => appendVnBacklog({ ...data, screen: 'PROLOGUE' })}
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
        activeDailyTalk={activeDailyTalk}
        activeGreeting={activeGreeting}
        day={workshopState.day}
        screen={screen}
        routeMode={routeMode}
        textSpeedMeta={textSpeedMeta}
        isInstantTextSpeed={isInstantTextSpeed}
        onOpenLog={() => setShowLog(true)}
        onOpenOptions={() => setShowOptions(true)}
        onOpenHelp={() => setShowHelp(true)}
        onVnAreaClick={handleVnAreaClick}
        onPageComplete={(data) => appendVnBacklog({ ...data, screen: 'INTRO' })}
        onBeginService={handleBeginService}
        renderThemeStyles={renderThemeStyles}
        renderBackground={renderBackground}
        HeroineDisplay={HeroineDisplay}
        audioEngine={audioEngine}
        vnRef={vnRef}
        getFaceIcon={getFaceIcon}
        containerStyle={containerStyle}
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
        
        <ScreenHeader
          timePhase={TIME_PHASES.DAY_END}
          title="今日の営業終了"
          onOpenLog={() => setShowLog(true)}
          onOpenOptions={() => setShowOptions(true)}
          onOpenHelp={() => setShowHelp(true)}
          routeMode={routeMode}
          screen={screen}
        />
        
        <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '50px' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '300px', background: 'rgba(255,255,255,0.95)', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1em', color: '#666', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>今回の営業記録</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px' }}>
               <div>売上：<span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{mgmt.sales}G</span></div>
               <div>評判：<span style={{ color: mgmt.reputation >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}</span></div>
            </div>
            
            <div style={{ textAlign: 'left', fontSize: '0.85em', color: '#444', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
              <strong>現在の工房の状態 (第{workshopState.day}回 営業終了)</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                 <div>総売上：<span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{workshopState.sales}G</span></div>
                 <div>総評判：<span style={{ color: workshopState.reputation >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{workshopState.reputation >= 0 ? `+${workshopState.reputation}` : workshopState.reputation}</span></div>
                 <div>満足度：<span style={{ color: workshopState.satisfaction >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{workshopState.satisfaction >= 0 ? `+${workshopState.satisfaction}` : workshopState.satisfaction}</span></div>
                 <div>親密度：<span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{affection[activeHeroine.id]} / 100</span></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
            <button onClick={handleNextDay} className="vn-button-reveal" style={{ ...buttonStyle, width: '100%', maxWidth: '280px', margin: 0 }}>次の営業へ</button>
            <button onClick={handleBackToTitle} className="vn-button-reveal" style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '100%', maxWidth: '280px', margin: 0 }}>タイトルへ戻る</button>
          </div>
        </div>
      </div>
    );
  } else if (screen === 'DAILY_TALK' && activeDailyTalk) {
    // M-SCENARIO-DAILYTALK-RUNTIME-1: DailyTalk display screen (for after_result / day_end)
    // M-DAILYTALK-HEROINE-FILTER-1: Safety check - ensure talk matches active heroine
    const talkHeroineId = activeDailyTalk.heroineId;
    const talkScope = activeDailyTalk.scope;
    const isTalkValid = talkScope === 'common' || talkScope === 'nader' || talkHeroineId === activeHeroineId;
    
    if (!isTalkValid) {
      // Talk doesn't match active heroine - skip to next screen
      console.warn(`[DAILY_TALK] Talk ${activeDailyTalk.id} has heroineId "${talkHeroineId}" but active heroine is "${activeHeroineId}". Skipping.`);
      const nextScreen = dailyTalkNextScreen || 'DAY_END';
      setDailyTalkNextScreen(null);
      setActiveDailyTalk(null);
      setScreen(nextScreen);
      mainContent = null;
    } else {
    // M-DAILYTALK-NADIR-PRESENCE-2: Map pages with speakerId for consistent character display
    const dailyTalkPagesWithSpeakerId = activeDailyTalk.pages.map(page => {
      let inferredId = page.speakerId;
      if (!inferredId) {
        if (page.speaker === 'ナーディル') inferredId = 'nader';
        else if (page.speaker === activeHeroine.name) inferredId = activeHeroine.id;
      }
      return { ...page, speakerId: inferredId };
    });
    
    mainContent = (
      <div 
        data-testid="daily-talk-screen" 
        style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}
        onClick={handleVnAreaClick}
      >
        {renderThemeStyles()}
        {renderBackground(screen === 'DAILY_TALK' ? 'shopInteriorService' : screen)}
        
        <div style={{ 
          position: 'absolute', 
          bottom: '8%', 
          left: 0,
          width: '100%',
          zIndex: 2, 
          pointerEvents: 'none', 
          height: '77%',
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'center',
          filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.3))'
        }}>
          <HeroineDisplay 
            heroine={mainCharacter} 
            type="standing" 
            size="large" 
            expression={dailyTalkPagesWithSpeakerId?.[dailyTalkCurrentPage]?.speakerId === mainCharacter.id 
              ? (dailyTalkPagesWithSpeakerId?.[dailyTalkCurrentPage]?.expression || 'normal')
              : 'normal'}
            noBorder={true}
            style={{ height: '100%', width: 'auto', boxShadow: 'none' }}
          />
        </div>

        <div style={{ zIndex: 5, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <GameHud 
            screen={screen} 
            routeMode={routeMode} 
            onOpenLog={() => setShowLog(true)} 
            onOpenOptions={() => setShowOptions(true)} 
            onOpenHelp={() => setShowHelp(true)} 
          />
          <div style={{ flex: '1 1 auto' }} />
        </div>

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
          <div style={{ width: '100%', boxSizing: 'border-box', position: 'relative' }}>
            <VNBox 
              ref={vnRef}
              speaker={dailyTalkPagesWithSpeakerId?.[0]?.speaker || ''}
              pages={dailyTalkPagesWithSpeakerId}
              themeColor={mainCharacter.themeColor}
              speed={textSpeedMeta.delay}
              skip={shouldSkipTypewriter(isInstantTextSpeed, false)}
              getFaceIcon={getFaceIcon}
              onPageChange={(index) => setDailyTalkCurrentPage(index)}
              onPageComplete={(data) => appendVnBacklog({ ...data, screen: 'DAILY_TALK' })}
              onComplete={() => {
                setDailyTalkCurrentPage(0); // Reset page index for next talk
                handleCloseDailyTalk();
              }}
            />
          </div>
        </div>
      </div>
    );
    } // end isTalkValid check
  } else if (screen === 'EVENT' && activeEvent) {
    const still = activeEvent.stillImageId ? STILL_IMAGES[activeEvent.stillImageId] : null;

    // M-EVENT-PRESENTATION-FIX-7: EVENT standing = activeHeroine fixed (not per-page switching)
    // VNBox face icon follows page speaker, central standing = heroine only
    const rawEventPages = getEventPages(activeEvent, routeMode);
    const currentEventPage = rawEventPages[eventCurrentPageIndex];
    const currentPageExpression = currentEventPage?.expression || 'normal';
    
    // M-EVENT-PRESENTATION-FIX-7: Check if current page is heroine speaking
    const normalizeSpeakerName = (value) => String(value || '').trim();
    const activeHeroineShortName = activeHeroine?.name?.split('・')?.[0];
    const isHeroineSpeakerPage = (page) => {
      if (!page || !activeHeroine) return false;
      const speakerName = normalizeSpeakerName(page?.speaker);
      return (
        page?.speakerId === activeHeroine.id ||
        speakerName === activeHeroine.name ||
        speakerName === activeHeroineShortName
      );
    };
    const isHeroineSpeaker = isHeroineSpeakerPage(currentEventPage);
    
    // M-EVENT-PRESENTATION-FIX-7: flashback_intro uses background to determine heroine visibility
    // Current day backgrounds = hide heroine, Memory/backstory backgrounds = show heroine
    const CURRENT_DAY_BACKGROUNDS = new Set([
      'shopExteriorDay',
      'shopExteriorNight',
      'shopInteriorService',
      'shopInteriorWorkshop'
    ]);
    
    // Use effective background (with fallback) for display decision
    const effectiveBackgroundId = currentEventPage?.backgroundId || 
                                   prevEventBackgroundRef.current || 
                                   activeEvent.presentation?.backgroundId;
    
    const isFlashbackIntro = activeEvent.kind === 'flashback_intro';
    const isMemoryBackground = effectiveBackgroundId && !CURRENT_DAY_BACKGROUNDS.has(effectiveBackgroundId);
    
    // flashback_intro: show heroine on memory pages OR when heroine speaks
    // normal event: show heroine always (not still)
    const shouldShowEventHeroine = isFlashbackIntro
      ? (isMemoryBackground || isHeroineSpeaker)  // flashback: memory bg OR heroine speaking
      : !still;  // normal event: always show (not still)
    
    // M-EVENT-PRESENTATION-FIX-7: Only update expression when heroine speaks
    // Nader/narration pages keep previous expression
    const displayedExpression = isHeroineSpeaker
      ? (currentPageExpression || eventHeroineExpression)
      : (eventHeroineExpression || 'normal');

    if (!still) {
      // Normal Event: Intro Style (Standing Image + Fixed Bottom VNBox)
      mainContent = (
        <div 
          data-testid="event-screen-normal" 
          style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}
          onClick={handleVnAreaClick}
        >
          {renderThemeStyles()}
          {renderBackground(screen)}
          
          {/* M-EVENT-PRESENTATION-FIX-2/7: Curtain slide overlay for background transitions (slowed down) */}
          {(bgTransitionPhase === "covering" || bgTransitionPhase === "covered" || bgTransitionPhase === "revealing") && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.98)',
              zIndex: 1000,
              pointerEvents: 'none',
              transform: bgTransitionPhase === "covering" ? 'translateX(0%)' : 
                         bgTransitionPhase === "covered" ? 'translateX(0%)' :
                         'translateX(100%)',
              transition: 'transform 0.65s ease-in-out'
            }} />
          )}
          
          {/* M-EVENT-PRESENTATION-FIX-3/7: Central standing = activeHeroine (flashback: bg-based, normal: fixed) */}
          <div style={{ 
            position: 'absolute', 
            bottom: '8%', 
            left: 0,
            width: '100%',
            zIndex: 2, 
            pointerEvents: 'none', 
            height: '77%',
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center',
            filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.3))',
            opacity: shouldShowEventHeroine ? 1 : 0,
            transition: 'opacity 0.2s ease'
          }}>
             <HeroineDisplay 
                heroine={activeHeroine} 
                type="standing" 
                size="large" 
                expression={displayedExpression} 
                noBorder={true}
                style={{ height: '100%', width: 'auto', boxShadow: 'none' }}
              />
          </div>

          <ScreenHeader
            timePhase={currentTimePhase}
            title={`愛着の記録：${activeEvent.title}`}
            onOpenLog={() => setShowLog(true)}
            onOpenOptions={() => setShowOptions(true)}
            onOpenHelp={() => setShowHelp(true)}
            routeMode={routeMode}
            screen={screen}
          />

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
            <div style={{ width: '100%', boxSizing: 'border-box', position: 'relative' }}>
              <VNBox 
                ref={vnRef}
                speaker={activeEvent.speaker}
                pages={rawEventPages.map(page => {
                  if (page.speakerId) return page;
                  let inferredId = null;
                  if (page.speaker === 'ナーディル') inferredId = 'nader';
                  else if (page.speaker === activeHeroine.name) inferredId = activeHeroine.id;
                  return { ...page, speakerId: inferredId };
                })}
                themeColor={activeHeroine.themeColor}
                speed={textSpeedMeta.delay}
                skip={shouldSkipTypewriter(isInstantTextSpeed, seenEventIds.includes(activeEvent.id))}
                getFaceIcon={getFaceIcon}
                onPageChange={(index) => {
                  setEventCurrentPageIndex(index);
                  const page = rawEventPages[index];
                  
                  // M-EVENT-PRESENTATION-FIX-7: Only update expression when heroine speaks
                  if (isHeroineSpeakerPage(page) && page?.expression) {
                    setEventHeroineExpression(page.expression);
                  }
                  setEventSpeakerId(page?.speakerId || null);
                  
                  // M-EVENT-PRESENTATION-FIX-2/7: Curtain slide transition for background changes
                  const newBgId = page?.backgroundId || prevEventBackgroundRef.current || activeEvent.presentation?.backgroundId;
                  if (newBgId && newBgId !== eventBackgroundOverride && bgTransitionPhase === "idle") {
                    // Start curtain slide: slower covering phase (650ms)
                    setBgTransitionPhase("covering");
                    setTimeout(() => {
                      // Covered phase - switch background
                      setBgTransitionPhase("covered");
                      setEventBackgroundOverride(newBgId);
                      prevEventBackgroundRef.current = newBgId;
                      setTimeout(() => {
                        // Revealing phase (450ms)
                        setBgTransitionPhase("revealing");
                        setTimeout(() => {
                          // Done - back to idle
                          setBgTransitionPhase("idle");
                        }, 450); // Reveal duration
                      }, 120); // Hold covered briefly
                    }, 650); // Cover duration
                  } else if (newBgId) {
                    prevEventBackgroundRef.current = newBgId;
                  }
                }}
                onPageComplete={(data) => appendVnBacklog({ ...data, screen: 'EVENT' })}
                onComplete={handleCloseEvent}
              />
            </div>
          </div>
        </div>
      );
    } else {
      // Still Event: Refined Cinematic Style (C-1)
      mainContent = (
        <div 
          data-testid="event-screen-still" 
          style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}
          onClick={handleVnAreaClick}
        >
          {renderThemeStyles()}

          {/* heroine_pan: inject dynamic keyframe for this still */}
          {still.stillCrop?.mode === 'heroine_pan' && (() => {
            const animName = `still-pan-${still.id}`;
            const start = still.stillCrop.startPosition || '50% 50%';
            const end   = still.stillCrop.endPosition   || '50% 50%';
            const dur   = still.stillCrop.durationMs    || 1200;
            return (
              <style key={animName}>{`
                @keyframes ${animName} {
                  from { object-position: ${start}; }
                  to   { object-position: ${end}; }
                }
                .still-pan-img-${still.id} {
                  animation: ${animName} ${dur}ms ease-out forwards;
                }
              `}</style>
            );
          })()}

          {/* Large Still Image Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            backgroundColor: '#000'
          }}>
            <img 
              src={getFullPath(still.src)} 
              alt={still.label}
              className={still.stillCrop?.mode === 'heroine_pan' ? `still-pan-img-${still.id}` : undefined}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: still.stillCrop?.objectFit || 'cover',
                objectPosition: still.stillCrop?.mode === 'heroine_pan'
                  ? still.stillCrop.startPosition || '50% 50%'
                  : still.stillCrop?.objectPosition || `${(still.focusX ?? 0.5) * 100}% ${(still.focusY ?? 0.5) * 100}%`,
                imageRendering: 'auto',
                backfaceVisibility: 'hidden',
                filter: 'blur(0.12px) contrast(0.99)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.parentNode) {
                  e.target.parentNode.innerHTML = '<span style="color:#f44; display:flex; align-items:center; justify-content:center; height:100%; font-size: 0.8em;">Still Load Failed</span>';
                }
              }}
            />
            {/* Gradient to ensure VNBox and Title readability */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              zIndex: 2
            }} />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '20%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
              zIndex: 2
            }} />
          </div>

          <ScreenHeader
            timePhase={currentTimePhase}
            title={`愛着の記録：${activeEvent.title}`}
            onOpenLog={() => setShowLog(true)}
            onOpenOptions={() => setShowOptions(true)}
            onOpenHelp={() => setShowHelp(true)}
            routeMode={routeMode}
            screen={screen}
          />

          {/* Bottom Dock: VN Box (Consistent with Intro/Normal Event) */}
          <div style={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 6,
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}>
            <div style={{ width: '100%', boxSizing: 'border-box', position: 'relative' }}>
              <VNBox 
                ref={vnRef}
                speaker={activeEvent.speaker}
                pages={rawEventPages.map(page => {
                  if (page.speakerId) return page;
                  let inferredId = null;
                  if (page.speaker === 'ナーディル') inferredId = 'nader';
                  else if (page.speaker === activeHeroine.name) inferredId = activeHeroine.id;
                  return { ...page, speakerId: inferredId };
                })}
                themeColor={activeHeroine.themeColor}
                speed={textSpeedMeta.delay}
                skip={shouldSkipTypewriter(isInstantTextSpeed, seenEventIds.includes(activeEvent.id))}
                getFaceIcon={getFaceIcon}
                onPageChange={(index) => {
                  setEventCurrentPageIndex(index);
                  const page = rawEventPages[index];
                  
                  // M-EVENT-PRESENTATION-FIX-5: Only update expression when heroine speaks
                  if (isHeroineSpeakerPage(page) && page?.expression) {
                    setEventHeroineExpression(page.expression);
                  }
                  setEventSpeakerId(page?.speakerId || null);
                  // Note: Still events don't trigger background transitions - the still image is the background
                }}
                onPageComplete={(data) => appendVnBacklog({ ...data, screen: 'EVENT' })}
                onComplete={handleCloseEvent}
              />
            </div>
          </div>
        </div>
      );
    }
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
        unlockAll={isUnlockAllDebug}
        heroines={HEROINES}
        affectionEvents={AFFECTION_EVENTS}
        onBackToTitle={handleBackToTitle}
        onOpenLog={() => setShowLog(true)}
        onOpenOptions={() => setShowOptions(true)}
        onOpenHelp={() => setShowHelp(true)}
        onRecallEvent={handleRecallEventFromMemories}
        renderThemeStyles={renderThemeStyles}
        renderUtilityHeader={renderUtilityHeader}
        memoriesScrollPosition={memoriesScrollPositionRef.current}
        onMemoriesScrollSave={(pos) => { memoriesScrollPositionRef.current = pos; }}
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
              pages={endingData.pages.map(page => {
                if (page.speakerId) return page;
                let inferredId = null;
                if (page.speaker === 'ナーディル') inferredId = 'nader';
                else if (page.speaker === activeHeroine.name) inferredId = activeHeroine.id;
                return { ...page, speakerId: inferredId };
              })}
              themeColor={activeHeroine.themeColor}
              speed={textSpeedMeta.delay}
              skip={shouldSkipTypewriter(isInstantTextSpeed)}
              getFaceIcon={getFaceIcon}
              onPageComplete={(data) => appendVnBacklog({ ...data, screen: 'ENDING' })}
              onComplete={handleFinishGame}
            />
          </div>

          <button onClick={handleFinishGame} className="vn-button-reveal" style={{ ...buttonStyle, marginBottom: '20px', width: '100%', maxWidth: '240px' }}>タイトルへ戻る</button>
        </div>
      </div>
    );
  } else if (screen === 'QUIZ' && session) {
    const quizState = {
      session,
      activeHeroineId,
      activeHeroine,
      quizFeedback,
      routeMode,
      screen,
    };
    const quizActions = {
      onOpenLog: () => setShowLog(true),
      onOpenOptions: () => setShowOptions(true),
      onOpenHelp: () => setShowHelp(true),
      onSelectChoice: handleSelect,
    };
    const quizHelpers = {
      renderThemeStyles,
      getFullPath,
    };
    const quizStyles = {
      containerStyle,
      headerStyle,
      cardStyle,
      customerStyle,
      bubbleStyle,
      itemCardStyle,
      imageStyle,
      itemNameStyle,
    };
    mainContent = (
      <QuizScreen
        quizState={quizState}
        quizActions={quizActions}
        quizHelpers={quizHelpers}
        quizStyles={quizStyles}
      />
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
          {/* Global TimePhaseBadge for screens without ScreenHeader */}
          {!['INTRO', 'EVENT', 'MEMORIES', 'START', 'HEROINE_SELECT', 'PROLOGUE'].includes(screen) && (
            <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 1000, pointerEvents: 'none' }}>
              <TimePhaseBadge timePhase={currentTimePhase} />
            </div>
          )}
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
          <LogModal isOpen={showLog} onClose={() => setShowLog(false)} vnBacklog={vnBacklog} scrollRef={backlogScrollRef} getFaceIcon={getFaceIcon} />
          <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
          {showSoundTest && <SoundTest onClose={() => setShowSoundTest(false)} isAudioEnabled={isAudioEnabled} onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)} />}
          {(import.meta.env.DEV || debugModeEnabled) && (
            <DebugPanel 
              routeMode={routeMode}
              setRouteMode={setRouteMode}
              affection={affection}
              setAffection={setAffection}
              seenEventIds={seenEventIds}
              setSeenEventIds={setSeenEventIds}
              autoSkipQuiz={autoSkipQuiz}
              setAutoSkipQuiz={setAutoSkipQuiz}
              onTriggerEvent={(ev) => {
                setScreen('EVENT');
                setActiveEvent(ev);
                setEventHeroineExpression('normal');
              }}
            />
          )}
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

function HeroineDisplay({ heroine, type, size = "large", expression = "normal", noBorder = false, style = {}, objectPosition }) {
  const [imgError, setImgError] = useState(false);
  const [displayExpr, setDisplayExpr] = useState(expression);
  const [prevExpr, setPrevExpr] = useState(null);
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false);
  
  // B-2: Expression transition logic
  useEffect(() => {
    if (expression !== displayExpr) {
      setPrevExpr(displayExpr);
      setDisplayExpr(expression);
      setIsCurrentLoaded(false); // Reset load state for new expression
      const timer = setTimeout(() => setPrevExpr(null), 200);
      return () => clearTimeout(timer);
    }
  }, [expression]);

  const assetPath = getHeroineAsset(heroine.id, type, displayExpr);
  const fullPath = assetPath ? `${import.meta.env.BASE_URL}${assetPath}`.replace(/([^:])\/\//g, '$1/') : null;

  const prevAssetPath = prevExpr ? getHeroineAsset(heroine.id, type, prevExpr) : null;
  const prevFullPath = prevAssetPath ? `${import.meta.env.BASE_URL}${prevAssetPath}`.replace(/([^:])\/\//g, '$1/') : null;

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
    objectPosition: objectPosition || (isStanding ? 'top center' : (heroine.visualConfig?.facePosition || 'center 20%')),
    display: imgError ? 'none' : 'block',
    userSelect: 'none',
    WebkitUserDrag: 'none',
    imageRendering: 'auto',
    backfaceVisibility: 'hidden',
    filter: isStanding ? 'blur(0.18px) contrast(0.98)' : undefined
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
      {/* Prev Expression (Fade Out) */}
      {prevFullPath && (
        <img 
          src={prevFullPath} 
          alt="previous expression"
          style={{ 
            ...imgStyle, 
            position: 'absolute', 
            zIndex: 1,
            animation: 'vn-fade-out 0.2s forwards' 
          }} 
        />
      )}
      {/* Current Expression (Fade In) */}
      <img 
        key={displayExpr}
        src={fullPath} 
        alt={heroine.name} 
        onLoad={() => setIsCurrentLoaded(true)}
        style={{ 
          ...imgStyle, 
          zIndex: 2,
          opacity: isCurrentLoaded ? 1 : 0,
          animation: isCurrentLoaded ? 'vn-fade-in 0.2s forwards' : 'none' 
        }}
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
  background: 'rgba(255, 255, 255, 0.98)',
  padding: '18px',
  borderRadius: '16px', // More rounded for modern feel
  cursor: 'pointer',
  transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
  border: `1px solid ${THEME.brass}44`,
  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const imageStyle = {
  width: '100%',
  aspectRatio: '1 / 1',
  objectFit: 'contain',
  borderRadius: '8px',
  marginBottom: '15px',
  background: 'rgba(245, 240, 230, 0.5)',
  padding: '10px'
};

const itemNameStyle = {
  fontSize: '0.95em',
  color: THEME.textDark,
  fontWeight: 'bold',
  textAlign: 'center',
  width: '100%',
  lineHeight: '1.3'
};


const apiKey = ""; // Gemini Canvas direct paste version

export default function CanvasApp() {
  return <App apiKey={apiKey} />;
}
