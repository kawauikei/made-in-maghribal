import { THEME } from './ui/theme';
import './ui/modalStyles';
import HelpModal from './ui/HelpModal';
import LogModal from './ui/LogModal';
import OptionsModal from './ui/OptionsModal';
import GameHud, { ROUTE_MODE_META, getRouteModeMeta, renderRouteModeBadge } from './ui/GameHud';
import { shouldIgnoreVnAdvanceClick, safeAdvanceVnBox, isVnAdvanceScreen, shouldSkipTypewriter } from './ui/vnClickHelpers';
import VisualTestScreen from './ui/VisualTestScreen';
import MemoriesScreen from './ui/MemoriesScreen';
import StartScreen from './ui/StartScreen';
import HeroineSelectScreen from './ui/HeroineSelectScreen';

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
import { checkNewEventUnlock, getEventPages, getRouteText } from './game/eventSystem';
import { AFFECTION_EVENTS } from './data/affectionEvents';
import { BACKGROUND_IMAGES, STILL_IMAGES } from './data/imageAssets';
import { ENDINGS } from './data/endings';
import { SFX } from './data/sfx';
import itemsData from './data/generated/items.json';
import VNBox from './ui/VNBox';
import SoundTest from './ui/SoundTest';



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

const NADER = {
  id: 'nader',
  name: 'ナーディル',
  themeColor: '#c5a059',
  role: '星瓶堂 店主',
  visualConfig: {
    facePosition: "center 20%",
    standingScale: 1.0
  }
};



