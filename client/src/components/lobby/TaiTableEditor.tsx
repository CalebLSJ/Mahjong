import React, { useState } from 'react';
import { HAND_DEFINITIONS } from '@mahjong/shared';

interface Props {
  taiTable: Record<string, number>;
  onChange: (t: Record<string, number>) => void;
  readonly?: boolean;
}

const PRESET_KEY = 'mahjong-tai-presets';

export default function TaiTableEditor({ taiTable, onChange, readonly }: Props) {
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<Record<string, Record<string, number>>>(
    () => JSON.parse(localStorage.getItem(PRESET_KEY) || '{}')
  );

  function savePreset() {
    if (!presetName.trim()) return;
    const updated = { ...presets, [presetName.trim()]: taiTable };
    localStorage.setItem(PRESET_KEY, JSON.stringify(updated));
    setPresets(updated);
    setPresetName('');
  }

  function loadPreset(name: string) { onChange({ ...presets[name] }); }

  return (
    <div>
      {!readonly && (
        <div className="flex gap-2 mb-3 flex-wrap">
          <input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset name"
            className="flex-1 min-w-0 bg-green-900 border border-[#f5e6c8]/30 text-[#f5e6c8] rounded px-2 py-1 text-sm" />
          <button onClick={savePreset} className="px-3 py-1 bg-[#ffd700] text-[#1a472a] rounded text-sm font-bold">Save</button>
          {Object.keys(presets).map(k => (
            <button key={k} onClick={() => loadPreset(k)} className="px-2 py-1 border border-[#f5e6c8]/30 text-[#f5e6c8]/70 rounded text-xs hover:border-[#ffd700]">
              {k}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
        {Object.entries(HAND_DEFINITIONS).map(([key, def]) => (
          <div key={key} className="flex items-center justify-between py-1 border-b border-[#f5e6c8]/10">
            <div className="flex-1 min-w-0 mr-2">
              <div className="text-sm text-[#f5e6c8]/90 truncate">{def.label}</div>
              <div className="text-xs text-[#f5e6c8]/40">{def.description}</div>
            </div>
            <input type="number" min={0} max={32} value={taiTable[key] ?? 0} disabled={readonly}
              onChange={e => onChange({ ...taiTable, [key]: Number(e.target.value) })}
              className="w-12 bg-green-900 border border-[#f5e6c8]/30 text-[#f5e6c8] text-center rounded px-1 text-sm flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
