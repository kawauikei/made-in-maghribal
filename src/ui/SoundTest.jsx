import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../game/audioEngine';
import { SFX_CANDIDATES } from '../data/sfxCandidates';
import { TRACKS } from '../data/tracks';

import { THEME } from './theme';

function SoundTest({ onClose, isAudioEnabled, onToggleAudio }) {
  const [currentPlayingId, setCurrentPlayingId] = useState(audioEngine.currentTrackId);
  const hasPreloadedTracksRef = useRef(false);
  const groups = [...new Set(SFX_CANDIDATES.map(c => c.group))];
  const currentTrack = currentPlayingId ? Object.values(TRACKS).find(t => t.id === currentPlayingId) : null;

  useEffect(() => {
    if (hasPreloadedTracksRef.current) return;
    hasPreloadedTracksRef.current = true;
    Object.values(TRACKS).forEach(track => audioEngine.preloadTrack(track));
  }, []);

  const handlePlayTrack = (track) => {
    audioEngine.playTrack(track, 'soundTest');
    setCurrentPlayingId(track.id);
  };

  const handleStop = () => {
    audioEngine.stop();
    setCurrentPlayingId(null);
  };

  return (
    <div data-testid="sound-test-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', flexDirection: 'column', padding: '8px' }}>
      <div style={{ maxWidth: '600px', width: '100%', height: '100%', margin: '0 auto', background: '#1a1a1a', borderRadius: '12px', border: `1px solid ${THEME.brassDark}`, color: '#eee', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        {/* Fixed Header */}
        <div style={{ padding: '12px 16px', background: 'rgba(26, 42, 58, 0.98)', borderBottom: `1px solid ${THEME.brassDark}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, color: THEME.starGold, fontSize: '1.1rem', fontWeight: 'bold' }}>音源確認</h2>
            <button data-testid="sound-test-close" onClick={onClose} style={{ padding: '6px 12px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>閉じる</button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>再生中</div>
              <div style={{ fontSize: '0.85rem', color: currentTrack ? THEME.starGold : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                {currentTrack ? `${currentTrack.title} (${currentTrack.id})` : 'なし'}
              </div>
            </div>
            <button
              onClick={handleStop}
              style={{ padding: '8px 16px', background: currentPlayingId ? '#e53935' : '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', transition: 'background 0.2s' }}
            >
              停止
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px' }}>
          {!isAudioEnabled && (
            <div style={{ background: '#422', padding: '12px', marginBottom: '20px', borderRadius: '8px', color: '#f88', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #622' }}>
              <span>音声がOFFのため、再生されません。</span>
              <button onClick={onToggleAudio} style={{ padding: '6px 12px', background: THEME.starGold, color: THEME.textDark, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>音をONにする</button>
            </div>
          )}

          {/* BGM Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em', fontWeight: 'bold' }}>BGM</h3>

            {[...new Set(Object.values(TRACKS).map(t => t.category || "その他"))].map(category => (
              <div key={category} style={{ marginBottom: '16px' }}>
                <div style={{ color: '#777', fontSize: '0.7rem', marginBottom: '8px', borderLeft: `2px solid ${THEME.brassDark}`, paddingLeft: '8px', fontWeight: 'bold' }}>{category}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {Object.values(TRACKS).filter(t => (t.category || "その他") === category).map(track => {
                    const isPlaying = currentPlayingId === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handlePlayTrack(track)}
                        disabled={!isAudioEnabled}
                        style={{
                          background: isPlaying ? 'rgba(255, 204, 0, 0.15)' : '#2a2a2a',
                          padding: '10px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${isPlaying ? THEME.starGold : '#3a3a3a'}`,
                          textAlign: 'left',
                          cursor: isAudioEnabled ? 'pointer' : 'default',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '0.7rem', color: isPlaying ? THEME.starGold : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                        <div style={{ fontSize: '0.6rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.id}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em', fontWeight: 'bold' }}>効果音</h3>

          {groups.map(group => (
            <div key={group} style={{ marginBottom: '20px' }}>
              <div style={{ color: '#777', fontSize: '0.7rem', marginBottom: '8px', borderLeft: `2px solid ${THEME.brassDark}`, paddingLeft: '8px', fontWeight: 'bold' }}>{group}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {SFX_CANDIDATES.filter(c => c.group === group).map(c => (
                  <button
                    key={c.id}
                    onClick={() => audioEngine.playSfxCandidate(c.id)}
                    disabled={!isAudioEnabled}
                    style={{
                      background: '#2a2a2a',
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: '1px solid #3a3a3a',
                      cursor: isAudioEnabled ? 'pointer' : 'default',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.id}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SoundTest;
