import React from 'react';
import { Tile } from '@mahjong/shared';
import TileComponent from '../ui/Tile';

interface Props { tiles: Tile[]; label?: string; }

export default function BonusTileDisplay({ tiles, label }: Props) {
  if (tiles.length === 0) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {label && <span className="text-xs text-[#f5e6c8]/40">{label}:</span>}
      {tiles.map(t => <TileComponent key={t.id} tile={t} size="sm" />)}
    </div>
  );
}
