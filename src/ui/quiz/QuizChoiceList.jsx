import React from 'react';
import QuizChoiceCard from './QuizChoiceCard';

export default function QuizChoiceList({ choices, quizFeedback, onSelectChoice, itemCardStyle, imageStyle, itemNameStyle, requestType }) {
  return (
    <div className="choice-container" style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '20px', 
      width: '100%',
      marginTop: '20px', 
      paddingBottom: '20px'
    }}>
      {choices.map((item, index) => (
        <QuizChoiceCard
          key={item.id}
          item={item}
          index={index}
          quizFeedback={quizFeedback}
          onSelectChoice={onSelectChoice}
          itemCardStyle={itemCardStyle}
          imageStyle={imageStyle}
          itemNameStyle={itemNameStyle}
          requestType={requestType}
        />
      ))}
    </div>
  );
}
