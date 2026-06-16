import React from 'react';
import { Tile as TileType } from '@mahjong/shared';

const DRAGON_CHARS: Record<string, string> = { red: '中', green: '发', white: '白' };
const WIND_CHARS: Record<string, string> = { east: '東', south: '南', west: '西', north: '北' };
const BAMBOO_COLORS = ['','#c62828','#2e7d32','#2e7d32','#1565c0','#2e7d32','#1565c0','#c62828','#2e7d32','#c62828'];

interface Props {
  tile?: TileType;
  faceDown?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  rotate?: number;
}

export default function Tile({ tile, faceDown, selected, highlighted, onClick, size = 'md', rotate }: Props) {
  const sizes = { sm: 'w-7 h-9 text-xs', md: 'w-9 h-12 text-sm', lg: 'w-12 h-16 text-base' };
  const style: React.CSSProperties = {};
  if (rotate) style.transform = `rotate(${rotate}deg)`;

  if (faceDown) {
    return (
      <div style={style} onClick={onClick}
        className={`${sizes[size]} bg-blue-700 border border-blue-900 rounded-sm shadow-md flex-shrink-0 cursor-default`} />
    );
  }

  if (!tile) return null;

  function tileContent(): React.ReactNode {
    if (!tile) return null;
    if (tile.kind === 'dragon') {
      const color = tile.dragon === 'red' ? '#c62828' : tile.dragon === 'green' ? '#2e7d32' : '#888';
      return <span style={{ color }}>{DRAGON_CHARS[tile.dragon]}</span>;
    }
    if (tile.kind === 'wind') return <span>{WIND_CHARS[tile.wind]}</span>;
    if (tile.kind === 'suit') {
      if (tile.suit === 'bamboo') return <span style={{ color: BAMBOO_COLORS[tile.value] }}>{tile.value}🎋</span>;
      if (tile.suit === 'circles') return <span style={{ color: '#1565c0' }}>{tile.value}●</span>;
      return <span style={{ color: '#c62828' }}>{tile.value}字</span>;
    }
    if (tile.kind === 'flower') return <span style={{ color: '#e91e63' }}>🌸</span>;
    if (tile.kind === 'season') return <span style={{ color: '#ff9800' }}>🍂</span>;
    if (tile.kind === 'animal') return <span>🐾</span>;
    if (tile.kind === 'fei') return <span style={{ color: '#9c27b0' }}>★</span>;
    return null;
  }

  return (
    <div style={style} onClick={onClick}
      className={[
        sizes[size],
        'bg-[#f5e6c8] border border-[#8b6914] rounded-sm shadow-md flex-shrink-0 flex items-center justify-center font-bold select-none transition-transform',
        onClick ? 'cursor-pointer' : 'cursor-default',
        selected ? '-translate-y-2 ring-2 ring-[#ffd700]' : '',
        highlighted ? 'ring-2 ring-[#ffd700] shadow-lg' : '',
      ].filter(Boolean).join(' ')}>
      {tileContent()}
    </div>
  );
}
