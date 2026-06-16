import React, { useState } from 'react';
import { HAND_DEFINITIONS } from '@mahjong/shared';

export default function HandGallery() {
  const [variant, setVariant] = useState<'sg' | 'hk'>('sg');

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['sg', 'hk'] as const).map(v => (
          <button key={v} onClick={() => setVariant(v)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${variant === v ? 'bg-[#ffd700] text-[#1a472a]' : 'border border-[#f5e6c8]/30 text-[#f5e6c8]/60 hover:border-[#ffd700]'}`}>
            {v === 'sg' ? 'Singapore' : 'Hong Kong'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(HAND_DEFINITIONS).map(([key, def]) => (
          <div key={key} className="bg-[#15391f] rounded-lg p-4">
            <h4 className="font-bold text-[#ffd700] text-sm">{def.label}</h4>
            <p className="text-[#f5e6c8]/60 text-xs mt-0.5">{def.description}</p>
            <p className="text-[#f5e6c8]/40 text-xs mt-1 font-mono">{def.example}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
