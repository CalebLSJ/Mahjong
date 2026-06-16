import React from 'react';
import { HouseRules } from '@mahjong/shared';

interface Props { rules: HouseRules; onChange: (r: HouseRules) => void; readonly?: boolean; }

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#f5e6c8]/10">
      <span className="text-sm text-[#f5e6c8]/80">{label}</span>
      <button onClick={() => onChange(!value)} type="button"
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-[#ffd700]' : 'bg-green-900 border border-[#f5e6c8]/30'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function HouseRulesForm({ rules, onChange, readonly }: Props) {
  function set<K extends keyof HouseRules>(key: K, value: HouseRules[K]) {
    if (readonly) return;
    onChange({ ...rules, [key]: value });
  }

  return (
    <div className="space-y-0.5">
      <div className="flex gap-3 mb-3">
        {(['sg', 'hk'] as const).map(v => (
          <button key={v} onClick={() => set('variant', v)} disabled={readonly} type="button"
            className={`px-4 py-1.5 rounded font-medium text-sm transition ${rules.variant === v ? 'bg-[#ffd700] text-[#1a472a]' : 'border border-[#f5e6c8]/30 text-[#f5e6c8]/60 hover:border-[#ffd700]'}`}>
            {v === 'sg' ? 'Singapore' : 'Hong Kong'}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between py-1.5 border-b border-[#f5e6c8]/10">
        <span className="text-sm text-[#f5e6c8]/80">Min tai to win</span>
        <input type="number" min={1} max={16} value={rules.minTai} disabled={readonly}
          onChange={e => set('minTai', Number(e.target.value))}
          className="w-16 bg-green-900 border border-[#f5e6c8]/30 text-[#f5e6c8] text-center rounded px-1" />
      </div>
      <div className="flex items-center justify-between py-1.5 border-b border-[#f5e6c8]/10">
        <span className="text-sm text-[#f5e6c8]/80">Max tai cap (blank = none)</span>
        <input type="number" min={1} max={32} value={rules.maxTai ?? ''} disabled={readonly}
          onChange={e => set('maxTai', e.target.value ? Number(e.target.value) : null)}
          className="w-16 bg-green-900 border border-[#f5e6c8]/30 text-[#f5e6c8] text-center rounded px-1" />
      </div>
      <Toggle label="Allow 7 Pairs (七对)" value={rules.allow7Pairs} onChange={v => set('allow7Pairs', v)} />
      <Toggle label="Allow 13 Orphans (十三幺)" value={rules.allow13Orphans} onChange={v => set('allow13Orphans', v)} />
      <Toggle label="Flower & Season tiles" value={rules.allowFlowers} onChange={v => set('allowFlowers', v)} />
      <Toggle label="Animal tiles (Rat/Chicken/Worm/Cat)" value={rules.allowAnimals} onChange={v => set('allowAnimals', v)} />
      <div className="flex items-center justify-between py-1.5 border-b border-[#f5e6c8]/10">
        <span className="text-sm text-[#f5e6c8]/80">Yao payout</span>
        <select value={rules.yaoPayout} disabled={readonly} onChange={e => set('yaoPayout', e.target.value as 'unit' | 'tai')}
          className="bg-green-900 border border-[#f5e6c8]/30 text-[#f5e6c8] rounded px-2 py-0.5 text-sm">
          <option value="unit">+1 unit from all</option>
          <option value="tai">+1 tai to hand</option>
        </select>
      </div>
      <Toggle label="Fei (wildcard joker)" value={rules.feiEnabled} onChange={v => set('feiEnabled', v)} />
      <Toggle label="Allow Chow (吃)" value={rules.allowChow} onChange={v => set('allowChow', v)} />
      <Toggle label="Lv Yi Se (绿一色) recognized" value={rules.lvYiSeRecognized} onChange={v => set('lvYiSeRecognized', v)} />
      <Toggle label="Da Si Xi — strict non-wind pair" value={rules.daSiXiStrictPair} onChange={v => set('daSiXiStrictPair', v)} />
      <Toggle label="Da San Yuan — strict non-dragon pair" value={rules.daSanYuanStrictPair} onChange={v => set('daSanYuanStrictPair', v)} />
      <Toggle label="Dealer bonus" value={rules.dealerBonus} onChange={v => set('dealerBonus', v)} />
      <Toggle label="Self-draw (zimo) bonus" value={rules.zimoBonus} onChange={v => set('zimoBonus', v)} />
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#f5e6c8]/80">Unit value ($)</span>
        <input type="number" min={0.01} step={0.01} value={rules.unitValue} disabled={readonly}
          onChange={e => set('unitValue', Number(e.target.value))}
          className="w-20 bg-green-900 border border-[#f5e6c8]/30 text-[#f5e6c8] text-center rounded px-1" />
      </div>
    </div>
  );
}
