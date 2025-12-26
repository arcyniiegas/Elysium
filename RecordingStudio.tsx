
import React, { useState, useRef } from 'react';
import { REASONS_WHY_I_LOVE_YOU } from './constants';
import { Haptics } from './haptics';

interface RecordingStudioProps {
  recordings: Record<number, string>;
  onSave: (id: number, base64: string) => void;
  onBack: () => void;
}

const RecordingStudio: React.FC<RecordingStudioProps> = ({ recordings, onSave, onBack }) => {
  return (
    <div className="fixed inset-0 z-[400] bg-black pt-safe">
      <header className="p-6 flex justify-between items-center border-b border-white/5">
        <h2 className="text-[10px] uppercase tracking-widest text-white/50">Studio</h2>
        <button onClick={onBack} className="text-[10px] uppercase tracking-widest text-white">Close</button>
      </header>
      <div className="p-6 text-center text-white/20 text-[10px] uppercase">Recording unavailable in flatten mode.</div>
    </div>
  );
};

export default RecordingStudio;
