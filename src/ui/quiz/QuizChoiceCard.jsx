import React from 'react';

export default function QuizChoiceCard({ item, index, quizFeedback, onSelectChoice, itemCardStyle, imageStyle, itemNameStyle, requestType }) {
  const isSelected = quizFeedback?.itemId === item.id;
  const feedbackClass = isSelected ? (quizFeedback.isCorrect ? 'feedback-correct' : 'feedback-wrong') : '';
  const staggerClass = `quiz-option-${index}`;
  
  let displayChoiceName = item.name;
  if (requestType === 'genre') {
    const category = item.id.split('_')[1]; 
    if (category === 'DAY') displayChoiceName = `一般雑貨の${displayChoiceName}`;
    if (category === 'TRD') displayChoiceName = `貿易品の${displayChoiceName}`;
    if (category === 'RIT') displayChoiceName = `厳かな${displayChoiceName}`;
  }

  return (
    <div 
      data-testid="quiz-choice"
      key={item.id} 
      onClick={() => onSelectChoice(item.id)}
      className={`item-card ${staggerClass} ${feedbackClass}`}
      style={{
        ...itemCardStyle,
        pointerEvents: quizFeedback ? 'none' : 'auto'
      }}
    >
      <img 
        src={`${import.meta.env.BASE_URL}${item.image}`.replace(/([^:])\/\//g, '$1/')} 
        alt={item.name} 
        style={{ ...imageStyle, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
        draggable={false}
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='10'%3EImage Not Found%3C/text%3E%3C/svg%3E";
        }}
      />
      <div style={itemNameStyle}>
        {displayChoiceName}
      </div>
    </div>
  );
}
