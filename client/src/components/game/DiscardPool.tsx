import React from 'react';
import { useGameStore } from '../../store/gameStore';
import Tile from '../ui/Tile';

interface Props { seat: number; position: 'top' | 'bottom' | 'left' | 'right'; }

export default function DiscardPool({ seat, position }: Props) {
  const view = useGameStore(s => s.view)!;
  const discards = (view.discardHistory?.[seat] ?? []);
  const isLastDiscarder = view.lastDiscardSeat === seat;

  // Horizontal pools (top/bottom): wrap in rows of 6
  // Vertical pools (left/right): single column
  const isVertical = position === 'left' || position === 'right';

  return (
    <div
      className={`flex flex-wrap gap-0.5 ${isVertical ? 'flex-col' : 'flex-row'}`}
      style={{ maxWidth: isVertical ? undefined : 180, maxHeight: isVertical ? 120 : undefined }}
    >
      {discards.map((tile, i) => (
        <Tile
          key={tile.id}
          tile={tile}
          size="sm"
          highlighted={isLastDiscarder && i === discards.length - 1}
        />
      ))}
    </div>
  );
}
