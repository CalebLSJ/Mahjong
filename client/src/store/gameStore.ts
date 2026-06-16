import { create } from 'zustand';
import { GameView, ClaimType } from '@mahjong/shared';
import { socket } from '../socket';

interface GameStore {
  view: GameView | null;
  selectedTileId: string | null;
  pendingAction: ClaimType | null;
  setView: (v: GameView) => void;
  selectTile: (id: string | null) => void;
  discard: (tileId: string) => void;
  claim: (action: ClaimType, chowTileIds?: [string, string]) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  view: null,
  selectedTileId: null,
  pendingAction: null,
  setView: (view) => set({ view }),
  selectTile: (id) => set({ selectedTileId: id }),
  discard: (tileId) => {
    socket.emit('game:discard', { tileId });
    set({ selectedTileId: null });
  },
  claim: (action, chowTileIds) => {
    socket.emit('game:claim', { action, chowTileIds });
    set({ pendingAction: action });
  },
  reset: () => set({ view: null, selectedTileId: null, pendingAction: null }),
}));
