import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ClaimType } from '@mahjong/shared';

export default function ActionButtons() {
  const view = useGameStore(s => s.view)!;
  const claim = useGameStore(s => s.claim);
  const selectedTileId = useGameStore(s => s.selectedTileId);
  const discard = useGameStore(s => s.discard);
  const eligible = view.eligibleClaims;
  const [chowMode, setChowMode] = useState(false);
  const [chowSelected, setChowSelected] = useState<string[]>([]);

  if (eligible.length === 0) return null;

  const isMyTurn = view.currentSeat === view.mySeat && view.phase === 'awaiting-discard';

  if (isMyTurn) {
    return (
      <div className="flex gap-2">
        <p className="text-[#f5e6c8]/40 text-sm self-center">Select a tile to discard (click twice)</p>
        {selectedTileId && (
          <button onClick={() => discard(selectedTileId)}
            className="px-4 py-2 bg-[#f5e6c8] text-[#1a472a] font-bold rounded hover:bg-yellow-100 transition">
            Discard
          </button>
        )}
      </div>
    );
  }

  if (chowMode) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-[#f5e6c8]/60 text-sm">Pick 2 hand tiles to complete chow:</span>
        <button onClick={() => { claim('chow', chowSelected as [string,string]); setChowMode(false); setChowSelected([]); }}
          disabled={chowSelected.length !== 2}
          className="px-4 py-2 bg-[#ffd700] text-[#1a472a] font-bold rounded disabled:opacity-40">
          Confirm
        </button>
        <button onClick={() => { setChowMode(false); setChowSelected([]); }}
          className="px-3 py-2 border border-[#f5e6c8]/30 text-[#f5e6c8]/60 rounded">Cancel</button>
      </div>
    );
  }

  const btnClass = (type: ClaimType) => {
    const base = 'px-4 py-2 font-bold rounded transition text-sm';
    if (type === 'win') return `${base} bg-[#ffd700] text-[#1a472a] hover:bg-yellow-400`;
    if (type === 'pong' || type === 'kong') return `${base} bg-blue-600 text-white hover:bg-blue-500`;
    if (type === 'chow') return `${base} bg-green-700 text-white hover:bg-green-600`;
    return `${base} border border-[#f5e6c8]/30 text-[#f5e6c8]/50 hover:border-[#f5e6c8]`;
  };

  return (
    <div className="flex gap-2">
      {eligible.includes('win') && <button onClick={() => claim('win')} className={btnClass('win')}>WIN 胡!</button>}
      {eligible.includes('kong') && <button onClick={() => claim('kong')} className={btnClass('kong')}>KONG 杠</button>}
      {eligible.includes('pong') && <button onClick={() => claim('pong')} className={btnClass('pong')}>PONG 碰</button>}
      {eligible.includes('chow') && <button onClick={() => setChowMode(true)} className={btnClass('chow')}>CHOW 吃</button>}
      {eligible.includes('pass') && <button onClick={() => claim('pass')} className={btnClass('pass')}>Pass</button>}
    </div>
  );
}
