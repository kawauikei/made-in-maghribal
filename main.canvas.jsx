import React from 'react';
import React, { useState, useEffect, useMemo } from 'react';
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
import { checkNewEventUnlock } from './game/eventSystem';
import { AFFECTION_EVENTS } from './data/affectionEvents';
import { BACKGROUND_IMAGES, STILL_IMAGES } from './data/imageAssets';

function SoundTest({ onClose, isAudioEnabled }) {
  const groups = [...new Set(SFX_CANDIDATES.map(c => c.group))];
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, overflowY: 'auto', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444', color: '#eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#f0d080', fontSize: '1.2rem' }}>SFX Sound Test</h2>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
        </div>
        {!isAudioEnabled && <div style={{ background: '#422', padding: '10px', marginBottom: '20px', borderRadius: '4px', color: '#f88', fontSize: '0.9rem' }}>音声がOFFのため、再生されません。</div>}
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
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState('START');
  const [activeHeroineId, setActiveHeroineId] = useState('hakima');
  const [workshopState, setWorkshopState] = useState(createInitialWorkshopState());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [showSoundTest, setShowSoundTest] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [bgTestIndex, setBgTestIndex] = useState(0);
  const [stillTestIndex, setStillTestIndex] = useState(0);
  
  // Affection / Intimacy State
  const [affection, setAffection] = useState(() => 
    createInitialAffection(HEROINES.map(h => h.id))
  );
  const [lastAffectionGain, setLastAffectionGain] = useState(0);

  // Event State
  const [seenEventIds, setSeenEventIds] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isRecallMode, setIsRecallMode] = useState(false);

  // Initial Load
  useEffect(() => {
    const data = loadSaveData();
    if (data) {
      setHasSave(true);
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
        workshopState,
        affection,
        isAudioEnabled,
        seenEventIds
      });
      setHasSave(true);
    }
  }, [screen, activeHeroineId, workshopState, affection, isAudioEnabled, seenEventIds]);

  // Sync mute state
  useEffect(() => {
    audioEngine.setMuted(!isAudioEnabled);
  }, [isAudioEnabled]);

  // Handle BGM per screen
  useEffect(() => {
    let trackId = null;
    if (screen === 'START' || screen === 'HEROINE_SELECT') {
      trackId = 'titleTheme';
    } else if (screen === 'QUIZ') {
      trackId = 'quizBasic01';
    } else if (screen === 'INTRO' || screen === 'RESULT' || screen === 'DAY_END') {
      trackId = 'workshopTheme';
    }

    if (trackId) {
      audioEngine.playTrack(TRACKS[trackId]);
    } else {
      audioEngine.stop();
    }
  }, [screen]);

  const activeHeroine = HEROINES.find(h => h.id === activeHeroineId) || HEROINES[0];

  // Go to Heroine Select (New Game)
  const handleStartGame = () => {
    audioEngine.playSfx('uiTapBottle');
    clearSaveData();
    setHasSave(false);
    
    // Reset states to default
    setActiveHeroineId('hakima');
    setWorkshopState(createInitialWorkshopState());
    setAffection(createInitialAffection(HEROINES.map(h => h.id)));
    setSeenEventIds([]);
    setActiveEvent(null);
    setSession(null);
    
    setScreen('HEROINE_SELECT');
  };

  // Continue from Save
  const handleContinue = () => {
    const data = loadSaveData();
    if (data) {
      audioEngine.playSfx('uiConfirmChime');
      setScreen(data.screen);
      setActiveHeroineId(data.activeHeroineId);
      setWorkshopState(data.workshopState);
      setAffection(data.affection);
      setSeenEventIds(data.seenEventIds || []);
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
  const handleSelectHeroine = (id) => {
    audioEngine.playSfx('uiConfirmChime');
    setActiveHeroineId(id);
    setScreen('INTRO');
  };

  // Go to INTRO (Next Day)
  const handleNextDay = () => {
    audioEngine.playSfx('uiTapBottle');
    setWorkshopState(prev => ({ ...prev, day: prev.day + 1 }));
    setScreen('INTRO');
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
  };

  // Handle answer selection
  const handleSelect = (itemId) => {
    if (!session || session.isFinished) return;
    
    // Play choice sound
    audioEngine.playSfx('quizChoicePick');
    
    const updatedSession = answerQuestion(session, itemId);
    
    // Play result sound
    const lastAnswer = updatedSession.answers[updatedSession.answers.length - 1];
    if (lastAnswer && lastAnswer.isCorrect) {
      audioEngine.playSfx('quizCorrectStarChime');
    } else {
      audioEngine.playSfx('quizWrongSandTap');
    }

    setSession(updatedSession);

    // If quiz just finished, accumulate results immediately
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
  };

  // --- RENDER HELPERS ---

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

  const SCREEN_BACKGROUNDS = {
    INTRO: 'shopExteriorDay',
    RESULT: 'shopInteriorWorkshop',
    DAY_END: 'shopExteriorNight'
  };

  const getFullPath = (src) => `${import.meta.env.BASE_URL}${src}`.replace(/([^:])\/\//g, '$1/');

  const renderBackground = (screen) => {
    const bgId = SCREEN_BACKGROUNDS[screen];
    if (!bgId) return null;
    const bg = BACKGROUND_IMAGES[bgId];
    if (!bg) return null;

    return (
      <>
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${getFullPath(bg.src)})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          zIndex: 0, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(26, 42, 58, 0.5)', // nightBlue overlay
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
    `}</style>
  );

  const renderAudioToggle = () => (
    <button 
      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '5px 12px',
        fontSize: '0.8em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}
    >
      <span>{isAudioEnabled ? '🔊 BGM ON' : '🔇 BGM OFF'}</span>
    </button>
  );

  if (screen === 'START') {
    return (
      <div style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        {showSoundTest && <SoundTest onClose={() => setShowSoundTest(false)} isAudioEnabled={isAudioEnabled} />}
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ ...titleStyle, fontSize: '3.2em', margin: '0 0 10px 0' }}>{SHOP.name}</h1>
          <div style={{ color: THEME.sand, fontSize: '1.2em', letterSpacing: '0.15em', textShadow: '1px 1px 2px #000', opacity: 0.9 }}>
            ～ {SHOP.localName} ～
          </div>
        </div>

        <div style={{ ...cardStyle, background: 'transparent', border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', padding: '0' }}>
          {hasSave && (
            <button 
              onClick={handleContinue} 
              style={{ ...buttonStyle, background: THEME.starGold, width: '100%', maxWidth: '300px', margin: 0 }}
            >
              つづきから
            </button>
          )}
          
          <button onClick={handleStartGame} style={{ ...buttonStyle, width: '100%', maxWidth: '300px', margin: 0 }}>
            {hasSave ? 'はじめから' : '店を開く'}
          </button>

          <button 
            onClick={() => setScreen('MEMORIES')} 
            style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '100%', maxWidth: '300px', margin: 0 }}
          >
            思い出の記録
          </button>

          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '300px' }}>
            <button 
              onClick={() => setShowSoundTest(true)} 
              style={{ ...buttonStyle, background: '#333', color: '#fff', fontSize: '0.9em', flex: 1, margin: 0 }}
            >
              Sound
            </button>
            <button 
              onClick={() => setScreen('VISUAL_TEST')} 
              style={{ ...buttonStyle, background: '#333', color: '#fff', fontSize: '0.9em', flex: 1, margin: 0 }}
            >
              Visual
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
                fontSize: '0.85em',
                marginTop: '15px',
                opacity: 0.7
              }}
            >
              記録を全て消去する
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'INTRO') {
    return (
      <div style={{ ...containerStyle, position: 'relative' }}>
        {renderThemeStyles()}
        {renderBackground(screen)}
        <div style={{ zIndex: 2, position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {renderAudioToggle()}
          <h1 style={titleStyle}>{workshopState.day}日目：{SHOP.name}の朝</h1>
          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
               <HeroineDisplay heroine={activeHeroine} type="standing" size="large" expression="normal" />
               <div style={{ ...narrativeBoxStyle, flex: '1', minWidth: '280px', marginBottom: 0 }}>
                  <div style={{ fontSize: '0.9em', color: THEME.brass, marginBottom: '10px', fontWeight: 'bold' }}>{SHOP.localName}</div>
                  <p>「おはよう、{PROTAGONIST.shortName}。今日もお店を開けましょうか」</p>
                  <p>朝の光が差し込む店内で、{activeHeroine.name}は手際よく準備を手伝ってくれている。</p>
                  <p>今日の客人は、どんな品を求めてやってくるだろうか。</p>
               </div>
            </div>
            <button onClick={handleBeginService} style={{ ...buttonStyle, width: '100%', maxWidth: '240px' }}>接客を始める</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'RESULT' && session) {
    const correctCount = session.answers.filter(a => a.isCorrect).length;
    const rank = getRankInfo(correctCount);
    const mgmt = getWorkshopResult(correctCount);

    const resultNarrations = {
      5: "お客は品を受け取ると、ぱっと顔を輝かせた。\n「これだよ、これ！　まさかこんなにぴったりの品があるなんて」\n今日の工房には、少し誇らしい空気が流れている。",
      4: "お客は満足そうに品を抱えた。\n「助かったよ。次に困った時も、ここに来ればよさそうだ」\n手応えのある接客だった。",
      3: "お客は少し迷いながらも、品を受け取った。\n「うん、悪くない。たぶんこれで何とかなると思う」\nもう少し相手の願いを読み取れれば、さらに良くなりそうだ。",
      2: "お客は首をかしげながら品を見つめた。\n「うーん……今回はこれで試してみるよ」\n工房の棚には、まだ学ぶべきことが多く残っている。",
      1: "お客は困ったように笑った。\n「気持ちはありがたいんだけど、ちょっと違うかもしれないな」\n今日の失敗も、きっと明日の目利きにつながる。",
      0: "お客は困ったように笑った。\n「気持ちはありがたいんだけど、ちょっと違うかもしれないな」\n今日の失敗も、きっと明日の目利きにつながる。"
    };
    
    return (
      <div style={{ ...containerStyle, position: 'relative' }}>
        {renderThemeStyles()}
        {renderBackground(screen)}
        <div style={{ zIndex: 2, position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {renderAudioToggle()}
          <h1 style={titleStyle}>業務報告書</h1>
          <div style={{ ...cardStyle, borderRadius: '4px', border: `3px double ${THEME.brass}` }}>
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '60px', height: '60px', border: `2px solid ${THEME.brass}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.brass, fontWeight: 'bold', transform: 'rotate(15deg)', opacity: 0.6, fontSize: '0.8em' }}>
              店印
            </div>
            <div style={narrativeBoxStyle}>
              {resultNarrations[correctCount].split('\n').map((line, i) => (
                <p key={i} style={{ margin: '0 0 8px 0' }}>{line}</p>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              <HeroineDisplay 
                heroine={activeHeroine} 
                type="face" 
                size="small" 
                expression={getResultExpression(correctCount)}
              />
              <div style={{ fontSize: '1.1em', color: activeHeroine.themeColor, fontWeight: 'bold' }}>
                {activeHeroine.name}との絆 +{lastAffectionGain}
              </div>
            </div>

            <div style={{ margin: '20px 0', border: `1px solid ${THEME.brassDark}`, background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '4px' }}>
              <div style={{ fontSize: '1.2em', color: THEME.brassDark, fontWeight: 'bold' }}>
                評価：{rank.title}
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

            <h2 style={{ margin: '10px 0', fontSize: '1.2em' }}>最終評価: {session.score} 点</h2>
            <p style={{ fontSize: '1em', marginBottom: '20px', color: '#666' }}>
              依頼 {session.questions.length} 件中 {correctCount} 件達成
            </p>
            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '4px', marginBottom: '30px', fontStyle: 'italic', color: '#444', fontSize: '0.9em' }}>
              「{rank.message}」
            </div>
            <button onClick={handleEndDay} style={{ ...buttonStyle, width: '100%', maxWidth: '240px' }}>店じまいする</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'DAY_END' && session) {
    const correctCount = session.answers.filter(a => a.isCorrect).length;
    const mgmt = getWorkshopResult(correctCount);

    return (
      <div style={{ ...containerStyle, position: 'relative' }}>
        {renderThemeStyles()}
        {renderBackground(screen)}
        <div style={{ zIndex: 2, position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {renderAudioToggle()}
          <h1 style={titleStyle}>工房日誌</h1>
          <div style={{ ...cardStyle, borderRadius: '4px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <HeroineDisplay 
              heroine={activeHeroine} 
              type="face" 
              size="medium" 
              expression={getDayEndExpression(correctCount)}
            />
            <div style={{ ...narrativeBoxStyle, flex: '1', minWidth: '280px', marginBottom: 0, textAlign: 'left' }}>
              <p>夕暮れの工房に、今日選ばれた品々の余韻が残っている。</p>
              <p>小さな手応えを積み重ねれば、この店にもきっと評判が根づいていくはずだ。</p>
              <p style={{ marginTop: '10px', color: THEME.brass, fontWeight: 'bold' }}>
                {activeHeroine.name}：「お疲れ様。明日の準備をしたら、今日はもう休みましょう」
              </p>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(0,0,0,0.05)', 
            padding: '20px', 
            borderRadius: '4px', 
            marginBottom: '30px',
            border: `1px solid ${THEME.brassDark}`
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1em', color: '#666', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>本日の経営記録</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px' }}>
               <div>売上: <span style={{ color: THEME.brassDark, fontWeight: 'bold' }}>{mgmt.sales}G</span></div>
               <div>評判: <span style={{ color: mgmt.reputation >= 0 ? THEME.oasisTeal : '#844', fontWeight: 'bold' }}>{mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}</span></div>
            </div>
            
            <div style={{ textAlign: 'left', fontSize: '0.85em', color: '#444', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
              <strong>現在の工房の状態 ({workshopState.day}日目終了)</strong>
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
    </div>
    );
  }

  if (screen === 'EVENT' && activeEvent) {
    const still = activeEvent.stillImageId ? STILL_IMAGES[activeEvent.stillImageId] : null;

    return (
      <div style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        <h1 style={titleStyle}>親愛の記録：{activeEvent.title}</h1>
        <div style={{ ...cardStyle, background: THEME.nightBlue, color: THEME.parchment }}>
          {still && (
            <div style={{ 
              width: '100%', 
              height: '300px', 
              background: '#000', 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: `2px solid ${THEME.brass}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}>
              <img 
                src={getFullPath(still.src)} 
                alt={still.label}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span style="color:#f44">Still Load Failed</span>';
                }}
              />
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {!still && (
              <HeroineDisplay 
                heroine={activeHeroine} 
                type="standing" 
                size="large" 
                expression={activeEvent.expression} 
              />
            )}
            <div style={{ ...narrativeBoxStyle, flex: '1', minWidth: '280px', marginBottom: 0 }}>
              <div style={{ fontSize: '0.9em', color: activeHeroine.themeColor, fontWeight: 'bold', marginBottom: '10px' }}>
                {activeEvent.speaker}
              </div>
              <p style={{ fontSize: '1.1em', lineHeight: '1.6' }}>「{activeEvent.text}」</p>
            </div>
          </div>
          <button 
            onClick={handleCloseEvent} 
            style={{ ...buttonStyle, width: '100%', maxWidth: '240px', background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}` }}
          >
            記録を閉じる
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'VISUAL_TEST') {
    const bgList = Object.values(BACKGROUND_IMAGES);
    const stillList = Object.values(STILL_IMAGES);
    
    const bg = bgList[bgTestIndex % bgList.length];
    const still = stillList[stillTestIndex % stillList.length];

    const getFullPath = (src) => `${import.meta.env.BASE_URL}${src}`.replace(/([^:])\/\//g, '$1/');

    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Visual Asset Test</h1>
        <div style={{ ...cardStyle, maxWidth: '800px' }}>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ color: '#aaa', fontSize: '0.9em', margin: 0 }}>Background: {bg.label} ({bg.id})</h3>
              <button 
                onClick={() => setBgTestIndex(prev => (prev + 1) % bgList.length)}
                style={{ ...buttonStyle, marginTop: 0, padding: '4px 12px', fontSize: '0.8em' }}
              >
                Next Background
              </button>
            </div>
            <div style={{ 
              width: '100%', 
              height: '240px', 
              background: '#000', 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: '2px solid #444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                key={bg.id}
                src={getFullPath(bg.src)} 
                alt={bg.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span style="color:#f44">Background Load Failed</span>';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ color: '#aaa', fontSize: '0.9em', margin: 0 }}>Still: {still.label} ({still.id})</h3>
              <button 
                onClick={() => setStillTestIndex(prev => (prev + 1) % stillList.length)}
                style={{ ...buttonStyle, marginTop: 0, padding: '4px 12px', fontSize: '0.8em' }}
              >
                Next Still
              </button>
            </div>
            <div style={{ 
              width: '100%', 
              height: '340px', 
              background: '#000', 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: '2px solid #444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
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
          </div>

          <button onClick={handleBackToTitle} style={buttonStyle}>タイトルへ戻る</button>
        </div>
      </div>
    );
  }

  if (screen === 'MEMORIES') {
    const allEvents = Object.values(AFFECTION_EVENTS).flat();
    const seenEvents = allEvents.filter(e => seenEventIds.includes(e.id));
    
    const handleRecallEvent = (event) => {
      audioEngine.playSfx('uiConfirmChime');
      setActiveEvent(event);
      setIsRecallMode(true);
      setActiveHeroineId(event.heroineId); 
      setScreen('EVENT');
    };

    return (
      <div style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        <h1 style={titleStyle}>思い出の記録</h1>
        <div style={{ ...cardStyle, maxWidth: '800px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            {seenEvents.length === 0 ? (
              <div style={{ padding: '60px 20px', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                <p>まだ記された思い出はありません。</p>
                <p style={{ fontSize: '0.9em', marginTop: '10px' }}>日々の仕事を通じて、彼女たちとの絆を深めましょう。</p>
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
                        {heroine.name}との記録
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
                            <span style={{ fontSize: '0.8em', color: THEME.brassDark }}>閲覧する →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={handleBackToTitle} style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '100%', maxWidth: '240px' }}>記録を閉じる</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'HEROINE_SELECT') {
    return (
      <div style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        <h1 style={titleStyle}>パートナーを選ぶ</h1>
        <div style={{ ...cardStyle, maxWidth: '900px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
          <p style={{ color: THEME.sand, marginBottom: '30px', textShadow: '1px 1px 2px #000' }}>
            星瓶堂の仕事を手伝ってくれる、腕利きの錬金術師たちです。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', width: '100%' }}>
            {HEROINES.map(heroine => (
              <div 
                key={heroine.id} 
                className="heroine-card"
                onClick={() => handleSelectHeroine(heroine.id)}
                style={{ 
                  background: THEME.parchment,
                  padding: '25px', 
                  borderRadius: '8px', 
                  border: `2px solid ${THEME.brass}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: heroine.themeColor }} />
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                  <HeroineDisplay heroine={heroine} type="face" size="large" expression="normal" />
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4em', color: THEME.textDark }}>{heroine.name}</h3>
                <div style={{ fontSize: '0.9em', color: heroine.themeColor, fontWeight: 'bold', marginBottom: '10px' }}>{heroine.role}</div>
                <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                  現在の親密度: <span style={{ fontWeight: 'bold', color: THEME.textDark }}>{affection[heroine.id]}</span>
                </div>
                <p style={{ fontSize: '0.9em', color: '#444', textAlign: 'left', margin: '0 0 20px 0', lineHeight: '1.6', flex: 1 }}>
                  {heroine.description}
                </p>
                <button style={{ ...buttonStyle, width: '100%', margin: 0 }}>手伝いを頼む</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button onClick={handleBackToTitle} style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '140px' }}>戻る</button>
            <button onClick={() => setScreen('MEMORIES')} style={{ ...buttonStyle, background: THEME.nightBlue, color: THEME.sand, border: `2px solid ${THEME.brass}`, width: '140px' }}>思い出</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'QUIZ' && session) {
    const currentQuestion = session.questions[session.currentIndex];
    return (
      <div style={containerStyle}>
        {renderThemeStyles()}
        {renderAudioToggle()}
        <header style={{ 
          ...headerStyle, 
          background: THEME.nightBlue, 
          color: THEME.sand, 
          borderBottom: `2px solid ${THEME.brass}`,
          padding: '12px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          <span style={{ fontSize: '0.9em' }}>鑑定依頼 {session.currentIndex + 1} / {session.questions.length}</span>
          <span style={{ fontWeight: 'bold', color: THEME.brass }}>報酬見込: {session.score} G</span>
        </header>

        <div style={{ ...cardStyle, maxWidth: '800px', marginTop: '80px' }}>
          <div style={{ ...customerStyle, marginBottom: '30px' }}>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            width: '100%' 
          }}>
            {currentQuestion.choices.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleSelect(item.id)}
                className="item-card"
                style={{
                  background: 'rgba(0,0,0,0.03)',
                  padding: '15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative'
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
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback / Loading
  return (
    <div style={containerStyle}>
      <p>Loading...</p>
      <button onClick={handleBackToTitle} style={buttonStyle}>タイトルへ戻る</button>
    </div>
  );
}

// --- SUB COMPONENTS ---

function HeroineDisplay({ heroine, type, size = "large", expression = "normal" }) {
  const [imgError, setImgError] = useState(false);
  const assetPath = getHeroineAsset(heroine.id, type, expression);
  const fullPath = assetPath ? `${import.meta.env.BASE_URL}${assetPath}`.replace(/([^:])\/\//g, '$1/') : null;

  const isPortrait = type === 'standing';
  const sizePx = size === 'large' ? 120 : size === 'medium' ? 80 : 60;
  
  if (type === 'face') {
    return (
      <div style={{
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        borderRadius: '50%',
        backgroundColor: heroine.themeColor + '33',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: heroine.themeColor,
        fontWeight: 'bold',
        fontSize: `${sizePx * 0.4}px`,
        overflow: 'hidden',
        border: `2px solid ${heroine.themeColor}`,
        position: 'relative'
      }}>
        <img 
          src={fullPath} 
          alt={heroine.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center 20%',
            display: imgError ? 'none' : 'block'
          }}
          onError={() => setImgError(true)}
        />
        {imgError && <span>{heroine.name[0]}</span>}
      </div>
    );
  }

  const displaySize = size === 'large' ? (isPortrait ? 180 : 100) : (isPortrait ? 80 : 50);

  const containerStyle = {
    width: isPortrait ? `${displaySize * 0.7}px` : `${displaySize}px`,
    height: `${displaySize}px`,
    borderRadius: isPortrait ? '12px' : '50%',
    overflow: 'hidden',
    background: heroine.themeColor || '#444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${heroine.themeColor || '#ffcc00'}`,
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    flexShrink: 0
  };

  if (!fullPath || imgError) {
    return (
      <div style={containerStyle}>
        <span style={{ fontSize: size === 'large' ? '2em' : '1.2em', fontWeight: 'bold', color: '#111' }}>
          {heroine.name[0]}
        </span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <img 
        src={fullPath} 
        alt={heroine.name} 
        style={{ width: '100%', height: '100%', objectFit: isPortrait ? 'contain' : 'cover' }}
        onError={() => setImgError(true)}
      />
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
  padding: '20px',
  fontFamily: 'sans-serif',
  background: '#1a2a3a', // nightBlue base
  color: '#eee',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

const titleStyle = { 
  color: '#e2d1b1', // sand
  marginBottom: '40px',
  textAlign: 'center',
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  letterSpacing: '0.05em'
};

const headerStyle = {
  width: '100%',
  maxWidth: '600px',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
  fontSize: '1.1em',
  color: '#e2d1b1'
};

const cardStyle = {
  width: '100%',
  maxWidth: '600px',
  padding: '30px',
  border: `2px solid ${THEME.brass}`,
  borderRadius: '8px', // Slightly sharper workshop look
  background: THEME.parchment,
  color: THEME.textDark,
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  position: 'relative'
};

const customerStyle = {
  marginBottom: '30px',
  display: 'flex',
  justifyContent: 'center'
};

const bubbleStyle = {
  background: '#fff',
  color: '#222',
  padding: '15px 25px',
  borderRadius: '20px',
  position: 'relative',
  fontSize: '1.2em',
  fontWeight: 'bold',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
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

const narrativeBoxStyle = {
  background: 'rgba(0, 0, 0, 0.75)',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '30px',
  textAlign: 'left',
  lineHeight: '1.8',
  fontSize: '1em',
  color: '#f4e9d5', // parchment text
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
  boxShadow: '0 4px 0 #8e6d2e', // 3D effect
  outline: 'none',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent'
};


const apiKey = ""; // Gemini Canvas direct paste version

export default function CanvasApp() {
  return <App apiKey={apiKey} />;
}
