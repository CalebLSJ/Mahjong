import React from 'react';
import { useGameStore } from '../../store/gameStore';
import Tile from '../ui/Tile';

interface Props { seat: number; }

export default function DiscardPool({ seat }: Props) {
  const view = useGameStore(s => s.view)!;
  const discards = view.discardHistory?.[seat] ?? [];
  const isLastDiscarder = view.lastDiscardSeat === seat;

  return (
    <div className="flex flex-wrap gap-0.5 content-start p-1 min-h-16">
      {discards.map((tile, i) => (
        <Tile key={tile.id} tile={tile} size="sm"
          highlighted={isLastDiscarder && i === discards.length - 1} />
      ))}
    </div>
  );
}
