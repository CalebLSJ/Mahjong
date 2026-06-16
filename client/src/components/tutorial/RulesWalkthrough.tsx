import React, { useState } from 'react';

const STEPS = [
  { title: 'The Goal', content: 'Be the first to form a complete winning hand of 14 tiles: four sets (melds) + one pair. A set is a Pong (3 identical), Kong (4 identical), or Chow (3 consecutive same-suit). The pair is your "eyes".' },
  { title: 'Dealing', content: 'Tiles are shuffled and dealt: the dealer gets 14 tiles, everyone else gets 13. Bonus tiles (flowers, seasons, animals) are revealed and replaced with normal tiles before play begins.' },
  { title: 'Your Turn', content: 'Draw a tile from the wall. If it completes your hand, declare WIN (胡). Otherwise, choose one tile to discard face-up into the center.' },
  { title: 'Claiming Discards', content: 'When another player discards, you have 5 seconds to claim it. Priority: WIN > PONG/KONG > CHOW. Only the next player in turn order may Chow (no timer for chow).' },
  { title: 'Pong (碰)', content: 'Claim a discard to complete a triplet from your hand. Example: you hold Red Dragon + Red Dragon, someone discards Red Dragon → Pong, revealing the triplet. Then discard a tile.' },
  { title: 'Kong (杠)', content: 'Like Pong but with 4 identical tiles. Draw a replacement from the wall end. You can also declare a concealed Kong from your own drawn tiles.' },
  { title: 'Chow (吃)', content: 'Claim a discard to complete a sequence. Only available to the next player in turn order. Example: you hold 4-5 Bamboo, the player before you discards 6 Bamboo → Chow 4-5-6.' },
  { title: 'Winning — Ron (胡)', content: 'When someone discards the tile that completes your hand, declare WIN. Only the discarding player pays you.' },
  { title: 'Winning — Zimo (自摸)', content: 'Draw the winning tile from the wall yourself. All three opponents each pay you.' },
  { title: 'Scoring (Tai)', content: 'Your hand value is measured in "tai". Different hand patterns score different tai amounts. You need at least the minimum tai (set by house rules, typically 3) to win. Payment: 2^tai × unit value.' },
];

export default function RulesWalkthrough() {
  const [step, setStep] = useState(0);

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2 mb-4">
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`h-2 rounded-full transition-all ${i === step ? 'bg-[#ffd700] w-4' : 'bg-[#f5e6c8]/30 w-2 hover:bg-[#f5e6c8]/50'}`} />
        ))}
      </div>
      <div className="bg-[#15391f] rounded-xl p-6 min-h-40">
        <div className="text-xs text-[#f5e6c8]/40 uppercase tracking-wider mb-1">Step {step + 1} of {STEPS.length}</div>
        <h3 className="text-xl font-bold text-[#ffd700] mb-3">{STEPS[step].title}</h3>
        <p className="text-[#f5e6c8]/80 leading-relaxed">{STEPS[step].content}</p>
      </div>
      <div className="flex justify-between mt-4">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 border border-[#f5e6c8]/30 text-[#f5e6c8]/60 rounded disabled:opacity-30 hover:border-[#ffd700]">← Previous</button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="px-4 py-2 bg-[#ffd700] text-[#1a472a] font-bold rounded disabled:opacity-30 hover:bg-yellow-400">Next →</button>
      </div>
    </div>
  );
}
