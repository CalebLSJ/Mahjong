import React from 'react';
import { useGameStore } from '../../store/gameStore';
import Tile from '../ui/Tile';
import RevealedMeld from './RevealedMeld';

const WIND_CHARS: Record<string, string> = { east: '東', south: '南', west: '西', north: '北' };

interface Props { seat: number; position: 'top' | 'left' | 'right'; }

export default function OpponentStrip({ seat, position }: Props) {
  const view = useGameStore(s => s.view)!;
  const player = view.players[seat];
  if (!player) return null;
  const isVertical = position === 'left' || position === 'right';
  const isCurrentTurn = view.currentSeat === seat;

  return (
    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-2`}>
      <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-1`}>
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${isCurrentTurn ? 'bg-[#ffd700] text-[#1a472a]' : 'bg-[#15391f] text-[#f5e6c8]/60'}`}>
          {WIND_CHARS[player.wind]}
        </span>
        <span className={`text-xs font-medium ${isCurrentTurn ? 'text-[#ffd700]' : 'text-[#f5e6c8]/60'}`}>{player.name}</span>
        {player.isDealer && <span className="text-xs text-[#ffd700]/60">庄</span>}
      </div>
      <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-0.5`}>
        {Array.from({ length: player.handSize }).map((_, i) => (
          <Tile key={i} faceDown size="sm" rotate={isVertical ? 90 : 0} />
        ))}
      </div>
      {player.melds.length > 0 && (
        <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-1`}>
          {player.melds.map((meld, i) => <RevealedMeld key={i} meld={meld} size="sm" />)}
        </div>
      )}
    </div>
  );
}
