import React from 'react';
import { Tile as TileType } from '@mahjong/shared';

const CHN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const WIND_CHARS: Record<string, string> = { east: '東', south: '南', west: '西', north: '北' };
const WIND_COLORS: Record<string, string> = { east: '#c62828', south: '#1565c0', west: '#2e7d32', north: '#000' };

// Traditional circle dot arrangements — each entry is [row, col] in a 3-col grid
const CIRCLE_POSITIONS: [number, number][][] = [
  [[1, 1]],
  [[0, 1], [2, 1]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 0], [0, 2], [2, 0], [2, 2]],
  [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 2]],
  [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2], [3, 0], [3, 2]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
];

const CIRCLE_COLORS: Record<number, string> = {
  1: '#e53935', 2: '#43a047', 3: '#1e88e5', 4: '#8e24aa',
  5: '#e53935', 6: '#1e88e5', 7: '#43a047', 8: '#e53935', 9: '#1a237e',
};

function CircleFace({ value, dotPx }: { value: number; dotPx: number }) {
  const rows = value === 8 ? 4 : 3;
  const cols = 3;
  const positions = new Set(CIRCLE_POSITIONS[value - 1].map(([r, c]) => `${r},${c}`));
  const color = CIRCLE_COLORS[value];
  return (
    <div style={{ display: 'grid', gridTemplateRows: `repeat(${rows}, 1fr)`, gridTemplateColumns: `repeat(${cols}, 1fr)`, width: '90%', height: '90%', padding: 1 }}>
      {Array.from({ length: rows * cols }, (_, idx) => {
        const r = Math.floor(idx / cols), c = idx % cols;
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {positions.has(`${r},${c}`) && (
              <div style={{
                width: dotPx, height: dotPx, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${color}bb 0%, ${color} 60%)`,
                boxShadow: `0 0 1px ${color}88`,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BambooFace({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  if (value === 1) {
    const birdSize = size === 'sm' ? '0.9rem' : size === 'md' ? '1.1rem' : '1.5rem';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ fontSize: birdSize, lineHeight: 1 }}>🐦</span>
        {size !== 'sm' && <span style={{ color: '#2e7d32', fontSize: '0.4rem', marginTop: 1 }}>一條</span>}
      </div>
    );
  }
  if (size === 'sm') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: '#2e7d32', fontSize: '0.55rem', fontWeight: 900, lineHeight: 1 }}>{CHN[value]}</span>
        <span style={{ color: '#1b5e20', fontSize: '0.4rem', lineHeight: 1 }}>條</span>
      </div>
    );
  }
  const stickH = size === 'lg' ? 24 : 17;
  const stickW = size === 'lg' ? 5 : 4;
  const maxPerRow = 3;
  const rows: number[][] = [];
  for (let i = 0; i < value; i += maxPerRow) rows.push(Array.from({ length: Math.min(maxPerRow, value - i) }, (_, j) => i + j));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 2 }}>
          {row.map((_, si) => (
            <div key={si} style={{ width: stickW, height: stickH, borderRadius: stickW / 2, position: 'relative', background: 'linear-gradient(180deg, #a5d6a7 0%, #388e3c 30%, #2e7d32 70%, #1b5e20 100%)' }}>
              <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: 1, background: '#c8e6c9', borderRadius: 1 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

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
  const dims: Record<string, { cls: string; numPx: number; subPx: number; dotPx: number }> = {
    sm:  { cls: 'w-7 h-9',   numPx: 9,  subPx: 7,  dotPx: 5 },
    md:  { cls: 'w-9 h-12',  numPx: 12, subPx: 9,  dotPx: 7 },
    lg:  { cls: 'w-12 h-16', numPx: 16, subPx: 11, dotPx: 9 },
  };
  const { cls, numPx, subPx, dotPx } = dims[size];
  const style: React.CSSProperties = {};
  if (rotate) style.transform = `rotate(${rotate}deg)`;

  if (faceDown) {
    return (
      <div
        style={{ ...style, background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }}
        onClick={onClick}
        className={`${cls} border border-blue-950 rounded-sm shadow-md flex-shrink-0 cursor-default`}
      />
    );
  }

  if (!tile) return null;

  function tileContent(): React.ReactNode {
    if (!tile) return null;

    if (tile.kind === 'suit') {
      if (tile.suit === 'characters') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 0 }}>
            <span style={{ color: '#c62828', fontSize: numPx, fontWeight: 900, lineHeight: 1 }}>{CHN[tile.value]}</span>
            <span style={{ color: '#c62828', fontSize: subPx * 0.8, lineHeight: 1 }}>萬</span>
          </div>
        );
      }
      if (tile.suit === 'bamboo') return <BambooFace value={tile.value} size={size} />;
      if (tile.suit === 'circles') {
        if (size === 'sm') {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#1565c0', fontSize: numPx * 0.75, fontWeight: 900, lineHeight: 1 }}>{CHN[tile.value]}</span>
              <span style={{ color: '#1565c0', fontSize: subPx * 0.65, lineHeight: 1 }}>餅</span>
            </div>
          );
        }
        return <CircleFace value={tile.value} dotPx={dotPx} />;
      }
    }

    if (tile.kind === 'wind') {
      return <span style={{ color: WIND_COLORS[tile.wind], fontSize: numPx * 1.3, fontWeight: 900, lineHeight: 1 }}>{WIND_CHARS[tile.wind]}</span>;
    }

    if (tile.kind === 'dragon') {
      if (tile.dragon === 'white') {
        return <div style={{ width: '65%', height: '65%', border: '2px solid #1565c0', borderRadius: 2 }} />;
      }
      const color = tile.dragon === 'red' ? '#c62828' : '#2e7d32';
      const char = tile.dragon === 'red' ? '中' : '發';
      return <span style={{ color, fontSize: numPx * 1.3, fontWeight: 900, lineHeight: 1 }}>{char}</span>;
    }

    if (tile.kind === 'flower') {
      const flowerMap: Record<string, string> = { plum: '梅', orchid: '蘭', chrysanthemum: '菊', 'bamboo-flower': '竹' };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <span style={{ fontSize: numPx * 0.9, lineHeight: 1 }}>🌸</span>
          <span style={{ color: '#e91e63', fontSize: subPx * 0.75, lineHeight: 1 }}>{flowerMap[tile.flower] ?? '花'}</span>
        </div>
      );
    }

    if (tile.kind === 'season') {
      const seasonMap: Record<string, string> = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
      const seasonEmoji: Record<string, string> = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <span style={{ fontSize: numPx * 0.9, lineHeight: 1 }}>{seasonEmoji[tile.season]}</span>
          <span style={{ color: '#ff9800', fontSize: subPx * 0.75, lineHeight: 1 }}>{seasonMap[tile.season] ?? '季'}</span>
        </div>
      );
    }

    if (tile.kind === 'animal') {
      const animalEmoji: Record<string, string> = { rat: '🐀', chicken: '🐓', worm: '🐛', cat: '🐱' };
      return <span style={{ fontSize: numPx * 1.1, lineHeight: 1 }}>{animalEmoji[tile.animal] ?? '🐾'}</span>;
    }

    if (tile.kind === 'fei') {
      return <span style={{ color: '#9c27b0', fontSize: numPx * 1.1, fontWeight: 900, lineHeight: 1 }}>★</span>;
    }

    return null;
  }

  return (
    <div style={style} onClick={onClick}
      className={[
        cls,
        'bg-[#f5e6c8] border border-[#8b6914] rounded-sm shadow-md flex-shrink-0 flex items-center justify-center font-bold select-none transition-transform',
        onClick ? 'cursor-pointer' : 'cursor-default',
        selected ? '-translate-y-2 ring-2 ring-[#ffd700]' : '',
        highlighted ? 'ring-2 ring-[#ffd700] shadow-lg' : '',
      ].filter(Boolean).join(' ')}>
      {tileContent()}
    </div>
  );
}
