import React from 'react';
import { THEME } from './theme';
import GameHud from './GameHud';

/**
 * ResultScreen Component
 * Heroine standing (left) + speech bubble (right) + score panel (bottom).
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
    5: "大成功。星瓶堂の流れが、よく見えていたわ。",
    4: "よくやったわ。手つきも安定してきたじゃない。",
    3: "まずまずね。次の一手はもう見えてるでしょ。",
    2: "もう少しよ。客の意図をつかめば、もっと楽になるわ。",
    1: "惜しいわね。焦らず相手の話を聞くところからよ。",
    0: "今回はダメだったわ。でも、次で取り戻せばいい。",
  };

  return (
    <div
      data-testid="result-screen"
      style={{ ...containerStyle, position: 'relative' }}
    >
      {renderThemeStyles && renderThemeStyles()}
      {renderBackground && renderBackground(screen)}

      {/* Content layer (z-index 10: above background + overlay) */}
      <div style={{ zIndex: 10, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 8px' }}>
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
          margin: '4px 0 0 4px',
          color: THEME.parchment,
          fontSize: '1.15em',
          textAlign: 'left',
          zIndex: 10
        }}>
          今回の営業記録
        </h1>

        {/* Heroine Standing + Speech Bubble Row */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'flex-start',
          marginTop: '4px',
          minHeight: '210px',
          zIndex: 10
        }}>
          {/* Heroine Standing (left) - clipped at bottom, hidden behind score panel */}
          {HeroineDisplay && (
            <div style={{
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'flex-end',
              height: '210px',
              overflow: 'hidden',
              zIndex: 5
            }}>
              <HeroineDisplay
                heroine={activeHeroine}
                type="standing"
                size="large"
                expression={getResultExpression(correctCount)}
                noBorder={true}
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
              />
            </div>
          )}

          {/* Speech Bubble (right of standing) */}
          <div style={{
            flex: '1 1 auto',
            marginLeft: '8px',
            marginTop: '16px',
            background: 'rgba(244, 233, 213, 0.92)',
            border: `1.5px solid ${THEME.brass}`,
            borderRadius: '12px',
            padding: '10px 14px',
            position: 'relative',
            maxWidth: '180px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {/* Bubble tail (pointing left toward heroine) */}
            <div style={{
              position: 'absolute',
              left: '-8px',
              top: '16px',
              width: '0',
              height: '0',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: `8px solid ${THEME.brass}`
            }} />
            <div style={{
              position: 'absolute',
              left: '-5px',
              top: '17px',
              width: '0',
              height: '0',
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderRight: '7px solid rgba(244, 233, 213, 0.92)'
            }} />
            <div style={{
              fontSize: '0.78em',
              color: THEME.textDark,
              lineHeight: '1.5',
              fontStyle: 'italic'
            }}>
              {resultNarrations[correctCount]}
            </div>
          </div>
        </div>

        {/* Score Panel (overlaps standing bottom - opaque top hides clip edge) */}
        <div style={{
          ...cardStyle,
          borderRadius: '10px',
          border: `2px solid ${THEME.brass}`,
          background: 'rgba(244, 233, 213, 0.98)',
          padding: '12px 16px',
          marginTop: '-24px',
          marginBottom: '4px',
          width: '94%',
          maxWidth: '340px',
          alignSelf: 'center',
          textAlign: 'center',
          zIndex: 15
        }}>
          {/* Score */}
          <div style={{ fontSize: '1.4em', fontWeight: '900', color: THEME.brassDark, lineHeight: 1.2 }}>
            {session.score} 点
          </div>
          <div style={{ fontSize: '0.75em', color: '#666', marginBottom: '6px' }}>
            依頼 {session.questions.length} 件中 {correctCount} 件達成
          </div>

          {/* 3-column stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px',
            background: 'rgba(0,0,0,0.04)',
            padding: '6px 4px',
            borderRadius: '6px',
            marginBottom: '6px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65em', color: '#888' }}>評判</div>
              <div style={{ fontSize: '0.95em', fontWeight: 'bold', color: mgmt.reputation >= 0 ? THEME.oasisTeal : '#844' }}>
                {mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65em', color: '#888' }}>売上</div>
              <div style={{ fontSize: '0.95em', fontWeight: 'bold', color: THEME.brassDark }}>
                {mgmt.sales}G
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65em', color: '#888' }}>満足度</div>
              <div style={{ fontSize: '0.95em', fontWeight: 'bold', color: mgmt.satisfaction >= 0 ? THEME.oasisTeal : '#844' }}>
                {mgmt.satisfaction >= 0 ? `+${mgmt.satisfaction}` : mgmt.satisfaction}
              </div>
            </div>
          </div>

          {/* Affection gain */}
          <div style={{
            fontSize: '0.85em',
            fontWeight: 'bold',
            color: activeHeroine.themeColor,
            padding: '3px 10px',
            background: `${activeHeroine.themeColor}15`,
            borderRadius: '999px',
            display: 'inline-block'
          }}>
            {activeHeroine.name}との縁 +{lastAffectionGain}
          </div>
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
            margin: 'auto 0 8px 0',
            zIndex: 15
          }}
        >
          次の営業へ
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
