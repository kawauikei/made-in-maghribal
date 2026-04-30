import React from 'react';
import { THEME } from './theme';

export const hudModalBackdrop = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

export const hudModalCard = {
  background: THEME.parchment,
  borderRadius: '16px',
  width: '90%',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  border: `1px solid ${THEME.brass}`
};

export const hudCloseX = (onClose) => (
  <button
    data-testid="modal-x-close"
    onClick={onClose}
    style={{
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: 'none',
      background: 'rgba(0,0,0,0.1)',
      color: THEME.nightBlue,
      fontSize: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10
    }}
    aria-label="Close"
  >
    ×
  </button>
);
