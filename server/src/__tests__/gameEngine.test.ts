// server/src/__tests__/gameEngine.test.ts
import { describe, it, expect } from 'vitest';
import { GameEngine } from '../gameEngine';
import { buildDefaultHouseRules } from '@mahjong/shared';

function makeEngine() {
  const rules = buildDefaultHouseRules('sg');
  const players = [
    { id: 'p0', name: 'South', seat: 0 as const, isBot: false },
    { id: 'p1', name: 'East', seat: 1 as const, isBot: false },
    { id: 'p2', name: 'North', seat: 2 as const, isBot: false },
    { id: 'p3', name: 'West', seat: 3 as const, isBot: false },
  ];
  return new GameEngine(rules, players, 0);
}

describe('GameEngine', () => {
  it('starts in awaiting-discard phase after startRound', () => {
    const engine = makeEngine();
    engine.startRound();
    expect(engine.getState().phase).toBe('awaiting-discard');
  });

  it('dealer has 14 tiles after deal', () => {
    const engine = makeEngine();
    engine.startRound();
    const state = engine.getState();
    const dealer = state.players[state.dealerSeat];
    expect(dealer.hand.length).toBe(14);
  });

  it('non-dealers have 13 tiles after deal', () => {
    const engine = makeEngine();
    engine.startRound();
    const state = engine.getState();
    for (let i = 0; i < 4; i++) {
      if (i !== state.dealerSeat) {
        expect(state.players[i].hand.length).toBe(13);
      }
    }
  });

  it('after dealer discards, phase becomes claim-window', () => {
    const engine = makeEngine();
    engine.startRound();
    const dealer = engine.getState().players[engine.getState().dealerSeat];
    engine.playerDiscard(dealer.id, dealer.hand[0].id);
    expect(engine.getState().phase).toBe('claim-window');
  });

  it('after claim window resolves with no claims, next player seat is counter-clockwise and phase awaiting-discard', () => {
    const engine = makeEngine();
    engine.startRound();
    const state = engine.getState();
    const dealer = state.players[state.dealerSeat];
    engine.playerDiscard(dealer.id, dealer.hand[0].id);
    engine.resolveClaimWindow();
    expect(engine.getState().currentSeat).toBe((state.dealerSeat + 3) % 4);
    expect(engine.getState().phase).toBe('awaiting-discard');
  });
});
