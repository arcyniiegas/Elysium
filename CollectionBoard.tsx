
import React, { useMemo } from 'react';
import { MUSEUMS, REASONS_WHY_I_LOVE_YOU } from './constants';

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
    <div className="relative z-10 w-full min-h-screen bg-black pt-safe">
      <header className="sticky top-0 z-[100] bg-black/80 backdrop-blur-3xl p-6 flex justify-between items-center">
        <h2 className="text-[10px] uppercase tracking-widest text-white/50">Memory Vault</h2>
        <button onClick={onBack} className="px-6 py-2 glass rounded-full text-[8px] uppercase tracking-widest text-white">Back</button>
      </header>
      <div className="p-6 grid grid-cols-2 gap-4">
        {vaultGrid.map((item, idx) => (
          <div key={idx} onClick={() => item && onItemClick(item.type, item.itemId)} className={`rounded-3xl border border-white/10 flex flex-col items-center justify-center p-4 min-h-[140px] ${!item ? 'opacity-10' : 'cursor-pointer hover:bg-white/5'}`}>
            {!item ? <span className="text-[8px] font-mono">SEC_{idx + 1}</span> : (
              item.type === 'win' ? <img src={item.image} className="w-full h-full object-cover rounded-xl" /> : 
              <p className="text-[10px] italic text-center text-white/70">"{item.content.substring(0, 40)}..."</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionBoard;
