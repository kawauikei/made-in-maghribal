import React from 'react';
import GameHud from './GameHud';
import VNBox from './VNBox';
import { THEME } from './theme';
import { shouldSkipTypewriter } from './vnClickHelpers';
import { PROTAGONIST as NADER } from '../data/world';

const GREETING_VARIATIONS = [
  {
    id: "greet_1",
    monologue: (h) => `（今日もいい天気だ。この日差しなら、ガラス瓶の輝きも一段と増すだろうな……）`,
    greeting: (h) => `「こんにちは。店先の瓶、今日はずいぶん綺麗に光っているわね」`,
    response: (h) => `「いらっしゃい。ちょうど光に透かして、色の出方を見ていたところです」`,
    farewell: `「ふふ、職人の目ね。それじゃ、営業前の邪魔はこのくらいにしておくわ」`
  },
  {
    id: "greet_2",
    monologue: (h) => `（……暑い。砂漠の朝は早いというが、今日は一段と厳しいな。冷えた水が恋しい……）`,
    greeting: (h) => `「あら、少し顔が赤いわね。砂の熱に負けていたら、目利きも鈍るわよ」`,
    response: (h) => `「面目ない。水を足して、香草の冷茶でも用意しておきます」`,
    farewell: `「それがいいわ。無理をする店主より、涼しい顔で品を選ぶ店主の方が頼れるもの」`
  },
  {
    id: "greet_3",
    monologue: (h) => `（今日は風が穏やかだな。街の喧騒もどこか遠くに感じる。……さて、営業の準備だ）`,
    greeting: (h) => `「いらっしゃい。今日は珍しく静かね。星瓶堂の棚まで、少し落ち着いて見えるわ」`,
    response: (h) => `「ええ。こういう日は、香りも音もいつもよりよく分かる気がします」`,
    farewell: `「いい品が見つかりそうね。それじゃ、また後で顔を出すわ」`
  },
  {
    id: "greet_4",
    monologue: (h) => `（曇りか……。だが、こういう日の方が影が消えて、宝石の地色がよく見えるんだよな）`,
    greeting: (h) => `「熱心に素材を眺めているわね。曇り空でも、何か見えるものがあるの？」`,
    response: (h) => `「ええ。強い光がない日ほど、石や瓶の地色が素直に見えるんです」`,
    farewell: `「なるほどね。星瓶堂の店主らしい見方だわ。今日の目利き、少し楽しみにしている」`
  }
];

const IntroScreen = ({
  activeHeroine,
  activeDailyTalk,
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
  titleStyle,
  cardStyle,
  buttonStyle,
  narrativeBoxStyle
}) => {
  const [heroineOpacity, setHeroineOpacity] = React.useState(0);
  const [heroineExpression, setHeroineExpression] = React.useState('normal');
  const [nadirOpacity, setNadirOpacity] = React.useState(0); // Will be synced in handlePageChange or effect
  const visibleRef = React.useRef(false);

  // Transition management (generalizable wait & volume)
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

  const greetingIndex = (day - 1) % GREETING_VARIATIONS.length;
  const variation = GREETING_VARIATIONS[greetingIndex];

  const baseGreetingPage = {
    speakerId: 'nader',
    speaker: 'ナーディル',
    text: variation.monologue(activeHeroine)
  };

  const arrivalPage = {
    speakerId: activeHeroine.id,
    speaker: activeHeroine.name,
    text: variation.greeting(activeHeroine)
  };

  const farewellPage = {
    speakerId: activeHeroine.id,
    speaker: activeHeroine.name,
    text: variation.farewell
  };

  const startBusinessPage = {
    speakerId: 'nader',
    speaker: 'ナーディル',
    text: "ああ、ありがとう。……よし、星瓶堂を開けよう。"
  };

  // Fix: Ensure speakerId is present for icons in DailyTalk pages
  const talkPages = (activeDailyTalk?.pages || []).map(page => {
    if (page.speakerId) return page;
    let inferredId = null;
    if (page.speaker === 'ナーディル') inferredId = 'nader';
    else if (page.speaker === activeHeroine.name) inferredId = activeHeroine.id;
    return { ...page, speakerId: inferredId };
  });

  // If no specific DailyTalk, use the generic response from variation
  let conversationPages = talkPages;
  if (conversationPages.length === 0) {
    conversationPages = [{
      speakerId: 'nader',
      speaker: 'ナーディル',
      text: variation.response(activeHeroine)
    }];
  }

  const combinedPages = [
    baseGreetingPage,
    arrivalPage,
    ...conversationPages,
    farewellPage,
    startBusinessPage
  ];

  // Sync initial nadir visibility
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
      // Only show Nadir if heroine is NOT present
      if (!visibleRef.current) {
        setNadirOpacity(1);
        setHeroineOpacity(0);
      }
    } else if (isHeroinePage) {
      // Hide Nadir when heroine is present
      setNadirOpacity(0);
    }

    // Sync standing image expression with VNBox icon
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
    
    // Departure: If it's the second-to-last page (Heroine's Farewell), and it's completed:
    const isFarewellPage = data.pageIndex === combinedPages.length - 2;
    if (isFarewellPage && visibleRef.current) {
       triggerTransition('departure', () => {
         setHeroineOpacity(0);
         visibleRef.current = false;
       });
    }
  };

  const handleAreaClick = (e) => {
    onVnAreaClick(e);
  };

  return (
    <div 
      data-testid="intro-screen" 
      style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}
      onClick={handleAreaClick}
    >
      {renderThemeStyles()}
      {renderBackground(screen)}
      
      {/* Character Standing (Centered, Cross-fade Priority) */}
      <div style={{ 
        position: 'absolute', 
        bottom: '8%', // Slightly lower for better grounding
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
          {/* Nadir (Base/Fallback) */}
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
          {/* Heroine (Priority) */}
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
        <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={onOpenLog} 
          onOpenOptions={onOpenOptions} 
          onOpenHelp={onOpenHelp} 
        />
        
        {/* Top: Title (Top-Left Aligned for A-4) */}
        <div style={{ flex: '0 0 auto', padding: '24px 0 0 24px', textAlign: 'left', maxWidth: '70%', boxSizing: 'border-box' }}>
          <h1 style={{ ...titleStyle, margin: 0, fontSize: '1.2em', textShadow: '0 2px 4px rgba(0,0,0,0.5)', textAlign: 'left' }}>
            {activeHeroine.name}との語らい
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