export default function App() {
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
  const [isPrologueComplete, setIsPrologueComplete] = useState(false);
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
  const isClipped = rawScale < MIN_SCALE;

  const handleVnAreaClick = (e) => {
    if (shouldIgnoreVnAdvanceClick(e, { showOptions, showLog, showHelp, showSoundTest })) return;
    safeAdvanceVnBox(vnRef);
  };

  const outerWrapperStyle = {
    width: '100%',
    height: '100%',
    minHeight: isClipped ? `${measuredSize.height}px` : '100dvh',
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
    const prologuePages = [
      "砂漠の街マグリバル。路地の一角に、小さな鍛金術店「星瓶堂」がある。",
      "若店主ナーディルは、客の依頼に合う品を選びながら、今日も星瓶堂の営業を始める。",
      "砂漠の風は時に厳しいが、星々はいつも職人の手元を優しく照らしている。ここでは古くから鍛金術が物語を紡いできた。",
      "これからの10回の営業。商いを重ねる中で、協力者たちとの縁も少しずつ育っていく。",
      "あなたの手から生み出される品々が、誰かの未来を少しだけ輝かせることを願って。",
    ];
    mainContent = (
      <div 
        data-testid="prologue-screen" 
        style={{ ...containerStyle, position: 'relative' }}
        onClick={handleVnAreaClick}
      >
        {renderThemeStyles()}
        {renderBackground('START')}
        
        {/* Nadir Standing */}
        <div style={{ 
          position: 'absolute', bottom: 0, right: '5%', zIndex: 1, 
          pointerEvents: 'none', opacity: 0.9,
          transform: 'translateX(20%)'
        }}>
          <HeroineDisplay heroine={NADER} type="standing" size="large" expression="normal" />
        </div>

        <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={() => setShowLog(true)} 
          onOpenOptions={() => setShowOptions(true)} 
          onOpenHelp={() => setShowHelp(true)} 
        />
          <h1 style={{ ...titleStyle, marginBottom: '30px' }}>星瓶堂の始まり</h1>
          <div style={{ ...cardStyle, background: 'rgba(26, 42, 58, 0.95)', color: THEME.parchment, padding: '24px', maxWidth: '100%', width: '92%', boxSizing: 'border-box' }}>
            <VNBox
              ref={vnRef}
              speaker="ナーディル"
              pages={prologuePages}
              themeColor={THEME.brass}
              speed={textSpeedMeta.delay}
              skip={shouldSkipTypewriter(isInstantTextSpeed)}
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
      <div 
        data-testid="intro-screen" 
        style={{ ...containerStyle, position: 'relative' }}
        onClick={handleVnAreaClick}
      >
        {renderThemeStyles()}
        {renderBackground(screen)}

        {/* Nadir Bustup */}
        <div style={{ 
          position: 'absolute', bottom: 0, left: '5%', zIndex: 1, 
          pointerEvents: 'none', opacity: 0.85,
          transform: 'translateX(-15%)'
        }}>
          <HeroineDisplay heroine={NADER} type="standing" size="large" expression="normal" />
        </div>

        <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={() => setShowLog(true)} 
          onOpenOptions={() => setShowOptions(true)} 
          onOpenHelp={() => setShowHelp(true)} 
        />
          <h1 style={{ ...titleStyle, marginBottom: '20px' }}>第{workshopState.day}回 営業開始</h1>
          <div style={{ ...cardStyle, background: 'transparent', boxShadow: 'none', padding: 0, marginTop: '10px', zIndex: 3 }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '30px' }}>
              <HeroineDisplay heroine={activeHeroine} type="face" size="small" expression="normal" />
              <div style={{ flex: 1 }}>
                <VNBox
                  ref={vnRef}
                  speaker={activeHeroine.name}
                  text={activeHeroine.greeting || `${PROTAGONIST.shortName}、こんにちは。今日もよろしくお願いします。`}
                  themeColor={activeHeroine.themeColor}
                  speed={textSpeedMeta.delay}
                  skip={shouldSkipTypewriter(isInstantTextSpeed)}
                  onPageComplete={({ speaker, text }) => appendVnBacklog({ speaker, text, screen: 'INTRO' })}
                  onComplete={handleBeginService}
                />
              </div>
            </div>
            <div style={{ ...narrativeBoxStyle, background: 'rgba(0,0,0,0.6)', color: '#fff', borderLeft: `4px solid ${THEME.brass}`, padding: '20px', marginBottom: '30px' }}>
              <p style={{ margin: '0 0 10px 0', lineHeight: '1.6' }}>星瓶堂の営業が始まる。ナーディルは品を見立て、客を迎える準備を整えている。</p>
              <p style={{ margin: 0, lineHeight: '1.6' }}>今回はどんな品が求められるのか。まずは相手の話を聞くところから始まる。</p>
              <p style={{ margin: '10px 0 0 0', fontSize: '0.85em', color: THEME.oasisTeal }}>※ヒント：客の好みに合わせて素材や色を選ぶと、信頼が深まります。</p>
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
      5: "大成功。今回の営業は、星瓶堂の流れがよく見えていた。",
      4: "よくやった。客の話を聞き取り、品を選ぶ手つきも安定している。",
      3: "まずまずだ。迷いはあるが、次の一手が見えている。",
      2: "もう少し。客の意図をつかめれば、品選びはもっと楽になる。",
      1: "惜しい。焦らず相手の話を聞くところから整えていこう。",
      0: "今回はうまくいかなかった。だが、次の営業で取り戻せる。",
    };
    
    mainContent = (
      <div 
        data-testid="result-screen" 
        style={{ ...containerStyle, position: 'relative' }}
        onClick={handleVnAreaClick}
      >
        {renderThemeStyles()}
        {renderBackground(screen)}
        <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={() => setShowLog(true)} 
          onOpenOptions={() => setShowOptions(true)} 
          onOpenHelp={() => setShowHelp(true)} 
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
            <button data-testid="day-end-next" onClick={handleNextDay} style={{ ...buttonStyle, width: '100%', maxWidth: '280px' }}>次の営業へ</button>
          </div>
        </div>
      </div>
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
            <button onClick={handleNextDay} style={{ ...buttonStyle, width: '100%', maxWidth: '280px', margin: 0 }}>次の営業へ</button>
            <button onClick={handleBackToTitle} style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '100%', maxWidth: '280px', margin: 0 }}>タイトルへ戻る</button>
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

          <div style={{ width: '100%', padding: '10px' }}>
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

          <button onClick={handleFinishGame} style={{ ...buttonStyle, marginBottom: '20px', width: '100%', maxWidth: '240px' }}>タイトルへ戻る</button>
        </div>
      </div>
    );
  } else if (screen === 'QUIZ' && session) {
    const currentQuestion = session.questions[session.currentIndex];
    mainContent = (
      <div data-testid="quiz-screen" style={containerStyle}>
        {renderThemeStyles()}
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
