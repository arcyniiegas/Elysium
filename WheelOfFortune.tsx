
import React, { useState, useEffect, useRef } from 'react';
import { Haptics } from '../utils/haptics';

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

  // iPhone 16 Pro Optimized Ease Out for 120Hz
  const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

  const startSpinAnimation = (targetRotation: number) => {
    const startRotation = rotationRef.current;
    const distance = targetRotation - startRotation;
    const duration = 9000; // Slightly faster for snappier feel
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutQuint(progress);
      const currentRotation = startRotation + (distance * easedProgress);
      
      setVisualRotation(currentRotation);
      rotationRef.current = currentRotation;

      // Haptic tick logic
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

    const relicIndices = [0, 2, 4, 6, 8];
    const echoIndices = [1, 3, 5, 7, 9];
    
    const targetSegmentIndex = forceWinType === 'relic'
      ? relicIndices[Math.floor(Math.random() * relicIndices.length)] 
      : echoIndices[Math.floor(Math.random() * echoIndices.length)];
    
    const extraFullTurns = 10 + Math.floor(Math.random() * 4);
    const landingAngle = (targetSegmentIndex * 36) + 18;
    
    const currentBaseRotation = Math.floor(rotationRef.current / 360) * 360;
    const targetRotation = currentBaseRotation + (extraFullTurns * 360) + landingAngle;
    
    startSpinAnimation(targetRotation);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center relative">
      <div className={`fixed inset-0 z-40 pointer-events-none transition-opacity duration-[3000ms] ${isSpinning ? 'opacity-100' : 'opacity-0'}`}
           style={{ background: 'radial-gradient(circle, transparent 10%, rgba(0,0,0,0.95) 100%)' }}></div>

      <div className={`relative w-64 h-64 md:w-[420px] md:h-[420px] mb-10 z-50 transition-all duration-[2000ms] ${isSpinning ? 'scale-105' : 'scale-100'}`}>
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[10%] z-[100] transition-transform duration-75 ease-out"
          style={{ transform: `translateX(-50%) rotate(${isFlicking ? '-15deg' : '0deg'})`, transformOrigin: '50% 0%' }}
        >
          <svg width="24" height="44" viewBox="0 0 24 48" fill="none">
            <path d="M12 48L24 10C24 10 18 0 12 0C6 0 0 10 0 10L12 48Z" fill="white" fillOpacity="0.95" />
          </svg>
        </div>

        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full will-change-transform drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
          style={{ transform: `rotate(${-visualRotation}deg)` }}
        >
          <circle cx="50" cy="50" r="49" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="0.1" />
          {[...Array(10)].map((_, i) => {
            const angleStep = 36;
            const startAngle = (i * angleStep) - 90;
            const endAngle = ((i + 1) * angleStep) - 90;
            const x1 = 50 + 47 * Math.cos(startAngle * Math.PI / 180);
            const y1 = 50 + 47 * Math.sin(startAngle * Math.PI / 180);
            const x2 = 50 + 47 * Math.cos(endAngle * Math.PI / 180);
            const y2 = 50 + 47 * Math.sin(endAngle * Math.PI / 180);
            const isRelic = i % 2 === 0;
            return (
              <g key={i}>
                <path 
                  d={`M 50 50 L ${x1} ${y1} A 47 47 0 0 1 ${x2} ${y2} Z`} 
                  fill={isRelic ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)"} 
                />
                <line x1="50" y1="50" x2={x1} y2={y1} stroke="rgba(255,255,255,0.2)" strokeWidth="0.1" />
                <text 
                  x="50" 
                  y="15" 
                  transform={`rotate(${(i * 36) + 18}, 50, 50)`} 
                  fill={isRelic ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)"} 
                  fontSize="2.8" 
                  textAnchor="middle" 
                  className="uppercase tracking-[0.45em] font-serif select-none font-medium"
                >
                  {isRelic ? "Relic" : "Echo"}
                </text>
              </g>
            );
          })}
          <circle cx="50" cy="50" r="4" fill="#000" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        </svg>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || !canSpin}
        className={`relative z-50 px-12 py-4 glass rounded-full text-[9px] uppercase tracking-[0.6em] text-white/90 hover:text-white transition-all duration-1000 border border-white/20 active:scale-95 shadow-2xl ${
          isSpinning || !canSpin ? 'opacity-20 cursor-not-allowed' : 'opacity-100'
        }`}
      >
        <span className="relative z-10">{isSpinning ? 'Consulting the Spirits' : 'Test Your Fortune'}</span>
      </button>
    </div>
  );
};

export default WheelOfFortune;
