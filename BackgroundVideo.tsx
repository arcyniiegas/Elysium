
import React, { useRef, useEffect, useState } from 'react';

interface BackgroundVideoProps {
  progress: number;
  forcePlay: boolean;
}

const VIDEO_URL = "https://res.cloudinary.com/dwaxu2mtc/video/upload/v1766720484/video-output-F09827CE-6623-495E-80E0-E23F00F45E58-1_jnhj4n.mp4";

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ progress, forcePlay }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (forcePlay && videoRef.current) {
      videoRef.current.play().catch(err => console.warn("Video defer:", err));
    }
  }, [forcePlay]);

  const blurValue = 6 * Math.pow(1 - progress, 2);
  const grayscaleValue = 70 * Math.pow(1 - progress, 1.5);
  const saturateValue = 0.7 + (progress * 1.1);
  const brightnessValue = 0.65 + (progress * 0.55);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      {!hasError ? (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover scale-105"
          style={{
            filter: `blur(${blurValue}px) grayscale(${grayscaleValue}%) saturate(${saturateValue}) brightness(${brightnessValue})`,
            transition: 'filter 2s ease-out'
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      ) : (
        <div className="w-full h-full bg-black" />
      )}
      <div className="absolute inset-0 bg-black transition-opacity duration-[2000ms]" style={{ opacity: 0.5 - (progress * 0.4) }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
    </div>
  );
};

export default BackgroundVideo;
