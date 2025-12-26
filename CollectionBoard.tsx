
import React, { useMemo } from 'react';
import { MUSEUMS, REASONS_WHY_I_LOVE_YOU } from './constants';
import { Haptics } from './haptics';

interface CollectionBoardProps {
  spinHistory: string[];
  scheduledDates: Record<number, string>;
  voiceRecordings: Record<number, string>;
  onBack: () => void;
  onItemClick: (type: 'win' | 'reason', id: number) => void;
}

const CollectionBoard: React.FC<CollectionBoardProps> = ({ spinHistory, scheduledDates, voiceRecordings, onBack, onItemClick }) => {
  const vaultGrid = useMemo(() => {
    const grid = new Array(25).fill(null);
    spinHistory.forEach((entry, idx) => {
      const parts = entry.split(':');
      const type = parts[0];
      const itemId = parseInt(parts[1]);
      const day = spinHistory.length - idx;
      if (type === 'WIN') {
        const m = MUSEUMS.find( museum => museum.id === itemId);
        grid[day - 1] = { type: 'win', itemId, title: m?.name, image: m?.image };
      } else {
        grid[day - 1] = { type: 'reason', itemId, content: REASONS_WHY_I_LOVE_YOU[itemId], hasVoice: !!voiceRecordings[itemId] };
      }
    });
    return grid;
  }, [spinHistory, voiceRecordings]);

  return (
    <div className="relative z-10 w-full min-h-screen bg-black pt-safe pb-24 overflow-x-hidden">
      <header className="sticky top-0 z-[100] bg-black/90 backdrop-blur-3xl p-6 flex justify-between items-center border-b border-white/5">
        <h2 className="text-[10px] uppercase tracking-[0.8em] text-white/30 font-bold">Memory Vault</h2>
        <button onClick={onBack} className="px-6 py-2 glass rounded-full text-[8px] uppercase tracking-widest text-white active:scale-95 transition-all">Return</button>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {vaultGrid.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => item && onItemClick(item.type, item.itemId)} 
              className={`relative rounded-[32px] border border-white/5 flex flex-col items-center justify-center overflow-hidden min-h-[160px] transition-all duration-700 ${!item ? 'bg-white/[0.01] opacity-10' : 'cursor-pointer hover:bg-white/5 bg-white/[0.02]'}`}
            >
              {!item ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                  <span className="text-[7px] font-mono text-white/10 tracking-widest uppercase">Locked</span>
                </div>
              ) : (
                item.type === 'win' ? (
                  <div className="absolute inset-0 w-full h-full group">
                    <img src={item.image} className="w-full h-full object-cover grayscale brightness-[0.3] group-hover:brightness-50 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-5">
                       <span className="text-[8px] uppercase tracking-widest text-white/60 font-medium">{item.title}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center gap-4">
                    <div className={`w-1 h-1 rounded-full ${item.hasVoice ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/10'}`}></div>
                    <p className="text-[10px] italic text-center text-white/40 leading-relaxed font-serif">
                      "{item.content.substring(0, 45)}..."
                    </p>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-12 mb-8 text-center px-12">
        <p className="text-[7px] uppercase tracking-[1em] text-white/10">Archive Integrity Confirmed</p>
      </footer>
    </div>
  );
};

export default CollectionBoard;
