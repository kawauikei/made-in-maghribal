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
import PrologueScreen from './ui/PrologueScreen';
import IntroScreen from './ui/IntroScreen';
import ResultScreen from './ui/ResultScreen';
import QuizScreen from './ui/QuizScreen';

import React, { useState, useEffect, useRef } from 'react';
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
import VNBox from './ui/VNBox';
import SoundTest from './ui/SoundTest';
import DebugPanel from './ui/DebugPanel';
import ScreenHeader from './ui/ScreenHeader';
import TimePhaseBadge from './ui/TimePhaseBadge';
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


export default function App() {
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
          seenEventIds
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

  // --- Asset Loading State (M8-28) ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isHeroineLoading, setIsHeroineLoading] = useState(false);

  const outerWrapperRef = useRef(null);
  const vnRef = useRef(null);
  const debugAutoSkipAppliedRef = useRef(false);

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

    if (shouldClearBackgroundOverride) {
      setEventBackgroundOverride(null);
    }

    switch (nextScreen) {
      case 'MEMORIES':
        setIsRecallMode(false);
        setScreen('MEMORIES');
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
      seenEventIds
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
    
    const updatedSession = answerQuestion(session, itemId);
    const lastAnswer = updatedSession.answers[updatedSession.answers.length - 1];
    const isCorrect = lastAnswer.isCorrect;

    // Trigger visual feedback
    setQuizFeedback({ itemId, isCorrect });

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
                heroine={activeHeroine} 
                type="standing" 
                size="large" 
                expression={eventHeroineExpression} 
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
                pages={getEventPages(activeEvent, routeMode).map(page => {
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
                  const pages = getEventPages(activeEvent, routeMode);
                  const page = pages[index];
                  // Only update heroine expression when the speaker is the active heroine
                  if (page?.expression && page?.speakerId === activeHeroine.id) {
                    setEventHeroineExpression(page.expression);
                  }
                  setEventSpeakerId(page?.speakerId || null);
                  if (page?.backgroundId) {
                    setEventBackgroundOverride(page.backgroundId);
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
                  : still.stillCrop?.objectPosition || `${(still.focusX ?? 0.5) * 100}% ${(still.focusY ?? 0.5) * 100}%`
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
                pages={getEventPages(activeEvent, routeMode).map(page => {
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
                  const pages = getEventPages(activeEvent, routeMode);
                  const page = pages[index];
                  // Only update heroine expression when the speaker is the active heroine
                  if (page?.expression && page?.speakerId === activeHeroine.id) {
                    setEventHeroineExpression(page.expression);
                  }
                  setEventSpeakerId(page?.speakerId || null);
                  if (page?.backgroundId) {
                    setEventBackgroundOverride(page.backgroundId);
                  }
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
          {!['INTRO', 'EVENT'].includes(screen) && (
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
