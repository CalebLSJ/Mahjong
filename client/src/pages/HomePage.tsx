import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { buildDefaultHouseRules } from '@mahjong/shared';

export default function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [error, setError] = useState('');

  React.useEffect(() => {
    socket.connect();
    socket.on('room:created', ({ roomCode }) => navigate(`/lobby/${roomCode}`));
    socket.on('room:joined', ({ roomCode }) => navigate(`/lobby/${roomCode}`));
    socket.on('room:error', setError);
    return () => {
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('room:error');
    };
  }, [navigate]);

  function handleCreate() {
    if (!name.trim()) { setError('Enter your name'); return; }
    socket.emit('room:create', { playerName: name.trim(), houseRules: buildDefaultHouseRules('sg') });
  }

  function handleJoin() {
    if (!name.trim() || !joinCode.trim()) { setError('Enter name and room code'); return; }
    socket.emit('room:join', { roomCode: joinCode.trim().toUpperCase(), playerName: name.trim() });
  }

  const inputClass = 'bg-green-900 border border-yellow-100/30 text-yellow-100 rounded px-4 py-2 focus:outline-none focus:border-yellow-400';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a472a] text-[#f5e6c8] p-8">
      <h1 className="text-5xl font-bold text-[#ffd700] mb-2 tracking-wide">麻将</h1>
      <p className="text-xl text-[#f5e6c8]/70 mb-12">Mahjong</p>

      {mode === 'home' && (
        <div className="flex flex-col gap-4 w-64">
          <button onClick={() => setMode('create')}
            className="bg-[#ffd700] text-[#1a472a] font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-400 transition">
            Create Room
          </button>
          <button onClick={() => setMode('join')}
            className="border-2 border-[#ffd700] text-[#ffd700] font-bold py-3 px-6 rounded-lg text-lg hover:bg-[#ffd700]/10 transition">
            Join Room
          </button>
          <button onClick={() => navigate('/tutorial')} className="text-[#f5e6c8]/60 hover:text-[#f5e6c8] transition text-sm mt-4">
            How to Play →
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="flex flex-col gap-3 w-72">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputClass} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={handleCreate} className="bg-[#ffd700] text-[#1a472a] font-bold py-2 px-4 rounded hover:bg-yellow-400">
            Create Game
          </button>
          <button onClick={() => setMode('home')} className="text-[#f5e6c8]/50 text-sm hover:text-[#f5e6c8]">← Back</button>
        </div>
      )}

      {mode === 'join' && (
        <div className="flex flex-col gap-3 w-72">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputClass} />
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Room code (e.g. AB3X7Q)"
            className={inputClass + ' uppercase tracking-widest'} maxLength={6} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={handleJoin} className="bg-[#ffd700] text-[#1a472a] font-bold py-2 px-4 rounded hover:bg-yellow-400">
            Join Game
          </button>
          <button onClick={() => setMode('home')} className="text-[#f5e6c8]/50 text-sm hover:text-[#f5e6c8]">← Back</button>
        </div>
      )}
    </div>
  );
}
