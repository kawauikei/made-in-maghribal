import React, { useState, useMemo } from 'react';
import { createQuizSession, answerQuestion } from './game/quizEngine';
import { getRankInfo } from './game/scoring';
import { getWorkshopResult, createInitialWorkshopState, applyWorkshopResult } from './game/management';
import { HEROINES, getHeroineAsset } from './data/heroines';

export default function App() {
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState('START');
  const [activeHeroineId, setActiveHeroineId] = useState('hakima');
  const [workshopState, setWorkshopState] = useState(createInitialWorkshopState());

  const activeHeroine = HEROINES.find(h => h.id === activeHeroineId) || HEROINES[0];

  // Go to Heroine Select
  const handleStartGame = () => {
    setScreen('HEROINE_SELECT');
  };

  // Select Heroine and start Intro
  const handleSelectHeroine = (id) => {
    setActiveHeroineId(id);
    setScreen('INTRO');
  };

  // Go to INTRO (Next Day)
  const handleNextDay = () => {
    setWorkshopState(prev => ({ ...prev, day: prev.day + 1 }));
    setScreen('INTRO');
  };

  // Generate quiz and start service
  const handleBeginService = () => {
    setSession(createQuizSession({ questionCount: 5 }));
    setScreen('QUIZ');
  };

  // End of service, go to Day End
  const handleEndDay = () => {
    setScreen('DAY_END');
  };

  // Back to Title
  const handleBackToTitle = () => {
    setActiveHeroineId('hakima');
    setWorkshopState(createInitialWorkshopState());
    setSession(null);
    setScreen('START');
  };

  // Handle answer selection
  const handleSelect = (itemId) => {
    if (!session || session.isFinished) return;
    const updatedSession = answerQuestion(session, itemId);
    setSession(updatedSession);

    // If quiz just finished, accumulate results immediately
    if (updatedSession.isFinished) {
      const correctCount = updatedSession.answers.filter(a => a.isCorrect).length;
      const result = getWorkshopResult(correctCount);
      setWorkshopState(prev => applyWorkshopResult(prev, result));
      setScreen('RESULT');
    }
  };

  // --- RENDER HELPERS ---

  if (screen === 'START') {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Made in Maghribal</h1>
        <div style={cardStyle}>
          <p style={{ fontSize: '1.1em', marginBottom: '30px' }}>
            接客クイズへようこそ。5問の連続クイズに挑戦しましょう。
          </p>
          <button onClick={handleStartGame} style={buttonStyle}>店を開く</button>
        </div>
      </div>
    );
  }

  if (screen === 'INTRO') {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>{workshopState.day}日目：工房の朝</h1>
        <div style={cardStyle}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
             <HeroineDisplay heroine={activeHeroine} type="standing" size="large" />
             <div style={{ ...narrativeBoxStyle, flex: '1', minWidth: '280px', marginBottom: 0 }}>
                <div style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '10px' }}>{workshopState.day}日目の朝</div>
                <p>「おはよう。今日も工房の扉を開けましょうか」</p>
                <p>昨日の疲れを感じさせない様子で、{activeHeroine.name}は道具の手入れを始めている。</p>
                <p>今日の客人は、どんな品を求めてやってくるだろうか。</p>
             </div>
          </div>
          <button onClick={handleBeginService} style={buttonStyle}>接客を始める</button>
        </div>
      </div>
    );
  }

  if (screen === 'RESULT' && session) {
    const correctCount = session.answers.filter(a => a.isCorrect).length;
    const rank = getRankInfo(correctCount);
    const mgmt = getWorkshopResult(correctCount);

    const resultNarrations = {
      5: "お客は品を受け取ると、ぱっと顔を輝かせた。\n「これだよ、これ！　まさかこんなにぴったりの品があるなんて」\n今日の工房には、少し誇らしい空気が流れている。",
      4: "お客は満足そうに品を抱えた。\n「助かったよ。次に困った時も、ここに来ればよさそうだ」\n手応えのある接客だった。",
      3: "お客は少し迷いながらも、品を受け取った。\n「うん、悪くない。たぶんこれで何とかなると思う」\nもう少し相手の願いを読み取れれば、さらに良くなりそうだ。",
      2: "お客は首をかしげながら品を見つめた。\n「うーん……今回はこれで試してみるよ」\n工房の棚には、まだ学ぶべきことが多く残っている。",
      1: "お客は困ったように笑った。\n「気持ちはありがたいんだけど、ちょっと違うかもしれないな」\n今日の失敗も、きっと明日の目利きにつながる。",
      0: "お客は困ったように笑った。\n「気持ちはありがたいんだけど、ちょっと違うかもしれないな」\n今日の失敗も、きっと明日の目利きにつながる。"
    };
    
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>業務終了</h1>
        <div style={cardStyle}>
          <div style={narrativeBoxStyle}>
            {resultNarrations[correctCount].split('\n').map((line, i) => (
              <p key={i} style={{ margin: '0 0 8px 0' }}>{line}</p>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
            <HeroineDisplay heroine={activeHeroine} type="face" size="small" />
            <div style={{ fontSize: '1.2em', color: '#ffcc00', fontWeight: 'bold' }}>
              称号：{rank.title}
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '10px', 
            margin: '20px 0',
            background: 'rgba(255,255,255,0.05)',
            padding: '15px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#aaa', marginBottom: '4px' }}>評判</div>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: mgmt.reputation >= 0 ? '#4caf50' : '#f44336' }}>
                {mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#aaa', marginBottom: '4px' }}>売上</div>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#ffcc00' }}>
                {mgmt.sales}G
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#aaa', marginBottom: '4px' }}>満足度</div>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: mgmt.satisfaction >= 0 ? '#4caf50' : '#f44336' }}>
                {mgmt.satisfaction >= 0 ? `+${mgmt.satisfaction}` : mgmt.satisfaction}
              </div>
            </div>
          </div>

          <h2 style={{ margin: '10px 0' }}>最終スコア: {session.score} 点</h2>
          <p style={{ fontSize: '1.1em', marginBottom: '20px' }}>
            {session.questions.length} 問中 {correctCount} 問正解
          </p>
          <div style={{ background: '#333', padding: '15px', borderRadius: '8px', marginBottom: '30px', fontStyle: 'italic', color: '#ccc' }}>
            「{rank.message}」
          </div>
          <button onClick={handleEndDay} style={buttonStyle}>店じまいする</button>
        </div>
      </div>
    );
  }

  if (screen === 'DAY_END' && session) {
    const correctCount = session.answers.filter(a => a.isCorrect).length;
    const mgmt = getWorkshopResult(correctCount);

    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>一日の終わり</h1>
        <div style={cardStyle}>
          <div style={{ ...narrativeBoxStyle, textAlign: 'left' }}>
            <p>夕暮れの工房に、今日選ばれた品々の余韻が残っている。</p>
            <p>小さな手応えを積み重ねれば、この店にもきっと評判が根づいていくはずだ。</p>
            <p style={{ marginTop: '20px', color: activeHeroine.themeColor, fontWeight: 'bold' }}>
              {activeHeroine.name}：「お疲れ様。明日の準備をしたら、今日はもう休みましょう」
            </p>
          </div>

          <div style={{ 
            background: 'rgba(0,0,0,0.2)', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '30px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1em', color: '#aaa' }}>本日の経営概況</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
               <div>売上: <span style={{ color: '#ffcc00' }}>{mgmt.sales}G</span></div>
               <div>評判: <span style={{ color: mgmt.reputation >= 0 ? '#4caf50' : '#f44336' }}>{mgmt.reputation >= 0 ? `+${mgmt.reputation}` : mgmt.reputation}</span></div>
            </div>
            
            <h3 style={{ margin: '15px 0 15px 0', fontSize: '1em', color: '#aaa' }}>現在の累計状態 ({workshopState.day}日目終了)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95em' }}>
               <div>総売上: <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>{workshopState.sales}G</span></div>
               <div>総評判: <span style={{ color: workshopState.reputation >= 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>{workshopState.reputation >= 0 ? `+${workshopState.reputation}` : workshopState.reputation}</span></div>
               <div>満足度: <span style={{ color: workshopState.satisfaction >= 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>{workshopState.satisfaction >= 0 ? `+${workshopState.satisfaction}` : workshopState.satisfaction}</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={handleNextDay} style={buttonStyle}>次の日へ進む</button>
            <button onClick={handleBackToTitle} style={{ ...buttonStyle, background: '#444' }}>タイトルへ戻る</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'HEROINE_SELECT') {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>誰と店を開く？</h1>
        <div style={{ ...cardStyle, maxWidth: '800px' }}>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
            {HEROINES.map(heroine => (
              <div 
                key={heroine.id} 
                onClick={() => handleSelectHeroine(heroine.id)}
                style={{ 
                  flex: '1',
                  minWidth: '200px',
                  maxWidth: '240px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: `2px solid ${heroine.themeColor}`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  textAlign: 'center'
                }}
              >
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                  <HeroineDisplay heroine={heroine} type="face" size="large" />
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>{heroine.name}</h3>
                <div style={{ fontSize: '0.8em', color: '#ffcc00', marginBottom: '10px' }}>{heroine.role}</div>
                <p style={{ fontSize: '0.85em', color: '#ccc', textAlign: 'left', margin: 0, minHeight: '4.5em' }}>
                  {heroine.description}
                </p>
                <div style={{ 
                  marginTop: '15px', 
                  padding: '8px', 
                  background: heroine.themeColor, 
                  color: '#111', 
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.9em'
                }}>
                  選択する
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleBackToTitle} style={{ ...buttonStyle, background: '#444', maxWidth: '200px' }}>戻る</button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentIndex];

  return (
    <div style={containerStyle}>
      <style>{`
        .item-card {
          background: #333;
          padding: 15px;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.1s, background 0.1s, border-color 0.1s;
          border: 2px solid #555;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          -webkit-tap-highlight-color: transparent;
        }
        .item-card:active {
          background: #444;
          transform: scale(0.97);
          border-color: #ffcc00;
        }
        .choice-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          width: 100%;
        }
        @media (max-width: 480px) {
          .choice-container {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .item-card {
            padding: 12px;
          }
        }
      `}</style>

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

        <div className="choice-container">
          {currentQuestion.choices.map((item) => (
            <div 
              key={item.id} 
              onClick={() => handleSelect(item.id)}
              className="item-card"
            >
              <img 
                src={`${import.meta.env.BASE_URL}${item.image}`.replace(/([^:])\/\//g, '$1/')} 
                alt={item.name} 
                style={imageStyle}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555' font-family='sans-serif' font-size='10'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                }}
              />
              <div style={itemNameStyle}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function HeroineDisplay({ heroine, type, size = "large" }) {
  const [imgError, setImgError] = useState(false);
  const assetPath = getHeroineAsset(heroine.id, type);
  const fullPath = assetPath ? `${import.meta.env.BASE_URL}${assetPath}`.replace(/([^:])\/\//g, '$1/') : null;

  const isPortrait = type === 'standing';
  const sizePx = size === 'large' ? 120 : size === 'medium' ? 80 : 60;
  
  if (type === 'face') {
    return (
      <div style={{
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        borderRadius: '50%',
        backgroundColor: heroine.themeColor + '33',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: heroine.themeColor,
        fontWeight: 'bold',
        fontSize: `${sizePx * 0.4}px`,
        overflow: 'hidden',
        border: `2px solid ${heroine.themeColor}`,
        position: 'relative'
      }}>
        <img 
          src={fullPath} 
          alt={heroine.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center 20%',
            display: imgError ? 'none' : 'block'
          }}
          onError={() => setImgError(true)}
        />
        {imgError && <span>{heroine.name[0]}</span>}
      </div>
    );
  }

  const displaySize = size === 'large' ? (isPortrait ? 180 : 100) : (isPortrait ? 80 : 50);

  const containerStyle = {
    width: isPortrait ? `${displaySize * 0.7}px` : `${displaySize}px`,
    height: `${displaySize}px`,
    borderRadius: isPortrait ? '12px' : '50%',
    overflow: 'hidden',
    background: heroine.themeColor || '#444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${heroine.themeColor || '#ffcc00'}`,
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    flexShrink: 0
  };

  if (!fullPath || imgError) {
    return (
      <div style={containerStyle}>
        <span style={{ fontSize: size === 'large' ? '2em' : '1.2em', fontWeight: 'bold', color: '#111' }}>
          {heroine.name[0]}
        </span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <img 
        src={fullPath} 
        alt={heroine.name} 
        style={{ width: '100%', height: '100%', objectFit: isPortrait ? 'contain' : 'cover' }}
        onError={() => setImgError(true)}
      />
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

const narrativeBoxStyle = {
  background: '#111',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '30px',
  textAlign: 'left',
  lineHeight: '1.8',
  fontSize: '0.95em',
  color: '#ddd',
  borderLeft: '4px solid #ffcc00'
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
