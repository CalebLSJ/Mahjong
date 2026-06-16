import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { socket } from '../../socket';

export default function RoundSummary() {
  const view = useGameStore(s => s.view)!;
  return (
    <div className="min-h-screen bg-[#1a472a] flex items-center justify-center">
      <div className="bg-[#15391f] rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-[#f5e6c8]/20">
        <div className="text-4xl mb-3">🀄</div>
        <h2 className="text-2xl font-bold text-[#f5e6c8] mb-1">Draw</h2>
        <p className="text-[#f5e6c8]/50 mb-6">Wall exhausted — no winner this round</p>
        <div className="space-y-1 mb-6 text-sm">
          {view.players.map(p => (
            <div key={p.id} className="flex justify-between">
              <span className="text-[#f5e6c8]/70">{p.name}</span>
              <span className={p.score >= 0 ? 'text-green-400' : 'text-red-400'}>
                {p.score >= 0 ? '+' : ''}{p.score.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <button onClick={() => socket.emit('room:start' as any)}
          className="w-full bg-[#ffd700] text-[#1a472a] font-bold py-3 rounded-lg hover:bg-yellow-400">
          Next Round
        </button>
      </div>
    </div>
  );
}
