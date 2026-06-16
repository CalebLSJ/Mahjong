import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TileGuide from '../components/tutorial/TileGuide';
import RulesWalkthrough from '../components/tutorial/RulesWalkthrough';
import HandGallery from '../components/tutorial/HandGallery';
import ScoringCalculator from '../components/tutorial/ScoringCalculator';
import QuickReference from '../components/tutorial/QuickReference';

type Tab = 'tiles' | 'rules' | 'hands' | 'calculator' | 'reference';

const TABS: { id: Tab; label: string }[] = [
  { id: 'tiles', label: 'Tile Guide' },
  { id: 'rules', label: 'How to Play' },
  { id: 'hands', label: 'Winning Hands' },
  { id: 'calculator', label: 'Scoring' },
  { id: 'reference', label: 'Quick Reference' },
];

export default function TutorialPage() {
  const [tab, setTab] = useState<Tab>('tiles');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a472a] text-[#f5e6c8] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/')} className="text-[#f5e6c8]/40 hover:text-[#f5e6c8] transition">← Back</button>
          <h1 className="text-2xl font-bold text-[#ffd700]">How to Play Mahjong</h1>
        </div>
        <div className="flex gap-1 mb-6 bg-[#15391f] rounded-lg p-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${tab === t.id ? 'bg-[#ffd700] text-[#1a472a]' : 'text-[#f5e6c8]/60 hover:text-[#f5e6c8]'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto">
          {tab === 'tiles' && <TileGuide />}
          {tab === 'rules' && <RulesWalkthrough />}
          {tab === 'hands' && <HandGallery />}
          {tab === 'calculator' && <ScoringCalculator />}
          {tab === 'reference' && <QuickReference />}
        </div>
      </div>
    </div>
  );
}
