import React from 'react';
import { THEME } from './theme';
import GameHud from './GameHud';
import { getResultComment } from '../data/narrativeScript';
import { QUIZ_SCORE_TO_G } from '../game/scoring';

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
  const mgmt = getWorkshopResult({ correctCount, answers: session.answers });
  const totalQuestions = session.questions.length;
  const comment = getResultComment(activeHeroine.id, correctCount, totalQuestions);

  return (
    <div data-testid="result-screen" style={{ ...containerStyle, position: 'relative' }}>
      {renderThemeStyles && renderThemeStyles()}
      {renderBackground && renderBackground(screen)}

      <div style={{ zIndex: 10, position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 8px' }}>
        <GameHud
          screen={screen}
          routeMode={routeMode}
          onOpenLog={onOpenLog}
          onOpenOptions={onOpenOptions}
          onOpenHelp={onOpenHelp}
        />

        <h1 style={{ ...titleStyle, margin: '40px 0 0 4px', color: THEME.parchment, fontSize: '1.15em', textAlign: 'left', zIndex: 10 }}>
          今回の営業記録
        </h1>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', justifyContent: 'center', minHeight: '250px', overflow: 'visible' }}>
            {HeroineDisplay && (
              <HeroineDisplay
                heroine={activeHeroine}
                type="standing"
                size="large"
                expression={getResultExpression(correctCount, totalQuestions)}
                noBorder={true}
                objectPosition="center center"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                  maxHeight: 'none',
                  overflow: 'visible',
                  transform: 'translateX(12px) scale(0.88)',
                  transformOrigin: 'center bottom'
                }}
              />
            )}

            <div style={{ marginTop: '0', background: 'rgba(244, 233, 213, 0.92)', border: `1.5px solid ${THEME.brass}`, borderRadius: '12px', padding: '12px 10px', position: 'relative', width: '84px', minHeight: '168px', maxHeight: '190px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)', width: '0', height: '0', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: `8px solid ${THEME.brass}` }} />
              <div style={{ position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)', width: '0', height: '0', borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderRight: '7px solid rgba(244, 233, 213, 0.92)' }} />
              <div style={{ fontSize: '0.86em', color: THEME.textDark, lineHeight: '1.9', fontStyle: 'normal', fontWeight: 600, letterSpacing: '0.04em', writingMode: 'vertical-rl', textOrientation: 'mixed', maxHeight: '178px', overflow: 'hidden', fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", serif' }}>
                {comment}
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, borderRadius: '10px', border: `2px solid ${THEME.brass}`, background: 'rgba(244, 233, 213, 0.98)', padding: '12px 16px', marginTop: '-12px', width: '94%', maxWidth: '340px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4em', fontWeight: '900', color: THEME.brassDark, lineHeight: 1.2 }}>
              {session.score * QUIZ_SCORE_TO_G}G
            </div>
            <div style={{ fontSize: '0.75em', color: '#666', marginBottom: '6px' }}>
              依頼 {session.questions.length} 件中 {correctCount} 件達成
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: 'rgba(0,0,0,0.04)', padding: '6px 4px', borderRadius: '6px', marginBottom: '6px' }}>
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

            <div style={{ fontSize: '0.85em', fontWeight: 'bold', color: activeHeroine.themeColor, padding: '3px 10px', background: `${activeHeroine.themeColor}15`, borderRadius: '999px', display: 'inline-block' }}>
              {activeHeroine.name}との縁 +{lastAffectionGain}
            </div>
          </div>

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
