import { describe, it, expect } from 'vitest';
import { calculatePayments } from '../paymentCalculator';
import { buildDefaultHouseRules } from '@mahjong/shared';

const rules = buildDefaultHouseRules('sg');
const playerIds = ['p0', 'p1', 'p2', 'p3'];

describe('calculatePayments', () => {
  it('ron: only discarding player pays', () => {
    const result = calculatePayments({
      winnerId: 'p0', discarderId: 'p2', winType: 'ron',
      tai: 3, rules, playerIds, dealerId: 'p0',
      hasYao: false, yaoBonusPayers: [],
    });
    expect(result.deltas['p2']).toBeLessThan(0);
    expect(result.deltas['p1']).toBe(0);
    expect(result.deltas['p3']).toBe(0);
    expect(result.deltas['p0']).toBeGreaterThan(0);
  });

  it('zimo: all 3 opponents pay equally', () => {
    const result = calculatePayments({
      winnerId: 'p0', discarderId: null, winType: 'zimo',
      tai: 3, rules, playerIds, dealerId: 'p1',
      hasYao: false, yaoBonusPayers: [],
    });
    expect(result.deltas['p1']).toBeLessThan(0);
    expect(result.deltas['p2']).toBeLessThan(0);
    expect(result.deltas['p3']).toBeLessThan(0);
    expect(result.deltas['p0']).toBeGreaterThan(0);
    expect(result.deltas['p1']).toBe(result.deltas['p2']);
    expect(result.deltas['p2']).toBe(result.deltas['p3']);
  });

  it('yao bonus: losers pay extra unit when yaoPayout=unit', () => {
    const unitRules = { ...rules, yaoPayout: 'unit' as const };
    const withYao = calculatePayments({
      winnerId: 'p0', discarderId: null, winType: 'zimo',
      tai: 3, rules: unitRules, playerIds, dealerId: 'p1',
      hasYao: true, yaoBonusPayers: ['p1', 'p2', 'p3'],
    });
    const withoutYao = calculatePayments({
      winnerId: 'p0', discarderId: null, winType: 'zimo',
      tai: 3, rules: unitRules, playerIds, dealerId: 'p1',
      hasYao: false, yaoBonusPayers: [],
    });
    expect(withYao.deltas['p1']).toBeLessThan(withoutYao.deltas['p1']);
  });

  it('doubling formula: 3 tai = 2^3 * unitValue = 0.8', () => {
    const result = calculatePayments({
      winnerId: 'p0', discarderId: 'p1', winType: 'ron',
      tai: 3, rules, playerIds, dealerId: 'p2',
      hasYao: false, yaoBonusPayers: [],
    });
    expect(result.deltas['p0']).toBeCloseTo(0.8);
    expect(result.deltas['p1']).toBeCloseTo(-0.8);
  });
});
