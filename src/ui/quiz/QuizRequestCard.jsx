import React from 'react';
import { THEME } from '../theme';
import CustomerSilhouette from './CustomerSilhouette';
import ConditionBadges from './ConditionBadges';

export default function QuizRequestCard({ currentQuestion, customerStyle, bubbleStyle }) {
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
        overflow: 'hidden'
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
      </div>
    </div>
  );
}
