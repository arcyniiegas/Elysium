
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

  const initAudio = () => {
    if (audioCtxRef.current) return;
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  };

  useImperativeHandle(ref, () => ({
    unlock: () => {
      initAudio();
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audioRef.current?.play().catch(console.error);
    }
  }));

  return <audio ref={audioRef} src={SONG_URL} loop className="hidden" />;
});

export default BackgroundMusic;
