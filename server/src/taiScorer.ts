// server/src/taiScorer.ts
import { Tile, Meld, HouseRules, TaiComponent, WindDir } from '@mahjong/shared';
import { WinDecomposition } from './handEvaluator';
import { tilesEqual, isHonorTile, isTerminalOrHonor, sortKey } from './tileEngine';

export interface ScoringContext {
  rules: HouseRules;
  isSelfDraw: boolean;
  isDealer: boolean;
  seatWind: WindDir;
  prevailingWind: WindDir;
  bonusTiles: Tile[];
  isTianHu: boolean;
  isDiHu: boolean;
  hasYao: boolean;
}

export interface TaiResult {
  components: TaiComponent[];
  total: number;
}

export function scoreTai(decomp: WinDecomposition, ctx: ScoringContext): TaiResult {
  const { rules } = ctx;
  const allMelds = [...decomp.concealedMelds, ...decomp.revealedMelds];
  const components: TaiComponent[] = [];

  function add(key: string, label: string) {
    const tai = rules.taiTable[key] ?? 0;
    if (tai > 0) components.push({ key, label, tai });
  }

  if (ctx.isTianHu) { add('tian-hu', 'Tian Hu (天胡)'); return finalise(components, rules); }
  if (ctx.isDiHu) { add('di-hu', 'Di Hu (地胡)'); return finalise(components, rules); }

  const all14 = [...decomp.pair, ...decomp.concealedMelds.flatMap(m => m.tiles)];

  // 7 pairs
  if (decomp.revealedMelds.length === 0 && decomp.concealedMelds.length === 0 && all14.length === 14 && is7PairsHand(all14)) {
    add('7-pairs', '7 Pairs (七对)');
  } else if (decomp.revealedMelds.length === 0 && decomp.concealedMelds.length > 0 && is7PairsHand(all14)) {
    add('7-pairs', '7 Pairs (七对)');
  } else {
    // Pong pong
    if (allMelds.length > 0 && allMelds.every(m => m.type === 'pong' || m.type === 'kong' || m.type === 'concealed-kong')) {
      add('pong-pong', 'Pong Pong (碰碰)');
    }

    // Ping hu
    const allChow = allMelds.length > 0 && allMelds.every(m => m.type === 'chow') && decomp.revealedMelds.length === 0;
    const pairNotValue = !isValuePair(decomp.pair, ctx.seatWind, ctx.prevailingWind);
    if (allChow && !ctx.isSelfDraw && pairNotValue) add('ping-hu', 'Ping Hu (平胡)');

    // Men qing (fully concealed ron)
    if (decomp.revealedMelds.length === 0 && !ctx.isSelfDraw) add('men-qing', 'Men Qing (门清)');
  }

  const allTiles = [...decomp.pair, ...allMelds.flatMap(m => m.tiles)];

  // Duan yao (all simples)
  if (allTiles.every(t => t.kind === 'suit' && t.value >= 2 && t.value <= 8)) {
    add('duan-yao', 'Duan Yao (断幺)');
  }

  // Dragon patterns
  const dragonPongs = allMelds.filter(m => (m.type === 'pong' || m.type === 'kong') && m.tiles[0].kind === 'dragon');
  if (dragonPongs.length === 3) {
    if (!rules.daSanYuanStrictPair || !isHonorTile(decomp.pair[0])) {
      add('da-san-yuan', 'Da San Yuan (大三元)');
    }
  } else if (dragonPongs.length === 2 && decomp.pair[0].kind === 'dragon') {
    add('xiao-san-yuan', 'Xiao San Yuan (小三元)');
  } else {
    dragonPongs.forEach(() => add('dragon-pong', 'Dragon Pong'));
  }

  // Wind patterns
  const windPongs = allMelds.filter(m => (m.type === 'pong' || m.type === 'kong') && m.tiles[0].kind === 'wind');
  if (windPongs.length === 4) {
    if (!rules.daSiXiStrictPair || !isHonorTile(decomp.pair[0])) {
      add('da-si-xi', 'Da Si Xi (大四喜)');
    }
  } else if (windPongs.length === 3 && decomp.pair[0].kind === 'wind') {
    add('xiao-si-xi', 'Xiao Si Xi (小四喜)');
  } else {
    windPongs.forEach(m => {
      const windTile = m.tiles[0];
      if (windTile.kind === 'wind') {
        if (windTile.wind === ctx.seatWind) add('seat-wind-pong', 'Seat Wind Pong');
        if (windTile.wind === ctx.prevailingWind) add('prevailing-wind-pong', 'Prevailing Wind Pong');
      }
    });
  }

  // Qing yao jiu (all terminals + honors)
  if (allTiles.every(t => isTerminalOrHonor(t))) add('qing-yao-jiu', 'Qing Yao Jiu (清幺九)');

  // Flush detection
  const suitTiles = allTiles.filter(t => t.kind === 'suit');
  const suits = new Set(suitTiles.map(t => (t as Extract<Tile, { kind: 'suit' }>).suit));
  const hasHonors = allTiles.some(t => isHonorTile(t));
  if (allTiles.every(t => isHonorTile(t))) {
    add('zi-yi-se', 'Zi Yi Se (字一色)');
  } else if (suits.size === 1 && !hasHonors) {
    add('yi-se', 'Yi Se (一色)');
  } else if (suits.size === 1 && hasHonors) {
    add('hunyi-se', 'Hun Yi Se (混一色)');
  }

  // Lv yi se
  if (rules.lvYiSeRecognized && isLvYiSe(allTiles)) add('lv-yi-se', 'Lv Yi Se (绿一色)');

  // Jiu lian
  if (isJiuLian([...decomp.pair, ...decomp.concealedMelds.flatMap(m => m.tiles)], decomp.revealedMelds)) {
    add('jiu-lian', 'Jiu Lian Bao Deng (九莲宝灯)');
  }

  // Zimo
  if (ctx.isSelfDraw && rules.zimoBonus) add('zimo', 'Zi Mo (自摸)');

  // Dealer bonus
  if (ctx.isDealer && rules.dealerBonus) add('dealer-bonus', 'Dealer Bonus');

  // Flower/season bonuses
  if (rules.allowFlowers) {
    const seatNum = windToSeatNumber(ctx.seatWind);
    ctx.bonusTiles
      .filter(t =>
        (t.kind === 'flower' && t.seatNumber === seatNum) ||
        (t.kind === 'season' && t.seatNumber === seatNum)
      )
      .forEach(() => add('flower-match', 'Matching Flower/Season'));
    if (ctx.bonusTiles.filter(t => t.kind === 'flower').length === 4) add('flower-full-set', 'Full Flower Set');
    if (ctx.bonusTiles.filter(t => t.kind === 'season').length === 4) add('flower-full-set', 'Full Season Set');
  }

  // Animal yao bonus (Rat+Cat or Chicken+Worm pair)
  if (ctx.hasYao && rules.allowAnimals && rules.yaoPayout === 'tai') {
    add('animal-yao', 'Animal Yao Bonus');
  }

  return finalise(components, rules);
}

