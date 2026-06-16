// server/src/botAI.ts
import { Tile, ClaimType } from '@mahjong/shared';
import { PlayerInternalState, InternalGameState } from './gameEngine';
import { tilesEqual, isHonorTile, sortTiles } from './tileEngine';

export class BotAI {
  constructor(private difficulty: 'easy' | 'medium' | 'hard') {}

  chooseDiscard(player: PlayerInternalState, state: InternalGameState): Tile {
    const hand = [...player.hand];
    if (this.difficulty === 'easy') return this.discardEasy(hand);
    return this.discardMedium(hand);
  }

  decideClaim(player: PlayerInternalState, discardedTile: Tile, eligible: ClaimType[]): ClaimType {
    if (eligible.includes('win')) return 'win';

    if (eligible.includes('pong') || eligible.includes('kong')) {
      if (this.difficulty === 'easy') return Math.random() > 0.5 ? (eligible.includes('pong') ? 'pong' : 'kong') : 'pass';
      if (discardedTile.kind === 'dragon' || discardedTile.kind === 'wind') {
        return eligible.includes('kong') ? 'kong' : 'pong';
      }
      if (this.difficulty === 'hard') {
        return this.shouldPong(player, discardedTile) ? 'pong' : 'pass';
      }
      return Math.random() > 0.3 ? 'pong' : 'pass';
    }

    return 'pass';
  }

  private discardEasy(hand: Tile[]): Tile {
    const honors = hand.filter(t => isHonorTile(t));
    if (honors.length > 0) return honors[Math.floor(Math.random() * honors.length)];
    return hand[Math.floor(Math.random() * hand.length)];
  }

  private discardMedium(hand: Tile[]): Tile {
    const scores = hand.map((tile, i) => {
      const without = [...hand.slice(0, i), ...hand.slice(i + 1)];
      return { tile, score: shantenNumber(without) };
    });
    scores.sort((a, b) => b.score - a.score);
    return scores[0].tile;
  }

  private shouldPong(player: PlayerInternalState, tile: Tile): boolean {
    return countPairs(player.hand).some(t => tilesEqual(t, tile));
  }
}

function countPairs(hand: Tile[]): Tile[] {
  const pairs: Tile[] = [];
  const sorted = sortTiles(hand);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (tilesEqual(sorted[i], sorted[i + 1])) { pairs.push(sorted[i]); i++; }
  }
  return pairs;
}

function shantenNumber(hand: Tile[]): number {
  let melds = 0, pairs = 0;
  const sorted = sortTiles([...hand]);
  const used = new Array(sorted.length).fill(false);

  for (let i = 0; i < sorted.length; i++) {
    if (used[i]) continue;
    for (let j = i + 1; j < sorted.length; j++) {
      if (used[j]) continue;
      if (!tilesEqual(sorted[i], sorted[j])) continue;
      let foundThird = false;
      for (let k = j + 1; k < sorted.length; k++) {
        if (used[k]) continue;
        if (!tilesEqual(sorted[i], sorted[k])) continue;
        used[i] = used[j] = used[k] = true; melds++; foundThird = true; break;
      }
      if (!foundThird) { used[i] = used[j] = true; pairs++; }
      break;
    }
  }
  return Math.max(-1, 8 - melds * 2 - pairs);
}
