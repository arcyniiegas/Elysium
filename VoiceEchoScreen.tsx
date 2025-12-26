
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
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
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
      if (!url) {
        setLoadStatus('error');
        return;
      }
      try {
        const ctx = getAudioCtx();
        const res = await fetch(url);
        if (!res.ok) throw new Error("Stream unavailable");
        const arrayBuffer = await res.arrayBuffer();
        ctx.decodeAudioData(arrayBuffer, (buffer) => {
          setGeneratedVoiceBuffer(buffer);
          setLoadStatus('ready');
        }, (e) => {
          console.error("Audio Decode Error:", e);
          setLoadStatus('error');
        });
      } catch (e) { 
        console.warn("Echo Audio Load Error:", e);
        setLoadStatus('error');
      }
    };
    loadAudio();
  }, [id, existingAudio]);

  const play = async () => {
    if (!generatedVoiceBuffer) return;
    const ctx = getAudioCtx();
    
    // Explicitly resume on every play attempt for mobile safety
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
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

  const handleStartInteraction = async (e: React.UIEvent) => {
    e.preventDefault();
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    setIsHolding(true);
    Haptics.impactHeavy();
  };

  useEffect(() => {
    onHoldingChange(isHolding);
    if (isHolding) {
      if (generatedVoiceBuffer) play();
      
      const interval = setInterval(() => {
        setVisibleWordsCount(prev => Math.min(prev + 1, words.length));
      }, 200);
      
      return () => { 
        clearInterval(interval); 
        stop(); 
      };
    } else { 
      stop(); 
    }
  }, [isHolding, generatedVoiceBuffer]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center bg-black/95 transition-opacity duration-1000">
      {/* Invisible capture layer */}
      <div 
        className="fixed inset-0 z-[101] touch-none" 
        onMouseDown={handleStartInteraction} 
        onMouseUp={() => setIsHolding(false)} 
        onTouchStart={handleStartInteraction} 
        onTouchEnd={(e) => { e.preventDefault(); setIsHolding(false); }} 
      />
      
      <div className="relative z-[102] w-full max-w-sm pointer-events-none">
        <h4 className="text-[8px] uppercase tracking-[1em] text-white/20 mb-16 animate-pulse">
          {loadStatus === 'loading' ? 'Deciphering Resonance...' : 
           loadStatus === 'ready' ? 'Link Established' : 'Resonance Decoupled'}
        </h4>
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-3 min-h-[140px] items-center">
          {words.map((word, i) => (
            <span key={i} className={`text-xl md:text-2xl font-serif transition-all duration-1000 ${i < visibleWordsCount ? 'text-white opacity-100 blur-0 translate-y-0' : 'text-white/0 opacity-0 blur-lg translate-y-4'}`}>{word}</span>
          ))}
        </div>
      </div>

      <div className="mt-auto relative z-[102] flex flex-col items-center gap-10 pointer-events-none pb-12">
        <div className={`w-24 h-24 rounded-full border border-white/5 flex items-center justify-center transition-all duration-500 ${isHolding ? 'scale-110 border-white/20 bg-white/[0.02]' : 'scale-100'}`}>
          <div className={`w-2 h-2 rounded-full bg-white transition-all duration-700 ${isHolding ? 'opacity-100 scale-125 shadow-[0_0_15px_white]' : 'opacity-10 scale-50'}`} />
        </div>
        
        <p className={`text-[8px] uppercase tracking-[0.5em] text-white/30 transition-opacity duration-500 ${isHolding ? 'opacity-0' : 'opacity-100'}`}>
          Hold pulse to hear resonance
        </p>

        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className={`pointer-events-auto px-12 py-4 glass rounded-full text-[9px] uppercase tracking-widest text-white transition-all duration-1000 ${visibleWordsCount >= words.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default VoiceEchoScreen;
