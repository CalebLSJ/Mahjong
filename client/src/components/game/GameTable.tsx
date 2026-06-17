import React from 'react';
import { useGameStore } from '../../store/gameStore';
import PlayerHand from './PlayerHand';
import OpponentStrip from './OpponentStrip';
import DiscardPool from './DiscardPool';
import CenterInfo from './CenterInfo';
import ActionButtons from './ActionButtons';
import ClaimTimer from './ClaimTimer';
import ScoreSidebar from './ScoreSidebar';

function WallTile({ vertical }: { vertical?: boolean }) {
  return (
    <div className={`${vertical ? 'w-4 h-6' : 'w-6 h-4'} bg-blue-800 border border-blue-950 rounded-sm flex-shrink-0 shadow-sm`}
      style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }} />
  );
}

function WallStrip({ count, vertical }: { count: number; vertical?: boolean }) {
  const tiles = Math.max(1, Math.round(count / 4));
  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-px flex-wrap`}
      style={{ maxHeight: vertical ? '100%' : undefined }}>
      {Array.from({ length: tiles }).map((_, i) => <WallTile key={i} vertical={vertical} />)}
    </div>
  );
}

export default function GameTable() {
  const view = useGameStore(s => s.view)!;
  const mySeat = view.mySeat;
  const northSeat = (mySeat + 2) % 4;
  const eastSeat = (mySeat + 1) % 4;
  const westSeat = (mySeat + 3) % 4;
  const wallCount = view.wallCount;

  return (
    <div className="min-h-screen bg-[#1a472a] flex">
      <div className="flex-1 flex flex-col">

        {/* North opponent */}
        <div className="flex justify-center py-2 px-4">
          <OpponentStrip seat={northSeat} position="top" />
        </div>

        {/* Middle row: West | Center | East */}
        <div className="flex-1 flex items-stretch px-2 gap-2 min-h-0">

          {/* West opponent */}
          <div className="flex items-center">
            <OpponentStrip seat={westSeat} position="left" />
          </div>

          {/* Center table with walls */}
          <div className="flex-1 relative bg-[#15391f] rounded-xl flex flex-col overflow-hidden border border-[#f5e6c8]/5">

            {/* North wall strip */}
            <div className="flex justify-center px-8 pt-1.5 pb-0.5 gap-px flex-wrap">
              <WallStrip count={wallCount} />
            </div>

            {/* Inner play area */}
            <div className="flex-1 flex min-h-0">

              {/* West wall */}
              <div className="flex flex-col justify-center px-1.5 py-1 gap-px">
                <WallStrip count={wallCount} vertical />
              </div>

              {/* Discard + center area */}
              <div className="flex-1 flex flex-col min-h-0 p-1">

                {/* North discards */}
                <div className="flex justify-center">
                  <DiscardPool seat={northSeat} position="top" />
                </div>

                {/* East/West discards + center info */}
                <div className="flex-1 flex items-center min-h-0">
                  <div className="flex-1">
                    <DiscardPool seat={westSeat} position="left" />
                  </div>
                  <div className="flex-shrink-0 px-4">
                    <CenterInfo />
                  </div>
                  <div className="flex-1 flex justify-end">
                    <DiscardPool seat={eastSeat} position="right" />
                  </div>
                </div>

                {/* South (my) discards */}
                <div className="flex justify-center">
                  <DiscardPool seat={mySeat} position="bottom" />
                </div>

              </div>

              {/* East wall */}
              <div className="flex flex-col justify-center px-1.5 py-1 gap-px">
                <WallStrip count={wallCount} vertical />
              </div>
            </div>

            {/* South wall strip */}
            <div className="flex justify-center px-8 pb-1.5 pt-0.5 gap-px flex-wrap">
              <WallStrip count={wallCount} />
            </div>

          </div>

          {/* East opponent */}
          <div className="flex items-center">
            <OpponentStrip seat={eastSeat} position="right" />
          </div>
        </div>

        {/* Player hand + actions */}
        <div className="flex flex-col items-center py-3 px-4 gap-2">
          <PlayerHand />
          <div className="flex items-center gap-4"><ActionButtons /></div>
          <ClaimTimer />
        </div>
      </div>

      <ScoreSidebar />
    </div>
  );
}
