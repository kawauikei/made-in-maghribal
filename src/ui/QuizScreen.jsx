import React from 'react';
import { THEME } from './theme';
import GameHud from './GameHud';
import { BACKGROUND_IMAGES } from '../data/imageAssets';
import { COLOR_BY_ID } from '../data/principles';
import { GENRE_BY_ID, ITEM_TYPE_BY_ID } from '../data/itemTypes';

/**
 * Customer Silhouette Icon (M-QUIZ-SILHOUETTE-ICON)
 */
const CustomerSilhouette = ({ customer }) => {
  if (!customer) return null;
  return (
    <div className="customer-silhouette" style={{ 
      borderColor: customer.color || 'rgba(218, 180, 96, 0.45)'
    }} />
  );
};

/**
 * Rhythm Lane Mock (Visual Only)
 */
const RhythmMock = ({ heroineId, themeColor }) => {
  const naderFace = `./characters/nader/face_proc/normal.png`;
  const heroineFace = `./characters/${heroineId}/face_proc/normal.png`;

  return (
    <div style={{
      width: '100%',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      margin: '15px 0',
      pointerEvents: 'none',
      userSelect: 'none',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        width: '70%',
        height: '100%',
        background: `radial-gradient(ellipse at center, ${THEME.brass}11 0%, transparent 70%)`,
        zIndex: 0
      }} />

      {/* Left: Nader */}
      <div style={{ 
        width: '44px', 
        height: '44px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: `2px solid ${THEME.brass}`, 
        background: 'rgba(35, 25, 18, 0.9)', 
        opacity: 0.8,
        boxShadow: '0 0 12px rgba(0,0,0,0.6)',
        flexShrink: 0,
        zIndex: 2,
        transition: 'transform 0.3s'
      }}>
        <img src={naderFace} alt="N" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Center: Beat Lane */}
      <div style={{
        flex: 1,
        maxWidth: '420px',
        height: '4px',
        background: `rgba(255,255,255,0.05)`,
        borderRadius: '2px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '1px',
          background: `linear-gradient(to right, transparent, ${THEME.brass} 20%, ${THEME.brass} 80%, transparent)`,
          top: '50%',
          transform: 'translateY(-50%)'
        }} />

        {[20, 35, 65, 80].map(pos => (
          <div key={pos} style={{ 
            position: 'absolute', 
            left: `${pos}%`, 
            width: '6px', 
            height: '6px', 
            transform: 'rotate(45deg)',
            background: THEME.brass, 
            boxShadow: `0 0 4px ${THEME.brass}88`,
            opacity: 0.4 
          }} />
        ))}

        <div style={{
          position: 'absolute',
          left: 0,
          top: '-12px',
          bottom: '-12px',
          width: '2px',
          background: `linear-gradient(to bottom, transparent, ${THEME.starGold}, transparent)`,
          boxShadow: `0 0 8px ${THEME.starGold}`,
          opacity: 0.8,
          zIndex: 2,
          animation: 'beat-scanline 2s linear infinite'
        }} />
        
        <div 
          className="beat-pulse"
          style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '50%', 
            border: `2px solid ${THEME.starGold}`, 
            background: 'rgba(255,255,255,0.2)',
            boxShadow: `0 0 15px ${THEME.starGold}aa`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3
          }} 
        >
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${THEME.starGold}66 0%, transparent 70%)`,
            zIndex: -1
          }} />
        </div>
      </div>

      {/* Right: Heroine */}
      <div style={{ 
        width: '44px', 
        height: '44px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: `2px solid ${themeColor || THEME.brass}`, 
        background: 'rgba(35, 25, 18, 0.9)', 
        boxShadow: `0 0 12px ${(themeColor || THEME.brass)}88`,
        flexShrink: 0,
        zIndex: 2,
        transition: 'transform 0.3s'
      }}>
        <img src={heroineFace} alt="H" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );
};

export default function QuizScreen({
  session,
  activeHeroineId,
  activeHeroine,
  quizFeedback,
  routeMode,
  screen,
  onOpenLog,
  onOpenOptions,
  onOpenHelp,
  onSelectChoice,
  renderThemeStyles,
  getFullPath,
  containerStyle,
  headerStyle,
  cardStyle,
  customerStyle,
  bubbleStyle,
  itemCardStyle,
  imageStyle,
  itemNameStyle
}) {
  if (!session) return null;
  const currentQuestion = session.questions[session.currentIndex];

  return (
    <div data-testid="quiz-screen" style={containerStyle}>
      {renderThemeStyles()}
      
      {/* Full-screen Background (B-1) */}
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

      <GameHud
        screen={screen}
        routeMode={routeMode}
        onOpenLog={onOpenLog}
        onOpenOptions={onOpenOptions}
        onOpenHelp={onOpenHelp}
      />
      <header style={{ 
        ...headerStyle, 
        background: THEME.nightBlue, 
        color: THEME.sand, 
        borderBottom: `2px solid ${THEME.brass}`,
        padding: '12px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        gap: '20px',
        zIndex: 10
      }}>
        <span style={{ fontSize: '0.9em' }}>依頼件数 {session.currentIndex + 1} / {session.questions.length}</span>
        <span style={{ fontWeight: 'bold', color: THEME.brass }}>報酬見込: {session.score} G</span>
      </header>

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
                {(() => {
                  const criteria = currentQuestion.request.criteria;
                  const badges = [];
                  
                  if (criteria.colorId) {
                    const color = COLOR_BY_ID[criteria.colorId];
                    const label = color?.label?.split(' (')[0] || color?.name;
                    badges.push({ text: `✧${label}`, color: THEME.starGold, bg: 'rgba(218, 180, 96, 0.15)' });
                  }
                  
                  if (criteria.genre) {
                    const genre = GENRE_BY_ID[criteria.genre];
                    badges.push({ text: `[${genre?.name || criteria.genre}]`, color: '#666', bg: '#f5f5f5' });
                  }
                  
                  if (criteria.itemTypeId) {
                    const type = ITEM_TYPE_BY_ID[criteria.itemTypeId];
                    badges.push({ text: `[${type?.name || criteria.itemTypeId}]`, color: '#666', bg: '#f5f5f5' });
                  }
                  
                  return badges.map((b, i) => (
                    <span key={i} style={{
                      fontSize: '0.75em',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: b.bg,
                      color: b.color,
                      border: `1px solid ${b.color}33`,
                      fontWeight: 'bold',
                      letterSpacing: '0.05em'
                    }}>
                      {b.text}
                    </span>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="quiz-rhythm-lane" style={{ 
          width: 'calc(100% + 40px)', 
          margin: '15px -20px', 
          background: 'rgba(26, 42, 58, 0.6)', 
          borderTop: `1px solid ${THEME.brass}44`,
          borderBottom: `1px solid ${THEME.brass}44`,
          padding: '5px 0'
        }}>
          <RhythmMock heroineId={activeHeroineId} themeColor={activeHeroine?.themeColor} />
        </div>

        <div className="choice-container" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px', 
          width: '100%',
          marginTop: '20px', 
          paddingBottom: '20px'
        }}>
          {currentQuestion.choices.map((item, index) => {
            const isSelected = quizFeedback?.itemId === item.id;
            const feedbackClass = isSelected ? (quizFeedback.isCorrect ? 'feedback-correct' : 'feedback-wrong') : '';
            const staggerClass = `quiz-option-${index}`;
            
            let displayChoiceName = item.name;
            if (currentQuestion.request.type === 'genre') {
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
          })}
        </div>
      </div>
    </div>
  );
}
