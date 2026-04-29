import React from 'react';
import React, { useState, useEffect, useRef } from 'react';
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
import { checkNewEventUnlock, getEventPages } from './game/eventSystem';
import { AFFECTION_EVENTS } from './data/affectionEvents';
import { BACKGROUND_IMAGES, STILL_IMAGES } from './data/imageAssets';
import { ENDINGS } from './data/endings';
import { SFX } from './data/sfx';
import itemsData from './data/generated/items.json';

const ROUTE_MODE_META = {
  normal: {
    label: '現在から育つ縁'
  },
  long_history: {
    label: '過去から続く縁'
  }
};

const getRouteModeMeta = (routeMode) => ROUTE_MODE_META[routeMode] || ROUTE_MODE_META.normal;

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

function SoundTest({ onClose, isAudioEnabled }) {
  const groups = [...new Set(SFX_CANDIDATES.map(c => c.group))];
  return (
    <div data-testid="sound-test-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', flexDirection: 'column', padding: '8px' }}>
      <div style={{ maxWidth: '600px', width: '100%', height: '100%', margin: '0 auto', background: '#222', borderRadius: '8px', border: '1px solid #444', color: '#eee', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '10px 12px', borderBottom: '1px solid #444', flexShrink: 0 }}>
          <h2 style={{ margin: 0, color: '#f0d080', fontSize: '1.2rem' }}>サウンド設定 Test</h2>
          <button data-testid="sound-test-close" onClick={onClose} style={{ padding: '8px 14px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '12px' }}>
        {!isAudioEnabled && <div style={{ background: '#422', padding: '10px', marginBottom: '20px', borderRadius: '4px', color: '#f88', fontSize: '0.9rem' }}>音声がOFFのため、再生されません。</div>}

        {/* BGM Section */}
        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #444' }}>
          <h3 style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>BGM (Music)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {Object.values(TRACKS).map(track => (
              <div key={track.id} style={{ background: '#2a2a2a', padding: '12px', borderRadius: '6px', border: '1px solid #3a3a3a' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px', color: '#fff' }}>{track.id}</div>
                <div style={{ fontSize: '0.8rem', color: '#f0d080', marginBottom: '6px' }}>{track.title}</div>
                <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '8px', wordBreak: 'break-all', fontStyle: 'italic' }}>{track.src}</div>
                <button 
                  onClick={() => audioEngine.playTrack(track)}
                  disabled={!isAudioEnabled}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    background: isAudioEnabled ? '#3d5afe' : '#333', 
                    color: isAudioEnabled ? '#fff' : '#666', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: isAudioEnabled ? 'pointer' : 'default',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  Play
                </button>
              </div>
            ))}
            <button 
              onClick={() => audioEngine.stop()}
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: '#555', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                fontSize: '0.85rem', 
                fontWeight: 'bold',
                gridColumn: '1 / -1',
                marginTop: '10px'
              }}
            >
              STOP MUSIC
            </button>
          </div>
        </div>

        <h3 style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>SFX (サウンド設定 Effects)</h3>

        {groups.map(group => (
          <div key={group} style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #333' }}>
            <h3 style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>{group}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {SFX_CANDIDATES.filter(c => c.group === group).map(c => {
                const isSelected = Object.values(SELECTED_SFX).includes(c.id);
                return (
                  <div key={c.id} style={{ 
                    background: '#2a2a2a', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    border: isSelected ? '1px solid #00ff00' : '1px solid #3a3a3a',
                    position: 'relative'
                  }}>
                    {isSelected && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '-8px', 
                        right: '8px', 
                        background: '#00ff00', 
                        color: '#000', 
                        fontSize: '0.6rem', 
                        padding: '2px 6px', 
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>
                        SELECTED
                      </div>
                    )}
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px', color: '#fff' }}>{c.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#777', marginBottom: '8px', wordBreak: 'break-all' }}>{c.src.split('/').pop()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '8px' }}>Vol: {c.volume} / Start: {c.start}s</div>
                    {c.note && <div style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#666', marginBottom: '8px' }}>{c.note}</div>}
                    <button 
                      onClick={() => audioEngine.playSfxCandidate(c.id)}
                      disabled={!isAudioEnabled}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        background: isAudioEnabled ? (isSelected ? '#00c853' : '#3d5afe') : '#333', 
                        color: isAudioEnabled ? '#fff' : '#666', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: isAudioEnabled ? 'pointer' : 'default',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Play
                    </button>
                  </div>
                );
              })}
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
  const [hasSave, setHasSave] = useState(false);
  const [bgTestIndex, setBgTestIndex] = useState(0);
  const [stillTestIndex, setStillTestIndex] = useState(0);
  const [visualTestMode, setVisualTestMode] = useState('background');
  const [isPrologueComplete, setIsPrologueComplete] = useState(false);
  const [menuView, setMenuView] = useState('main');
  const [vnBacklog, setVnBacklog] = useState([]);
  const [textSpeed, setTextSpeed] = useState('normal');
  const [instantUnreadText, setInstantUnreadText] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(DEFAULT_AUDIO_VOLUME);
  const [seVolume, setSeVolume] = useState(DEFAULT_AUDIO_VOLUME);
  const backlogScrollRef = useRef(null);
  
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Asset Loading State (M8-28) ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isHeroineLoading, setIsHeroineLoading] = useState(false);
  const outerWrapperRef = useRef(null);

  // --- Scale-to-Fit Implementation (M8-23) ---
  const BASE_WIDTH = 390;
  const BASE_HEIGHT = 780;
  const MAX_LOGICAL_WIDTH = 560;
  const MIN_SCALE = 0.68;
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
      setViewportSize({
        width: Math.floor(Math.min(viewport?.width || window.innerWidth, doc?.clientWidth || window.innerWidth)),
        height: Math.floor(Math.min(viewport?.height || window.innerHeight, doc?.clientHeight || window.innerHeight))
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const target = outerWrapperRef.current?.parentElement || document.documentElement;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setHostSize({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height)
      });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isMenuOpen && menuView === 'log' && backlogScrollRef.current) {
      backlogScrollRef.current.scrollTop = backlogScrollRef.current.scrollHeight;
    }
  }, [isMenuOpen, menuView, vnBacklog]);

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
  const isClipped = rawScale < MIN_SCALE;

  const outerWrapperStyle = {
    width: '100%',
    height: '100%',
    minHeight: `${measuredSize.height}px`,
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: isClipped ? 'flex-start' : 'center',
    overflow: isClipped ? 'auto' : 'hidden',
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
      setHasSave(true);
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

    if (trackId && TRACKS[trackId]) {
      audioEngine.playTrack(TRACKS[trackId]);
    } else {
      audioEngine.stop();
    }
  }, [screen, workshopState.day, activeHeroineId, affection, workshopState.reputation]);


  const activeHeroine = HEROINES.find(h => h.id === activeHeroineId) || HEROINES[0];
  const textSpeedMeta = getTextSpeedMeta(textSpeed);
  const isInstantTextSpeed = textSpeed === 'instant' || instantUnreadText;

  // Go to Heroine Select (New Game)
  const handleStartGame = () => {
    audioEngine.playSfx('uiTapBottle');
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
    setIsPrologueComplete(false);
    
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
    setMenuView('main');
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
    
    // 1. Play choice sound immediately
    audioEngine.playSfx('quizChoicePick');
    
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

  const renderBackground = (screen) => {
    const SCREEN_BACKGROUNDS = {
      INTRO: 'shopExteriorDay',
      RESULT: 'shopInteriorWorkshop',
      DAY_END: 'shopExteriorNight'
    };
    const bgId = SCREEN_BACKGROUNDS[screen];
    if (!bgId) return null;
    const bg = BACKGROUND_IMAGES[bgId];
    if (!bg) return null;

    return (
      <>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${getFullPath(bg.src)})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          zIndex: 0, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(26, 42, 58, 0.5)',
          zIndex: 1, pointerEvents: 'none'
        }} />
      </>
    );
  };

  const renderThemeStyles = () => (
    <style>{`
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

      /* Quiz Animations (M9-3) */
      @keyframes staggerIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .quiz-option-0 { animation: staggerIn 0.4s ease-out both; animation-delay: 0.1s; }
      .quiz-option-1 { animation: staggerIn 0.4s ease-out both; animation-delay: 0.25s; }

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

  const renderRouteModeBadge = (compact = false) => {
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
          border: `1px solid ${THEME.brass}`,
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

  const renderAudioToggle = () => {
    const isHudVisible = !['START', 'ENDING', 'FINAL_RESULT', 'MEMORIES', 'VISUAL_TEST', 'SOUND_TEST'].includes(screen);
    if (!isHudVisible) return null;
    
    return (
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
        {renderRouteModeBadge(true)}
        <button 
          data-testid="options-open"
          onClick={() => setIsMenuOpen(true)}
          style={{
            background: 'white',
            border: `2px solid ${THEME.brass}`,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          aria-label="Menu"
        >
          ⚙️        </button>
      </div>
    );
  };

  const renderMenuModal = () => {
    if (!isMenuOpen) return null;

    if (menuView === 'log') {
      return (
        <div data-testid="backlog-modal" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, maxWidth: '320px', width: '92%', background: '#fff', padding: '20px', borderRadius: '12px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0 0 14px 0', color: THEME.nightBlue, textAlign: 'center', fontSize: '1.2em' }}>{'VN\u30ed\u30b0'}</h2>
            <div ref={backlogScrollRef} data-testid="backlog-scroll" style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {vnBacklog.length === 0 ? (
                <div style={{ color: '#777', fontSize: '0.9em', textAlign: 'center', padding: '24px 0' }}>{'\u307e\u3060\u30ed\u30b0\u306f\u3042\u308a\u307e\u305b\u3093'}</div>
              ) : vnBacklog.slice().reverse().map((entry, idx) => {
                const routeModeLabel = getBacklogRouteModeLabel(entry.routeMode);
                const routeModeBadgeStyle = entry.routeMode === 'long_history'
                  ? { background: '#fff5e0', color: THEME.brassDark, border: '1px solid #e6dcc3' }
                  : { background: '#eef4f7', color: THEME.nightBlue, border: '1px solid #d9e4ea' };
                const isNarration = !entry.speaker;
                return (
                  <div data-testid="backlog-entry" data-route-mode={entry.routeMode || 'normal'} key={`${entry.sequence}-${idx}`} style={{ background: '#faf7ef', border: '1px solid #e6dcc3', borderRadius: '10px', padding: '12px 13px', textAlign: 'left', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.74em', color: '#8a6a2b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.screen} / #{entry.sequence}</div>
                      <div data-testid="backlog-route-mode" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68em', fontWeight: 'bold', lineHeight: 1, padding: '3px 8px', borderRadius: '999px', whiteSpace: 'nowrap', ...routeModeBadgeStyle }}>
                        {routeModeLabel}
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.92em', color: isNarration ? '#555' : THEME.textDark, marginBottom: '6px' }}>{entry.speaker || 'Narration'}</div>
                    <div style={{ fontSize: '0.88em', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{entry.text}</div>
                  </div>
                );
              })}
            </div>
            <button data-testid="backlog-close" style={{ ...buttonStyle, marginTop: '14px', background: '#666', color: 'white', width: '100%', flexShrink: 0 }} onClick={() => setMenuView('main')}>{'\u623b\u308b'}</button>
          </div>
        </div>
      );
    }

    if (menuView === 'help') {
      return (
        <div data-testid="help-modal" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, maxWidth: '340px', width: '92%', background: '#fff', padding: '20px', borderRadius: '12px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0 0 14px 0', color: THEME.nightBlue, textAlign: 'center', fontSize: '1.2em' }}>遊び方</h2>
            <div data-testid="help-scroll" style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '12px 2px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.92em' }}>・お客さんの依頼を読み、合う商品を選びます。</p>
              <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.92em' }}>・正解すると工房評価と親密度が上がります。</p>
              <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.92em' }}>・10日間の営業後、結果とエンディングに進みます。</p>
              <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.92em' }}>・親密度が上がるとイベントが発生します。</p>
              <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.92em' }}>・Backlog から最近の会話を確認できます。</p>
              <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.92em' }}>・Options ではテキスト速度、音量、未読即時表示を変更できます。</p>
            </div>
            <button data-testid="help-back" style={{ ...buttonStyle, marginTop: '14px', background: THEME.nightBlue, color: THEME.sand, width: '100%', flexShrink: 0 }} onClick={() => setMenuView('main')}>戻る</button>
            <button data-testid="help-close" style={{ ...buttonStyle, marginTop: '10px', background: '#666', color: 'white', width: '100%', flexShrink: 0 }} onClick={() => { audioEngine.playSfx('uiTapBottle'); setIsMenuOpen(false); setMenuView('main'); }}>閉じる</button>
          </div>
        </div>
      );
    }

    return (
      <div 
        data-testid="options-modal"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <div style={{ ...cardStyle, maxWidth: '300px', background: '#fff', padding: '25px', borderRadius: '12px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 20px 0', color: THEME.nightBlue, textAlign: 'center', fontSize: '1.4em' }}>設定</h2>
          <div style={{ padding: '14px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: '0.92em', color: THEME.textDark, fontWeight: 'bold', marginBottom: '8px' }}>テキスト速度</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
              {Object.entries(TEXT_SPEED_META).map(([mode, meta]) => {
                const isSelected = textSpeed === mode;
                return (
                  <button
                    key={mode}
                    data-testid={`text-speed-${mode}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      audioEngine.playSfx('uiTapBottle');
                      setTextSpeed(mode);
                    }}
                    style={{
                      ...buttonStyle,
                      margin: 0,
                      padding: '10px 8px',
                      fontSize: '0.76em',
                      lineHeight: 1.2,
                      background: isSelected ? THEME.starGold : '#eef1f4',
                      color: isSelected ? THEME.textDark : '#445',
                      border: `1px solid ${isSelected ? THEME.starGold : '#ccd6dd'}`,
                      boxShadow: isSelected ? '0 0 0 2px rgba(255, 204, 0, 0.16)' : 'none'
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ padding: '14px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: '0.92em', color: THEME.textDark, fontWeight: 'bold', marginBottom: '8px' }}>BGM音量</div>
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
              <span style={{ width: '48px', textAlign: 'right', fontSize: '0.85em', color: THEME.textDark, fontWeight: 'bold' }}>
                {Math.round(bgmVolume * 100)}%
              </span>
            </div>
          </div>
          <div style={{ padding: '14px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: '0.92em', color: THEME.textDark, fontWeight: 'bold', marginBottom: '8px' }}>SE音量</div>
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
              <span style={{ width: '48px', textAlign: 'right', fontSize: '0.85em', color: THEME.textDark, fontWeight: 'bold' }}>
                {Math.round(seVolume * 100)}%
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.92em', color: THEME.textDark, fontWeight: 'bold' }}>未読も瞬時表示</div>
              <div style={{ fontSize: '0.75em', color: '#777', marginTop: '2px' }}>未読テキストも即時で表示する</div>
            </div>
            <button
              data-testid="instant-unread-toggle"
              aria-pressed={instantUnreadText}
              onClick={() => {
                audioEngine.playSfx('uiTapBottle');
                setInstantUnreadText(prev => !prev);
              }}
              style={{
                ...buttonStyle,
                margin: 0,
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.9em',
                fontWeight: 'bold',
                background: instantUnreadText ? THEME.starGold : '#999',
                color: instantUnreadText ? THEME.textDark : '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {instantUnreadText ? 'ON' : 'OFF'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: '1em', color: THEME.textDark, fontWeight: 'bold' }}>BGM: {isAudioEnabled ? 'ON' : 'OFF'}</span>
            <button onClick={() => { audioEngine.playSfx('uiTapBottle'); setIsAudioEnabled(!isAudioEnabled); }} style={{ background: isAudioEnabled ? THEME.starGold : '#999', color: isAudioEnabled ? THEME.textDark : '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9em', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {isAudioEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: '0.9em', color: '#999' }}>簡易セーブ状態</span>
            <div style={{ width: '80px', height: '6px', background: '#eee', borderRadius: '3px' }}>
              <div style={{ width: '70%', height: '100%', background: THEME.brass, borderRadius: '3px' }} />
            </div>
          </div>
          <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button data-testid="help-open" style={{ ...buttonStyle, marginTop: 0, background: THEME.brass, color: THEME.textDark, width: '100%' }} onClick={() => { audioEngine.playSfx('uiTapBottle'); setMenuView('help'); }}>遊び方</button>
            <button data-testid="backlog-open" style={{ ...buttonStyle, marginTop: 0, background: THEME.nightBlue, color: THEME.sand, width: '100%' }} onClick={() => setMenuView('log')}>{'\u30ed\u30b0'}</button>
            <button style={{ ...buttonStyle, marginTop: 0, background: '#ff5555', color: 'white', width: '100%' }} onClick={() => { audioEngine.playSfx('uiTapBottle'); if (window.confirm("タイトルに戻りますか？")) { setIsMenuOpen(false); setScreen('START'); } }}>
              タイトルへ戻る
            </button>
            <button data-testid="options-close" style={{ ...buttonStyle, marginTop: 0, background: '#666', color: 'white', width: '100%' }} onClick={() => { audioEngine.playSfx('uiTapBottle'); setIsMenuOpen(false); setMenuView('main'); }}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  };

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

  let mainContent = null;

  if (screen === 'START') {
    mainContent = (
      <div data-testid="start-screen" style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        {showSoundTest && <SoundTest onClose={() => setShowSoundTest(false)} isAudioEnabled={isAudioEnabled} />}
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ ...titleStyle, fontSize: '2.2em', margin: '0 0 5px 0' }}>{SHOP.name}</h1>
          <div style={{ color: THEME.sand, fontSize: '0.9em', letterSpacing: '0.1em', opacity: 0.8 }}>
            — {SHOP.localName} —          </div>
        </div>

        <div style={{ ...cardStyle, background: 'transparent', border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', padding: '0' }}>
          <div style={{ width: '100%', maxWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
            <div style={{ fontSize: '0.76em', color: THEME.sand, opacity: 0.85, textAlign: 'center' }}>縁の流れ</div>
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
            <div data-testid="route-mode-current" style={{ display: 'flex', justifyContent: 'center' }}>
              {renderRouteModeBadge()}
            </div>
          </div>

          {hasSave && (
            <button 
              data-testid="start-continue"
              onClick={handleContinue} 
              style={{ ...buttonStyle, background: THEME.starGold, width: '100%', maxWidth: '260px', margin: 0 }}
            >
              つづきから            </button>
          )}
          
          <button data-testid="start-new-game" onClick={handleStartGame} style={{ ...buttonStyle, width: '100%', maxWidth: '260px', margin: 0 }}>
            {hasSave ? 'はじめから' : '店を開く'}
          </button>

          <button 
            data-testid="memories-open"
            onClick={() => setScreen('MEMORIES')} 
            style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '100%', maxWidth: '260px', margin: 0 }}
          >
            思い出の記録
          </button>

          <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '260px' }}>
            <button 
              data-testid="sound-test-open"
              onClick={() => setShowSoundTest(true)} 
              style={{ ...buttonStyle, background: '#333', color: '#fff', fontSize: '0.85em', flex: 1, margin: 0 }}
            >
              サウンド設定
            </button>
            <button 
              data-testid="visual-test-open"
              onClick={() => setScreen('VISUAL_TEST')} 
              style={{ ...buttonStyle, background: '#333', color: '#fff', fontSize: '0.85em', flex: 1, margin: 0 }}
            >
              映像確認
            </button>
          </div>

          {hasSave && (
            <button 
              onClick={handleResetSave} 
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
  } else if (screen === 'PROLOGUE') {
    const prologuePages = [
      "砂漠の街マグリバル。路地の一角に、小さな鍛金術店「星瓶堂」がある。",
      "若店主ナーディルは、客の依頼に合う品を選びながら、今日も店を開く。",
      "これからの10日間。商いを重ねる中で、協力者たちとの縁も少しずつ育っていく。",
    ];
    mainContent = (
      <div data-testid="prologue-screen" style={{ ...containerStyle, position: 'relative' }}>
        {renderThemeStyles()}
        {renderBackground('START')}
        <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {renderAudioToggle()}
          <h1 style={{ ...titleStyle, marginBottom: '30px' }}>星瓶堂の始まり</h1>
          <div style={{ ...cardStyle, background: 'rgba(26, 42, 58, 0.95)', color: THEME.parchment, padding: '24px', maxWidth: '100%', width: '92%', boxSizing: 'border-box' }}>
            <VNBox
              speaker="ナーディル"
              pages={prologuePages}
              themeColor={THEME.brass}
              speed={textSpeedMeta.delay}
              skip={isInstantTextSpeed}
              onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'PROLOGUE' })}
              onComplete={() => {
                setIsPrologueComplete(true);
              }}
            />
            <div style={{ minHeight: '54px', marginTop: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {isPrologueComplete && (
                <button
                  data-testid="prologue-next"
                  onClick={() => {
                    audioEngine.playSfx('uiClickForward');
                    setScreen('HEROINE_SELECT');
                  }}
                  style={{ ...buttonStyle, width: '100%', maxWidth: '280px', margin: 0 }}
                >
                  星瓶堂へ進む
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } else if (screen === 'INTRO') {
    mainContent = (
      <div data-testid="intro-screen" style={{ ...containerStyle, position: 'relative' }}>
        {renderThemeStyles()}
        {renderBackground(screen)}
        <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {renderAudioToggle()}
          <h1 style={{ ...titleStyle, marginBottom: '20px' }}>{workshopState.day}日目</h1>
          <div style={{ ...cardStyle, background: 'transparent', boxShadow: 'none', padding: 0, marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '30px' }}>
              <HeroineDisplay heroine={activeHeroine} type="face" size="small" expression="normal" />
              <div style={{ flex: 1 }}>
                <VNBox
                  speaker={activeHeroine.name}
                  text={activeHeroine.greeting || `${PROTAGONIST.shortName}、こんにちは。今日もよろしくお願いします。`}
                  themeColor={activeHeroine.themeColor}
                  speed={textSpeedMeta.delay}
                  skip={isInstantTextSpeed}
                  onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'INTRO' })}
                  onComplete={handleBeginService}
                />
              </div>
            </div>
            <div style={{ ...narrativeBoxStyle, background: 'rgba(0,0,0,0.6)', color: '#fff', borderLeft: `4px solid ${THEME.brass}`, padding: '20px', marginBottom: '30px' }}>
              <p style={{ margin: '0 0 10px 0', lineHeight: '1.6' }}>星瓶堂の朝。ナディールは店を開き、客を迎える準備を整えている。</p>
              <p style={{ margin: 0, lineHeight: '1.6' }}>今日はどんな品が求められるのか。まずは相手の話を聞くところから始まる。</p>
            </div>
            <button data-testid="intro-start" onClick={handleBeginService} style={{ ...buttonStyle, width: '100%', maxWidth: '280px', marginTop: '10px' }}>営業を始める</button>
          </div>
        </div>
      </div>
    );
  } else if (screen === 'RESULT' && session) {
    const correctCount = session.answers.filter(a => a.isCorrect).length;
    const rank = getRankInfo(correctCount);
    const mgmt = getWorkshopResult(correctCount);

    const resultNarrations = {
      5: "大成功。今日は星瓶堂の流れがよく見えていた。",
      4: "よくやった。客の話を聞き取り、品を選ぶ手つきも安定している。",
      3: "まずまずだ。迷いはあるが、次の一手が見えている。",
      2: "もう少し。客の意図をつかめれば、品選びはもっと楽になる。",
      1: "惜しい。焦らず相手の話を聞くところから整えていこう。",
      0: "今日はうまくいかなかった。だが、次の営業で取り戻せる。",
    };
    
    mainContent = (
      <div style={{ ...containerStyle, position: 'relative' }}>
        {renderThemeStyles()}
        {renderBackground(screen)}
        <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {renderAudioToggle()}
          <h1 style={{ ...titleStyle, marginBottom: '20px' }}>業務報告書</h1>
          <div style={{ ...cardStyle, borderRadius: '8px', border: `3px double ${THEME.brass}`, background: 'rgba(244, 233, 213, 0.98)', padding: '25px', marginTop: '10px' }}>
            <div style={{ marginBottom: '25px' }}>
              <VNBox 
                text={resultNarrations[correctCount]}
                themeColor={THEME.brass}
                speed={textSpeedMeta.delay}
                skip={isInstantTextSpeed}
                onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'RESULT' })}
                onComplete={handleEndDay}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              <HeroineDisplay 
                heroine={activeHeroine} 
                type="face" 
                size="small" 
                expression={getResultExpression(correctCount)}
              />
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
            <button onClick={handleEndDay} style={{ ...buttonStyle, width: '100%', maxWidth: '240px' }}>次へ進む</button>
          </div>
        </div>
      </div>
    );
  } else if (screen === 'DAY_END') {
    const correctCount = session ? session.answers.filter(a => a.isCorrect).length : 0;
    const mgmt = getWorkshopResult(correctCount);

    mainContent = (
      <div style={{ ...containerStyle, position: 'relative' }}>
        {renderThemeStyles()}
        {renderBackground(screen)}
        <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '300px', background: 'rgba(255,255,255,0.95)', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1em', color: '#666', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>本日の営業記録</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px' }}>
               <div>売上: <span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{mgmt.sales}G</span></div>
               <div>評判: <span style={{ color: mgmt.reputation >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}</span></div>
            </div>
            
            <div style={{ textAlign: 'left', fontSize: '0.85em', color: '#444', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
              <strong>現在の工房の状態({workshopState.day}日目終了)</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                 <div>総売上: <span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{workshopState.sales}G</span></div>
                 <div>総評判: <span style={{ color: workshopState.reputation >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{workshopState.reputation >= 0 ? `+${workshopState.reputation}` : workshopState.reputation}</span></div>
                 <div>満足度: <span style={{ color: workshopState.satisfaction >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{workshopState.satisfaction >= 0 ? `+${workshopState.satisfaction}` : workshopState.satisfaction}</span></div>
                 <div>親密度: <span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{affection[activeHeroine.id]} / 100</span></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <button onClick={handleNextDay} style={{ ...buttonStyle, width: '100%', maxWidth: '280px', margin: 0 }}>次の日へ進む</button>
            <button onClick={handleBackToTitle} style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '100%', maxWidth: '280px', margin: 0 }}>タイトルへ戻る</button>
          </div>
        </div>
      </div>
    );
  } else if (screen === 'EVENT' && activeEvent) {

    const still = activeEvent.stillImageId ? STILL_IMAGES[activeEvent.stillImageId] : null;

    mainContent = (
      <div style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
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
              speaker={activeEvent.speaker}
              pages={getEventPages(activeEvent, routeMode)}
              themeColor={activeHeroine.themeColor}
              speed={textSpeedMeta.delay}
              skip={isInstantTextSpeed || seenEventIds.includes(activeEvent.id)}
              onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'EVENT' })}
              onComplete={handleCloseEvent}
            />
            <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '300px', marginTop: '20px' }}>
              <button 
                onClick={handleCloseEvent} 
                style={{ ...buttonStyle, flex: 1, margin: 0, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}` }}
              >
                次へ
              </button>
              {seenEventIds.includes(activeEvent.id) && (
                <button 
                  onClick={handleCloseEvent}
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
    const bgList = Object.values(BACKGROUND_IMAGES);
    const stillList = Object.values(STILL_IMAGES);
    
    const bg = bgList[bgTestIndex % bgList.length];
    const still = stillList[stillTestIndex % stillList.length];

    mainContent = (
      <div data-testid="visual-test-screen" style={{ ...containerStyle, padding: '0 0 20px 0' }}>
        {renderThemeStyles()}
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
              <div style={{ marginBottom: '15px', textAlign: 'left', minHeight: '46px' }}>
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
                      <img src={getFullPath(item.src)} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '800px' }}>
              <div style={{ marginBottom: '15px', textAlign: 'left', minHeight: '46px' }}>
                <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: THEME.brass, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{still.label}</div>
                <div style={{ fontSize: '0.75em', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }} title={`${still.id} | ${still.src} | focus ${still.focusX}, ${still.focusY}`}>ID: {still.id} | Path: {getFileName(still.src)} | Focus: {still.focusX}, {still.focusY}</div>
              </div>

              {/* Main Preview (Contain mode for inspection) */}
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${THEME.brass}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <img 
                  key={still.id}
                  src={getFullPath(still.src)} 
                  alt={still.label} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
                      <img src={getFullPath(item.src)} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else if (screen === 'MEMORIES') {
    const allEvents = Object.values(AFFECTION_EVENTS).flat();
    const seenEvents = allEvents.filter(e => seenEventIds.includes(e.id));
    
    const handleRecallEvent = (event) => {
      audioEngine.playSfx('uiConfirmChime');
      setActiveEvent(event);
      setIsRecallMode(true);
      setActiveHeroineId(event.heroineId); 
      setScreen('EVENT');
    };

    mainContent = (
      <div data-testid="memories-screen" style={{ ...containerStyle, padding: 0 }}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        {renderUtilityHeader('Memories', handleBackToTitle, null, 'memories')}
        <h1 style={{ ...titleStyle, display: 'none' }}>思い出の記録</h1>
        <div style={{ ...cardStyle, maxWidth: '800px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', margin: '0 8px 8px', width: 'calc(100% - 16px)', overflow: 'hidden' }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '2px' }}>
            {seenEvents.length === 0 ? (
              <div style={{ padding: '60px 20px', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                <p>まだ見返したい記憶はありません。</p>
                <p style={{ fontSize: '0.9em', marginTop: '10px' }}>営業を進めると、ここに記憶が積み上がっていきます。</p>
              </div>
            ) : (
              <div style={{ textAlign: 'left' }}>
                {HEROINES.map(heroine => {
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
                            onClick={() => handleRecallEvent(event)}
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
          <div style={{ display: 'none' }}>
            <button onClick={handleBackToTitle} style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '100%', maxWidth: '240px' }}>記録を閉じる</button>
          </div>
        </div>
      </div>
    );
  } else if (screen === 'HEROINE_SELECT') {
    const selectedHeroine = HEROINES.find(h => h.id === previewHeroineId) || HEROINES[0];

    mainContent = (
      <div data-testid="heroine-select-screen" style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        
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
                onClick={() => {
                  audioEngine.playSfx('uiTapBottle');
                  setPreviewHeroineId(h.id);
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
                  src={getFullPath(getHeroineAsset(h.id, 'face', 'normal'))}
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
             <HeroineDisplay heroine={selectedHeroine} type="face" size="medium" expression="normal" />
             <div style={{ textAlign: 'left', flex: 1 }}>
               <h3 style={{ margin: 0, fontSize: '1.3em', color: THEME.textDark }}>{selectedHeroine.name}</h3>
               <div style={{ fontSize: '0.85em', color: selectedHeroine.themeColor, fontWeight: 'bold' }}>{selectedHeroine.role}</div>
               <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                 親密度: <span style={{ fontWeight: 'bold', color: THEME.textDark }}>{affection[selectedHeroine.id]}</span>
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
            {selectedHeroine.description}
          </div>

          <button 
            data-testid="heroine-start"
            onClick={() => handleSelectHeroine(selectedHeroine.id)}
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
          display: 'flex', 
          gap: '12px', 
          marginTop: '20px', 
          width: '100%', 
          maxWidth: '350px' 
        }}>
            <button onClick={handleBackToTitle} style={{ ...buttonStyle, flex: 1, margin: 0, fontSize: '0.9em', background: THEME.nightBlue, color: THEME.sand, border: `1px solid ${THEME.brass}` }}>タイトルへ戻る</button>
           <button onClick={() => setScreen('MEMORIES')} style={{ ...buttonStyle, flex: 1, margin: 0, fontSize: '0.9em', background: THEME.nightBlue, color: THEME.sand, border: `1px solid ${THEME.brass}` }}>思い出の記録</button>
        </div>
      </div>
    );

  } else if (screen === 'FINAL_RESULT') {
    const finalAffection = affection[activeHeroineId];
    const finalSales = workshopState.sales;
    const finalReputation = workshopState.reputation;
    
    mainContent = (
      <div style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        <h1 style={titleStyle}>10日間の総決算</h1>
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

          <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.95em', marginBottom: '30px', lineHeight: '1.6' }}>10日間の営業を締めくくり、次の一歩へ進みます。</p>

          <button onClick={handleSeeEnding} style={{ ...buttonStyle, width: '100%', maxWidth: '280px' }}>結末を見届ける</button>
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
    const bg = endingData.bgId ? BACKGROUND_IMAGES[endingData.bgId] : BACKGROUND_IMAGES.shopInteriorService;

    mainContent = (
      <div style={{ ...containerStyle, position: 'relative' }}>
        {renderThemeStyles()}
        {/* Special Ending Background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${getFullPath(bg.src)})`,
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
              expression={endingData.expression} 
            />
          </div>

          <div style={{ width: '100%', padding: '10px' }}>
            <VNBox 
              speaker={activeHeroine.name}
              text={endingData.text}
              themeColor={activeHeroine.themeColor}
              speed={textSpeedMeta.delay}
              skip={isInstantTextSpeed}
              onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'ENDING' })}
              onComplete={handleFinishGame}
            />
          </div>

          <button onClick={handleFinishGame} style={{ ...buttonStyle, marginBottom: '20px', width: '100%', maxWidth: '240px' }}>タイトルへ戻る</button>
        </div>
      </div>
    );
  } else if (screen === 'QUIZ' && session) {
    const currentQuestion = session.questions[session.currentIndex];
    mainContent = (
      <div data-testid="quiz-screen" style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        <header style={{ 
          ...headerStyle, 
          background: THEME.nightBlue, 
          color: THEME.sand, 
          borderBottom: `2px solid ${THEME.brass}`,
          padding: '12px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          justifyContent: 'flex-start',
          gap: '20px'
        }}>
          <span style={{ fontSize: '0.9em' }}>依頼件数 {session.currentIndex + 1} / {session.questions.length}</span>
          <span style={{ fontWeight: 'bold', color: THEME.brass }}>報酬見込: {session.score} G</span>
        </header>

        <div style={{ ...cardStyle, maxWidth: '800px', marginTop: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ ...customerStyle, marginBottom: '35px' }}>
            <div style={{ 
              ...bubbleStyle, 
              background: '#fff', 
              color: '#333', 
              border: `2px solid ${THEME.brassDark}`,
              borderRadius: '15px 15px 15px 0',
              padding: '20px',
              fontSize: '1.1em',
              lineHeight: '1.6',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
            }}>
              {currentQuestion.request.text}
            </div>
          </div>

          <div className="choice-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px', 
            width: '100%',
            marginTop: 'auto',
            padding: '10px 0'
          }}>
            {currentQuestion.choices.map((item, index) => {
              const isSelected = quizFeedback?.itemId === item.id;
              const feedbackClass = isSelected ? (quizFeedback.isCorrect ? 'feedback-correct' : 'feedback-wrong') : '';
              const staggerClass = `quiz-option-${index}`;
              
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
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='10'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div style={{ ...itemNameStyle, color: THEME.textDark, borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '10px' }}>
                    {item.name}
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
    <div ref={outerWrapperRef} style={outerWrapperStyle}>
      <div style={canvasContainerStyle}>
        <div style={canvasStyle}>
          {isInitialLoading && renderLoadingOverlay("星瓶堂を開店中...")}
          {isHeroineLoading && renderLoadingOverlay(`${HEROINES.find(h => h.id === previewHeroineId)?.name}を待っています...`)}
          
          {renderMenuModal()}
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

function HeroineDisplay({ heroine, type, size = "large", expression = "normal" }) {
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
    backgroundColor: (heroine.themeColor || '#444') + '33',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${heroine.themeColor || '#ffcc00'}`,
    boxShadow: isStanding ? '0 12px 30px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.3)',
    flexShrink: 0,
    position: 'relative'
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: isStanding ? 'top center' : (heroine.visualConfig?.facePosition || 'center 20%'),
    display: imgError ? 'none' : 'block'
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
        onError={() => setImgError(true)}
      />
    </div>
  );
}

function VNBox({ text, pages, speaker, themeColor, onComplete, onPageComplete, speed = 30, skip = false }) {
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : [text || ""];
  const [pageIndex, setPageIndex] = useState(0);
  const currentText = pageList[pageIndex] || "";
  const [displayText, setDisplayText] = useState(skip ? currentText : "");
  const [isComplete, setIsComplete] = useState(skip);
  const [currentIndex, setCurrentIndex] = useState(0);
  const loggedPagesRef = useRef(new Set());

  const markPageComplete = () => {
    if (!currentText) return;
    const key = `${pageIndex}:${currentText}`;
    if (loggedPagesRef.current.has(key)) return;
    loggedPagesRef.current.add(key);
    onPageComplete?.({ speaker, text: currentText, pageIndex });
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
    } else if (onComplete) {
      onComplete();
    }
  };

  return (
    <div 
      data-testid="vn-box"
      onClick={handleClick}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        height: '160px',
        background: 'rgba(26, 42, 58, 0.95)',
        borderLeft: `4px solid ${themeColor || '#c5a059'}`,
        padding: '20px 24px',
        borderRadius: '0 12px 12px 0',
        cursor: 'pointer',
        color: '#f4e9d5',
        textAlign: 'left',
        position: 'relative',
        boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        userSelect: 'none',
        lineHeight: '1.7',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {speaker && (
        <div style={{ 
          fontSize: '0.85em', 
          color: themeColor || '#c5a059', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          letterSpacing: '0.08em',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}>
          {speaker}
        </div>
      )}
      <div style={{ fontSize: '1.05em', lineHeight: '1.6', minHeight: '4.8em', flex: 1 }}>
        {displayText}
        {!isComplete && <span style={{ animation: 'vn-blink 1s infinite', marginLeft: '4px', borderLeft: '2px solid #c5a059' }}>&nbsp;</span>}
      </div>
      {isComplete && pageIndex < pageList.length - 1 && (
        <div style={{ 
          position: 'absolute', 
          bottom: '12px', 
          right: '20px', 
          fontSize: '0.75em', 
          opacity: 0.7,
          color: themeColor || '#c5a059',
          fontWeight: 'bold',
          animation: 'vn-bounce 1s infinite'
        }}>
          NEXT
        </div>
      )}
      <style>{`
        @keyframes vn-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes vn-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      `}</style>
    </div>
  );
}

// Minimal Styles
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
