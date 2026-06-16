import { create } from 'zustand';
import { LobbyPlayerInfo, HouseRules } from '@mahjong/shared';

interface LobbyStore {
  roomCode: string;
  myPlayerId: string;
  mySeat: number;
  players: LobbyPlayerInfo[];
  houseRules: HouseRules | null;
  isHost: boolean;
  setLobby: (data: { roomCode: string; playerId: string; seat: number; players: LobbyPlayerInfo[]; houseRules: HouseRules }) => void;
  updateLobby: (players: LobbyPlayerInfo[], houseRules: HouseRules, myPlayerId: string) => void;
}

export const useLobbyStore = create<LobbyStore>((set) => ({
  roomCode: '',
  myPlayerId: '',
  mySeat: 0,
  players: [],
  houseRules: null,
  isHost: false,

  setLobby: ({ roomCode, playerId, seat, players, houseRules }) => set({
    roomCode,
    myPlayerId: playerId,
    mySeat: seat,
    players,
    houseRules,
    isHost: players.find(p => p.id === playerId)?.isHost ?? false,
  }),

  updateLobby: (players, houseRules, myPlayerId) => set({
    players,
    houseRules,
    isHost: players.find(p => p.id === myPlayerId)?.isHost ?? false,
  }),
}));
