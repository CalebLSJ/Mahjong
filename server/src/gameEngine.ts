// server/src/gameEngine.ts
import { Tile, Meld, GamePhase, HouseRules, WindDir, RoundResult, ClaimType } from '@mahjong/shared';
import { buildDeck, shuffleDeck, isBonus, tilesEqual } from './tileEngine';
import { canWin, findDecompositions, EvalOptions } from './handEvaluator';
import { scoreTai, ScoringContext } from './taiScorer';
import { calculatePayments } from './paymentCalculator';

export interface PlayerSetup {
  id: string;
  name: string;
  seat: 0 | 1 | 2 | 3;
  isBot: boolean;
}

export interface PlayerInternalState {
  id: string;
  name: string;
  seat: number;
  wind: WindDir;
  hand: Tile[];
  melds: Meld[];
  bonusTiles: Tile[];
  isDealer: boolean;
  isBot: boolean;
  score: number;
}

export interface InternalGameState {
  players: PlayerInternalState[];     // indexed by seat
  wall: Tile[];
  currentSeat: number;
  phase: GamePhase;
  lastDiscard: Tile | null;
  lastDiscardSeat: number | null;
  claimWindowEndsAt: number | null;
  pendingClaims: Record<string, { action: ClaimType; chowTileIds?: [string, string] }>;
  prevailingWind: WindDir;
  roundNumber: number;
  dealerSeat: number;
  houseRules: HouseRules;
  roundResult: RoundResult | null;
  discardPiles: Tile[][];
}

// Seat index -> wind: seat 0=South, 1=East, 2=North, 3=West
const SEAT_WINDS: WindDir[] = ['south', 'east', 'north', 'west'];

export class GameEngine {
  private state: InternalGameState;

  constructor(
    rules: HouseRules,
    players: PlayerSetup[],
    dealerSeat: number,
    prevailingWind: WindDir = 'east',
    roundNumber: number = 1,
  ) {
    const playerStates: PlayerInternalState[] = [0, 1, 2, 3].map(seat => {
      const setup = players.find(p => p.seat === seat);
      if (!setup) throw new Error(`No player for seat ${seat}`);
      return {
        id: setup.id,
        name: setup.name,
        seat,
        wind: SEAT_WINDS[seat],
        hand: [],
        melds: [],
        bonusTiles: [],
        isDealer: seat === dealerSeat,
        isBot: setup.isBot,
        score: 0,
      };
    });

    this.state = {
      players: playerStates,
      wall: [],
      currentSeat: dealerSeat,
      phase: 'lobby',
      lastDiscard: null,
      lastDiscardSeat: null,
      claimWindowEndsAt: null,
      pendingClaims: {},
      prevailingWind,
      roundNumber,
      dealerSeat,
      houseRules: rules,
      roundResult: null,
      discardPiles: [[], [], [], []],
    };
  }

  getState(): InternalGameState {
    return this.state;
  }

  startRound(): void {
    const rules = this.state.houseRules;
    const deck = buildDeck({
      flowers: rules.allowFlowers,
      animals: rules.allowAnimals,
      fei: rules.feiEnabled,
    });
    const wall = shuffleDeck(deck);

    // Reset player hands
    for (const p of this.state.players) {
      p.hand = [];
      p.melds = [];
      p.bonusTiles = [];
    }

    // Deal tiles: dealer gets 14, others get 13, in seat order 0,1,2,3
    const dealerSeat = this.state.dealerSeat;
    for (let seat = 0; seat < 4; seat++) {
      const count = seat === dealerSeat ? 14 : 13;
      for (let i = 0; i < count; i++) {
        const tile = wall.shift()!;
        this.state.players[seat].hand.push(tile);
      }
    }

    this.state.wall = wall;

    // Cascade-replace bonus tiles for all players
    for (let seat = 0; seat < 4; seat++) {
      this.replaceBonusTiles(seat);
    }

    this.state.phase = 'awaiting-discard';
    this.state.currentSeat = dealerSeat;
    this.state.lastDiscard = null;
    this.state.lastDiscardSeat = null;
    this.state.claimWindowEndsAt = null;
    this.state.pendingClaims = {};
    this.state.roundResult = null;
    this.state.discardPiles = [[], [], [], []];
  }

