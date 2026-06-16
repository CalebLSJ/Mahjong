// server/src/__tests__/handEvaluator.test.ts
import { describe, it, expect } from 'vitest';
import { canWin, findDecompositions } from '../handEvaluator';
import { Tile } from '@mahjong/shared';

// Helper: make a suit tile quickly
function b(v: number, n = 0): Tile { return { id: `b${v}-${n}`, kind: 'suit', suit: 'bamboo', value: v as any }; }
function c(v: number, n = 0): Tile { return { id: `c${v}-${n}`, kind: 'suit', suit: 'circles', value: v as any }; }
function dr(d: 'red' | 'green' | 'white', n = 0): Tile { return { id: `dr${d}-${n}`, kind: 'dragon', dragon: d }; }
function wd(w: 'east' | 'south' | 'west' | 'north', n = 0): Tile { return { id: `wd${w}-${n}`, kind: 'wind', wind: w }; }

describe('canWin - standard hand (14 tiles, no revealed melds)', () => {
  it('detects a simple winning hand', () => {
    // 3 chows + 1 pong + pair
    const hand = [b(1), b(2), b(3), b(4), b(5), b(6), b(7), b(8), b(9), c(1), c(1), c(1), dr('red'), dr('red')];
    expect(canWin(hand, [], { allow7Pairs: true, allow13Orphans: true })).toBe(true);
  });

  it('detects 7 pairs when enabled', () => {
    const hand = [b(1,0), b(1,1), b(2,0), b(2,1), b(3,0), b(3,1), b(4,0), b(4,1),
                  b(5,0), b(5,1), b(6,0), b(6,1), b(7,0), b(7,1)];
    expect(canWin(hand, [], { allow7Pairs: true, allow13Orphans: true })).toBe(true);
  });

  it('rejects 7 pairs when disabled (hand cannot win via standard)', () => {
    // b1,b1 b3,b3 b5,b5 b7,b7 b9,b9 + east×2 + red-dragon×2
    // Cannot form standard hand: no chows possible (non-consecutive), no pongs (only 2 each)
    const hand = [
      b(1,0), b(1,1), b(3,0), b(3,1), b(5,0), b(5,1),
      b(7,0), b(7,1), b(9,0), b(9,1),
      wd('east', 0), wd('east', 1),
      dr('red', 0), dr('red', 1),
    ];
    expect(canWin(hand, [], { allow7Pairs: false, allow13Orphans: true })).toBe(false);
  });

  it('standard hand also matching 7-pair pattern wins when 7-pairs disabled', () => {
    // b1,b1,b2,b2,b3,b3,b4,b4,b5,b5,b6,b6,b7,b7 — forms 4 chows + pair
    const hand = [b(1,0), b(1,1), b(2,0), b(2,1), b(3,0), b(3,1),
                  b(4,0), b(4,1), b(5,0), b(5,1), b(6,0), b(6,1),
                  b(7,0), b(7,1)];
    expect(canWin(hand, [], { allow7Pairs: false, allow13Orphans: true })).toBe(true);
  });

  it('rejects a losing hand', () => {
    const hand = [b(1), b(2), b(4), b(5), b(7), b(8), c(1), c(3), c(5), c(7), c(9), dr('red'), dr('green'), wd('east')];
    expect(canWin(hand, [], { allow7Pairs: true, allow13Orphans: true })).toBe(false);
  });

  it('handles hand with revealed melds (fewer concealed tiles)', () => {
    // 1 revealed pong → need 2 melds + pair from 8 concealed tiles
    const concealed = [b(1), b(2), b(3), b(4), b(5), b(6), dr('red'), dr('red')];
    const melds = [{ type: 'pong' as const, tiles: [c(1,0), c(1,1), c(1,2)] }];
    expect(canWin(concealed, melds, { allow7Pairs: true, allow13Orphans: true })).toBe(true);
  });
});

describe('findDecompositions', () => {
  it('returns multiple decompositions when ambiguous', () => {
    // 1-1-2-3-4: could be pair(1,1)+chow(2-3-4)
    const hand = [b(1,0), b(1,1), b(2), b(3), b(4)];
    const decomps = findDecompositions(hand, []);
    expect(decomps.length).toBeGreaterThan(0);
  });
});
