import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';
import { useAutoClaimSettings } from '../hooks/useAutoClaimSettings';
import GameTable from '../components/game/GameTable';
import WinScreen from '../components/game/WinScreen';
import RoundSummary from '../components/game/RoundSummary';
import { GameView } from '@mahjong/shared';

export default function GamePage() {
  const { roomCode: _roomCode } = useParams<{ roomCode: string }>();
  const { view, setView } = useGameStore();
  const { shouldAutoPong, shouldAutoKong } = useAutoClaimSettings();
  const autoClaimRef = useRef({ shouldAutoPong, shouldAutoKong });
  autoClaimRef.current = { shouldAutoPong, shouldAutoKong };

  useEffect(() => {
    function onGameState(newView: GameView) {
      setView(newView);
      if (newView.phase === 'claim-window' && newView.lastDiscard) {
        const tile = newView.lastDiscard;
        const eligible = newView.eligibleClaims;
        const { shouldAutoPong: autoPong, shouldAutoKong: autoKong } = autoClaimRef.current;
        if (autoKong(tile) && eligible.includes('kong')) socket.emit('game:claim', { action: 'kong' });
        else if (autoPong(tile) && eligible.includes('pong')) socket.emit('game:claim', { action: 'pong' });
      }
    }
    socket.on('game:state', onGameState);
    return () => { socket.off('game:state', onGameState); };
  }, [setView]);

  if (!view) return <div className="min-h-screen bg-[#1a472a] flex items-center justify-center text-[#f5e6c8]">Connecting...</div>;

  if (view.phase === 'round-end' && view.roundResult) {
    if (view.roundResult.winnerId) return <WinScreen />;
    return <RoundSummary />;
  }

  return <GameTable />;
}
