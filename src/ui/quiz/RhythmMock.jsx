import React from 'react';
import { THEME } from '../theme';

export default function RhythmMock({ heroineId, themeColor }) {
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
}
