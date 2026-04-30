import React, { useState } from 'react';
import GameHud from './GameHud';
import VNBox from './VNBox';
import { THEME } from './theme';
import { shouldSkipTypewriter } from './vnClickHelpers';
import { PROTAGONIST as NADER } from '../data/world';

const prologuePages = [
  "砂漠の街マグリバル。路地の一角に、小さな鍛金術店「星瓶堂」がある。",
  "若店主ナーディルは、客の依頼に合う品を選びながら、今日も星瓶堂の営業を始める。",
  "砂漠の風は時に厳しいが、星々はいつも職人の手元を優しく照らしている。ここでは古くから鍛金術が物語を紡いできた。",
  "これからの10回の営業。商いを重ねる中で、協力者たちとの縁も少しずつ育っていく。",
  "あなたの手から生み出される品々が、誰かの未来を少しだけ輝かせることを願って。",
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
  containerStyle,
  titleStyle,
  cardStyle,
  buttonStyle
}) => {
  const [isPrologueComplete, setIsPrologueComplete] = useState(false);

  return (
    <div 
      data-testid="prologue-screen" 
      style={{ ...containerStyle, position: 'relative' }}
      onClick={onVnAreaClick}
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
          onOpenLog={onOpenLog} 
          onOpenOptions={onOpenOptions} 
          onOpenHelp={onOpenHelp} 
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
            onPageComplete={onPageComplete}
            onComplete={() => {
              setIsPrologueComplete(true);
            }}
          />
          <div style={{ minHeight: '54px', marginTop: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isPrologueComplete && (
              <button
                data-testid="prologue-next"
                onClick={onAdvanceToHeroineSelect}
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
};

export default PrologueScreen;
