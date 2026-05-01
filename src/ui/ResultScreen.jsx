import React from 'react';
import { THEME } from './theme';
import GameHud from './GameHud';
import VNBox from './VNBox';

/**
 * ResultScreen Component
 * Reconstructed layout: full-screen with heroine standing,
 * centralized score panel, and compact result narration.
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

      {/* Content layer (z-index 10: above background + its built-in overlay) */}
      <div style={{ zIndex: 10, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 4px' }}>
        <GameHud
          screen={screen}
          routeMode={routeMode}
          onOpenLog={onOpenLog}
          onOpenOptions={onOpenOptions}
          onOpenHelp={onOpenHelp}
        />

        {/* Title */}
        <h1 style={{
          ...titleStyle,
          alignSelf: 'flex-start',
          margin: '4px 0 0 8px',
          color: THEME.parchment,
          fontSize: '1.15em',
          textAlign: 'left',
          zIndex: 10
        }}>
          今回の営業記録
        </h1>

        {/* Heroine Standing */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          margin: '8px 0 0 0',
          height: '155px',
          zIndex: 10
        }}>
          {HeroineDisplay && (
            <HeroineDisplay
              heroine={activeHeroine}
              type="standing"
              size="medium"
              expression={getResultExpression(correctCount)}
              noBorder={true}
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            />
          )}
        </div>

        {/* Score Panel */}
        <div style={{
          ...cardStyle,
          borderRadius: '10px',
          border: `2px solid ${THEME.brass}`,
          background: 'rgba(244, 233, 213, 0.95)',
          padding: '14px 18px',
          margin: '8px 0',
          width: '92%',
          maxWidth: '340px',
          textAlign: 'center',
          zIndex: 10
        }}>
          {/* Score */}
          <div style={{ fontSize: '1.5em', fontWeight: '900', color: THEME.brassDark, lineHeight: 1.2 }}>
            {session.score} 点
          </div>
          <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '8px' }}>
            依頼 {session.questions.length} 件中 {correctCount} 件達成
          </div>

          {/* 3-column stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            background: 'rgba(0,0,0,0.04)',
            padding: '8px 6px',
            borderRadius: '6px',
            marginBottom: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7em', color: '#888' }}>評判</div>
              <div style={{ fontSize: '1em', fontWeight: 'bold', color: mgmt.reputation >= 0 ? THEME.oasisTeal : '#844' }}>
                {mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7em', color: '#888' }}>売上</div>
              <div style={{ fontSize: '1em', fontWeight: 'bold', color: THEME.brassDark }}>
                {mgmt.sales}G
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7em', color: '#888' }}>満足度</div>
              <div style={{ fontSize: '1em', fontWeight: 'bold', color: mgmt.satisfaction >= 0 ? THEME.oasisTeal : '#844' }}>
                {mgmt.satisfaction >= 0 ? `+${mgmt.satisfaction}` : mgmt.satisfaction}
              </div>
            </div>
          </div>

          {/* Affection gain */}
          <div style={{
            fontSize: '0.9em',
            fontWeight: 'bold',
            color: activeHeroine.themeColor,
            padding: '4px 10px',
            background: `${activeHeroine.themeColor}15`,
            borderRadius: '999px',
            display: 'inline-block'
          }}>
            {activeHeroine.name}との縁 +{lastAffectionGain}
          </div>
        </div>

        {/* Result Narration (VNBox) */}
        <div style={{
          width: '92%',
          maxWidth: '340px',
          margin: '4px 0',
          zIndex: 10
        }}>
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

        {/* Next Day Button */}
        <button
          data-testid="day-end-next"
          onClick={handleEndDay}
          className="vn-button-reveal"
          style={{
            ...buttonStyle,
            width: '80%',
            maxWidth: '240px',
            margin: '6px 0 8px 0',
            zIndex: 10
          }}
        >
          次の営業へ
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
