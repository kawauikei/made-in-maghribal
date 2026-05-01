import React, { useState } from 'react';
import { THEME } from './theme';
import { HEROINES } from '../data/heroines';
import { AFFECTION_EVENTS } from '../data/affectionEvents';

/**
 * DebugPanel: Story Assist & Development Tools
 * 
 * Features:
 * - Route Mode toggle
 * - Affection/Intimacy setter
 * - Event jumping (Normal / Long History verification)
 * - Auto Skip Quiz (Story Assist)
 * - Save/Status management
 */
export default function DebugPanel({ 
  routeMode, 
  setRouteMode, 
  affection, 
  setAffection, 
  seenEventIds, 
  setSeenEventIds,
  onTriggerEvent,
  autoSkipQuiz,
  setAutoSkipQuiz,
  onClose 
}) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <div 
        onClick={() => setExpanded(true)}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: THEME.starGold,
          padding: '4px 8px',
          borderRadius: '4px',
          border: `1px solid ${THEME.starGold}`,
          fontSize: '10px',
          cursor: 'pointer',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}
      >
        DEBUG / ASSIST
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.95)',
      color: '#fff',
      padding: '16px',
      zIndex: 9999,
      overflowY: 'auto',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: `1px solid ${THEME.brass}`, 
        paddingBottom: '8px',
        flexShrink: 0
      }}>
        <h2 style={{ color: THEME.starGold, margin: 0, fontSize: '0.9em', letterSpacing: '0.05em' }}>DEBUG / ASSIST</h2>
        <button 
          onClick={() => setExpanded(false)} 
          style={{ 
            background: THEME.brass, 
            color: THEME.textDark,
            border: 'none', 
            padding: '4px 8px', 
            borderRadius: '3px', 
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 'bold',
            flexShrink: 0
          }}
        >
          MINIMIZE
        </button>
      </div>

      {/* Global Mode */}
      <section>
        <div style={{ color: THEME.brass, marginBottom: '5px' }}>[ GLOBAL MODE ]</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setRouteMode('normal')}
            style={{ 
              flex: 1, 
              padding: '8px', 
              background: routeMode === 'normal' ? THEME.brass : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            NORMAL
          </button>
          <button 
            onClick={() => setRouteMode('long_history')}
            style={{ 
              flex: 1, 
              padding: '8px', 
              background: routeMode === 'long_history' ? THEME.starGold : '#333',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            LONG HISTORY
          </button>
        </div>
      </section>

      {/* Story Assist */}
      <section>
        <div style={{ color: THEME.brass, marginBottom: '5px' }}>[ STORY ASSIST ]</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px' }}>
          <input 
            type="checkbox" 
            checked={autoSkipQuiz} 
            onChange={(e) => setAutoSkipQuiz(e.target.checked)}
          />
          <span>Auto Complete Quiz (Story Focus)</span>
        </label>
      </section>

      {/* Heroine Management */}
      <section>
        <div style={{ color: THEME.brass, marginBottom: '5px' }}>[ HEROINE & EVENTS ]</div>
        {HEROINES.map(h => (
          <div key={h.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #444', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{h.name}</div>
            
            {/* Affection Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span>Aff: {affection[h.id]}</span>
              <input 
                type="range" min="0" max="100" 
                value={affection[h.id]} 
                onChange={(e) => setAffection(prev => ({ ...prev, [h.id]: parseInt(e.target.value) }))}
                style={{ flex: 1 }}
              />
            </div>

            {/* Event Jumps */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {['_20', '_climax'].map(suffix => {
                const eventId = `${h.id}${suffix}`;
                const ev = (AFFECTION_EVENTS[h.id] || []).find(e => e.id === eventId);
                if (!ev) return null;
                return (
                  <button 
                    key={eventId}
                    onClick={() => onTriggerEvent(ev)}
                    style={{ 
                      fontSize: '10px', 
                      padding: '4px 8px', 
                      background: '#444', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '2px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Jump {suffix}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Flags */}
      <section>
        <div style={{ color: THEME.brass, marginBottom: '5px' }}>[ FLAGS ]</div>
        <div style={{ fontSize: '10px', background: '#222', padding: '5px', maxHeight: '100px', overflowY: 'auto', marginBottom: '5px' }}>
          Seen: {seenEventIds.join(', ') || '(none)'}
        </div>
        <button 
          onClick={() => setSeenEventIds([])}
          style={{ width: '100%', padding: '5px', background: '#622', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          RESET SEEN FLAGS
        </button>
      </section>

      <button 
        onClick={() => setExpanded(false)}
        style={{ marginTop: 'auto', padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        BACK TO GAME
      </button>
    </div>
  );
}
