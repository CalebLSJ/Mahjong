import { Tile, Suit, WindDir, DragonColor, FlowerName, SeasonName, AnimalName } from '@mahjong/shared';

const SUITS: Suit[] = ['bamboo', 'circles', 'characters'];
const WINDS: WindDir[] = ['east', 'south', 'west', 'north'];
const DRAGONS: DragonColor[] = ['red', 'green', 'white'];

const FLOWERS: Array<{ flower: FlowerName; seatNumber: 1 | 2 | 3 | 4 }> = [
  { flower: 'plum', seatNumber: 1 },
  { flower: 'orchid', seatNumber: 2 },
  { flower: 'chrysanthemum', seatNumber: 3 },
  { flower: 'bamboo-flower', seatNumber: 4 },
];
const SEASONS: Array<{ season: SeasonName; seatNumber: 1 | 2 | 3 | 4 }> = [
  { season: 'spring', seatNumber: 1 },
  { season: 'summer', seatNumber: 2 },
  { season: 'autumn', seatNumber: 3 },
  { season: 'winter', seatNumber: 4 },
];
const ANIMALS: AnimalName[] = ['rat', 'chicken', 'worm', 'cat'];

let _idCounter = 0;
function mkId(prefix: string): string {
  return `${prefix}-${++_idCounter}`;
}

export interface DeckOptions {
  flowers: boolean;
  animals: boolean;
  fei: boolean;
}

export function buildDeck(opts: DeckOptions): Tile[] {
  _idCounter = 0;
  const tiles: Tile[] = [];

  // 4 copies of each suit tile (1–9 × 3 suits = 108)
  for (const suit of SUITS) {
    for (let v = 1; v <= 9; v++) {
      for (let c = 0; c < 4; c++) {
        tiles.push({ id: mkId(`${suit[0]}${v}`), kind: 'suit', suit, value: v as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 });
      }
    }
  }

  // 4 copies of each wind (16)
  for (const wind of WINDS) {
    for (let c = 0; c < 4; c++) {
      tiles.push({ id: mkId(`w${wind[0]}`), kind: 'wind', wind });
    }
  }

  // 4 copies of each dragon (12)
  for (const dragon of DRAGONS) {
    for (let c = 0; c < 4; c++) {
      tiles.push({ id: mkId(`d${dragon[0]}`), kind: 'dragon', dragon });
    }
  }

  if (opts.flowers) {
    for (const f of FLOWERS) {
      tiles.push({ id: mkId('fl'), kind: 'flower', flower: f.flower, seatNumber: f.seatNumber });
    }
    for (const s of SEASONS) {
      tiles.push({ id: mkId('se'), kind: 'season', season: s.season, seatNumber: s.seatNumber });
    }
  }

  if (opts.animals) {
    for (const animal of ANIMALS) {
      tiles.push({ id: mkId('an'), kind: 'animal', animal });
    }
  }

  if (opts.fei) {
    tiles.push({ id: mkId('fei'), kind: 'fei' });
    tiles.push({ id: mkId('fei'), kind: 'fei' });
  }

  return tiles;
}

export function shuffleDeck(tiles: Tile[]): Tile[] {
  const arr = [...tiles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isBonus(tile: Tile): boolean {
  return tile.kind === 'flower' || tile.kind === 'season' || tile.kind === 'animal';
}

export function isSuitTile(tile: Tile): tile is Extract<Tile, { kind: 'suit' }> {
  return tile.kind === 'suit';
}

export function isHonorTile(tile: Tile): boolean {
  return tile.kind === 'wind' || tile.kind === 'dragon';
}

export function isTerminalOrHonor(tile: Tile): boolean {
  if (isHonorTile(tile)) return true;
  if (tile.kind === 'suit') return tile.value === 1 || tile.value === 9;
  return false;
}

/** True if two tiles represent the same type (ignoring id). */
export function tilesEqual(a: Tile, b: Tile): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'suit': {
      const bb = b as Extract<Tile, { kind: 'suit' }>;
      return a.suit === bb.suit && a.value === bb.value;
    }
    case 'wind': return a.wind === (b as Extract<Tile, { kind: 'wind' }>).wind;
    case 'dragon': return a.dragon === (b as Extract<Tile, { kind: 'dragon' }>).dragon;
    case 'flower': return a.flower === (b as Extract<Tile, { kind: 'flower' }>).flower;
    case 'season': return a.season === (b as Extract<Tile, { kind: 'season' }>).season;
    case 'animal': return a.animal === (b as Extract<Tile, { kind: 'animal' }>).animal;
    case 'fei': return true;
  }
}

const SUIT_ORDER: Record<Suit, number> = { bamboo: 0, circles: 1, characters: 2 };
const WIND_ORDER: Record<WindDir, number> = { east: 0, south: 1, west: 2, north: 3 };
const DRAGON_ORDER: Record<DragonColor, number> = { red: 0, green: 1, white: 2 };
const KIND_ORDER: Record<string, number> = { suit: 0, wind: 1, dragon: 2, flower: 3, season: 4, animal: 5, fei: 6 };

export function sortKey(tile: Tile): number {
  const base = KIND_ORDER[tile.kind] * 10000;
  if (tile.kind === 'suit') return base + SUIT_ORDER[tile.suit] * 100 + tile.value;
  if (tile.kind === 'wind') return base + WIND_ORDER[tile.wind];
  if (tile.kind === 'dragon') return base + DRAGON_ORDER[tile.dragon];
  return base;
}

export function sortTiles(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => sortKey(a) - sortKey(b));
}
