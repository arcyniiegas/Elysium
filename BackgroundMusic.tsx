
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface BackgroundMusicProps {
  progress: number;
  shouldPlay: boolean;
  isDucked: boolean;
}

export interface BackgroundMusicRef {
  unlock: () => void;
}

const SONG_URL = "https://cdn.pixabay.com/audio/2022/03/24/audio_7306236b2d.mp3";

const BackgroundMusic = forwardRef<BackgroundMusicRef, BackgroundMusicProps>(({ progress, shouldPlay, isDucked }, ref) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initAudio = () => {
    if (audioCtxRef.current || !audioRef.current) return;

    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaElementSource(audioRef.current);
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime); 

      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      audioCtxRef.current = audioCtx;
      filterRef.current = filter;
      gainRef.current = gain;
      sourceRef.current = source;
    } catch (e) {
      console.warn("Audio Engine: Failed to initialize graph.", e);
    }
  };

  useImperativeHandle(ref, () => ({
    unlock: () => {
      initAudio();
      const ctx = audioCtxRef.current;
      const audio = audioRef.current;
      
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      
      if (audio) {
        // Essential iOS "Blessing": MUST call play within user-initiated stack
        audio.play()
          .then(() => {
            if (!shouldPlay) {
              audio.pause();
            }
          })
          .catch(e => {
            console.warn("BackgroundMusic: Initial play failed on mobile", e);
          });
      }
    }
  }));

  useEffect(() => {
    const audio = audioRef.current;
    const ctx = audioCtxRef.current;
    
    if (shouldPlay && audio) {
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          audio.play().catch(e => console.warn("BackgroundMusic: Deferred play failed", e));
        });
      } else {
        audio.play().catch(e => console.warn("BackgroundMusic: Direct play failed", e));
      }
    } else if (!shouldPlay && audio) {
      audio.pause();
    }
  }, [shouldPlay]);

  useEffect(() => {
    if (!gainRef.current || !filterRef.current || !audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    
    if (isDucked) {
      gainRef.current.gain.setTargetAtTime(0.05, now, 0.4);
      filterRef.current.frequency.setTargetAtTime(200, now, 0.4);
    } else {
      const targetGain = shouldPlay ? 0.35 : 0;
      const targetFreq = 400 + (Math.pow(progress, 2) * 12000);
      gainRef.current.gain.setTargetAtTime(targetGain, now, 2.0);
      filterRef.current.frequency.setTargetAtTime(targetFreq, now, 1.5);
    }
  }, [isDucked, progress, shouldPlay]);

  return (
    <audio 
      ref={audioRef} 
      src={SONG_URL} 
      loop 
      preload="auto"
      crossOrigin="anonymous"
      className="hidden" 
    />
  );
});

export default BackgroundMusic;
