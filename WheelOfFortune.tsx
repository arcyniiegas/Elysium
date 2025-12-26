
import React, { useState, useEffect, useRef } from 'react';
import { Haptics } from './haptics';

interface WheelProps {
  onSpinComplete: () => void;
  canSpin: boolean;
  forceWinType: 'relic' | 'echo';
}

const WheelOfFortune: React.FC<WheelProps> = ({ onSpinComplete, canSpin, forceWinType }) => {
  const [visualRotation, setVisualRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFlicking, setIsFlicking] = useState(false);
  
  const rotationRef = useRef(0);
  const frameRef = useRef<number>(0);
  const lastSegmentRef = useRef<number>(-1);

  const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

  const startSpinAnimation = (targetRotation: number) => {
    const startRotation = rotationRef.current;
    const distance = targetRotation - startRotation;
    const duration = 9000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuint(progress);
      const currentRotation = startRotation + (distance * easedProgress);
      
      setVisualRotation(currentRotation);
      rotationRef.current = currentRotation;

      const currentSegment = Math.floor(currentRotation / 36);
      if (currentSegment !== lastSegmentRef.current) {
        lastSegmentRef.current = currentSegment;
        setIsFlicking(true);
        setTimeout(() => setIsFlicking(false), 25);
        Haptics.selection();
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setVisualRotation(targetRotation);
        rotationRef.current = targetRotation;
        onSpinComplete();
      }
    };
    frameRef.current = requestAnimationFrame(animate);
  };

  const spin = () => {
    if (isSpinning || !canSpin) return;
    setIsSpinning(true);
    Haptics.impactHeavy();
    const landingAngle = (forceWinType === 'relic' ? 18 : 54); // Just basic logic for example
    const targetRotation = rotationRef.current + (360 * 10) + landingAngle;
    startSpinAnimation(targetRotation);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center relative">
      <div className={`fixed inset-0 z-40 pointer-events-none transition-opacity duration-[3000ms] ${isSpinning ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'radial-gradient(circle, transparent 10%, rgba(0,0,0,0.95) 100%)' }}></div>
      <div className={`relative w-64 h-64 md:w-[420px] md:h-[420px] mb-10 z-50 transition-all duration-[2000ms] ${isSpinning ? 'scale-105' : 'scale-100'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[10%] z-[100]" style={{ transform: `translateX(-50%) rotate(${isFlicking ? '-15deg' : '0deg'})` }}>
          <svg width="24" height="44" viewBox="0 0 24 48" fill="none"><path d="M12 48L24 10C24 10 18 0 12 0C6 0 0 10 0 10L12 48Z" fill="white" /></svg>
        </div>
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: `rotate(${-visualRotation}deg)` }}>
          {[...Array(10)].map((_, i) => (
            <path key={i} d={`M 50 50 L ${50 + 47 * Math.cos((i * 36 - 90) * Math.PI / 180)} ${50 + 47 * Math.sin((i * 36 - 90) * Math.PI / 180)} A 47 47 0 0 1 ${50 + 47 * Math.cos(((i + 1) * 36 - 90) * Math.PI / 180)} ${50 + 47 * Math.sin(((i + 1) * 36 - 90) * Math.PI / 180)} Z`} fill={i % 2 === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)"} stroke="rgba(255,255,255,0.2)" strokeWidth="0.1" />
          ))}
          <circle cx="50" cy="50" r="4" fill="#000" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>
      <button onClick={spin} disabled={isSpinning || !canSpin} className="relative z-50 px-12 py-4 glass rounded-full text-[9px] uppercase tracking-[0.6em] text-white">
        {isSpinning ? 'Consulting the Spirits' : 'Test Your Fortune'}
      </button>
    </div>
  );
};

export default WheelOfFortune;
