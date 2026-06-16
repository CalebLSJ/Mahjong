import React from 'react';

interface Props { title: string; onClose: () => void; children: React.ReactNode; }

export default function Modal({ title, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#15391f] border border-[#f5e6c8]/20 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[#f5e6c8] font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-[#f5e6c8]/40 hover:text-[#f5e6c8] text-2xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
