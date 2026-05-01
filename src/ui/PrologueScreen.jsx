import React, { useState } from 'react';
import GameHud from './GameHud';
import VNBox from './VNBox';
import { THEME } from './theme';
import { shouldSkipTypewriter } from './vnClickHelpers';
import { PROTAGONIST as NADER } from '../data/world';

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
      style={{ ...containerStyle, position: 'relative' }}
      onClick={onVnAreaClick}
    >
      {renderThemeStyles()}
      {renderBackground('PROLOGUE')}
      
      {/* Nadir Standing (Guide Layer - Positioned to peek above dock) */}
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

        {/* Middle: Choice / Action Area */}
        <div style={{ 
          flex: '1 1 auto', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          paddingBottom: '12px' 
        }}>
          {/* Action Row (Future Choice Area) */}
          <div style={{ minHeight: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '94%' }}>
            {isPrologueComplete && (
              <button
                data-testid="prologue-next"
                onClick={onAdvanceToHeroineSelect}
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
            )}
          </div>
        </div>

        {/* Bottom Dock: VN Box */}
        <div style={{ 
          flex: '0 0 auto', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          paddingBottom: '8px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
        }}>
          {/* Main VN Box */}
          <div style={{ 
            ...cardStyle, 
            background: 'rgba(20, 30, 45, 0.96)', 
            color: THEME.parchment, 
            padding: '16px 20px', 
            width: '94%', 
            boxSizing: 'border-box',
            boxShadow: '0 -8px 25px rgba(0,0,0,0.6)',
            border: `1px solid ${THEME.brass}33`,
            borderRadius: '12px'
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
    </div>
  );
};

export default PrologueScreen;