  private replaceBonusTiles(seat: number): void {
    const player = this.state.players[seat];
    let i = 0;
    while (i < player.hand.length) {
      const tile = player.hand[i];
      if (isBonus(tile)) {
        player.hand.splice(i, 1);
        player.bonusTiles.push(tile);
        // Draw replacement from wall
        const replacement = this.state.wall.shift();
        if (replacement) {
          player.hand.push(replacement);
          // Don't advance i — re-check last position for bonus
        }
        // If wall is empty, we just removed the bonus tile without replacement
      } else {
        i++;
      }
    }
  }

  playerDiscard(playerId: string, tileId: string): void {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) throw new Error(`Player ${playerId} not found`);

    if (this.state.phase !== 'awaiting-discard') throw new Error('Not discard phase');
    if (this.state.currentSeat !== player.seat) throw new Error('Not your turn');

    const tileIdx = player.hand.findIndex(t => t.id === tileId);
    if (tileIdx === -1) throw new Error(`Tile ${tileId} not in player's hand`);

    const [tile] = player.hand.splice(tileIdx, 1);
    this.state.lastDiscard = tile;
    this.state.lastDiscardSeat = player.seat;
    this.state.discardPiles[player.seat].push(tile);
    this.state.phase = 'claim-window';
    this.state.pendingClaims = {};
    this.state.claimWindowEndsAt = Date.now() + 5000;
  }

  submitClaim(playerId: string, action: ClaimType, chowTileIds?: [string, string]): void {
    this.state.pendingClaims[playerId] = { action, chowTileIds };
  }

  resolveClaimWindow(): void {
    const claims = this.state.pendingClaims;

    // Priority: win > pong/kong > chow/pass
    let bestWinner: string | null = null;
    let bestPongKong: string | null = null;

    for (const [playerId, claim] of Object.entries(claims)) {
      if (claim.action === 'win') {
        bestWinner = playerId;
        break;
      }
      if (claim.action === 'pong' || claim.action === 'kong') {
        bestPongKong = playerId;
      }
    }

    if (bestWinner) {
      this.applyWin(bestWinner, 'ron');
      return;
    }

    if (bestPongKong) {
      const claim = claims[bestPongKong];
      this.applyPongKong(bestPongKong, claim.action as 'pong' | 'kong');
      return;
    }

    // No win/pong/kong — check if next player can chow (no timer, always offered after window)
    if (this.state.houseRules.allowChow && this.state.lastDiscard) {
      const nextSeat = (this.state.lastDiscardSeat! + 3) % 4;
      const nextPlayer = this.state.players[nextSeat];
      if (this.canChow(nextPlayer, this.state.lastDiscard)) {
        this.state.phase = 'awaiting-chow';
        this.state.currentSeat = nextSeat;
        return;
      }
    }

    // No claims possible: advance turn
    this.advanceTurn();
  }

  resolveChow(playerId: string, action: 'chow' | 'pass', chowTileIds?: [string, string]): void {
    if (action === 'pass') {
      this.advanceTurn();
      return;
    }

    if (!chowTileIds) throw new Error('chowTileIds required for chow');

    const player = this.state.players.find(p => p.id === playerId);
    if (!player) throw new Error(`Player ${playerId} not found`);
    const discard = this.state.lastDiscard!;

    // Find the two tiles in hand
    const t1Idx = player.hand.findIndex(t => t.id === chowTileIds[0]);
    const t2Idx = player.hand.findIndex(t => t.id === chowTileIds[1]);
    if (t1Idx === -1 || t2Idx === -1) throw new Error('Chow tiles not found in hand');

    const t1 = player.hand[t1Idx];
    const t2 = player.hand[Math.min(t2Idx, t2Idx) === t1Idx ? -1 : t2Idx];

    // Remove from hand (higher index first to avoid shifting)
    const idxA = Math.max(t1Idx, t2Idx);
    const idxB = Math.min(t1Idx, t2Idx);
    player.hand.splice(idxA, 1);
    player.hand.splice(idxB, 1);

    // Form meld with the discard
    const meldTiles = [t1, t2, discard].sort((a, b) => {
      if (a.kind === 'suit' && b.kind === 'suit') return a.value - b.value;
      return 0;
    });

    player.melds.push({
      type: 'chow',
      tiles: meldTiles,
      claimedFromSeat: this.state.lastDiscardSeat ?? undefined,
    });

    this.state.lastDiscard = null;
    this.state.currentSeat = player.seat;
    this.state.phase = 'awaiting-discard';
  }

  private applyPongKong(playerId: string, action: 'pong' | 'kong'): void {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) throw new Error(`Player ${playerId} not found`);
    const discard = this.state.lastDiscard!;

    const matchingTiles: Tile[] = player.hand.filter(t => tilesEqual(t, discard));
    const needed = action === 'pong' ? 2 : 3;
    const taken = matchingTiles.slice(0, needed);

    // Remove from hand
    for (const t of taken) {
      const idx = player.hand.indexOf(t);
      if (idx !== -1) player.hand.splice(idx, 1);
    }

    const meldType = action === 'pong' ? 'pong' : 'kong';
    player.melds.push({
      type: meldType,
      tiles: [...taken, discard],
      claimedFromSeat: this.state.lastDiscardSeat ?? undefined,
    });

    // Kong: draw replacement tile
    if (action === 'kong') {
      const replacement = this.state.wall.shift();
      if (replacement) {
        if (isBonus(replacement)) {
          player.bonusTiles.push(replacement);
          const rep2 = this.state.wall.shift();
          if (rep2) player.hand.push(rep2);
        } else {
          player.hand.push(replacement);
        }
      }
    }

    this.state.lastDiscard = null;
    this.state.currentSeat = player.seat;
    this.state.phase = 'awaiting-discard';
  }

  private advanceTurn(): void {
    const nextSeat = (this.state.lastDiscardSeat! + 3) % 4;

    if (this.state.wall.length === 0) {
      this.endRoundDraw();
      return;
    }

    const drawn = this.state.wall.shift()!;
    const nextPlayer = this.state.players[nextSeat];

    if (isBonus(drawn)) {
      nextPlayer.bonusTiles.push(drawn);
      // Draw replacement
      const replacement = this.state.wall.shift();
      if (replacement) {
        nextPlayer.hand.push(replacement);
      }
    } else {
      nextPlayer.hand.push(drawn);
    }

    this.state.currentSeat = nextSeat;
    this.state.phase = 'awaiting-discard';
    this.state.lastDiscard = null;
    this.state.claimWindowEndsAt = null;
    this.state.pendingClaims = {};
  }

  private endRoundDraw(): void {
    this.state.phase = 'round-end';
    this.state.roundResult = {
      winnerId: null,
      winType: null,
      winnerSeat: null,
      discardSeat: null,
      taiComponents: [],
      totalTai: 0,
      payouts: {},
      newScores: {},
    };
  }

  applyWin(playerId: string, winType: 'ron' | 'zimo'): void {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) throw new Error(`Player ${playerId} not found`);

    const rules = this.state.houseRules;
    const evalOpts: EvalOptions = {
      allow7Pairs: rules.allow7Pairs,
      allow13Orphans: rules.allow13Orphans,
    };

    const decomps = findDecompositions(player.hand, player.melds, evalOpts);
    if (decomps.length === 0) throw new Error('No winning decomposition found');

    const ctx: ScoringContext = {
      rules,
      isSelfDraw: winType === 'zimo',
      isDealer: player.isDealer,
      seatWind: player.wind,
      prevailingWind: this.state.prevailingWind,
      bonusTiles: player.bonusTiles,
      isTianHu: false,
      isDiHu: false,
      hasYao: false,
    };

    // Find best decomposition (highest score)
    let bestResult = scoreTai(decomps[0], ctx);
    let bestDecomp = decomps[0];
    for (const d of decomps.slice(1)) {
      const result = scoreTai(d, ctx);
      if (result.total > bestResult.total) {
        bestResult = result;
        bestDecomp = d;
      }
    }

    const totalTai = bestResult.total;
    const playerIds = this.state.players.map(p => p.id);
    const dealerId = this.state.players[this.state.dealerSeat].id;
    const discarderId = winType === 'ron' && this.state.lastDiscardSeat !== null
      ? this.state.players[this.state.lastDiscardSeat].id
      : null;

    const paymentResult = calculatePayments({
      winnerId: playerId,
      discarderId,
      winType,
      tai: totalTai,
      rules,
      playerIds,
      dealerId,
      hasYao: false,
      yaoBonusPayers: playerIds.filter(id => id !== playerId),
    });

    // Update scores
    const newScores: Record<string, number> = {};
    for (const p of this.state.players) {
      p.score += paymentResult.deltas[p.id] ?? 0;
      newScores[p.id] = p.score;
    }

    const payouts: Record<string, number> = {};
    for (const p of this.state.players) {
      payouts[p.id] = paymentResult.deltas[p.id] ?? 0;
    }

    this.state.roundResult = {
      winnerId: playerId,
      winType,
      winnerSeat: player.seat,
      discardSeat: this.state.lastDiscardSeat,
      taiComponents: bestResult.components,
      totalTai,
      payouts,
      newScores,
    };

    this.state.phase = 'round-end';
  }

  getEligibleClaims(playerId: string): ClaimType[] {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return [];

    const rules = this.state.houseRules;
    const phase = this.state.phase;
    const discard = this.state.lastDiscard;
    const eligible: ClaimType[] = [];

    if (phase === 'claim-window' && discard) {
      // Can't claim your own discard
      if (this.state.lastDiscardSeat === player.seat) {
        return ['pass'];
      }

      const evalOpts: EvalOptions = {
        allow7Pairs: rules.allow7Pairs,
        allow13Orphans: rules.allow13Orphans,
      };

      // Check win
      const handWithDiscard = [...player.hand, discard];
      if (canWin(handWithDiscard, player.melds, evalOpts)) {
        eligible.push('win');
      }

      // Check pong (need 2 matching tiles in hand)
      const matching = player.hand.filter(t => tilesEqual(t, discard));
      if (matching.length >= 2) {
        eligible.push('pong');
        // Check kong (need 3 matching tiles in hand)
        if (matching.length >= 3) {
          eligible.push('kong');
        }
      }

      // Chow is NOT offered during the claim window — it happens in awaiting-chow phase after the timer
      eligible.push('pass');
    } else if (phase === 'awaiting-chow' && this.state.currentSeat === player.seat) {
      eligible.push('chow');
      eligible.push('pass');
    } else if (phase === 'awaiting-discard' && this.state.currentSeat === player.seat) {
      // Can do a concealed kong if has 4 of same tile
      // (not modeled as ClaimType here, so nothing to add)
    }

    return eligible;
  }

  private canChow(player: PlayerInternalState, discard: Tile): boolean {
    if (discard.kind !== 'suit') return false;

    const suit = discard.suit;
    const val = discard.value;
    const hand = player.hand;

    // Check combinations: need two tiles from hand that form a sequence with discard
    // Possible sequences: [val-2, val-1, val], [val-1, val, val+1], [val, val+1, val+2]
    const suitTiles = hand.filter(t => t.kind === 'suit' && t.suit === suit);
    const vals = suitTiles.map(t => {
      if (t.kind === 'suit') return t.value;
      return 0;
    });

    // Check [val-2, val-1] + discard
    if (val >= 3) {
      const hasV2 = vals.includes((val - 2) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
      const hasV1 = vals.includes((val - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
      if (hasV2 && hasV1) return true;
    }

    // Check [val-1] + discard + [val+1]
    if (val >= 2 && val <= 8) {
      const hasV1 = vals.includes((val - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
      const hasV1plus = vals.includes((val + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
      if (hasV1 && hasV1plus) return true;
    }

    // Check discard + [val+1, val+2]
    if (val <= 7) {
      const hasV1 = vals.includes((val + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
      const hasV2 = vals.includes((val + 2) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
      if (hasV1 && hasV2) return true;
    }

    return false;
  }
}
