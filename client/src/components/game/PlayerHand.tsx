import React from 'react';
import { useGameStore } from '../../store/gameStore';
import Tile from '../ui/Tile';
import RevealedMeld from './RevealedMeld';

export default function PlayerHand() {
  const view = useGameStore(s => s.view)!;
  const selectedTileId = useGameStore(s => s.selectedTileId);
  const selectTile = useGameStore(s => s.selectTile);
  const discard = useGameStore(s => s.discard);

  const isMyTurn = view.currentSeat === view.mySeat && view.phase === 'awaiting-discard';
  const drawnTileId = isMyTurn && view.myHand.length > 0
    ? view.myHand[view.myHand.length - 1].id : null;

  function handleTileClick(tileId: string) {
    if (!isMyTurn) return;
    if (selectedTileId === tileId) {
      discard(tileId);
    } else {
      selectTile(tileId);
    }
  }

  return (
    <div className="flex items-end gap-4">
      {view.myMelds.length > 0 && (
        <div className="flex gap-1 items-end">
          {view.myMelds.map((meld, i) => <RevealedMeld key={i} meld={meld} />)}
        </div>
      )}
      <div className="flex gap-1 items-end">
        {view.myHand.map(tile => (
          <Tile key={tile.id} tile={tile} size="lg"
            selected={selectedTileId === tile.id}
            highlighted={tile.id === drawnTileId}
            onClick={() => handleTileClick(tile.id)} />
        ))}
      </div>
    </div>
  );
}
