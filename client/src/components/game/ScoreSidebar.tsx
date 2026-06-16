import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import BonusTileDisplay from './BonusTileDisplay';

const WIND_CHARS: Record<string, string> = { east: '東', south: '南', west: '西', north: '北' };

export default function ScoreSidebar() {
  const view = useGameStore(s => s.view)!;
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="w-52 bg-[#15391f] border-l border-[#f5e6c8]/10 p-3 flex flex-col gap-3 text-xs overflow-y-auto">
      <div className="text-center border-b border-[#f5e6c8]/10 pb-2">
        <div className="text-[#f5e6c8]/50">Round {view.roundNumber} · {WIND_CHARS[view.prevailingWind]} Wind</div>
      </div>
      <div>
        <div className="text-[#f5e6c8]/50 uppercase tracking-wider mb-1">Scores</div>
        {view.players.map(p => (
          <div key={p.id} className={`flex items-center justify-between py-0.5 ${p.seat === view.mySeat ? 'text-[#ffd700]' : 'text-[#f5e6c8]/70'}`}>
            <div className="flex items-center gap-1">
              <span>{WIND_CHARS[p.wind]}</span>
              <span>{p.name}</span>
              {p.isDealer && <span className="text-[#ffd700]/50">庄</span>}
            </div>
            <span className={p.score >= 0 ? 'text-green-400' : 'text-red-400'}>
              {p.score >= 0 ? '+' : ''}{p.score.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div>
        <div className="text-[#f5e6c8]/50 uppercase tracking-wider mb-1">Flowers &amp; Animals</div>
        {view.players.map(p => (
          p.bonusTiles.length > 0 ? (
            <div key={p.id} className="mb-1">
              <span className="text-[#f5e6c8]/40">{p.name}: </span>
              <BonusTileDisplay tiles={p.bonusTiles} />
            </div>
          ) : null
        ))}
        {view.myBonusTiles.length > 0 && (
          <div><span className="text-[#ffd700]/60">You: </span><BonusTileDisplay tiles={view.myBonusTiles} /></div>
        )}
      </div>
      <div className="border-t border-[#f5e6c8]/10 pt-2">
        <button onClick={() => setShowRules(!showRules)} className="text-[#f5e6c8]/40 hover:text-[#f5e6c8] w-full text-left">
          {showRules ? '▾' : '▸'} House Rules
        </button>
        {showRules && (
          <div className="mt-1 space-y-0.5 text-[#f5e6c8]/50">
            <div>Variant: {view.houseRules.variant.toUpperCase()}</div>
            <div>Min tai: {view.houseRules.minTai}</div>
            <div>Max tai: {view.houseRules.maxTai ?? 'No limit'}</div>
            <div>7 Pairs: {view.houseRules.allow7Pairs ? '✓' : '✗'}</div>
            <div>Chow: {view.houseRules.allowChow ? '✓' : '✗'}</div>
            <div>Fei: {view.houseRules.feiEnabled ? '✓' : '✗'}</div>
            <div>Yao: {view.houseRules.yaoPayout}</div>
            <div>Unit: ${view.houseRules.unitValue}</div>
          </div>
        )}
      </div>
    </div>
  );
}
