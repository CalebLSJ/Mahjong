import { create } from 'zustand';
import { GameView, ClaimType, Tile } from '@mahjong/shared';
import { socket } from '../socket';

interface GameStore {
  view: GameView | null;
  selectedTileId: string | null;
  pendingAction: ClaimType | null;
  handOrder: string[]; // tile IDs in player's custom display order
  setView: (v: GameView) => void;
  selectTile: (id: string | null) => void;
  discard: (tileId: string) => void;
  claim: (action: ClaimType, chowTileIds?: [string, string]) => void;
  reorderHand: (fromIdx: number, toIdx: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  view: null,
  selectedTileId: null,
  pendingAction: null,
  handOrder: [],

  setView: (view) => set((state) => {
    const newIds = new Set(view.myHand.map((t: Tile) => t.id));
    // Keep existing order for tiles still in hand, append new tiles at end
    const kept = state.handOrder.filter(id => newIds.has(id));
    const added = view.myHand.map((t: Tile) => t.id).filter(id => !kept.includes(id));
    return { view, handOrder: [...kept, ...added] };
  }),

  selectTile: (id) => set({ selectedTileId: id }),

  discard: (tileId) => {
    socket.emit('game:discard', { tileId });
    set({ selectedTileId: null });
  },

  claim: (action, chowTileIds) => {
    socket.emit('game:claim', { action, chowTileIds });
    set({ pendingAction: action });
  },

  reorderHand: (fromIdx, toIdx) => set((state) => {
    const order = [...state.handOrder];
    const [moved] = order.splice(fromIdx, 1);
    order.splice(toIdx, 0, moved);
    return { handOrder: order };
  }),

  reset: () => set({ view: null, selectedTileId: null, pendingAction: null, handOrder: [] }),
}));
