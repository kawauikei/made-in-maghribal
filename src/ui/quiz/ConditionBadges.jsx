import React from 'react';
import { THEME } from '../theme';
import { COLOR_BY_ID } from '../../data/principles';
import { GENRE_BY_ID, ITEM_TYPE_BY_ID } from '../../data/itemTypes';

export default function ConditionBadges({ criteria }) {
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
}
