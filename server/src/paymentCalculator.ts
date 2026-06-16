import { HouseRules } from '@mahjong/shared';

export interface PaymentInput {
  winnerId: string;
  discarderId: string | null;
  winType: 'ron' | 'zimo';
  tai: number;
  rules: HouseRules;
  playerIds: string[];
  dealerId: string;
  hasYao: boolean;
  yaoBonusPayers: string[];
}

export interface PaymentResult {
  deltas: Record<string, number>;
}

export function calculatePayments(input: PaymentInput): PaymentResult {
  const { winnerId, discarderId, winType, tai, rules, playerIds, hasYao, yaoBonusPayers } = input;
  const deltas: Record<string, number> = {};
  playerIds.forEach(id => (deltas[id] = 0));

  const baseAmount = Math.pow(2, tai) * rules.unitValue;

  if (winType === 'ron') {
    if (!discarderId) throw new Error('Ron requires discarderId');
    deltas[discarderId] -= baseAmount;
    deltas[winnerId] += baseAmount;
  } else {
    const losers = playerIds.filter(id => id !== winnerId);
    losers.forEach(id => {
      deltas[id] -= baseAmount;
      deltas[winnerId] += baseAmount;
    });
  }

  if (hasYao && rules.yaoPayout === 'unit') {
    yaoBonusPayers.forEach(id => {
      if (id !== winnerId) {
        deltas[id] -= rules.unitValue;
        deltas[winnerId] += rules.unitValue;
      }
    });
  }

  return { deltas };
}
