import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export default function ClaimTimer() {
  const claimWindowEndsAt = useGameStore(s => s.view?.claimWindowEndsAt);
  const [pct, setPct] = useState(100);

  useEffect(() => {
    if (!claimWindowEndsAt) { setPct(100); return; }
    const tick = () => setPct(Math.max(0, ((claimWindowEndsAt - Date.now()) / 5000) * 100));
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [claimWindowEndsAt]);

  if (!claimWindowEndsAt) return null;

  const color = pct > 60 ? '#ffd700' : pct > 30 ? '#ff9800' : '#f44336';
  return (
    <div className="w-full max-w-md h-1.5 bg-[#15391f] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-100" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}
