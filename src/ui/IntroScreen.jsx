import React from 'react';
import ScreenHeader from './ScreenHeader';
import VNBox from './VNBox';
import { THEME } from './theme';
import { shouldSkipTypewriter } from './vnClickHelpers';
import { PROTAGONIST as NADER } from '../data/world';
import { resolveTimePhase, TIME_PHASES } from '../game/timePhase';

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
    const greet = activeGreeting || {};

    if (Array.isArray(greet.pages) && greet.pages.length > 0) {
      pages.push(...greet.pages);
    } else {
      const legacyGreeting = greet || { monologue: "...", heroineReactions: { [hId]: { arrival: "...", response: "..." } } };
      const reactions = legacyGreeting.heroineReactions?.[hId] || { arrival: "Hello", response: "Welcome" };

      pages.push({
        speakerId: 'nader',
        speaker: 'NADER',
        text: typeof legacyGreeting.monologue === 'function' ? legacyGreeting.monologue(activeHeroine) : legacyGreeting.monologue
      });

      pages.push({
        speakerId: hId,
        speaker: activeHeroine.name,
        text: typeof reactions.arrival === 'function' ? reactions.arrival(activeHeroine) : reactions.arrival
      });

      pages.push({
        speakerId: 'nader',
        speaker: 'NADER',
        text: typeof reactions.response === 'function' ? reactions.response(activeHeroine) : reactions.response
      });
    }

    // 4. Daily Talks (Merged work + personal topics)
    if (activeDailyTalk && activeDailyTalk.pages) {
      activeDailyTalk.pages.forEach(page => {
        let inferredId = page.speakerId;
        if (!inferredId) {
          if (page.speaker === 'NADER') inferredId = 'nader';
          else if (page.speaker === activeHeroine.name) inferredId = hId;
        }
        pages.push({ ...page, speakerId: inferredId });
      });
    }

    // 5. Farewell (Heroine)
    pages.push({
      speakerId: hId,
      speaker: activeHeroine.name,
      text: "See you tomorrow."
    });

    // 6. Start Business (Nader)
    pages.push({
      speakerId: 'nader',
      speaker: 'NADER',
      text: "Open the shop."
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

export default IntroScreen;
