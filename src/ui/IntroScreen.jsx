import React from 'react';
import GameHud from './GameHud';
import VNBox from './VNBox';
import { THEME } from './theme';
import { shouldSkipTypewriter } from './vnClickHelpers';
import { PROTAGONIST as NADER } from '../data/world';

const IntroScreen = ({
  activeHeroine,
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
  const introPages = [
    { 
      speakerId: 'nader', 
      speaker: 'ナーディル', 
      text: `${activeHeroine.name}さん、いらっしゃい。今日はどのような品をお探しですか？` 
    },
    { 
      speakerId: activeHeroine.id, 
      speaker: activeHeroine.name, 
      text: activeHeroine.greeting || "ええ、相談に乗ってくれるかしら。" 
    }
  ];
  return (
    <div 
      data-testid="intro-screen" 
      style={{ ...containerStyle, position: 'relative' }}
      onClick={onVnAreaClick}
    >
      {renderThemeStyles()}
      {renderBackground(screen)}
      
      {/* Nadir Standing (Hidden in INTRO to focus on customer) */}

      {/* Heroine Standing (Conversation Partner - Positioned to peek above dock) */}
      <div style={{ 
        position: 'absolute', bottom: '15%', right: '0%', zIndex: 2, 
        pointerEvents: 'none', opacity: 1,
        height: '68%',
        display: 'flex', alignItems: 'flex-end',
        filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.3))'
      }}>
        <HeroineDisplay 
          heroine={activeHeroine} 
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
        <div style={{ flex: '0 0 auto', padding: '25px 0 5px 0', textAlign: 'center' }}>
          <h1 style={{ ...titleStyle, margin: 0, fontSize: '1.4em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {activeHeroine.name}との語らい
          </h1>
        </div>

        {/* Middle: Choice / Action Area */}
        <div style={{ 
          flex: '1 1 auto', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          paddingBottom: '20px' 
        }}>
          {/* Action Row (Future Choice Area) */}
          <div style={{ width: '94%', display: 'flex', justifyContent: 'center' }}>
            <button 
              data-testid="intro-start" 
              onClick={onBeginService} 
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
              営業を始める
            </button>
          </div>
        </div>

        {/* Bottom Dock: VN Box */}
        <div style={{ 
          flex: '0 0 auto', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          paddingBottom: '12px',
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
              pages={introPages}
              hint="客の好みに合わせて素材を選ぼう"
              themeColor={THEME.brass}
              speed={textSpeedMeta.delay}
              skip={shouldSkipTypewriter(isInstantTextSpeed)}
              getFaceIcon={getFaceIcon}
              onPageComplete={onPageComplete}
              onComplete={onBeginService}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
