
import React, { useMemo } from 'react';
import { MUSEUMS, REASONS_WHY_I_LOVE_YOU } from '../constants';

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
    const historyCount = spinHistory.length;
    
    spinHistory.forEach((entry, idx) => {
      const dayIndex = historyCount - 1 - idx; 
      const parts = entry.split(':');
      const type = parts[0];
      const itemId = parseInt(parts[1]);

      if (type === 'WIN') {
        const museum = MUSEUMS.find(m => m.id === itemId);
        grid[dayIndex] = {
          type: 'win' as const,
          itemId,
          title: museum?.name || 'Relic',
          image: museum?.image,
          scheduled: scheduledDates[itemId],
          day: dayIndex + 1
        };
      } else {
        grid[dayIndex] = {
          type: 'reason' as const,
          itemId,
          content: REASONS_WHY_I_LOVE_YOU[itemId] || '',
          hasVoice: !!voiceRecordings[itemId],
          day: dayIndex + 1
        };
      }
    });
    
    return grid;
  }, [spinHistory, scheduledDates, voiceRecordings]);

  const stats = useMemo(() => ({
    total: spinHistory.length
  }), [spinHistory]);

  return (
    <div className="relative z-10 w-full min-h-screen bg-black flex flex-col pt-safe pb-20 overflow-x-hidden">
      <header className="sticky top-0 z-[100] bg-black/80 backdrop-blur-3xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-[7px] uppercase tracking-[0.8em] text-white/20 font-bold mb-2">System Capacity</h2>
          <div className="flex items-center gap-3">
            <span className="text-xl font-serif italic text-white/90 leading-none">
              {stats.total}<span className="text-[10px] font-sans not-italic text-white/10 mx-1.5">/</span>25
            </span>
            <div className="flex gap-[2px] items-center">
              {[...Array(25)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-[2px] h-3 rounded-full transition-all duration-1000 ${
                    i < stats.total 
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' 
                      : 'bg-white/5'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="group px-6 py-2.5 rounded-full glass border border-white/10 active:scale-95 transition-all"
        >
          <span className="text-[8px] uppercase tracking-[0.4em] text-white/50 group-hover:text-white">
            Return
          </span>
        </button>
      </header>

      <div className="px-5 py-8 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {vaultGrid.map((item, idx) => {
            const isLocked = !item;
            const isRelic = item?.type === 'win';
            
            return (
              <div 
                key={idx}
                onClick={() => !isLocked && onItemClick(item.type, item.itemId)}
                className={`relative group rounded-[32px] overflow-hidden transition-all duration-700 cursor-pointer 
                  ${isLocked ? 'aspect-square bg-white/[0.01] border border-white/5 pointer-events-none' : 
                    isRelic ? 'col-span-2 aspect-[16/9] bg-white/5 border border-white/10' : 
                    'aspect-square bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06]'}
                `}
              >
                {isLocked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                    <span className="text-[6px] font-mono tracking-widest mb-2">SEC_{idx + 1}</span>
                    <div className="w-4 h-px bg-white"></div>
                  </div>
                ) : isRelic ? (
                  <div className="absolute inset-0 flex flex-col">
                    <img 
                      src={item.image} 
                      className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-1000" 
                      alt={item.title}
                    />
                    <div className="relative mt-auto p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <span className="text-[6px] uppercase tracking-[0.6em] text-white/30 block mb-1.5">Relic Detected</span>
                      <h3 className="text-base font-serif text-white/90">{item.title}</h3>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[6px] uppercase tracking-[0.4em] text-white/20 font-mono">ECHO_{idx + 1}</span>
                      {item.hasVoice && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_5px_white]"></div>
                      )}
                    </div>
                    <p className="text-[10px] font-serif text-white/50 line-clamp-4 italic leading-relaxed group-hover:text-white/80 transition-colors">
                      "{item.content}"
                    </p>
                    <div className="mt-auto pt-3 flex justify-between items-center opacity-30">
                      <span className="text-[5px] uppercase tracking-widest font-mono">Verified Resonance</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-20 px-6 py-12 border-t border-white/5 text-center opacity-20">
        <p className="text-[7px] uppercase tracking-[1.2em] text-white font-light mb-2">
          Elysium Engine Finalized
        </p>
        <p className="text-[5px] uppercase tracking-widest font-mono">Archive Integrity: 100%</p>
      </footer>
    </div>
  );
};

export default CollectionBoard;
