import React from 'react';
import { useGameStore } from '../../store/gameStore';

const WIND_CHARS: Record<string, string> = { east: '東', south: '南', west: '西', north: '北' };

export default function CenterInfo() {
  const view = useGameStore(s => s.view)!;
  return (
    <div className="flex flex-col items-center gap-1 text-[#f5e6c8]/40 select-none pointer-events-none">
      <div className="text-4xl font-bold opacity-20">{WIND_CHARS[view.prevailingWind]}</div>
      <div className="text-xs">Round {view.roundNumber}</div>
      <div className="text-xs">Wall: {view.wallCount}</div>
    </div>
  );
}
