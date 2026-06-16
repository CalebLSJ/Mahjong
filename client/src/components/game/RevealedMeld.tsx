import React from 'react';
import { Meld } from '@mahjong/shared';
import Tile from '../ui/Tile';

interface Props { meld: Meld; size?: 'sm' | 'md'; }

export default function RevealedMeld({ meld, size = 'md' }: Props) {
  return (
    <div className="flex gap-0.5">
      {meld.tiles.map((tile, i) => (
        <Tile key={tile.id} tile={tile} size={size}
          rotate={meld.type === 'kong' && i === 1 ? 90 : 0} />
      ))}
    </div>
  );
}
