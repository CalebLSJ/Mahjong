import React from 'react';

export default function QuickReference() {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="bg-[#15391f] rounded-lg p-4">
        <h4 className="text-[#ffd700] font-bold mb-2">Claim Priority</h4>
        <ol className="space-y-1 text-[#f5e6c8]/70 list-decimal list-inside">
          <li>WIN (any player, 5s timer)</li>
          <li>PONG / KONG (any player, 5s timer)</li>
          <li>CHOW (next player only, no timer)</li>
        </ol>
        <p className="text-[#f5e6c8]/40 text-xs mt-2">If two players claim at same priority, seat order decides.</p>
      </div>
      <div className="bg-[#15391f] rounded-lg p-4">
        <h4 className="text-[#ffd700] font-bold mb-2">Payment Formula</h4>
        <p className="text-[#f5e6c8]/70">Amount = 2<sup>tai</sup> × unit</p>
        <div className="mt-2 space-y-0.5 text-[#f5e6c8]/50 text-xs">
          <div>3 tai → 8 × unit</div>
          <div>4 tai → 16 × unit</div>
          <div>5 tai → 32 × unit</div>
          <div>8 tai → 256 × unit</div>
        </div>
        <p className="text-[#f5e6c8]/40 text-xs mt-2">Ron: discarder pays all. Zimo: all 3 opponents pay equally.</p>
      </div>
      <div className="bg-[#15391f] rounded-lg p-4">
        <h4 className="text-[#ffd700] font-bold mb-2">Common Sets</h4>
        <div className="space-y-1 text-[#f5e6c8]/70">
          <div><strong className="text-[#f5e6c8]">Pong</strong> — 3 identical tiles</div>
          <div><strong className="text-[#f5e6c8]">Kong</strong> — 4 identical (draw 1 replacement)</div>
          <div><strong className="text-[#f5e6c8]">Chow</strong> — 3 consecutive same-suit</div>
        </div>
      </div>
      <div className="bg-[#15391f] rounded-lg p-4">
        <h4 className="text-[#ffd700] font-bold mb-2">Bonus Tiles (SG)</h4>
        <div className="space-y-1 text-[#f5e6c8]/70">
          <div>Matching flower/season → +1 tai each</div>
          <div>All 4 flowers or all 4 seasons → +3 tai</div>
          <div>Rat+Cat or Chicken+Worm (Yao) → +1 unit or +1 tai</div>
        </div>
      </div>
    </div>
  );
}
