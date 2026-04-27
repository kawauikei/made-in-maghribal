import React, { useState, useMemo } from 'react';
import { createQuizSession, answerQuestion } from './game/quizEngine';

export default function App() {
  const [session, setSession] = useState(null);

  // Start a new game
  const startGame = () => {
    const newSession = createQuizSession({ questionCount: 20 });
    setSession(newSession);
  };

  // Handle answer selection
  const handleSelect = (itemId) => {
    if (!session || session.isFinished) return;
    const nextSession = answerQuestion(session, itemId);
    setSession(nextSession);
  };

  // Current state views
  if (!session) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Made in Maghribal</h1>
        <p>接客クイズへようこそ。20問の連続クイズに挑戦しましょう。</p>
        <button onClick={startGame} style={buttonStyle}>店を開く</button>
      </div>
    );
  }

  if (session.isFinished) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>業務終了</h1>
        <div style={cardStyle}>
          <h2>最終スコア: {session.score} 点</h2>
          <p>{session.questions.length} 問中 {session.answers.filter(a => a.isCorrect).length} 問正解</p>
          <button onClick={startGame} style={buttonStyle}>もう一度挑戦</button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentIndex];

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <span>問題 {session.currentIndex + 1} / {session.questions.length}</span>
        <span style={{ fontWeight: 'bold' }}>スコア: {session.score}</span>
      </header>

      <div style={cardStyle}>
        <div style={customerStyle}>
          <div style={bubbleStyle}>
            {currentQuestion.request.text}
          </div>
        </div>

        <div style={choiceContainerStyle}>
          {currentQuestion.choices.map((item) => (
            <div 
              key={item.id} 
              onClick={() => handleSelect(item.id)}
              style={itemCardStyle}
            >
              <img 
                src={item.image.startsWith('/') ? item.image : `/${item.image}`} 
                alt={item.name} 
                style={imageStyle}
              />
              <div style={itemNameStyle}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Minimal Styles
const containerStyle = {
  padding: '20px',
  fontFamily: 'sans-serif',
  background: '#1a1a1a',
  color: '#eee',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

const titleStyle = { color: '#ffcc00', marginBottom: '40px' };

const headerStyle = {
  width: '100%',
  maxWidth: '600px',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
  fontSize: '1.1em'
};

const cardStyle = {
  width: '100%',
  maxWidth: '600px',
  padding: '30px',
  border: '1px solid #444',
  borderRadius: '16px',
  background: '#2a2a2a',
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
};

const customerStyle = {
  marginBottom: '30px',
  display: 'flex',
  justifyContent: 'center'
};

const bubbleStyle = {
  background: '#eee',
  color: '#222',
  padding: '15px 25px',
  borderRadius: '20px',
  position: 'relative',
  fontSize: '1.2em',
  fontWeight: 'bold'
};

const choiceContainerStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px'
};

const itemCardStyle = {
  background: '#333',
  padding: '15px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'transform 0.2s, background 0.2s',
  border: '2px solid transparent'
};

// Hover effects are difficult with inline styles, but let's stick to basics
itemCardStyle[':hover'] = { background: '#444' }; 

const imageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '10px',
  background: '#111'
};

const itemNameStyle = {
  fontSize: '0.9em',
  color: '#ccc'
};

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '1.1em',
  background: '#ffcc00',
  color: '#111',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '20px'
};
