
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Haptics } from '../haptics';
import { GoogleGenAI, Modality } from "@google/genai";
import { EXTERNAL_VOICE_URLS } from '../constants';

interface VoiceEchoScreenProps {
  id: number;
  text: string;
  existingAudio?: string;
  debugMode?: boolean;
  onHoldingChange: (holding: boolean) => void;
  onSaveAudio: (base64: string) => void;
  onClose: () => void;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeRawPCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceEchoScreen: React.FC<VoiceEchoScreenProps> = ({ 
  id, text, existingAudio, debugMode, onHoldingChange, onSaveAudio, onClose 
}) => {
  const [visibleWordsCount, setVisibleWordsCount] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const [generatedVoiceBuffer, setGeneratedVoiceBuffer] = useState<AudioBuffer | null>(null);
  
  const revealInterval = useRef<any>(null);
  const heartbeatInterval = useRef<any>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const playbackNode = useRef<AudioBufferSourceNode | null>(null);

  const words = useMemo(() => text.split(' '), [text]);
  const isFinished = visibleWordsCount >= words.length;

  const getAudioCtx = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx.current;
  };

  const preFetchVoice = async () => {
    const externalUrl = EXTERNAL_VOICE_URLS[id];
    const sourceUrl = existingAudio || externalUrl;

    if (sourceUrl) {
      try {
        const ctx = getAudioCtx();
        const response = await fetch(sourceUrl);
        if (!response.ok) throw new Error("Fetch failed");
        
        const arrayBuffer = await response.arrayBuffer();
        ctx.decodeAudioData(arrayBuffer, (buffer) => {
          setGeneratedVoiceBuffer(buffer);
        }, (err) => {
          console.error("Audio Decode Error:", err);
        });
        return;
      } catch (e) {
        console.warn("Elysium: Direct audio stream failed. Falling back to AI Synthesis.", e);
      }
    }

    setIsLoadingVoice(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Perskaityk šį tekstą giliu, ramiu, romantišku ir paslaptingu vyrišku balsu: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const ctx = getAudioCtx();
        const rawBytes = decodeBase64(base64Audio);
        const buffer = await decodeRawPCM(rawBytes, ctx, 24000, 1);
        setGeneratedVoiceBuffer(buffer);
      }
    } catch (err) {
      console.error("Elysium: Synthesis error:", err);
    } finally {
      setIsLoadingVoice(false);
    }
  };

  useEffect(() => {
    preFetchVoice();
  }, [id, text, existingAudio]);

  const playVoice = async () => {
    if (!generatedVoiceBuffer) return;
    const ctx = getAudioCtx();
    
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    stopVoice();

    const source = ctx.createBufferSource();
    source.buffer = generatedVoiceBuffer;
    
    const gain = ctx.createGain();
    gain.gain.value = 4.0; 

    source.connect(gain);
    gain.connect(ctx.destination);
    
    source.start(0);
    playbackNode.current = source;
  };

  const stopVoice = () => {
    if (playbackNode.current) {
      try { playbackNode.current.stop(); } catch(e) {}
      playbackNode.current = null;
    }
  };

  const handleHoldStart = async () => {
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
      if (!isFinished) {
        revealInterval.current = setInterval(() => {
          setVisibleWordsCount(prev => Math.min(prev + 1, words.length));
        }, 220);
      }
      playVoice();
      
      heartbeatInterval.current = setInterval(() => {
        Haptics.impactHeavy();
        setPulseScale(1.05);
        setTimeout(() => setPulseScale(1), 100);
      }, 1200);
    } else {
      clearInterval(revealInterval.current);
      clearInterval(heartbeatInterval.current);
      stopVoice();
    }
    return () => {
      clearInterval(revealInterval.current);
      clearInterval(heartbeatInterval.current);
      stopVoice();
    };
  }, [isHolding, generatedVoiceBuffer]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000 overflow-hidden bg-black/95">
      <div 
        className="fixed inset-0 z-[101] cursor-pointer touch-none"
        onMouseDown={handleHoldStart}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onTouchStart={(e) => { e.preventDefault(); handleHoldStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); setIsHolding(false); }}
      />

      <div className="relative z-[102] w-full max-w-sm pointer-events-none transition-transform duration-100" style={{ transform: `scale(${isHolding ? pulseScale : 1})` }}>
        <h4 className="text-[8px] uppercase tracking-[1em] text-white/20 mb-16 block">
          {isLoadingVoice ? "Deciphering Resonance..." : generatedVoiceBuffer ? "Sync Ready" : "Initializing Link..."}
        </h4>
        
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-3 px-4 min-h-[140px] items-center">
          {words.map((word, idx) => (
            <span
              key={idx}
              className={`text-xl md:text-3xl font-serif transition-all duration-1000 ease-out ${
                idx < visibleWordsCount 
                  ? 'text-white blur-0 opacity-100' 
                  : 'text-white/0 blur-[12px] opacity-0 translate-y-4'
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto relative z-[102] flex flex-col items-center gap-12 pointer-events-none pb-12">
        <div className="relative">
          {isHolding && (
            <div className="absolute inset-[-80px] flex items-center justify-center">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute rounded-full border border-white/10 animate-[ping_3s_linear_infinite]" 
                  style={{ width: '100%', height: '100%', animationDelay: `${i * 1}s` }}
                ></div>
              ))}
            </div>
          )}
          
          <div className={`w-28 h-28 rounded-full border border-white/10 flex items-center justify-center transition-all duration-700 bg-white/[0.01] ${isHolding ? 'scale-110 border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.05)]' : ''}`}>
             <div className={`w-3 h-3 rounded-full bg-white transition-all duration-1000 ${isHolding ? 'scale-125 shadow-[0_0_25px_white]' : 'opacity-10 scale-50'}`}></div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
           <p className={`text-[8px] uppercase tracking-[0.5em] text-white/30 font-light transition-opacity duration-700 ${isHolding ? 'opacity-100' : 'opacity-40'}`}>
            {isLoadingVoice ? "Syncing..." : isHolding ? "Fragment Deciphering" : "Hold pulse to hear resonance"}
          </p>

          <button 
            onClick={(e) => { e.stopPropagation(); Haptics.selection(); onClose(); }}
            className={`pointer-events-auto px-12 py-4 glass rounded-full text-[9px] uppercase tracking-[0.6em] transition-all duration-1000 border-white/10 ${
              isFinished ? 'text-white opacity-100 translate-y-0 shadow-2xl' : 'text-white/0 opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceEchoScreen;
