import React from 'react';
import { THEME } from './theme';
import { BACKGROUND_IMAGES, STILL_IMAGES } from '../data/imageAssets';

/**
 * VisualTestScreen Component
 * Decoupled from App.jsx to handle Asset Testing (BG/STILL)
 */
const VisualTestScreen = ({
  visualTestMode,
  setVisualTestMode,
  bgTestIndex,
  setBgTestIndex,
  stillTestIndex,
  setStillTestIndex,
  handleBackToTitle,
  getFullPath,
  getFileName,
  renderThemeStyles
}) => {
  const bgList = Object.values(BACKGROUND_IMAGES);
  const stillList = Object.values(STILL_IMAGES);
  
  const bg = bgList[bgTestIndex % bgList.length];
  const still = stillList[stillTestIndex % stillList.length];

  // Static styles replicated from App.jsx to minimize prop passing
  const containerStyle = {
    width: '100%',
    height: '100%',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box'
  };

  const utilityBackButtonStyle = {
    padding: '8px 16px',
    background: '#333',
    color: THEME.sand,
    border: `1px solid ${THEME.brass}`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: 'bold',
    margin: '10px 0',
    alignSelf: 'flex-start'
  };

  return (
    <div data-testid="visual-test-screen" style={{ ...containerStyle, padding: '0 0 20px 0' }}>
      {renderThemeStyles && renderThemeStyles()}
      
      {/* Fixed Header */}
      <div style={{ width: '100%', padding: '10px 16px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 100 }}>
        <button data-testid="visual-test-back" onClick={handleBackToTitle} style={{ ...utilityBackButtonStyle, margin: 0, fontSize: '0.8em', padding: '6px 12px' }}>TITLE</button>
        <div style={{ flex: 1, color: THEME.sand, fontWeight: 'bold', fontSize: '0.9em' }}>映像確認 Asset Test</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button data-testid="visual-test-tab-bg" onClick={() => setVisualTestMode('background')} style={{ ...utilityBackButtonStyle, margin: 0, background: visualTestMode === 'background' ? THEME.brass : '#333', color: visualTestMode === 'background' ? THEME.textDark : '#aaa', fontSize: '0.75em', padding: '4px 8px' }}>BG</button>
          <button data-testid="visual-test-tab-still" onClick={() => setVisualTestMode('still')} style={{ ...utilityBackButtonStyle, margin: 0, background: visualTestMode === 'still' ? THEME.brass : '#333', color: visualTestMode === 'still' ? THEME.textDark : '#aaa', fontSize: '0.75em', padding: '4px 8px' }}>STILL</button>
        </div>
      </div>

      <div style={{ flex: 1, width: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
        {visualTestMode === 'background' ? (
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <div style={{ marginBottom: '15px', textAlign: 'left', minHeight: '46px' }} className="selectable-text">
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: THEME.brass, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bg.label}</div>
              <div style={{ fontSize: '0.75em', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }} title={bg.src}>ID: {bg.id} | Path: {getFileName(bg.src)}</div>
            </div>

            {/* Main Preview */}
            <div style={{ width: '100%', maxWidth: '390px', aspectRatio: '3/4', background: '#000', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${THEME.brass}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <img 
                key={bg.id}
                src={getFullPath(bg.src)} 
                alt={bg.label} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                draggable={false}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span style="color:#f44">Background Load Failed</span>';
                }}
              />
            </div>

            {/* Thumbnail Selector */}
            <div style={{ width: '100%', maxWidth: '800px', height: '180px', overflowX: 'auto', overflowY: 'hidden', padding: '8px 0', scrollbarWidth: 'thin' }}>
              <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(2, 120px)', gridAutoColumns: '90px', gap: '10px', alignContent: 'start', width: 'max-content' }}>
                {bgList.map((item, idx) => (
                  <div
                    data-testid="visual-test-thumbnail"
                    key={item.id}
                    onClick={() => setBgTestIndex(idx)}
                    style={{
                      width: '90px',
                      height: '120px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: `2px solid ${idx === bgTestIndex % bgList.length ? THEME.brass : '#333'}`,
                      cursor: 'pointer',
                      boxShadow: idx === bgTestIndex % bgList.length ? `0 0 0 2px ${THEME.brass}44, 0 0 18px ${THEME.brass}55` : 'none'
                    }}
                  >
                    <img src={getFullPath(item.src)} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <div style={{ marginBottom: '15px', textAlign: 'left', minHeight: '46px' }} className="selectable-text">
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: THEME.brass, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{still.label}</div>
              <div style={{ fontSize: '0.75em', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }} title={`${still.id} | ${still.src} | focus ${still.focusX}, ${still.focusY}`}>ID: {still.id} | Path: {getFileName(still.src)} | Focus: {still.focusX}, {still.focusY}</div>
            </div>

            {/* Main Preview */}
            <div style={{ width: '100%', maxWidth: '390px', aspectRatio: '3/4', background: '#000', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${THEME.brass}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <img 
                key={still.id}
                src={getFullPath(still.src)} 
                alt={still.label} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                draggable={false}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span style="color:#f44">Still Load Failed</span>';
                }}
              />
            </div>

            {/* Thumbnail Selector */}
            <div style={{ width: '100%', maxWidth: '800px', height: '180px', overflowX: 'auto', overflowY: 'hidden', padding: '8px 0', scrollbarWidth: 'thin' }}>
              <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(2, 120px)', gridAutoColumns: '90px', gap: '10px', alignContent: 'start', width: 'max-content' }}>
                {stillList.map((item, idx) => (
                  <div
                    data-testid="visual-test-thumbnail"
                    key={item.id}
                    onClick={() => setStillTestIndex(idx)}
                    style={{
                      width: '90px',
                      height: '120px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: `2px solid ${idx === stillTestIndex % stillList.length ? THEME.brass : '#333'}`,
                      cursor: 'pointer',
                      boxShadow: idx === stillTestIndex % stillList.length ? `0 0 0 2px ${THEME.brass}44, 0 0 18px ${THEME.brass}55` : 'none'
                    }}
                  >
                    <img src={getFullPath(item.src)} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualTestScreen;
