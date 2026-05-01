import React from 'react';
import { THEME } from '../theme';
import GameHud from '../GameHud';

export default function QuizHeader({ screen, routeMode, onOpenLog, onOpenOptions, onOpenHelp, headerStyle, session }) {
  return (
    <>
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
    </>
  );
}
