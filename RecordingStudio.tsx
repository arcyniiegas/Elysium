
import React, { useState, useRef } from 'react';
import { REASONS_WHY_I_LOVE_YOU } from '../constants';
import { Haptics } from '../utils/haptics';

interface RecordingStudioProps {
  recordings: Record<number, string>;
  onSave: (id: number, base64: string) => void;
  onBack: () => void;
}

const RecordingStudio: React.FC<RecordingStudioProps> = ({ recordings, onSave, onBack }) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const startRecording = async (id: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      recordedChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          onSave(id, reader.result as string);
        };
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setActiveId(id);
      Haptics.impactHeavy();
    } catch (err) {
      alert("Microphone access is required for recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      Haptics.notificationSuccess();
    }
  };

  const downloadAudio = (base64: string, id: number) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `elysium_reason_${id}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Haptics.selection();
  };

  const previewAudio = async (base64: string) => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtx.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const response = await fetch(base64);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.value = 1.4;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    source.start(0);
    Haptics.selection();
  };

  return (
    <div className="fixed inset-0 z-[400] bg-[#050505] flex flex-col pt-safe animate-in fade-in slide-in-from-bottom duration-700">
      <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-xl">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.8em] text-white/40 font-bold mb-1">Curator Studio</h2>
          <p className="text-[8px] text-white/20 uppercase tracking-widest font-mono">
            Recorded: {Object.keys(recordings).length}/20
          </p>
        </div>
        <button onClick={onBack} className="px-5 py-2 glass rounded-full text-[8px] uppercase tracking-widest text-white/60">
          Close Lab
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-6 pb-32">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl mb-8">
           <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 leading-relaxed">
             <span className="text-white/60 font-bold">Safe Storage Strategy:</span> Download your recordings as files and upload them to GitHub. Then, put the "Raw" link in your code for 100% permanent hosting.
           </p>
        </div>

        {REASONS_WHY_I_LOVE_YOU.map((text, id) => {
          const hasRecording = !!recordings[id];
          const isThisActive = activeId === id && isRecording;

          return (
            <div 
              key={id} 
              className={`p-6 rounded-[32px] border transition-all duration-500 ${
                isThisActive ? 'bg-red-500/5 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 
                hasRecording ? 'bg-white/[0.03] border-white/10' : 
                'bg-white/[0.05] border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Fragment_{id + 1}</span>
                <div className="flex gap-2">
                  {hasRecording && (
                    <button 
                      onClick={() => downloadAudio(recordings[id], id)}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      <span className="text-[7px] uppercase tracking-widest">Download File</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    </button>
                  )}
                  <div className={`px-2 py-1 rounded-md text-[6px] uppercase tracking-widest font-bold ${hasRecording ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                    {hasRecording ? 'Verified' : 'Missing'}
                  </div>
                </div>
              </div>

              <p className="text-sm font-serif italic text-white/80 leading-relaxed mb-8">"{text}"</p>

              <div className="flex items-center gap-4">
                <button
                  onMouseDown={() => startRecording(id)}
                  onMouseUp={stopRecording}
                  onTouchStart={(e) => { e.preventDefault(); startRecording(id); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                  className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${
                    isThisActive ? 'bg-red-500 scale-95' : 'bg-white text-black font-bold'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isThisActive ? 'bg-white animate-pulse' : 'bg-red-600'}`}></div>
                  <span className="text-[9px] uppercase tracking-widest">{isThisActive ? 'Recording...' : 'Hold to Record'}</span>
                </button>

                {hasRecording && (
                  <button 
                    onClick={() => previewAudio(recordings[id])}
                    className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <footer className="p-8 text-center bg-black/50 border-t border-white/5">
        <p className="text-[7px] text-white/10 uppercase tracking-[1em]">Forensic Audio Processing Engine</p>
      </footer>
    </div>
  );
};

export default RecordingStudio;
