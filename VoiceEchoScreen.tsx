
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Haptics } from './haptics';
import { GoogleGenAI, Modality } from "@google/genai";
import { EXTERNAL_VOICE_URLS } from './constants';

interface VoiceEchoScreenProps {
  id: number;
  text: string;
  existingAudio?: string;
  onHoldingChange: (holding: boolean) => void;
  onSaveAudio: (base64: string) => void;
  onClose: () => void;
}

const VoiceEchoScreen: React.FC<VoiceEchoScreenProps> = ({ id, text, existingAudio, onHoldingChange, onClose }) => {
  const [visibleWordsCount, setVisibleWordsCount] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [generatedVoiceBuffer, setGeneratedVoiceBuffer] = useState<AudioBuffer | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const playbackNode = useRef<AudioBufferSourceNode | null>(null);
  const words = useMemo(() => text.split(' '), [text]);

  const getAudioCtx = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx.current;
  };

  useEffect(() => {
    const loadAudio = async () => {
      const url = existingAudio || EXTERNAL_VOICE_URLS[id];
      if (!url) return;
      try {
        const ctx = getAudioCtx();
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        ctx.decodeAudioData(arrayBuffer, (buffer) => setGeneratedVoiceBuffer(buffer));
      } catch (e) { console.warn("Echo Audio Load Error:", e); }
    };
    loadAudio();
  }, [id, existingAudio]);

  const play = async () => {
    if (!generatedVoiceBuffer) return;
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    stop();
    const source = ctx.createBufferSource();
    source.buffer = generatedVoiceBuffer;
    const gain = ctx.createGain();
    gain.gain.value = 4.0;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    playbackNode.current = source;
  };

  const stop = () => {
    if (playbackNode.current) {
      try { playbackNode.current.stop(); } catch(e) {}
      playbackNode.current = null;
    }
  };

  useEffect(() => {
    onHoldingChange(isHolding);
    if (isHolding) {
      play();
      const interval = setInterval(() => {
        setVisibleWordsCount(prev => Math.min(prev + 1, words.length));
      }, 200);
      return () => { clearInterval(interval); stop(); };
    } else { stop(); }
  }, [isHolding, generatedVoiceBuffer]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center bg-black/95">
      <div className="fixed inset-0 z-[101] touch-none" onTouchStart={() => setIsHolding(true)} onTouchEnd={() => setIsHolding(false)} onMouseDown={() => setIsHolding(true)} onMouseUp={() => setIsHolding(false)} />
      <div className="relative z-[102] w-full max-w-sm pointer-events-none">
        <h4 className="text-[8px] uppercase tracking-[1em] text-white/20 mb-16">{generatedVoiceBuffer ? "Sync Online" : "Connecting..."}</h4>
        <div className="flex flex-wrap justify-center gap-2">
          {words.map((word, i) => (
            <span key={i} className={`text-xl font-serif transition-all duration-1000 ${i < visibleWordsCount ? 'text-white opacity-100' : 'text-white/0 opacity-0 blur-md'}`}>{word}</span>
          ))}
        </div>
      </div>
      <button onClick={onClose} className="mt-auto relative z-[102] px-12 py-4 glass rounded-full text-[9px] uppercase tracking-widest text-white">Return</button>
    </div>
  );
};

export default VoiceEchoScreen;
