import React from 'react';
import { Tile as TileType } from '@mahjong/shared';

const CHN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const WIND_CHARS: Record<string, string> = { east: '東', south: '南', west: '西', north: '北' };

// ── SVG flower/season art ──────────────────────────────────────────────────

function PlumSVG() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '82%', height: '82%' }}>
      <g transform="translate(12,11)">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="0" cy="-5" rx="2.8" ry="4.2"
            fill="#e91e63" opacity="0.88" transform={`rotate(${a})`} />
        ))}
        <circle r="2.2" fill="#ffc107" />
        <circle r="0.7" cy="-1.2" cx="0.8" fill="#ff6f00" />
      </g>
    </svg>
  );
}

function OrchidSVG() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '82%', height: '82%' }}>
      <g transform="translate(12,12)">
        {[0, 120, 240].map(a => (
          <ellipse key={a} cx="0" cy="-5.5" rx="3" ry="5"
            fill="#ab47bc" opacity="0.85" transform={`rotate(${a})`} />
        ))}
        {[60, 300].map(a => (
          <ellipse key={a} cx="0" cy="-4" rx="1.8" ry="3.5"
            fill="#ce93d8" opacity="0.9" transform={`rotate(${a})`} />
        ))}
        <circle r="2" fill="#ffd54f" />
      </g>
    </svg>
  );
}

function ChrysanthemumSVG() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '82%', height: '82%' }}>
      <g transform="translate(12,12)">
        {Array.from({ length: 12 }, (_, i) => i * 30).map(a => (
          <ellipse key={a} cx="0" cy="-5" rx="1.6" ry="4.2"
            fill="#ffb300" opacity="0.9" transform={`rotate(${a})`} />
        ))}
        <circle r="2.8" fill="#ff8f00" />
      </g>
    </svg>
  );
}

function BambooFlowerSVG() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '82%', height: '82%' }}>
      {[5, 10, 15, 20].map((x, i) => (
        <g key={i}>
          <rect x={x - 1.2} y="2" width="2.4" height="6.5" rx="1.2" fill={i % 2 === 0 ? '#2e7d32' : '#388e3c'} />
          <line x1={x - 1.2} y1="5.5" x2={x + 1.2} y2="5.5" stroke="#a5d6a7" strokeWidth="0.5" />
          <rect x={x - 1.2} y="9.5" width="2.4" height="6.5" rx="1.2" fill={i % 2 === 0 ? '#388e3c' : '#2e7d32'} />
          <line x1={x - 1.2} y1="13" x2={x + 1.2} y2="13" stroke="#a5d6a7" strokeWidth="0.5" />
          {i < 3 && (
            <path d={`M${x + 1.2} ${11 - i} Q${x + 3} ${9 - i} ${x + 3} ${7 - i}`}
              stroke="#66bb6a" strokeWidth="1" fill="none" />
          )}
        </g>
      ))}
    </svg>
  );
}

function SpringSVG() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '82%', height: '82%' }}>
      <g transform="translate(12,11)">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="0" cy="-4.5" rx="2.5" ry="4"
            fill="#f8bbd0" opacity="0.95" transform={`rotate(${a})`} />
        ))}
        <circle r="2" fill="#ff80ab" />
      </g>
      <line x1="12" y1="16" x2="12" y2="22" stroke="#388e3c" strokeWidth="1.5" />
      <path d="M12,19 Q8,17 8,15" stroke="#4caf50" strokeWidth="1" fill="none" />
    </svg>
  );
}

function SummerSVG() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '82%', height: '82%' }}>
      <g transform="translate(12,12)">
        {Array.from({ length: 8 }, (_, i) => i * 45).map(a => (
          <ellipse key={a} cx="0" cy="-5.5" rx="2.2" ry="4.5"
            fill="#ff7043" opacity="0.82" transform={`rotate(${a})`} />
        ))}
        <circle r="3.5" fill="#ffca28" />
      </g>
    </svg>
  );
}

function AutumnSVG() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '82%', height: '82%' }}>
      <g transform="translate(12,13)">
        {/* centre point up */}
        <path d="M0,-9 C-3,-7 -7,-5 -5,-1 C-3,-3 -1,-2 0,0 C1,-2 3,-3 5,-1 C7,-5 3,-7 0,-9Z" fill="#e64a19" />
        {/* left lobe */}
        <path d="M-5,-1 C-9,0 -10,4 -7,4 C-5,3 -3,1 0,0Z" fill="#bf360c" />
        {/* right lobe */}
        <path d="M5,-1 C9,0 10,4 7,4 C5,3 3,1 0,0Z" fill="#bf360c" />
        {/* stem */}
        <line x1="0" y1="0" x2="0" y2="7" stroke="#795548" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

