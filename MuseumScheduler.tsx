
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
  today.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate);
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
  };

  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    return d < today;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-sm glass rounded-[40px] p-8 border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        
        <header className="text-center mb-8">
          <h3 className="text-[8px] uppercase tracking-[0.8em] text-white/30 mb-2 font-light">Secure Reservation</h3>
          <p className="text-2xl font-serif italic text-white/90">{museumName}</p>
        </header>

        <div className="flex items-center justify-between mb-8 px-2">
          <button 
            onClick={handlePrevMonth} 
            className="p-2 text-white/40 hover:text-white transition-colors active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-white/80">{monthName} {year}</span>
          <button 
            onClick={handleNextMonth} 
            className="p-2 text-white/40 hover:text-white transition-colors active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <span key={d} className="text-[8px] text-white/20 font-bold text-center">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-10">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const past = isPast(day);
            const active = isSelected(day);
            return (
              <button
                key={day}
                disabled={past}
                onClick={() => onSelect(new Date(year, month, day))}
                className={`aspect-square flex items-center justify-center rounded-full text-[11px] transition-all duration-300 ${
                  active 
                    ? 'bg-white text-black font-bold scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                    : past 
                    ? 'text-white/5 cursor-not-allowed' 
                    : 'text-white/60 hover:bg-white/10 hover:text-white active:scale-90'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={onCancel}
            className="text-[9px] uppercase tracking-[0.5em] text-white/20 hover:text-white transition-all py-3 active:scale-95"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default MuseumScheduler;
