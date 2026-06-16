import { useState, useEffect } from 'react';
import { Tile } from '@mahjong/shared';

const STORAGE_KEY = 'mahjong-auto-claim';

export interface AutoClaimConfig {
  autoPong: string[];
  autoKong: string[];
}

export function tileKey(tile: Tile): string {
  if (tile.kind === 'suit') return `suit-${tile.suit}-${tile.value}`;
  if (tile.kind === 'wind') return `wind-${tile.wind}`;
  if (tile.kind === 'dragon') return `dragon-${tile.dragon}`;
  return tile.kind;
}

export function useAutoClaimSettings() {
  const [config, setConfig] = useState<AutoClaimConfig>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"autoPong":[],"autoKong":[]}'); }
    catch { return { autoPong: [], autoKong: [] }; }
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); }, [config]);

  function toggleAutoPong(tile: Tile) {
    const key = tileKey(tile);
    setConfig(c => ({ ...c, autoPong: c.autoPong.includes(key) ? c.autoPong.filter(k => k !== key) : [...c.autoPong, key] }));
  }

  function toggleAutoKong(tile: Tile) {
    const key = tileKey(tile);
    setConfig(c => ({ ...c, autoKong: c.autoKong.includes(key) ? c.autoKong.filter(k => k !== key) : [...c.autoKong, key] }));
  }

  function shouldAutoPong(tile: Tile): boolean { return config.autoPong.includes(tileKey(tile)); }
  function shouldAutoKong(tile: Tile): boolean { return config.autoKong.includes(tileKey(tile)); }

  return { config, toggleAutoPong, toggleAutoKong, shouldAutoPong, shouldAutoKong, tileKey };
}