function WinterSVG() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '82%', height: '82%' }}>
      <g transform="translate(12,12)">
        {[0, 60, 120].map(a => (
          <g key={a} transform={`rotate(${a})`}>
            <line y1="-9" y2="9" stroke="#90caf9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-3" y1="-5" x2="3" y2="-5" stroke="#90caf9" strokeWidth="1" strokeLinecap="round" />
            <line x1="-3" y1="5" x2="3" y2="5" stroke="#90caf9" strokeWidth="1" strokeLinecap="round" />
            <line x1="-1.5" y1="-7" x2="1.5" y2="-7" stroke="#90caf9" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="-1.5" y1="7" x2="1.5" y2="7" stroke="#90caf9" strokeWidth="0.8" strokeLinecap="round" />
          </g>
        ))}
        <circle r="2" fill="#42a5f5" />
      </g>
    </svg>
  );
}

// ── Bird for 1-bamboo ──────────────────────────────────────────────────────

function BirdSVG() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '88%', height: '88%' }}>
      {/* body */}
      <ellipse cx="12" cy="13" rx="5.5" ry="4" fill="#6d4c41" />
      {/* head */}
      <circle cx="15.5" cy="9.5" r="3" fill="#6d4c41" />
      {/* beak */}
      <polygon points="18,9 21,8.5 18,10.5" fill="#ff8f00" />
      {/* eye */}
      <circle cx="16.5" cy="8.8" r="1.1" fill="white" />
      <circle cx="17" cy="8.8" r="0.55" fill="#212121" />
      <circle cx="17.2" cy="8.5" r="0.2" fill="white" />
      {/* wing */}
      <path d="M8,12 C4,10 4,15 8.5,15Z" fill="#4e342e" />
      {/* tail */}
      <path d="M6.5,13.5 L3,11 M6.5,13.5 L3,13.5 M6.5,13.5 L3,16"
        stroke="#4e342e" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* perch */}
      <line x1="8" y1="17" x2="16" y2="17" stroke="#795548" strokeWidth="1.2" />
      <line x1="10" y1="17" x2="9" y2="20" stroke="#795548" strokeWidth="1" />
      <line x1="14" y1="17" x2="15" y2="20" stroke="#795548" strokeWidth="1" />
    </svg>
  );
}

// ── Circle dot grid ────────────────────────────────────────────────────────

