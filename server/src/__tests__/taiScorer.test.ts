// server/src/__tests__/taiScorer.test.ts
import { describe, it, expect } from 'vitest';
import { scoreTai } from '../taiScorer';
import { WinDecomposition } from '../handEvaluator';
import { buildDefaultHouseRules } from '@mahjong/shared';
import { Tile } from '@mahjong/shared';

function b(v: number, n = 0): Tile { return { id: `b${v}-${n}`, kind: 'suit', suit: 'bamboo', value: v as any }; }
function c(v: number, n = 0): Tile { return { id: `c${v}-${n}`, kind: 'suit', suit: 'circles', value: v as any }; }
function dr(d: 'red' | 'green' | 'white', n = 0): Tile { return { id: `dr${d}-${n}`, kind: 'dragon', dragon: d }; }

describe('scoreTai', () => {
  const rules = buildDefaultHouseRules('sg');

  it('scores ping-hu (1 tai)', () => {
    const decomp: WinDecomposition = {
      pair: [b(9, 0), b(9, 1)],
      concealedMelds: [
        { type: 'chow', tiles: [b(1), b(2), b(3)] },
        { type: 'chow', tiles: [b(4), b(5), b(6)] },
        { type: 'chow', tiles: [b(7), b(8), b(9,2)] },
        { type: 'chow', tiles: [c(2), c(3), c(4)] },
      ],
      revealedMelds: [],
    };
    const result = scoreTai(decomp, {
      rules, isSelfDraw: false, isDealer: false,
      seatWind: 'east', prevailingWind: 'east',
      bonusTiles: [], isTianHu: false, isDiHu: false, hasYao: false,
    });
    expect(result.components.some(c => c.key === 'ping-hu')).toBe(true);
  });

  it('scores pong-pong (3 tai)', () => {
    const decomp: WinDecomposition = {
      pair: [dr('red', 0), dr('red', 1)],
      concealedMelds: [
        { type: 'pong', tiles: [b(1,0), b(1,1), b(1,2)] },
        { type: 'pong', tiles: [b(3,0), b(3,1), b(3,2)] },
        { type: 'pong', tiles: [b(5,0), b(5,1), b(5,2)] },
        { type: 'pong', tiles: [b(7,0), b(7,1), b(7,2)] },
      ],
      revealedMelds: [],
    };
    const result = scoreTai(decomp, {
      rules, isSelfDraw: false, isDealer: false,
      seatWind: 'east', prevailingWind: 'east',
      bonusTiles: [], isTianHu: false, isDiHu: false, hasYao: false,
    });
    expect(result.components.some(c => c.key === 'pong-pong')).toBe(true);
    expect(result.components.find(c => c.key === 'pong-pong')?.tai).toBe(3);
  });

  it('respects maxTai cap', () => {
    const cappedRules = { ...rules, maxTai: 5 };
    const decomp: WinDecomposition = {
      pair: [dr('red', 0), dr('red', 1)],
      concealedMelds: [
        { type: 'pong', tiles: [dr('green', 0), dr('green', 1), dr('green', 2)] },
        { type: 'pong', tiles: [dr('white', 0), dr('white', 1), dr('white', 2)] },
        { type: 'pong', tiles: [b(1,0), b(1,1), b(1,2)] },
        { type: 'pong', tiles: [b(9,0), b(9,1), b(9,2)] },
      ],
      revealedMelds: [],
    };
    const result = scoreTai(decomp, {
      rules: cappedRules, isSelfDraw: false, isDealer: false,
      seatWind: 'east', prevailingWind: 'east',
      bonusTiles: [], isTianHu: false, isDiHu: false, hasYao: false,
    });
    expect(result.total).toBeLessThanOrEqual(5);
  });
});
