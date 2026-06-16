// server/src/roomManager.ts
import { HouseRules, LobbyPlayerInfo, BotDifficulty } from '@mahjong/shared';
import { GameEngine } from './gameEngine';
import { buildDefaultHouseRules } from '@mahjong/shared';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export interface RoomPlayer {
  id: string;
  name: string;
  seat: number;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  isHost: boolean;
  socketId: string;
}

export interface Room {
  code: string;
  players: RoomPlayer[];
  houseRules: HouseRules;
  engine: GameEngine | null;
  started: boolean;
  claimTimer: ReturnType<typeof setTimeout> | null;
}

const rooms = new Map<string, Room>();

export function createRoom(socketId: string, playerId: string, playerName: string, houseRules: HouseRules): Room {
  const code = generateCode();
  const room: Room = {
    code,
    players: [{ id: playerId, name: playerName, seat: 0, isBot: false, isHost: true, socketId }],
    houseRules,
    engine: null,
    started: false,
    claimTimer: null,
  };
  rooms.set(code, room);
  return room;
}

export function joinRoom(code: string, socketId: string, playerId: string, playerName: string): Room {
  const room = rooms.get(code.toUpperCase());
  if (!room) throw new Error('Room not found');
  if (room.started) throw new Error('Game already started');
  if (room.players.length >= 4) throw new Error('Room is full');
  if (room.players.some(p => p.id === playerId)) throw new Error('Already in room');

  const seat = getNextAvailableSeat(room);
  room.players.push({ id: playerId, name: playerName, seat, isBot: false, isHost: false, socketId });
  return room;
}

export function addBot(code: string, difficulty: BotDifficulty, botName: string): Room {
  const room = rooms.get(code);
  if (!room || room.started) throw new Error('Cannot add bot');
  if (room.players.length >= 4) throw new Error('Room is full');
  const botId = `bot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const seat = getNextAvailableSeat(room);
  room.players.push({ id: botId, name: botName, seat, isBot: true, botDifficulty: difficulty, isHost: false, socketId: '' });
  return room;
}

export function removeBot(code: string, seat: number): Room {
  const room = rooms.get(code);
  if (!room || room.started) throw new Error('Cannot remove bot');
  room.players = room.players.filter(p => !(p.isBot && p.seat === seat));
  return room;
}

export function updateRules(code: string, rules: HouseRules): Room {
  const room = rooms.get(code);
  if (!room || room.started) throw new Error('Cannot update rules');
  room.houseRules = rules;
  return room;
}

export function startGame(code: string): GameEngine {
  const room = rooms.get(code);
  if (!room) throw new Error('Room not found');
  if (room.players.length < 1) throw new Error('Need at least 1 player');

  // Fill empty seats with bots
  while (room.players.length < 4) {
    const botNames = ['Auntie Bot', 'Uncle Algorithm', 'Cousin CPU', 'Granny AI'];
    addBot(code, 'medium', botNames[room.players.length - 1]);
  }

  const engine = new GameEngine(
    room.houseRules,
    room.players.map(p => ({ id: p.id, name: p.name, seat: p.seat as 0|1|2|3, isBot: p.isBot })),
    0,
  );
  engine.startRound();
  room.engine = engine;
  room.started = true;
  return engine;
}

export function getRoom(code: string): Room | undefined { return rooms.get(code); }

export function getRoomBySocket(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.socketId === socketId)) return room;
  }
  return undefined;
}

export function getRoomByPlayer(playerId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === playerId)) return room;
  }
  return undefined;
}

export function removePlayerFromRoom(room: Room, socketId: string): void {
  room.players = room.players.filter(p => p.socketId !== socketId);
  if (room.players.filter(p => !p.isBot).length === 0) {
    if (room.claimTimer) clearTimeout(room.claimTimer);
    rooms.delete(room.code);
  }
}

export function getLobbyPlayers(room: Room): LobbyPlayerInfo[] {
  return room.players.map(p => ({
    id: p.id, name: p.name, seat: p.seat,
    isBot: p.isBot, botDifficulty: p.botDifficulty, isHost: p.isHost,
  }));
}

function getNextAvailableSeat(room: Room): number {
  const taken = new Set(room.players.map(p => p.seat));
  for (let s = 0; s < 4; s++) if (!taken.has(s)) return s;
  throw new Error('No seats available');
}

// Suppress unused import warning - buildDefaultHouseRules is available for callers
void buildDefaultHouseRules;
