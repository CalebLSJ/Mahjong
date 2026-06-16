import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { socket } from '../../socket';

export default function WinScreen() {
  const view = useGameStore(s => s.view)!;
  const result = view.roundResult!;
  const winner = view.players.find(p => p.id === result.winnerId);
  const isMe = result.winnerId === view.myPlayerId;

  return (
    <div className="min-h-screen bg-[#1a472a] flex items-center justify-center">
      <div className="bg-[#15391f] rounded-2xl p-8 max-w-lg w-full mx-4 border border-[#ffd700]/30">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{isMe ? '🎉' : '🀄'}</div>
          <h2 className="text-3xl font-bold text-[#ffd700]">{isMe ? 'You Win!' : `${winner?.name} Wins!`}</h2>
          <p className="text-[#f5e6c8]/60 mt-1">{result.winType === 'zimo' ? 'Self-draw (自摸)' : 'Ron (胡)'} · {result.totalTai} tai</p>
        </div>
        <div className="mb-6">
          <h3 className="text-[#f5e6c8]/50 uppercase text-xs tracking-wider mb-2">Scoring Breakdown</h3>
          <div className="space-y-1">
            {result.taiComponents.map(c => (
              <div key={c.key} className="flex justify-between text-sm">
                <span className="text-[#f5e6c8]/80">{c.label}</span>
                <span className="text-[#ffd700]">{c.tai} tai</span>
              </div>
            ))}
            <div className="flex justify-between font-bold border-t border-[#f5e6c8]/20 pt-1 mt-1">
              <span className="text-[#f5e6c8]">Total</span>
              <span className="text-[#ffd700]">{result.totalTai} tai</span>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-[#f5e6c8]/50 uppercase text-xs tracking-wider mb-2">Payments</h3>
          {view.players.map(p => {
            const delta = result.payouts[p.id] ?? 0;
            if (delta === 0) return null;
            return (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-[#f5e6c8]/70">{p.name}</span>
                <span className={delta > 0 ? 'text-green-400' : 'text-red-400'}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <button onClick={() => socket.emit('room:start' as any)}
          className="w-full bg-[#ffd700] text-[#1a472a] font-bold py-3 rounded-lg hover:bg-yellow-400 transition">
          Next Round
        </button>
      </div>
    </div>
  );
}