function finalise(components: TaiComponent[], rules: HouseRules): TaiResult {
  const sum = components.reduce((s, c) => s + c.tai, 0);
  const total = rules.maxTai !== null ? Math.min(sum, rules.maxTai) : sum;
  return { components, total };
}

function isValuePair(pair: [Tile, Tile], seatWind: WindDir, prevWind: WindDir): boolean {
  const t = pair[0];
  if (t.kind === 'dragon') return true;
  if (t.kind === 'wind' && (t.wind === seatWind || t.wind === prevWind)) return true;
  return false;
}

function tileKey(t: Tile): string {
  if (t.kind === 'suit') return `${t.suit}-${(t as Extract<Tile, { kind: 'suit' }>).value}`;
  if (t.kind === 'dragon') return `dragon-${(t as Extract<Tile, { kind: 'dragon' }>).dragon}`;
  return t.kind;
}

function is7PairsHand(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  const sorted = [...tiles].sort((a, b) => sortKey(a) - sortKey(b));
  for (let i = 0; i < 14; i += 2) {
    if (!tilesEqual(sorted[i], sorted[i + 1])) return false;
  }
  return true;
}

const GREEN_TILE_KEYS = new Set(['bamboo-2', 'bamboo-3', 'bamboo-4', 'bamboo-6', 'bamboo-8', 'dragon-green']);
function isLvYiSe(tiles: Tile[]): boolean {
  return tiles.every(t => GREEN_TILE_KEYS.has(tileKey(t)));
}

function isJiuLian(concealed: Tile[], revealed: Meld[]): boolean {
  if (revealed.length > 0 || concealed.length !== 14) return false;
  const suitTiles = concealed.filter(t => t.kind === 'suit');
  if (suitTiles.length !== 14) return false;
  const suits = new Set(suitTiles.map(t => (t as Extract<Tile, { kind: 'suit' }>).suit));
  if (suits.size !== 1) return false;
  const counts = new Array(10).fill(0);
  suitTiles.forEach(t => counts[(t as Extract<Tile, { kind: 'suit' }>).value]++);
  const base = [3, 1, 1, 1, 1, 1, 1, 1, 3];
  for (let v = 1; v <= 9; v++) {
    if (counts[v] < base[v - 1]) return false;
  }
  return true;
}

function windToSeatNumber(wind: WindDir): 1 | 2 | 3 | 4 {
  const map: Record<WindDir, 1 | 2 | 3 | 4> = { east: 1, south: 2, west: 3, north: 4 };
  return map[wind];
}
