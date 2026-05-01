import React from 'react';
import GameHud from './GameHud';
import VNBox from './VNBox';
import { THEME } from './theme';
import { shouldSkipTypewriter } from './vnClickHelpers';
import { PROTAGONIST as NADER } from '../data/world';

const GREETING_VARIATIONS = [
  {
    monologue: (h) => `（今日もいい天気だ。この日差しなら、ガラスの輝きも一段と増すだろうな……）`,
    greeting: (h) => `「おはよう。朝から熱心ね。その顔、何か良い品でも入ったのかしら？」`,
    response: (h) => `「いらっしゃい。ええ、ちょうど朝日に透かして見ていたところです」`,
    farewell: `「ふふ、職人の目ね。それじゃ、私はこれで。今日も良い縁があるといいわね」`
  },
  {
    monologue: (h) => `（……暑い。砂漠の朝は早いというが、今日は一段と厳しいな。冷えた水が恋しい……）`,
    greeting: (h) => `「おはよう。あら、あなたもバテ気味？ 砂の熱に負けてちゃ、商売にならないわよ」`,
    response: (h) => `「……おはようございます。面目ない。しっかり水分を摂って、シャキッとしないと」`,
    farewell: `「そうよ。はい、これ。……それじゃ、私も仕事に戻るわ。無理しすぎないようにね」`
  },
  {
    monologue: (h) => `（今日は風が穏やかだな。街の喧騒もどこか遠くに感じる。……さて、開店の準備だ）`,
    greeting: (h) => `「いらっしゃい。今日は珍しく静かな朝ね。あなたの店も、心なしか落ち着いて見えるわ」`,
    response: (h) => `「ええ、心地よい静寂です。たまにはこういう、ゆったりとした時間も悪くないですね」`,
    farewell: `「ええ、同感よ。さて、私も行くわ。いい品ができるのを楽しみにしてる」`
  },
  {
    monologue: (h) => `（曇りか……。だが、こういう日の方が影が消えて、宝石の地色がよく見えるんだよな）`,
    greeting: (h) => `「お疲れ様。熱心に素材を眺めて……何か新しいインスピレーションでも湧いた？」`,
    response: (h) => `「いらっしゃい。ええ、曇天の下での輝きも、また一興だと思って見ていたんです」`,
    farewell: `「流石は星瓶堂の店主ね。それじゃ、開店の邪魔はしないわ。また後でね」`
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

  const handlePageChange = (index) => {
    const page = combinedPages[index];
    const isHeroinePage = page?.speakerId === activeHeroine.id;
    
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
              opacity: 1 - heroineOpacity, 
              transition: 'opacity 0.6s ease-in-out'
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
              transition: 'opacity 0.6s ease-in-out'
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
        
        {/* Top: Title */}
        <div style={{ flex: '0 0 auto', padding: '10px 0 5px 0', textAlign: 'center' }}>
          <h1 style={{ ...titleStyle, margin: 0, fontSize: '1.4em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
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
