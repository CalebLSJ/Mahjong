import React, { useState } from 'react';
import { useAutoClaimSettings, tileKey } from '../../hooks/useAutoClaimSettings';
import TileComponent from '../ui/Tile';
import Modal from '../ui/Modal';
import { useGameStore } from '../../store/gameStore';

export default function AutoClaimSettings() {
  const [open, setOpen] = useState(false);
  const { config, toggleAutoPong, toggleAutoKong } = useAutoClaimSettings();
  const view = useGameStore(s => s.view);

  const handTiles = view ? view.myHand.filter((t, i, arr) =>
    arr.findIndex(x => tileKey(x) === tileKey(t)) === i
  ) : [];

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-[#f5e6c8]/40 hover:text-[#f5e6c8] text-xs px-2 py-1 border border-[#f5e6c8]/20 rounded">
        Auto-claim ⚙
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} title="Auto-claim Settings">
          <p className="text-[#f5e6c8]/50 text-sm mb-4">Select tiles to auto-pong or auto-kong when discarded by opponents.</p>
          <p className="text-xs text-[#f5e6c8]/40 mb-3">Auto-win is never automatic. Chow is always manual.</p>
          <div className="space-y-2">
            {handTiles.map(tile => (
              <div key={tileKey(tile)} className="flex items-center gap-4">
                <TileComponent tile={tile} size="sm" />
                <div className="flex gap-3 text-sm">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={config.autoPong.includes(tileKey(tile))}
                      onChange={() => toggleAutoPong(tile)} />
                    <span className="text-[#f5e6c8]/70">Auto-pong</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={config.autoKong.includes(tileKey(tile))}
                      onChange={() => toggleAutoKong(tile)} />
                    <span className="text-[#f5e6c8]/70">Auto-kong</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#f5e6c8]/30 mt-4">Settings persist across sessions.</p>
        </Modal>
      )}
    </>
  );
}
