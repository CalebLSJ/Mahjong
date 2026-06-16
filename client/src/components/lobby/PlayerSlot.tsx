import React from 'react';
import { LobbyPlayerInfo, BotDifficulty } from '@mahjong/shared';

const SEAT_NAMES = ['South', 'East', 'North', 'West'];
const SEAT_WINDS = ['南', '東', '北', '西'];

interface Props {
  seat: number;
  player: LobbyPlayerInfo | null;
  isHost: boolean;
  onAddBot: (difficulty: BotDifficulty) => void;
  onRemoveBot: () => void;
}

export default function PlayerSlot({ seat, player, isHost, onAddBot, onRemoveBot }: Props) {
  return (
    <div className="flex items-center gap-3 bg-green-900 rounded-lg p-3 border border-[#f5e6c8]/20">
      <div className="w-10 h-10 rounded-full bg-[#ffd700]/20 flex items-center justify-center text-[#ffd700] font-bold text-lg">
        {SEAT_WINDS[seat]}
      </div>
      <div className="flex-1">
        <div className="text-xs text-[#f5e6c8]/50 uppercase">{SEAT_NAMES[seat]}</div>
        {player ? (
          <div className="flex items-center gap-2">
            <span className="text-[#f5e6c8] font-medium">{player.name}</span>
            {player.isBot && <span className="text-xs text-[#f5e6c8]/40 bg-[#1a472a] px-1 rounded capitalize">{player.botDifficulty}</span>}
            {player.isHost && <span className="text-xs text-[#ffd700]">Host</span>}
            {isHost && player.isBot && (
              <button onClick={onRemoveBot} className="text-xs text-red-400 hover:text-red-300 ml-auto">Remove</button>
            )}
          </div>
        ) : isHost ? (
          <div className="flex gap-2 mt-1">
            {(['easy', 'medium', 'hard'] as BotDifficulty[]).map(d => (
              <button key={d} onClick={() => onAddBot(d)}
                className="text-xs px-2 py-0.5 border border-[#f5e6c8]/30 rounded text-[#f5e6c8]/60 hover:border-[#ffd700] hover:text-[#ffd700] transition capitalize">
                + {d} bot
              </button>
            ))}
          </div>
        ) : <span className="text-[#f5e6c8]/40 text-sm">Empty</span>}
      </div>
    </div>
  );
}