// [row, col] positions in a 3-column grid (rows 0..3)
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
  const positions = new Set(CIRCLE_POSITIONS[value - 1].map(([r, c]) => `${r},${c}`));
  const color = CIRCLE_COLORS[value];
  return (
    <div style={{ display: 'grid', gridTemplateRows: `repeat(${rows}, 1fr)`, gridTemplateColumns: 'repeat(3, 1fr)', width: '90%', height: '90%', padding: 1 }}>
      {Array.from({ length: rows * 3 }, (_, idx) => {
        const r = Math.floor(idx / 3), c = idx % 3;
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {positions.has(`${r},${c}`) && (
              <div style={{
                width: dotPx, height: dotPx, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${color}99 0%, ${color} 55%)`,
                border: `1px solid ${color}66`,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Bamboo sticks ──────────────────────────────────────────────────────────

// Row layout: always max 2 rows, front-loaded
const BAMBOO_ROWS: [number, number][] = [
  [1, 0], [2, 0], [3, 0], [4, 0],
  [3, 2], [3, 3], [4, 3], [4, 4], [5, 4],
];

function BambooFace({ value, size }: { value: number; size: 'sm' | 'md' | 'lg' }) {
  if (value === 1) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <BirdSVG />
      </div>
    );
  }
  if (size === 'sm') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: '#2e7d32', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>{CHN[value]}</span>
        <span style={{ color: '#1b5e20', fontSize: 7, lineHeight: 1 }}>條</span>
      </div>
    );
  }
  const stickH = size === 'lg' ? 18 : 12;
  const stickW = size === 'lg' ? 5 : 4;
  const [row1Count, row2Count] = BAMBOO_ROWS[value - 1];
  const rows = row2Count > 0 ? [row1Count, row2Count] : [row1Count];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 3 }}>
      {rows.map((count, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: count }, (_, si) => (
            <div key={si} style={{
              width: stickW, height: stickH, borderRadius: stickW / 2, position: 'relative',
              background: 'linear-gradient(180deg, #a5d6a7 0%, #388e3c 28%, #2e7d32 72%, #1b5e20 100%)',
            }}>
              <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: 1, background: '#c8e6c9', borderRadius: 1 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main Tile component ────────────────────────────────────────────────────

interface Props {
  tile?: TileType;
  faceDown?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  rotate?: number;
}

const SIZE_META = {
  sm:  { cls: 'w-7 h-9',   font: 9,  dot: 5  },
  md:  { cls: 'w-9 h-12',  font: 13, dot: 7  },
  lg:  { cls: 'w-12 h-16', font: 17, dot: 9  },
};

export default function Tile({ tile, faceDown, selected, highlighted, onClick, size = 'md', rotate }: Props) {
  const { cls, font, dot } = SIZE_META[size];
  const rotateCss: React.CSSProperties = rotate ? { transform: `rotate(${rotate}deg)` } : {};

  if (faceDown) {
    return (
      <div
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', ...rotateCss }}
        onClick={onClick}
        className={`${cls} border border-blue-950 rounded-sm shadow-md flex-shrink-0 cursor-default`}
      />
    );
  }

  if (!tile) return null;

  function tileContent(): React.ReactNode {
    if (!tile) return null;

    // ── Suit tiles ────────────────────────────────────
    if (tile.kind === 'suit') {
      if (tile.suit === 'characters') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 0 }}>
            <span style={{ color: '#c62828', fontSize: font, fontWeight: 900, lineHeight: 1.15 }}>{CHN[tile.value]}</span>
            <span style={{ color: '#c62828', fontSize: font, fontWeight: 700, lineHeight: 1.1 }}>萬</span>
          </div>
        );
      }
      if (tile.suit === 'bamboo') return <BambooFace value={tile.value} size={size} />;
      if (tile.suit === 'circles') {
        if (size === 'sm') {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#1565c0', fontSize: font, fontWeight: 900, lineHeight: 1.15 }}>{CHN[tile.value]}</span>
              <span style={{ color: '#1565c0', fontSize: font, fontWeight: 700, lineHeight: 1.1 }}>餅</span>
            </div>
          );
        }
        return <CircleFace value={tile.value} dotPx={dot} />;
      }
    }

    // ── Wind tiles ────────────────────────────────────
    if (tile.kind === 'wind') {
      return (
        <span style={{ color: '#1a1a1a', fontSize: font * 1.35, fontWeight: 900, lineHeight: 1 }}>
          {WIND_CHARS[tile.wind]}
        </span>
      );
    }

    // ── Dragon tiles ──────────────────────────────────
    if (tile.kind === 'dragon') {
      if (tile.dragon === 'white') {
        return <div style={{ width: '62%', height: '62%', border: '2.5px solid #1565c0', borderRadius: 2 }} />;
      }
      const color = tile.dragon === 'red' ? '#c62828' : '#2e7d32';
      const char  = tile.dragon === 'red' ? '中' : '發';
      return <span style={{ color, fontSize: font * 1.35, fontWeight: 900, lineHeight: 1 }}>{char}</span>;
    }

    // ── Bonus tiles ───────────────────────────────────
    if (tile.kind === 'flower') {
      const FlowerMap: Record<string, React.FC> = {
        plum: PlumSVG, orchid: OrchidSVG,
        chrysanthemum: ChrysanthemumSVG, 'bamboo-flower': BambooFlowerSVG,
      };
      const FlowerComp = FlowerMap[tile.flower] ?? PlumSVG;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', gap: 0 }}>
          <FlowerComp />
          {size !== 'sm' && (
            <span style={{ color: '#e91e63', fontSize: font * 0.65, fontWeight: 700, lineHeight: 1, marginTop: -2 }}>
              {({ plum: '梅', orchid: '蘭', chrysanthemum: '菊', 'bamboo-flower': '竹' } as Record<string,string>)[tile.flower] ?? '花'}
            </span>
          )}
        </div>
      );
    }

    if (tile.kind === 'season') {
      const SeasonMap: Record<string, React.FC> = {
        spring: SpringSVG, summer: SummerSVG, autumn: AutumnSVG, winter: WinterSVG,
      };
      const SeasonComp = SeasonMap[tile.season] ?? SpringSVG;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', gap: 0 }}>
          <SeasonComp />
          {size !== 'sm' && (
            <span style={{ color: '#ff8f00', fontSize: font * 0.65, fontWeight: 700, lineHeight: 1, marginTop: -2 }}>
              {({ spring: '春', summer: '夏', autumn: '秋', winter: '冬' } as Record<string,string>)[tile.season] ?? '季'}
            </span>
          )}
        </div>
      );
    }

    if (tile.kind === 'animal') {
      const animalChars: Record<string, string> = { rat: '鼠', chicken: '雞', worm: '蜈', cat: '貓' };
      return (
        <span style={{ color: '#6d4c41', fontSize: font * 1.15, fontWeight: 900, lineHeight: 1 }}>
          {animalChars[tile.animal] ?? '獸'}
        </span>
      );
    }

    if (tile.kind === 'fei') {
      return <span style={{ color: '#9c27b0', fontSize: font * 1.1, fontWeight: 900, lineHeight: 1 }}>飛</span>;
    }

    return null;
  }

  return (
    <div
      style={rotateCss}
      onClick={onClick}
      className={[
        cls,
        'bg-[#f5e6c8] border border-[#8b6914] rounded-sm shadow-md flex-shrink-0 flex items-center justify-center font-bold select-none transition-transform',
        onClick ? 'cursor-pointer' : 'cursor-default',
        selected ? '-translate-y-2 ring-2 ring-[#ffd700]' : '',
        highlighted ? 'ring-2 ring-[#ffd700] shadow-lg' : '',
      ].filter(Boolean).join(' ')}
    >
      {tileContent()}
    </div>
  );
}
