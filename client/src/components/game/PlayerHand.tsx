import React, { useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import Tile from '../ui/Tile';
import RevealedMeld from './RevealedMeld';

export default function PlayerHand() {
  const view = useGameStore(s => s.view)!;
  const handOrder = useGameStore(s => s.handOrder);
  const selectedTileId = useGameStore(s => s.selectedTileId);
  const selectTile = useGameStore(s => s.selectTile);
  const discard = useGameStore(s => s.discard);
  const reorderHand = useGameStore(s => s.reorderHand);

  const isMyTurn = view.currentSeat === view.mySeat && view.phase === 'awaiting-discard';
  const drawnTileId = isMyTurn && view.myHand.length > 0
    ? handOrder[handOrder.length - 1] : null;

  const dragFromIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Build ordered tile list from handOrder (server is source of truth for tile data)
  const tileMap = new Map(view.myHand.map(t => [t.id, t]));
  const orderedHand = handOrder.map(id => tileMap.get(id)).filter(Boolean) as typeof view.myHand;

  function handleTileClick(tileId: string) {
    if (!isMyTurn) return;
    if (selectedTileId === tileId) {
      discard(tileId);
    } else {
      selectTile(tileId);
    }
  }

  function handleDragStart(e: React.DragEvent, idx: number) {
    dragFromIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(idx);
  }

  function handleDrop(e: React.DragEvent, toIdx: number) {
    e.preventDefault();
    if (dragFromIdx.current !== null && dragFromIdx.current !== toIdx) {
      reorderHand(dragFromIdx.current, toIdx);
    }
    dragFromIdx.current = null;
    setDragOverIdx(null);
  }

  function handleDragEnd() {
    dragFromIdx.current = null;
    setDragOverIdx(null);
  }

  return (
    <div className="flex items-end gap-4">
      {view.myMelds.length > 0 && (
        <div className="flex gap-1 items-end">
          {view.myMelds.map((meld, i) => <RevealedMeld key={i} meld={meld} />)}
        </div>
      )}
      <div className="flex gap-1 items-end">
        {orderedHand.map((tile, idx) => (
          <div
            key={tile.id}
            draggable
            onDragStart={e => handleDragStart(e, idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={e => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            className={`transition-transform ${dragOverIdx === idx && dragFromIdx.current !== idx ? 'translate-x-2' : ''}`}
          >
            <Tile
              tile={tile}
              size="lg"
              selected={selectedTileId === tile.id}
              highlighted={tile.id === drawnTileId}
              onClick={() => handleTileClick(tile.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
