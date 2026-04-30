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
  containerStyle,
  titleStyle,
  cardStyle,
  buttonStyle,
  narrativeBoxStyle
}) => {
  return (
    <div 
      data-testid="intro-screen" 
      style={{ ...containerStyle, position: 'relative' }}
      onClick={onVnAreaClick}
    >
      {renderThemeStyles()}
      {renderBackground(screen)}
      
      {/* Nadir Standing */}
      <div style={{ 
        position: 'absolute', bottom: 0, left: '5%', zIndex: 1, 
        pointerEvents: 'none', opacity: 0.9,
        transform: 'translateX(-20%)'
      }}>
        <HeroineDisplay heroine={NADER} type="standing" size="large" expression="normal" />
      </div>

      {/* Heroine Standing */}
      <div style={{ 
        position: 'absolute', bottom: 0, right: '5%', zIndex: 1, 
        pointerEvents: 'none', opacity: 0.9,
        transform: 'translateX(20%)'
      }}>
        <HeroineDisplay heroine={activeHeroine} type="standing" size="large" expression="normal" />
      </div>

      <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={onOpenLog} 
          onOpenOptions={onOpenOptions} 
          onOpenHelp={onOpenHelp} 
        />
        <h1 style={{ ...titleStyle, marginBottom: '20px' }}>
          {activeHeroine.name}との語らい
        </h1>
        <div style={{ ...cardStyle, background: 'rgba(26, 42, 58, 0.9)', color: THEME.parchment, padding: '24px', width: '92%', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '15px' }}>
            <VNBox
              ref={vnRef}
              speaker="ナーディル"
              text={`${activeHeroine.name}さん、いらっしゃい。今日はどのような品をお探しですか？`}
              themeColor={THEME.brass}
              speed={textSpeedMeta.delay}
              skip={shouldSkipTypewriter(isInstantTextSpeed)}
              onPageComplete={onPageComplete}
              onComplete={onBeginService}
            />
          </div>
          <div style={{ ...narrativeBoxStyle, background: 'rgba(0,0,0,0.6)', color: '#fff', borderLeft: `4px solid ${THEME.brass}`, padding: '20px', marginBottom: '30px' }}>
            <p style={{ margin: '0 0 10px 0', lineHeight: '1.6' }}>星瓶堂の営業が始まる。ナーディルは品を見立て、客を迎える準備を整えている。</p>
            <p style={{ margin: 0, lineHeight: '1.6' }}>今回はどんな品が求められるのか。まずは相手の話を聞くところから始まる。</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '0.85em', color: THEME.oasisTeal }}>※ヒント：客の好みに合わせて素材や色を選ぶと、信頼が深まります。</p>
          </div>
          <button 
            data-testid="intro-start" 
            onClick={onBeginService} 
            style={{ ...buttonStyle, width: '100%', maxWidth: '280px', marginTop: '10px' }}
          >
            営業を始める
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
