import React from 'react';
import { THEME } from '../theme';
import CustomerSilhouette from './CustomerSilhouette';
import ConditionBadges from './ConditionBadges';

export default function QuizRequestCard({ currentQuestion, customerStyle, bubbleStyle, quizFeedback }) {
  const stampLabel = quizFeedback?.stampLabel;
  const stampScore = quizFeedback?.stampScore;
  const stampTone = quizFeedback?.stampTone || 'gold';
  const stampColors = {
    gold: { border: 'rgba(198, 156, 66, 0.9)', text: '#8a5f14', fill: 'rgba(255, 244, 208, 0.92)' },
    brass: { border: 'rgba(162, 128, 64, 0.85)', text: '#7a4f10', fill: 'rgba(249, 236, 197, 0.92)' },
    teal: { border: 'rgba(64, 148, 141, 0.85)', text: '#1f6763', fill: 'rgba(224, 246, 244, 0.94)' },
    amber: { border: 'rgba(186, 125, 52, 0.85)', text: '#8a541c', fill: 'rgba(255, 238, 214, 0.94)' },
    rose: { border: 'rgba(176, 91, 91, 0.85)', text: '#7a3232', fill: 'rgba(255, 232, 232, 0.94)' },
  };
  const stampStyle = stampColors[stampTone] || stampColors.gold;

  return (
    <div className="quiz-question-bubble" style={{ ...customerStyle, marginBottom: '10px', justifyContent: 'flex-start' }}>
      <div style={{
        ...bubbleStyle,
        width: '90%',
        height: '110px',
        background: '#fff',
        color: '#333',
        border: `2px solid ${currentQuestion.request.customer?.color || THEME.brassDark}`,
        borderRadius: '15px 15px 15px 0',
        padding: '12px 16px',
        fontSize: '0.95em',
        lineHeight: '1.4',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        textAlign: 'left',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <CustomerSilhouette customer={currentQuestion.request.customer} />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100%',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontWeight: 500, flex: 1, display: 'flex', alignItems: 'center' }}>
            <span>{currentQuestion.request.text}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingBottom: '2px' }}>
            <ConditionBadges criteria={currentQuestion.request.criteria} />
          </div>
        </div>
        {stampLabel && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              transform: 'rotate(-8deg)',
              minWidth: '84px',
              padding: '7px 10px 6px',
              borderRadius: '8px',
              border: `2px solid ${stampStyle.border}`,
              background: stampStyle.fill,
              color: stampStyle.text,
              textAlign: 'center',
              pointerEvents: 'none',
              boxShadow: '0 2px 0 rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.28)'
            }}
          >
            <div style={{ fontSize: '0.92em', fontWeight: 900, letterSpacing: '0.05em' }}>
              {stampLabel}
            </div>
            {stampScore > 0 && (
              <div style={{ fontSize: '0.68em', fontWeight: 700, marginTop: '1px' }}>
                +{stampScore}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
