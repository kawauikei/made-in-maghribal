import React from 'react';
import { THEME } from './theme';
import { BACKGROUND_IMAGES } from '../data/imageAssets';
import { RhythmMock, QuizHeader, QuizRequestCard, QuizChoiceList } from './quiz';

export default function QuizScreen({
  quizState,
  quizActions,
  quizHelpers,
  quizStyles,
}) {
  const {
    session,
    activeHeroineId,
    activeHeroine,
    quizFeedback,
    routeMode,
    screen,
  } = quizState;

  const {
    onOpenLog,
    onOpenOptions,
    onOpenHelp,
    onSelectChoice,
  } = quizActions;

  const {
    renderThemeStyles,
    getFullPath,
  } = quizHelpers;

  const {
    containerStyle,
    headerStyle,
    cardStyle,
    customerStyle,
    bubbleStyle,
    itemCardStyle,
    imageStyle,
    itemNameStyle,
  } = quizStyles;

  if (!session) return null;
  const currentQuestion = session.questions[session.currentIndex];

  return (
    <div data-testid="quiz-screen" style={containerStyle}>
      {renderThemeStyles()}
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${getFullPath(BACKGROUND_IMAGES.shopInteriorService.src)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 1,
        opacity: 0.8
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.2)',
        zIndex: 2
      }} />

      <QuizHeader
        screen={screen}
        routeMode={routeMode}
        onOpenLog={onOpenLog}
        onOpenOptions={onOpenOptions}
        onOpenHelp={onOpenHelp}
        headerStyle={headerStyle}
        session={session}
      />

      <div style={{ 
        ...cardStyle, 
        maxWidth: '800px', 
        marginTop: '5px', 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        backdropFilter: 'none',
        padding: '0 20px 20px 20px', 
        zIndex: 5 
      }}>
        <QuizRequestCard
          currentQuestion={currentQuestion}
          customerStyle={customerStyle}
          bubbleStyle={bubbleStyle}
        />
        
        <div className="quiz-rhythm-lane" style={{ 
          width: 'calc(100% + 40px)', 
          margin: '8px -20px 6px', 
          background: 'rgba(26, 42, 58, 0.6)', 
          borderTop: `1px solid ${THEME.brass}44`,
          borderBottom: `1px solid ${THEME.brass}44`,
          padding: '4px 0'
        }}>
          <RhythmMock
            heroineId={activeHeroineId}
            themeColor={activeHeroine?.themeColor}
            noteIntervalMs={500}
            judgmentWindowMs={140}
          />
        </div>
        <div style={{
          textAlign: 'center',
          fontSize: '0.72em',
          color: THEME.parchment,
          opacity: 0.78,
          marginTop: '2px',
          marginBottom: '8px',
          letterSpacing: '0.02em'
        }}>
          リズムに合わせて正解すると少しボーナス！
        </div>
        {quizFeedback?.rhythmBonus > 0 && (
          <div style={{
            textAlign: 'center',
            fontSize: '0.78em',
            fontWeight: '700',
            color: THEME.starGold,
            marginBottom: '6px',
            textShadow: `0 0 8px ${THEME.starGold}66`
          }}>
            リズム好機 +{quizFeedback.rhythmBonus}G
          </div>
        )}

        <QuizChoiceList
          choices={currentQuestion.choices}
          quizFeedback={quizFeedback}
          onSelectChoice={onSelectChoice}
          itemCardStyle={itemCardStyle}
          imageStyle={imageStyle}
          itemNameStyle={itemNameStyle}
          requestType={currentQuestion.request.type}
        />
      </div>
    </div>
  );
}
