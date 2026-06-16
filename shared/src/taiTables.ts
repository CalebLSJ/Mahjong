import { HouseRules } from './types';

export const SG_DEFAULT_TAI: Record<string, number> = {
  'ping-hu': 1,
  'duan-yao': 1,
  'men-qing': 1,
  'flower-match': 1,
  'flower-full-set': 3,
  'animal-yao': 1,
  'seat-wind-pong': 1,
  'prevailing-wind-pong': 1,
  'dragon-pong': 1,
  'zimo': 1,
  'dealer-bonus': 1,
  'hunyi-se': 3,
  'pong-pong': 3,
  '7-pairs': 3,
  'qing-yao-jiu': 5,
  'xiao-san-yuan': 5,
  'yi-se': 5,
  'lv-yi-se': 8,
  'xiao-si-xi': 8,
  'zi-yi-se': 8,
  'da-san-yuan': 8,
  'di-hu': 8,
  '13-orphans': 16,
  'da-si-xi': 16,
  'jiu-lian': 16,
  'tian-hu': 16,
};

export const HK_DEFAULT_TAI: Record<string, number> = {
  ...SG_DEFAULT_TAI,
  'ping-hu': 1,
  'pong-pong': 3,
  '7-pairs': 3,
  'yi-se': 7,
  'da-san-yuan': 8,
  'da-si-xi': 13,
  '13-orphans': 13,
};

export function getDefaultTaiTable(variant: 'sg' | 'hk'): Record<string, number> {
  return variant === 'sg' ? { ...SG_DEFAULT_TAI } : { ...HK_DEFAULT_TAI };
}

export function buildDefaultHouseRules(variant: 'sg' | 'hk'): HouseRules {
  return {
    variant,
    minTai: 3,
    maxTai: null,
    allow7Pairs: true,
    allow13Orphans: true,
    allowFlowers: variant === 'sg',
    allowAnimals: variant === 'sg',
    yaoPayout: 'unit',
    feiEnabled: false,
    allowChow: true,
    lvYiSeRecognized: true,
    daSiXiStrictPair: false,
    daSanYuanStrictPair: false,
    dealerBonus: true,
    zimoBonus: true,
    unitValue: 0.1,
    taiTable: getDefaultTaiTable(variant),
  };
}
