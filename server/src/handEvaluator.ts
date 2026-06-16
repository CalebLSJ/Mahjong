// server/src/handEvaluator.ts
import { Tile, Meld } from '@mahjong/shared';
import { tilesEqual, isSuitTile, sortTiles } from './tileEngine';

export interface EvalOptions {
  allow7Pairs: boolean;
  allow13Orphans: boolean;
}

export interface WinDecomposition {
  pair: [Tile, Tile];
  concealedMelds: Meld[];
  revealedMelds: Meld[];
}

export function canWin(concealed: Tile[], revealed: Meld[], opts: EvalOptions): boolean {
  return findDecompositions(concealed, revealed, opts).length > 0;
}

export function findDecompositions(
  concealed: Tile[],
  revealed: Meld[],
  opts: EvalOptions = { allow7Pairs: true, allow13Orphans: true },
): WinDecomposition[] {
  const results: WinDecomposition[] = [];

  // 13 orphans check
  if (opts.allow13Orphans && is13Orphans(concealed)) {
    // Find the duplicate tile (the one that appears twice)
    const keys = concealed.map(tileKey);
    const keyCount = new Map<string, number>();
    keys.forEach(k => keyCount.set(k, (keyCount.get(k) ?? 0) + 1));
    const dupKey = [...keyCount.entries()].find(([, count]) => count === 2)?.[0];
    const dupTiles = concealed.filter(t => tileKey(t) === dupKey);
    const pair: [Tile, Tile] = dupTiles.length >= 2 ? [dupTiles[0], dupTiles[1]] : [concealed[0], concealed[1]];
    results.push({ pair, concealedMelds: [], revealedMelds: revealed });
  }

  // 7 pairs check (only valid with no revealed melds)
  if (opts.allow7Pairs && revealed.length === 0 && is7Pairs(concealed)) {
    results.push({ pair: [concealed[0], concealed[1]], concealedMelds: [], revealedMelds: [] });
  }

  // Standard decomposition: derive needed concealed melds from tile count.
  // Skip standard decomp if the hand qualifies as 7 pairs — 7 pairs is an
  // exclusive hand type: the hand is only valid if allow7Pairs is true.
  const handIs7Pairs = opts.allow7Pairs && revealed.length === 0 && is7Pairs(concealed);
  if (!handIs7Pairs) {
    const meldSlotsNeeded = (concealed.length - 2) / 3;
    const sorted = sortTiles(concealed);
    const standard = findStandardDecompositions(sorted, meldSlotsNeeded);
    for (const d of standard) {
      results.push({ pair: d.pair, concealedMelds: d.melds, revealedMelds: revealed });
    }
  }

  return results;
}

interface StdDecomp { pair: [Tile, Tile]; melds: Meld[] }

function findStandardDecompositions(sorted: Tile[], meldCount: number): StdDecomp[] {
  const results: StdDecomp[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < sorted.length - 1; i++) {
    if (!tilesEqual(sorted[i], sorted[i + 1])) continue;
    const pairKey = sorted[i].id + sorted[i + 1].id;
    if (seen.has(pairKey)) continue;
    seen.add(pairKey);

    const pair: [Tile, Tile] = [sorted[i], sorted[i + 1]];
    const remaining = [...sorted.slice(0, i), ...sorted.slice(i + 2)];
    const melds = formMelds(remaining, meldCount);
    if (melds) results.push({ pair, melds });

    // Skip duplicate pair tiles to avoid redundant decompositions
    while (i + 1 < sorted.length - 1 && tilesEqual(sorted[i], sorted[i + 1])) i++;
  }
  return results;
}

function formMelds(tiles: Tile[], needed: number): Meld[] | null {
  if (tiles.length === 0 && needed === 0) return [];
  if (tiles.length !== needed * 3) return null;

  const sorted = sortTiles(tiles);
  const first = sorted[0];
  const rest = sorted.slice(1);

  // Try pong (3 of same)
  const p1 = rest.findIndex(t => tilesEqual(t, first));
  if (p1 !== -1) {
    const p2 = rest.slice(p1 + 1).findIndex(t => tilesEqual(t, first));
    if (p2 !== -1) {
      const absP2 = p1 + 1 + p2;
      const remaining = rest.filter((_, i) => i !== p1 && i !== absP2);
      const sub = formMelds(remaining, needed - 1);
      if (sub) return [{ type: 'pong', tiles: [first, rest[p1], rest[absP2]] }, ...sub];
    }
  }

  // Try chow (3 consecutive in same suit)
  if (isSuitTile(first) && first.value <= 7) {
    const v2 = first.value + 1;
    const v3 = first.value + 2;
    const i2 = rest.findIndex(t => t.kind === 'suit' && t.suit === first.suit && t.value === v2);
    if (i2 !== -1) {
      const i3 = rest.slice(i2 + 1).findIndex(t => t.kind === 'suit' && t.suit === first.suit && t.value === v3);
      if (i3 !== -1) {
        const absI3 = i2 + 1 + i3;
        const remaining = rest.filter((_, i) => i !== i2 && i !== absI3);
        const sub = formMelds(remaining, needed - 1);
        if (sub) return [{ type: 'chow', tiles: [first, rest[i2], rest[absI3]] }, ...sub];
      }
    }
  }

  return null;
}

const ORPHANS_REQUIRED = ['bamboo-1', 'bamboo-9', 'circles-1', 'circles-9', 'characters-1', 'characters-9',
  'wind-east', 'wind-south', 'wind-west', 'wind-north', 'dragon-red', 'dragon-green', 'dragon-white'];

function tileKey(t: Tile): string {
  if (t.kind === 'suit') return `${t.suit}-${t.value}`;
  if (t.kind === 'wind') return `wind-${t.wind}`;
  if (t.kind === 'dragon') return `dragon-${t.dragon}`;
  return t.kind;
}

function is7Pairs(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  const sorted = sortTiles(tiles);
  const pairKeys = new Set<string>();
  for (let i = 0; i < 14; i += 2) {
    if (!tilesEqual(sorted[i], sorted[i + 1])) return false;
    pairKeys.add(tileKey(sorted[i]));
  }
  // All 7 pairs must be of distinct tile types
  return pairKeys.size === 7;
}

function is13Orphans(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  const keys = tiles.map(tileKey);
  const hasPair = new Set(keys).size === 13;
  const hasAll = ORPHANS_REQUIRED.every(k => keys.includes(k));
  return hasAll && hasPair;
}
