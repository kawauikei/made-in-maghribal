import React from 'react';
import { THEME } from './theme';
import GameHud from './GameHud';
import VNBox from './VNBox';

/**
 * ResultScreen Component
 * Extracts the RESULT screen logic and UI from App.jsx.
 */
const ResultScreen = ({
  session,
  getRankInfo,
  getWorkshopResult,
  containerStyle,
  handleVnAreaClick,
  renderThemeStyles,
  renderBackground,
  screen,
  routeMode,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  titleStyle,
  cardStyle,
  vnRef,
  textSpeedMeta,
  shouldSkipTypewriter,
  isInstantTextSpeed,
  appendVnBacklog,
  handleEndDay,
  activeHeroine,
  HeroineDisplay,
  getResultExpression,
  lastAffectionGain,
  buttonStyle,
  handleNextDay
}) => {
  if (!session) return null;

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

  return (
    <div 
      data-testid="result-screen" 
      style={{ ...containerStyle, position: 'relative' }}
    >
      {renderThemeStyles && renderThemeStyles()}
      {renderBackground && renderBackground(screen)}
      <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <GameHud 
          screen={screen} 
          routeMode={routeMode} 
          onOpenLog={onOpenLog} 
          onOpenOptions={onOpenOptions} 
          onOpenHelp={onOpenHelp} 
        />
        <h1 style={{ 
          ...titleStyle, 
          position: 'absolute',
          top: '8px',
          left: '12px',
          margin: 0,
          color: THEME.nightBlue, 
          fontSize: '1.2em',
          maxWidth: '70%',
          textAlign: 'left',
          zIndex: 10
        }}>
          今回の営業記録
        </h1>
        <div style={{ ...cardStyle, borderRadius: '8px', border: `3px double ${THEME.brass}`, background: 'rgba(244, 233, 213, 0.98)', padding: '25px', marginTop: '10px' }}>
          <div style={{ marginBottom: '25px' }}>
            <VNBox 
              ref={vnRef}
              text={resultNarrations[correctCount]}
              themeColor={THEME.brass}
              speed={textSpeedMeta.delay}
              skip={shouldSkipTypewriter(isInstantTextSpeed)}
              hideSkip={true}
              hideNext={true}
              onPageComplete={(data) => appendVnBacklog({ ...data, screen: 'RESULT' })}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
            {HeroineDisplay && (
              <HeroineDisplay 
                heroine={activeHeroine} 
                type="face" 
                size="small" 
                expression={getResultExpression(correctCount)}
              />
            )}
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
          <button data-testid="day-end-next" onClick={handleEndDay} className="vn-button-reveal" style={{ ...buttonStyle, width: '100%', maxWidth: '280px' }}>次の営業へ</button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
