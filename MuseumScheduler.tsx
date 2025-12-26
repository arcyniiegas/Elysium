
import React, { useState } from 'react';

interface MuseumSchedulerProps {
  museumName: string;
  onSelect: (date: Date) => void;
  onCancel: () => void;
  selectedDate?: string;
}

const MuseumScheduler: React.FC<MuseumSchedulerProps> = ({ museumName, onSelect, onCancel }) => {
  const [viewDate, setViewDate] = useState(new Date());
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="glass rounded-[40px] p-8 text-center">
        <p className="text-xl font-serif mb-8">{museumName}</p>
        <div className="flex flex-col gap-4">
          <button onClick={() => onSelect(new Date())} className="bg-white text-black py-4 rounded-full text-[10px] uppercase font-bold tracking-widest">Select Today</button>
          <button onClick={onCancel} className="text-white/30 text-[9px] uppercase tracking-widest">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MuseumScheduler;
