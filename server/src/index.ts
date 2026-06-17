// server/src/index.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { ServerToClientEvents, ClientToServerEvents, GameView } from '@mahjong/shared';
import * as rm from './roomManager';
import { BotAI } from './botAI';
import { InternalGameState } from './gameEngine';
import { isBonus } from './tileEngine';

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' },
});

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

io.on('connection', socket => {
  const playerId = socket.id;

  socket.on('room:create', ({ playerName, houseRules }) => {
    try {
      const room = rm.createRoom(socket.id, playerId, playerName, houseRules);
      socket.join(room.code);
      socket.emit('room:created', { roomCode: room.code, playerId, seat: 0 });
      socket.emit('room:joined', { roomCode: room.code, playerId, seat: 0, players: rm.getLobbyPlayers(room), houseRules: room.houseRules });
    } catch (e: unknown) { socket.emit('room:error', (e as Error).message); }
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    try {
      const room = rm.joinRoom(roomCode, socket.id, playerId, playerName);
      socket.join(room.code);
      const seat = room.players.find(p => p.id === playerId)!.seat;
      socket.emit('room:joined', { roomCode: room.code, playerId, seat, players: rm.getLobbyPlayers(room), houseRules: room.houseRules });
      socket.to(room.code).emit('room:updated', { players: rm.getLobbyPlayers(room), houseRules: room.houseRules });
    } catch (e: unknown) { socket.emit('room:error', (e as Error).message); }
  });

  socket.on('room:add-bot', ({ difficulty, name }) => {
    const room = rm.getRoomBySocket(socket.id);
    if (!room) return;
    try {
      rm.addBot(room.code, difficulty, name);
      io.to(room.code).emit('room:updated', { players: rm.getLobbyPlayers(room), houseRules: room.houseRules });
    } catch (e: unknown) { socket.emit('room:error', (e as Error).message); }
  });

  socket.on('room:remove-bot', ({ seat }) => {
    const room = rm.getRoomBySocket(socket.id);
    if (!room) return;
    rm.removeBot(room.code, seat);
    io.to(room.code).emit('room:updated', { players: rm.getLobbyPlayers(room), houseRules: room.houseRules });
  });

  socket.on('room:update-rules', rules => {
    const room = rm.getRoomBySocket(socket.id);
    if (!room) return;
    const p = room.players.find(p => p.socketId === socket.id);
    if (!p?.isHost) return;
    rm.updateRules(room.code, rules);
    io.to(room.code).emit('room:updated', { players: rm.getLobbyPlayers(room), houseRules: room.houseRules });
  });

  socket.on('room:start', () => {
    const room = rm.getRoomBySocket(socket.id);
    if (!room) return;
    const p = room.players.find(p => p.socketId === socket.id);
    if (!p?.isHost) return;
    try {
      const engine = rm.startGame(room.code);
      broadcastGameState(room.code, engine.getState());
      scheduleClaimWindowCheck(room.code);
      scheduleBotTurns(room.code);
    } catch (e: unknown) { socket.emit('room:error', (e as Error).message); }
  });

  socket.on('game:discard', ({ tileId }) => {
    const room = rm.getRoomBySocket(socket.id);
    if (!room?.engine) return;
    try {
      room.engine.playerDiscard(playerId, tileId);
      broadcastGameState(room.code, room.engine.getState());
      scheduleClaimWindowCheck(room.code);
      scheduleBotClaims(room.code);
    } catch (e: unknown) { console.error((e as Error).message); }
  });

  socket.on('game:claim', ({ action, chowTileIds }) => {
    const room = rm.getRoomBySocket(socket.id);
    if (!room?.engine) return;
    const state = room.engine.getState();

    if (state.phase === 'claim-window') {
      room.engine.submitClaim(playerId, action, chowTileIds);
      const humanPlayers = room.players.filter(p => !p.isBot);
      const pendingClaims = room.engine.getState().pendingClaims;
      const allResponded = humanPlayers.every(p => pendingClaims[p.id]);
      if (allResponded) {
        if (room.claimTimer) { clearTimeout(room.claimTimer); room.claimTimer = null; }
        resolveAndBroadcast(room.code);
      } else {
        broadcastGameState(room.code, room.engine.getState());
      }
    } else if (state.phase === 'awaiting-chow') {
      if (action === 'chow' && chowTileIds) {
        room.engine.resolveChow(playerId, 'chow', chowTileIds);
      } else {
        room.engine.resolveChow(playerId, 'pass');
      }
      broadcastGameState(room.code, room.engine.getState());
      scheduleBotTurns(room.code);
    }
  });

  socket.on('game:concealed-kong', ({ tileId: _tileId }) => {
    // TODO: implement concealed kong
  });

  socket.on('game:bu-flower', () => {
    const room = rm.getRoomBySocket(socket.id);
    if (!room?.engine) return;
    try {
      room.engine.buFlower(playerId);
      broadcastGameState(room.code, room.engine.getState());
      // If bot's turn after bu, schedule bot
      const state = room.engine.getState();
      if (state.phase === 'awaiting-discard') scheduleBotTurns(room.code);
    } catch (e: unknown) { console.error((e as Error).message); }
  });

  socket.on('disconnect', () => {
    const room = rm.getRoomBySocket(socket.id);
    if (room) {
      rm.removePlayerFromRoom(room, socket.id);
      if (!room.started) {
        io.to(room.code).emit('room:updated', { players: rm.getLobbyPlayers(room), houseRules: room.houseRules });
      }
    }
  });
});

