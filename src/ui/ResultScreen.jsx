import React from 'react';
import { THEME } from './theme';
import GameHud from './GameHud';
import { getResultComment } from '../data/resultComments';

/**
 * ResultScreen Component
 * All main elements in one centered container.
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
  const totalQuestions = session.questions.length;
  const comment = getResultComment(activeHeroine.id, correctCount, totalQuestions);

  return (
    <div
      data-testid="result-screen"
      style={{ ...containerStyle, position: 'relative' }}
    >
      {renderThemeStyles && renderThemeStyles()}
      {renderBackground && renderBackground(screen)}

      {/* Content layer */}
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

        {/* Center pack: all main elements */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          minWidth: 0
        }}>
          {/* Heroine Standing + Speech Bubble */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '2px'
          }}>
            {HeroineDisplay && (
              <HeroineDisplay
                heroine={activeHeroine}
                type="standing"
                size="large"
                expression={getResultExpression(correctCount)}
                noBorder={true}
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
              />
            )}

            {/* Speech Bubble */}
            <div style={{
              marginTop: '20px',
              marginLeft: '-28px',
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
                {comment}
              </div>
            </div>
          </div>

          {/* Score Panel */}
          <div style={{
            ...cardStyle,
            borderRadius: '10px',
            border: `2px solid ${THEME.brass}`,
            background: 'rgba(244, 233, 213, 0.98)',
            padding: '12px 16px',
            marginTop: '-36px',
            width: '94%',
            maxWidth: '340px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.4em', fontWeight: '900', color: THEME.brassDark, lineHeight: 1.2 }}>
              {session.score} 点
            </div>
            <div style={{ fontSize: '0.75em', color: '#666', marginBottom: '6px' }}>
              依頼 {session.questions.length} 件中 {correctCount} 件達成
            </div>

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
              maxWidth: '240px'
            }}
          >
            次の営業へ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
