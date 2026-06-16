import React from 'react';
import { useGameStore } from '../../store/gameStore';
import PlayerHand from './PlayerHand';
import OpponentStrip from './OpponentStrip';
import DiscardPool from './DiscardPool';
import CenterInfo from './CenterInfo';
import ActionButtons from './ActionButtons';
import ClaimTimer from './ClaimTimer';
import ScoreSidebar from './ScoreSidebar';

export default function GameTable() {
  const view = useGameStore(s => s.view)!;
  const mySeat = view.mySeat;
  const northSeat = (mySeat + 2) % 4;
  const eastSeat = (mySeat + 1) % 4;
  const westSeat = (mySeat + 3) % 4;

  return (
    <div className="min-h-screen bg-[#1a472a] flex">
      <div className="flex-1 grid" style={{ gridTemplate: '"top top top" auto "left center right" 1fr "bottom bottom bottom" auto / auto 1fr auto' }}>
        <div style={{ gridArea: 'top' }} className="flex flex-col items-center py-3 px-4">
          <OpponentStrip seat={northSeat} position="top" />
        </div>
        <div style={{ gridArea: 'left' }} className="flex items-center py-4 px-2">
          <OpponentStrip seat={westSeat} position="left" />
        </div>
        <div style={{ gridArea: 'center' }} className="relative bg-[#15391f] rounded-xl m-2 flex items-center justify-center">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-2">
            <DiscardPool seat={northSeat} />
            <DiscardPool seat={eastSeat} />
            <DiscardPool seat={westSeat} />
            <DiscardPool seat={mySeat} />
          </div>
          <CenterInfo />
        </div>
        <div style={{ gridArea: 'right' }} className="flex items-center py-4 px-2">
          <OpponentStrip seat={eastSeat} position="right" />
        </div>
        <div style={{ gridArea: 'bottom' }} className="flex flex-col items-center py-3 px-4 gap-2">
          <PlayerHand />
          <div className="flex items-center gap-4"><ActionButtons /></div>
          <ClaimTimer />
        </div>
      </div>
      <ScoreSidebar />
    </div>
  );
}
