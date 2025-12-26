
import React, { useRef, useEffect, useState } from 'react';

interface BackgroundVideoProps {
  progress: number;
  forcePlay: boolean;
}

/**
 * Elysium Cinematic Engine
 * Using the user's hosted Cloudinary asset for high-performance streaming.
 * Optimized visibility: Increased starting brightness and reduced initial overlay darkness.
 */
const VIDEO_URL = "https://res.cloudinary.com/dwaxu2mtc/video/upload/v1766720484/video-output-F09827CE-6623-495E-80E0-E23F00F45E58-1_jnhj4n.mp4";

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ progress, forcePlay }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (forcePlay && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Elysium: Video stream initialization deferred.", err);
        });
      }
    }
  }, [forcePlay]);

  // Visual filters driven by game progress (0 to 1)
  // Adjusted for higher initial visibility as requested.
  const blurValue = 6 * Math.pow(1 - progress, 2); // Reduced from 12 to 6 for clearer start
  const grayscaleValue = 70 * Math.pow(1 - progress, 1.5); // Reduced from 100 to 70 for some color at start
  const saturateValue = 0.7 + (progress * 1.1); // Starts at 0.7 (more color) instead of 0.5
  const brightnessValue = 0.65 + (progress * 0.55); // Starts at 0.65 instead of 0.4 for clarity

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-[2000ms] ease-out bg-black">
      {!hasError ? (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onError={() => {
            console.error("Elysium: Stream error detected.");
            setHasError(true);
          }}
          poster="https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          className="w-full h-full object-cover scale-105"
          style={{
            filter: `blur(${blurValue}px) grayscale(${grayscaleValue}%) saturate(${saturateValue}) brightness(${brightnessValue})`,
            transition: 'filter 2s ease-out'
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      ) : (
        <div 
          className="w-full h-full bg-cover bg-center scale-105"
          style={{ 
            backgroundImage: `url('https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
            filter: `blur(${blurValue}px) grayscale(${grayscaleValue}%) saturate(${saturateValue}) brightness(${brightnessValue})`
          }}
        />
      )}
      
      {/* Narrative Overlays: Adjusted starting opacity to 0.5 (50%) for better visibility */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-[2000ms]" 
        style={{ opacity: 0.5 - (progress * 0.4) }} 
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
      
      {/* Scanline / Grain Overlay for texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Static_Noise_Graphic.png')]"></div>
    </div>
  );
};

export default BackgroundVideo;
