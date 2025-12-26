
import React, { useState } from 'react';

interface MuseumSchedulerProps {
  museumName: string;
  onSelect: (date: Date) => void;
  onCancel: () => void;
  selectedDate?: string;
}

const MuseumScheduler: React.FC<MuseumSchedulerProps> = ({ museumName, onSelect, onCancel, selectedDate }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();
  
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate);
    return d.getDate() === day && d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
  };

  const isPast = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500 backdrop-blur-md bg-black/40">
      <div className="w-full max-w-sm glass rounded-[40px] p-8 border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h3 className="text-[9px] uppercase tracking-[0.6em] text-white/30 mb-2 font-light">Schedule Entry</h3>
          <p className="text-xl font-serif text-white">{museumName}</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button onClick={handlePrevMonth} className="p-2 text-white/40 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-white/80">{monthName} {year}</span>
          <button onClick={handleNextMonth} className="p-2 text-white/40 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <span key={d} className="text-[8px] text-white/20 font-bold">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-10">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const past = isPast(day);
            const active = isSelected(day);
            return (
              <button
                key={day}
                disabled={past}
                onClick={() => onSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
                className={`aspect-square flex items-center justify-center rounded-full text-[11px] transition-all duration-300 ${
                  active 
                    ? 'bg-white text-black font-bold scale-110' 
                    : past 
                    ? 'text-white/5 cursor-not-allowed' 
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onCancel}
            className="text-[8px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all py-2"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default MuseumScheduler;
