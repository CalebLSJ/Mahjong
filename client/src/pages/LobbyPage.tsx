import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../socket';
import { LobbyPlayerInfo, HouseRules, BotDifficulty } from '@mahjong/shared';
import PlayerSlot from '../components/lobby/PlayerSlot';
import HouseRulesForm from '../components/lobby/HouseRulesForm';
import TaiTableEditor from '../components/lobby/TaiTableEditor';

export default function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<LobbyPlayerInfo[]>([]);
  const [rules, setRules] = useState<HouseRules | null>(null);
  const [myPlayerId, setMyPlayerId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [tab, setTab] = useState<'rules' | 'tai'>('rules');

  useEffect(() => {
    socket.on('room:joined', ({ playerId, players: ps, houseRules }) => {
      setMyPlayerId(playerId);
      setPlayers(ps);
      setRules(houseRules);
      setIsHost(ps.find(p => p.id === playerId)?.isHost ?? false);
    });
    socket.on('room:updated', ({ players: ps, houseRules }) => {
      setPlayers(ps);
      setRules(houseRules);
    });
    socket.on('game:state', () => navigate(`/game/${roomCode}`));
    socket.on('room:error', (msg) => alert(msg));
    return () => {
      socket.off('room:joined');
      socket.off('room:updated');
      socket.off('game:state');
      socket.off('room:error');
    };
  }, [navigate, roomCode]);

  function handleRulesChange(r: HouseRules) {
    setRules(r);
    socket.emit('room:update-rules', r);
  }

  function handleAddBot(seat: number, difficulty: BotDifficulty) {
    socket.emit('room:add-bot', { difficulty, name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Bot` });
  }

  function handleRemoveBot(seat: number) {
    socket.emit('room:remove-bot', { seat });
  }

  function handleStart() {
    socket.emit('room:start');
  }

  const seatPlayers: (LobbyPlayerInfo | null)[] = [null, null, null, null];
  players.forEach(p => { seatPlayers[p.seat] = p; });

  return (
    <div className="min-h-screen bg-[#1a472a] text-[#f5e6c8] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#ffd700]">Lobby</h1>
          <p className="text-sm text-[#f5e6c8]/50 mt-0.5">
            Room code: <span className="font-mono text-[#ffd700] tracking-widest">{roomCode}</span>
          </p>
        </div>
        {isHost && (
          <button onClick={handleStart}
            className="px-8 py-3 bg-[#ffd700] text-[#1a472a] font-bold rounded-lg text-lg hover:bg-yellow-400 transition">
            Start Game
          </button>
        )}
      </div>

      <div className="flex gap-6 flex-1">
        {/* Player slots */}
        <div className="w-72 space-y-3">
          <h2 className="text-sm font-semibold text-[#f5e6c8]/60 uppercase tracking-wider mb-2">Players</h2>
          {seatPlayers.map((p, seat) => (
            <PlayerSlot key={seat} seat={seat} player={p} isHost={isHost}
              onAddBot={d => handleAddBot(seat, d)}
              onRemoveBot={() => handleRemoveBot(seat)} />
          ))}
        </div>

        {/* House rules / Tai table */}
        {rules && (
          <div className="flex-1 bg-green-900/40 rounded-xl p-5 border border-[#f5e6c8]/10">
            <div className="flex gap-4 mb-4 border-b border-[#f5e6c8]/10 pb-3">
              {(['rules', 'tai'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`text-sm font-medium pb-1 transition border-b-2 ${tab === t ? 'text-[#ffd700] border-[#ffd700]' : 'text-[#f5e6c8]/50 border-transparent hover:text-[#f5e6c8]'}`}>
                  {t === 'rules' ? 'House Rules' : 'Tai Table'}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-260px)]">
              {tab === 'rules' ? (
                <HouseRulesForm rules={rules} onChange={handleRulesChange} readonly={!isHost} />
              ) : (
                <TaiTableEditor taiTable={rules.taiTable} onChange={t => handleRulesChange({ ...rules, taiTable: t })} readonly={!isHost} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