function buildGameView(state: InternalGameState, playerId: string, seat: number, roomCode: string, engine: { getEligibleClaims: (id: string) => import('@mahjong/shared').ClaimType[] }): GameView {
  const me = state.players[seat];
  return {
    roomCode,
    myPlayerId: playerId,
    mySeat: seat,
    myHand: me.hand,
    myMelds: me.melds,
    myBonusTiles: me.bonusTiles,
    players: state.players.map(p => ({
      id: p.id, name: p.name, seat: p.seat, wind: p.wind,
      handSize: p.hand.length, melds: p.melds, bonusTiles: p.bonusTiles,
      isDealer: p.isDealer, isBot: p.isBot, score: p.score,
    })),
    wallCount: state.wall.length,
    currentSeat: state.currentSeat,
    phase: state.phase,
    lastDiscard: state.lastDiscard,
    lastDiscardSeat: state.lastDiscardSeat,
    claimWindowEndsAt: state.claimWindowEndsAt,
    prevailingWind: state.prevailingWind,
    roundNumber: state.roundNumber,
    dealerSeat: state.dealerSeat,
    houseRules: state.houseRules,
    eligibleClaims: engine.getEligibleClaims(playerId),
    pendingBonus: state.phase === 'pending-bonus' && state.pendingBonusSeat === seat
      ? (state.players[seat].hand.find(t => isBonus(t)) ?? null)
      : null,
    roundResult: state.roundResult,
    discardHistory: Object.fromEntries(state.discardPiles.map((pile, i) => [i, pile])),
  };
}

function broadcastGameState(roomCode: string, state: InternalGameState): void {
  const room = rm.getRoom(roomCode);
  if (!room?.engine) return;
  const engine = room.engine;
  room.players.forEach(rp => {
    if (rp.isBot || !rp.socketId) return;
    const view = buildGameView(state, rp.id, rp.seat, roomCode, engine);
    io.to(rp.socketId).emit('game:state', view);
  });
}

function scheduleClaimWindowCheck(roomCode: string): void {
  const room = rm.getRoom(roomCode);
  if (!room?.engine) return;
  const state = room.engine.getState();
  if (state.phase !== 'claim-window') return;
  if (room.claimTimer) clearTimeout(room.claimTimer);
  room.claimTimer = setTimeout(() => { resolveAndBroadcast(roomCode); }, 5100);
}

function resolveAndBroadcast(roomCode: string): void {
  const room = rm.getRoom(roomCode);
  if (!room?.engine) return;
  room.claimTimer = null;
  room.engine.resolveClaimWindow();
  const state = room.engine.getState();
  broadcastGameState(roomCode, state);
  if (state.phase === 'round-end') return;
  if (state.phase === 'awaiting-chow') return;
  scheduleBotTurns(roomCode);
}

function scheduleBotClaims(roomCode: string): void {
  const room = rm.getRoom(roomCode);
  if (!room?.engine) return;
  room.players.filter(p => p.isBot).forEach(bot => {
    const thinkMs = 500 + Math.random() * 1500;
    setTimeout(() => {
      if (!room.engine) return;
      const s = room.engine.getState();
      if (s.phase !== 'claim-window') return;
      const eligible = room.engine.getEligibleClaims(bot.id);
      const ai = new BotAI(bot.botDifficulty ?? 'medium');
      const lastDiscard = s.lastDiscard;
      if (!lastDiscard) return;
      const action = ai.decideClaim(s.players[bot.seat], lastDiscard, eligible);
      room.engine.submitClaim(bot.id, action);
    }, thinkMs);
  });
}

function scheduleBotTurns(roomCode: string): void {
  const room = rm.getRoom(roomCode);
  if (!room?.engine) return;
  const state = room.engine.getState();

  // Handle bot pending-bonus
  if (state.phase === 'pending-bonus' && state.pendingBonusSeat !== null) {
    const pendingPlayer = room.players[state.pendingBonusSeat];
    if (pendingPlayer?.isBot) {
      room.engine.buFlower(pendingPlayer.id);
      broadcastGameState(roomCode, room.engine.getState());
      scheduleBotTurns(roomCode); // recurse to handle discard or next bonus
    }
    return;
  }

  if (state.phase !== 'awaiting-discard') return;
  const currentPlayer = room.players[state.currentSeat];
  if (!currentPlayer?.isBot) return;

  const thinkMs = 1000 + Math.random() * 2000;
  setTimeout(() => {
    if (!room.engine) return;
    const s = room.engine.getState();
    if (s.phase !== 'awaiting-discard' || s.currentSeat !== currentPlayer.seat) return;
    const player = s.players[currentPlayer.seat];

    if (room.engine.getEligibleClaims(currentPlayer.id).includes('win')) {
      room.engine.applyWin(currentPlayer.id, 'zimo');
      broadcastGameState(roomCode, room.engine.getState());
      return;
    }

    const ai = new BotAI(currentPlayer.botDifficulty ?? 'medium');
    const tileToDiscard = ai.chooseDiscard(player, s);
    room.engine.playerDiscard(currentPlayer.id, tileToDiscard.id);
    broadcastGameState(roomCode, room.engine.getState());
    scheduleClaimWindowCheck(roomCode);
    scheduleBotClaims(roomCode);
  }, thinkMs);
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
