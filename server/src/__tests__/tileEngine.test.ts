import { describe, it, expect } from 'vitest';
import { buildDeck, shuffleDeck, isBonus, isSuitTile, tilesEqual, sortTiles } from '../tileEngine';
import { Tile } from '@mahjong/shared';

describe('buildDeck', () => {
  it('produces 136 tiles for base deck (no flowers/animals/fei)', () => {
    const deck = buildDeck({ flowers: false, animals: false, fei: false });
    expect(deck).toHaveLength(136);
  });

  it('produces 144 tiles with flowers+seasons', () => {
    const deck = buildDeck({ flowers: true, animals: false, fei: false });
    expect(deck).toHaveLength(144);
  });

  it('produces 148 tiles with flowers+seasons+animals', () => {
    const deck = buildDeck({ flowers: true, animals: true, fei: false });
    expect(deck).toHaveLength(148);
  });

  it('produces 150 tiles with everything enabled', () => {
    const deck = buildDeck({ flowers: true, animals: true, fei: true });
    expect(deck).toHaveLength(150);
  });

  it('all tile ids are unique', () => {
    const deck = buildDeck({ flowers: true, animals: true, fei: true });
    const ids = deck.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has exactly 4 copies of each suit value', () => {
    const deck = buildDeck({ flowers: false, animals: false, fei: false });
    const bamboo1s = deck.filter(t => t.kind === 'suit' && (t as any).suit === 'bamboo' && (t as any).value === 1);
    expect(bamboo1s).toHaveLength(4);
  });
});

describe('isBonus', () => {
  it('returns true for flower tiles', () => {
    const tile: Tile = { id: 'f1', kind: 'flower', flower: 'plum', seatNumber: 1 };
    expect(isBonus(tile)).toBe(true);
  });
  it('returns true for season tiles', () => {
    const tile: Tile = { id: 's1', kind: 'season', season: 'spring', seatNumber: 1 };
    expect(isBonus(tile)).toBe(true);
  });
  it('returns true for animal tiles', () => {
    const tile: Tile = { id: 'a1', kind: 'animal', animal: 'rat' };
    expect(isBonus(tile)).toBe(true);
  });
  it('returns false for suit tiles', () => {
    const tile: Tile = { id: 'b1', kind: 'suit', suit: 'bamboo', value: 1 };
    expect(isBonus(tile)).toBe(false);
  });
  it('returns false for wind tiles', () => {
    const tile: Tile = { id: 'w1', kind: 'wind', wind: 'east' };
    expect(isBonus(tile)).toBe(false);
  });
});

describe('tilesEqual', () => {
  it('returns true for two identical suit tiles', () => {
    const a: Tile = { id: 'a', kind: 'suit', suit: 'bamboo', value: 5 };
    const b: Tile = { id: 'b', kind: 'suit', suit: 'bamboo', value: 5 };
    expect(tilesEqual(a, b)).toBe(true);
  });
  it('returns false for different values', () => {
    const a: Tile = { id: 'a', kind: 'suit', suit: 'bamboo', value: 5 };
    const b: Tile = { id: 'b', kind: 'suit', suit: 'bamboo', value: 6 };
    expect(tilesEqual(a, b)).toBe(false);
  });
  it('returns true for same wind', () => {
    const a: Tile = { id: 'a', kind: 'wind', wind: 'east' };
    const b: Tile = { id: 'b', kind: 'wind', wind: 'east' };
    expect(tilesEqual(a, b)).toBe(true);
  });
});

describe('sortTiles', () => {
  it('sorts bamboo before circles before characters', () => {
    const tiles: Tile[] = [
      { id: 'c1', kind: 'suit', suit: 'circles', value: 1 },
      { id: 'b1', kind: 'suit', suit: 'bamboo', value: 1 },
    ];
    const sorted = sortTiles(tiles);
    expect((sorted[0] as any).suit).toBe('bamboo');
    expect((sorted[1] as any).suit).toBe('circles');
  });

  it('sorts suit tiles before wind tiles before dragon tiles', () => {
    const tiles: Tile[] = [
      { id: 'd1', kind: 'dragon', dragon: 'red' },
      { id: 'w1', kind: 'wind', wind: 'east' },
      { id: 'b1', kind: 'suit', suit: 'bamboo', value: 1 },
    ];
    const sorted = sortTiles(tiles);
    expect(sorted[0].kind).toBe('suit');
    expect(sorted[1].kind).toBe('wind');
    expect(sorted[2].kind).toBe('dragon');
  });

  it('sorts within bamboo by value ascending', () => {
    const tiles: Tile[] = [
      { id: 'b3', kind: 'suit', suit: 'bamboo', value: 3 },
      { id: 'b1', kind: 'suit', suit: 'bamboo', value: 1 },
      { id: 'b2', kind: 'suit', suit: 'bamboo', value: 2 },
    ];
    const sorted = sortTiles(tiles);
    expect((sorted[0] as any).value).toBe(1);
    expect((sorted[1] as any).value).toBe(2);
    expect((sorted[2] as any).value).toBe(3);
  });
});

describe('shuffleDeck', () => {
  it('returns same number of tiles', () => {
    const deck = buildDeck({ flowers: false, animals: false, fei: false });
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(deck.length);
  });
  it('does not mutate the original array', () => {
    const deck = buildDeck({ flowers: false, animals: false, fei: false });
    const original = [...deck];
    shuffleDeck(deck);
    expect(deck).toEqual(original);
  });
});
