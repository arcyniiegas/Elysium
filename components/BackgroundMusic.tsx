
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface BackgroundMusicProps {
  progress: number;
  shouldPlay: boolean;
  isDucked: boolean;
}

export interface BackgroundMusicRef {
  unlock: () => void;
}

// Deep atmospheric noir track (Direct Link)
const SONG_URL = "https://cdn.pixabay.com/audio/2022/03/24/audio_7306236b2d.mp3";

const BackgroundMusic = forwardRef<BackgroundMusicRef, BackgroundMusicProps>(({ progress, shouldPlay, isDucked }, ref) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (audioCtxRef.current || !audioRef.current) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audioRef.current);
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime); // Start silent

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    audioCtxRef.current = audioCtx;
    filterRef.current = filter;
    gainRef.current = gain;
  };

  useImperativeHandle(ref, () => ({
    unlock: () => {
      initAudio();
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current?.play().catch(console.error);
    }
  }));

  useEffect(() => {
    if (shouldPlay) {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current?.play().catch(console.log);
    }
  }, [shouldPlay]);

  useEffect(() => {
    if (!gainRef.current || !filterRef.current || !audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    
    if (isDucked) {
      gainRef.current.gain.setTargetAtTime(0.08, now, 0.4);
      filterRef.current.frequency.setTargetAtTime(250, now, 0.4);
    } else {
      const targetGain = shouldPlay ? 0.35 : 0;
      const targetFreq = 400 + (Math.pow(progress, 2) * 15000);
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
